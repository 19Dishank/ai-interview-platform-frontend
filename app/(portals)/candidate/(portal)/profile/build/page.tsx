"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import BasicInfoForm from "@/components/candidate/profile/BasicInfoForm";
import SkillsExperienceForm from "@/components/candidate/profile/SkillsExperienceForm";
import EducationForm from "@/components/candidate/profile/EducationForm";
import PreferencesForm from "@/components/candidate/profile/PreferencesForm";
import ConnectProfilesForm from "@/components/candidate/profile/ConnectProfilesForm";
import Stepper from "@/components/candidate/profile/layout/Stepper";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { candidateProfileSchema } from "@/lib/validations/profile";
import { DEFAULT_VALUES } from "@/constants/formDefaultValues";
import { CandidateProfileForm } from "@/types/profile.types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  getCandidateProfile,
  updateBasicInfo,
  updateEducation,
  updateSkills,
  updateExperience,
  updatePreferences,
  updateLinks,
  uploadFileToS3,
} from "@/services/candidate/candidate.services";
import {
  computeProfileStepIndex,
  transformCandidateProfile,
} from "@/lib/helpers/profile-transformers";

const steps = [
  { label: "Basic info", hint: "Name, photo, location" },
  { label: "Education", hint: "Institution & degree" },
  { label: "Skills & experience", hint: "Tech stack, work history & resume" },
  { label: "Preferences", hint: "Salary, notice, locations" },
  { label: "Links", hint: "GitHub, LinkedIn, portfolio" },
];

function ProfileBuilderContent() {
  const { user, refreshUser } = useAuth();
  const methods = useForm<CandidateProfileForm>({
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
    resolver: zodResolver(candidateProfileSchema),
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [step, setStep] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getCandidateProfile();
      const rawData = res?.data ?? res;
      const profileData = transformCandidateProfile(rawData) ?? rawData;
      if (profileData) {
        methods.reset(profileData);
        // Clear stale required errors for file-upload fields that already have values
        // (reset() re-runs Zod which marks them as valid, but manual errors survive reset)
        const avatarKey = (profileData as { basicInfo?: { avatarKey?: string } })?.basicInfo?.avatarKey;
        const resumeKey = (profileData as { resumeKey?: string })?.resumeKey;
        if (avatarKey) {
          methods.clearErrors("basicInfo.avatarKey");
          methods.clearErrors("basicInfo.profilePhoto");
        }
        if (resumeKey) {
          methods.clearErrors("resumeKey");
          methods.clearErrors("resume");
        }
        const computed = computeProfileStepIndex(
          profileData,
          user?.onboardingStep,
          user?.isProfileCompleted,
          steps.length,
        );
        setStep(computed);
        setMaxUnlockedStep(computed);
      }
    } catch (err) {
      console.error("Failed to load existing candidate profile:", err);
    }
  }, [methods, user]);

  useEffect(() => {
    const isGithubConnected = searchParams.get("github") === "connected";

    if (isGithubConnected) {
      toast.success("GitHub account connected successfully.");

      // If opened in a new tab popup, notify parent window and auto-close popup tab
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: "GITHUB_CONNECTED" }, window.location.origin);
          window.close();
          return;
        } catch (err) {
          console.error("Failed to communicate with parent window:", err);
        }
      }

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("github");
      const newUrl = newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname;
      window.history.replaceState({}, "", newUrl);
    }

    fetchProfile();
  }, [fetchProfile, searchParams, pathname]);

  // Listen for postMessage from pop-up tab or window focus
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GITHUB_CONNECTED") {
        toast.success("GitHub account connected successfully.");
        fetchProfile();
      }
    };

    const handleFocus = () => {
      // Skip refetch if a file upload is pending — the file-dialog open/close
      // causes a blur+focus cycle that would reset the form mid-upload and
      // wipe pendingUpload / pendingResumeUpload, triggering false "Required" errors.
      const formValues = methods.getValues();
      const hasPendingAvatar = !!formValues.basicInfo?.pendingUpload;
      const hasPendingResume = !!formValues.pendingResumeUpload;
      if (hasPendingAvatar || hasPendingResume) return;
      fetchProfile();
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchProfile, methods]);

  /** Advances the step counter and unlocks the next step in one stable callback. */
  const advanceStep = useCallback(() => {
    setStep((s) => {
      const next = s + 1;
      setMaxUnlockedStep((m) => Math.max(m, next));
      return next;
    });
  }, []);

  /** Step 0 — Basic Info */
  const handleSaveBasicInfo = useCallback(async () => {
    const isValid = await methods.trigger("basicInfo");

    // Manual check for avatar — kept outside Zod so onChange never re-fires the error
    const avatarKey = methods.getValues("basicInfo.avatarKey");
    if (!avatarKey) {
      methods.setError("basicInfo.avatarKey", {
        type: "manual",
        message: "Profile photo is required.",
      });
      return;
    }

    if (!isValid) return;

    setSaving(true);
    try {
      const basicInfo = methods.getValues("basicInfo");

      if (basicInfo?.pendingUpload?.uploadUrl && basicInfo?.pendingUpload?.file) {
        const uploadSuccess = await uploadFileToS3(
          basicInfo.pendingUpload.uploadUrl,
          basicInfo.pendingUpload.file,
        );
        if (!uploadSuccess) {
          toast.error("Failed to upload avatar image to storage.");
          return;
        }
      }

      const res = await updateBasicInfo({
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        location: basicInfo.location,
        avatarKey: basicInfo.avatarKey,
      });

      if (res?.success) {
        methods.setValue("basicInfo.pendingUpload", undefined);
        await refreshUser();
        advanceStep();
      }
    } catch (err: unknown) {
      console.error("Error saving basic info:", err);
    } finally {
      setSaving(false);
    }
  }, [methods, refreshUser, advanceStep]);

  /** Step 1 — Education */
  const handleSaveEducation = useCallback(async () => {
    const isValid = await methods.trigger("education");
    if (!isValid) return;

    setSaving(true);
    try {
      const education = methods.getValues("education") || [];
      const res = await updateEducation({ educations: education });

      if (res?.success) {
        await refreshUser();
        advanceStep();
      }
    } catch (err: unknown) {
      console.error("Error updating education:", err);
    } finally {
      setSaving(false);
    }
  }, [methods, refreshUser, advanceStep]);

  /** Step 2 — Skills & Experience */
  const handleSaveSkillsExperience = useCallback(async () => {
    const [isExpValid, isSkillsValid] = await Promise.all([
      methods.trigger("experience"),
      methods.trigger("skills"),
    ]);

    // Manual check for resume — kept outside Zod so onChange never re-fires the error
    const resumeKey = methods.getValues("resumeKey");
    if (!resumeKey) {
      methods.setError("resumeKey", {
        type: "manual",
        message: "Resume is required.",
      });
      return;
    }

    if (!isExpValid || !isSkillsValid) return;

    setSaving(true);
    try {
      const formValues = methods.getValues();
      const pendingResume = formValues.pendingResumeUpload;
      const currentResumeKey = formValues.resumeKey;

      if (pendingResume?.uploadUrl && pendingResume?.file) {
        const uploadSuccess = await uploadFileToS3(
          pendingResume.uploadUrl,
          pendingResume.file,
        );
        if (!uploadSuccess) {
          toast.error("Failed to upload resume file to storage.");
          return;
        }
      }

      const skillsList = formValues.skills || [];
      if (skillsList.length > 0 || currentResumeKey) {
        const skillsRes = await updateSkills({
          skills: skillsList,
          resumeKey: currentResumeKey || "",
        });
        if (!skillsRes?.success) {
          toast.error(skillsRes?.message || "Failed to update skills and resume.");
          return;
        }
      }

      const experience = formValues.experience || [];
      if (experience.length > 0) {
        const expRes = await updateExperience({ experiences: experience });
        if (!expRes?.success) {
          toast.error(expRes?.message || "Failed to update experience history.");
          return;
        }
      }

      methods.setValue("pendingResumeUpload", undefined);
      await refreshUser();
      advanceStep();
    } catch (err: unknown) {
      console.error("Error updating skills & experience:", err);
    } finally {
      setSaving(false);
    }
  }, [methods, refreshUser, advanceStep]);

  /** Step 3 — Preferences */
  const handleSavePreferences = useCallback(async () => {
    const isValid = await methods.trigger("preferences");
    if (!isValid) return;

    setSaving(true);
    try {
      const preferences = methods.getValues("preferences");
      const res = await updatePreferences(preferences);

      if (res?.success) {
        await refreshUser();
        advanceStep();
      }
    } catch (err: unknown) {
      console.error("Error updating preferences:", err);
    } finally {
      setSaving(false);
    }
  }, [methods, refreshUser, advanceStep]);

  /** Step 4 — Links (final step) */
  const handleSaveLinks = useCallback(async () => {
    const isValid = await methods.trigger("links");
    if (!isValid) return;

    setSaving(true);
    try {
      const links = methods.getValues("links");
      const res = await updateLinks(links);

      if (res?.success) {
        await refreshUser();
        toast.success(res?.message || "Profile completed successfully!");
        router.push("/candidate/dashboard");
      }
    } catch (err: unknown) {
      console.error("Error updating links:", err);
    } finally {
      setSaving(false);
    }
  }, [methods, refreshUser, router]);

  /** Dispatches to the correct step handler based on current step. */
  const handleNext = useCallback(async () => {
    const handlers = [
      handleSaveBasicInfo,
      handleSaveEducation,
      handleSaveSkillsExperience,
      handleSavePreferences,
      handleSaveLinks,
    ];
    await handlers[step]?.();
  }, [
    step,
    handleSaveBasicInfo,
    handleSaveEducation,
    handleSaveSkillsExperience,
    handleSavePreferences,
    handleSaveLinks,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <PageHeader
        title="Build your profile"
        subtitle="This information is shown to recruiters along with your interview report."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <FormProvider {...methods}>
          {/* Left column: vertical stepper + live preview */}
          <Stepper
            setStep={setStep}
            step={step}
            steps={steps}
            maxUnlockedStep={maxUnlockedStep}
          />
          {/* Right column: active form panel */}
          <Card>
            <CardContent className="py-8 px-8">
              {step === 0 && <BasicInfoForm />}
              {step === 1 && <EducationForm />}
              {step === 2 && <SkillsExperienceForm />}
              {step === 3 && <PreferencesForm />}
              {step === 4 && <ConnectProfilesForm />}
            </CardContent>

            <div className="flex justify-between items-center p-5 border-t border-border">
              <Button
                variant="ghost"
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft size={16} /> Back
              </Button>
              <Button onClick={handleNext} loading={saving}>
                {step === steps.length - 1 ? "Save profile" : "Continue"}
                {step < steps.length - 1 && <ArrowRight size={16} />}
              </Button>
            </div>
          </Card>
        </FormProvider>
      </div>
    </div>
  );
}

export default function ProfileBuilder() {
  return (
    <Suspense fallback={null}>
      <ProfileBuilderContent />
    </Suspense>
  );
}

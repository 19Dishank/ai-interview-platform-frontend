"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { DEFAULT_VALUES } from "@/constants/formDefaultValues";
import { CandidateProfileForm } from "@/types/profile.types";
const steps = [
  { label: "Basic info", hint: "Name, photo, resume" },
  { label: "Education", hint: "Institution & degree" },
  { label: "Skills & experience", hint: "Tech stack & work history" },
  { label: "Preferences", hint: "Salary, notice, locations" },
  { label: "Links", hint: "GitHub, LinkedIn, portfolio" },
];

export default function ProfileBuilder() {
  const methods = useForm<CandidateProfileForm>({
    defaultValues: DEFAULT_VALUES,
  });
  const { handleSubmit } = methods;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: CandidateProfileForm) => {
    setSaving(true);
    try {
      // await fetch("/api/candidate/profile", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      // });
      console.log(data);
      router.push("/candidate/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  // const handleNext = () => {
  //   if (step < steps.length - 1) setStep((s) => s + 1);
  //   else {
  //     setSaving(true);
  //     setTimeout(() => {
  //       setSaving(false);
  //       router.push("/candidate/dashboard");
  //     }, 1200);
  //   }
  // };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <PageHeader
        title="Build your profile"
        subtitle="This information is shown to recruiters along with your interview report."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <FormProvider {...methods}>
          {/* Left column: vertical stepper + live preview */}
          <Stepper setStep={setStep} step={step} steps={steps} />
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

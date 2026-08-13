"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, AlertCircle, Loader2, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";
import { DatePicker } from "@/components/ui/DatePicker";
import { CandidateProfileForm, Experience } from "@/types/profile.types";
import {
  Controller,
  useController,
  useFieldArray,
  useFormContext,
  useWatch,
  Control,
} from "react-hook-form";
import {
  getResumePresignedUrl,
  getResumeUrl,
} from "@/services/candidate/candidate.services";
import { toast } from "sonner";

const MAX_RESUME_MB = 5;
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const skillSuggestions = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "GraphQL",
  "Docker",
  "AWS",
  "PostgreSQL",
  "Redis",
  "Kubernetes",
];

const EMPTY_EXPERIENCE: Experience = {
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  currentlyWorking: false,
  description: "",
};

import {
  monthStringToDate,
  dateToMonthString,
} from "@/lib/helpers/profile-transformers";

export default function SkillsExperienceForm() {
  const {
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const [resumeError, setResumeError] = useState<string | undefined>();
  const [gettingPresignedUrl, setGettingPresignedUrl] = useState(false);
  const [loadingResumeUrl, setLoadingResumeUrl] = useState(false);

  const existingResumeKey = watch("resumeKey");
  const pendingResumeUpload = watch("pendingResumeUpload");

  const localFile = (pendingResumeUpload?.file as File) ?? null;
  const resumeName = localFile
    ? localFile.name
    : existingResumeKey
      ? existingResumeKey.split("/").pop()
      : undefined;

  const handleViewResume = async () => {
    if (localFile) {
      const localUrl = URL.createObjectURL(localFile);
      window.open(localUrl, "_blank");
      return;
    }

    if (!existingResumeKey) return;

    setLoadingResumeUrl(true);
    try {
      const res = await getResumeUrl();
      const resData = res?.data ?? res;
      const displayUrl =
        resData?.url ||
        resData?.resumeUrl ||
        (typeof resData === "string" ? resData : null);

      if (displayUrl) {
        window.open(displayUrl, "_blank");
      } else {
        toast.error("Failed to retrieve resume URL.");
      }
    } catch (err) {
      console.error("Error fetching resume URL:", err);
      toast.error("Failed to open resume.");
    } finally {
      setLoadingResumeUrl(false);
    }
  };

  const validateResume = (file: File | undefined) => {
    if (!file) return false;
    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Only PDF or DOCX files are supported");
      return false;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`File is too large — max ${MAX_RESUME_MB} MB`);
      return false;
    }
    setResumeError(undefined);
    return true;
  };

  const handleResumeSelection = async (file: File | undefined) => {
    if (!file) return;
    const isValid = validateResume(file);
    if (!isValid) return;

    setGettingPresignedUrl(true);
    try {
      const response = await getResumePresignedUrl({
        fileName: file.name,
        contentType: file.type,
      });

      const resData = response.data?.data ?? response.data;
      const key = resData?.key;
      const uploadUrl = resData?.uploadUrl;

      if (key && uploadUrl) {
        setValue("resumeKey", key, { shouldValidate: true });
        setValue("pendingResumeUpload", { file, uploadUrl });
        // Clear stale validation errors so the "resume required" message disappears immediately
        clearErrors("resumeKey");
        clearErrors("resume");
      } else {
        setResumeError("Failed to obtain resume upload URL.");
      }
    } catch (err: unknown) {
      console.error("Presigned URL error for resume:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate presigned resume URL.";
      setResumeError(errorMessage);
    } finally {
      setGettingPresignedUrl(false);
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">
        Skills & experience
      </h2>

      <div className="border border-dashed border-border rounded-lg p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <FileText size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${
                existingResumeKey || localFile
                  ? "hover:underline cursor-pointer text-primary"
                  : ""
              }`}
              onClick={() =>
                (existingResumeKey || localFile) && handleViewResume()
              }
            >
              {resumeName ||
                (existingResumeKey
                  ? existingResumeKey.split("/").pop()
                  : "Upload resume")}
            </p>

            {(existingResumeKey || localFile) && (
              <button
                type="button"
                onClick={handleViewResume}
                disabled={loadingResumeUrl}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
                title="Click to view/preview resume"
              >
                {loadingResumeUrl ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Eye size={13} />
                )}
                <span>View</span>
              </button>
            )}
          </div>

          {resumeError || errors?.resumeKey?.message || errors?.resume?.message ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} />{" "}
              {resumeError || (errors?.resumeKey?.message as string) || (errors?.resume?.message as string)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF, DOCX up to {MAX_RESUME_MB} MB
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={gettingPresignedUrl}
          className="relative shrink-0"
        >
          {gettingPresignedUrl ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Generating URL...
            </>
          ) : (
            <>
              <Upload size={14} /> Choose file
            </>
          )}
          <Controller
            control={control}
            name="resume"
            render={({ field: { onChange, onBlur, name } }) => (
              <input
                name={name}
                onBlur={onBlur}
                type="file"
                accept=".pdf,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={gettingPresignedUrl}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file);
                    handleResumeSelection(file);
                  } else {
                    onChange(undefined);
                  }
                }}
              />
            )}
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
        {/* Work experience */}
        <div className="flex flex-col gap-4">
          <h3 className="font-medium text-sm">Work experience</h3>

          {fields.map((field, index) => (
            <ExperienceRow
              key={field.id}
              index={index}
              control={control}
              onRemove={() => remove(index)}
              showRemove={true}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            type="button"
            className="self-start"
            onClick={() => append(EMPTY_EXPERIENCE)}
          >
            <Plus size={14} /> Add position
          </Button>
        </div>

        {/* Skills - shared TagInput, dedupes with Preferred Locations */}
        <Controller
          control={control}
          name="skills"
          render={({ field }) => (
            <TagInput
              label="Skills"
              values={field.value}
              onChange={field.onChange}
              suggestions={skillSuggestions}
              placeholder="Add a skill..."
              maxTags={20}
              error={errors.skills?.message as string}
            />
          )}
        />
      </div>
    </div>
  );
}

function ExperienceRow({
  index,
  control,
  onRemove,
  showRemove,
}: {
  index: number;
  control: Control<CandidateProfileForm>;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();
  const rowErrors = errors.experience?.[index];

  const startDate = useWatch({
    control,
    name: `experience.${index}.startDate`,
  });
  const endDate = useWatch({ control, name: `experience.${index}.endDate` });
  const currentlyWorking = useWatch({
    control,
    name: `experience.${index}.currentlyWorking`,
  });

  const { field: currentlyWorkingField } = useController({
    control,
    name: `experience.${index}.currentlyWorking`,
  });

  const handleCurrentlyWorkingChange = (checked: boolean) => {
    currentlyWorkingField.onChange(checked);
    setValue(`experience.${index}.isCurrent`, checked, { shouldValidate: true });
    if (checked) {
      // Clear end date silently — no validation flash when toggling ON
      setValue(`experience.${index}.endDate`, null, { shouldValidate: false });
    }
  };

  const dateError =
    startDate && endDate && !currentlyWorking && endDate < startDate
      ? "End date is before start date"
      : (rowErrors?.endDate?.message as string);

  return (
    <div className="p-4 border border-border rounded-lg flex flex-col gap-3 relative">
      {showRemove && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove position"
        >
          <Trash2 size={14} />
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Job title"
          required
          error={rowErrors?.jobTitle?.message as string}
          {...register(`experience.${index}.jobTitle`)}
        />
        <Input
          label="Company"
          required
          error={rowErrors?.company?.message as string}
          {...register(`experience.${index}.company`)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name={`experience.${index}.startDate`}
          render={({ field }) => (
            <DatePicker
              type="month"
              label="Start date"
              value={monthStringToDate(field.value)}
              onChange={(date) => field.onChange(dateToMonthString(date))}
              error={rowErrors?.startDate?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name={`experience.${index}.endDate`}
          render={({ field }) => (
            <DatePicker
              type="month"
              label="End date"
              value={monthStringToDate(field.value)}
              onChange={(date) => field.onChange(dateToMonthString(date))}
              error={dateError}
              currentToggle={{
                checked: currentlyWorkingField.value,
                onChange: handleCurrentlyWorkingChange,
                label: "I currently work here",
              }}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-24 resize-none"
          placeholder="Key responsibilities and achievements..."
          {...register(`experience.${index}.description`)}
        />
        {rowErrors?.description?.message && (
          <p className="text-xs text-destructive">
            {rowErrors.description.message as string}
          </p>
        )}
      </div>
    </div>
  );
}

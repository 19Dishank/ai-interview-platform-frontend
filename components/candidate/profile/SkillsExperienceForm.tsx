"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, AlertCircle } from "lucide-react";
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
  currentlyWorking: false,
  description: "",
};

// Form stores dates as "YYYY-MM" strings; DatePicker works with Date objects.
function monthStringToDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return undefined;
  return new Date(year, month - 1);
}

function dateToMonthString(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function SkillsExperienceForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const [resumeError, setResumeError] = useState<string | undefined>();
  const [resumeName, setResumeName] = useState<string | undefined>();

  const validateResume = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Only PDF or DOCX files are supported");
      setResumeName(undefined);
      return false;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`File is too large — max ${MAX_RESUME_MB} MB`);
      setResumeName(undefined);
      return false;
    }
    setResumeError(undefined);
    setResumeName(file.name);
    return true;
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
        <Upload size={20} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{resumeName || "Upload resume"}</p>
          {resumeError ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} /> {resumeError}
            </p>
          ) : errors?.resume?.message ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} />{" "}
              {errors.resume.message as string}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              PDF, DOCX up to {MAX_RESUME_MB} MB
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" type="button" className="relative">
          <Upload size={14} /> Choose file
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (validateResume(file)) {
                    onChange(file);
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
              showRemove={fields.length > 1}
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
                onChange: currentlyWorkingField.onChange,
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

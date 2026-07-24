"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { CandidateProfileForm, Education } from "@/types/profile.types";
import {
  Controller,
  useController,
  useFieldArray,
  useFormContext,
  useWatch,
  Control,
} from "react-hook-form";

const degreeTypes = [
  "B.Tech / B.E.",
  "B.Sc",
  "BCA",
  "M.Tech / M.E.",
  "M.Sc",
  "MCA",
  "MBA",
  "PhD",
  "Diploma",
  "Other",
];
const gradeTypes = ["CGPA (10)", "CGPA (4)", "Percentage", "GPA"];

const EMPTY_EDUCATION: Education = {
  institution: "",
  degreeType: "B.Tech / B.E.",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  currentlyPursuing: false,
  gradeType: "CGPA (10)",
  grade: "",
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

// Edge case: grade value must fit the selected scale.
// NOTE: this only drives inline UI feedback — it isn't part of the form's
// submit validation. If you want grade range enforced on submit, add the
// same rule to your zod/yup schema for `education.*.grade`.
function validateGrade(value: string, gradeType: string): string | undefined {
  if (!value) return undefined;
  const num = parseFloat(value);
  if (isNaN(num)) return "Enter a number";
  if (gradeType === "Percentage" && (num < 0 || num > 100))
    return "Must be between 0–100";
  if (gradeType === "CGPA (10)" && (num < 0 || num > 10))
    return "Must be between 0–10";
  if (gradeType === "CGPA (4)" && (num < 0 || num > 4))
    return "Must be between 0–4";
  return undefined;
}

export default function EducationForm() {
  const { control } = useFormContext<CandidateProfileForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">Education</h2>

      {fields.map((field, index) => (
        <EducationRow
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
        onClick={() => append(EMPTY_EDUCATION)}
      >
        <Plus size={14} /> Add education
      </Button>
    </div>
  );
}

function EducationRow({
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
  const rowErrors = errors.education?.[index];

  const degreeType = useWatch({
    control,
    name: `education.${index}.degreeType`,
  });
  const gradeType = useWatch({ control, name: `education.${index}.gradeType` });
  const grade = useWatch({ control, name: `education.${index}.grade` });
  const startDate = useWatch({ control, name: `education.${index}.startDate` });
  const endDate = useWatch({ control, name: `education.${index}.endDate` });
  const currentlyPursuing = useWatch({
    control,
    name: `education.${index}.currentlyPursuing`,
  });

  const { field: currentlyPursuingField } = useController({
    control,
    name: `education.${index}.currentlyPursuing`,
  });

  const gradeError =
    validateGrade(grade, gradeType) ?? (rowErrors?.grade?.message as string);
  const dateError =
    startDate && endDate && !currentlyPursuing && endDate < startDate
      ? "End date is before start date"
      : (rowErrors?.endDate?.message as string);

  return (
    <div className="p-5 border border-border rounded-lg flex flex-col gap-4 relative">
      {showRemove && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove education"
        >
          <Trash2 size={14} />
        </Button>
      )}

      <Input
        label="Institution"
        error={rowErrors?.institution?.message as string}
        required
        {...register(`education.${index}.institution`)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name={`education.${index}.degreeType`}
          render={({ field }) => (
            <Select
              label="Degree type"
              value={field.value}
              onValueChange={field.onChange}
              options={degreeTypes}
            />
          )}
        />
        {degreeType === "Other" ? (
          <Input
            label="Specify degree"
            placeholder="e.g. B.Des"
            error={rowErrors?.fieldOfStudy?.message as string}
            {...register(`education.${index}.fieldOfStudy`)}
          />
        ) : (
          <Input
            label="Field of study"
            placeholder="e.g. Computer Science"
            error={rowErrors?.fieldOfStudy?.message as string}
            {...register(`education.${index}.fieldOfStudy`)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name={`education.${index}.startDate`}
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
          name={`education.${index}.endDate`}
          render={({ field }) => (
            <DatePicker
              label="End date"
              value={monthStringToDate(field.value)}
              onChange={(date) => field.onChange(dateToMonthString(date))}
              error={dateError}
              currentToggle={{
                checked: currentlyPursuingField.value,
                onChange: currentlyPursuingField.onChange,
                label: "Currently pursuing",
              }}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-[160px_1fr] gap-4">
        <Controller
          control={control}
          name={`education.${index}.gradeType`}
          render={({ field }) => (
            <Select
              label="Grade type"
              value={field.value}
              onValueChange={field.onChange}
              options={gradeTypes}
            />
          )}
        />
        <Input
          label={gradeType}
          placeholder={gradeType === "Percentage" ? "e.g. 84" : "e.g. 8.4"}
          error={gradeError}
          {...register(`education.${index}.grade`)}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
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

const degreeOptions = [
  { label: "Bachelor (B.Tech / B.E. / B.Sc / BCA)", value: "BACHELOR" },
  { label: "Master (M.Tech / M.Sc / MCA / MBA)", value: "MASTER" },
  { label: "PhD / Doctorate", value: "PHD" },
  { label: "Diploma", value: "DIPLOMA" },
  { label: "High School", value: "HIGH_SCHOOL" },
  { label: "Other", value: "OTHER" },
];

const gradeOptions = [
  { label: "CGPA", value: "CGPA" },
  { label: "Percentage", value: "PERCENTAGE" },
];

const EMPTY_EDUCATION: Education = {
  institution: "",
  degreeType: "BACHELOR",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  currentlyPursuing: false,
  gradeType: "CGPA",
  grade: "",
};

import {
  monthStringToDate,
  dateToMonthString,
} from "@/lib/helpers/profile-transformers";

export default function EducationForm() {
  const { control } = useFormContext<CandidateProfileForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    if (fields.length === 0) {
      append(EMPTY_EDUCATION);
    }
  }, [fields.length, append]);

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
    setValue,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();
  const rowErrors = errors.education?.[index];

  const gradeType = useWatch({ control, name: `education.${index}.gradeType` });

  const { field: currentlyPursuingField } = useController({
    control,
    name: `education.${index}.currentlyPursuing`,
  });

  const handleCurrentlyPursuingChange = (checked: boolean) => {
    currentlyPursuingField.onChange(checked);
    setValue(`education.${index}.isCurrent`, checked, { shouldValidate: true });
    if (checked) {
      // Clear end date and grade silently — no validation flash when toggling ON
      setValue(`education.${index}.endDate`, null, { shouldValidate: false });
      setValue(`education.${index}.grade`, "", { shouldValidate: false });
    }
  };

  return (
    <div className="p-5 border border-border rounded-lg flex flex-col gap-4 relative">
      {showRemove && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive cursor-pointer"
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
              value={field.value || "BACHELOR"}
              onValueChange={field.onChange}
              options={degreeOptions}
              error={rowErrors?.degreeType?.message as string}
            />
          )}
        />
        <Input
          label="Field of study"
          placeholder="e.g. Computer Science"
          error={rowErrors?.fieldOfStudy?.message as string}
          required
          {...register(`education.${index}.fieldOfStudy`)}
        />
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
              error={rowErrors?.startDate?.message as string}
            />
          )}
        />
        <Controller
          control={control}
          name={`education.${index}.endDate`}
          render={({ field }) => (
            <DatePicker
              type="month"
              label="End date"
              value={monthStringToDate(field.value ?? undefined)}
              onChange={(date) => field.onChange(dateToMonthString(date))}
              error={rowErrors?.endDate?.message as string}
              currentToggle={{
                checked: currentlyPursuingField.value ?? false,
                onChange: handleCurrentlyPursuingChange,
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
              value={field.value || "CGPA"}
              onValueChange={field.onChange}
              options={gradeOptions}
              error={rowErrors?.gradeType?.message as string}
            />
          )}
        />
        <Input
          label={gradeType || "Grade"}
          placeholder={gradeType === "PERCENTAGE" ? "e.g. 84" : "e.g. 8.4"}
          error={rowErrors?.grade?.message as string}
          {...register(`education.${index}.grade`)}
        />
      </div>
    </div>
  );
}

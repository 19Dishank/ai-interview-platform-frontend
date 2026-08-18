"use client";

import { EditableSelect } from "@/components/ui/EditableSelect";
import { Select } from "@/components/ui/Select";
import { TagInput } from "@/components/ui/TagInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { CandidateProfileForm, WorkType } from "@/types/profile.types";
import { Controller, useFormContext } from "react-hook-form";

const salaryOptions = [
  "₹20,00,000",
  "₹25,00,000",
  "₹30,00,000",
  "₹40,00,000",
  "₹50,00,000",
];

const noticeOptions = [
  { label: "Immediate", value: "IMMEDIATE" },
  { label: "15 days", value: "FIFTEEN_DAYS" },
  { label: "30 days", value: "THIRTY_DAYS" },
  { label: "60 days", value: "SIXTY_DAYS" },
  { label: "90 days", value: "NINETY_DAYS" },
];

const locationSuggestions = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Remote",
];

const workTypesOptions: { label: string; value: WorkType }[] = [
  { label: "Full-time", value: "FULL_TIME" },
  { label: "Part-time", value: "PART_TIME" },
  { label: "Internship", value: "INTERNSHIP" },
  { label: "Contract", value: "CONTRACT" },
  { label: "Freelance", value: "FREELANCE" },
  { label: "Remote", value: "REMOTE" },
];

export default function PreferencesForm() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">Preferences</h2>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          control={control}
          name="preferences.expectedSalary"
          render={({ field }) => (
            <EditableSelect
              label="Salary expectation (₹)"
              value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
              onChange={field.onChange}
              options={salaryOptions}
              customPlaceholder="e.g. 2500000"
              error={errors.preferences?.expectedSalary?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="preferences.noticePeriod"
          render={({ field }) => (
            <Select
              label="Notice period"
              value={field.value || ""}
              onValueChange={field.onChange}
              options={noticeOptions}
              placeholder="Select notice period..."
              error={errors.preferences?.noticePeriod?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border rounded-lg">
        <Controller
          control={control}
          name="preferences.preferredLocations"
          render={({ field }) => (
            <TagInput
              label="Preferred locations"
              values={field.value || []}
              onChange={field.onChange}
              suggestions={locationSuggestions}
              placeholder="Add a city..."
              maxTags={8}
              hint="Add any city, not just the suggestions"
              error={errors.preferences?.preferredLocations?.message as string}
            />
          )}
        />

        <div className="flex flex-col gap-2 md:border-l md:border-border md:pl-6">
          <label className="text-sm font-medium">Work type</label>
          <Controller
            control={control}
            name="preferences.workTypes"
            render={({ field }) => {
              const currentValues = (field.value || []) as WorkType[];
              return (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {workTypesOptions.map((wt) => (
                    <Checkbox
                      key={wt.value}
                      label={wt.label}
                      checked={currentValues.includes(wt.value)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          checked
                            ? [...currentValues, wt.value]
                            : currentValues.filter((v: WorkType) => v !== wt.value),
                        )
                      }
                    />
                  ))}
                </div>
              );
            }}
          />
          {errors.preferences?.workTypes?.message && (
            <p className="text-xs text-destructive">
              {errors.preferences.workTypes.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

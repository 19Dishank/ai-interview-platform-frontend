"use client";

import { EditableSelect } from "@/components/ui/EditableSelect";
import { TagInput } from "@/components/ui/TagInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { CandidateProfileForm, WorkType } from "@/types/profile.types";
import { Controller, useFormContext } from "react-hook-form";

const salaryOptions = [
  "₹20–25 LPA",
  "₹25–32 LPA",
  "₹32–38 LPA",
  "₹38–50 LPA",
  "₹50+ LPA",
];
const noticeOptions = [
  "Immediate",
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "90 days",
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
const workTypes: { label: string; value: WorkType }[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Contract", value: "contract" },
  { label: "Part-time", value: "part-time" },
  { label: "Open to all", value: "open-to-all" },
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
        {/* Both allow a custom value via "Custom..." instead of only the fixed brackets */}
        <Controller
          control={control}
          name="preferences.salaryExpectation"
          render={({ field }) => (
            <EditableSelect
              label="Salary expectation"
              value={field.value}
              onChange={field.onChange}
              options={salaryOptions}
              customPlaceholder="e.g. ₹28 LPA"
              error={errors.preferences?.salaryExpectation?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="preferences.noticePeriod"
          render={({ field }) => (
            <EditableSelect
              label="Notice period"
              value={field.value}
              onChange={field.onChange}
              options={noticeOptions}
              customPlaceholder="e.g. 20 days"
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
              values={field.value}
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
            name="preferences.workType"
            render={({ field }) => (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {workTypes.map((wt) => (
                  <Checkbox
                    key={wt.value}
                    label={wt.label}
                    checked={field.value.includes(wt.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...field.value, wt.value]
                          : field.value.filter((v: WorkType) => v !== wt.value),
                      )
                    }
                  />
                ))}
              </div>
            )}
          />
          {errors.preferences?.workType?.message && (
            <p className="text-xs text-destructive">
              {errors.preferences.workType.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

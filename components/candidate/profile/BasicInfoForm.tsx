/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EditableSelect } from "@/components/ui/EditableSelect";
import { Controller, useFormContext } from "react-hook-form";
import { CandidateProfileForm } from "@/types/profile.types";

const locationOptions = [
  "Bangalore, India",
  "Mumbai, India",
  "Hyderabad, India",
  "Delhi, India",
  "Remote",
];

const MAX_PHOTO_MB = 2;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

export default function BasicInfoForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState<string | undefined>();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const validatePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Only JPG or PNG images are supported");
      return false;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoError(`Image is too large — max ${MAX_PHOTO_MB} MB`);
      return false;
    }
    setPhotoError(undefined);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    return true;
  };

  const basicInfoErrors = errors.basicInfo;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">Basic information</h2>

      <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No photo</span>
          )}
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => photoInputRef.current?.click()}
          >
            <Upload size={14} /> Upload photo
          </Button>
          <Controller
            control={control}
            name="basicInfo.profilePhoto"
            render={({ field: { onChange, onBlur, name } }) => (
              <input
                ref={photoInputRef}
                name={name}
                onBlur={onBlur}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (validatePhoto(file)) {
                    onChange(file);
                  } else {
                    onChange(undefined);
                  }
                }}
              />
            )}
          />
          {photoError ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {photoError}
            </p>
          ) : basicInfoErrors?.profilePhoto?.message ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle size={12} />{" "}
              {basicInfoErrors.profilePhoto.message as string}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG up to {MAX_PHOTO_MB} MB
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          label="First name"
          error={basicInfoErrors?.firstName?.message as string}
          {...register("basicInfo.firstName")}
        />
        <Input
          label="Last name"
          error={basicInfoErrors?.lastName?.message as string}
          {...register("basicInfo.lastName")}
        />

        <Controller
          control={control}
          name="basicInfo.location"
          defaultValue="Bangalore, India"
          render={({ field, fieldState }) => (
            <EditableSelect
              {...field}
              label="Location"
              error={fieldState.error?.message}
              options={locationOptions}
            />
          )}
        />
      </div>
    </div>
  );
}

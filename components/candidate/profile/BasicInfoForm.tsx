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

const MAX_RESUME_MB = 5;
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_PHOTO_MB = 2;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

export default function BasicInfoForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const [resumeError, setResumeError] = useState<string | undefined>();
  const [resumeName, setResumeName] = useState<string | undefined>();

  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState<string | undefined>();
  const photoInputRef = useRef<HTMLInputElement>(null);
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
        <Input
          {...register("basicInfo.currentTitle")}
          label="Current title"
          defaultValue="Senior Frontend Engineer"
          error={basicInfoErrors?.currentTitle?.message as string}
          className="col-span-2 md:col-span-1"
          required
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          label="Current company"
          error={basicInfoErrors?.currentCompany?.message as string}
          {...register("basicInfo.currentCompany")}
        />
        <Input
          {...register("basicInfo.yearsOfExperience")}
          label="Years of experience"
          type="number"
          min={0}
          max={50}
          defaultValue="6"
          error={basicInfoErrors?.yearsOfExperience?.message as string}
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

      <div className="border border-dashed border-border rounded-lg p-5 flex items-center gap-4">
        <Upload size={20} className="text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{resumeName || "Upload resume"}</p>
          {resumeError ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} /> {resumeError}
            </p>
          ) : basicInfoErrors?.resume?.message ? (
            <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
              <AlertCircle size={12} />{" "}
              {basicInfoErrors.resume.message as string}
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
            name="basicInfo.resume"
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
    </div>
  );
}

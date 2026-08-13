/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EditableSelect } from "@/components/ui/EditableSelect";
import { Controller, useFormContext } from "react-hook-form";
import { CandidateProfileForm } from "@/types/profile.types";
import {
  getAvatarPresignedUrl,
  getAvatarUrl,
} from "@/services/candidate/candidate.services";
import { toast } from "sonner";

const locationOptions = [
  "Bangalore, India",
  "Mumbai, India",
  "Hyderabad, India",
  "Delhi, India",
  "Remote",
];

export default function BasicInfoForm() {
  const {
    register,
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<CandidateProfileForm>();

  const avatarKey = watch("basicInfo.avatarKey");
  const pendingUpload = watch("basicInfo.pendingUpload");
  const [remoteAvatarUrl, setRemoteAvatarUrl] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState<string | undefined>();
  const [gettingPresignedUrl, setGettingPresignedUrl] = useState(false);
  const [loadingAvatarUrl, setLoadingAvatarUrl] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const localPreviewUrl = pendingUpload?.file
    ? URL.createObjectURL(pendingUpload.file)
    : undefined;

  const photoPreview = localPreviewUrl || remoteAvatarUrl;

  useEffect(() => {
    let isCancelled = false;
    if (avatarKey && !localPreviewUrl && !remoteAvatarUrl) {
      queueMicrotask(() => {
        if (!isCancelled) setLoadingAvatarUrl(true);
      });
      getAvatarUrl()
        .then((res) => {
          if (isCancelled) return;
          const resData = res?.data ?? res;
          const displayUrl =
            resData?.url ||
            resData?.avatarUrl ||
            (typeof resData === "string" ? resData : null);
          if (displayUrl) {
            setRemoteAvatarUrl(displayUrl);
          }
        })
        .catch((err) => {
          console.error("Error fetching avatar display URL:", err);
        })
        .finally(() => {
          if (!isCancelled) setLoadingAvatarUrl(false);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [avatarKey, localPreviewUrl, remoteAvatarUrl]);

  const handleFileSelection = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image file size must be less than 5MB.");
      return;
    }

    setPhotoError(undefined);

    setGettingPresignedUrl(true);
    try {
      const response = await getAvatarPresignedUrl({
        fileName: file.name,
        contentType: file.type,
      });

      const resData = response.data?.data ?? response.data;
      const key = resData?.key;
      const uploadUrl = resData?.uploadUrl;

      if (key && uploadUrl) {
        setValue("basicInfo.avatarKey", key, { shouldValidate: true });
        setValue("basicInfo.pendingUpload", { file, uploadUrl });
        // Clear stale validation errors so the "photo required" message disappears immediately
        clearErrors("basicInfo.avatarKey");
        clearErrors("basicInfo.profilePhoto");
      } else {
        setPhotoError("Failed to obtain avatar upload URL.");
      }
    } catch (err: unknown) {
      console.error("Presigned URL error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate presigned upload URL.";
      setPhotoError(errorMessage);
    } finally {
      setGettingPresignedUrl(false);
    }
  };

  const basicInfoErrors = errors.basicInfo;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-xl font-semibold">Basic information</h2>

      <div className="flex items-center gap-4 p-4 border border-dashed border-border rounded-lg">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
          {loadingAvatarUrl ? (
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          ) : photoPreview ? (
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
            disabled={gettingPresignedUrl}
            onClick={() => photoInputRef.current?.click()}
          >
            {gettingPresignedUrl ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating URL...
              </>
            ) : (
              <>
                <Upload size={14} /> Upload photo
              </>
            )}
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
                  if (file) {
                    onChange(file);
                    handleFileSelection(file);
                  } else {
                    onChange(undefined);
                  }
                }}
              />
            )}
          />
          <p className="text-xs text-muted-foreground mt-1">
            JPG or PNG under 5MB
          </p>
          {(photoError || basicInfoErrors?.avatarKey?.message || basicInfoErrors?.profilePhoto?.message) && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {photoError || (basicInfoErrors?.avatarKey?.message as string) || (basicInfoErrors?.profilePhoto?.message as string)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          placeholder="e.g. John"
          error={basicInfoErrors?.firstName?.message}
          {...register("basicInfo.firstName")}
        />
        <Input
          label="Last name"
          placeholder="e.g. Doe"
          error={basicInfoErrors?.lastName?.message}
          {...register("basicInfo.lastName")}
        />
      </div>

      <Controller
        control={control}
        name="basicInfo.location"
        render={({ field }) => (
          <EditableSelect
            label="Location"
            value={field.value}
            onChange={field.onChange}
            options={locationOptions}
            customPlaceholder="e.g. New York, USA"
            error={basicInfoErrors?.location?.message}
          />
        )}
      />
    </div>
  );
}

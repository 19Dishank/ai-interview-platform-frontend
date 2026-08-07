import axios from "axios";
import { clientApi } from "@/services/api/client-axios";
import {
  AvatarPresignedUrlBody,
  BasicInfoBody,
  EducationBody,
  ResumePresignedUrlBody,
  SkillsBody,
  ExperienceBody,
  PreferencesBody,
  LinksBody,
} from "@/types/profile.types";

/**
 * 1. Get complete candidate profile
 */
export const getCandidateProfile = async () => {
  const response = await clientApi.get("/candidate/profile");
  return response.data;
};

/**
 * 2. Generate presigned URL for avatar upload
 */
export const getAvatarPresignedUrl = async (payload: AvatarPresignedUrlBody) => {
  const response = await clientApi.post(
    "/candidate/profile/avatar/presigned-url",
    payload,
  );
  return response.data;
};

/**
 * 3. Update candidate basic information (Step 1)
 */
export const updateBasicInfo = async (payload: BasicInfoBody) => {
  const response = await clientApi.patch(
    "/candidate/profile/basic-info",
    payload,
  );
  return response.data;
};

/**
 * 4. Update candidate education records (Step 2)
 */
export const updateEducation = async (payload: EducationBody) => {
  const response = await clientApi.put(
    "/candidate/profile/education",
    payload,
  );
  return response.data;
};

/**
 * 5. Generate presigned URL for resume upload
 */
export const getResumePresignedUrl = async (payload: ResumePresignedUrlBody) => {
  const response = await clientApi.post(
    "/candidate/profile/resume/presigned-url",
    payload,
  );
  return response.data;
};

/**
 * 6. Update candidate skills & resume key (Step 3)
 */
export const updateSkills = async (payload: SkillsBody) => {
  const response = await clientApi.put("/candidate/profile/skills", payload);
  return response.data;
};

/**
 * 7. Update candidate work experience records (Step 3)
 */
export const updateExperience = async (payload: ExperienceBody) => {
  const response = await clientApi.put(
    "/candidate/profile/experience",
    payload,
  );
  return response.data;
};

/**
 * 8. Update candidate preferences (Step 4)
 */
export const updatePreferences = async (payload: PreferencesBody) => {
  const response = await clientApi.patch(
    "/candidate/profile/preferences",
    payload,
  );
  return response.data;
};

/**
 * 9. Update professional links and complete onboarding (Step 5)
 */
export const updateLinks = async (payload: LinksBody) => {
  const response = await clientApi.patch("/candidate/profile/links", payload);
  return response.data;
};

/**
 * 10. Get signed GET URL for candidate avatar
 */
export const getAvatarUrl = async () => {
  const response = await clientApi.get("/candidate/profile/avatar");
  return response.data;
};

/**
 * 11. Get signed GET URL for candidate resume
 */
export const getResumeUrl = async () => {
  const response = await clientApi.get("/candidate/profile/resume");
  return response.data;
};

/**
 * 12. Delete candidate avatar
 */
export const deleteAvatar = async () => {
  const response = await clientApi.delete("/candidate/profile/avatar");
  return response.data;
};

/**
 * 13. Delete candidate resume
 */
export const deleteResume = async () => {
  const response = await clientApi.delete("/candidate/profile/resume");
  return response.data;
};

/**
 * 14. Get GitHub Connect OAuth URL
 */
export const getGitHubConnectUrl = async () => {
  const response = await clientApi.get("/github/connect");
  return response.data;
};

/**
 * Helper: Directly upload file binary to S3 using presigned URL
 */
export const uploadFileToS3 = async (presignedUrl: string, file: File) => {
  const response = await axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
  return response.status >= 200 && response.status < 300;
};

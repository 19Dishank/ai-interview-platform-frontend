import { CandidateProfileForm } from "@/types/profile.types";

export const DEFAULT_VALUES: CandidateProfileForm = {
  basicInfo: {
    firstName: "",
    lastName: "",
    location: "",
    avatarKey: "",
    profilePhoto: null,
  },

  education: [
    {
      institution: "",
      degreeType: "BACHELOR",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      currentlyPursuing: false,
      gradeType: "CGPA",
      grade: "",
    },
  ],

  experience: [
    {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      currentlyWorking: false,
      description: "",
    },
  ],

  skills: [],
  resume: null,
  resumeKey: "",

  preferences: {
    expectedSalary: "",
    noticePeriod: "",
    preferredLocations: [],
    workTypes: [],
  },

  links: {
    githubUsername: "",
    github: "",
    linkedinUrl: "",
    linkedin: "",
    leetcodeUsername: "",
    portfolioUrl: "",
    portfolio: "",
  },
};

export type WorkType = "full-time" | "contract" | "part-time" | "open-to-all";

export interface BasicInfo {
  firstName: string;
  lastName: string;
  currentTitle: string;
  currentCompany: string;
  yearsOfExperience: number;
  location: string;
  profilePhoto: File | null;
  resume: File | null;
}

export interface Education {
  institution: string;
  degreeType: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  currentlyPursuing: boolean;
  gradeType: string;
  grade: string;
}

export interface Experience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface Preferences {
  salaryExpectation: string;
  noticePeriod: string;
  preferredLocations: string[];
  workType: WorkType[];
}

export interface Links {
  github: string;
  linkedin: string;
  portfolio: string;
}

export interface CandidateProfileForm {
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  preferences: Preferences;
  links: Links;
}

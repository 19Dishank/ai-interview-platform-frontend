import { CandidateProfileForm } from "@/types/profile.types";

export const DEFAULT_VALUES: CandidateProfileForm = {
  basicInfo: {
    firstName: "",
    lastName: "",
    currentTitle: "",
    currentCompany: "",
    yearsOfExperience: 0,
    location: "",
    profilePhoto: null,
    resume: null,
  },

  education: [
    {
      institution: "",
      degreeType: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      currentlyPursuing: false,
      gradeType: "",
      grade: "",
    },
  ],

  experience: [
    {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    },
  ],

  skills: [],

  preferences: {
    salaryExpectation: "",
    noticePeriod: "",
    preferredLocations: [],
    workType: [],
  },

  links: {
    github: "",
    linkedin: "",
    portfolio: "",
  },
};

// import { CandidateProfileForm } from "@/types/profile.types";

// export const DEFAULT_VALUES: CandidateProfileForm = {
//   basicInfo: {
//     firstName: "Dishank",
//     lastName: "Patel",
//     currentTitle: "Trainee Frontend Engineer",
//     currentCompany: "Narola Infotech",
//     yearsOfExperience: 1,
//     location: "Surat, Gujarat",
//     profilePhoto: null,
//     resume: null,
//   },

//   education: [
//     {
//       institution: "Sarvajanik College of Engineering & Technology",
//       degreeType: "MCA",
//       fieldOfStudy: "Computer Applications",
//       startDate: "2024-06",
//       endDate: "2026-05",
//       currentlyPursuing: true,
//       gradeType: "CGPA (10)",
//       grade: "9.2",
//     },
//   ],

//   experience: [
//     {
//       jobTitle: "Frontend Developer Intern",
//       company: "Narola Infotech",
//       startDate: "2026-01",
//       endDate: "",
//       currentlyWorking: true,
//       description:
//         "Working on React, Next.js, TypeScript, Tailwind CSS, Zustand, API integration, authentication, and reusable UI components.",
//     },
//   ],

//   skills: [
//     "JavaScript",
//     "TypeScript",
//     "React",
//     "Next.js",
//     "Node.js",
//     "Express.js",
//     "Tailwind CSS",
//     "Redux Toolkit",
//     "Zustand",
//     "Git",
//     "REST API",
//     "MongoDB",
//   ],

//   preferences: {
//     salaryExpectation: "6-8 LPA",
//     noticePeriod: "Immediate",
//     preferredLocations: ["Surat", "Ahmedabad", "Remote"],
//     workType: ["full-time", "open-to-all"],
//   },

//   links: {
//     github: "https://github.com/dishankpatel",
//     linkedin: "https://linkedin.com/in/dishankpatel",
//     portfolio: "https://dishankpatel.in",
//   },
// };

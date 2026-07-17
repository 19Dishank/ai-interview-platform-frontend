export interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  experience: number
  location: string
  skills: string[]
  domain: string
  technology: string
  level: string
  salaryExpectation: string
  noticePeriod: string
  interviewDate: string
  validUntil: string
  difficulty: string
  overallScore: number
  communicationScore: number
  technicalScore: number
  availability: string
  summary: string
  strengths: string[]
  weaknesses: string[]
  github: string
  linkedin: string
  email: string
  phone: string
}

export interface InterviewHistoryItem {
  id: string
  domain: string
  technology: string
  level: string
  difficulty: string
  date: string
  validUntil: string
  score: number
  status: 'completed' | 'expired' | string
}

export interface EvidenceItem {
  timestamp: string
  note: string
}

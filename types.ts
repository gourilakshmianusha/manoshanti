
export enum AssessmentTest {
  MISIC = "MISIC",
  CAT = "CAT",
  VSMS = "VSMS",
  SPM = "SPM",
  CPM = "CPM",
  NIMHANS_LD = "NIMHANS INDEX FOR LEARNING DISABILITY",
  ISAA = "ISAA",
  CONNER = "CONNER",
  VANDERBILT = "VANDERBILT",
  ADHD_RS = "ADHD-RS"
}

export interface PatientDetails {
  name: string;
  age: string;
  gender: string;
  referralReason: string;
  clinicalObservations: string;
  testScores?: string;
}

export interface LabReport {
  id: string;
  patient: PatientDetails;
  testType: AssessmentTest;
  date: string;
  summary: string;
  fullReport: string;
}

export interface User {
  email: string;
  isAuthenticated: boolean;
}

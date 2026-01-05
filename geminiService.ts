
import { GoogleGenAI } from "@google/genai";
import { PatientDetails, AssessmentTest } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateReport = async (patient: PatientDetails, test: AssessmentTest) => {
  const prompt = `
    You are an expert clinical psychologist. Generate a professional laboratory/assessment report for the following:
    
    PATIENT DETAILS:
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    
    DATA POINTS (USE THIS ORDER FOR THE REPORT BODY):
    1. Test Scores/Raw Data: ${patient.testScores || "Not provided"}
    2. Referral Reason: ${patient.referralReason}
    3. Clinical Observations: ${patient.clinicalObservations}

    ASSESSMENT TOOL:
    ${test}

    Please provide:
    1. A SHORT SUMMARY (approx 2-3 sentences) for a quick overview.
    2. A DETAILED FULL REPORT formatted in Markdown. 
       CRITICAL: You MUST order the sections exactly as follows:
       - # [Test Name] Assessment Report
       - ## Test Results & Quantitative Findings (Detail the scores here first)
       - ## Referral Context & Background (Include the referral reason here)
       - ## Behavioral & Clinical Observations
       - ## Clinical Interpretation
       - ## Recommendations
    
    Format the response as a valid JSON object with keys: "summary" and "fullReport".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

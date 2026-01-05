
import { GoogleGenAI, Type } from "@google/genai";
import { PatientDetails, AssessmentTest } from "./types";

export const generateReport = async (patient: PatientDetails, test: AssessmentTest) => {
  // Use the API key directly as per strict guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a professional psychological assessment report for the following patient:
    
    PATIENT PROFILE:
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    
    CLINICAL INPUT:
    1. Assessment Tool Used: ${test}
    2. Raw Data/Scores/Details: ${patient.testScores || "Observation only"}
    3. Reason for Referral: ${patient.referralReason || "General assessment"}
    4. Clinical Observations: ${patient.clinicalObservations || "No specific observations provided"}

    INSTRUCTIONS:
    - Analyze the data points carefully.
    - If specific IQ or scale scores are provided, interpret them according to standard psychological benchmarks.
    - Provide a concise executive summary.
    - Provide a full detailed report using professional medical terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class senior clinical neuropsychologist. Your task is to produce highly accurate, professional, and ethical laboratory reports in JSON format. Use Markdown for the long-form report text.",
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A 2-3 sentence high-level summary of the findings.",
            },
            fullReport: {
              type: Type.STRING,
              description: "The comprehensive report in Markdown format with standard headers (Findings, Interpretation, Recommendations).",
            },
          },
          required: ["summary", "fullReport"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("The model did not return a valid text response. This might be due to safety filters or a connection issue.");
    }

    return JSON.parse(text);
  } catch (error) {
    // Log details for the developer but throw a clean error for the UI
    console.error("Gemini API Error:", error);
    throw error;
  }
};

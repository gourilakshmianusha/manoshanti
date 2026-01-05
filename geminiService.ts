
import { GoogleGenAI, Type } from "@google/genai";
import { PatientDetails, AssessmentTest } from "./types";

export const generateReport = async (patient: PatientDetails, test: AssessmentTest) => {
  // Initialize strictly with the environment-provided API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a professional psychological assessment report for the following patient:
    
    PATIENT PROFILE:
    Name: ${patient.name}
    Age: ${patient.age}
    Gender: ${patient.gender}
    
    CLINICAL INPUT:
    1. Assessment Tool Used: ${test}
    2. Raw Data/Scores/Details: ${patient.testScores || "Clinical observation only"}
    3. Reason for Referral: ${patient.referralReason || "Diagnostic evaluation"}
    4. Clinical Observations: ${patient.clinicalObservations || "Standard clinical presentation"}

    INSTRUCTIONS:
    - Act as a senior clinical neuropsychologist.
    - Provide a formal laboratory report.
    - If raw scores are provided, interpret them using standard psychometric benchmarks.
    - Use Markdown for formatting the long-form report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior clinical neuropsychologist producing high-fidelity laboratory reports in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A professional 2-3 sentence overview of findings.",
            },
            fullReport: {
              type: Type.STRING,
              description: "Detailed Markdown report with standard clinical sections.",
            },
          },
          required: ["summary", "fullReport"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

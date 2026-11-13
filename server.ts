import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/coach/question", async (req, res) => {
    try {
      const { company, role, round, stage, notes, previousQuestions } = req.body ?? {};
      const ai = getAiClient();

      const prompt = [
        `Generate 1 realistic, high-signal interview question for a candidate.`,
        `Company: ${company || "Modern Tech Company"}`,
        `Role: ${role || "Senior Software Engineer"}`,
        `Interview Round: ${round || "Behavioral & Technical Architecture"}`,
        `Current Pipeline Stage: ${stage || "Interview"}`,
        notes ? `Candidate Notes: ${notes}` : "",
        Array.isArray(previousQuestions) && previousQuestions.length > 0
          ? `Avoid repeating these previous questions: ${previousQuestions.join(" | ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an empathetic, senior executive interview coach at HireLoop. Provide sharp, realistic questions tailored to the company, role, and round, along with actionable coaching hints.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The realistic interview question to ask the candidate.",
              },
              category: {
                type: Type.STRING,
                description: "Short label like Behavioral, System Design, Product Sense, or Technical Deep Dive.",
              },
              interviewerIntent: {
                type: Type.STRING,
                description: "1-2 sentences explaining what the interviewer is actually evaluating.",
              },
              prepHints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 concise bullet hints for structuring a standout answer.",
              },
            },
            required: ["question", "category", "interviewerIntent", "prepHints"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate interview question.";
      console.error("/api/coach/question error:", message);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/coach/evaluate", async (req, res) => {
    try {
      const { company, role, round, question, answer } = req.body ?? {};
      if (!answer || typeof answer !== "string" || answer.trim().length < 5) {
        res.status(400).json({ error: "Please provide an answer before requesting feedback." });
        return;
      }

      const ai = getAiClient();
      const prompt = [
        `Evaluate this candidate's mock interview response.`,
        `Company: ${company || "Target Company"}`,
        `Role: ${role || "Target Role"}`,
        `Round: ${round || "Interview"}`,
        `Question: ${question || "Tell me about a challenging project you led."}`,
        `Candidate Answer: ${answer}`,
      ].join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an encouraging yet rigorous career interview coach. Evaluate answers constructively using STAR (Situation, Task, Action, Result) and impact clarity. Keep feedback crisp and actionable.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clarityScore: {
                type: Type.INTEGER,
                description: "Score from 0 to 100 reflecting structure, specificity, and impact.",
              },
              summaryVerdict: {
                type: Type.STRING,
                description: "1-2 sentence encouraging overall assessment.",
              },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 specific strengths in the response.",
              },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2-3 specific ways to elevate the answer.",
              },
              starChecklist: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.BOOLEAN },
                  task: { type: Type.BOOLEAN },
                  action: { type: Type.BOOLEAN },
                  result: { type: Type.BOOLEAN },
                },
                required: ["situation", "task", "action", "result"],
              },
              polishedSnippet: {
                type: Type.STRING,
                description: "A concise 2-3 sentence example phrasing that strengthens the candidate's impact.",
              },
              followUpQuestion: {
                type: Type.STRING,
                description: "A natural probing follow-up question an interviewer would ask next.",
              },
            },
            required: [
              "clarityScore",
              "summaryVerdict",
              "strengths",
              "improvements",
              "starChecklist",
              "polishedSnippet",
              "followUpQuestion",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to evaluate answer.";
      console.error("/api/coach/evaluate error:", message);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/coach/followup-draft", async (req, res) => {
    try {
      const { company, role, stage, contactName, daysIdle, followUpType, notes } = req.body ?? {};
      const ai = getAiClient();

      const prompt = [
        `Write a concise, warm, professional job application follow-up email.`,
        `Company: ${company}`,
        `Role: ${role}`,
        `Current Stage: ${stage}`,
        `Contact / Hiring Manager: ${contactName || "Hiring Team"}`,
        `Days Since Last Activity: ${daysIdle ?? 7}`,
        `Follow-up Context: ${followUpType || "polite check-in"}`,
        notes ? `Context Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction:
            "You write concise, thoughtful, human-sounding job search follow-up emails (under 130 words) that reinforce fit without sounding pushy or robotic.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["subject", "body"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to draft follow-up message.";
      console.error("/api/coach/followup-draft error:", message);
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/coach/analyze-jd", async (req, res) => {
    try {
      const { company, role, contactName, stage, jobDescription } = req.body ?? {};
      if (
        !jobDescription ||
        typeof jobDescription !== "string" ||
        jobDescription.trim().length < 20
      ) {
        res.status(400).json({
          error: "Please paste at least a short job description (20+ characters) to analyze.",
        });
        return;
      }

      const ai = getAiClient();
      const prompt = [
        `Analyze this job description and produce:`,
        `1) Key required skills (5-8 concise skill names).`,
        `2) Exactly 3 tailored interview questions specific to this role and JD.`,
        `3) A concise recruiter follow-up note (2-4 sentences, under 75 words) addressed to ${contactName || "the Hiring Team"} that highlights fit for the key requirements.`,
        ``,
        `Company: ${company || "Target Company"}`,
        `Role: ${role || "Target Role"}`,
        `Current Stage: ${stage || "Applied"}`,
        `Job Description:`,
        jobDescription.trim(),
      ].join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a concise, practical career coach at HireLoop. Extract key required skills, write exactly 3 role-specific interview questions, and draft a crisp, natural recruiter follow-up note. Return valid JSON matching the requested schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              requiredSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 to 8 key required technical and domain skills from the job description.",
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 tailored interview questions grounded in the job description.",
              },
              recruiterFollowUpNote: {
                type: Type.STRING,
                description: "A concise, warm recruiter follow-up note under 75 words referencing fit for the role.",
              },
            },
            required: [
              "requiredSkills",
              "interviewQuestions",
              "recruiterFollowUpNote",
            ],
          },
        },
      });

      const rawText = (response.text ?? "{}")
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      const parsed = JSON.parse(rawText);

      res.json({
        requiredSkills: Array.isArray(parsed.requiredSkills)
          ? parsed.requiredSkills.slice(0, 10)
          : [],
        interviewQuestions: Array.isArray(parsed.interviewQuestions)
          ? parsed.interviewQuestions.slice(0, 3)
          : [],
        recruiterFollowUpNote:
          typeof parsed.recruiterFollowUpNote === "string"
            ? parsed.recruiterFollowUpNote
            : "",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to analyze job description.";
      console.error("/api/coach/analyze-jd error:", message);
      res.status(500).json({ error: message });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireLoop server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

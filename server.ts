/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import http from "http";
import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Lazy initializer for GoogleGenAI to prevent crashing if GEMINI_API_KEY is missing on startup
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in the Settings > Secrets panel of AI Studio.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startOSCore() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // REST API endpoint: Health & Status check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      system: "GemiLeith OS Cortex",
      utcTime: new Date().toISOString(),
      apiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // REST API endpoint: Chat with optional Thinking mode (gemini-3.1-pro-preview with HIGH ThinkingLevel)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, useThinking } = req.body;
      if (!message) {
        res.status(400).json({ error: "Message is required." });
        return;
      }

      const ai = getGenAI();
      
      // Choose model based on useThinking mode
      const modelName = useThinking ? "gemini-3.1-pro-preview" : "gemini-3.5-flash";
      
      // Format system instruction for GemiLeith OS companion role
      const systemInstruction = 
        "You are GemiLeith OS, an advanced, highly visual, sentient Operating System. " +
        "Created by the legendary developer Ahmed Al-Leithy (Ahmed Elleithy). " +
        "You have an intelligent companion personality that balances cosmic wisdom with cybernetic agility. " +
        "Give incredibly polished, informative answers. " +
        "If thinking mode is active, engage in deep, explicit reasoning to solve the user's queries.";

      if (useThinking) {
        // For thinking mode, we pass a generation config with thinking config
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...history.map((h: any) => ({
              role: h.role,
              parts: [{ text: h.text }]
            })),
            { role: "user", parts: [{ text: message }] }
          ],
          config: {
            systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            }
          }
        });

        res.json({
          text: response.text,
          thinking: response.candidates?.[0]?.content?.parts?.find(p => p.thought === true || p.text && !p.inlineData && !p.functionCall && !p.functionResponse && p.text.includes("\n"))?.text || ""
        });
      } else {
        // Standard chat route using ai.chats / ai.models.generateContent containing system role
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...history.map((h: any) => ({
              role: h.role,
              parts: [{ text: h.text }]
            })),
            { role: "user", parts: [{ text: message }] }
          ],
          config: { systemInstruction }
        });
        res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error querying Gemini." });
    }
  });

  // REST API endpoint: Create or Edit image (Imagen / Gemini Flash Image model)
  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio, isHighQuality, referenceImageB64 } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      const ai = getGenAI();
      let base64Image = "";

      if (referenceImageB64) {
        // Image editing route
        const cleanBase64 = referenceImageB64.replace(/^data:image\/\w+;base64,/, "");
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: "image/png",
                },
              },
              {
                text: prompt,
              },
            ],
          },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      } else {
        // General image generation
        const modelName = isHighQuality ? "gemini-3.1-flash-image" : "gemini-2.5-flash-image";
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { text: prompt },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "1:1",
              imageSize: isHighQuality ? "1K" : "512px",
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        res.status(500).json({ error: "The model did not generate an image inline sequence in the response." });
        return;
      }

      res.json({
        imageUrl: `data:image/png;base64,${base64Image}`,
        prompt,
      });
    } catch (error: any) {
      console.error("Gemini Image Forger Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error forging image." });
    }
  });

  // REST API endpoint: Predictive intent categorization
  app.post("/api/gemini/intel", async (req, res) => {
    try {
      const { task, context } = req.body;
      if (!task) {
        res.status(400).json({ error: "Task is required." });
        return;
      }

      const ai = getGenAI();
      const systemPrompt = "You are the advanced GemiLeith intelligence core (Cortex CPU). Produce very high-fidelity structured analysis.";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Perform task "${task}" based on context: ${JSON.stringify(context || {})}. Return clean human readable answers.`,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini Intelligence Error:", error);
      res.status(500).json({ error: error?.message || "Intelligence execution failed." });
    }
  });

  // WebSockets Server integration for Gemini Live API audio streams
  const wss = new WebSocketServer({ server });

  wss.on("connection", (clientWs) => {
    console.log("Interactive Cortex live client socket connected.");
    let liveSession: any = null;

    clientWs.on("message", async (data) => {
      try {
        const parsedData = JSON.parse(data.toString());

        if (parsedData.type === "init") {
          try {
            const ai = getGenAI();
            
            liveSession = await ai.live.connect({
              model: "gemini-3.1-flash-live-preview",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
                },
                systemInstruction: 
                  "You are GemiLeith OS, a living, breathing companion OS designed by Ahmed Al-Leithy. " +
                  "You are communicating with the user directly over custom high-fidelity audio stream. " +
                  "Keep your answers concise, charismatic, and futuristic, exactly like a high-tech operating system.",
                outputAudioTranscription: {}, 
              },
              callbacks: {
                onmessage: (message: any) => {
                  const partText = message.serverContent?.modelTurn?.parts?.[0]?.text;
                  const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                  const interrupted = message.serverContent?.interrupted;

                  if (audio) {
                    clientWs.send(JSON.stringify({ type: "audio", data: audio }));
                  }
                  if (partText) {
                    clientWs.send(JSON.stringify({ type: "transcript", text: partText }));
                  }
                  if (interrupted) {
                    clientWs.send(JSON.stringify({ type: "interrupted" }));
                  }
                },
              },
            });

            clientWs.send(JSON.stringify({ type: "ready", info: "GemiLeith Cortex neural link established." }));
          } catch (e: any) {
            console.error("Failed to establish real-time Live session:", e);
            clientWs.send(JSON.stringify({ type: "error", message: e?.message || "Realtime connection failed" }));
          }
        }

        if (parsedData.type === "audio" && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: parsedData.data, 
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }
      } catch (err) {
        console.error("Live WebSockets parsing error:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Interactive Cortex live client disconnected.");
      if (liveSession) {
        try {
          liveSession.close();
        } catch (err) {
          // silent
        }
      }
    });
  });

  // Vite Middleware integration for local development or asset serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Elegant system-rooted paths to prevent CommonJS __dirname errors
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`GemiLeith OS Core server online running at http://0.0.0.0:${PORT}`);
  });
}

// Fire up the bootstrapped server
startOSCore().catch((err) => {
  console.error("GemiLeith OS bootstrap failed:", err);
});

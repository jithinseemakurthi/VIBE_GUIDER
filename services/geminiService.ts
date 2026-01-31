import { GoogleGenAI } from "@google/genai";
import { GroundingMetadata, Attachment } from "../types";

// Initialize the client strictly with process.env.API_KEY
// Use a safe initialization pattern to prevent top-level crashes
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.error("API_KEY is missing! application will fail to generate responses.");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to construct content parts with optional attachment
const buildContents = (prompt: string, attachment?: Attachment) => {
  const parts: any[] = [];
  
  if (attachment) {
    if (attachment.type === 'image' || attachment.type === 'video') {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.content
        }
      });
    } else if (attachment.type === 'text') {
      // Inject text file content directly into the prompt context
      parts.push({
        text: `[Attached File: ${attachment.name}]\n${attachment.content}\n\n`
      });
    }
  }
  
  parts.push({ text: prompt });
  return { parts };
};

/**
 * Fast Response using gemini-flash-lite-latest
 * Supports Chat History
 */
export const generateFastResponse = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  message: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    if (!ai) throw new Error("AI Client not initialized (Missing API Key)");
    const chat = ai.chats.create({
      model: 'gemini-flash-lite-latest',
      history: history,
    });
    const messageContent = buildContents(message, attachment);
    const response = await chat.sendMessage({ message: messageContent.parts });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Fast Response Error:", error);
    throw error;
  }
};

/**
 * General Chat using gemini-3-pro-preview
 * Supports Chat History
 */
export const generateChatResponse = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  message: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    if (!ai) throw new Error("AI Client not initialized (Missing API Key)");
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
    });
    
    // Construct the message parts
    const messageContent = buildContents(message, attachment);
    
    const response = await chat.sendMessage({ message: messageContent.parts });
    return response.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

/**
 * Search Grounding using gemini-3-flash-preview
 * Supports Chat History & Google Search Tool
 */
export const generateGroundedResponse = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  message: string,
  attachment?: Attachment
): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  try {
    if (!ai) throw new Error("AI Client not initialized (Missing API Key)");
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const messageContent = buildContents(message, attachment);
    const response = await chat.sendMessage({ message: messageContent.parts });

    return {
      text: response.text || "",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined,
    };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

/**
 * Deep Thinking using gemini-3-pro-preview
 * Supports Chat History & Thinking Budget
 */
export const generateThinkingResponse = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[],
  message: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    if (!ai) throw new Error("AI Client not initialized (Missing API Key)");
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max for 3 Pro
      },
    });
    const messageContent = buildContents(message, attachment);
    const response = await chat.sendMessage({ message: messageContent.parts });
    return response.text || "";
  } catch (error) {
    console.error("Thinking Error:", error);
    throw error;
  }
};

/**
 * Video Understanding using gemini-3-pro-preview
 * (Kept for standalone VideoAnalyzer compatibility)
 */
export const analyzeVideoContent = async (
  prompt: string,
  base64Data: string,
  mimeType: string
): Promise<string> => {
  try {
    if (!ai) throw new Error("AI Client not initialized (Missing API Key)");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt || "Describe this video in detail.",
            },
          ],
        }
      ],
    });
    return response.text || "";
  } catch (error) {
    console.error("Video Analysis Error:", error);
    throw error;
  }
};
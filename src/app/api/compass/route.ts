import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/compass-context";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

type Message = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { message, history } = (await req.json()) as {
    message: string;
    history: Message[];
  };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  // Convert history to Gemini format
  const geminiHistory = history.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const chat = model.startChat({ history: geminiHistory });

  const result = await chat.sendMessageStream(message);

  // Stream the response as plain text
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

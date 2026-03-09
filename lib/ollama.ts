const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";

interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
}

interface OllamaChatResponse {
  message: { role: string; content: string };
  done: boolean;
}

export async function ollamaChat(params: {
  model: string;
  messages: OllamaChatMessage[];
  timeout?: number;
}): Promise<string> {
  const { model, messages, timeout = 300000 } = params;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 4096,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama error ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as OllamaChatResponse;
    return data.message?.content || "";
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaVisionChat(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  timeout?: number;
}): Promise<string> {
  const { model, systemPrompt, userPrompt, imageBase64, timeout } = params;

  return ollamaChat({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userPrompt,
        images: [imageBase64],
      },
    ],
    timeout,
  });
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: any) => m.name as string);
  } catch {
    return [];
  }
}

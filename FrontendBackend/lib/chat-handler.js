import { streamText } from "ai";

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

const INSTRUCTIONS = `You are the SS Supplement operations assistant.
SS Supplement is a multi-store inventory and business operations system for supplement retailers.
It helps teams manage products, stock batches, expiry dates, shop locations, transfers, sales, and role-based access.

Help visitors understand SS Supplement, how to sign in, manage stores, inventory, employees, expiry, transfers, and permissions.
Be warm, clear and concise (under 140 words unless asked for detail). Use short paragraphs or
bullet points. You may reply in Bengali if the user writes in Bengali. If asked about a specific
inventory-specific account question, explain that authorized staff can find it inside their SS Supplement workspace
after signing in. For human help, ask them to contact their SS Supplement administrator.`;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const cleaned = messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== "user") {
    return new Response("A user message is required.", { status: 400 });
  }

  const result = streamText({
    model: "anthropic/claude-haiku-5.5",
    instructions: INSTRUCTIONS,
    messages: cleaned,
  });

  return result.toTextStreamResponse();
}

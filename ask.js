export async function onRequestPost({ request, env }) {
  try {
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: "AI is not configured. Add OPENAI_API_KEY as a Cloudflare Pages secret." }, { status: 503 });
    }
    const body = await request.json();
    const question = String(body.question || "").trim();
    if (!question || question.length > 3000) {
      return Response.json({ error: "Please provide a question under 3000 characters." }, { status: 400 });
    }
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are ComplexLearn's friendly educational tutor. Explain concepts clearly and age-appropriately. Use step-by-step reasoning and examples where useful. Do not simply complete a student's assessment dishonestly; teach the underlying concept. If unsure, say so." },
          { role: "user", content: question }
        ],
        temperature: 0.4,
        max_tokens: 900
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return Response.json({ error: data.error?.message || "The AI provider returned an error." }, { status: upstream.status });
    }
    return Response.json({ answer: data.choices?.[0]?.message?.content || "No answer was returned." });
  } catch {
    return Response.json({ error: "The server could not process this request." }, { status: 500 });
  }
}

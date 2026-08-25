require('dotenv').config();

async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "hello" }],
        max_tokens: 10
      })
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error("OpenAI error:", err);
    } else {
      const data = await resp.json();
      console.log("OpenAI success:", data.choices?.[0]?.message?.content);
    }
  } catch(e) {
    console.error("OpenAI fetch exception", e);
  }
}
testOpenAI();

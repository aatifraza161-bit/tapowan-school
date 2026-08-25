require('dotenv').config();

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  const models = [
    "deepseek/deepseek-chat",
    "meta-llama/llama-3.3-70b-instruct:free"
  ];

  for (const model of models) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "hello" }],
          max_tokens: 10
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error(`OpenRouter ${model} error:`, errData);
      } else {
        const data = await resp.json();
        console.log(`OpenRouter ${model} success:`, data.choices?.[0]?.message?.content);
      }
    } catch (e) {
      console.error(`OpenRouter ${model} fetch error:`, e);
    }
  }
}
testOpenRouter();

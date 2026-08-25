require('dotenv').config({path: '.env'});
async function test() {
    const prompt = `Generate a 5-question multiple choice educational quiz for Grade/Class 10 students.
Format the output STRICTLY as a JSON array of objects.
Each object must have:
- "question_text": The question string
- "options": An array of exactly 4 possible answer strings
- "correct_answer_index": The integer index (0-3) of the correct option.
Do not wrap in markdown, return ONLY the raw JSON array. Do not add any conversational text.
Ensure questions are age-appropriate. Mix subjects like Math, Science, and General Knowledge.`;

    let models = [];
    try {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        const d = await res.json();
        models = d.data
            .filter(m => m.pricing.prompt === "0" && m.pricing.completion === "0")
            .map(m => m.id);
    } catch(e) {
        models = ['google/gemma-2-9b-it:free']; // Fallback
    }

    let data = null;
    for (const model of models) {
        console.log(`Trying model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const json = await response.json();
        if (json.error) {
            console.log(`Error with ${model}:`, json.error.message);
            continue; // Try next model
        }
        data = json;
        break; // Success!
    }

    if (!data) {
        throw new Error("All free models failed.");
    }

    // console.log("Raw Response Data:", JSON.stringify(data, null, 2));
    let jsonStr = data.choices[0].message.content;
    const match = jsonStr.match(/\[.*\]/s);
    if (match) {
        jsonStr = match[0];
    }
    
    console.log("JSON Output:", jsonStr);
    try {
        const questions = JSON.parse(jsonStr);
        console.log("Parsed", questions.length, "questions");
    } catch (e) {
        console.error("Parse Error:", e.message);
    }
}
test();

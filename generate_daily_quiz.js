const { createClient } = require('@libsql/client');

const tursoClient = createClient({
  url: 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'
});

async function main() {
  console.log('--- Starting Manual Quiz Generator ---');
  
  // 1. Fetch OpenRouter Key
  const keyRes = await tursoClient.execute({ sql: 'SELECT value FROM settings WHERE key = ? LIMIT 1', args: ['OPENROUTER_API_KEY'] });
  const openRouterKey = keyRes.rows[0]?.value;
  
  if (!openRouterKey) {
    console.error('ERROR: OPENROUTER_API_KEY not found in settings table.');
    process.exit(1);
  }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // 2. Check if today is Sunday (Day 0). If so, wipe databases for weekly reset.
  const todayDate = new Date();
  const isSunday = todayDate.getDay() === 0;
  
  if (isSunday) {
    console.log('Today is Sunday! Performing weekly leaderboard and quiz reset...');
    await tursoClient.execute('DELETE FROM app_quiz_attempts');
    await tursoClient.execute('DELETE FROM app_quiz_questions');
    await tursoClient.execute('DELETE FROM app_quizzes');
    console.log('Weekly reset complete.');
  }

  const todayStr = todayDate.toISOString().split('T')[0];

  // 3. Fetch unique classes
  const classesRes = await tursoClient.execute("SELECT DISTINCT className FROM students WHERE className IS NOT NULL AND className != ''");
  const classes = classesRes.rows.map(r => r.className);
  
  console.log(`Found ${classes.length} classes:`, classes.join(', '));

  for (const className of classes) {
    console.log(`\n=> Generating quiz for Class ${className}...`);
    
    // Check if quiz already exists for today
    const existing = await tursoClient.execute({
      sql: 'SELECT id FROM app_quizzes WHERE date = ? AND class_name = ? LIMIT 1',
      args: [todayStr, className]
    });
    
    if (existing.rows.length > 0) {
      console.log(`   Quiz already exists for Class ${className} today. Skipping.`);
      continue;
    }

    try {
      // 4. Call OpenRouter
      const prompt = `You are a helpful AI that creates educational quizzes for Indian school students. 
Create exactly 10 multiple-choice questions for students in Class ${className}. 
The subjects should be a mix of Science, Math, General Knowledge, and English.
Return ONLY a raw JSON array. Do not include markdown blocks like \`\`\`json. 
Each object in the array must have the following keys:
- "question_text": The question string.
- "options": An array of exactly 4 string options.
- "correct_answer_index": The integer index (0-3) of the correct option.

Example:
[
  {
    "question_text": "What is the capital of India?",
    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    "correct_answer_index": 1
  }
]`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'nvidia/nemotron-nano-9b-v2:free',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500
        })
      });
      clearTimeout(timeoutId);

      const aiData = await aiResponse.json();
      if (!aiData.choices || !aiData.choices[0]) {
        throw new Error('OpenRouter API failed: ' + JSON.stringify(aiData));
      }
      let responseText = aiData.choices[0].message.content.trim();
      
      // Strip markdown code blocks if AI included them despite instructions
      if (responseText.startsWith('```json')) {
        responseText = responseText.substring(7);
      }
      if (responseText.startsWith('```')) {
        responseText = responseText.substring(3);
      }
      if (responseText.endsWith('```')) {
        responseText = responseText.substring(0, responseText.length - 3);
      }
      responseText = responseText.trim();

      const questions = JSON.parse(responseText);
      
      if (!Array.isArray(questions) || questions.length !== 10) {
         console.warn(`   AI returned ${questions.length} questions instead of 10. Proceeding anyway.`);
      }

      // 5. Insert into DB
      const insertQuizRes = await tursoClient.execute({
        sql: 'INSERT INTO app_quizzes (date, class_name) VALUES (?, ?)',
        args: [todayStr, className]
      });
      const quizId = Number(insertQuizRes.lastInsertRowid);

      for (const q of questions) {
        await tursoClient.execute({
          sql: 'INSERT INTO app_quiz_questions (quiz_id, question_text, options, correct_answer_index) VALUES (?, ?, ?, ?)',
          args: [
            quizId, 
            q.question_text || "Missing question?", 
            JSON.stringify(q.options || ["A", "B", "C", "D"]), 
            q.correct_answer_index ?? 0
          ]
        });
      }

      console.log(`   Successfully generated and saved ${questions.length} questions for Class ${className}.`);
      await sleep(2000); // rate limit protection

    } catch (e) {
      console.error(`   Failed to generate quiz for Class ${className}:`, e.message);
      await sleep(2000);
    }
  }

  console.log('\n--- Quiz Generation Complete ---');
}

main().catch(console.error);

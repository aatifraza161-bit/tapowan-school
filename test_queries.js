const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'
});

async function run() {
  const result = await client.execute(`SELECT admissionNo, className, fullName FROM students WHERE fullName LIKE '%CHANCHAL%' LIMIT 1`);
  console.log('student:', result.rows[0]);
  
  const today = new Date().toISOString().split('T')[0];
  
  // Insert a dummy quiz for this class if one doesn't exist
  if (result.rows.length > 0) {
    const student = result.rows[0];
    
    // Check for existing quiz
    const quizCheck = await client.execute({
      sql: 'SELECT * FROM app_quizzes WHERE date = ? AND class_name = ?',
      args: [today, student.className]
    });
    
    if (quizCheck.rows.length === 0) {
      const insertRes = await client.execute({
        sql: 'INSERT INTO app_quizzes (date, class_name) VALUES (?, ?)',
        args: [today, student.className]
      });
      const quizId = Number(insertRes.lastInsertRowid);
      
      // Insert some questions
      await client.execute({
        sql: 'INSERT INTO app_quiz_questions (quiz_id, question_text, options, correct_answer_index) VALUES (?, ?, ?, ?)',
        args: [quizId, 'What is the capital of India?', JSON.stringify(['New Delhi', 'Mumbai', 'Kolkata', 'Chennai']), 0]
      });
      await client.execute({
        sql: 'INSERT INTO app_quiz_questions (quiz_id, question_text, options, correct_answer_index) VALUES (?, ?, ?, ?)',
        args: [quizId, 'What is 5 + 7?', JSON.stringify(['10', '11', '12', '13']), 2]
      });
      
      console.log('Created dummy quiz for class', student.className);
    } else {
      console.log('Quiz already exists for today.');
    }
  }
}

run().catch(console.error);

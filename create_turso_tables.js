const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ'
});

async function run() {
  await client.execute(`CREATE TABLE IF NOT EXISTS app_failed_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, admission_no TEXT, student_name TEXT, class_name TEXT, amount TEXT, status TEXT, payId TEXT, error_message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  
  await client.execute(`CREATE TABLE IF NOT EXISTS app_online_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, admission_no TEXT, student_name TEXT, class_name TEXT, amount TEXT, status TEXT, payId TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  
  await client.execute(`CREATE TABLE IF NOT EXISTS app_quizzes (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, class_name TEXT);`);
  
  await client.execute(`CREATE TABLE IF NOT EXISTS app_quiz_questions (id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER, question_text TEXT, options TEXT, correct_answer_index INTEGER);`);
  
  await client.execute(`CREATE TABLE IF NOT EXISTS app_quiz_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER, student_admission_no TEXT, student_name TEXT, class_name TEXT, score INTEGER, total_questions INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`);
  
  console.log('Tables created successfully.');
}

run().catch(console.error);

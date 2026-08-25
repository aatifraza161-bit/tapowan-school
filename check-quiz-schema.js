const { db } = require('./server/db');

async function checkSchema() {
  try {
    const quizzesSchema = await db.execute("PRAGMA table_info(app_quizzes)");
    console.log("app_quizzes columns:", quizzesSchema.rows.map(r => r.name).join(', '));
    
    const questionsSchema = await db.execute("PRAGMA table_info(app_quiz_questions)");
    console.log("app_quiz_questions columns:", questionsSchema.rows.map(r => r.name).join(', '));
  } catch (err) {
    console.error("Schema check error:", err);
  }
}
checkSchema();

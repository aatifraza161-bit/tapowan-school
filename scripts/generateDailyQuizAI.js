const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@libsql/client');

const TURSO_URL = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.replace('libsql://', 'https://') : 'https://tapowan-im-aatif.aws-ap-northeast-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY1MTcyOTQsImlkIjoiMDE5ZmY0YWUtM2YwMS03YTYwLWI4NTgtMWQ4M2JlYjJkNzJkIiwia2lkIjoiblRLTmdsNnYyaFQ4LTlhT09uQV9JdERDc3BTdk9iejhSYzNuY0hSNUhOVSIsInJpZCI6ImZmMWI4YTE5LWFhZTgtNGM5MS1hNjFhLTlkMTY1NTQ1OTEyOCJ9.a-w2gyEauZrfLwqWAMh2QLqHmqOxIsziDu9WRBrCPmLaoZThvoDlPdW4VjQ6ST5hRYJj1E1R0sJELyNPg4zrBQ';

const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'OPENROUTER_API_KEY_PLACEHOLDER';

const SUBJECTS_LIST = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'];

const CLASS_TIERS = [
  {
    tierName: 'Pre-Primary',
    classes: ['Nursery-A', 'LKG-A', 'UKG-A'],
    gradeLevel: 'Kindergarten & Pre-Primary',
    subjects: {
      'Mathematics': 'Counting numbers 1-20, recognition of shapes (circle, square, triangle), big vs small, basic patterns',
      'Science': 'Animals (cat, dog, lion), fruits & vegetables, colors of nature, parts of body, sense organs',
      'English': 'Alphabet letters (A-Z), phonic sounds, simple 3-letter words (cat, dog, sun), rhyming words',
      'Social Science': 'Family members, school, helpers (doctor, teacher, driver), good manners, safety habits',
      'Hindi': 'स्वर और व्यंजन (अ-ह), सरल शब्द, रंग और फल-सब्जियों के नाम',
      'Computer Science': 'Parts of computer (Monitor, Mouse, Keyboard, CPU), simple technology basics'
    }
  },
  {
    tierName: 'Primary (1-2)',
    classes: ['I-A', 'II-A'],
    gradeLevel: 'Primary Grades 1-2',
    subjects: {
      'Mathematics': 'Addition & Subtraction up to 100, number names, place value, clock time, money coins',
      'Science': 'Living & non-living things, plant parts, animal habitats, weather, seasons, water cycle basics',
      'English': 'Nouns, verbs, singular/plural, simple tenses, opposite words, articles (a, an, the)',
      'Social Science': 'Neighborhood, festivals of India, transport means, cleanliness, environment care',
      'Hindi': 'मात्राएँ, लिंग, वचन, विलोम शब्द, सरल वाक्य रचना',
      'Computer Science': 'Desktop screen, typing letters on keyboard, paint program, rules for computer lab'
    }
  },
  {
    tierName: 'Junior (3-5)',
    classes: ['III-A', 'IV-A', 'V-A'],
    gradeLevel: 'Junior Grades 3-5',
    subjects: {
      'Mathematics': 'Multiplication, Division, Fractions, Perimeter & Area, Decimals, Measurement units (kg, m, l)',
      'Science': 'States of matter, human digestion, photosynthesis, skeleton & muscles, solar system, simple machines',
      'English': 'Adjectives, adverbs, prepositions, conjunctions, past/present/future tenses, vocabulary, comprehension',
      'Social Science': 'Physical features of India, Indian freedom heroes, map directions, pollution, local governance',
      'Hindi': 'संज्ञा, सर्वनाम, विशेषण, क्रिया, मुहावरे, पर्यायवाची और विलोम शब्द',
      'Computer Science': 'MS Word, folders & files, Internet safety, input & output devices, storage devices'
    }
  },
  {
    tierName: 'Middle (6-8)',
    classes: ['VI-A', 'VII-A', 'VIII-A'],
    gradeLevel: 'Middle Grades 6-8 CBSE',
    subjects: {
      'Mathematics': 'Integers, Rational numbers, Linear equations, Ratio & Proportion, Triangles, Exponents',
      'Science': 'Force & Pressure, Light, Electricity & Circuits, Cells & Microorganisms, Acids & Bases',
      'English': 'Active & Passive voice, Direct/Indirect speech, Complex tenses, Idioms, Subject-verb agreement',
      'Social Science': 'Mughal Empire, Freedom Movement, Resources & Agriculture, Indian Constitution & Judiciary',
      'Hindi': 'संधि, समास, उपसर्ग, प्रत्यय, काल, वाक्य भेद, मुहावरे और लोकोक्तियाँ',
      'Computer Science': 'MS Excel formulas, PowerPoint, HTML basics, Binary numbers, Cyber security, Flowcharts'
    }
  },
  {
    tierName: 'Secondary (9-10)',
    classes: ['IX-A', 'X-A'],
    gradeLevel: 'Secondary Grades 9-10 CBSE Board',
    subjects: {
      'Mathematics': 'Real numbers, Polynomials, Quadratic equations, Trigonometry, Coordinate geometry, Surface areas, Statistics',
      'Science': 'Chemical reactions & equations, Periodic classification, Light optics, Electricity & Magnetism, Heredity',
      'English': 'Advanced grammar, Error spotting, Cloze test, Modals, Determiners, Formal vocabulary',
      'Social Science': 'Nationalism in India, Federalism, Democratic politics, Sectors of Indian economy, Globalization',
      'Hindi': 'वाक्य रचना, पद परिचय, रस, अलंकार, मुहावरे, व्याकरण के नियम',
      'Computer Science': 'Python programming, Database concepts (SQL), Computer networks, AI basics, Cyber ethics'
    }
  }
];

function extractJson(text) {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.substring(7);
  else if (clean.startsWith('```')) clean = clean.substring(3);
  if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
  clean = clean.trim();
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBracket = clean.indexOf('{');
    const lastBracket = clean.lastIndexOf('}');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(clean.substring(firstBracket, lastBracket + 1));
      } catch (err) {}
    }
    const firstArr = clean.indexOf('[');
    const lastArr = clean.lastIndexOf(']');
    if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
      try {
        const arr = JSON.parse(clean.substring(firstArr, lastArr + 1));
        return { questions: arr };
      } catch (err) {}
    }
  }
  return null;
}

// Generate questions for a specific grade tier and subject using AI
async function generateTierQuestions(gradeLevel, subjectName, topicStr, isHindi) {
  const prompt = `You are an expert CBSE school teacher.
Generate 20 multiple choice questions (MCQs) for students of level "${gradeLevel}" for the subject "${subjectName}".
Topics: ${topicStr}.
Language: ${isHindi ? 'Hindi (Devanagari script)' : 'English'}.
Requirements:
1. Provide exactly 4 options per question.
2. Provide correct_answer_index (0 for A, 1 for B, 2 for C, 3 for D).
3. Provide a clear explanation.
Output ONLY strict JSON:
{
  "questions": [
    {
      "question_text": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "..."
    }
  ]
}`;

  const freeModels = [
    'openrouter/free',
    'google/gemma-4-26b-a4b-it:free',
    'openai/gpt-oss-20b:free',
    'z-ai/glm-5.2:free'
  ];

  for (const model of freeModels) {
    try {
      console.log(`🤖 Requesting AI (${model}) for [${gradeLevel}] - ${subjectName}...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(35000),
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tapowanpublicschool.com',
          'X-Title': 'Tapowan School Daily Quiz AI'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are a school quiz creator. Output JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.choices?.[0]?.message?.content;
        const parsed = extractJson(rawText);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 8) {
          console.log(`✅ Received ${parsed.questions.length} questions for [${gradeLevel}] - ${subjectName}!`);
          return parsed.questions.slice(0, 20);
        }
      }
    } catch (e) {
      console.warn(`Model ${model} timeout/error:`, e.message);
    }
  }
  return [];
}

// Save questions into Turso DB for a specific class & subject
async function saveClassSubjectQuestions(className, subjectName, questionsList) {
  if (!questionsList || questionsList.length === 0) return false;

  const todayStr = new Date().toISOString().slice(0, 10);

  try {
    let quizRes = await db.execute({
      sql: 'SELECT id FROM app_quizzes WHERE LOWER(subject) = LOWER(?) AND class_name = ? LIMIT 1',
      args: [subjectName, className]
    });

    let quizId = quizRes.rows[0]?.id;

    if (!quizId) {
      const insertQuiz = await db.execute({
        sql: 'INSERT INTO app_quizzes (date, class_name, subject) VALUES (?, ?, ?)',
        args: [todayStr, className, subjectName]
      });
      quizId = insertQuiz.lastInsertRowid;
    } else {
      await db.execute({
        sql: 'UPDATE app_quizzes SET date = ? WHERE id = ?',
        args: [todayStr, quizId]
      });
    }

    // Clear previous questions for this specific class quiz
    await db.execute({
      sql: 'DELETE FROM app_quiz_questions WHERE quiz_id = ?',
      args: [quizId]
    });

    // Insert questions
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      const opts = Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'];
      const correctIdx = typeof q.correct_answer_index === 'number' ? Math.min(3, Math.max(0, q.correct_answer_index)) : 0;
      const explanation = q.explanation || `Study ${subjectName} concepts to understand the solution.`;

      await db.execute({
        sql: `
          INSERT INTO app_quiz_questions 
          (quiz_id, question_text, options, correct_answer_index, explanation) 
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [quizId, q.question_text || `Question ${i + 1}`, JSON.stringify(opts), correctIdx, explanation]
      });
    }

    console.log(`🎉 [Class ${className}] Saved ${questionsList.length} questions for ${subjectName} in Turso DB (Quiz ID: ${quizId})!`);
    return true;
  } catch (err) {
    console.error(`Error saving questions for Class ${className} - ${subjectName}:`, err);
    return false;
  }
}

// Master Daily Generator: Runs across ALL Classes and ALL Subjects
async function runDailyQuizGeneration() {
  console.log('====================================================');
  console.log('🚀 RUNNING ONLINE DAILY AI QUIZ GENERATOR FOR EACH CLASS');
  console.log(`📅 Date: ${new Date().toISOString().slice(0, 10)}`);
  console.log('====================================================');

  const summary = {};

  for (const tier of CLASS_TIERS) {
    console.log(`\n🎓 === PROCESSING TIER: ${tier.tierName} (${tier.classes.join(', ')}) ===`);

    for (const subjectName of SUBJECTS_LIST) {
      const topicStr = tier.subjects[subjectName] || 'General school concepts';
      const isHindi = subjectName === 'Hindi';

      console.log(`\n📚 Generating questions for [${tier.tierName}] - ${subjectName}...`);
      const questions = await generateTierQuestions(tier.gradeLevel, subjectName, topicStr, isHindi);

      if (questions && questions.length > 0) {
        // Save these age-appropriate questions for EACH class in this tier
        for (const cls of tier.classes) {
          await saveClassSubjectQuestions(cls, subjectName, questions);
          summary[`${cls} - ${subjectName}`] = questions.length;
        }
      } else {
        console.warn(`⚠️ Skipped or failed generating questions for ${tier.tierName} - ${subjectName}`);
      }

      await new Promise(r => setTimeout(r, 800));
    }
  }

  console.log('\n====================================================');
  console.log('🏁 DAILY QUIZ GENERATION COMPLETE FOR ALL CLASSES!');
  console.log(summary);
  console.log('====================================================');
  return summary;
}

if (require.main === module) {
  runDailyQuizGeneration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { runDailyQuizGeneration, generateDailyQuizzes: runDailyQuizGeneration, CLASS_TIERS, SUBJECTS_LIST };

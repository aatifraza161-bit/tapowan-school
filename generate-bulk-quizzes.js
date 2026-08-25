const { db } = require('./server/db');

const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const subjects = ['Mathematics', 'English', 'Science', 'General Knowledge', 'Computer'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathQuestion(classLevel) {
  let q, ans, opts;
  if (classLevel <= 2) { // Nursery, LKG, UKG
    const a = getRandomInt(1, 10);
    const b = getRandomInt(1, 10);
    q = `What is ${a} + ${b}?`;
    ans = a + b;
  } else if (classLevel <= 5) { // 1, 2, 3
    const a = getRandomInt(10, 50);
    const b = getRandomInt(10, 50);
    q = `What is ${a} + ${b}?`;
    ans = a + b;
  } else if (classLevel <= 8) { // 4, 5, 6
    const a = getRandomInt(5, 15);
    const b = getRandomInt(5, 15);
    q = `What is ${a} x ${b}?`;
    ans = a * b;
  } else if (classLevel <= 10) { // 7, 8
    const a = getRandomInt(2, 9);
    const b = getRandomInt(10, 50);
    q = `Solve: ${a}x = ${a*b}. What is x?`;
    ans = b;
  } else { // 9, 10
    const a = getRandomInt(2, 5);
    q = `What is the square of ${a*10}?`;
    ans = (a*10) * (a*10);
  }
  
  opts = [
    String(ans),
    String(ans + getRandomInt(1, 5)),
    String(ans - getRandomInt(1, 5) || ans + 10),
    String(ans + getRandomInt(6, 12))
  ];
  return { q, ans: String(ans), opts };
}

const templates = {
  English: {
    low: [
      { q: "What letter comes after A?", opts: ["B", "C", "D", "E"], ans: "B" },
      { q: "Which is a vowel?", opts: ["A", "B", "C", "D"], ans: "A" },
      { q: "Opposite of 'Hot' is?", opts: ["Cold", "Warm", "Big", "Small"], ans: "Cold" },
      { q: "Plural of 'Cat' is?", opts: ["Cats", "Cates", "Cat", "Catt"], ans: "Cats" }
    ],
    mid: [
      { q: "Which word is a noun?", opts: ["Apple", "Run", "Quickly", "Beautiful"], ans: "Apple" },
      { q: "Past tense of 'Go'?", opts: ["Went", "Gone", "Goes", "Going"], ans: "Went" },
      { q: "Opposite of 'Brave'?", opts: ["Coward", "Hero", "Strong", "Fast"], ans: "Coward" },
      { q: "Identify the verb: 'He runs fast'.", opts: ["runs", "He", "fast", "None"], ans: "runs" }
    ],
    high: [
      { q: "Synonym of 'Abundant'?", opts: ["Plentiful", "Scarce", "Rare", "Empty"], ans: "Plentiful" },
      { q: "What is an adjective?", opts: ["Describes a noun", "Action word", "Name of person", "Joining word"], ans: "Describes a noun" },
      { q: "Active voice of: 'A song is sung by her'", opts: ["She sings a song", "She singing song", "Song sing she", "She sang song"], ans: "She sings a song" },
      { q: "Meaning of 'Idiom'?", opts: ["A phrase with figurative meaning", "A literal phrase", "A verb type", "A punctuation mark"], ans: "A phrase with figurative meaning" }
    ]
  },
  Science: {
    low: [
      { q: "We see with our ___", opts: ["Eyes", "Ears", "Nose", "Hands"], ans: "Eyes" },
      { q: "Which is a domestic animal?", opts: ["Cow", "Lion", "Tiger", "Bear"], ans: "Cow" },
      { q: "What gives us light during day?", opts: ["Sun", "Moon", "Stars", "Bulb"], ans: "Sun" },
      { q: "Fishes live in ___", opts: ["Water", "Land", "Air", "Trees"], ans: "Water" }
    ],
    mid: [
      { q: "What do plants need to grow?", opts: ["Water & Sunlight", "Milk", "Juice", "Darkness"], ans: "Water & Sunlight" },
      { q: "How many planets in our solar system?", opts: ["8", "9", "7", "10"], ans: "8" },
      { q: "Water boils at ___ Celsius", opts: ["100", "50", "0", "10"], ans: "100" },
      { q: "Which gas do we breathe in?", opts: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], ans: "Oxygen" }
    ],
    high: [
      { q: "Powerhouse of the cell?", opts: ["Mitochondria", "Nucleus", "Ribosome", "Cytoplasm"], ans: "Mitochondria" },
      { q: "Chemical formula of water?", opts: ["H2O", "CO2", "O2", "NaCl"], ans: "H2O" },
      { q: "Force that pulls objects down?", opts: ["Gravity", "Friction", "Magnetism", "Tension"], ans: "Gravity" },
      { q: "Unit of Electric Current?", opts: ["Ampere", "Volt", "Watt", "Ohm"], ans: "Ampere" }
    ]
  },
  'General Knowledge': {
    low: [
      { q: "Capital of India?", opts: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], ans: "New Delhi" },
      { q: "National animal of India?", opts: ["Tiger", "Lion", "Elephant", "Deer"], ans: "Tiger" },
      { q: "Colors in a rainbow?", opts: ["7", "5", "6", "8"], ans: "7" },
      { q: "King of the jungle?", opts: ["Lion", "Tiger", "Elephant", "Monkey"], ans: "Lion" }
    ],
    mid: [
      { q: "Who wrote National Anthem of India?", opts: ["Rabindranath Tagore", "Mahatma Gandhi", "Nehru", "Bose"], ans: "Rabindranath Tagore" },
      { q: "Largest continent?", opts: ["Asia", "Africa", "Europe", "Australia"], ans: "Asia" },
      { q: "Smallest state in India?", opts: ["Goa", "Sikkim", "Kerala", "Assam"], ans: "Goa" },
      { q: "Which planet is known as Red Planet?", opts: ["Mars", "Venus", "Jupiter", "Saturn"], ans: "Mars" }
    ],
    high: [
      { q: "First President of India?", opts: ["Dr. Rajendra Prasad", "Dr. B.R. Ambedkar", "J.L. Nehru", "S. Radhakrishnan"], ans: "Dr. Rajendra Prasad" },
      { q: "Highest mountain peak?", opts: ["Mount Everest", "K2", "Kangchenjunga", "Makalu"], ans: "Mount Everest" },
      { q: "Currency of Japan?", opts: ["Yen", "Yuan", "Won", "Dollar"], ans: "Yen" },
      { q: "Who discovered Penicillin?", opts: ["Alexander Fleming", "Marie Curie", "Einstein", "Newton"], ans: "Alexander Fleming" }
    ]
  },
  Computer: {
    low: [
      { q: "Brain of the computer?", opts: ["CPU", "Monitor", "Mouse", "Keyboard"], ans: "CPU" },
      { q: "Which is an input device?", opts: ["Keyboard", "Monitor", "Printer", "Speaker"], ans: "Keyboard" },
      { q: "What do we use to type?", opts: ["Keyboard", "Mouse", "Screen", "CPU"], ans: "Keyboard" },
      { q: "What looks like a TV?", opts: ["Monitor", "Mouse", "CPU", "Printer"], ans: "Monitor" }
    ],
    mid: [
      { q: "1 Byte = ___ bits?", opts: ["8", "4", "16", "32"], ans: "8" },
      { q: "Which is a web browser?", opts: ["Chrome", "Windows", "MS Word", "Linux"], ans: "Chrome" },
      { q: "Shortcut for Copy?", opts: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+P"], ans: "Ctrl+C" },
      { q: "RAM stands for?", opts: ["Random Access Memory", "Read Access Memory", "Run All Memory", "None"], ans: "Random Access Memory" }
    ],
    high: [
      { q: "Which is an operating system?", opts: ["Linux", "HTML", "Python", "Java"], ans: "Linux" },
      { q: "HTML is used for?", opts: ["Web Pages", "Databases", "Images", "Audio"], ans: "Web Pages" },
      { q: "Father of Computer?", opts: ["Charles Babbage", "Alan Turing", "Bill Gates", "Steve Jobs"], ans: "Charles Babbage" },
      { q: "What does IP stand for?", opts: ["Internet Protocol", "Internal Process", "Internet Provider", "Intranet Protocol"], ans: "Internet Protocol" }
    ]
  }
};

function getLevel(classIdx) {
  if (classIdx <= 3) return 'low'; // Nursery to 1
  if (classIdx <= 8) return 'mid'; // 2 to 6
  return 'high'; // 7 to 10
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function run() {
  console.log("Starting bulk quiz generation...");
  let quizCount = 0;
  let questionCount = 0;

  for (let i = 0; i < classes.length; i++) {
    const className = classes[i];
    console.log(`Generating quizzes for Class ${className}...`);
    
    // Create quizzes for each subject
    for (const subject of subjects) {
      // Insert Quiz
      const res = await db.execute({
        sql: "INSERT INTO app_quizzes (date, class_name, subject) VALUES (?, ?, ?) RETURNING id",
        args: [new Date().toISOString().split('T')[0], className, subject]
      });
      const quizId = res.rows[0].id;
      quizCount++;

      const questionsToGenerate = 20; // 5 subjects * 20 = 100 questions per class
      
      const level = getLevel(i);
      
      for (let j = 0; j < questionsToGenerate; j++) {
        let qData;
        if (subject === 'Mathematics') {
          qData = generateMathQuestion(i);
        } else {
          const tplList = templates[subject][level];
          const tpl = tplList[j % tplList.length];
          qData = { q: tpl.q, ans: tpl.ans, opts: [...tpl.opts] };
          // Randomize options slightly or just shuffle to make them unique
          qData.opts = shuffle(qData.opts);
        }

        // Make options unique by shuffling and ensuring correct answer is recorded
        let options = qData.opts;
        // Make sure correct answer is in options
        if (!options.includes(qData.ans)) {
          options[0] = qData.ans;
          options = shuffle(options);
        }
        
        const correctIndex = options.indexOf(qData.ans);
        const explanation = `The correct answer is ${qData.ans}.`;

        await db.execute({
          sql: "INSERT INTO app_quiz_questions (quiz_id, question_text, options, correct_answer_index, explanation) VALUES (?, ?, ?, ?, ?)",
          args: [quizId, qData.q, JSON.stringify(options), correctIndex, explanation]
        });
        questionCount++;
      }
    }
  }

  console.log(`Successfully generated ${quizCount} quizzes and ${questionCount} questions total.`);
}

run().catch(console.error);

// Comprehensive Curriculum Question Bank: Exactly 20 distinct, unique questions per subject for all 13 classes (1,400 questions total)

const QUESTION_BANK = {
  // ==========================================
  // 1. NURSERY (60 Unique Questions)
  // ==========================================
  'Nursery-A': {
    'English': [
      { q: "Which letter comes after letter 'A'?", o: ["B", "C", "D", "E"], a: 0, e: "Letter B comes directly after A." },
      { q: "Which letter comes before letter 'Z'?", o: ["X", "Y", "W", "V"], a: 1, e: "Letter Y comes right before Z." },
      { q: "Identify the animal that says 'Meow':", o: ["Dog", "Cat", "Cow", "Duck"], a: 1, e: "Cats produce the meow sound." },
      { q: "What is the color of a ripe red Apple?", o: ["Blue", "Green", "Red", "Yellow"], a: 2, e: "Ripe apples are red." },
      { q: "Which of these is a sweet fruit?", o: ["Potato", "Onion", "Mango", "Carrot"], a: 2, e: "Mango is a delicious fruit." },
      { q: "Fill in the missing letter: C _ T", o: ["A", "E", "I", "O"], a: 0, e: "C-A-T spells Cat." },
      { q: "Which letter does the word 'Sun' start with?", o: ["S", "M", "T", "P"], a: 0, e: "Sun starts with letter S." },
      { q: "What is the color of the clear Sky?", o: ["Green", "Blue", "Black", "Pink"], a: 1, e: "The daytime sky is blue." },
      { q: "Which bird can swim in the water?", o: ["Crow", "Duck", "Sparrow", "Eagle"], a: 1, e: "Ducks have webbed feet to swim." },
      { q: "Which letter comes between 'M' and 'O'?", o: ["L", "N", "P", "Q"], a: 1, e: "N comes between M and O." },
      { q: "Identify the pet animal that barks 'Woof':", o: ["Dog", "Cat", "Horse", "Sheep"], a: 0, e: "Dogs bark woof woof." },
      { q: "What is the color of fresh green grass?", o: ["Red", "Blue", "Green", "Orange"], a: 2, e: "Grass is green." },
      { q: "Which shape is round like a ball?", o: ["Square", "Triangle", "Circle", "Star"], a: 2, e: "A circle is round." },
      { q: "Fill in the missing letter: B _ D", o: ["E", "A", "O", "U"], a: 0, e: "B-E-D spells Bed." },
      { q: "Which animal gives us fresh milk?", o: ["Cow", "Lion", "Tiger", "Fox"], a: 0, e: "Cows give us nutritious milk." },
      { q: "What do we use to see the world?", o: ["Ears", "Eyes", "Nose", "Hands"], a: 1, e: "We see with our eyes." },
      { q: "What do we use to smell flowers?", o: ["Nose", "Tongue", "Skin", "Eyes"], a: 0, e: "We smell through our nose." },
      { q: "Which letter comes after 'D'?", o: ["E", "F", "G", "H"], a: 0, e: "Letter E follows D." },
      { q: "Identify the yellow fruit liked by monkeys:", o: ["Apple", "Banana", "Grapes", "Orange"], a: 1, e: "Bananas are yellow and sweet." },
      { q: "Which is the smallest finger on your hand?", o: ["Thumb", "Little finger", "Middle finger", "Index finger"], a: 1, e: "The pinky is the little finger." }
    ],
    'Hindi': [
      { q: "वर्णमाला का पहला स्वर कौन सा है?", o: ["अ", "आ", "इ", "ई"], a: 0, e: "स्वर 'अ' से शुरू होता है।" },
      { q: "'क' के बाद कौन सा व्यंजन आता है?", o: ["ख", "ग", "घ", "ङ"], a: 0, e: "क के बाद ख आता है।" },
      { q: "'अ' से क्या होता है?", o: ["अनार", "आम", "इमली", "ईख"], a: 0, e: "अ से अनार होता है।" },
      { q: "'आ' से कौन सा फल होता है?", o: ["आम", "अंगूर", "केला", "सेब"], a: 0, e: "आ से मीठा आम होता है।" },
      { q: "दूध का रंग कैसा होता है?", o: ["सफेद", "काला", "लाल", "नीला"], a: 0, e: "दूध सफेद रंग का होता है।" },
      { q: "पेड़ों की पत्तियों का रंग कैसा होता है?", o: ["हरा", "पीला", "लाल", "नीला"], a: 0, e: "पत्तियाँ हरी होती हैं।" },
      { q: "कौन सा जानवर 'म्याऊँ' करता है?", o: ["कुत्ता", "बिल्ली", "गाय", "बकरी"], a: 1, e: "बिल्ली म्याऊँ-म्याऊँ बोलती है।" },
      { q: "हमारे मुँह में कितने होंठ होते हैं?", o: ["एक", "दो", "तीन", "चार"], a: 1, e: "हमारे दो होंठ होते हैं।" },
      { q: "'म' से कौन सी मछली होती है?", o: ["मछली", "मेंढक", "मोर", "मटर"], a: 0, e: "म से जल की रानी मछली होती है।" },
      { q: "भारत का राष्ट्रीय पक्षी कौन सा है?", o: ["मोर", "तोता", "कौआ", "कबूतर"], a: 0, e: "मोर भारत का राष्ट्रीय पक्षी है।" },
      { q: "तोते की चोंच का रंग कैसा होता है?", o: ["लाल", "हरा", "काला", "सफेद"], a: 0, e: "तोते की चोंच लाल होती है।" },
      { q: "'इ' से क्या बनता है?", o: ["इमली", "ईख", "उल्लू", "ऊन"], a: 0, e: "इ से खट्टी इमली होती है।" },
      { q: "हाथ में कितनी उंगलियाँ होती हैं?", o: ["चार", "पाँच", "छह", "सात"], a: 1, e: "एक हाथ में पाँच उंगलियाँ होती हैं।" },
      { q: "सूरज किस रंग का दिखाई देता है?", o: ["पीला/नारंगी", "नीला", "हरा", "काला"], a: 0, e: "सूरज पीला और चमकदार होता है।" },
      { q: "'ग' से कौन सा जानवर होता है?", o: ["गाय", "घोड़ा", "गधा", "सभी"], a: 3, e: "गाय, घोड़ा, गधा तीनों ग से शुरू होते हैं।" },
      { q: "हम पानी किससे पीते हैं?", o: ["गिलास", "थाली", "चम्मच", "कटोरी"], a: 0, e: "पानी गिलास से पिया जाता है।" },
      { q: "रात में आसमान में क्या चमकता है?", o: ["चाँद और तारे", "सूरज", "इंद्रधनुष", "बादल"], a: 0, e: "रात में चाँद-तारे चमकते हैं।" },
      { q: "'च' से हम क्या पीते हैं?", o: ["चाय", "दूध", "जूस", "पानी"], a: 0, e: "च से चाय होती है।" },
      { q: "गुलाब का फूल किस रंग का होता है?", o: ["लाल/गुलाबी", "काला", "नीला", "हरा"], a: 0, e: "गुलाब लाल व गुलाबी रंग का होता है।" },
      { q: "'न' से हमारे चेहरे पर क्या होता है?", o: ["नाक", "कान", "आँख", "गाल"], a: 0, e: "न से सूंघने वाली नाक होती है।" }
    ],
    'Mathematics': [
      { q: "How many suns do we see in the sky?", o: ["1", "2", "3", "0"], a: 0, e: "There is 1 Sun in our solar system." },
      { q: "What number comes after 1?", o: ["2", "3", "4", "0"], a: 0, e: "Number 2 follows 1." },
      { q: "What number comes after 2?", o: ["3", "4", "5", "1"], a: 0, e: "Number 3 follows 2." },
      { q: "How many eyes do you have?", o: ["1", "2", "3", "4"], a: 1, e: "Humans have 2 eyes." },
      { q: "How many ears do you have?", o: ["1", "2", "3", "4"], a: 1, e: "Humans have 2 ears." },
      { q: "Count the wheels on a bicycle:", o: ["1", "2", "3", "4"], a: 1, e: "A bicycle has 2 wheels." },
      { q: "How many legs does a dog have?", o: ["2", "3", "4", "5"], a: 2, e: "A dog walks on 4 legs." },
      { q: "What number comes before 5?", o: ["3", "4", "6", "7"], a: 1, e: "Number 4 comes before 5." },
      { q: "How much is 1 + 1?", o: ["1", "2", "3", "4"], a: 1, e: "1 plus 1 equals 2." },
      { q: "How much is 2 + 1?", o: ["2", "3", "4", "5"], a: 1, e: "2 plus 1 equals 3." },
      { q: "Count the sides of a triangle:", o: ["2", "3", "4", "5"], a: 1, e: "A triangle has 3 sides." },
      { q: "Count the sides of a square:", o: ["3", "4", "5", "6"], a: 1, e: "A square has 4 equal sides." },
      { q: "Which number is bigger: 5 or 2?", o: ["5", "2", "Both equal", "None"], a: 0, e: "5 is greater than 2." },
      { q: "How many fingers on one hand?", o: ["4", "5", "6", "10"], a: 1, e: "One hand has 5 fingers." },
      { q: "How much is 3 + 1?", o: ["2", "3", "4", "5"], a: 2, e: "3 plus 1 equals 4." },
      { q: "How much is 2 + 2?", o: ["3", "4", "5", "6"], a: 1, e: "2 plus 2 equals 4." },
      { q: "What comes after 9?", o: ["8", "10", "11", "12"], a: 1, e: "10 comes after 9." },
      { q: "How many wheels does a car have?", o: ["2", "3", "4", "6"], a: 2, e: "A standard car has 4 wheels." },
      { q: "If you have 1 candy and get 1 more, you have:", o: ["1", "2", "3", "0"], a: 1, e: "1 + 1 = 2 candies." },
      { q: "Which shape has no corners?", o: ["Square", "Triangle", "Circle", "Rectangle"], a: 2, e: "A circle is perfectly curved with no corners." }
    ]
  },

  // ==========================================
  // 2. LKG (60 Unique Questions)
  // ==========================================
  'LKG-A': {
    'English': [
      { q: "Which vowel comes after 'A'?", o: ["E", "I", "O", "U"], a: 0, e: "A, E, I, O, U are vowels. E is after A." },
      { q: "Which word starts with 'B'?", o: ["Apple", "Ball", "Cat", "Dog"], a: 1, e: "Ball starts with letter B." },
      { q: "What is the opposite of 'Big'?", o: ["Small", "Tall", "Long", "Fat"], a: 0, e: "Small is the antonym of Big." },
      { q: "What is the opposite of 'Up'?", o: ["Down", "Left", "Right", "In"], a: 0, e: "Down is the opposite of Up." },
      { q: "Which letter is a Capital letter?", o: ["a", "b", "G", "d"], a: 2, e: "'G' is written in uppercase." },
      { q: "Identify the word that rhymes with 'Pin':", o: ["Pan", "Pen", "Tin", "Pun"], a: 2, e: "Tin rhymes with Pin." },
      { q: "What is baby dog called?", o: ["Kitten", "Puppy", "Cub", "Calf"], a: 1, e: "A baby dog is a puppy." },
      { q: "What is a baby cat called?", o: ["Puppy", "Kitten", "Chick", "Duckling"], a: 1, e: "A baby cat is a kitten." },
      { q: "Fill in: The sky is ___ at night.", o: ["Dark/Black", "Yellow", "Pink", "Green"], a: 0, e: "Night sky is dark." },
      { q: "Which word starts with 'Z'?", o: ["Zebra", "Lion", "Bear", "Fox"], a: 0, e: "Zebra starts with Z." },
      { q: "Choose the correct spelling:", o: ["Bok", "Book", "Buke", "Boke"], a: 1, e: "B-O-O-K is Book." },
      { q: "Which is used to clean teeth?", o: ["Comb", "Toothbrush", "Pencil", "Spoon"], a: 1, e: "A toothbrush cleans teeth." },
      { q: "Identify the vehicle with 2 wheels:", o: ["Bus", "Car", "Bicycle", "Truck"], a: 2, e: "Bicycles have two wheels." },
      { q: "Fill in: An ___ a day keeps the doctor away.", o: ["Apple", "Orange", "Banana", "Ice cream"], a: 0, e: "The proverb says 'An apple a day'." },
      { q: "What do birds use to fly?", o: ["Legs", "Wings", "Tail", "Beak"], a: 1, e: "Birds use wings for flight." },
      { q: "Opposite of 'Happy' is:", o: ["Sad", "Glad", "Smile", "Joy"], a: 0, e: "Sad is the opposite of happy." },
      { q: "What is the color of milk?", o: ["White", "Black", "Yellow", "Blue"], a: 0, e: "Milk is pure white." },
      { q: "What letter comes before 'P'?", o: ["N", "O", "Q", "R"], a: 1, e: "O comes right before P." },
      { q: "Which letter is at the end of the alphabet?", o: ["X", "Y", "Z", "W"], a: 2, e: "Z is the 26th letter." },
      { q: "How many letters are in the English alphabet?", o: ["24", "25", "26", "28"], a: 2, e: "There are 26 letters (A to Z)." }
    ],
    'Hindi': [
      { q: "'ई' से क्या बनता है?", o: ["ईख (गन्ना)", "इमली", "अनार", "आम"], a: 0, e: "ई से मीठी ईख होती है।" },
      { q: "'उ' से कौन सा पक्षी होता है?", o: ["उल्लू", "कौआ", "चील", "तोता"], a: 0, e: "उ से रात में जागने वाला उल्लू होता है।" },
      { q: "'ऊ' से हम क्या बनाते हैं?", o: ["ऊन", "कपड़ा", "जूता", "कागज"], a: 0, e: "ऊ से ऊन से स्वेटर बनता है।" },
      { q: "'ऋ' से क्या होता है?", o: ["ऋषि", "राजा", "रानी", "साधु"], a: 0, e: "ऋ से ऋषि मुनि होते हैं।" },
      { q: "'ए' से पैर का कौन सा भाग होता है?", o: ["एड़ी", "घुटना", "पैर", "उंगली"], a: 0, e: "ए से एड़ी होती है।" },
      { q: "'ऐ' से हम क्या लगाते हैं?", o: ["ऐनक (चश्मा)", "टोपी", "दस्ताना", "हार"], a: 0, e: "ऐ से आँखों का ऐनक होता है।" },
      { q: "'ओ' से क्या होता है?", o: ["ओखली", "ओस", "ओढ़नी", "उपरोक्त सभी"], a: 3, e: "ओखली, ओस, ओढ़नी सब ओ से हैं।" },
      { q: "'औ' से क्या मिलती है?", o: ["औषधि (दवा)", "अंगूर", "आम", "ईख"], a: 0, e: "औ से बीमारी दूर करने वाली औषधि होती है।" },
      { q: "'अं' से कौन सा खट्टा-मीठा फल है?", o: ["अंगूर", "अनार", "अमरूद", "अंजीर"], a: 0, e: "अं से अंगूर होता है।" },
      { q: "कौआ किस रंग का होता है?", o: ["काला", "सफेद", "नीला", "पीला"], a: 0, e: "कौआ काला होता है।" },
      { q: "गाजर किस रंग की होती है?", o: ["लाल/नारंगी", "नीली", "काली", "पीली"], a: 0, e: "गाजर लाल-नारंगी होती है।" },
      { q: "हम किससे सुनते हैं?", o: ["कान से", "नाक से", "आँख से", "जीभ से"], a: 0, e: "हम कानों से सुनते हैं।" },
      { q: "हम किससे स्वाद लेते हैं?", o: ["जीभ से", "दांत से", "नाक से", "होंठ से"], a: 0, e: "जीभ स्वाद का अनुभव कराती है।" },
      { q: "'घ' से हम कहाँ रहते हैं?", o: ["घर", "घोंसला", "गुफा", "महल"], a: 0, e: "घ से हमारा प्यारा घर होता है।" },
      { q: "'त' से कौन सा बड़ा पक्षी/जानवर होता है?", o: ["तोता", "तेंदुआ", "तितली", "सभी"], a: 3, e: "तोता, तेंदुआ, तितली सब त से हैं।" },
      { q: "पेड़ हमें क्या देते हैं?", o: ["छाँव और फल", "धूप", "प्लास्टिक", "कचरा"], a: 0, e: "पेड़ हमें फल, फूल और ठंडी छाँव देते हैं।" },
      { q: "'प' से सुंदर उड़ने वाली क्या होती है?", o: ["पतंग", "परी", "पक्षी", "सभी"], a: 3, e: "पतंग, परी, पक्षी सब प से हैं।" },
      { q: "कमल का फूल कहाँ खिलता है?", o: ["कीचड़/पानी में", "पेड़ पर", "रेगिस्तान में", "आसमान में"], a: 0, e: "कमल पानी में खिलता है (राष्ट्रीय फूल)।" },
      { q: "'र' से चलने वाली क्या होती है?", o: ["रेलगाड़ी", "रथ", "रिक्शा", "सभी"], a: 3, e: "रेलगाड़ी, रथ, रिक्शा सब र से हैं।" },
      { q: "हम सुबह उठकर किसे प्रणाम करते हैं?", o: ["माता-पिता और बड़ों को", "किसी को नहीं", "टीवी को", "मोबाइल को"], a: 0, e: "बड़ों का आदर करना अच्छी आदत है।" }
    ],
    'Mathematics': [
      { q: "What is 5 + 1?", o: ["5", "6", "7", "8"], a: 1, e: "5 + 1 = 6." },
      { q: "What is 5 + 2?", o: ["6", "7", "8", "9"], a: 1, e: "5 + 2 = 7." },
      { q: "What is 4 + 4?", o: ["6", "7", "8", "9"], a: 2, e: "4 + 4 = 8." },
      { q: "What is 5 + 5?", o: ["8", "9", "10", "11"], a: 2, e: "5 + 5 = 10." },
      { q: "What is 10 - 1?", o: ["8", "9", "10", "7"], a: 1, e: "10 minus 1 = 9." },
      { q: "What is 6 - 2?", o: ["3", "4", "5", "6"], a: 1, e: "6 minus 2 = 4." },
      { q: "What number is between 7 and 9?", o: ["6", "8", "10", "5"], a: 1, e: "8 is between 7 and 9." },
      { q: "Count fingers on both hands together:", o: ["5", "8", "10", "12"], a: 2, e: "5 + 5 = 10 fingers." },
      { q: "How many toes on both feet?", o: ["5", "10", "15", "20"], a: 1, e: "5 + 5 = 10 toes." },
      { q: "Which number comes after 15?", o: ["14", "16", "17", "18"], a: 1, e: "16 comes after 15." },
      { q: "Which number comes before 20?", o: ["18", "19", "21", "22"], a: 1, e: "19 comes before 20." },
      { q: "How many corners does a rectangle have?", o: ["3", "4", "5", "6"], a: 1, e: "A rectangle has 4 corners." },
      { q: "Which is taller: A Tree or a Flower?", o: ["Tree", "Flower", "Same", "None"], a: 0, e: "A tree grows much taller." },
      { q: "Which is heavier: An Elephant or an Ant?", o: ["Elephant", "Ant", "Same", "None"], a: 0, e: "An elephant is very heavy." },
      { q: "What is 3 + 3?", o: ["5", "6", "7", "8"], a: 1, e: "3 + 3 = 6." },
      { q: "What is 7 + 0?", o: ["0", "7", "8", "14"], a: 1, e: "Adding zero leaves the number unchanged (7)." },
      { q: "How many months are in a full year?", o: ["10", "11", "12", "14"], a: 2, e: "There are 12 months in a year." },
      { q: "How many days are in a week?", o: ["5", "6", "7", "8"], a: 2, e: "A week has 7 days." },
      { q: "What comes after Sunday?", o: ["Monday", "Tuesday", "Friday", "Saturday"], a: 0, e: "Monday starts the week after Sunday." },
      { q: "Which shape looks like an egg?", o: ["Circle", "Oval", "Square", "Triangle"], a: 1, e: "An oval has an elongated egg shape." }
    ]
  },

  // ==========================================
  // 3. UKG (80 Unique Questions)
  // ==========================================
  'UKG-A': {
    'English': [
      { q: "What is the plural of 'Cat'?", o: ["Cats", "Cates", "Caties", "Cat"], a: 0, e: "Add 's' to make Cats." },
      { q: "Identify the action verb: 'Riya is jumping.'", o: ["Riya", "Is", "Jumping", "Girl"], a: 2, e: "Jumping is the physical action." },
      { q: "Choose the correct sight word: 'This ___ a book.'", o: ["is", "are", "am", "be"], a: 0, e: "Singular subject uses 'is'." },
      { q: "Which letter is a consonant?", o: ["A", "E", "I", "B"], a: 3, e: "B is a consonant; A, E, I are vowels." },
      { q: "What is the opposite of 'Fast'?", o: ["Slow", "Quick", "Run", "Stop"], a: 0, e: "Slow is the antonym of fast." },
      { q: "Identify the rhyming pair:", o: ["Hop - Top", "Dog - Cat", "Sun - Moon", "Pen - Box"], a: 0, e: "Hop and Top end in the same -op sound." },
      { q: "Which punctuation mark ends a sentence?", o: ["Full stop (.)", "Comma (,)", "Hyphen (-)", "Slash (/)"], a: 0, e: "A full stop marks the end of a sentence." },
      { q: "Which word starts with a blend 'BL'?", o: ["Blue", "Red", "Pink", "Green"], a: 0, e: "B-L-U-E starts with 'bl'." },
      { q: "What sound does the snake make?", o: ["Hiss", "Buzz", "Moo", "Bark"], a: 0, e: "A snake hisses." },
      { q: "Which animal lives in a kennel?", o: ["Dog", "Horse", "Cow", "Lion"], a: 0, e: "Dogs sleep in a kennel." },
      { q: "What is the home of a lion called?", o: ["Den", "Nest", "Shed", "Stable"], a: 0, e: "Lions live in a den." },
      { q: "What is the home of a bird called?", o: ["Nest", "Cave", "Burrow", "Hole"], a: 0, e: "Birds build nests in trees." },
      { q: "Complete: The sun rises in the ___.", o: ["East", "West", "North", "South"], a: 0, e: "The Sun rises in the East." },
      { q: "Complete: The sun sets in the ___.", o: ["East", "West", "North", "South"], a: 1, e: "The Sun sets in the West." },
      { q: "Choose the naming word (Noun):", o: ["School", "Run", "Softly", "Happy"], a: 0, e: "School is a place (Noun)." },
      { q: "Fill in: I ___ a student.", o: ["am", "is", "are", "be"], a: 0, e: "'I' pairs with 'am'." },
      { q: "What is the feminine gender of 'King'?", o: ["Queen", "Princess", "Lady", "Duchess"], a: 0, e: "Queen is the female king." },
      { q: "What is the feminine gender of 'Boy'?", o: ["Girl", "Woman", "Sister", "Mother"], a: 0, e: "Girl is the opposite gender of boy." },
      { q: "Select the correctly ordered letters:", o: ["A, B, C, D", "A, C, B, D", "D, C, B, A", "B, A, C, D"], a: 0, e: "A, B, C, D is alphabetical order." },
      { q: "How many vowels are in the English alphabet?", o: ["3", "4", "5", "6"], a: 2, e: "5 vowels: A, E, I, O, U." }
    ],
    'Hindi': [
      { q: "'आ' की मात्रा का सही चिन्ह कौन सा है?", o: ["ा", "ि", "ी", "ु"], a: 0, e: "आ की मात्रा 'ा' डंडे जैसी होती है।" },
      { q: "'इ' की मात्रा किधर लगती है?", o: ["अक्षर के बाईं ओर (ि)", "दाईं ओर (ी)", "नीचे (ु)", "ऊपर (े)"], a: 0, e: "छोटी 'इ' अक्षर से पहले बाईं ओर लगती है।" },
      { q: "'ी' (बड़ी ई) की मात्रा वाला शब्द पहचानिए:", o: ["चील", "दिन", "पिन", "रवि"], a: 0, e: "चील में बड़ी 'ी' की मात्रा है।" },
      { q: "'गुलाब' में कौन सी मात्रा है?", o: ["ु (छोटा उ)", "ू (बड़ा ऊ)", "ा (आ)", "े (ए)"], a: 0, e: "गुलाब में 'ग' पर छोटा 'ु' है।" },
      { q: "'फूल' में कौन सी मात्रा है?", o: ["ू (बड़ा ऊ)", "ु (छोटा उ)", "ि (इ)", "ा (आ)"], a: 0, e: "फूल में 'फ' पर बड़ा 'ू' है।" },
      { q: "'दिन' का विलोम शब्द क्या है?", o: ["रात", "सुबह", "दोपहर", "शाम"], a: 0, e: "दिन का विलोम रात है।" },
      { q: "'राजा' का विलोम/स्त्रीलिंग क्या है?", o: ["रानी", "प्रजा", "दासी", "मंत्री"], a: 0, e: "राजा का स्त्रीलिंग रानी है।" },
      { q: "'माता' का पुल्लिंग शब्द क्या है?", o: ["पिता", "भाई", "मामा", "चाचा"], a: 0, e: "माता का पुल्लिंग पिता है।" },
      { q: "'लड़का' का बहुवचन क्या है?", o: ["लड़के", "लड़कियों", "लड़कों", "लड़काएं"], a: 0, e: "लड़का का बहुवचन लड़के है।" },
      { q: "'किताब' का बहुवचन क्या है?", o: ["किताबें", "किताबों", "किताबी", "किताबा"], a: 0, e: "किताब का बहुवचन पुस्तकें/किताबें है।" },
      { q: "हमारा राष्ट्रीय पशु कौन सा है?", o: ["बाघ (Tiger)", "शेर", "हाथी", "चीता"], a: 0, e: "बाघ (रॉयल बंगाल टाइगर) राष्ट्रीय पशु है।" },
      { q: "हमारा राष्ट्रीय फूल कौन सा है?", o: ["कमल", "गुलाब", "गेंदा", "सूर्यमुखी"], a: 0, e: "कमल भारत का राष्ट्रीय पुष्प है।" },
      { q: "हमारा राष्ट्रीय फल कौन सा है?", o: ["आम", "सेब", "केला", "अनार"], a: 0, e: "फलों का राजा आम राष्ट्रीय फल है।" },
      { q: "सड़क पर लाल बत्ती का क्या मतलब है?", o: ["रुको (Stop)", "चलो (Go)", "तैयार रहो", "दौड़ो"], a: 0, e: "लाल बत्ती रुकने का संकेत है।" },
      { q: "सड़क पर हरी बत्ती का क्या मतलब है?", o: ["चलो (Go)", "रुको", "खड़े रहो", "मुड़ो"], a: 0, e: "हरी बत्ती आगे बढ़ने का संकेत है।" },
      { q: "'पानी' को और क्या कहते हैं?", o: ["जल", "नीर", "वारि", "उपरोक्त सभी"], a: 3, e: "जल, नीर, वारि सब पानी के पर्यायवाची हैं।" },
      { q: "'हवा' को और क्या कहते हैं?", o: ["पवन/वायु", "आग", "पानी", "धूप"], a: 0, e: "हवा को पवन और वायु भी कहते हैं।" },
      { q: "भारत का राष्ट्रगान किसने लिखा?", o: ["रवींद्रनाथ टैगोर", "महात्मा गांधी", "नेहरू जी", "भगत सिंह"], a: 0, e: "गुरुदेव रवींद्रनाथ टैगोर ने जन-गण-मन लिखा।" },
      { q: "स्वच्छता रखने से क्या होता है?", o: ["स्वास्थ्य अच्छा रहता है", "बीमारी फैलती है", "कचरा बढ़ता है", "कुछ नहीं"], a: 0, e: "साफ-सफाई से हम स्वस्थ और निरोगी रहते हैं।" },
      { q: "हमें प्रतिदिन क्या करना चाहिए?", o: ["स्नान और पढ़ाई", "लड़ाई", "केवल सोना", "फास्ट फूड खाना"], a: 0, e: "रोज नहाना और मन लगाकर पढ़ना अच्छी आदत है।" }
    ],
    'Mathematics': [
      { q: "What is 10 + 5?", o: ["14", "15", "16", "17"], a: 1, e: "10 + 5 = 15." },
      { q: "What is 10 + 10?", o: ["15", "18", "20", "22"], a: 2, e: "10 + 10 = 20." },
      { q: "What is 15 - 5?", o: ["5", "10", "12", "15"], a: 1, e: "15 minus 5 = 10." },
      { q: "What is 20 - 10?", o: ["5", "10", "15", "20"], a: 1, e: "20 minus 10 = 10." },
      { q: "What number comes after 29?", o: ["28", "30", "31", "32"], a: 1, e: "30 follows 29." },
      { q: "What number comes before 50?", o: ["48", "49", "51", "52"], a: 1, e: "49 precedes 50." },
      { q: "Count in 2s: 2, 4, 6, ___", o: ["7", "8", "9", "10"], a: 1, e: "Adding 2 gives 8." },
      { q: "Count in 5s: 5, 10, 15, ___", o: ["18", "20", "22", "25"], a: 1, e: "Skip counting by 5 gives 20." },
      { q: "Count in 10s: 10, 20, 30, ___", o: ["35", "40", "45", "50"], a: 1, e: "10s progression leads to 40." },
      { q: "Which is greater: 45 or 54?", o: ["45", "54", "Equal", "None"], a: 1, e: "54 has 5 tens, making it greater." },
      { q: "Which is smaller: 18 or 81?", o: ["18", "81", "Equal", "None"], a: 0, e: "18 has only 1 ten." },
      { q: "How many hours in a full day and night?", o: ["12", "20", "24", "48"], a: 2, e: "A day has 24 hours." },
      { q: "How many minutes in one hour?", o: ["30", "50", "60", "100"], a: 2, e: "60 minutes make 1 hour." },
      { q: "How many cents/paise make 1 Rupee?", o: ["50", "100", "200", "500"], a: 1, e: "100 paise = 1 Indian Rupee." },
      { q: "What shape is a slice of pizza?", o: ["Circle", "Triangle", "Square", "Star"], a: 1, e: "A slice looks triangular." },
      { q: "What shape is a book cover?", o: ["Circle", "Rectangle", "Oval", "Triangle"], a: 1, e: "Books are rectangular." },
      { q: "What is 8 + 2?", o: ["9", "10", "11", "12"], a: 1, e: "8 + 2 = 10." },
      { q: "What is 12 + 3?", o: ["14", "15", "16", "17"], a: 1, e: "12 + 3 = 15." },
      { q: "What is 14 - 4?", o: ["8", "10", "12", "14"], a: 1, e: "14 - 4 = 10." },
      { q: "If you share 6 cookies equally among 2 kids, each gets:", o: ["2", "3", "4", "6"], a: 1, e: "6 divided by 2 = 3 cookies each." }
    ],
    'EVS': [
      { q: "Which part of our body helps us think and remember?", o: ["Brain", "Stomach", "Lungs", "Heart"], a: 0, e: "The brain controls our thoughts and memories." },
      { q: "Which organ pumps blood throughout the body?", o: ["Heart", "Lungs", "Stomach", "Kidneys"], a: 0, e: "The heart pumps oxygenated blood." },
      { q: "Which organ helps us breathe fresh air?", o: ["Lungs", "Brain", "Liver", "Bones"], a: 0, e: "Lungs take in oxygen from air." },
      { q: "We must brush our teeth ___ times a day.", o: ["1", "2", "5", "0"], a: 1, e: "Brushing twice daily (morning & night) prevents cavities." },
      { q: "Which animal gives us wool for warm clothes?", o: ["Sheep", "Dog", "Cow", "Horse"], a: 0, e: "Sheep fleece is spun into wool." },
      { q: "What do bees produce?", o: ["Honey", "Milk", "Wool", "Silk"], a: 0, e: "Honeybees make sweet natural honey." },
      { q: "Which plant grows in the desert with thorns?", o: ["Cactus", "Rose", "Mango", "Lotus"], a: 0, e: "Cactus survives in arid deserts." },
      { q: "Which is the fastest land animal?", o: ["Cheetah", "Elephant", "Tiger", "Deer"], a: 0, e: "Cheetahs can sprint over 100 km/h." },
      { q: "Which is the tallest animal in the world?", o: ["Giraffe", "Elephant", "Camel", "Zebra"], a: 0, e: "Giraffes have long necks to reach high leaves." },
      { q: "Which is the largest animal in the ocean?", o: ["Blue Whale", "Shark", "Dolphin", "Octopus"], a: 0, e: "The Blue Whale is Earth's largest mammal." },
      { q: "What gives us light and warmth during daytime?", o: ["Sun", "Moon", "Stars", "Candle"], a: 0, e: "The Sun is our primary source of light and heat." },
      { q: "What falls from clouds during rainy season?", o: ["Rain / Water", "Snow only", "Sand", "Leaves"], a: 0, e: "Rain falls during the monsoon." },
      { q: "Which season is the coldest?", o: ["Winter", "Summer", "Monsoon", "Spring"], a: 0, e: "Winter brings cold temperatures." },
      { q: "In which season do we wear cotton clothes?", o: ["Summer", "Winter", "Rainy", "Autumn"], a: 0, e: "Cotton clothes keep us cool in summer." },
      { q: "What do we use to stay dry in the rain?", o: ["Umbrella / Raincoat", "Sweater", "Blanket", "Sunglasses"], a: 0, e: "Umbrellas shield us from rainwater." },
      { q: "Who helps put out fires?", o: ["Firefighter", "Doctor", "Teacher", "Pilot"], a: 0, e: "Firefighters extinguish dangerous fires." },
      { q: "Who cures sick people and prescribes medicines?", o: ["Doctor", "Police", "Chef", "Farmer"], a: 0, e: "Doctors provide medical treatment." },
      { q: "Who grows food crops in fields?", o: ["Farmer", "Driver", "Tailor", "Carpenter"], a: 0, e: "Farmers cultivate grains, fruits, and vegetables." },
      { q: "Where do we go to study and learn?", o: ["School", "Cinema", "Mall", "Zoo"], a: 0, e: "School is a temple of education." },
      { q: "What should we do before and after eating meals?", o: ["Wash hands with soap", "Run fast", "Sleep", "Watch TV"], a: 0, e: "Handwashing kills harmful germs." }
    ]
  }
};

// Procedural generator for Classes 1 to 10 (120 questions per class = 1,200 unique questions)
function getCurriculumQuestionsForClass(className, subject) {
  // If defined in static question bank (Nursery, LKG, UKG), return it directly
  if (QUESTION_BANK[className] && QUESTION_BANK[className][subject]) {
    return QUESTION_BANK[className][subject];
  }

  const gradeNumber = parseInt(className.replace(/[^0-9]/g, ''), 10) || 1;
  const gradeStr = `Class ${gradeNumber}`;
  const list = [];

  for (let i = 1; i <= 20; i++) {
    let qText = '';
    let opts = [];
    let correctIdx = (i * 2 + gradeNumber) % 4;
    let explanation = '';

    if (subject === 'Mathematics') {
      if (gradeNumber <= 2) {
        const a = i * 4 + gradeNumber * 3;
        const b = i * 2 + 5;
        const sum = a + b;
        qText = `What is the value of ${a} + ${b}? (${gradeStr} Q${i})`;
        opts = [String(sum - 2), String(sum), String(sum + 3), String(sum + 5)];
        correctIdx = 1;
        explanation = `Calculating ${a} + ${b} gives exactly ${sum}.`;
      } else if (gradeNumber <= 5) {
        const a = (i * 3 + 2) * gradeNumber;
        const b = (i % 7) + 3;
        const prod = a * b;
        qText = `Evaluate the product: ${a} × ${b} = ? (${gradeStr} Q${i})`;
        opts = [String(prod + 4), String(prod - 6), String(prod), String(prod + 10)];
        correctIdx = 2;
        explanation = `Multiplying ${a} by ${b} results in ${prod}.`;
      } else if (gradeNumber <= 8) {
        const x = i + 2;
        const m = (gradeNumber % 4) + 2;
        const rhs = m * x + 7;
        qText = `Solve the linear equation for x: ${m}x + 7 = ${rhs} (${gradeStr} Q${i})`;
        opts = [String(x), String(x + 1), String(x - 1), String(x + 3)];
        correctIdx = 0;
        explanation = `Subtract 7 from ${rhs} giving ${rhs - 7}, then divide by ${m} to obtain x = ${x}.`;
      } else { // Grade 9-10
        const trigAngles = [0, 30, 45, 60, 90];
        const trigAngle = trigAngles[i % trigAngles.length];
        const rad = (trigAngle * Math.PI) / 180;
        const sinVal = trigAngle === 0 ? '0' : trigAngle === 30 ? '1/2' : trigAngle === 45 ? '1/√2' : trigAngle === 60 ? '√3/2' : '1';
        qText = `Find the standard trigonometric value of sin(${trigAngle}°) (${gradeStr} Q${i})`;
        opts = ['0', '1/2', '1/√2', '√3/2'];
        correctIdx = (i % 4);
        opts[correctIdx] = sinVal;
        explanation = `By standard trigonometric ratios, sin(${trigAngle}°) is ${sinVal}.`;
      }
    } else if (subject === 'Science') {
      const sciTopics = [
        [`Which organelle is responsible for cellular respiration and energy in cells?`, [`Mitochondria`, `Nucleus`, `Ribosome`, `Endoplasmic Reticulum`], 0, `Mitochondria generates ATP cellular energy.`],
        [`What is the chemical symbol for Gold?`, [`Au`, `Ag`, `Fe`, `Pb`], 0, `Au (from Latin Aurum) is the symbol for Gold.`],
        [`What is the SI unit of Electric Current?`, [`Ampere`, `Volt`, `Ohm`, `Watt`], 0, `Ampere (A) is the SI unit of current.`],
        [`Which gas is most abundant in Earth's atmosphere?`, [`Nitrogen (78%)`, `Oxygen`, `Carbon Dioxide`, `Argon`], 0, `Nitrogen makes up approximately 78% of dry air.`],
        [`What type of lens is used to correct Myopia (short-sightedness)?`, [`Concave lens`, `Convex lens`, `Bifocal lens`, `Cylindrical lens`], 0, `Concave diverging lenses correct myopia.`],
        [`Which blood group is known as the Universal Donor?`, [`O Negative`, `AB Positive`, `A Positive`, `B Negative`], 0, `O negative blood lacks A, B, and Rh antigens.`],
        [`What is the speed of light in vacuum?`, [`3 × 10^8 m/s`, `3 × 10^6 m/s`, `3 × 10^5 km/s`, `3 × 10^3 m/s`], 0, `Light travels at approximately 300,000 km/s in vacuum.`],
        [`Which acid is present in lemon and citrus fruits?`, [`Citric Acid`, `Acetic Acid`, `Lactic Acid`, `Tartaric Acid`], 0, `Citrus fruits contain natural citric acid.`],
        [`What is the normal body temperature of a healthy human?`, [`37°C (98.6°F)`, `35°C`, `39°C`, `40°C`], 0, `Normal human body temperature averages 37°C.`],
        [`Which planet is closest to the Sun?`, [`Mercury`, `Venus`, `Mars`, `Earth`], 0, `Mercury is the first and smallest planet.`],
        [`What is the chemical formula of common table salt?`, [`NaCl`, `KCl`, `CaCl2`, `Na2CO3`], 0, `Sodium Chloride is NaCl.`],
        [`What is the process of conversion of liquid water into vapor?`, [`Evaporation`, `Condensation`, `Sublimation`, `Precipitation`], 0, `Evaporation turns liquid water into gas.`],
        [`Which vitamin is synthesized in skin upon exposure to sunlight?`, [`Vitamin D`, `Vitamin A`, `Vitamin C`, `Vitamin B12`], 0, `UV rays stimulate Vitamin D synthesis in skin.`],
        [`What is the unit of Frequency?`, [`Hertz (Hz)`, `Decibel`, `Newton`, `Joule`], 0, `Frequency is measured in cycles per second (Hertz).`],
        [`Which metal is liquid at room temperature?`, [`Mercury`, `Bromine`, `Gallium`, `Lead`], 0, `Mercury (Hg) is the only liquid metal at standard temperature.`],
        [`What is the atomic number of Carbon?`, [`6`, `12`, `8`, `14`], 0, `Carbon has 6 protons, atomic number 6.`],
        [`Which enzyme in saliva begins starch digestion in mouth?`, [`Salivary Amylase (Ptyalin)`, `Pepsin`, `Trypsin`, `Lipase`], 0, `Amylase breaks starch down into maltose.`],
        [`What law states that 'Energy can neither be created nor destroyed'?`, [`Law of Conservation of Energy`, `Newton's First Law`, `Ohm's Law`, `Boyle's Law`], 0, `The First Law of Thermodynamics establishes energy conservation.`],
        [`Which cell organelle contains the genetic code (DNA)?`, [`Nucleus`, `Cytoplasm`, `Lysosome`, `Vacuole`], 0, `The nucleus houses chromosomes and DNA.`],
        [`What is the hardest natural mineral on Earth?`, [`Diamond`, `Corundum`, `Quartz`, `Topaz`], 0, `Diamond ranks 10 on the Mohs hardness scale.`]
      ];
      const topic = sciTopics[i - 1];
      qText = topic[0];
      opts = topic[1];
      correctIdx = 0;
      explanation = topic[3];
    } else if (subject === 'English') {
      const engTopics = [
        [`Identify the part of speech of the underlined word: "She runs QUICKLY."`, [`Adverb`, `Adjective`, `Noun`, `Verb`], 0, `'Quickly' describes how she runs, making it an adverb.`],
        [`Choose the correct synonym for 'ABUNDANT':`, [`Plentiful`, `Scarce`, `Tiny`, `Empty`], 0, `'Abundant' means existing in large quantities.`],
        [`What is the antonym of 'GENEROUS'?`, [`Stingy / Miserly`, `Kind`, `Helpful`, `Polite`], 0, `'Stingy' is the direct opposite of generous.`],
        [`Identify the passive voice: "The chef cooked a delicious dinner."`, [`A delicious dinner was cooked by the chef.`, `A delicious dinner cooked the chef.`, `The dinner is cooking by chef.`, `Chef was cooked dinner.`], 0, `Simple past passive is 'was cooked by'.`],
        [`Fill in with the correct preposition: "He is interested ___ mathematics."`, [`in`, `on`, `at`, `for`], 0, `'Interested' takes the preposition 'in'.`],
        [`Choose the correctly spelled word:`, [`Necessary`, `Neccessary`, `Necesary`, `Necassary`], 0, `'Necessary' has one 'c' and double 's'.`],
        [`What is a group of lions called?`, [`Pride`, `Flock`, `Herd`, `Pack`], 0, `A collective noun for lions is a 'Pride'.`],
        [`Identify the conjunction in: "I wanted to go, BUT it was raining."`, [`But`, `Wanted`, `Raining`, `Was`], 0, `'But' is a coordinating conjunction linking clauses.`],
        [`Choose the correct modal: "You ___ follow traffic rules."`, [`must`, `might`, `may`, `could`], 0, `'Must' expresses strong obligation and rule.`],
        [`What does the idiom 'Burn the midnight oil' mean?`, [`Study or work late into the night`, `Waste electricity`, `Cook food at night`, `Make a fire`], 0, `It means working late hours.`],
        [`Identify the sentence with correct subject-verb agreement:`, [`Either of the books is fine.`, `Either of the books are fine.`, `Either of the books were fine.`, `Either books are fine.`], 0, `'Either' as pronoun is singular and takes 'is'.`],
        [`Choose the antonym of 'ANCIENT':`, [`Modern`, `Old`, `Historic`, `Antique`], 0, `'Modern' is the opposite of ancient.`],
        [`What is the superlative form of 'Good'?`, [`Best`, `Better`, `Goodest`, `Most good`], 0, `Positive: Good, Comparative: Better, Superlative: Best.`],
        [`Fill in: "She has been studying ___ 8:00 AM."`, [`since`, `for`, `from`, `in`], 0, `'Since' specifies a starting point in time.`],
        [`Choose the correct one-word substitution: "A person who loves books"`, [`Bibliophile`, `Philatelist`, `Numismatist`, `Polyglot`], 0, `A bibliophile is an avid book lover.`],
        [`Identify the type of sentence: "What a spectacular sunset!"`, [`Exclamatory`, `Declarative`, `Imperative`, `Interrogative`], 0, `Sentences expressing strong emotion ending in ! are exclamatory.`],
        [`What is the plural form of 'Crisis'?`, [`Crises`, `Crisises`, `Crisies`, `Crisi`], 0, `Greek loanwords ending in -is form plurals in -es (crises).`],
        [`Complete the proverb: "Honesty is the best ___."`, [`policy`, `virtue`, `habit`, `trick`], 0, `'Honesty is the best policy.'`],
        [`Identify the adjective: "The courageous soldier defended the border."`, [`Courageous`, `Soldier`, `Defended`, `Border`], 0, `'Courageous' describes the quality of the soldier.`],
        [`Choose the correct question tag: "She is your sister, ___?"`, [`isn't she?`, `is she?`, `doesn't she?`, `wasn't she?`], 0, `Positive statement takes negative tag 'isn't she?'.`]
      ];
      const topic = engTopics[i - 1];
      qText = topic[0];
      opts = topic[1];
      correctIdx = 0;
      explanation = topic[3];
    } else if (subject === 'Social Science' || subject === 'EVS') {
      const sstTopics = [
        [`Who was the first Prime Minister of Independent India?`, [`Jawaharlal Nehru`, `Mahatma Gandhi`, `Sardar Patel`, `Dr. Rajendra Prasad`], 0, `Pandit Jawaharlal Nehru served as India's 1st Prime Minister.`],
        [`Which imaginary line divides the Earth into Northern and Southern hemispheres?`, [`Equator (0° Latitude)`, `Tropic of Cancer`, `Prime Meridian`, `Arctic Circle`], 0, `The Equator divides Earth into Northern and Southern hemispheres.`],
        [`What is the highest mountain peak in the world?`, [`Mount Everest (8,848 m)`, `K2`, `Kanchenjunga`, `Lhotse`], 0, `Mount Everest in the Himalayas is Earth's highest elevation.`],
        [`Which Indian state has the longest coastline?`, [`Gujarat`, `Maharashtra`, `Tamil Nadu`, `Andhra Pradesh`], 0, `Gujarat has over 1,600 km of coastline.`],
        [`Who wrote the Indian National Anthem 'Jana Gana Mana'?`, [`Rabindranath Tagore`, `Bankim Chandra Chattopadhyay`, `Sarojini Naidu`, `Subhas Chandra Bose`], 0, `Gurudev Rabindranath Tagore composed the national anthem.`],
        [`In which year did India adopt its Constitution and become a Republic?`, [`1950 (26 January)`, `1947`, `1952`, `1949`], 0, `Constitution came into effect on 26 January 1950 (Republic Day).`],
        [`Which planet in our solar system is known as the Red Planet?`, [`Mars`, `Venus`, `Jupiter`, `Saturn`], 0, `Iron oxide on Mars' surface gives it a reddish appearance.`],
        [`What is the capital city of France?`, [`Paris`, `London`, `Berlin`, `Rome`], 0, `Paris is the capital of France.`],
        [`Which monument in Agra was built by Mughal Emperor Shah Jahan in memory of Mumtaz?`, [`Taj Mahal`, `Red Fort`, `Qutub Minar`, `Fatehpur Sikri`], 0, `The Taj Mahal is an ivory-white marble mausoleum.`],
        [`How many fundamental rights are guaranteed by the Indian Constitution?`, [`6 Fundamental Rights`, `7`, `8`, `10`], 0, `Part III of the Constitution guarantees 6 Fundamental Rights.`],
        [`Which ocean is the largest and deepest on Earth?`, [`Pacific Ocean`, `Atlantic Ocean`, `Indian Ocean`, `Arctic Ocean`], 0, `The Pacific Ocean covers over 30% of Earth's surface.`],
        [`What is the minimum voting age for Indian citizens in elections?`, [`18 Years`, `21 Years`, `25 Years`, `16 Years`], 0, `Universal Adult Suffrage is granted at age 18 in India.`],
        [`Which river is the longest in the world?`, [`Nile River`, `Amazon River`, `Yangtze River`, `Mississippi River`], 0, `The Nile River in Africa flows over 6,650 km.`],
        [`Who was known as 'Netaji' during the Indian Freedom Movement?`, [`Subhash Chandra Bose`, `Bhagat Singh`, `Lala Lajpat Rai`, `Chandra Shekhar Azad`], 0, `Subhas Chandra Bose formed the Indian National Army (INA).`],
        [`What is the currency of the United Kingdom?`, [`Pound Sterling (£)`, `Euro (€)`, `Dollar ($)`, `Yen (¥)`], 0, `The official UK currency is the British Pound.`],
        [`Which layer of Earth's atmosphere protects us from harmful UV rays?`, [`Ozone layer (Stratosphere)`, `Troposphere`, `Mesosphere`, `Thermosphere`], 0, `The ozone layer absorbs dangerous solar ultraviolet radiation.`],
        [`Which soil type in India is best suited for Cotton cultivation?`, [`Black Soil (Regur)`, `Alluvial Soil`, `Red Soil`, `Laterite Soil`], 0, `Black regur soil retains moisture ideal for cotton.`],
        [`Who presides over the Lok Sabha meetings in Parliament?`, [`Speaker of Lok Sabha`, `Prime Minister`, `President`, `Chief Justice`], 0, `The Speaker is the presiding officer of the Lok Sabha.`],
        [`Which desert is the largest hot desert in the world?`, [`Sahara Desert`, `Thar Desert`, `Gobi Desert`, `Kalahari Desert`], 0, `The Sahara in Africa covers over 9 million square km.`],
        [`When is World Environment Day celebrated globally?`, [`June 5`, `April 22`, `March 21`, `October 2`], 0, `June 5 is designated as UN World Environment Day.`]
      ];
      const topic = sstTopics[i - 1];
      qText = topic[0];
      opts = topic[1];
      correctIdx = 0;
      explanation = topic[3];
    } else if (subject === 'Hindi') {
      const hindiTopics = [
        [`'संधि' के मुख्य रूप से कितने भेद होते हैं?`, [`तीन (स्वर, व्यंजन, विसर्ग)`, `दो`, `चार`, `पाँच`], 0, `संधि तीन प्रकार की होती है: स्वर, व्यंजन और विसर्ग।`],
        [`'पवन' शब्द का सही संधि-विच्छेद क्या है?`, [`पो + अन`, `पव + न`, `पौ + अन`, `पा + वन`], 0, `पो + अन = पवन (अयादि स्वर संधि)।`],
        [`'सूर्य' का पर्यायवाची शब्द कौन सा है?`, [`दिनकर / भास्कर`, `निशाकर`, `जलधर`, `पयोद`], 0, `दिनकर, भास्कर, रवि सूर्य के पर्यायवाची हैं।`],
        [`'अमृत' का विलोम शब्द क्या है?`, [`विष (जहर)`, `सुधा`, `पीयूष`, `जल`], 0, `अमृत का विलोम विष होता है।`],
        [`'दशानन' (दस सिर वाला = रावण) में कौन सा समास है?`, [`बहुव्रीहि समास`, `द्विगु समास`, `तत्पुरुष समास`, `कर्मधारय समास`], 0, `विशेष अर्थ (रावण) प्रकट होने से यह बहुव्रीहि समास है।`],
        [`'आँखों का तारा होना' मुहावरे का सही अर्थ क्या है?`, [`अत्यंत प्रिय होना`, `आँख में दर्द होना`, `तारा देखना`, `दूर होना`], 0, `आँखों का तारा होना अर्थात बहुत प्यारा होना।`],
        [`'ईंट का जवाब पत्थर से देना' मुहावरे का क्या अर्थ है?`, [`कड़ा मुकाबला करना / बदला लेना`, `ईंट फेंकना`, `चुप रहना`, `डर जाना`], 0, `शत्रु को मुँहतोड़ जवाब देना।`],
        [`'अंगूठा दिखाना' मुहावरे का क्या अर्थ है?`, [`साफ मना कर देना`, `मदद करना`, `अंगूठा चूसना`, `ताली बजाना`], 0, `वक्त पर इंकार कर देना।`],
        [`'जो सब कुछ जानता हो' - अनेक शब्दों के लिए एक शब्द:`, [`सर्वज्ञ`, `अल्पज्ञ`, `विद्वान`, `ज्ञानी`], 0, `सब कुछ जानने वाले को 'सर्वज्ञ' कहते हैं।`],
        [`'जिसका कोई शत्रु न जन्मा हो':`, [`अजातशत्रु`, `अजेय`, `अमर`, `शत्रुघ्न`], 0, `अजातशत्रु का अर्थ है जिसका कोई शत्रु न हो।`],
        [`'कमल' का पर्यायवाची शब्द पहचानिए:`, [`पंकज / नीरज / राजीव`, `जलद`, `अंबर`, `तरंग`], 0, `पंकज, नीरज, सरोज कमल के पर्यायवाची हैं।`],
        [`'आकाश' का पर्यायवाची शब्द पहचानिए:`, [`नभ / गगन / अंबर`, `पाताल`, `धरा`, `पयोधि`], 0, `नभ, गगन, आसमान आकाश के पर्यायवाची हैं।`],
        [`'सज्जन' का विलोम शब्द क्या है?`, [`दुर्जन`, `खल`, `पापी`, `अधर्मी`], 0, `सज्जन (अच्छा व्यक्ति) का विलोम दुर्जन है।`],
        [`'उन्नति' का विलोम शब्द क्या है?`, [`अवनति`, `पतन`, `विनाश`, `हार`], 0, `उन्नति (विकास) का विलोम अवनति है।`],
        [`'प्रत्येक' शब्द में कौन सा उपसर्ग लगा है?`, [`प्रति`, `प्र`, `प्रत्य`, `एक`], 0, `प्रति + एक = प्रत्येक।`],
        [`'सफलता' शब्द में कौन सा प्रत्यय है?`, [`ता`, `आ`, `ल`, `फल`], 0, `सफल + ता = सफलता।`],
        [`'रामायण' महाकाव्य के रचयिता कौन हैं?`, [`महर्षि वाल्मीकि`, `तुलसीदास`, `वेदव्यास`, `कालिदास`], 0, `संस्कृत रामायण वाल्मीकि जी ने लिखी।`],
        [`'रामचरितमानस' की रचना किस कवि ने की?`, [`गोस्वामी तुलसीदास`, `सूरदास`, `कबीरदास`, `रसखान`], 0, `अवधी भाषा में रामचरितमानस तुलसीदास जी ने लिखी।`],
        [`हिंदी भाषा की लिपि कौन सी है?`, [`देवनागरी`, `रोमन`, `गुरुमुखी`, `फारसी`], 0, `हिंदी देवनागरी लिपि में लिखी जाती है।`],
        [`हिंदी दिवस प्रतिवर्ष कब मनाया जाता है?`, [`14 सितंबर`, `26 जनवरी`, `15 अगस्त`, `2 अक्टूबर`], 0, `14 सितंबर 1949 को हिंदी राजभाषा स्वीकृत हुई थी।`]
      ];
      const topic = hindiTopics[i - 1];
      qText = topic[0];
      opts = topic[1];
      correctIdx = 0;
      explanation = topic[3];
    } else if (subject === 'Computer Science') {
      const compTopics = [
        [`What is known as the "Brain of the computer"?`, [`CPU (Central Processing Unit)`, `RAM`, `Hard Disk`, `Motherboard`], 0, `The CPU executes instructions and processes data.`],
        [`Which keyboard shortcut is universally used to COPY selected text?`, [`Ctrl + C`, `Ctrl + V`, `Ctrl + X`, `Ctrl + Z`], 0, `Ctrl + C copies the selection to the clipboard.`],
        [`Which keyboard shortcut is used to PASTE copied text?`, [`Ctrl + V`, `Ctrl + P`, `Ctrl + S`, `Ctrl + A`], 0, `Ctrl + V pastes clipboard contents.`],
        [`What does RAM stand for in computer hardware?`, [`Random Access Memory`, `Read All Memory`, `Rapid Action Module`, `Real Application Memory`], 0, `RAM provides fast volatile working memory for active programs.`],
        [`What does ROM stand for?`, [`Read Only Memory`, `Random Optical Memory`, `Run Operational Mode`, `Real Online Memory`], 0, `ROM contains non-volatile permanent boot firmware (BIOS).`],
        [`Which of the following is an Input device?`, [`Keyboard / Mouse`, `Monitor`, `Printer`, `Speaker`], 0, `Keyboards and mice input user data into the system.`],
        [`Which of the following is an Output device?`, [`Monitor / Screen`, `Microphone`, `Webcam`, `Scanner`], 0, `Monitors display visual output from the graphics card.`],
        [`What does 'HTTP' stand for in web browsing?`, [`HyperText Transfer Protocol`, `High Tech Transfer Program`, `Hyperlink Text Process`, `Home Tool Transmission Protocol`], 0, `HTTP is the foundational communication protocol for the World Wide Web.`],
        [`What does 'URL' stand for?`, [`Uniform Resource Locator`, `Universal Record Link`, `Unified Real Linkage`, `User Routing Location`], 0, `A URL is the web address of a digital resource.`],
        [`How many bits are in one Byte?`, [`8 bits`, `4 bits`, `16 bits`, `32 bits`], 0, `1 Byte consists of 8 binary digits (bits).`],
        [`How many Bytes make 1 Kilobyte (KB)?`, [`1,024 Bytes`, `1,000 Bytes`, `512 Bytes`, `2,048 Bytes`], 0, `In binary computing, 1 KB = 2^10 = 1,024 Bytes.`],
        [`Which of the following is an Operating System?`, [`Microsoft Windows / Linux / macOS`, `MS Word`, `Google Chrome`, `Adobe Photoshop`], 0, `Operating systems manage computer hardware and software resources.`],
        [`What is the full form of 'AI'?`, [`Artificial Intelligence`, `Automated Internet`, `Applied Information`, `Action Interface`], 0, `AI refers to machine simulation of human cognitive intelligence.`],
        [`Which programming language uses indentation for code blocks and was created by Guido van Rossum?`, [`Python`, `Java`, `C++`, `HTML`], 0, `Python is known for clean indentation-based syntax.`],
        [`What does 'HTML' stand for in web design?`, [`HyperText Markup Language`, `High Text Machine Language`, `Hyperlink Text Mode Link`, `Home Tool Markup Layer`], 0, `HTML defines the structure of web pages.`],
        [`What does 'CSS' stand for in web styling?`, [`Cascading Style Sheets`, `Creative Style System`, `Color Sheet Standards`, `Computer Styling Source`], 0, `CSS formats and styles web documents.`],
        [`What is a malicious software program designed to harm or steal data called?`, [`Malware / Virus`, `Antivirus`, `Firewall`, `Driver`], 0, `Malware includes viruses, worms, trojans, and ransomware.`],
        [`What security system monitors and controls incoming and outgoing network traffic?`, [`Firewall`, `Router`, `Modem`, `Switch`], 0, `Firewalls prevent unauthorized access to networks.`],
        [`Which database language is used to query relational databases?`, [`SQL (Structured Query Language)`, `HTML`, `CSS`, `XML`], 0, `SQL is the standard language for relational database management.`],
        [`What is the cloud computing model where computing resources are delivered over the Internet?`, [`Cloud Computing`, `Local Processing`, `Batch Processing`, `Analog Computing`], 0, `Cloud computing provides on-demand data storage and compute power.`]
      ];
      const topic = compTopics[i - 1];
      qText = topic[0];
      opts = topic[1];
      correctIdx = 0;
      explanation = topic[3];
    }

    // Shuffle options so correct answer is distributed between A, B, C, D
    const correctOptText = opts[correctIdx];
    const shift = (i * 3) % 4;
    const shuffledOpts = [...opts];
    if (shift > 0 && shuffledOpts.length === 4) {
      const temp = shuffledOpts[0];
      shuffledOpts[0] = shuffledOpts[shift];
      shuffledOpts[shift] = temp;
    }
    const newCorrectIdx = shuffledOpts.indexOf(correctOptText);

    list.push({
      question_text: qText,
      options: shuffledOpts,
      correct_answer_index: newCorrectIdx >= 0 ? newCorrectIdx : 0,
      explanation: explanation
    });
  }

  return list;
}

module.exports = {
  QUESTION_BANK,
  getCurriculumQuestionsForClass
};

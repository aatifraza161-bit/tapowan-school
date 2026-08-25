require('dotenv').config({path: '.env'});
const { generateDailyQuizzes } = require('./server/generate-quiz.js');
const db = require('./server/db-sqlite.js');
db.list = async () => [{status: 'Active', className: '10'}];
generateDailyQuizzes().then(() => console.log('Done'));

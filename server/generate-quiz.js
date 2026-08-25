const { generateAll1400Questions, CLASS_CURRICULUM_CONFIG } = require('../scripts/generateAll1400Questions');

module.exports = {
  generateDailyQuizzes: generateAll1400Questions,
  runDailyQuizGeneration: generateAll1400Questions,
  generateAll1400Questions,
  CLASS_CURRICULUM_CONFIG
};

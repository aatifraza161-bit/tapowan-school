require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'hello'
    });
    console.log('Gemini success:', response.text);
  } catch (err) {
    console.error('Gemini error:', err);
  }
}
test();

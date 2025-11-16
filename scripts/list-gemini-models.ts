import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function listModels() {
  try {
    console.log('📋 Listing available Gemini models...\n');

    const models = await genAI.listModels();

    for await (const model of models) {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Supported Methods:`, model.supportedGenerationMethods);
      console.log('');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();

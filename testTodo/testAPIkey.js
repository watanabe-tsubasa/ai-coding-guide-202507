
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    console.log("Attempting to list models to verify API key...");
    // The listModels() function is a simple way to test the API key.
    // It doesn't consume any tokens.
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent("test");
    console.log("API key is valid!");
    console.log("Successfully received response from the model.");
  } catch (error) {
    console.error("Error verifying API key:", error.message);
    console.log("Please ensure your GEMINI_API_KEY environment variable is set correctly.");
  }
}

run();

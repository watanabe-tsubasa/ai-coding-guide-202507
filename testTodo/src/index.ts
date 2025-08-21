import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const appVersion = packageJson.version || '0.0.0';

const disclaimer = `
【免責事項】
このアプリケーションが提供する情報は、医療専門家による診断、治療、または助言に代わるものではありません。健康上の問題については、必ず医師または資格のある医療提供者に相談してください。本アプリケーションの利用によって生じたいかなる損害についても、開発者は一切の責任を負いません。
`;

export async function main(args: string[]) {
  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx src/index.ts [question]

痛みに関する質問をする

Options:
  --help     ヘルプを表示
  --version  バージョンを表示
`);
    process.exit(0);
  }

  if (args.includes('--version')) {
    console.log(`v${appVersion}`);
    process.exit(0);
  }

  // Display disclaimer for any other command
  console.log(disclaimer);

  const question = args[0]; // Assuming the first argument is the question

  if (!question) {
    console.log("質問を入力してください。例: npx tsx src/index.ts <質問内容>");
    // process.exit(1); // Remove process.exit here, handle in test
    return; // Return to allow testing
  }

  // Gemini API Integration
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("エラー: GEMINI_API_KEY 環境変数が設定されていません。");
    // process.exit(1); // Remove process.exit here, handle in test
    return; // Return to allow testing
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const result = await model.generateContent(question);
    const response = await result.response;
    const text = response.text();

    console.log(`AIからの回答：${text}`);
  } catch (error) {
    console.error("Gemini APIとの通信中にエラーが発生しました:", error);
    // process.exit(1); // Remove process.exit here, handle in test
    return; // Return to allow testing
  }
}

// Only call main if not in a test environment (or if directly executed)
if (require.main === module) {
  main(process.argv.slice(2));
}
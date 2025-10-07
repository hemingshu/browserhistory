import { GoogleGenerativeAI } from "@google/generative-ai";

// 使用环境变量中的 API Key 初始化客户端
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function startConversation() {
  try {
    const modelId = "gemini-1.5-flash";
    const model = ai.getGenerativeModel({ model: modelId });

    // 创建一个新的聊天会话（会自动维护历史）
    const chat = model.startChat({
      systemInstruction: "你是一个乐于助人的，且说话略带幽默感的助手。"
    });

    console.log(`--- 开始与 ${modelId} 的对话 ---`);

    // --- 第一轮对话 ---
    const userMessage1 = "你好！你能告诉我你叫什么名字吗？";
    console.log(`用户: ${userMessage1}`);
    const response1 = await chat.sendMessage(userMessage1);
    console.log(`助手: ${response1.response.text()}\n`);

    // --- 第二轮对话 ---
    const userMessage2 = "好的，请用一句话总结一下我们刚才的对话。";
    console.log(`用户: ${userMessage2}`);
    const response2 = await chat.sendMessage(userMessage2);
    console.log(`助手: ${response2.response.text()}`);
  } catch (error) {
    console.error("对话失败:", error?.message || error);
  }
}

startConversation();
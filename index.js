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

// 解析大模型返回中的 JSON（容错处理代码块与多余文本）
function parseJsonFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const codeFenceMatch = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const jsonText = codeFenceMatch ? codeFenceMatch[1] : text;
  try {
    return JSON.parse(jsonText);
  } catch (_) {
    // 尝试提取第一个花括号到最后一个花括号
    const first = jsonText.indexOf('{');
    const last = jsonText.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      try {
        return JSON.parse(jsonText.slice(first, last + 1));
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}

// 使用 Gemini 按照 history.js 的规则对标题列表进行分类
export async function classifyTitles(titles) {
  if (!Array.isArray(titles)) {
    throw new Error('输入必须是字符串数组');
  }

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const systemInstruction = [
    '你将收到一个网页标题列表，请根据以下规则将每个标题分类为以下之一：',
    "['work','entertainment','shopping','news','social','auth','other']",
    '分类依据（与前端规则保持一致）：',
    '- work: 包含 LinkedIn/GitHub/StackOverflow/Jira/Confluence/Slack/Teams/Zoom/Meet 等工作相关词，或标题含“工作/项目/会议/office/work”。',
    '- entertainment: 包含 YouTube/Netflix/Bilibili/iQiyi/Youku/Twitch/Steam/Epic/PlayStation/Xbox，或标题含“游戏/电影/视频/娱乐/music/game”。',
    '- shopping: 包含 淘宝/天猫/京东/Amazon/eBay/Alibaba/Shopify/Shopee/Lazada，或标题含“购物/商城/商店/购买/shop/buy”。',
    '- news: 包含 news./CNN/BBC/Reuters/新浪/搜狐/网易/QQ/知乎/Reddit，或标题含“新闻/资讯/头条/news/article”。',
    '- social: 包含 Facebook/Twitter/Instagram/微博/抖音/TikTok/Discord/Telegram/WhatsApp，或标题含“社交/朋友圈/微博/social/chat”。',
    '- auth: 包含 login/signin/auth/oauth/sso/passport/account/profile/settings/admin，或标题含“登录/注册/账户/设置/管理/login/signin”。',
    '- other: 其他不满足以上条件的内容。',
    '只按规则分类，不要臆测页面内容。',
    '请仅输出 JSON，格式如下：{ "items": [{ "title": string, "category": string }] }'
  ].join('\n');

  const prompt = JSON.stringify({ items: titles.map(t => ({ title: String(t || '') })) }, null, 2);

  const result = await model.generateContent([
    { text: systemInstruction },
    { text: '待分类数据：' },
    { text: prompt }
  ]);

  const text = result?.response?.text?.() || '';
  const parsed = parseJsonFromText(text);
  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error('分类结果解析失败');
  }
  // 规范化类别名，确保只返回允许的集合
  const allowed = new Set(['work','entertainment','shopping','news','social','auth','other']);
  const normalized = parsed.items.map(item => {
    const title = String(item?.title || '');
    const category = String(item?.category || '').toLowerCase();
    return {
      title,
      category: allowed.has(category) ? category : 'other'
    };
  });
  return { items: normalized };
}

// 简单 CLI：从 stdin 读取 JSON 数组并分类，方便快速测试
if (process.argv[1] && import.meta.url.endsWith('/index.js')) {
  (async () => {
    const fs = await import('fs');
    const path = await import('path');
    const args = process.argv.slice(2);
    const fileArgIndex = args.findIndex(a => a === '--file' || a === '-f');
    let filePath = null;
    if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
      filePath = args[fileArgIndex + 1];
    }

    // 读取 API Key：优先环境变量，否则交互式输入
    let apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      process.stdout.write('请输入 Gemini API Key: ');
      apiKey = await new Promise(resolve => {
        const chunks = [];
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', d => resolve(String(d).trim()));
      });
      if (apiKey) process.env.GOOGLE_API_KEY = apiKey;
    }

    try {
      let titles = null;
      if (filePath) {
        const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        const content = fs.readFileSync(abs, 'utf8');
        titles = JSON.parse(content);
      } else if (!process.stdin.isTTY) {
        const chunks = [];
        process.stdin.on('data', c => chunks.push(c));
        await new Promise(resolve => process.stdin.on('end', resolve));
        const input = Buffer.concat(chunks).toString('utf8').trim();
        if (input) titles = JSON.parse(input);
      }

      if (!Array.isArray(titles)) {
        console.error('请通过 --file 指定 JSON 文件，或通过 stdin 提供 JSON 数组');
        process.exit(1);
        return;
      }

      const result = await classifyTitles(titles);
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('分类失败:', e?.message || e);
      process.exit(1);
    }
  })();
}
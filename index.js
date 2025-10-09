// 浏览器环境下的 Gemini API 调用
// 注意：在浏览器扩展中，我们需要通过 fetch 直接调用 Gemini API

// 直接调用 Gemini API 的函数
async function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API 调用失败:', error);
    throw error;
  }
}


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
async function classifyTitles(titles, apiKey) {
  if (!Array.isArray(titles)) {
    throw new Error('输入必须是字符串数组');
  }

  if (!apiKey) {
    throw new Error('需要提供 Gemini API Key');
  }

  const systemInstruction = [
    '你将收到一个网页标题列表，请根据以下规则将每个标题分类为以下之一：',
    "['work','entertainment','shopping','news','social','auth','other']",
    '分类依据（与前端规则保持一致）：',
    '- work: 包含 LinkedIn/GitHub/StackOverflow/Jira/Confluence/Slack/Teams/Zoom/Meet 等工作相关词，或标题含"工作/项目/会议/office/work"。',
    '- entertainment: 包含 YouTube/Netflix/Bilibili/iQiyi/Youku/Twitch/Steam/Epic/PlayStation/Xbox，或标题含"游戏/电影/视频/娱乐/music/game"。',
    '- shopping: 包含 淘宝/天猫/京东/Amazon/eBay/Alibaba/Shopify/Shopee/Lazada，或标题含"购物/商城/商店/购买/shop/buy"。',
    '- news: 包含 news./CNN/BBC/Reuters/新浪/搜狐/网易/QQ/知乎/Reddit，或标题含"新闻/资讯/头条/news/article"。',
    '- social: 包含 Facebook/Twitter/Instagram/微博/抖音/TikTok/Discord/Telegram/WhatsApp，或标题含"社交/朋友圈/微博/social/chat"。',
    '- auth: 包含 login/signin/auth/oauth/sso/passport/account/profile/settings/admin，或标题含"登录/注册/账户/设置/管理/login/signin"。',
    '- other: 其他不满足以上条件的内容。',
    '只按规则分类，不要臆测页面内容。',
    '请仅输出 JSON，格式如下：{ "items": [{ "title": string, "category": string }] }'
  ].join('\n');

  const dataToClassify = JSON.stringify({ items: titles.map(t => ({ title: String(t || '') })) }, null, 2);
  const fullPrompt = `${systemInstruction}\n\n待分类数据：\n${dataToClassify}`;

  const text = await callGeminiAPI(apiKey, fullPrompt);
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

// 浏览器环境导出
if (typeof window !== 'undefined') {
  window.GeminiClassifier = {
    classifyTitles,
    callGeminiAPI,
    parseJsonFromText
  };
}
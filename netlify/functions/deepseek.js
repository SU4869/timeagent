// Netlify Function：DeepSeek API 代理（解决浏览器 CORS 限制）
// 用途：App 前端 -> 本函数 -> DeepSeek 官方 API
// 调用：POST /.netlify/functions/deepseek
//   请求头：x-api-key: <你的 DeepSeek 官方 Key>
//            x-model: deepseek-chat / deepseek-reasoner
//   请求体：{ messages: [...], temperature, max_tokens }（OpenAI 兼容格式）
export default async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-model",
    "Content-Type": "application/json",
  };

  // CORS 预检
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "仅支持 POST" } }), { status: 405, headers: cors });
  }

  try {
    const body = await req.json();
    const key = (req.headers.get("x-api-key") || "").trim();
    let model = (req.headers.get("x-model") || "deepseek-chat").trim();

    if (!key) {
      return new Response(JSON.stringify({ error: { message: "缺少 x-api-key 请求头" } }), { status: 400, headers: cors });
    }

    // 兼容硅基流动的模型名写法：deepseek-ai/DeepSeek-V3 -> deepseek-chat
    if (model.startsWith("deepseek-ai/")) {
      const name = model.split("/")[1] || "DeepSeek-V3";
      model = /R1|reasoner/i.test(name) ? "deepseek-reasoner" : "deepseek-chat";
    }

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        temperature: body.temperature ?? 0.6,
        max_tokens: body.max_tokens ?? 2048,
        stream: false,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: { message: "代理内部错误: " + err.message } }), {
      status: 500,
      headers: cors,
    });
  }
};

export const config = {
  path: "/api/deepseek",
};

// Cloudflare Pages Functions：DeepSeek API 代理（解决浏览器 CORS 限制）
// 用途：App 前端 -> 本函数 -> DeepSeek 官方 API
// 调用：POST /api/deepseek
//   请求头：x-api-key: <你的 DeepSeek 官方 Key>
//            x-model: deepseek-v4-flash / deepseek-v4-pro（默认 flash）
//   请求体：{ messages: [...], temperature, max_tokens }（OpenAI 兼容格式）
// 说明：旧模型名 deepseek-chat / deepseek-reasoner 已于 2026-07-24 废弃，本函数自动升级为 V4。
// 迁移记录：2026-08-14 从 Netlify Functions 迁移（Netlify 免费额度耗尽导致部署暂停）。
export async function onRequest(context) {
  const req = context.request;
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
    let model = (req.headers.get("x-model") || "deepseek-v4-flash").trim();

    if (!key) {
      return new Response(JSON.stringify({ error: { message: "缺少 x-api-key 请求头" } }), { status: 400, headers: cors });
    }

    // 模型名归一：兼容旧名与硅基流动写法，统一升级到 DeepSeek V4
    if (model.startsWith("deepseek-ai/")) {
      const name = model.split("/")[1] || "DeepSeek-V3";
      model = /R1|reasoner|pro/i.test(name) ? "deepseek-v4-pro" : "deepseek-v4-flash";
    } else if (model === "deepseek-chat") {
      model = "deepseek-v4-flash"; // 旧通用名(已废弃) -> V4-Flash
    } else if (model === "deepseek-reasoner") {
      model = "deepseek-v4-pro"; // 旧推理名(已废弃) -> V4-Pro
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
        thinking: { type: "disabled" }, // V4 默认开启思考模式；规划/对话场景关闭以提速降本
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
}

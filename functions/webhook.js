export async function onRequestPost(context) {
  // Lấy API Key và Token từ Biến môi trường (env) của Cloudflare
  const API_KEY = context.env.API_KEY;
  const BOT_TOKEN = context.env.BOT_TOKEN;
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  try {
    const payload = await context.request.json();
    const message = payload.message;

    if (!message || !message.text) return new Response("OK");

    const chatId = message.chat.id;
    const text = message.text.trim();

    // 1. XỬ LÝ LỆNH /start
    if (text === "/start") {
        const welcomeMessage = `👋 **Chào mừng bạn đến với Bot Bypass Liên Kết!**\n\n` +
                               `🛠 **Cách sử dụng:**\n` +
                               `1️⃣ Copy link rút gọn bạn cần vượt qua.\n` +
                               `2️⃣ Dán và gửi trực tiếp link đó vào nhóm chat này.\n` +
                               `3️⃣ Chờ 1-2 giây, bot sẽ trả về link gốc. (Chạm vào kết quả để copy nhanh).\n\n` +
                               `📌 **Các nền tảng hỗ trợ:**\n` +
                               `\`Linkvertise, Loot-Link, Rekonise, Work.ink, Lockr.so, Shrtfly, Rinku.pro\``;
        
        await sendMessage(TELEGRAM_API, chatId, welcomeMessage);
        return new Response("OK");
    }

    // 2. CHỈ PHÂN TÍCH LINK HTTPS
    if (text.startsWith("https://")) {
      
      const allowedPlatforms = [
        "linkvertise", "link-center", "link-to", "up-to-down",
        "loot-link", "loot-links", "lootdest", "platorelay",
        "rekonise", 
        "work.ink", "workink",
        "lockr.so", 
        "shrtfly", 
        "rinku.pro"
      ];

      const isAllowed = allowedPlatforms.some(platform => text.toLowerCase().includes(platform));

      if (!isAllowed) {
         return new Response("OK"); 
      }

      await sendMessage(TELEGRAM_API, chatId, "⏳ *Đang giải mã liên kết, vui lòng đợi...*");

      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "x-api-key": API_KEY } // Sử dụng API_KEY từ env
      });

      const result = await response.json();

      const targetUrl = result.target || result.bypassed || result.url || result.destination || result.data?.target || result.data?.url || result.data?.bypassed;

      if (targetUrl) {
          await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n🚀 **Kết quả (Chạm để copy):**\n\`${targetUrl}\``);
      } else {
          await sendMessage(TELEGRAM_API, chatId, `⚠️ **API trả về lỗi hoặc định dạng lạ:**\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
      }
    } 

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}

async function sendMessage(apiUrl, chatId, text) {
  await fetch(`${apiUrl}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    })
  });
}

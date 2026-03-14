export async function onRequestPost(context) {
  // 1. LẤY BIẾN MÔI TRƯỜNG TỪ CLOUDFLARE
  const API_KEY = context.env.API_KEY;
  const BOT_TOKEN = context.env.BOT_TOKEN;
  const ALLOWED_GROUP_ID_ENV = context.env.ALLOWED_GROUP_ID || ""; // Chuỗi ID các group
  
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  try {
    const payload = await context.request.json();
    const message = payload.message;

    if (!message || !message.text) return new Response("OK");

    const chatId = message.chat.id;
    const chatType = message.chat.type; // "private", "group", "supergroup", "channel"
    const text = message.text.trim();

    // 2. CHỐT CHẶN BẢO MẬT: HỖ TRỢ NHIỀU GROUP
    // Tách chuỗi "-100123,-100456" thành danh sách ["-100123", "-100456"]
    const allowedGroups = ALLOWED_GROUP_ID_ENV.split(",").map(id => id.trim());
    
    const isPrivate = chatType === "private";
    const isAllowedGroup = allowedGroups.includes(String(chatId));

    // Nếu không phải nhắn riêng VÀ cũng không nằm trong danh sách Group cho phép -> IM LẶNG
    if (!isPrivate && !isAllowedGroup) {
        return new Response("OK"); 
    }

    // 3. XỬ LÝ LỆNH /start
    if (text === "/start" || text.startsWith("/start@")) {
        const welcomeMessage = `👋 **Chào mừng bạn đến với Bot Bypass Liên Kết!**\n\n` +
                               `🛠 **Cách sử dụng:**\n` +
                               `1️⃣ Copy link rút gọn bạn cần vượt qua.\n` +
                               `2️⃣ Dán và gửi trực tiếp link đó cho bot.\n` +
                               `3️⃣ Chờ 1-2 giây, bot sẽ trả về link gốc. (Chạm vào kết quả để copy nhanh).\n\n` +
                               `📌 **Các nền tảng hỗ trợ:**\n` +
                               `\`Linkvertise, Loot-Link, Rekonise, Work.ink, Lockr.so, Shrtfly, Rinku.pro\``;
        
        await sendMessage(TELEGRAM_API, chatId, welcomeMessage);
        return new Response("OK");
    }

    // 4. CHỈ PHÂN TÍCH LINK HTTPS VÀ THUỘC DANH SÁCH CHO PHÉP
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

      // 5. BẮT ĐẦU BYPASS
      await sendMessage(TELEGRAM_API, chatId, "⏳ *Đang giải mã liên kết, vui lòng đợi...*");

      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "x-api-key": API_KEY } 
      });

      const result = await response.json();

      const targetUrl = result.target || result.bypassed || result.url || result.destination || result.data?.target || result.data?.url || result.data?.bypassed;

      // 6. TRẢ KẾT QUẢ
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

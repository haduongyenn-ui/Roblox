export async function onRequestPost(context) {
  // 1. LẤY BIẾN MÔI TRƯỜNG TỪ CLOUDFLARE
  const API_KEY = context.env.API_KEY;
  const BOT_TOKEN = context.env.BOT_TOKEN;
  const ALLOWED_GROUP_ID_ENV = context.env.ALLOWED_GROUP_ID || "";
  
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  try {
    const payload = await context.request.json();
    const message = payload.message;

    if (!message || !message.text) return new Response("OK");

    const chatId = message.chat.id;
    const chatType = message.chat.type;
    const text = message.text.trim();

    // 2. CHỐT CHẶN BẢO MẬT
    const allowedGroups = ALLOWED_GROUP_ID_ENV.split(",").map(id => id.trim());
    const isPrivate = chatType === "private";
    const isAllowedGroup = allowedGroups.includes(String(chatId));

    return await sendMessage(TELEGRAM_API, chatId, `⚠️ ID của Group này là: ${chatId}`);
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

    // 4. CHỈ PHÂN TÍCH LINK BẮT ĐẦU BẰNG HTTPS VÀ CÓ TRONG DANH SÁCH
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

      // Gọi ZEN-API
      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "x-api-key": API_KEY } 
      });

      const apiData = await response.json();

      // 5. TRÍCH XUẤT KẾT QUẢ TỪ API (Đã thêm apiData.result theo đúng định dạng của ZEN-API)
      const targetUrl = apiData.result || apiData.target || apiData.bypassed || apiData.url || apiData.destination || apiData.data?.target || apiData.data?.url || apiData.data?.bypassed;

      // 6. TRẢ KẾT QUẢ CHO NGƯỜI DÙNG
      if (targetUrl) {
          await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n🚀 **Kết quả (Chạm để copy):**\n\`${targetUrl}\``);
      } else {
          await sendMessage(TELEGRAM_API, chatId, `⚠️ **API trả về lỗi hoặc định dạng lạ:**\n\n\`\`\`json\n${JSON.stringify(apiData, null, 2)}\n\`\`\``);
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

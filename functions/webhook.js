export async function onRequestPost(context) {
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
    
    // Lấy thông tin người gửi để nhắc tên
    const user = message.from;
    const firstName = user.first_name || "Bạn";
    const mentionUser = `[${firstName}](tg://user?id=${user.id})`;

    // 🕵️‍♂️ LỆNH /id
    if (text === "/id" || text.startsWith("/id@")) {
        await sendMessage(TELEGRAM_API, chatId, `🎯 **ID của cuộc trò chuyện này là:**\n\`${chatId}\``);
        return new Response("OK");
    }

    // 2. KIỂM TRA QUYỀN TRUY CẬP
    const allowedGroups = ALLOWED_GROUP_ID_ENV.split(",").map(id => id.trim());
    const isPrivate = chatType === "private";
    const isAllowedGroup = allowedGroups.includes(String(chatId));

    if (!isPrivate && !isAllowedGroup) {
        await sendMessage(TELEGRAM_API, chatId, `🛑 **Bot chưa được cấp phép tại đây!**\n\n👁️ ID thực tế: \`${chatId}\`\n📁 ID trong Cloudflare: \`${ALLOWED_GROUP_ID_ENV}\``);
        return new Response("OK"); 
    }

    // 3. XỬ LÝ LỆNH /start
    if (text === "/start" || text.startsWith("/start@")) {
        const welcomeMessage = `👋 **Chào ${mentionUser}!**\n\nHãy gửi link cần bypass vào đây để mình xử lý nhé.`;
        await sendMessage(TELEGRAM_API, chatId, welcomeMessage);
        return new Response("OK");
    }

    // 4. KIỂM TRA VÀ XỬ LÝ LINK HTTPS
    if (text.startsWith("https://")) {
      const allowedPlatforms = ["linkvertise", "link-center", "link-to", "up-to-down", "loot-link", "loot-links", "lootdest", "platorelay", "rekonise", "work.ink", "workink", "lockr.so", "shrtfly", "rinku.pro"];
      const isAllowed = allowedPlatforms.some(p => text.toLowerCase().includes(p));
      
      if (!isAllowed) return new Response("OK");

      await sendMessage(TELEGRAM_API, chatId, `⏳ ${mentionUser} *vui lòng đợi, đang giải mã...*`);

      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl, { method: "GET", headers: { "x-api-key": API_KEY } });
      const apiData = await response.json();

      const targetUrl = apiData.result || apiData.target || apiData.url || apiData.data?.target;

      // 5. TRẢ KẾT QUẢ VÀ NHẮC TÊN
      if (targetUrl) {
          // Sử dụng mentionUser để gọi tên người vừa gửi link
          await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n👤 **Người gửi:** ${mentionUser}\n🚀 **Kết quả (Chạm để copy):**\n\`${targetUrl}\``);
      } else {
          await sendMessage(TELEGRAM_API, chatId, `⚠️ ${mentionUser} ơi, API báo lỗi rồi:\n\n\`\`\`json\n${JSON.stringify(apiData, null, 2)}\n\`\`\``);
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

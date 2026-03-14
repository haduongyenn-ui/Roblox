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
    const messageId = message.message_id; // ID tin nhắn người dùng gửi
    
    const user = message.from;
    const firstName = user.first_name || "Bạn";
    const mentionUser = `[${firstName}](tg://user?id=${user.id})`;

    // 🕵️‍♂️ LỆNH /id
    if (text === "/id" || text.startsWith("/id@")) {
        await sendMessage(TELEGRAM_API, chatId, `🎯 **ID của cuộc trò chuyện này là:**\n\`${chatId}\``);
        return new Response("OK");
    }

    const allowedGroups = ALLOWED_GROUP_ID_ENV.split(",").map(id => id.trim());
    const isPrivate = chatType === "private";
    const isAllowedGroup = allowedGroups.includes(String(chatId));

    if (!isPrivate && !isAllowedGroup) {
        await sendMessage(TELEGRAM_API, chatId, `🛑 **Bot chưa được cấp phép tại đây!**\n\n👁️ ID thực tế: \`${chatId}\``);
        return new Response("OK"); 
    }

    if (text === "/start" || text.startsWith("/start@")) {
        await sendMessage(TELEGRAM_API, chatId, `👋 **Chào ${mentionUser}!**\nHãy gửi link cần bypass vào đây nhé.`);
        return new Response("OK");
    }

    if (text.startsWith("https://")) {
      const allowedPlatforms = ["linkvertise", "link-center", "link-to", "up-to-down", "loot-link", "loot-links", "lootdest", "platorelay", "rekonise", "work.ink", "workink", "lockr.so", "shrtfly", "rinku.pro"];
      const isAllowed = allowedPlatforms.some(p => text.toLowerCase().includes(p));
      if (!isAllowed) return new Response("OK");

      // 1. Gửi tin nhắn chờ
      const waitingMsg = await sendMessage(TELEGRAM_API, chatId, `⏳ ${mentionUser} *vui lòng đợi...*`);
      const waitingMsgId = waitingMsg?.result?.message_id;

      // 2. Gọi API Bypass
      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl, { method: "GET", headers: { "x-api-key": API_KEY } });
      const apiData = await response.json();
      const targetUrl = apiData.result || apiData.target || apiData.url || apiData.data?.target;

      // 3. Trả kết quả
      let botResponse;
      if (targetUrl) {
          botResponse = await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n👤 **Người gửi:** ${mentionUser}\n🚀 **Kết quả:**\n\`${targetUrl}\`\n\n🗑 _Tin nhắn này sẽ tự xóa sau 60s_`);
      } else {
          botResponse = await sendMessage(TELEGRAM_API, chatId, `⚠️ ${mentionUser} **API lỗi:**\n\`\`\`json\n${JSON.stringify(apiData, null, 2)}\n\`\`\``);
      }

      const responseMsgId = botResponse?.result?.message_id;

      // 4. THIẾT LẬP TỰ ĐỘNG XÓA (Wait 60s)
      // Lưu ý: Cloudflare Pages Functions có giới hạn thời gian chạy, 
      // nhưng với 60s thì dùng waitUntil có thể hoạt động được.
      context.waitUntil(new Promise(resolve => {
          setTimeout(async () => {
              // Xóa tin nhắn của người dùng
              await deleteMessage(TELEGRAM_API, chatId, messageId);
              // Xóa tin nhắn chờ của bot
              if (waitingMsgId) await deleteMessage(TELEGRAM_API, chatId, waitingMsgId);
              // Xóa tin nhắn kết quả của bot
              if (responseMsgId) await deleteMessage(TELEGRAM_API, chatId, responseMsgId);
              resolve();
          }, 60000); // 60.000ms = 60s
      }));
    } 

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}

// Hàm gửi tin nhắn (trả về dữ liệu để lấy message_id)
async function sendMessage(apiUrl, chatId, text) {
  const res = await fetch(`${apiUrl}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
      disable_web_page_preview: true
    })
  });
  return await res.json();
}

// Hàm xóa tin nhắn
async function deleteMessage(apiUrl, chatId, messageId) {
  try {
    await fetch(`${apiUrl}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
  } catch (e) {
    // Bỏ qua lỗi nếu tin nhắn đã bị xóa trước đó
  }
}

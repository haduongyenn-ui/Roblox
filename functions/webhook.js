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
    const messageId = message.message_id;
    
    const user = message.from;
    const firstName = user.first_name || "Bạn";
    const mentionUser = `[${firstName}](tg://user?id=${user.id})`;

    // 1. KIỂM TRA QUYỀN TRUY CẬP
    const allowedGroups = ALLOWED_GROUP_ID_ENV.split(",").map(id => id.trim());
    const isPrivate = chatType === "private";
    const isAllowedGroup = allowedGroups.includes(String(chatId));

    if (!isPrivate && !isAllowedGroup) {
        return new Response("OK"); // Không phải group mình thì im lặng
    }

    // 2. LỆNH /START VỚI NỘI DUNG BẠN YÊU CẦU
    if (text === "/start" || text.startsWith("/start@")) {
        const welcomeMessage = `👋 **Chào mừng bạn đến với Bot Bypass Liên Kết!**\n\n` +
                               `🛠 **Cách sử dụng:**\n` +
                               `1️⃣ Copy link rút gọn bạn cần vượt qua.\n` +
                               `2️⃣ Dán và gửi trực tiếp link đó cho bot.\n` +
                               `3️⃣ Chờ 1-2 giây, bot sẽ trả về link gốc. (Chạm vào kết quả để copy nhanh).\n\n` +
                               `📌 **Các nền tảng hỗ trợ:**\n` +
                               `*Linkvertise, Loot-Link, Rekonise, Work.ink, Lockr.so, Shrtfly, Rinku.pro*`;
        
        await sendMessage(TELEGRAM_API, chatId, welcomeMessage);
        return new Response("OK");
    }

    // 🕵️‍♂️ LỆNH /ID
    if (text === "/id" || text.startsWith("/id@")) {
        await sendMessage(TELEGRAM_API, chatId, `🎯 **ID của cuộc trò chuyện này là:**\n\`${chatId}\``);
        return new Response("OK");
    }

    // 3. XỬ LÝ LINK BYPASS
    if (text.startsWith("https://")) {
      const allowedPlatforms = ["linkvertise", "link-center", "link-to", "up-to-down", "loot-link", "loot-links", "lootdest", "platorelay", "rekonise", "work.ink", "workink", "lockr.so", "shrtfly", "rinku.pro"];
      const isAllowed = allowedPlatforms.some(p => text.toLowerCase().includes(p));
      if (!isAllowed) return new Response("OK");

      // Gửi tin nhắn chờ
      const waitingMsg = await sendMessage(TELEGRAM_API, chatId, `⏳ ${mentionUser} *vui lòng đợi, đang giải mã...*`);
      const waitingMsgId = waitingMsg?.result?.message_id;

      // Gọi API
      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl, { method: "GET", headers: { "x-api-key": API_KEY } });
      const apiData = await response.json();
      const targetUrl = apiData.result || apiData.target || apiData.url || apiData.data?.target;

      // Trả kết quả
      let botResponse;
      if (targetUrl) {
          botResponse = await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n👤 **Người gửi:** ${mentionUser}\n🚀 **Kết quả (Chạm để copy):**\n\`${targetUrl}\`\n\n🗑 _Tin nhắn sẽ tự xóa sau 60s_`);
      } else {
          botResponse = await sendMessage(TELEGRAM_API, chatId, `⚠️ ${mentionUser} **API lỗi:**\n\`\`\`json\n${JSON.stringify(apiData, null, 2)}\n\`\`\``);
      }

      const responseMsgId = botResponse?.result?.message_id;

      // Tự động xóa sau 60s
      context.waitUntil(new Promise(resolve => {
          setTimeout(async () => {
              await deleteMessage(TELEGRAM_API, chatId, messageId);
              if (waitingMsgId) await deleteMessage(TELEGRAM_API, chatId, waitingMsgId);
              if (responseMsgId) await deleteMessage(TELEGRAM_API, chatId, responseMsgId);
              resolve();
          }, 60000);
      }));
    } 

    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
}

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

async function deleteMessage(apiUrl, chatId, messageId) {
  try {
    await fetch(`${apiUrl}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
  } catch (e) {}
}

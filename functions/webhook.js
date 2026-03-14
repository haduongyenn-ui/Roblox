export async function onRequestPost(context) {
  const API_KEY = "bd735c2c-0f21-46a9-b037-36abd8a7d4a1";
  const BOT_TOKEN = "8274076017:AAHyp2tO_Q6aPpvc3l_XVA-AcNV-jLvJH9M";
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  try {
    const payload = await context.request.json();
    const message = payload.message;

    // Chỉ xử lý nếu có tin nhắn văn bản
    if (!message || !message.text) return new Response("OK");

    const chatId = message.chat.id;
    const text = message.text.trim();

    // KIỂM TRA: Chỉ phân tích nếu tin nhắn bắt đầu bằng https://
    if (text.startsWith("https://")) {
      
      // Gửi thông báo đang xử lý
      await sendMessage(TELEGRAM_API, chatId, "⏳ *Đang giải mã liên kết, vui lòng đợi...*");

      // Gọi ZEN-API (Dùng endpoint /v1/bypass)
      const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "x-api-key": API_KEY }
      });

      const result = await response.json();

      // Phân tích kết quả
      if (result.status === "success" || result.data || result.target) {
          const targetUrl = result.data?.target || result.target;
          await sendMessage(TELEGRAM_API, chatId, `✅ **Bypass Thành Công!**\n\n🚀 **Kết quả:** ${targetUrl}`);
      } else {
          await sendMessage(TELEGRAM_API, chatId, "❌ *Lỗi:* Link không được hỗ trợ hoặc API gặp sự cố.");
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

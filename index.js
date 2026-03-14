export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const update = await request.json();
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text.trim();

        // CHỈ XỬ LÝ NẾU LÀ LINK PLATORELAY HOẶC LỆNH /START
        if (text === "/start") {
          await this.send(chatId, "Sẵn sàng! Gửi link Roblox/Platorelay để mình bypass.", env.BOT_TOKEN);
        } else if (text.includes("platorelay.com")) {
          const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(text)}`;
          const res = await fetch(apiUrl, {
            headers: { "x-api-key": env.IZEN_API_KEY }
          });
          const data = await res.json();
          await this.send(chatId, `✨ Kết quả: \n${data.result || "Lỗi bypass!"}`, env.BOT_TOKEN);
        }
      }
      return new Response("OK");
    }
    // Giao diện Web (GET)
    return new Response("Bot đang chạy...", { headers: { "content-type": "text/plain" } });
  },

  async send(chatId, text, token) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });
  }
};

import os
import telebot
import requests
from flask import Flask
from threading import Thread

# Khởi tạo Web Server để giữ bot luôn chạy trên Render
app = Flask('')

@app.route('/')
def home():
    return "Bot Delta Bypass đang hoạt động!"

def run():
    # Render yêu cầu port 8080 hoặc lấy từ biến môi trường
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)

def keep_alive():
    t = Thread(target=run)
    t.start()

# --- PHẦN BOT TELEGRAM ---
# Lấy Token từ Environment Variables trên Render (an toàn hơn)
TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    bot.reply_to(message, "Chào mừng! Gửi link Delta Roblox vào đây để mình bypass giúp bạn.")

@bot.message_handler(func=lambda message: True)
def handle_bypass(message):
    url_input = message.text
    
    if "delta" in url_input.lower():
        bot.send_message(message.chat.id, "⏳ Đang xử lý link Delta, vui lòng đợi...")
        
        # Gửi request đến API bypass (Sử dụng URL bạn cung cấp)
        # Lưu ý: Đây là cấu trúc giả định dựa trên URL bạn đưa ra
        try:
            api_url = f"https://opawvn.xyz/roblox/delta/?bypass={url_input}"
            response = requests.get(api_url, timeout=15)
            
            if response.status_code == 200:
                # Nếu API trả về text trực tiếp hoặc JSON, hãy điều chỉnh dòng dưới
                result = response.text 
                bot.reply_to(message, f"✅ Kết quả Bypass:\n`{result}`", parse_mode="Markdown")
            else:
                bot.send_message(message.chat.id, "❌ Lỗi: Server bypass không phản hồi.")
        except Exception as e:
            bot.send_message(message.chat.id, f"❌ Có lỗi xảy ra: {str(e)}")
    else:
        bot.reply_to(message, "⚠️ Đây không phải link Delta hợp lệ.")

if __name__ == "__main__":
    keep_alive() # Chạy server Flask song song
    print("Bot is starting...")
    bot.infinity_polling() # Giữ bot luôn lắng nghe tin nhắn

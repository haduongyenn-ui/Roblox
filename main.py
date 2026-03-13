import telebot
import requests

API_TOKEN = 'TOKEN_CUA_BAN'
bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Chào bạn! Hãy gửi link Delta cần bypass vào đây.")

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    url_to_bypass = message.text
    if "delta" in url_to_bypass:
        bot.reply_to(message, "Đang xử lý, vui lòng đợi giây lát...")
        
        # Giả sử đây là API bạn dùng để bypass
        api_url = f"https://api.example.com/bypass?url={url_to_bypass}"
        response = requests.get(api_url)
        
        if response.status_code == 200:
            result = response.json().get("result") # Tùy cấu trúc JSON của API
            bot.send_message(message.chat.id, f"Kết quả của bạn: {result}")
        else:
            bot.send_message(message.chat.id, "Có lỗi xảy ra khi bypass.")
    else:
        bot.reply_to(message, "Vui lòng gửi đúng link Delta.")

bot.polling()

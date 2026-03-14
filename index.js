export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // XỬ LÝ API (GỌI TỪ WEBSITE LÊN)
    if (request.method === "POST" && url.pathname === "/api/bypass") {
      try {
        const { targetUrl } = await request.json();
        
        const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(targetUrl)}`;
        
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "x-api-key": env.IZEN_API_KEY }
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { "content-type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ message: "Lỗi kết nối API" }), { status: 500 });
      }
    }

    // TRẢ VỀ GIAO DIỆN WEBSITE (HTML + CSS + JS)
    return new Response(this.html(), {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  html() {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>iZen Bypass Tool</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
        </style>
    </head>
    <body class="flex items-center justify-center min-h-screen p-4">
        <div class="glass p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h1 class="text-3xl font-bold text-center mb-2 text-sky-400">iZen Bypass</h1>
            <p class="text-slate-400 text-center mb-8 text-sm">Vượt link rút gọn nhanh chóng và an toàn</p>

            <div class="space-y-4">
                <input type="text" id="targetUrl" placeholder="Dán link vào đây (Linkvertise, Fluxus...)" 
                    class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-sky-500 transition-all">
                
                <button onclick="handleBypass()" id="btn"
                    class="w-full bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-95">
                    Bypass Ngay
                </button>
            </div>

            <div id="resultBox" class="hidden mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
                <p class="text-xs text-slate-500 mb-1">Kết quả:</p>
                <div id="resultText" class="break-all text-sky-300 font-mono text-sm"></div>
                <button onclick="copyResult()" class="mt-3 text-xs text-sky-500 underline">Sao chép</button>
            </div>
        </div>

        <script>
            async function handleBypass() {
                const input = document.getElementById('targetUrl');
                const btn = document.getElementById('btn');
                const resBox = document.getElementById('resultBox');
                const resText = document.getElementById('resultText');

                if(!input.value) return alert('Vui lòng dán link!');

                btn.disabled = true;
                btn.innerText = 'Đang xử lý...';
                resBox.classList.add('hidden');

                try {
                    const response = await fetch('/api/bypass', {
                        method: 'POST',
                        body: JSON.stringify({ targetUrl: input.value })
                    });
                    const data = await response.json();
                    
                    resBox.classList.remove('hidden');
                    resText.innerText = data.result || data.message || 'Lỗi không xác định';
                } catch (e) {
                    alert('Có lỗi xảy ra!');
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Bypass Ngay';
                }
            }

            function copyResult() {
                const text = document.getElementById('resultText').innerText;
                navigator.clipboard.writeText(text);
                alert('Đã sao chép!');
            }
        </script>
    </body>
    </html>`;
  }
};

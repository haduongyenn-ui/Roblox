export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // XỬ LÝ API BYPASS
    if (request.method === "POST" && url.pathname === "/api/bypass") {
      try {
        const { targetUrl } = await request.json();
        const apiUrl = `https://api.izen.lol/v1/bypass?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "x-api-key": env.IZEN_API_KEY }
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), { headers: { "content-type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ message: "Lỗi API" }), { status: 500 });
      }
    }

    // TRẢ VỀ GIAO DIỆN WEB
    return new Response(this.html(), {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  // HÀM HTML PHẢI NẰM SAU DẤU PHẨY CỦA HÀM FETCH VÀ TRƯỚC DẤU ĐÓNG } CUỐI CÙNG
  html() {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Bypass Key Delta</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://offeringchewjean.com/47/a9/13/47a913b960040fe7926ec0833cfc6151.js"></script>
      </head>
      <body class="bg-slate-900 text-white p-5">
        <div class="max-w-md mx-auto">
            <h1 class="text-2xl font-bold mb-5">Bypass & IPA</h1>
            <input type="text" id="targetUrl" class="w-full p-2 bg-slate-800 border border-slate-700 rounded mb-2" placeholder="Dán link...">
            <button onclick="handle()" class="w-full bg-blue-600 p-2 rounded">Bypass</button>
            <div id="res" class="mt-4 p-2 bg-black rounded hidden break-all"></div>
            
            <div class="mt-10">
                <h2 class="font-bold mb-2 text-emerald-400">File iPA Delta</h2>
                <a href="https://cdn.khoindvn.io.vn/DeltaVN.ipa" class="block p-3 bg-slate-800 rounded mb-2 underline">Tải Delta IPA</a>
            </div>
        </div>
        <script>
          async function handle() {
            const out = document.getElementById('res');
            out.innerText = 'Đang chạy...';
            out.classList.remove('hidden');
            const res = await fetch('/api/bypass', {
              method: 'POST',
              body: JSON.stringify({ targetUrl: document.getElementById('targetUrl').value })
            });
            const data = await res.json();
            out.innerText = data.result || 'Lỗi!';
          }
        </script>
      </body>
    </html>`;
  }
}; // Dấu đóng ngoặc này cực kỳ quan trọng

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. XỬ LÝ API CHO WEBSITE (Bypass)
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

    // 2. TRẢ VỀ GIAO DIỆN WEBSITE CHO NGƯỜI DÙNG
    return new Response(this.html(), {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },

  // HÀM CHỨA GIAO DIỆN HTML
  html() {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Khơindvn - Bypass & IPA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <script src='https://hairsromance.com/g_q7aDmbA6aQh_XP/NVmh3f9uxKIU/zfv1OaVj8ATdn9EoEUL/Sghia89fFxp9UPfhw/EFtHxA8b4FCkRQEKW/olNVY/jXefY8K8Jq3EcEhNQn/tgHzaiCkWC49/dyzeXgu5z'></script>
        <script src="https://offeringchewjean.com/47/a9/13/47a913b960040fe7926ec0833cfc6151.js"></script>

        <style>
            body { background: #0f172a; color: #f8fafc; font-family: sans-serif; }
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        </style>
    </head>
    <body class="py-10 px-4">
        <div class="max-w-md mx-auto space-y-6">
            
            <div class="flex justify-center">
                <script type="text/javascript">
                    atOptions = {'key' : '3434ba1486d99ce41866b861388f09c5', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {}};
                </script>
                <script type="text/javascript" src="https://hairsromance.com/3434ba1486d99ce41866b861388f09c5/invoke.js"></script>
            </div>

            <div class="glass p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-bold text-sky-400 mb-4 text-center">🔗 Link Bypass</h2>
                <input type="text" id="targetUrl" placeholder="Dán link vào đây..." 
                    class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 mb-3 focus:outline-none focus:border-sky-500">
                <button onclick="handleBypass()" id="btn" class="w-full bg-sky-500 text-slate-900 font-bold py-3 rounded-xl active:scale-95 transition-all">Bypass Ngay</button>
                <div id="resultBox" class="hidden mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 break-all text-sky-300 font-mono text-sm">
                    <span id="resText"></span>
                </div>
            </div>

            <div class="glass p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-bold text-emerald-400 mb-4 text-center">📦 File IPA Delta VN</h2>
                <div class="space-y-3">
                    <a href="https://cdn.khoindvn.io.vn/DeltaVN.ipa" target="_blank" class="flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700">
                        <span>Delta Executor</span>
                        <span class="text-xs font-bold text-emerald-400">DOWNLOAD File</span>
                    </a>
                </div>
            </div>

        </div>

        <script>
            async function handleBypass() {
                const input = document.getElementById('targetUrl');
                const btn = document.getElementById('btn');
                const resBox = document.getElementById('resultBox');
                const resText = document.getElementById('resText');

                if(!input.value) return alert('Dán link đã bạn ơi!');
                
                btn.disabled = true;
                btn.innerText = 'Đang xử lý...';
                resBox.classList.add('hidden');

                try {
                    const response = await fetch('/api/bypass', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ targetUrl: input.value })
                    });
                    const data = await response.json();
                    resBox.classList.remove('hidden');
                    resText.innerText = data.result || data.message || 'Lỗi xử lý!';
                } catch (e) {
                    alert('Lỗi hệ thống!');
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Bypass Ngay';
                }
            }
        </script>
    </body>
    </html>`;
  }
};

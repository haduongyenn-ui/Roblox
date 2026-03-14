  html() {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bypass Key Roblox</title>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <script src='https://hairsromance.com/g_q7aDmbA6aQh_XP/NVmh3f9uxKIU/zfv1OaVj8ATdn9EoEUL/Sghia89fFxp9UPfhw/EFtHxA8b4FCkRQEKW/olNVY/jXefY8K8Jq3EcEhNQn/tgHzaiCkWC49/dyzeXgu5z'></script>
        <script src="https://offeringchewjean.com/47/a9/13/47a913b960040fe7926ec0833cfc6151.js"></script>

        <style>
            body { background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); }
            .ad-container { min-height: 60px; display: flex; justify-content: center; align-items: center; margin: 15px 0; }
        </style>
    </head>
    <body class="py-10 px-4">
        <div class="max-w-md mx-auto space-y-6">
            
            <div class="ad-container">
                <script type="text/javascript">
                    atOptions = {
                        'key' : '3434ba1486d99ce41866b861388f09c5',
                        'format' : 'iframe',
                        'height' : 50,
                        'width' : 320,
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="https://hairsromance.com/3434ba1486d99ce41866b861388f09c5/invoke.js"></script>
            </div>

            <div class="glass p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-bold text-sky-400 mb-4 text-center">🔗 Link Bypass</h2>
                <input type="text" id="targetUrl" placeholder="Dán link cần bypass..." 
                    class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 mb-3 focus:outline-none focus:border-sky-500 text-sm">
                <button onclick="handleBypass()" id="btn" class="w-full bg-sky-500 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-500/20">Bypass Ngay</button>
                <div id="resultBox" class="hidden mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 break-all text-sky-300 text-sm font-mono relative">
                    <span id="resText"></span>
                    <button onclick="copyRes()" class="block mt-2 text-xs text-slate-500 hover:text-sky-400">Copy link</button>
                </div>
            </div>

            <div class="glass p-6 rounded-2xl shadow-xl">
                <h2 class="text-xl font-bold text-emerald-400 mb-4 text-center">📦 File IPA Roblox</h2>
                <div class="space-y-3">
                    <a href="https://cdn.khoindvn.io.vn/DeltaVN.ipa" target="_blank" class="flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-transparent hover:border-emerald-500/50">
                        <span class="font-medium text-sm">Delta Executor v1.2</span>
                        <span class="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase">Download</span>
                    </a>
                    
                    <a href="LINK_IPA_CUA_BAN_2" target="_blank" class="flex items-center justify-between p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all border border-transparent hover:border-emerald-500/50">
                        <span class="font-medium text-sm">Fluxus iOS Latest</span>
                        <span class="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase">Download</span>
                    </a>
                </div>
            </div>

            <div class="ad-container">
                </div>

        </div>

        <script>
            async function handleBypass() {
                const input = document.getElementById('targetUrl');
                const btn = document.getElementById('btn');
                const resBox = document.getElementById('resultBox');
                const resText = document.getElementById('resText');

                if(!input.value) return alert('Vui lòng dán link!');
                
                btn.disabled = true;
                btn.innerText = 'Đang bypass...';
                resBox.classList.add('hidden');

                try {
                    const response = await fetch('/api/bypass', {
                        method: 'POST',
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

            function copyRes() {
                const text = document.getElementById('resText').innerText;
                navigator.clipboard.writeText(text);
                alert('Đã copy!');
            }
        </script>
    </body>
    </html>`;
  }

"""川麻小白助手 — 本地开发服务器

    python serve.py
    python serve.py --port 9090
"""

import http.server
import socket
import sys
import os

PORT = 8080


def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect(("10.254.254.254", 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".json": "application/json",
    }

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, format, *args):
        print(f"  [{self.client_address[0]}] {format % args}")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        if arg.startswith("--port="):
            PORT = int(arg.split("=")[1])

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()

    print()
    print("  ═══════════════════════════════════════")
    print("   川麻小白助手 — 本地开发服务器")
    print("  ═══════════════════════════════════════")
    print()
    print(f"   PC 访问:   http://localhost:{PORT}/demo.html")
    print(f"   手机访问:  http://{lan_ip}:{PORT}/demo.html")
    print()
    print("  手机和 PC 需连在同一个 WiFi。")
    print("  按 Ctrl+C 停止服务器。")
    print()

    with http.server.HTTPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止。")

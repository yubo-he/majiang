"""川麻小白助手 — 本地开发服务器

    python serve.py
    python serve.py --port 9090
"""

import http.server
import socketserver
import socket
import sys
import os
import json
import subprocess
import platform

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

    def do_POST(self):
        print(f"  [debug] do_POST 被调用, path={self.path}")
        if self.path == '/api/save-state':
            # 接收前端牌局 JSON，保存到本地文件
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                json_path = os.path.join(os.getcwd(), 'data', 'frontend_json_backen_sample_blur.json')
                with open(json_path, 'wb') as f:
                    f.write(body)
                print(f"  [save] 牌局数据已保存 -> {json_path}")
                self._send_ok_json({'status': 'ok', 'path': json_path})
            except Exception as e:
                print(f"  [save] 保存失败: {e}")
                self._send_error_json(500, str(e))

        elif self.path == '/api/proxy-analyze':
            # 直接使用本地 frontend_json_backen_sample_blur.json 请求 AI 后端
            try:
                # 使用纯文件名（os.chdir 已在脚本目录），避免 Windows 反斜杠路径问题
                json_file = 'data/frontend_json_backen_sample_blur.json'
                output_file = 'data/output.json'
                if not os.path.exists(json_file):
                    raise FileNotFoundError(f'{json_file} 不存在，请先生成牌局数据')

                print(f"  [analyze] 使用本地文件 -> {os.path.abspath(json_file)}")

                # 调用 curl 请求 AI 后端
                curl_cmd = 'curl.exe' if platform.system() == 'Windows' else 'curl'
                print(f"  [analyze] 正在请求 AI 后端...")
                result = subprocess.run(
                    [curl_cmd, '-X', 'POST',
                     'http://10.130.108.180:8765/analyze/file',
                     '-F', f'file=@{json_file}',
                     '-o', output_file],
                    capture_output=True, text=True, timeout=300
                )

                if result.returncode != 0:
                    stderr_msg = result.stderr.strip() if result.stderr else '无错误输出'
                    print(f"  [analyze] curl 返回码非零 ({result.returncode}): {stderr_msg}")
                    raise RuntimeError(f'curl 失败 (code={result.returncode}): {stderr_msg}')

                # 读取 AI 后端返回的 output.json
                if not os.path.exists(output_file):
                    raise FileNotFoundError(f'output.json 未生成，curl 可能失败（检查后端是否可达）')

                with open(output_file, 'r', encoding='utf-8') as f:
                    output_content = f.read()

                # 解码 JSON（处理可能存在的 Unicode 转义序列）
                result_json = json.loads(output_content)
                print(f"  [analyze] AI 分析完成，status={result_json.get('status', 'unknown')}")

                # 返回解码后的 JSON 给前端
                self._send_ok_json(result_json)
            except subprocess.TimeoutExpired:
                print(f"  [analyze] curl 请求超时")
                self._send_error_json(504, 'AI 后端请求超时（5分钟），请检查网络或重试')
            except FileNotFoundError as e:
                print(f"  [analyze] {e}")
                self._send_error_json(502, str(e))
            except RuntimeError as e:
                print(f"  [analyze] {e}")
                self._send_error_json(502, str(e))
            except json.JSONDecodeError as e:
                print(f"  [analyze] output.json JSON 解析失败: {e}")
                self._send_error_json(502, f'output.json 解析失败: {e}')
            except Exception as e:
                print(f"  [analyze] 未知错误: {e}")
                self._send_error_json(500, str(e))
        else:
            self.send_response(404)
            self.end_headers()

    def _send_ok_json(self, data):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def _send_error_json(self, status_code, message):
        error_body = json.dumps({'error': message, 'status': 'error'}, ensure_ascii=False)
        error_bytes = error_body.encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(error_bytes)))
        self.end_headers()
        self.wfile.write(error_bytes)

    def log_message(self, format, *args):
        print(f"  [{self.client_address[0]}] {format % args}")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        if arg.startswith("--port="):
            PORT = int(arg.split("=")[1])

    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()

    # 验证 do_POST 已加载
    print(f"  [init] CORSRequestHandler.do_POST 已定义: {hasattr(CORSRequestHandler, 'do_POST')}")
    print(f"  [init] 脚本路径: {os.path.abspath(__file__)}")
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

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止。")

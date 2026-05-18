#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
川麻将牌局分析 - HTTP 服务器版本 (Windows 兼容)
支持接收其他主机发送的 JSON 文件进行分析

使用方法:
    1. 安装依赖：pip install flask requests
    2. 运行服务器：python mahjong_http_server.py
    3. 其他主机可以通过 HTTP POST 发送 JSON 文件进行分析
"""

import json
import os
import re
from datetime import datetime
from flask import Flask, request, jsonify

# ==================== 配置区域 ====================
# 基于脚本所在目录的相对路径
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = _BASE_DIR
DATASET_DIR = _BASE_DIR

# 样本文件路径（用于 Few-Shot 学习）
SAMPLE_INPUT_PATH = os.path.join(_BASE_DIR, "input.json")
SAMPLE_OUTPUT_PATH = os.path.join(_BASE_DIR, "output.json")
STRATEGY_PATH = os.path.join(_BASE_DIR, "mahjong_strategy.md")

# 输出目录
DEFAULT_OUTPUT_DIR = _BASE_DIR

# 大模型配置（阿里云百炼 - 通义千问）
API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
API_KEY = "your-api-key"
MODEL_NAME = "qwen3.5-plus"

# 服务器配置
SERVER_HOST = "0.0.0.0"  # 监听所有网络接口
SERVER_PORT = 8888       # 服务端口
# ==================== 配置区域 ====================


# ==================== Prompt 模板区域 ====================
SYSTEM_PROMPT_TEMPLATE = """你是一位专业的川麻（四川麻将）教练。请根据以下牌局信息进行分析，并给出专业建议。

## 川麻规则要点
- 只有 108 张牌：万子、筒子、索子各 36 张（每种牌 1-9 点，各 4 张）
- 没有字牌（东、南、西、北、中、发、白）
- 必须缺一门（万、筒、索中缺一门）
- 每人手牌 13 张（摸牌后 14 张）
- 可以碰、杠，不能吃牌

---

## 示例牌局信息（学习样本）
{{GAME_STATE_JSON}}

---

## 示例分析结果（学习样本）
{{GAME_ADVISE_JSON}}

---

## 川麻策略指南
{{STRATEGY_MD}}

---

## 真实牌局（待分析）
{{GAME_REAL_JSON}}

---

## 分析要求

请学习上述**示例牌局信息**和**示例分析结果**的格式与思路，结合**川麻策略指南**，对**真实牌局**进行分析。

### 判断回合类型：
1. 如果 global.status == "my_hand": 是我的回合，需要分析打什么牌
2. 如果 global.status != "my_hand": 是其他人回合，需要根据 global.discard_tile（最新打出的牌）判断是否碰/杠/胡

### 输出格式要求：
严格按照示例分析结果的 JSON 结构，包含：
- analysis_timestamp: 分析时间戳
- game_stage: 牌局阶段（早期/中期/后期）
- turn_type: 回合类型（"my_turn"/"other_turn"）
- hand_analysis: 手牌结构分析
- hand_direction: 做牌方向
- river_analysis: 牌河分析
- opponent_info: 对手信息
- tenpai_progress: 听牌进度
- recommendation: 打牌/响应建议（如果是他人回合，需说明是否碰/杠/胡及理由）
- strategy_references: 引用的策略规则
要求至少输出两种出牌策略，每种要求分析优缺点，风险与收益的高低，以及胡牌概率。

现在请基于真实牌局信息进行分析，输出 JSON。"""


def load_json_file(path: str) -> dict:
    """加载 JSON 文件"""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_md_file(path: str) -> str:
    """加载 Markdown 文件"""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def build_prompt(
    sample_game: dict,
    sample_result: dict,
    real_game: dict,
    strategy: str
) -> str:
    """构建完整的 Prompt"""
    prompt = SYSTEM_PROMPT_TEMPLATE

    sample_game_json = json.dumps(sample_game, ensure_ascii=False, indent=2)
    sample_result_json = json.dumps(sample_result, ensure_ascii=False, indent=2)
    real_game_json = json.dumps(real_game, ensure_ascii=False, indent=2)

    prompt = prompt.replace("{{GAME_STATE_JSON}}", sample_game_json)
    prompt = prompt.replace("{{GAME_ADVISE_JSON}}", sample_result_json)
    prompt = prompt.replace("{{GAME_REAL_JSON}}", real_game_json)
    prompt = prompt.replace("{{STRATEGY_MD}}", strategy)

    return prompt


def call_llm_api(prompt: str) -> str:
    """调用 LLM API 获取分析结果"""
    import requests

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "max_tokens": 4096,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, json=payload, timeout=300)
    response.raise_for_status()
    result = response.json()

    if "choices" in result and len(result["choices"]) > 0:
        content = result["choices"][0].get("message", {}).get("content", "")
        return content
    else:
        return json.dumps(result, ensure_ascii=False)


def parse_llm_response(response_text: str) -> dict:
    """解析 LLM 响应，提取 JSON"""
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass

    json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    start = response_text.find('{')
    end = response_text.rfind('}') + 1
    if start >= 0 and end > start:
        try:
            return json.loads(response_text[start:end])
        except json.JSONDecodeError:
            pass

    raise ValueError(f"无法解析模型响应：{response_text[:500]}...")


def analyze_game(game_data: dict) -> dict:
    """执行牌局分析"""
    # 加载样本和策略
    sample_game = load_json_file(SAMPLE_INPUT_PATH)
    sample_result = load_json_file(SAMPLE_OUTPUT_PATH)
    strategy = load_md_file(STRATEGY_PATH)

    # 构建 Prompt
    prompt = build_prompt(sample_game, sample_result, game_data, strategy)

    # 调用 LLM API
    response = call_llm_api(prompt)

    # 解析响应
    analysis = parse_llm_response(response)

    return analysis


def save_analysis(analysis: dict) -> str:
    """保存分析结果，返回保存路径"""
    os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(DEFAULT_OUTPUT_DIR, f"mahjong_analysis_{timestamp}.json")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)

    return output_path


# ==================== Flask 应用 ====================
app = Flask(__name__)


# 添加请求日志中间件
@app.before_request
def log_request():
    print(f"[HTTP] {request.method} {request.path} - 来自 {request.remote_addr}")


@app.after_request
def log_response(response):
    print(f"[HTTP] 响应状态码：{response.status_code}")
    return response


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        "status": "ok",
        "service": "川麻将牌局分析服务",
        "timestamp": datetime.now().isoformat()
    })


@app.route('/config', methods=['GET'])
def get_config():
    """获取配置信息"""
    return jsonify({
        "sample_input": SAMPLE_INPUT_PATH,
        "sample_output": SAMPLE_OUTPUT_PATH,
        "strategy": STRATEGY_PATH,
        "output_dir": DEFAULT_OUTPUT_DIR,
        "model": MODEL_NAME
    })


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    牌局分析接口
    支持两种输入方式：
    1. JSON Body: 直接发送 JSON 数据
    2. File Upload: multipart/form-data 上传 JSON 文件
    """
    try:
        game_data = None

        # 尝试从请求体获取 JSON
        if request.is_json:
            game_data = request.get_json()
            print(f"[INFO] 接收到 JSON Body 请求")
        # 尝试从文件上传获取
        elif 'file' in request.files:
            file = request.files['file']
            if file.filename:
                game_data = json.load(file.stream)
                print(f"[INFO] 接收到文件上传：{file.filename}")
        else:
            return jsonify({
                "status": "error",
                "message": "无效的请求格式，请提供 JSON 数据或上传 JSON 文件"
            }), 400

        # 验证输入格式
        if not isinstance(game_data, dict):
            return jsonify({
                "status": "error",
                "message": "JSON 数据必须是对象类型"
            }), 400

        if "global" not in game_data or "players" not in game_data:
            return jsonify({
                "status": "error",
                "message": "JSON 必须包含 'global' 和 'players' 字段"
            }), 400

        print(f"[INFO] 开始分析牌局...")

        # 执行分析
        analysis = analyze_game(game_data)

        # 保存结果
        output_path = save_analysis(analysis)
        print(f"[INFO] 分析结果已保存：{output_path}")

        # 返回结果
        return jsonify({
            "status": "success",
            "message": "分析完成",
            "analysis": analysis,
            "saved_path": output_path
        })

    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON 解析错误：{e}")
        return jsonify({
            "status": "error",
            "message": f"JSON 解析错误：{str(e)}"
        }), 400

    except Exception as e:
        print(f"[ERROR] 分析失败：{e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"分析失败：{str(e)}"
        }), 500


@app.route('/analyze/file', methods=['POST'])
def analyze_file():
    """
    文件上传专用接口
    只接受 multipart/form-data 文件上传
    """
    if 'file' not in request.files:
        return jsonify({
            "status": "error",
            "message": "请上传 JSON 文件"
        }), 400

    file = request.files['file']
    if not file.filename or not file.filename.endswith('.json'):
        return jsonify({
            "status": "error",
            "message": "请上传有效的 JSON 文件"
        }), 400

    try:
        game_data = json.load(file.stream)
        analysis = analyze_game(game_data)
        output_path = save_analysis(analysis)

        return jsonify({
            "status": "success",
            "message": "分析完成",
            "analysis": analysis,
            "saved_path": output_path
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


def main():
    """主函数"""
    print("=" * 60)
    print("川麻将牌局分析 HTTP 服务器")
    print("=" * 60)
    print(f"监听地址：http://{SERVER_HOST}:{SERVER_PORT}")
    print(f"输出目录：{DEFAULT_OUTPUT_DIR}")
    print("=" * 60)
    print("可用接口:")
    print(f"  GET  /health        - 健康检查")
    print(f"  GET  /config        - 获取配置")
    print(f"  POST /analyze       - 牌局分析（支持 JSON Body 或文件上传）")
    print(f"  POST /analyze/file  - 牌局分析（仅文件上传）")
    print("=" * 60)
    print("使用示例:")
    print("  方法 1 - 直接发送 JSON:")
    print('    curl -X POST http://localhost:8888/analyze \\')
    print('         -H "Content-Type: application/json" \\')
    print('         -d @game_data.json')
    print("")
    print("  方法 2 - 上传文件:")
    print('    curl -X POST http://localhost:8888/analyze/file \\')
    print('         -F "file=@game_data.json"')
    print("")
    print("  Windows PowerShell 示例:")
    print('    Invoke-RestMethod -Uri "http://localhost:8888/analyze" \\')
    print('        -Method POST \\')
    print('        -ContentType "application/json" \\')
    print('        -Body (Get-Content -Raw -Path "game_data.json")')
    print("=" * 60)
    print("按 Ctrl+C 停止服务器")
    print("=" * 60)

    # 确保输出目录存在
    os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)

    # 启动服务器（threaded=True 允许并发处理多个请求）
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=False, threaded=True, use_reloader=False)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
川麻将牌局分析 - 测试客户端
用于测试 HTTP 服务器的分析接口
"""

import json
import os
import requests
import sys

# 服务器地址
SERVER_URL = "http://localhost:8765"


def test_health():
    """测试健康检查接口"""
    print("=" * 50)
    print("测试 1: 健康检查接口")
    print("=" * 50)

    try:
        response = requests.get(f"{SERVER_URL}/health", timeout=5)
        print(f"状态码：{response.status_code}")
        print(f"响应：{json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("错误：无法连接到服务器，请确保服务器已启动")
        return False
    except Exception as e:
        print(f"错误：{e}")
        return False


def test_config():
    """测试配置接口"""
    print("\n" + "=" * 50)
    print("测试 2: 配置接口")
    print("=" * 50)

    try:
        response = requests.get(f"{SERVER_URL}/config", timeout=5)
        print(f"状态码：{response.status_code}")
        print(f"响应：{json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"错误：{e}")
        return False


def test_analyze_json_body(input_file):
    """测试分析接口 - JSON Body 方式"""
    print("\n" + "=" * 50)
    print(f"测试 3: 分析接口 (JSON Body) - 使用文件：{input_file}")
    print("=" * 50)

    try:
        # 读取输入文件
        with open(input_file, 'r', encoding='utf-8') as f:
            game_data = json.load(f)

        # 发送请求
        response = requests.post(
            f"{SERVER_URL}/analyze",
            json=game_data,
            timeout=300
        )

        print(f"状态码：{response.status_code}")
        result = response.json()

        if result.get("status") == "success":
            print("分析成功!")
            print(f"保存路径：{result.get('saved_path')}")
            print("\n分析摘要:")
            analysis = result.get("analysis", {})
            print(f"  - 游戏阶段：{analysis.get('game_stage', 'N/A')}")
            print(f"  - 回合类型：{analysis.get('turn_type', 'N/A')}")
            if "recommendation" in analysis:
                rec = analysis["recommendation"]
                if isinstance(rec, dict):
                    print(f"  - 推荐打法：{rec.get('primary_choice', 'N/A')}")
        else:
            print(f"分析失败：{result.get('message', 'Unknown error')}")

        return response.status_code == 200

    except FileNotFoundError:
        print(f"错误：文件不存在：{input_file}")
        return False
    except requests.exceptions.Timeout:
        print("错误：请求超时（300 秒）")
        return False
    except Exception as e:
        print(f"错误：{e}")
        return False


def test_analyze_file_upload(input_file):
    """测试分析接口 - 文件上传方式"""
    print("\n" + "=" * 50)
    print(f"测试 4: 分析接口 (文件上传) - 使用文件：{input_file}")
    print("=" * 50)

    try:
        # 发送文件
        with open(input_file, 'r', encoding='utf-8') as f:
            response = requests.post(
                f"{SERVER_URL}/analyze/file",
                files={'file': (input_file, f, 'application/json')},
                timeout=300
            )

        print(f"状态码：{response.status_code}")
        result = response.json()

        if result.get("status") == "success":
            print("分析成功!")
            print(f"保存路径：{result.get('saved_path')}")
        else:
            print(f"分析失败：{result.get('message', 'Unknown error')}")

        return response.status_code == 200

    except FileNotFoundError:
        print(f"错误：文件不存在：{input_file}")
        return False
    except requests.exceptions.Timeout:
        print("错误：请求超时（300 秒）")
        return False
    except Exception as e:
        print(f"错误：{e}")
        return False


def main():
    """主函数"""
    print("=" * 60)
    print("川麻将牌局分析 - 测试客户端")
    print("=" * 60)

    # 默认输入文件（相对于脚本所在目录）
    default_input = os.path.join(os.path.dirname(os.path.abspath(__file__)), "input.json")

    # 解析命令行参数
    input_file = sys.argv[1] if len(sys.argv) > 1 else default_input

    print(f"使用输入文件：{input_file}")
    print()

    # 执行测试
    results = []

    # 测试 1: 健康检查
    results.append(("健康检查", test_health()))

    # 测试 2: 配置接口
    results.append(("配置接口", test_config()))

    # 测试 3: 分析接口 (JSON Body)
    results.append(("分析接口 (JSON Body)", test_analyze_json_body(input_file)))

    # 测试 4: 分析接口 (文件上传)
    results.append(("分析接口 (文件上传)", test_analyze_file_upload(input_file)))

    # 汇总结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"  {name}: {status}")

    print(f"\n总计：{passed}/{total} 测试通过")
    print("=" * 60)


if __name__ == "__main__":
    main()

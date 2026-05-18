# 川麻将牌局分析 HTTP 服务器 - 使用说明

## 文件说明

| 文件 | 说明 |
|------|------|
| `mahjong_http_server.py` | 主服务器脚本（Windows/Linux 兼容） |
| `start_server.bat` | Windows 一键启动脚本 |
| `test_client.py` | 测试客户端脚本 |
| `test_client.bat` | Windows 测试客户端脚本 |

## 快速开始

### Windows 用户

1. **安装 Python**（如果未安装）
   - 访问 https://www.python.org/downloads/
   - 下载并安装 Python 3.8+
   - 安装时勾选 "Add Python to PATH"

2. **安装依赖**
   ```cmd
   pip install flask requests
   ```

3. **启动服务器**
   - 双击 `start_server.bat`
   - 或者在命令行运行：`python mahjong_http_server.py`

4. **测试服务**
   - 双击 `test_client.bat` 运行测试
   - 或者浏览器访问：http://localhost:8765/health

### Linux 用户

1. **安装依赖**
   ```bash
   pip install flask requests
   ```

2. **启动服务器**
   ```bash
   python3 mahjong_http_server.py
   ```

## API 接口

### 1. 健康检查
```bash
GET /health
```

响应示例：
```json
{"status": "ok", "service": "川麻将牌局分析服务", "timestamp": "2026-05-16T21:00:00"}
```

### 2. 获取配置
```bash
GET /config
```

### 3. 牌局分析（主要接口）
```bash
POST /analyze
```

支持两种请求方式：

#### 方式 1：发送 JSON Body
```bash
curl -X POST http://localhost:8765/analyze \
     -H "Content-Type: application/json" \
     -d @game_data.json
```

Windows PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8765/analyze" `
    -Method POST `
    -ContentType "application/json" `
    -Body (Get-Content -Raw -Path "game_data.json")
```

#### 方式 2：上传文件
```bash
curl -X POST http://localhost:8765/analyze/file \
     -F "file=@game_data.json"
```

## 请求格式

JSON 文件必须包含 `global` 和 `players` 字段：

```json
{
  "global": {
    "status": "my_hand",
    "discard_tile": "",
    "river_tiles": {
      "all_tiles": ["二万", "五索", ...]
    }
  },
  "players": {
    "my_hand": {
      "dingque": "万",
      "hand_tiles": {
        "dark_tiles": ["一索", "二索", ...]
      }
    },
    "left_hand": {...},
    "right_hand": {...},
    "across_hand": {...}
  }
}
```

## 响应格式

成功响应：
```json
{
  "status": "success",
  "message": "分析完成",
  "analysis": {
    "analysis_timestamp": "2026-05-16T21:00:00",
    "game_stage": "中期",
    "turn_type": "my_turn",
    "hand_analysis": {...},
    "recommendation": {...},
    "metadata": {...}
  },
  "saved_path": "/path/to/output/mahjong_analysis_20260516_210000.json"
}
```

## 配置修改

编辑 `mahjong_http_server.py` 顶部的配置区域：

```python
# 路径配置（Windows 用户请根据实际情况修改）
BASE_DIR = r"C:\mahjong\dataset"  # Windows 路径示例
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# API 配置
API_KEY = "your-api-key-here"
MODEL_NAME = "qwen3.5-plus"

# 服务器配置
SERVER_PORT = 8765  # 可修改端口
```

## 网络访问

服务器默认监听 `0.0.0.0:8765`，局域网内其他设备可以通过以下方式访问：

1. 查看本机 IP 地址：
   - Windows: `ipconfig`
   - Linux: `ip addr`

2. 其他设备访问：
   ```bash
   curl http://<你的 IP>:8765/analyze ...
   ```

3. 如果无法访问，请检查防火墙设置：
   - Windows: 允许 Python 通过防火墙
   - Linux: `sudo ufw allow 8765`

## 常见问题

**Q: 提示 "ModuleNotFoundError: No module named 'flask'"**
A: 运行 `pip install flask requests` 安装依赖

**Q: 服务启动后无法访问**
A: 检查防火墙是否开放了 8765 端口

**Q: API 调用超时**
A: 检查网络连接和 API Key 是否有效

**Q: 分析结果为空或报错**
A: 确保输入的 JSON 格式正确，包含必需的 `global` 和 `players` 字段

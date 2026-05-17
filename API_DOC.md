# 川麻小白助手 — 前后端接口文档

## 基础信息

| 项目 | 值 |
|------|-----|
| Base URL | `http://<后端IP>:8765` |
| 编码 | UTF-8 |
| 超时 | 建议 30s（图片识别可能较慢） |

---

## 接口一：拍照识别牌局

游戏开始时 / 需要初始化牌桌时调用。前端传照片，后端返回识别后的牌桌数据。

### 请求

```
POST /api/recognize
Content-Type: multipart/form-data
```

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `image` | File | 是 | 牌桌照片（jpg/png），建议 ≤10MB |

### 响应

**Content-Type:** `application/json`

**响应体** 即为 [游戏状态 JSON](#游戏状态-json-格式)（见下文），后端直接原样返回牌桌快照。

**字段填充要求：**

| 字段 | 填充说明 |
|------|---------|
| `global.recognition_quality` | **必填**，`"high"` / `"medium"` / `"low"` |
| `global.personal_river_visible` | 根据识别质量判断：能分辨每家出牌 → `true`；不能 → `false` |
| `global.river_tiles` | `personal_river_visible` 为 `false` 时必须填充（混合河牌） |
| `players.*.dingque` | 能识别的填 `"万"/"筒"/"索"`，看不清的填 `null` |
| `players.*.dark_tiles` | 仅 `my_hand` 填充（我方手牌），对手始终为 `[]` |
| `players.*.personal_river_tiles` | `personal_river_visible` 为 `true` 时分别填充各家出牌；为 `false` 时各家均为空数组 `[]` |

**成功响应：** HTTP 200，body 为完整游戏状态 JSON

**失败响应：**
```json
{
  "error": true,
  "message": "识别失败：照片中未检测到完整牌桌"
}
```

---

## 接口二：AI 出牌建议

对局中途，用户点击"请求AI分析出牌建议"。前端将当前牌桌上的所有已知信息打包为 JSON 文件，通过 multipart/form-data 上传给后端，后端返回分析结果。

### 请求

```
POST /analyze/file
Content-Type: multipart/form-data
```

**参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | JSON 文件，内容为 [游戏状态 JSON](#游戏状态-json-格式)，文件名建议 `game_state.json` |

前端通过 `buildRequestPayload()` 构建游戏状态 JSON，然后以 `Blob` + `FormData` 形式上传：

```javascript
const payload = buildRequestPayload();
const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
const formData = new FormData();
formData.append('file', blob, 'game_state.json');
fetch(API_URL + '/analyze/file', { method: 'POST', body: formData });
```

| 数据来源 | 对应字段 | 说明 |
|---------|---------|------|
| 我方手牌（暗牌） | `players.my_hand.hand_tiles.dark_tiles` | 我方的暗牌列表，按花色+数字排序（万→筒→索，1→9） |
| 我方明牌（碰/杠） | `players.my_hand.hand_tiles.bright_tiles` | 碰牌 `{"type":"peng","values":[...]}`；杠牌 `{"type":"gang","gangType":"ming_gang/an_gang/bu_gang","gangTarget":...,"values":[...]}` |
| 四家定缺 | `players.*.dingque` | `"万"` / `"筒"` / `"索"` / `null` |
| 四家出牌河（清晰模式） | `players.*.personal_river_tiles.all_tiles` | 每家各自打出的牌列表，按出牌顺序 |
| 混合河牌（模糊模式） | `global.river_tiles.all_tiles` | 所有打出的牌混在一起，无法分辨是谁打的 |
| 当前回合 | `global.status` | `"my_hand"` / `"left_hand"` / `"right_hand"` / `"across_hand"` |
| 牌源模式 | `global.personal_river_visible` | `true` = 清晰（各家出牌分列），`false` = 模糊（混合公共河牌） |
| 胡牌信息 | `players.*.hu_info` | 当前是否已胡牌、胡的哪张、自摸还是点炮、点炮者 |
| 各玩家总牌数 | `players.*.hand_tiles.total_count` | 暗牌 + 明牌的总张数 |
| 用户自定义提问 | `global.user_messages` | 用户在界面上方输入的自定义问题文本；未输入时为 `null` |

### 请求体示例

**牌源清晰模式** (`personal_river_visible: true`)：

```json
{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-17 10:30:00",
    "image_path": "",
    "user_messages": null,
    "status": "my_hand",
    "discard_tile": "",
    "personal_river_visible": true,
    "river_tiles": { "all_tiles": [] }
  },
  "players": {
    "my_hand": {
      "dingque": "万",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 14,
        "dark_tiles": ["一筒","二筒","四筒","五筒","七筒","八筒","九筒","一索","三索","五索","七索"],
        "bright_tiles": [{ "type": "peng", "values": ["六筒","六筒","六筒"] }]
      },
      "personal_river_tiles": { "all_tiles": ["一万","二万","三万","六万","八万"] }
    },
    "left_hand": {
      "dingque": "筒",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "gang", "gangType": "ming_gang", "gangTarget": "right_hand", "values": ["七万","七万","七万","七万"] }]
      },
      "personal_river_tiles": { "all_tiles": ["三筒","五筒","九筒"] }
    },
    "right_hand": {
      "dingque": "索",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "peng", "values": ["九万","九万","九万"] }]
      },
      "personal_river_tiles": { "all_tiles": ["二索","四索","八索"] }
    },
    "across_hand": {
      "dingque": null,
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": { "total_count": 13, "dark_tiles": [], "bright_tiles": [] },
      "personal_river_tiles": { "all_tiles": ["四万","七筒","一索"] }
    }
  }
}
```

**牌源模糊模式** (`personal_river_visible: false`)：

```json
{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-17 10:30:00",
    "image_path": "",
    "user_messages": null,
    "status": "my_hand",
    "discard_tile": "",
    "personal_river_visible": false,
    "river_tiles": {
      "all_tiles": ["一万","二万","三万","六万","八万","三筒","五筒","九筒","二索","四索","八索","四万","七筒","一索"]
    }
  },
  "players": {
    "my_hand": {
      "dingque": "万",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 14,
        "dark_tiles": ["一筒","二筒","四筒","五筒","七筒","八筒","九筒","一索","三索","五索","七索"],
        "bright_tiles": [{ "type": "peng", "values": ["六筒","六筒","六筒"] }]
      },
      "personal_river_tiles": { "all_tiles": [] }
    },
    "left_hand": {
      "dingque": "筒",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "gang", "gangType": "ming_gang", "gangTarget": "right_hand", "values": ["七万","七万","七万","七万"] }]
      },
      "personal_river_tiles": { "all_tiles": [] }
    },
    "right_hand": {
      "dingque": "索",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "peng", "values": ["九万","九万","九万"] }]
      },
      "personal_river_tiles": { "all_tiles": [] }
    },
    "across_hand": {
      "dingque": null,
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": { "total_count": 13, "dark_tiles": [], "bright_tiles": [] },
      "personal_river_tiles": { "all_tiles": [] }
    }
  }
}
```

> **两种模式的区别：** 清晰模式下各家 `personal_river_tiles` 分别填充各自打出的牌，`global.river_tiles` 为空。模糊模式下各家 `personal_river_tiles` 均为空，所有打出牌合并到 `global.river_tiles` 中。

### 响应

**Content-Type:** `application/json`

后端返回的 JSON 包含外层状态信息和内层分析数据：

```json
{
  "status": "success",
  "message": "分析完成",
  "saved_path": "E:\\games4majong\\brain\\brain\\mahjong_analysis_20260517_103509.json",
  "analysis": {
    "analysis_timestamp": "2026-05-16T21:35:10.123456",
    "game_stage": "中后期",
    "turn_type": "my_turn",
    "hand_analysis": { "...": "..." },
    "recommendation": { "...": "..." },
    "...": "..."
  }
}
```

| 外层字段 | 类型 | 说明 |
|---------|------|------|
| `status` | string | `"success"` 成功 / `"error"` 失败 |
| `message` | string | 状态描述（如 `"分析完成"`） |
| `saved_path` | string | 后端保存分析结果的文件路径 |
| `analysis` | object | 内层分析数据，结构与下文 [响应字段说明](#响应字段说明) 一致 |

> 前端通过 `result.analysis` 解包后再传给 `renderAIResponse()` 渲染。内层 `analysis` 对象的字段定义与下方"响应字段说明"表完全一致。

**响应字段说明：**（指 `analysis` 内部结构）

| 字段 | 类型 | 说明 |
|------|------|------|
| `analysis_timestamp` | string | 分析时间戳（ISO 格式） |
| `game_stage` | string | 对局阶段：`"前期"` / `"中期"` / `"中后期"` / `"后期"` |
| `turn_type` | string | 当前轮到谁：`"my_turn"` 表示轮到我方 |
| `hand_analysis` | object | 手牌分析（花色分布、缺门、手牌结构、总张数） |
| `hand_analysis.suit_distribution` | object | 花色分布：键为 `"万子"/"筒子"/"索子"`，值为张数 |
| `hand_analysis.missing_suit` | string | 缺门花色（`"万子"/"筒子"/"索子"`） |
| `hand_analysis.missing_suit_status` | string | 缺门清理状态：`"已清完"` 等 |
| `hand_analysis.hand_structure` | object | 手牌结构分析（刻子、对子、顺子潜力、孤张） |
| `hand_analysis.total_tiles` | number | 总牌数 |
| `hand_direction` | string | 做牌方向：`"平胡（混色）"` / `"清一色（索子）"` 等 |
| `river_analysis` | object | 河牌分析：`suosu/tongzi/wanzi` 分别为各花色已出牌计数，`key_insights` 为关键洞察 |
| `opponent_info` | object | 三家对手分析（`left_hand/right_hand/across_hand`），含定缺、明牌、威胁度；`summary` 为对手局势总结 |
| `opponent_info.*.threat_level` | string | 威胁度：`"高"` / `"中"` / `"低"` / `"无"` |
| `tenpai_progress` | object | 听牌进度：向听数、目标牌型、牌效、受阻牌列表 |
| `recommendation` | object | AI 推荐（首选/备选出牌、策略列表、推理原因、决策矩阵） |
| `recommendation.strategies` | array | 多个出牌策略，含风险/收益评级、优缺点、胜率、预期值、后续建议 |
| `recommendation.decision_matrix` | object | 决策矩阵：键为玩家类型（激进型/稳健型/观察型），值为对应的推荐 |
| `strategy_references` | array | 引用的策略规则编号及说明 |
| `summary` | string | 局势总结与建议 |
| `metadata` | object | 元数据：模型名称 `model`、分析时间戳 `analysis_timestamp` |

> 后端可根据模型能力扩展字段，前端按 key 读取。上述字段名与 `demo.js` 中 `renderAIResponse()` 及示例 JSON 文件（`ai-json-fronten-new1.json`、`ai-json-fronten-new2.json`）对齐。

### 关于编码（Unicode 转义）

后端返回的 JSON 中，中文字符可能以 `\uXXXX` 转义形式出现（如 `早期` 表示 `早期`）。这是合法的 JSON 标准格式，浏览器端 `JSON.parse()` 会**自动将 `\uXXXX` 解码为实际中文字符**，前端渲染无需做任何额外处理。

> 如需在本地查看可读的 JSON（如 `curl -o` 保存的文件），可用 Python 一行转换：
> ```bash
> python -c "import json; json.dump(json.load(open('output.json')), open('output_readable.json','w'), ensure_ascii=False, indent=2)"
> ```

---

## 游戏状态 JSON 格式

### 字段定义

```json
{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则说明",
    "analysis_date": "2026-05-17 10:30:00",
    "image_path": "",
    "user_messages": null,
    "status": "my_hand",
    "discard_tile": "",
    "recognition_quality": null,
    "personal_river_visible": true,
    "river_tiles": { "all_tiles": [] }
  },
  "players": {
    "my_hand": {
      "dingque": "万",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 14,
        "dark_tiles": [],
        "bright_tiles": []
      },
      "personal_river_tiles": { "all_tiles": [] }
    },
    "left_hand": { "... 同上 ..." },
    "right_hand": { "... 同上 ..." },
    "across_hand": { "... 同上 ..." }
  }
}
```

### 字段详解

#### global

| 字段 | 类型 | 说明 |
|------|------|------|
| `game_type` | string | 固定 `"四川麻将"` |
| `notes` | string | 规则备注 |
| `analysis_date` | string | 请求时间，格式 `YYYY-MM-DD HH:MM:SS` |
| `image_path` | string | 图片路径（暂留空） |
| `user_messages` | string / null | 用户自定义提问消息，如"上家出了五筒，我怎么出牌胡牌几率更大"。前端请求时若用户未填写则为 `null`，填写则为对应字符串 |
| `status` | string | 当前轮到谁出牌：`"my_hand"` / `"left_hand"` / `"right_hand"` / `"across_hand"` |
| `discard_tile` | string | 当 status≠my_hand 时，该玩家刚打出的牌（如 `"五筒"`）；status=my_hand 时为空 |
| `recognition_quality` | string / null / 不存在 | **仅识别接口返回**：`"high"` / `"medium"` / `"low"`；分析接口请求体中不包含此字段 |
| `personal_river_visible` | boolean | 牌源模式：`true` = 清晰，`false` = 模糊 |
| `river_tiles.all_tiles` | array | 公共混合河牌（仅模糊模式有值，清晰模式为 `[]`） |

#### players.<player>

| 字段 | 类型 | 说明 |
|------|------|------|
| `dingque` | string / null | 定缺花色：`"万"` / `"筒"` / `"索"` / `null`（未知） |
| `hu_info.is_hu` | boolean | 是否已胡牌 |
| `hu_info.hu_tile` | string / null | 胡的那张牌（如 `"五筒"`） |
| `hu_info.hu_type` | string / null | 胡牌方式：`"self_draw"`（自摸）/ `"dian_pao"`（点炮） |
| `hu_info.provider` | string / null | 点炮者：`"my_hand"` / `"left_hand"` / `"right_hand"` / `"across_hand"`；自摸为 `null` |
| `hand_tiles.total_count` | number | 玩家当前总牌数（暗牌 + 明牌） |
| `hand_tiles.dark_tiles` | array | 暗牌列表（仅 `my_hand` 填充，对手为空 `[]`） |
| `hand_tiles.bright_tiles` | array | 明牌列表，见下方 `bright_tile` 结构 |
| `personal_river_tiles.all_tiles` | array | 该玩家打出的牌列表（清晰模式填充，模糊模式为 `[]`） |

#### bright_tile 结构

```json
// 碰
{ "type": "peng", "values": ["六筒", "六筒", "六筒"] }

// 杠（明杠 / 暗杠 / 补杠）
{ "type": "gang", "gangType": "ming_gang", "gangTarget": "right_hand", "values": ["七万","七万","七万","七万"] }
{ "type": "gang", "gangType": "an_gang",  "gangTarget": null,         "values": ["五索","五索","五索","五索"] }
{ "type": "gang", "gangType": "bu_gang", "gangTarget": null,          "values": ["九筒","九筒","九筒","九筒"] }

// 胡
{ "type": "hu", "huType": "dian_pao", "huTarget": "right_hand", "values": ["五筒"] }
{ "type": "hu", "huType": "self_draw", "huTarget": null, "values": ["五筒"] }
```

### 牌张命名规范

所有牌张使用中文表示：数字（一二三四五六七八九）+ 花色（万/筒/索）。

例：`"一万"` `"五筒"` `"九索"`

### 一致性约束

| 规则 | 说明 |
|------|------|
| 定缺与手牌/明牌不冲突 | `dingque = "万"` → 暗牌和碰/杠中不能出现万字 |
| 单张牌最多4张 | 跨所有玩家的手牌 + 明牌 + 河牌，同一张牌总计 ≤ 4 |
| `total_count` 准确 | `total_count = dark_tiles.length + bright_tiles中各values数组长度之和` |
| 当前回合牌数 | 轮到出牌的玩家：`total_count` = 基础值 + 1（刚摸牌未打）；其他玩家 = 基础值（13 + 杠数补偿） |
| `gangTarget` 格式 | 明杠时填被杠玩家 key（`"my_hand"` / `"left_hand"` / `"right_hand"` / `"across_hand"`）；暗杠/补杠为 `null` |
| `huTarget` 格式 | 点炮时填点炮玩家 key；自摸为 `null` |

---

## 联调步骤建议

### 一、模拟数据开关（demo.js 顶部）

前端内置了两个开关，开发/演示时使用模拟数据，联调时一键切换到真实后端：

```javascript
// demo.js 第10-11行
const USE_MOCK_AI = true;         // AI分析：true=内嵌模拟JSON, false=真实POST /api/analyze
const USE_MOCK_RECOGNIZE = true;  // 照片识别：true=直接载入SAMPLE, false=真实POST /api/recognize
```

| 联调阶段 | USE_MOCK_RECOGNIZE | USE_MOCK_AI | 说明 |
|---------|-------------------|-------------|------|
| 纯前端开发/演示 | `true` | `true` | 不依赖后端，使用内嵌模拟数据 |
| 只测识别接口 | `false` | `true` | 拍照走真实后端识别，AI分析使用模拟数据 |
| 只测分析接口 | `true` | `false` | 手动录入或用示例牌局，AI分析走真实后端 |
| 全链路联调 | `false` | `false` | 两个接口都走真实后端 |

> **联调时只需将对应开关改为 `false` 即可，无需改动其他任何代码。**

### 二、模拟数据说明

| 开关 | 模拟数据来源 | 数据文件 |
|------|------------|---------|
| `USE_MOCK_RECOGNIZE=true` | 内置 `SAMPLE_GAME_DATA` 常量 | `frontend_json_backen_sample.json` |
| `USE_MOCK_AI=true` | 内置 `MOCK_AI_DATA` 常量 | `ai-json-fronten-new1.json`（平胡混色场景） |

模拟模式会延时 500ms 模拟网络延迟，让"分析中..."状态可见。

### 三、联调步骤

1. **后端确认接口 URL**：告知前端实际的 Base URL，修改 `demo.js` 第5行 `API_URL`
2. **测试接口一（照片识别）**：设置 `USE_MOCK_RECOGNIZE=false` → 前端点击拍照 → 选择照片 → 后端返回 JSON → 牌桌渲染
3. **测试接口二（AI 分析）**：设置 `USE_MOCK_AI=false` → 手动录入牌局 → 点击"请求AI分析出牌建议" → 后端返回建议 → 页面展示分析结果
4. **离线测试**：后端可把返回的 JSON 保存为文件，前端用"加载"按钮直接读取测试渲染
5. **数据格式验证**：前后端可使用 `frontend_json_backen_sample.json`（清晰模式）和 `frontend_json_backen_sample_blur.json`（模糊模式）作为牌桌数据联调基准；使用 `ai-json-fronten-new1.json` 和 `ai-json-fronten-new2.json` 作为 AI 响应数据联调基准

---

## 错误码约定

| HTTP 状态码 | 含义 |
|-------------|------|
| 200 | 成功 |
| 400 | 请求参数有误（照片不合法 / JSON 格式错误 / 必填字段缺失） |
| 500 | 服务器内部错误（模型调用失败等） |

错误响应统一格式：
```json
{ "error": true, "message": "具体错误描述" }
```

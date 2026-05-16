# 模板

{
  // ========== 全局字段 ==========
  "global": {
    "game_type": "",            // 游戏类型，如 "四川麻将"
    "notes": "",                // 对 game_type 的具体说明
    "analysis_date": "",        // 分析时间，格式 YYYY-MM-DD HH:MM:SS
    "image_path": "",           // 麻将牌局截图路径（暂留空）
    "back_up1": null,           // 消息历史记录（后续接入）
    "status": "",               // 当前轮到谁，取值: "my_hand"/"left_hand"/"right_hand"/"across_hand"
    "discard_tile": ""          // status 不是 my_hand 时：该玩家刚打出的牌（如 "五筒"）；status 是 my_hand 时为空（等我方 AI 建议出牌）
  },

  // ========== 四家字段 ==========
  "players": {
    "my_hand": {
      "dingque": "",            // 定缺花色，取值: "万"/"筒"/"索"/null
      "hand_tiles": {
        "total_count": 0,       // 玩家当前总牌数（暗牌 + 明牌）
        "dark_tiles": [],       // 我方已知的暗牌（对手不知道的手牌）。对其他玩家该数组通常为空（不知道具体手牌）
        "bright_tiles": [       // 明牌（碰/杠，所有人可见）
          {
            "type": "peng",     // "peng"=碰
            "values": []        // 碰的 3 张牌
          },
          {
            "type": "gang",
            "gangType": "",     // "ming_gang"=明杠 / "an_gang"=暗杠 / "bu_gang"=补杠
            "gangTarget": null, // 明杠时填被杠的玩家，如 "right_hand"；暗杠/补杠为 null
            "values": []        // 杠的 4 张牌
          }
        ]
      },
      "river_tiles": {
        "all_tiles": []         // 打出的牌列表（按出牌顺序）
      }
    },
    "left_hand": {
      "dingque": "",
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    },
    "right_hand": {
      "dingque": "",
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    },
    "across_hand": {
      "dingque": "",
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    }
  }
}

# 例子

{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-16 21:34:52",
    "image_path": "",
    "back_up1": "room_88888",
    "status": "my_hand",
    "discard_tile": ""
  },
  "players": {
    "my_hand": {
      "dingque": "索",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": ["一万", "一万", "二万", "五万", "八万", "四筒", "五筒", "七筒", "九筒", "三索"],
        "bright_tiles": [
          {
            "type": "peng",
            "values": ["三索", "三索", "三索"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["三万", "四万", "二索", "五筒", "六万", "八筒"]
      }
    },
    "left_hand": {
      "dingque": "万",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "gang",
            "gangType": "ming_gang",
            "gangTarget": "my_hand",
            "values": ["一万", "一万", "一万", "一万"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["二万", "五万", "四索", "六索", "七筒"]
      }
    },
    "right_hand": {
      "dingque": "筒",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "gang",
            "gangType": "an_gang",
            "gangTarget": null,
            "values": ["五万", "五万", "五万", "五万"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["四万", "六万", "一索", "五索", "九索", "三筒", "五筒", "七筒"]
      }
    },
    "across_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "peng",
            "values": ["八万", "八万", "八万"]
          },
          {
            "type": "gang",
            "gangType": "bu_gang",
            "gangTarget": null,
            "values": ["四筒", "四筒", "四筒", "四筒"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["九万", "七索", "九索", "八筒"]
      }
    }
  }
}

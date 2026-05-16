# 模板

{
  // ========== 全局字段 ==========
  "global": {
    "game_type": "",            // 游戏类型，如 "四川麻将"
    "notes": "",                // 对 game_type 的具体说明
    "analysis_date": "",        // 分析时间，格式 YYYY-MM-DD HH:MM:SS
    "image_path": "",           // 麻将牌局截图路径
    "back_up1": null,           // 冗余备用字段
    "status": "",               // 当前轮到谁，取值: "my_hand"/"left_hand"/"right_hand"/"across_hand"
    "discard_tile": ""          // 当前回合打出的牌，如 "五筒"
  },

  // ========== 四家字段 ==========
  "players": {
    "my_hand": {
      "hand_tiles": {
        "total_count": 0,       // = dark_tiles牌数 + bright_tiles中所有values牌数之和
        "dark_tiles": [],       // 别人不知道的手牌（暗牌）
        "bright_tiles": [       // 别人知道的手牌（碰/杠）
          {
            "type": "peng",     // "peng"=碰, "gang"=杠
            "values": []        // 碰的3张牌，或杠的4张牌
          },
          {
            "type": "gang",
            "gangType": "",     // "ming_gang" / "an_gang" / "bu_gang" 分别代码明杠/暗杠/补杠
            "gangTarget": null, // 明杠时填被杠的玩家，如 "right_hand"；暗杠/补杠为 null
            "values": []
          }
        ]
      },
      "river_tiles": {
        "total_count": 0,       // 打出牌总数
        "all_tiles": []         // 打出的具体牌列表（按顺序）
      }
    },
    "left_hand": {
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "total_count": 0, "all_tiles": [] }
    },
    "right_hand": {
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "total_count": 0, "all_tiles": [] }
    },
    "across_hand": {
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "total_count": 0, "all_tiles": [] }
    }
  }
}

# 例子

{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-16 21:34:52",
    "image_path": "/screenshots/chuanma_game_001.png",
    "back_up1": "room_88888",
    "status": "my_hand",
    "discard_tile": "六筒"
  },
  "players": {
    "my_hand": {
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
        "total_count": 6,
        "all_tiles": ["三万", "四万", "二索", "五筒", "六万", "八筒"]
      }
    },
    "left_hand": {
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
        "total_count": 5,
        "all_tiles": ["二万", "五万", "四索", "六索", "七筒"]
      }
    },
    "right_hand": {
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
        "total_count": 8,
        "all_tiles": ["四万", "六万", "一索", "五索", "九索", "三筒", "五筒", "七筒"]
      }
    },
    "across_hand": {
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
        "total_count": 4,
        "all_tiles": ["九万", "七索", "九索", "八筒"]
      }
    }
  }
}
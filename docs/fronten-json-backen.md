# 模板

{
  // ========== 全局字段 ==========
  "global": {
    "game_type": "",            // 游戏类型，默认"四川麻将"
    "notes": "",                // 对 game_type 的具体说明
    "analysis_date": "",        // 当前时间，格式 YYYY-MM-DD HH:MM:SS
    "image_path": "",           // 麻将牌局截图路径（暂留空）
    "user_messages": null,           // 用户手动提问的消息
    "status": "",               // 当前轮到谁，取值: "my_hand"/
    
    
    
    "left_hand"/"right_hand"/"across_hand"
    "discard_tile": ""  // status 不是 my_hand 时：该玩家刚打出的牌（如 "五筒"）；status 是 my_hand 时为空（等我方 AI 建议出牌）
    "personal_river_visible": "",  // 用户是否清晰牌源，清晰是true，模糊是false
    "river_tiles": {
      "all_tiles": []
    }  // 公共牌区打出的牌
  },

  // ========== 四家字段 ==========
  "players": {
    "my_hand": {
      "dingque": "",            // 定缺花色，取值: "万"/"筒"/"索"/null
       "hu_info": {
        "is_hu": "", // 是否胡牌，胡牌是true，没胡牌是false
        "hu_tile": null, // 胡牌情况下，胡的是哪一张牌，每胡牌就是NULL
        "hu_type": null, // 胡牌情况下，只有自摸，点炮两种情况，没胡牌就是NULL
        "provider": null // 胡牌情况下谁点的，自摸的情况下就是自己点的，没胡牌也是NULL
      },
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
      "hu_info": {
        "is_hu": "", // 是否胡牌，胡牌是true，没胡牌是false
        "hu_tile": null, // 胡牌情况下，胡的是哪一张牌，每胡牌就是NULL
        "hu_type": null, // 胡牌情况下，只有自摸，点炮两种情况，没胡牌就是NULL
        "provider": null // 胡牌情况下谁点的，自摸的情况下就是自己点的，没胡牌也是NULL
      },
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    },
    "right_hand": {
      "dingque": "",
      "hu_info": {
        "is_hu": "", // 是否胡牌，胡牌是true，没胡牌是false
        "hu_tile": null, // 胡牌情况下，胡的是哪一张牌，每胡牌就是NULL
        "hu_type": null, // 胡牌情况下，只有自摸，点炮两种情况，没胡牌就是NULL
        "provider": null // 胡牌情况下谁点的，自摸的情况下就是自己点的，没胡牌也是NULL
      },
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    },
    "across_hand": {
      "dingque": "",
      "hu_info": {
        "is_hu": "", // 是否胡牌，胡牌是true，没胡牌是false
        "hu_tile": null, // 胡牌情况下，胡的是哪一张牌，每胡牌就是NULL
        "hu_type": null, // 胡牌情况下，只有自摸，点炮两种情况，没胡牌就是NULL
        "provider": null // 胡牌情况下谁点的，自摸的情况下就是自己点的，没胡牌也是NULL
      },
      "hand_tiles": { "total_count": 0, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    }
  }
}

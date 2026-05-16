# 用例1

{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-16 21:00:00",
    "image_path": "",
    "back_up1": null,
    "status": "my_hand",
    "discard_tile": ""
  },
  "players": {
    "my_hand": {
      "dingque": "索",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": ["一万", "二万", "三万", "四万", "五万", "六万", "七万", "八万", "九万", "一筒", "二筒", "三筒", "四筒"],
        "bright_tiles": []
      },
      "river_tiles": {
        "all_tiles": ["五筒"]
      }
    },
    "left_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": []
      },
      "river_tiles": {
        "all_tiles": []
      }
    },
    "right_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": []
      },
      "river_tiles": {
        "all_tiles": []
      }
    },
    "across_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": []
      },
      "river_tiles": {
        "all_tiles": []
      }
    }
  }
}

# 用例2

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

# 用例3

{
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-16 22:15:30",
    "image_path": "",
    "back_up1": "room_88888",
    "status": "across_hand",
    "discard_tile": "九索"
  },
  "players": {
    "my_hand": {
      "dingque": "索",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": ["七万"],
        "bright_tiles": [
          {
            "type": "peng",
            "values": ["一万", "一万", "一万"]
          },
          {
            "type": "gang",
            "gangType": "bu_gang",
            "gangTarget": null,
            "values": ["三索", "三索", "三索", "三索"]
          },
          {
            "type": "peng",
            "values": ["五筒", "五筒", "五筒"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["二万", "三万", "四万", "五万", "六万", "八万", "九万", "一索", "二索", "四索", "五索", "六索", "七索", "八索", "一筒"]
      }
    },
    "left_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "gang",
            "gangType": "an_gang",
            "gangTarget": null,
            "values": ["二万", "二万", "二万", "二万"]
          },
          {
            "type": "peng",
            "values": ["六索", "六索", "六索"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["一万", "三万", "四万", "五万", "七万", "八万", "九万", "二索", "五索", "七索", "八索", "九索"]
      }
    },
    "right_hand": {
      "dingque": null,
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "peng",
            "values": ["四万", "四万", "四万"]
          },
          {
            "type": "gang",
            "gangType": "ming_gang",
            "gangTarget": "my_hand",
            "values": ["六筒", "六筒", "六筒", "六筒"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["一万", "二万", "三万", "五万", "六万", "七万", "八万", "九万", "一索", "二索"]
      }
    },
    "across_hand": {
      "dingque": "万",
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [
          {
            "type": "gang",
            "gangType": "bu_gang",
            "gangTarget": null,
            "values": ["八万", "八万", "八万", "八万"]
          }
        ]
      },
      "river_tiles": {
        "all_tiles": ["一万", "二万", "三万", "四万", "五万", "六万", "七万", "九万", "一索"]
      }
    }
  }
}

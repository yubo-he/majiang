// ═══════════════════════════════════════
//  常量
// ═══════════════════════════════════════
const SUIT_NAME = { W: '万', T: '筒', B: '索' };
const API_URL = 'http://192.168.30.124:8765';  // 后端接口地址，按需修改

// ═══════════════════════════════════════
//  模拟数据开关（联调时全部改为 false）
// ═══════════════════════════════════════
const USE_MOCK_AI = false;         // AI分析：true=内嵌模拟JSON, false=真实POST /api/analyze
const USE_MOCK_RECOGNIZE = true;  // 照片识别：true=直接载入SAMPLE, false=真实POST /api/recognize

// 模拟 AI 分析返回数据（来自 ai-json-fronten-new1.json — 平胡混色场景）
const MOCK_AI_DATA = {"analysis_timestamp":"2026-05-16T21:35:10.123456","game_stage":"中后期","turn_type":"my_turn","hand_analysis":{"suit_distribution":{"万子":0,"筒子":5,"索子":9},"missing_suit":"万子","missing_suit_status":"已清完","hand_structure":{"triplets":[],"pairs":[{"tile":"一索","count":2},{"tile":"四索","count":2},{"tile":"四筒","count":2}],"sequences_potential":[{"tiles":"三四五索","status":"已成顺","needs":"无"},{"tiles":"七八九索","status":"已成顺","needs":"无"},{"tiles":"七八筒","status":"搭子","needs":"六筒/九筒"}],"isolated_tiles":[{"tile":"三筒","reason":"邻张四筒为对子，三筒成搭效率低，且为单张"}]},"total_tiles":14},"hand_direction":"平胡（混色）","river_analysis":{"suosu":{"五索":1,"七索":2},"tongzi":{"二筒":3,"五筒":1,"八筒":1},"wanzi":{"二万":3,"四万":1,"五万":2,"六万":2,"七万":1,"八万":2,"九万":4},"key_insights":["九万已明杠（绝张）","二筒河内 3 张（剩余 1 张）","八筒河内 1 张（剩余 3 张）","三筒河内 0 张（剩余 4 张）"]},"opponent_info":{"left_hand":{"dingque":"万","exposed":"六索碰","threat_level":"高"},"right_hand":{"dingque":"筒","exposed":"无","threat_level":"中"},"across_hand":{"dingque":"未知","exposed":"九万明杠","threat_level":"无"},"summary":"对家已胡牌出局。下家缺万碰六索，索子需求大；上家缺筒，筒子为安全花色。"},"tenpai_progress":{"current_shanten":"1 向听","target":"平胡","efficiency":"高","blocked_tiles":["二筒","九万"]},"recommendation":{"primary_choice":"打三筒","secondary_choice":"打八筒","strategies":[{"strategy_id":1,"strategy_name":"打三筒 - 效率与安全平衡","action":"打出三筒","reasoning":"三筒为孤张（四筒为对子），保留七八筒搭子听牌面更广。上家缺筒，打筒子相对安全（上家无法胡筒子）。下家缺万，可能胡筒子，但三筒未现河，风险可控。","direction":"平胡速听","advantages":["保留七八筒好搭子","利用上家缺筒规则避险","手牌结构最优，维持 1 向听"],"risks":["三筒为生张，下家可能听牌","若四筒被碰，手牌结构受损"],"risk_level":"中","reward_level":"高","win_probability":"50%-60%","expected_value":"高收益中风险"},{"strategy_id":2,"strategy_name":"打八筒 - 绝对安全优先","action":"打出八筒","reasoning":"八筒河内已现 1 张，熟张度高于三筒。若判断下家已听牌，打熟张八筒可降低点炮率。但会破坏七八筒搭子，降低胡牌效率。","direction":"防守优先","advantages":["八筒为熟张，安全性高于三筒","利用上家缺筒规则避险","避免打生张三筒的风险"],"risks":["破坏七八筒搭子，听牌进度后退","手牌剩单张七筒，效率降低","可能错失快速胡牌机会"],"risk_level":"低","reward_level":"低","win_probability":"30%-40%","expected_value":"低收益低风险"}],"reasoning":"上家缺筒，打筒子不会点上家胡。下家缺万碰六索，索子危险度极高，严禁打索子。三筒虽为生张，但保留七八筒搭子对听牌至关重要。若求稳可打八筒，但推荐打三筒博取胡牌机会。","decision_matrix":{"激进型玩家":"打三筒 - 保搭子","稳健型玩家":"打八筒 - 防点炮","观察型玩家":"打三筒 - 观察下家反应"}},"strategy_references":["S-08 清一色雷达：下家碰索子，索子危险度上升","S-05 断头牌效应：九万明杠，万子相关牌价值归零","防守原则：缺门花色为绝对安全牌（对上家）","牌效原则：保留两面搭子，拆除孤张"],"summary":"本局对家已胡，剩余两家竞争。手牌缺门已清，结构良好（1 向听）。核心策略是利用上家缺筒的安全优势，优先处理筒子孤张。索子因下家碰牌而危险，严禁打出。建议打三筒保留七八筒搭子，争取快速听牌。若下家迹象明显听牌，则改打熟张八筒防守。","metadata":{"sample_input":"/home/free/dataset/input2/input2.json","sample_output":"/home/free/dataset/output2/mahjong_test_20260516_213107.json","real_input":"/home/free/dataset/input2/input.json","input_strategy":"/home/free/dataset/output/mahjong_strategy.md","analysis_timestamp":"2026-05-16T21:36:47.952214","model":"qwen3.5-plus"}};

const SUIT_COLOR = { W: '#ef4444', T: '#3b82f6', B: '#10b981' };
const SUIT_BG = { W: 'bg-red-500', T: 'bg-blue-500', B: 'bg-emerald-500' };
const SUIT_BORDER = { W: 'border-red-400', T: 'border-blue-400', B: 'border-emerald-400' };
const SUIT_TEXT = { W: 'text-red-400', T: 'text-blue-400', B: 'text-emerald-400' };
const PLAYER_LABEL = { me: '我方', left: '上家', right: '下家', across: '对家' };

// ═══════════════════════════════════════
//  状态
// ═══════════════════════════════════════
const SENTINEL = { type: '?', value: 0 }; // 对手手牌占位符（未知牌张）

const state = {
  players: {
    me:     { dingque: null, melds: [], discards: [] },
    left:   { dingque: null, melds: [], discards: [] },
    right:  { dingque: null, melds: [], discards: [] },
    across: { dingque: null, melds: [], discards: [] },
  },
  opponentHands: { left: [], right: [], across: [] },  // 对手暗牌数组，元素为 tile 对象或 SENTINEL
  myHand: [
    {type:'W',value:1},{type:'W',value:2},{type:'W',value:4},{type:'W',value:5},{type:'W',value:8},
    {type:'T',value:3},{type:'T',value:3},{type:'T',value:5},{type:'T',value:6},{type:'T',value:8},
    {type:'B',value:1},{type:'B',value:7},{type:'B',value:9},
  ],
  selectedHandIdx: null,
  swapOut: [], swapDir: null, swapIn: [],
  history: [],
  dealer: null,
  currentTurn: 'me',  // 当前轮到谁出牌，取值: 'me'/'left'/'right'/'across'，始终有一人
  personalRiverVisible: true,  // 牌源清晰/牌源模糊
  publicRiverTiles: [],  // 牌源模糊时的初始混合河牌（分不清谁打的）
};

// 获取或创建警告弹窗
function getWarningModal() {
  let modal = document.getElementById('warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'warning-modal';
    modal.className = 'modal-overlay hidden fixed inset-0 bg-black/60 z-[100] flex items-center justify-center';
    modal.addEventListener('click', () => hideWarning());
    modal.innerHTML = ''+
      '<div class="bg-[#0b1220] border border-orange-800/60 rounded-2xl p-5 mx-4 max-w-[300px] text-center shadow-2xl" onclick="event.stopPropagation()">'+
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.5" style="margin:0 auto"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'+
        '<p id="warning-modal-msg" class="text-sm text-orange-300 mt-3 leading-relaxed"></p>'+
        '<button onclick="hideWarning()" class="mt-3 text-xs text-slate-500 hover:text-slate-300 underline">关闭</button>'+
      '</div>';
    document.body.appendChild(modal);
  }
  return modal;
}

function showWarning(msg) {
  const modal = getWarningModal();
  document.getElementById('warning-modal-msg').textContent = msg;
  modal.classList.remove('hidden');
  clearTimeout(modal._timer);
  modal._timer = setTimeout(() => hideWarning(), 3000);
}

function hideWarning() {
  const modal = document.getElementById('warning-modal');
  if (modal) { modal.classList.add('hidden'); clearTimeout(modal._timer); }
}

function clearWarning() {
  hideWarning();
}

// 检测手牌中有哪些花色
function handSuits() {
  return [...new Set(state.myHand.map(t => t.type))];
}

// 计算全场已用牌张数（不含当前 pickerSelected）
function getTileUsed() {
  const used = {};
  const add = (tiles) => tiles.forEach(t => { const k=`${t.type}${t.value}`; used[k]=(used[k]||0)+1; });
  add(state.myHand);
  Object.values(state.players).forEach(p => {
    add(p.discards);
    p.melds.forEach(m => add(m.tiles));
  });
  add(state.swapOut);
  return used;
}

// 对手手牌辅助：移除1张指定牌（优先匹配已知牌，否则移除占位符）
function opponentHandRemove(player, tile, n = 1) {
  const hand = state.opponentHands[player];
  for (let i = 0; i < n; i++) {
    const idx = hand.findIndex(t => t.type === tile.type && t.value === tile.value);
    if (idx !== -1) {
      hand.splice(idx, 1);
    } else {
      const sIdx = hand.findIndex(t => t.type === '?');
      if (sIdx !== -1) hand.splice(sIdx, 1);
    }
  }
}

// 对手手牌辅助：添加占位符（摸牌）
function opponentHandDraw(player, n = 1) {
  for (let i = 0; i < n; i++) state.opponentHands[player].push({ ...SENTINEL });
}

// 某玩家的杠次数（每次杠永久 +1 牌数上限）
function getPlayerKongCount(player) {
  return state.players[player].melds.filter(m =>
    m.type === 'kong_ming' || m.type === 'kong_an' || m.type === 'kong_bu'
  ).length;
}

// 某玩家当前拥有的总牌数（暗牌 + 明牌）
function getPlayerTotalTiles(player) {
  let count = 0;
  if (player === 'me') {
    count += state.myHand.length;
  } else {
    count += state.opponentHands[player].length;
  }
  count += state.players[player].melds.reduce((s, m) => s + m.tiles.length, 0);
  return count;
}

// 某玩家当前允许的最大牌数
function getMaxTiles(player) {
  let max = 13 + getPlayerKongCount(player);
  // 庄家初始14张（尚未出过牌且没有碰/杠操作时）
  if (state.dealer === player) {
    const p = state.players[player];
    if (p.discards.length === 0 && p.melds.length === 0) {
      max = 14 + getPlayerKongCount(player);
    }
  }
  // 当前回合摸牌未打，临时 +1
  if (state.currentTurn === player) {
    max += 1;
  }
  return max;
}

// 校验牌数是否超限，超限弹 warning 返回 false
function validateTileCount(player, actionLabel) {
  const total = getPlayerTotalTiles(player);
  const max = getMaxTiles(player);
  if (total > max) {
    const label = player === 'me' ? '我方' : PLAYER_LABEL[player];
    showWarning(`${label} 当前总牌数 ${total} 张，超过预期上限 ${max} 张（${actionLabel}）。请检查录入数据。`);
    return false;
  }
  return true;
}
// 获取某玩家实际手牌上限（基础13张 + 杠数补偿，不含当前回合摸牌+1）
function getActualHandLimit(player) {
  return 13 + getPlayerKongCount(player);
}

// AI分析前校验所有玩家总牌数（手牌 + 副露）是否合法
function validateHandCountsForAI() {
  const players = ['me', 'left', 'right', 'across'];

  for (const p of players) {
    const total = getPlayerTotalTiles(p);
    const actualLimit = getActualHandLimit(p);

    // 正常情况手牌为13张，摸牌后手牌为14张，每有1个杠手牌数量永久加1
    // 当前回合玩家摸牌未打，预期 = 实际上限 + 1；其他玩家预期 = 实际上限
    const expected = (state.currentTurn === p) ? actualLimit + 1 : actualLimit;

    if (total !== expected) {
      const label = p === 'me' ? '我方' : PLAYER_LABEL[p];
      showWarning(`${label} 总牌数 ${total} 张（手牌+副露），预期 ${expected} 张（基础${actualLimit}张${state.currentTurn === p ? '，当前回合摸牌+1' : ''}）。请检查录入数据。`);
      return false;
    }
  }
  return true;
}
// ═══════════════════════════════════════
//  前后端数据转换
// ═══════════════════════════════════════
const CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const PLAYER_KEY_MAP = { me: 'my_hand', left: 'left_hand', right: 'right_hand', across: 'across_hand' };
const DINGQUE_MAP = { W: '万', T: '筒', B: '索' };

function tileToChinese(tile) {
  return `${CN_NUM[tile.value]}${SUIT_NAME[tile.type]}`;
}

function meldToBright(meld, player) {
  const values = meld.tiles.map(t => tileToChinese(t));
  if (meld.type === 'pong') {
    return { type: 'peng', values };
  }
  if (meld.type === 'hu') {
    return {
      type: 'hu',
      huType: meld.fromPlayer ? 'dian_pao' : 'self_draw',
      huTarget: meld.fromPlayer ? PLAYER_KEY_MAP[meld.fromPlayer] : null,
      values
    };
  }
  const gangTypeMap = { kong_ming: 'ming_gang', kong_an: 'an_gang', kong_bu: 'bu_gang' };
  const gangTarget = meld.type === 'kong_ming'
    ? (meld.fromDir ? PLAYER_KEY_MAP[meld.fromDir] : null)
    : null;
  return {
    type: 'gang',
    gangType: gangTypeMap[meld.type],
    gangTarget,
    values
  };
}

// 反向映射：用于从后端/文件 JSON 恢复 state
const SUIT_FROM_NAME = { '万': 'W', '筒': 'T', '索': 'B' };
const DINGQUE_FROM_NAME = { '万': 'W', '筒': 'T', '索': 'B' };
const KEY_FROM_PLAYER = { my_hand: 'me', left_hand: 'left', right_hand: 'right', across_hand: 'across' };
const NUM_FROM_CN = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
const DIR_FROM_KEY = { left_hand: 'left', right_hand: 'right', across_hand: 'across' };

function chineseToTile(str) {
  if (!str || str.length < 2) return null;
  const suit = SUIT_FROM_NAME[str[str.length - 1]];
  const num = NUM_FROM_CN[str[0]];
  if (!suit || !num) return null;
  return { type: suit, value: num };
}

function brightToMeld(bright) {
  const tiles = bright.values.map(v => chineseToTile(v)).filter(t => t !== null);
  if (tiles.length === 0) return null;

  if (bright.type === 'peng') {
    return { type: 'pong', tiles, fromPlayer: null };
  }
  if (bright.type === 'gang') {
    let meldType = 'kong_ming';
    if (bright.gangType === 'an_gang') meldType = 'kong_an';
    else if (bright.gangType === 'bu_gang') meldType = 'kong_bu';

    return {
      type: meldType,
      tiles,
      fromDir: bright.gangTarget ? DIR_FROM_KEY[bright.gangTarget] || null : null
    };
  }
  return null;
}

// 从后端返回的 JSON（或图片识别结果）恢复完整牌桌状态
function loadGameState(data) {
  if (typeof data === 'string') data = JSON.parse(data);

  // --- 全局 ---
  const g = data.global;
  state.currentTurn = KEY_FROM_PLAYER[g.status] || 'me';
  state.personalRiverVisible = g.personal_river_visible === true;

  // 公共河牌（牌源模糊时使用）
  state.publicRiverTiles = state.personalRiverVisible
    ? []
    : (g.river_tiles?.all_tiles || []).map(t => chineseToTile(t)).filter(t => t !== null);

  // --- 四家 ---
  for (const [jsonKey, stateKey] of Object.entries(KEY_FROM_PLAYER)) {
    const pd = data.players[jsonKey];
    if (!pd) continue;
    const p = state.players[stateKey];

    // 定缺
    p.dingque = DINGQUE_FROM_NAME[pd.dingque] || null;

    // 手牌 — 仅我方填充 dark_tiles
    if (stateKey === 'me' && pd.hand_tiles.dark_tiles.length > 0) {
      state.myHand = pd.hand_tiles.dark_tiles.map(t => chineseToTile(t)).filter(t => t !== null);
      state.myHand.sort((a, b) => {
        const so = { W: 0, T: 1, B: 2 };
        return so[a.type] - so[b.type] || a.value - b.value;
      });
    }

    // 明牌 → melds
    p.melds = (pd.hand_tiles.bright_tiles || [])
      .map(b => brightToMeld(b))
      .filter(m => m !== null);

    // 胡牌 → 追加 hu meld
    const hi = pd.hu_info;
    if (hi && hi.is_hu === true && hi.hu_tile) {
      const huTile = chineseToTile(hi.hu_tile);
      if (huTile) {
        p.melds.push({
          type: 'hu',
          tiles: [huTile],
          fromPlayer: (hi.hu_type === 'dian_pao' || hi.hu_type === 'dianpao') && hi.provider
            ? (DIR_FROM_KEY[hi.provider] || null)
            : null
        });
      }
    }

    // 对手手牌（暗牌数组 = 总牌数 - 明牌张数，用占位符填充）
    if (stateKey !== 'me') {
      const meldTileCount = p.melds.reduce((sum, m) => sum + m.tiles.length, 0);
      const darkCount = (pd.hand_tiles.total_count || 13) - meldTileCount;
      state.opponentHands[stateKey] = Array(Math.max(0, darkCount)).fill(null).map(() => ({ ...SENTINEL }));
    }

    // 出牌河
    const riverData = pd.personal_river_tiles || pd.river_tiles;
    p.discards = state.personalRiverVisible
      ? (riverData?.all_tiles || []).map(t => chineseToTile(t)).filter(t => t !== null)
      : [];
  }

  renderTable();
  renderMyHand();
  showToast('牌局数据已加载');
}

// 内置示例牌局数据（与 frontend_json_backen_sample.json 同步）
const SAMPLE_GAME_DATA = {
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
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
        "dark_tiles": ["一筒","二筒","四筒","五筒","七筒","八筒","九筒","一索","三索","五索","七索"],
        "bright_tiles": [{ "type": "peng", "values": ["六筒","六筒","六筒"] }]
      },
      "river_tiles": { "all_tiles": ["一万","二万","三万","六万","八万"] }
    },
    "left_hand": {
      "dingque": "筒",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 14,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "gang", "gangType": "ming_gang", "gangTarget": "right_hand", "values": ["七万","七万","七万","七万"] }]
      },
      "river_tiles": { "all_tiles": ["三筒","五筒","九筒"] }
    },
    "right_hand": {
      "dingque": "索",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "peng", "values": ["九万","九万","九万"] }]
      },
      "river_tiles": { "all_tiles": ["二索","四索","八索"] }
    },
    "across_hand": {
      "dingque": null,
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": { "total_count": 13, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": ["四万","七筒","一索"] }
    }
  }
};

// 内置示例牌局数据 — 牌源模糊模式（personal_river_visible = false）
const SAMPLE_GAME_DATA_BLUR = {
  "global": {
    "game_type": "四川麻将",
    "notes": "川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。",
    "analysis_date": "2026-05-17 10:30:00",
    "image_path": "",
    "user_messages": null,
    "status": "my_hand",
    "discard_tile": "",
    "recognition_quality": "medium",
    "personal_river_visible": false,
    "river_tiles": { "all_tiles": [
      "一万","二万","三万","六万","八万",
      "三筒","五筒","九筒",
      "二索","四索","八索",
      "四万","七筒","一索"
    ]}
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
      "river_tiles": { "all_tiles": [] }
    },
    "left_hand": {
      "dingque": "筒",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 14,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "gang", "gangType": "ming_gang", "gangTarget": "right_hand", "values": ["七万","七万","七万","七万"] }]
      },
      "river_tiles": { "all_tiles": [] }
    },
    "right_hand": {
      "dingque": "索",
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": {
        "total_count": 13,
        "dark_tiles": [],
        "bright_tiles": [{ "type": "peng", "values": ["九万","九万","九万"] }]
      },
      "river_tiles": { "all_tiles": [] }
    },
    "across_hand": {
      "dingque": null,
      "hu_info": { "is_hu": false, "hu_tile": null, "hu_type": null, "provider": null },
      "hand_tiles": { "total_count": 13, "dark_tiles": [], "bright_tiles": [] },
      "river_tiles": { "all_tiles": [] }
    }
  }
};

function initFromSample() {
  loadGameState(SAMPLE_GAME_DATA);
}

function initGame() {
  // 重置所有玩家状态
  ['me','left','right','across'].forEach(p => {
    state.players[p].dingque = null;
    state.players[p].discards = [];
    state.players[p].melds = [];
  });
  // 对手初始13张暗牌
  state.opponentHands = {
    left: Array(13).fill(null).map(() => ({ ...SENTINEL })),
    right: Array(13).fill(null).map(() => ({ ...SENTINEL })),
    across: Array(13).fill(null).map(() => ({ ...SENTINEL }))
  };
  // 我方初始0张
  state.myHand = [];
  state.currentTurn = 'me';
  state.dealer = null;
  state.history = [];
  state.selectedHandIdx = null;
  state.swapOut = []; state.swapIn = []; state.swapDir = null;
  state.personalRiverVisible = true;
  state.publicRiverTiles = [];

  // 更新牌源按钮文字
  const btn = document.getElementById('river-visibility-btn');
  if (btn) btn.textContent = '牌源清晰';

  renderTable();
  renderMyHand();
  renderSwapOut();
  renderSwapIn();
  showToast('牌堆已初始化（我方0张，其他家各13张）。请录入手牌13张，再选择庄家。');
}

// 加载本地 JSON 文件（模拟后端返回牌桌数据）
function handleJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      loadGameState(data);
      showToast(`已加载: ${file.name}`);
    } catch (err) {
      showToast('JSON 解析失败: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';  // 允许重复选同一文件
}

function buildRequestPayload() {
  function playerSection(p) {
    const dq = state.players[p].dingque;
    const total = getPlayerTotalTiles(p);
    const darkTiles = p === 'me'
      ? state.myHand.map(t => tileToChinese(t))
      : [];
    const brightTiles = state.players[p].melds.map(m => meldToBright(m, p));
    const discards = state.players[p].discards.map(t => tileToChinese(t));

    // 查找胡牌 meld（如果有）
    const huMeld = state.players[p].melds.find(m => m.type === 'hu');
    const hu_info = huMeld
      ? {
          is_hu: true,
          hu_tile: huMeld.tiles.length > 0 ? tileToChinese(huMeld.tiles[0]) : null,
          hu_type: huMeld.fromPlayer ? 'dian_pao' : 'self_draw',
          provider: huMeld.fromPlayer ? PLAYER_KEY_MAP[huMeld.fromPlayer] : null
        }
      : {
          is_hu: false,
          hu_tile: null,
          hu_type: null,
          provider: null
        };

    return {
      dingque: dq ? DINGQUE_MAP[dq] : null,
      hu_info,
      hand_tiles: {
        total_count: total,
        dark_tiles: darkTiles,
        bright_tiles: brightTiles
      },
      personal_river_tiles: {
        all_tiles: state.personalRiverVisible ? discards : []
      }
    };
  }

  const status = state.currentTurn ? PLAYER_KEY_MAP[state.currentTurn] : '';

  return {
    global: {
      game_type: '四川麻将',
      notes: '川麻规则：缺一门、血战到底、刮风下雨、不可吃牌。牌型仅限万、筒、索。无风牌、无箭牌。',
      analysis_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      image_path: '',
      user_messages: document.getElementById('user-message-input')?.value?.trim() || null,
      status,
      discard_tile: '',
      personal_river_visible: state.personalRiverVisible,
      river_tiles: {
        all_tiles: state.personalRiverVisible ? [] : state.publicRiverTiles.map(t => tileToChinese(t))
      }
    },
    players: {
      my_hand: playerSection('me'),
      left_hand: playerSection('left'),
      right_hand: playerSection('right'),
      across_hand: playerSection('across')
    }
  };
}

// ═══════════════════════════════════════
//  渲染：牌组件
// ═══════════════════════════════════════
function createTileEl(tile, size='md', direction='up', opts={}) {
  const sizes = {
    sm: {w:20,h:28,numSize:'11px',suitSize:'8px',radius:'3px'},
    md: {w:26,h:36,numSize:'15px',suitSize:'9px',radius:'4px'},
    lg: {w:34,h:48,numSize:'21px',suitSize:'11px',radius:'5px'},
    hand: {w:24,h:34,numSize:'13px',suitSize:'8px',radius:'4px'},
  };
  const s = sizes[size];
  const isH = direction==='left'||direction==='right';
  const rotateDeg = {up:0,down:180,left:90,right:-90}[direction];

  const outer = document.createElement('div');
  outer.style.cssText = `width:${isH?s.h:s.w}px;height:${isH?s.w:s.h}px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;`;
  if(opts.clickable) outer.style.cursor='pointer';

  const inner = document.createElement('div');
  let finalRotate = rotateDeg;
  let outerW = isH ? s.h : s.w;
  let outerH = isH ? s.w : s.h;

  if(opts.horizontal) {
    finalRotate = rotateDeg + 90;
    outerW = s.h;
    outerH = s.w;
    outer.style.width = outerW + 'px';
    outer.style.height = outerH + 'px';
  }

  inner.style.cssText = `width:${s.w}px;height:${s.h}px;background:#f9fafb;border:1px solid #d1d5db;border-radius:${s.radius};display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:bold;transform:rotate(${finalRotate}deg);flex-shrink:0;transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;`;

  if(opts.isBack) {
    inner.style.background = 'linear-gradient(135deg,#0f766e,#115e59,#0d4f4a)';
    inner.style.border = '1px solid #0f766e';
  } else {
    const numSpan = document.createElement('span');
    numSpan.textContent = tile.value;
    numSpan.style.cssText = `font-size:${s.numSize};color:${SUIT_COLOR[tile.type]};line-height:1.1;`;
    const suitSpan = document.createElement('span');
    suitSpan.textContent = SUIT_NAME[tile.type];
    suitSpan.style.cssText = `font-size:${s.suitSize};color:${SUIT_COLOR[tile.type]};line-height:1;`;
    inner.appendChild(numSpan);
    inner.appendChild(suitSpan);
  }

  outer.appendChild(inner);
  outer._inner = inner;
  return outer;
}

function createHiddenTileEl(direction='up') {
  const w=14,h=20;
  const isH = direction==='left'||direction==='right';
  const rotateDeg = {up:0,down:180,left:90,right:-90}[direction];
  const outer = document.createElement('div');
  outer.style.cssText = `width:${isH?h:w}px;height:${isH?w:h}px;display:flex;align-items:center;justify-content:center;flex-shrink:0;`;
  const inner = document.createElement('div');
  inner.className = 'hidden-tile-inner';
  inner.style.cssText = `width:${w}px;height:${h}px;transform:rotate(${rotateDeg}deg);flex-shrink:0;`;
  outer.appendChild(inner);
  return outer;
}

// ═══════════════════════════════════════
//  渲染：碰杠区（不同杠样式）
// ═══════════════════════════════════════
function renderMeldGroup(meld, size='sm', direction='up') {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '1px';
  wrap.style.alignItems = 'flex-end';
  if(direction==='left'||direction==='right') wrap.style.flexDirection='column';

  const tile = meld.tiles[0];
  if(meld.type === 'pong') {
    for(let i=0;i<3;i++) wrap.appendChild(createTileEl(tile, size, direction));
  } else if(meld.type === 'kong_ming') {
    const fromDir = meld.fromDir || 'left';
    const horizIdx = fromDir==='left'?0 : fromDir==='right'?3 : 1;
    for(let i=0;i<4;i++) wrap.appendChild(createTileEl(tile, size, direction, {horizontal: i===horizIdx}));
  } else if(meld.type === 'kong_an') {
    for(let i=0;i<4;i++) wrap.appendChild(createTileEl(tile, size, direction, {isBack: i===1||i===2}));
  } else if(meld.type === 'kong_bu') {
    // 前三张是原碰牌，第四张是新摸的牌，中间加间隙区分
    for(let i=0;i<3;i++) wrap.appendChild(createTileEl(tile, size, direction));
    const gap = document.createElement('div');
    gap.style.cssText = direction==='left'||direction==='right' ? 'height:4px' : 'width:4px';
    wrap.appendChild(gap);
    wrap.appendChild(createTileEl(tile, size, direction));
  } else if(meld.type === 'hu') {
    // 胡牌：显示胡的牌 + 点炮来源标识
    const tileEl = createTileEl(tile, size, direction);
    wrap.appendChild(tileEl);
    if (meld.fromPlayer) {
      // 点炮：显示来源方向小标
      const indicator = document.createElement('div');
      const isize = size === 'md' ? 14 : 10;
      indicator.style.cssText = `width:${isize}px;height:${isize*1.4}px;background:linear-gradient(135deg,#0f766e,#115e59);border:1px solid #0d9488;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:${isize-3}px;color:#5eead4;font-weight:bold;margin-left:1px;`;
      const labelMap = { left: '上', right: '下', across: '对' };
      indicator.textContent = labelMap[meld.fromPlayer] || '?';
      indicator.title = `${PLAYER_LABEL[meld.fromPlayer]}点炮`;
      wrap.appendChild(indicator);
    }
  }
  return wrap;
}

// ═══════════════════════════════════════
//  渲染：全局
// ═══════════════════════════════════════
function updateBadge(player) {
  const badge = document.getElementById(`badge-${player}`);
  if(!badge) return;
  const dq = state.players[player].dingque;
  badge.className = 'absolute -top-2 -right-2 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black shadow z-30';
  if(!dq) { badge.classList.add('bg-slate-600','text-slate-200','border-slate-500'); badge.textContent='?'; }
  else { badge.classList.add(SUIT_BG[dq],'text-white',SUIT_BORDER[dq]); badge.textContent=SUIT_NAME[dq]; }
}

function updateDealerVisuals() {
  // 重置所有头像样式
  ['me','left','right','across'].forEach(p => {
    const avatar = document.getElementById(`avatar-${p}`);
    if (!avatar) return;
    avatar.style.borderColor = '';
    avatar.style.boxShadow = '';
    avatar.style.background = '';
  });

  // 更新中心庄家标识
  const indicator = document.getElementById('dealer-indicator');
  if (!indicator) return;
  if (state.dealer) {
    indicator.classList.remove('hidden');
    indicator.textContent = `庄:${PLAYER_LABEL[state.dealer] === '我方' ? '我' : PLAYER_LABEL[state.dealer]}`;

    // 庄家头像高亮
    const avatar = document.getElementById(`avatar-${state.dealer}`);
    if (avatar) {
      avatar.style.borderColor = '#f59e0b';
      avatar.style.boxShadow = '0 0 12px rgba(245,158,11,0.5), 0 0 24px rgba(245,158,11,0.2)';
      avatar.style.background = 'linear-gradient(135deg, #1e293b 0%, #3d2e0a 100%)';
    }
  } else {
    indicator.classList.add('hidden');
  }
}

// 出牌顺序：我 → 下家 → 对家 → 上家（逆时针）
const TURN_ORDER = ['me', 'right', 'across', 'left'];

function advanceTurn() {
  const idx = TURN_ORDER.indexOf(state.currentTurn);
  state.currentTurn = TURN_ORDER[(idx + 1) % TURN_ORDER.length];
  renderTable();
  return state.currentTurn;
}

function cycleTurn() {
  advanceTurn();
  showToast(`当前回合：${PLAYER_LABEL[state.currentTurn]}`);
}

function toggleRiverVisibility() {
  state.personalRiverVisible = !state.personalRiverVisible;
  const btn = document.getElementById('river-visibility-btn');
  if (btn) {
    btn.textContent = state.personalRiverVisible ? '牌源清晰' : '牌源模糊';
  }
  // 切换时加载对应模式的示例数据（模拟后端返回）
  loadGameState(state.personalRiverVisible ? SAMPLE_GAME_DATA : SAMPLE_GAME_DATA_BLUR);
  showToast(state.personalRiverVisible ? '已切换为牌源清晰（可分辨各家出牌）' : '已切换为牌源模糊（无法分辨各家出牌）');
}

function updatePhaseBadge() {
  const badge = document.getElementById('phase-badge');
  if (!badge) return;
  const label = PLAYER_LABEL[state.currentTurn] === '我方' ? '我' : PLAYER_LABEL[state.currentTurn];
  badge.textContent = `轮到${label}`;
  badge.className = badge.className.replace(/border-teal-700 bg-teal-950\/60 text-teal-400/, 'border-amber-700 bg-amber-950/60 text-amber-400');
}

function updateTurnVisuals() {
  ['me','left','right','across'].forEach(p => {
    const el = document.getElementById(`turn-${p}`);
    if (el) el.classList.add('hidden');
  });
  if (!state.currentTurn) return;
  const turnEl = document.getElementById(`turn-${state.currentTurn}`);
  if (turnEl) turnEl.classList.remove('hidden');
}

function renderTable() {
  renderPublicRiver();
  renderDiscards('me','up');
  renderDiscards('across','down');
  renderDiscards('left','left');
  renderDiscards('right','right');
  renderAllMelds();
  renderOpponentHand('across','down');
  renderOpponentHand('left','left');
  renderOpponentHand('right','right');
  ['me','left','right','across'].forEach(updateBadge);
  updateDealerVisuals();
  updateTurnVisuals();
  updatePhaseBadge();
}

function renderDiscards(player, direction) {
  const el = document.getElementById(`discard-${player}`);
  if(!el) return;
  el.innerHTML = '';
  state.players[player].discards.forEach((tile,idx) => {
    const tileEl = createTileEl(tile, 'sm', direction);
    // 双击撤回：阻止冒泡防止触发容器的 openDiscardModal
    tileEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      state.players[player].discards.splice(idx, 1);
      if (player === 'me') {
        state.myHand.push({type: tile.type, value: tile.value});
        state.myHand.sort((a,b) => {const so={W:0,T:1,B:2}; return so[a.type]-so[b.type]||a.value-b.value;});
      } else {
        state.opponentHands[player].push({type: tile.type, value: tile.value});
      }
      state.history.push({type:'undoDiscard', player, tile, idx});
      renderTable(); renderMyHand();
      showToast(`已撤回${PLAYER_LABEL[player]}出牌：${tile.value}${SUIT_NAME[tile.type]}`);
    });
    // 单击也阻止冒泡，防止误触发容器的 onclick
    tileEl.addEventListener('click', (e) => { e.stopPropagation(); });
    tileEl.style.cursor = 'pointer';
    tileEl.title = '双击撤回';
    el.appendChild(tileEl);
  });
}

function renderPublicRiver() {
  const el = document.getElementById('public-river');
  const placeholder = document.getElementById('public-river-placeholder');
  if (!el) return;

  // 牌源清晰时隐藏
  if (state.personalRiverVisible) {
    el.classList.add('hidden');
    return;
  }

  el.classList.remove('hidden');
  // 清除旧牌（保留 placeholder）
  el.querySelectorAll('.tile-el').forEach(t => t.remove());

  if (state.publicRiverTiles.length === 0) {
    if (placeholder) placeholder.classList.remove('hidden');
    return;
  }

  if (placeholder) placeholder.classList.add('hidden');
  state.publicRiverTiles.forEach((tile, idx) => {
    const tileEl = createTileEl(tile, 'sm', 'up');
    tileEl.classList.add('tile-el');
    tileEl.style.cursor = 'pointer';
    tileEl.title = '双击认领（指定谁打出的）';
    tileEl.addEventListener('click', (e) => { e.stopPropagation(); });
    tileEl.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openClaim(idx);
    });
    el.appendChild(tileEl);
  });
}

function openClaim(idx) {
  claimTileIdx = idx;
  const tile = state.publicRiverTiles[idx];
  const preview = document.getElementById('claim-tile-preview');
  if (preview) {
    preview.innerHTML = '';
    const tileEl = createTileEl(tile, 'lg', 'up');
    preview.appendChild(tileEl);
  }
  document.getElementById('modal-claim').classList.remove('hidden');
}

function closeClaim() {
  claimTileIdx = null;
  document.getElementById('modal-claim').classList.add('hidden');
}

function confirmClaim(player) {
  if (claimTileIdx === null) return;
  const tile = state.publicRiverTiles.splice(claimTileIdx, 1)[0];
  state.players[player].discards.push(tile);
  claimTileIdx = null;
  document.getElementById('modal-claim').classList.add('hidden');
  renderPublicRiver();
  renderTable();
  showToast(`已将 ${tileToChinese(tile)} 归入${PLAYER_LABEL[player]}出牌`);
}

function renderAllMelds() {
  renderMelds('me','up','me-melds');
  renderMelds('across','down','across-melds');
  renderMelds('left','left','left-melds');
  renderMelds('right','right','right-melds');
}

function renderMelds(player, direction, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  state.players[player].melds.forEach((meld, idx) => {
    const group = renderMeldGroup(meld, player==='me'?'md':'sm', direction);
    group.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const removed = state.players[player].melds.splice(idx, 1)[0];
      // 胡牌撤销：点炮时恢复牌到来源玩家出牌堆
      if (removed && removed.type === 'hu' && removed.fromPlayer) {
        state.players[removed.fromPlayer].discards.push({type: removed.tiles[0].type, value: removed.tiles[0].value});
      }
      state.history.push({type:'undoMeld', player, meld, idx});
      renderTable();
      const label = meld.type==='pong'?'碰':meld.type==='hu'?'胡':(meld.type==='kong_an'?'暗杠':(meld.type==='kong_ming'?'明杠':(meld.type==='kong_bu'?'补杠':'杠')));
      showToast(`已撤回${PLAYER_LABEL[player]}的${label}`);
    });
    group.style.cursor = 'pointer';
    group.title = '双击撤回';
    el.appendChild(group);
  });
}

function renderOpponentHand(player, direction) {
  const el = document.getElementById(`${player}-hand`);
  if(!el) return;
  const avatarDiv = el.querySelector(':scope > div');
  el.innerHTML = '';
  if(avatarDiv) el.appendChild(avatarDiv);
  for(let i=0;i<state.opponentHands[player].length;i++) el.appendChild(createHiddenTileEl(direction));
}

function isSwapPhase() {
  return !document.getElementById('panel-swap').classList.contains('hidden');
}

function renderMyHand() {
  const el = document.getElementById('my-hand-display');
  el.innerHTML = '';
  const inSwap = isSwapPhase();
  state.myHand.forEach((tile, idx) => {
    const outer = createTileEl(tile, 'hand', 'up', {clickable:true});
    const inner = outer._inner;

    // swap-out 高亮：琥珀色
    const inSwapOut = inSwap && state.swapOut.some(t => t.type===tile.type && t.value===tile.value);
    if (inSwapOut) {
      inner.style.transform = 'translateY(-8px) scale(1.08)';
      inner.style.borderColor = '#f59e0b';
      inner.style.boxShadow = '0 0 0 2px #fbbf24, 0 4px 12px rgba(245,158,11,0.4)';
    } else if (state.selectedHandIdx === idx) {
      inner.style.transform = 'translateY(-8px) scale(1.08)';
      inner.style.borderColor = '#60a5fa';
      inner.style.boxShadow = '0 0 0 2px #93c5fd, 0 4px 12px rgba(96,165,250,0.4)';
    }

    if (inSwap) {
      outer.addEventListener('click', () => toggleSwapOutTile(idx));
    } else {
      outer.addEventListener('click', () => selectHandTile(idx));
      outer.addEventListener('dblclick', () => quickDiscard(idx));
    }
    el.appendChild(outer);
  });
  document.getElementById('hand-count-label').textContent = `(${getPlayerTotalTiles('me')}张)`;

  if (!inSwap) {
    const confirmArea = document.getElementById('confirm-area');
    const confirmBtn = document.getElementById('confirm-btn');
    if(state.selectedHandIdx !== null) {
      const t = state.myHand[state.selectedHandIdx];
      confirmArea.classList.remove('hidden');
      confirmBtn.textContent = `确认出牌：${t.value}${SUIT_NAME[t.type]}`;
    } else {
      confirmArea.classList.add('hidden');
    }
  }
}

function toggleSwapOutTile(idx) {
  const tile = state.myHand[idx];
  const dq = state.players.me.dingque;
  if (dq && tile.type !== dq) { showWarning(`换出的牌必须是定缺花色（${SUIT_NAME[dq]}），当前点击的是${SUIT_NAME[tile.type]}${tile.value}`); return; }

  const existingIdx = state.swapOut.findIndex(t => t.type===tile.type && t.value===tile.value);
  if (existingIdx >= 0) {
    state.swapOut.splice(existingIdx, 1);
    clearWarning();
  } else {
    if (state.swapOut.length >= 3) { showWarning('换出最多选3张牌，请先移除一张再选'); return; }
    state.swapOut.push({type:tile.type, value:tile.value});
    clearWarning();
  }
  renderMyHand();
  renderSwapOut();
}

// ═══════════════════════════════════════
//  交互：手牌/出牌
// ═══════════════════════════════════════
function selectHandTile(idx) {
  state.selectedHandIdx = state.selectedHandIdx===idx ? null : idx;
  renderMyHand();
}

function quickDiscard(idx) {
  if (isSwapPhase()) return;
  const tile = state.myHand.splice(idx, 1)[0];
  state.players.me.discards.push(tile);
  state.history.push({type:'discard', player:'me', tile});
  state.selectedHandIdx = null;
  renderMyHand(); renderTable();
  renderMyHand(); renderTable();
  validateTileCount('me', '快速出牌');
  showToast(`快速出牌：${tile.value}${SUIT_NAME[tile.type]}`);
}

function confirmDiscard() {
  if(state.selectedHandIdx===null) return;
  const tile = state.myHand.splice(state.selectedHandIdx, 1)[0];
  state.players.me.discards.push(tile);
  state.history.push({type:'discard', player:'me', tile});
  state.selectedHandIdx = null;
  renderMyHand(); renderTable();
  validateTileCount('me', '出牌');
  showToast(`已出牌：${tile.value}${SUIT_NAME[tile.type]}`);
}

function undoLast() {
  if(!state.history.length) { showToast('没有可撤销的操作'); return; }
  const last = state.history.pop();
  if(last.type==='discard' && last.player==='me') {
    state.players.me.discards.pop();
    state.myHand.push(last.tile);
  } else if(last.type==='discard') {
    state.players[last.player].discards.pop();
    if (last.player !== 'me') {
      state.opponentHands[last.player].push({type: last.tile.type, value: last.tile.value});
    }
  } else if(last.type==='meld') {
    const meld = state.players[last.player].melds.pop();
    if (!meld) { renderTable(); renderMyHand(); return; }
    const tile = meld.tiles[0];
    // 恢复手牌（暗牌）
    if (last.player === 'me') {
      if (meld.type === 'pong') {
        for (let i = 0; i < 2; i++) state.myHand.push({type: tile.type, value: tile.value});
      } else if (meld.type === 'kong_ming') {
        for (let i = 0; i < 3; i++) state.myHand.push({type: tile.type, value: tile.value});
      } else if (meld.type === 'kong_an') {
        for (let i = 0; i < 4; i++) state.myHand.push({type: tile.type, value: tile.value});
      } else if (meld.type === 'kong_bu') {
        state.myHand.push({type: tile.type, value: tile.value});
        // 恢复为碰
        state.players[last.player].melds.push({type:'pong', tiles:[tile,tile,tile], fromPlayer: meld.fromDir});
      }
      state.myHand.sort((a,b) => {const so={W:0,T:1,B:2}; return so[a.type]-so[b.type]||a.value-b.value;});
    } else {
      if (meld.type === 'pong') {
        opponentHandDraw(last.player, 2);
      } else if (meld.type === 'kong_ming') {
        opponentHandDraw(last.player, 3);
        opponentHandRemove(last.player, tile, 1); // 撤回杠的补牌
      } else if (meld.type === 'kong_an') {
        opponentHandDraw(last.player, 4);
        opponentHandRemove(last.player, tile, 1); // 撤回杠的补牌
      } else if (meld.type === 'kong_bu') {
        opponentHandDraw(last.player, 1);
        opponentHandRemove(last.player, tile, 1); // 撤回杠的补牌
      }
    }
    // 恢复来源玩家出牌堆（碰和明杠从来源玩家拿走1张）
    const fromPlayer = meld.fromPlayer || meld.fromDir;
    if ((meld.type === 'pong' || meld.type === 'kong_ming') && fromPlayer) {
      state.players[fromPlayer].discards.push({type: tile.type, value: tile.value});
    }
    // 胡牌撤销：点炮时恢复牌到来源玩家出牌堆
    if (meld.type === 'hu' && meld.fromPlayer) {
      state.players[meld.fromPlayer].discards.push({type: tile.type, value: tile.value});
    }
  } else if(last.type==='dingque') {
    state.players[last.player].dingque = last.prev;
  }
  renderTable(); renderMyHand();
  showToast('已撤销');
}

// ═══════════════════════════════════════
//  换三张
// ═══════════════════════════════════════
function cancelSwap() {
  state.swapOut = []; state.swapIn = []; state.swapDir = null;
  document.getElementById('panel-swap').classList.add('hidden');
  renderSwapOut(); renderSwapIn(); renderMyHand();
  clearWarning();
}
function clearSwapOut() { state.swapOut=[]; renderSwapOut(); renderMyHand(); clearWarning(); }
function setSwapDir(dir) {
  state.swapDir = dir;
  document.querySelectorAll('.swap-dir-btn').forEach(b => { b.classList.remove('border-amber-500','text-amber-400','bg-amber-950/30'); b.classList.add('border-slate-700','text-slate-400'); });
  const btn = document.getElementById(`dir-${dir}`);
  btn.classList.add('border-amber-500','text-amber-400','bg-amber-950/30');
  btn.classList.remove('border-slate-700','text-slate-400');
}
function renderSwapOut() {
  const el = document.getElementById('swap-out-display');
  el.innerHTML = '';
  if(!state.swapOut.length) el.innerHTML='<span class="text-[10px] text-slate-600">从手牌中点选</span>';
  else state.swapOut.forEach(t => el.appendChild(createTileEl(t,'sm','up')));
}
function renderSwapIn() {
  const el = document.getElementById('swap-in-display');
  el.innerHTML = '';
  if(!state.swapIn.length) el.innerHTML='<span class="text-[10px] text-slate-600">点击选择换入3张</span>';
  else state.swapIn.forEach(t => el.appendChild(createTileEl(t,'sm','up')));
}
function confirmSwap() {
  if(state.swapOut.length!==3){showWarning('请从手牌中选出恰好3张牌进行换出');return;}
  if(!state.swapDir){showWarning('请选择换牌方向（上家/下家/对家）');return;}
  if(state.swapIn.length!==3){showWarning('请点击"选牌"录入换入的3张牌');return;}

  // 花色约束：换出的3张必须同花色
  const suits=[...new Set(state.swapOut.map(t=>t.type))];
  if(suits.length>1){showWarning(`换出的3张必须同花色！当前选择了${suits.map(s=>SUIT_NAME[s]).join('和')}`);return;}

  // 换出花色必须与定缺一致
  const dq = state.players.me.dingque;
  if (dq && suits[0] !== dq) {
    showWarning(`换出的花色必须是你定缺的花色。定缺：${SUIT_NAME[dq]}，你选择的是${SUIT_NAME[suits[0]]}`);
    return;
  }

  state.swapOut.forEach(out => { const idx=state.myHand.findIndex(t=>t.type===out.type&&t.value===out.value); if(idx!==-1) state.myHand.splice(idx,1); });
  state.swapIn.forEach(t => state.myHand.push(t));
  state.myHand.sort((a,b) => {const so={W:0,T:1,B:2}; return so[a.type]-so[b.type]||a.value-b.value;});
  state.history.push({type:'swap'});
  state.swapOut=[]; state.swapDir=null; state.swapIn=[];

  document.getElementById('panel-swap').classList.add('hidden');

  renderSwapOut(); renderSwapIn(); renderMyHand();
  validateTileCount('me', '换三张');
  showToast('换三张完成！');
}

// ═══════════════════════════════════════
//  定缺
// ═══════════════════════════════════════
function setMyDingque(suit) {
  state.players.me.dingque = suit;
  state.history.push({type:'dingque', player:'me', prev: null});
  ['W','T','B'].forEach(s => {
    const btn = document.getElementById(`dq-${s}`);
    if (!btn) return;
    const ac = {W:'border-red-500 bg-red-950/40',T:'border-blue-500 bg-blue-950/40',B:'border-emerald-500 bg-emerald-950/40'};
    btn.className = `dq-btn flex-1 py-2.5 rounded-lg border-2 font-bold text-sm transition ${SUIT_TEXT[s]}`;
    btn.classList.add(...(s===suit ? ac[s].split(' ') : ['border-slate-700','bg-slate-800']));
  });
  updateBadge('me');
}

// ═══════════════════════════════════════
//  弹窗：动作选择
// ═══════════════════════════════════════
let currentActionPlayer = null;

function openActionModal(player) {
  currentActionPlayer = player;
  document.getElementById('action-title').textContent = `${PLAYER_LABEL[player]} - 选择操作`;
  const container = document.getElementById('action-buttons');
  container.innerHTML = '';

  const actions = [
    {id:'pong', label:'碰', hover:'hover:bg-amber-900/40 hover:border-amber-600 hover:text-amber-300'},
    {id:'kong', label:'杠', hover:'hover:bg-purple-900/40 hover:border-purple-600 hover:text-purple-300'},
    {id:'win', label:'胡', hover:'hover:bg-teal-900/40 hover:border-teal-600 hover:text-teal-300'},
    {id:'dingque', label:'定缺', hover:'hover:bg-blue-900/40 hover:border-blue-600 hover:text-blue-300'},
  ];

  // 自己头像额外显示换三张
  if (player === 'me') {
    actions.push({id:'swap', label:'换三张', hover:'hover:bg-amber-900/40 hover:border-amber-500 hover:text-amber-300'});
  }

  // 上庄按钮
  actions.push({id:'dealer', label: state.dealer===player ? '取消上庄' : '上庄', hover:'hover:bg-yellow-900/40 hover:border-yellow-500 hover:text-yellow-300'});

  actions.push({id:'pass', label:'取消', hover:'hover:bg-slate-700', extra:'col-span-2 text-slate-400'});

  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = `py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition ${a.hover} ${a.extra||''}`;
    btn.textContent = a.label;
    btn.onclick = () => doAction(a.id);
    container.appendChild(btn);
  });

  document.getElementById('modal-action').classList.remove('hidden');
}

function closeAction() { document.getElementById('modal-action').classList.add('hidden'); }
function closeActionIfOutside(e) { if(e.target===document.getElementById('modal-action')) { closeAction(); currentActionPlayer=null; } }

function doAction(action) {
  const p = currentActionPlayer;
  if(action==='pass') { closeAction(); currentActionPlayer=null; return; }
  if(action==='dingque') {
    closeAction();
    document.getElementById('dingque-title').textContent = `${PLAYER_LABEL[p]} - 录入定缺`;
    ['W','T','B'].forEach(suit => {
      const btn = document.getElementById(`dingque-btn-${suit}`);
      if (!btn) return;
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.title = '';
    });
    document.getElementById('modal-dingque').classList.remove('hidden');
    return;
  }
  closeAction();
  if(action==='swap') {
    state.swapOut = []; state.swapIn = []; state.swapDir = null;
    renderSwapOut(); renderSwapIn(); renderMyHand();
    const dq = state.players.me.dingque;
    const swapHint = document.getElementById('swap-hint');
    if (swapHint) swapHint.textContent = dq ? `点击手牌选出3张${SUIT_NAME[dq]}，再选方向和换入牌` : '选3张同花色换出，再录入换入';
    document.getElementById('panel-swap').classList.remove('hidden');
    currentActionPlayer = null;
    return;
  }
  if(action==='dealer') {
    state.dealer = state.dealer === p ? null : p;
    updateDealerVisuals();
    updateTurnVisuals();
    closeAction();
    showToast(state.dealer ? `${PLAYER_LABEL[p]} 上庄` : '已取消庄家');
    currentActionPlayer = null;
    return;
  }
  if(action==='win') { closeAction(); openWinTilePicker(p); return; }
  if(action==='pong') { openMeldPicker(p, 'pong'); currentActionPlayer=null; return; }
  if(action==='kong') { openKongTypeModal(p); currentActionPlayer=null; return; }
  if(action==='kong_bu') { openBuGangPicker(p); currentActionPlayer=null; return; }
}

// ═══════════════════════════════════════
//  弹窗：杠类型选择
// ═══════════════════════════════════════
let kongTypePlayer = null;

function openKongTypeModal(player) {
  kongTypePlayer = player;
  document.getElementById('kong-type-title').textContent = '选择杠类型';
  const container = document.getElementById('kong-type-options');
  container.innerHTML = '';
  const types = [
    {id:'kong_ming', label:'明杠', desc:'他家点出一张，加上自己手中3张', color:'text-amber-400'},
    {id:'kong_an', label:'暗杠', desc:'手中4张相同牌，暗杠不公开牌面', color:'text-purple-400'},
  ];
  // 如果有碰牌，增加补杠选项
  const hasPong = state.players[player].melds.some(m => m.type === 'pong');
  if (hasPong) {
    types.push({id:'kong_bu', label:'补杠', desc:'碰后自己摸到第4张，补入碰牌旁', color:'text-pink-400'});
  }
  types.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-left hover:bg-slate-700 transition';
    btn.innerHTML = `<span class="font-bold text-sm ${t.color}">${t.label}</span><br><span class="text-[10px] text-slate-500">${t.desc}</span>`;
    btn.onclick = () => { closeKongType(); doKongByType(player, t.id); };
    container.appendChild(btn);
  });
  document.getElementById('modal-kong-type').classList.remove('hidden');
}

function closeKongType() { document.getElementById('modal-kong-type').classList.add('hidden'); }

function doKongByType(player, kongType) {
  if (kongType === 'kong_bu') {
    openBuGangPicker(player);
  } else {
    openMeldPicker(player, kongType);
  }
}

// ═══════════════════════════════════════
//  弹窗：补杠（从已碰中选）
// ═══════════════════════════════════════
function openBuGangPicker(player) {
  const pongs = state.players[player].melds.filter(m => m.type==='pong');
  if(!pongs.length) { showToast('没有可补杠的碰牌'); return; }
  if(pongs.length === 1) { doBuGang(player, state.players[player].melds.indexOf(pongs[0])); return; }

  document.getElementById('kong-type-title').textContent = '选择要补杠的碰牌';
  const container = document.getElementById('kong-type-options');
  container.innerHTML = '';
  pongs.forEach(meld => {
    const realIdx = state.players[player].melds.indexOf(meld);
    const t = meld.tiles[0];
    const btn = document.createElement('button');
    btn.className = 'py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-left hover:bg-slate-700 transition flex items-center gap-3';
    btn.innerHTML = `<span class="font-bold text-lg" style="color:${SUIT_COLOR[t.type]}">${t.value}${SUIT_NAME[t.type]}</span><span class="text-[10px] text-slate-500">将碰变为补杠</span>`;
    btn.onclick = () => { closeKongType(); doBuGang(player, realIdx); };
    container.appendChild(btn);
  });
  document.getElementById('modal-kong-type').classList.remove('hidden');
}

function doBuGang(player, meldIdx) {
  const meld = state.players[player].melds[meldIdx];
  const tile = meld.tiles[0];

  // 合规检查：我方补杠需要手中有1张该牌（暗牌）
  if (player === 'me') {
    const inHand = state.myHand.filter(t => t.type === tile.type && t.value === tile.value).length;
    if (inHand < 1) {
      showWarning(`补杠需要手中有1张${tile.value}${SUIT_NAME[tile.type]}，当前手中没有该牌`);
      return;
    }
    // 从手牌移除1张
    const idx = state.myHand.findIndex(t => t.type === tile.type && t.value === tile.value);
    if (idx !== -1) state.myHand.splice(idx, 1);
  } else {
    opponentHandRemove(player, tile, 1);
    opponentHandDraw(player, 1);
  }

  state.players[player].melds[meldIdx] = {type:'kong_bu', tiles:[tile,tile,tile,tile], fromDir: meld.fromPlayer || meld.fromDir};
  state.history.push({type:'meld', player});
  renderTable(); renderMyHand();
  validateTileCount(player, '补杠');
  showToast(`${PLAYER_LABEL[player]} 补杠：${tile.value}${SUIT_NAME[tile.type]}`);
}

// ═══════════════════════════════════════
//  弹窗：方向选择（通用：碰/杠来源）
// ═══════════════════════════════════════
let directionCallback = null;

function openDirectionModal(title, callback, excludePlayer) {
  directionCallback = callback;
  document.getElementById('kong-from-title').textContent = title;
  const container = document.getElementById('kong-from-options');
  container.innerHTML = '';
  ['left','across','right','me'].filter(p => p !== excludePlayer).forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-700 hover:border-amber-500 transition';
    btn.textContent = PLAYER_LABEL[p];
    btn.onclick = () => { closeKongFrom(); if(directionCallback) directionCallback(p); };
    container.appendChild(btn);
  });
  document.getElementById('modal-kong-from').classList.remove('hidden');
}

function openKongFromModal(callback, excludePlayer) {
  openDirectionModal('明杠来源（横牌方位）', callback, excludePlayer);
}

function closeKongFrom() { document.getElementById('modal-kong-from').classList.add('hidden'); }

// ═══════════════════════════════════════
//  弹窗：碰/杠选牌
// ═══════════════════════════════════════
let meldPlayer = null, meldType = null;

function openMeldPicker(player, type) {
  meldPlayer = player;
  meldType = type;
  const typeLabels = {pong:'碰', kong_ming:'明杠', kong_an:'暗杠'};
  pickerMode = 'meld';
  pickerMaxCount = 1;
  pickerSelected = [];
  document.getElementById('picker-title').textContent = `${PLAYER_LABEL[player]} ${typeLabels[type]} — 选牌`;
  document.getElementById('picker-hint').textContent = '选1张';
  document.getElementById('picker-confirm-btn').onclick = function() {
    if(!pickerSelected.length) { showToast('请选一张牌'); return; }
    const tile = pickerSelected[0];

    if(meldType==='pong') {
      // 碰：需要知道谁打出的牌
      closePicker();
      openDirectionModal('谁打出的牌？', (fromPlayer) => {
        // 合规检查：我方碰需要手中有至少2张一样的暗牌
        if (meldPlayer === 'me') {
          const inHand = state.myHand.filter(t => t.type === tile.type && t.value === tile.value).length;
          if (inHand < 2) {
            showWarning(`碰需要手中有两张${tile.value}${SUIT_NAME[tile.type]}，当前手中只有${inHand}张`);
            return;
          }
          // 从手牌移除2张
          for (let i = 0; i < 2; i++) {
            const idx = state.myHand.findIndex(t => t.type === tile.type && t.value === tile.value);
            if (idx !== -1) state.myHand.splice(idx, 1);
          }
        }
        // 从来源玩家出牌堆移除1张
        const srcDiscards = state.players[fromPlayer].discards;
        const srcIdx = srcDiscards.findIndex(t => t.type === tile.type && t.value === tile.value);
        if (srcIdx === -1) {
          showWarning(`${PLAYER_LABEL[fromPlayer]}的出牌堆中没有${tile.value}${SUIT_NAME[tile.type]}`);
          return;
        }
        srcDiscards.splice(srcIdx, 1);

        if (meldPlayer !== 'me') opponentHandRemove(meldPlayer, tile, 3);
        state.players[meldPlayer].melds.push({type:'pong', tiles:[tile,tile,tile], fromPlayer});
        state.history.push({type:'meld', player:meldPlayer});
        renderTable(); renderMyHand();
        validateTileCount(meldPlayer, '碰');
        showToast(`${PLAYER_LABEL[meldPlayer]} 碰：${tile.value}${SUIT_NAME[tile.type]} (${PLAYER_LABEL[fromPlayer]}打出)`);
      }, meldPlayer);

    } else if(meldType==='kong_ming') {
      // 明杠：别人打出1张 + 我手中3张
      closePicker();
      openKongFromModal((fromPlayer) => {
        if (meldPlayer === 'me') {
          const inHand = state.myHand.filter(t => t.type === tile.type && t.value === tile.value).length;
          if (inHand < 3) {
            showWarning(`明杠需要手中有三张${tile.value}${SUIT_NAME[tile.type]}，当前手中只有${inHand}张`);
            return;
          }
          for (let i = 0; i < 3; i++) {
            const idx = state.myHand.findIndex(t => t.type === tile.type && t.value === tile.value);
            if (idx !== -1) state.myHand.splice(idx, 1);
          }
        }
        const srcDiscards = state.players[fromPlayer].discards;
        const srcIdx = srcDiscards.findIndex(t => t.type === tile.type && t.value === tile.value);
        if (srcIdx === -1) {
          showWarning(`${PLAYER_LABEL[fromPlayer]}的出牌堆中没有${tile.value}${SUIT_NAME[tile.type]}`);
          return;
        }
        srcDiscards.splice(srcIdx, 1);

        if (meldPlayer !== 'me') { opponentHandRemove(meldPlayer, tile, 3); opponentHandDraw(meldPlayer, 0); }
        state.players[meldPlayer].melds.push({type:'kong_ming', tiles:[tile,tile,tile,tile], fromDir:fromPlayer});
        state.history.push({type:'meld', player:meldPlayer});
        renderTable(); renderMyHand();
        validateTileCount(meldPlayer, '明杠');
        showToast(`${PLAYER_LABEL[meldPlayer]} 明杠：${tile.value}${SUIT_NAME[tile.type]} (${PLAYER_LABEL[fromPlayer]}打出)`);
      }, meldPlayer);

    } else if(meldType==='kong_an') {
      // 暗杠：手中4张一样的牌
      if (meldPlayer === 'me') {
        const inHand = state.myHand.filter(t => t.type === tile.type && t.value === tile.value).length;
        if (inHand < 4) {
          showWarning(`暗杠需要手中有四张${tile.value}${SUIT_NAME[tile.type]}，当前手中只有${inHand}张`);
          return;
        }
        for (let i = 0; i < 4; i++) {
          const idx = state.myHand.findIndex(t => t.type === tile.type && t.value === tile.value);
          if (idx !== -1) state.myHand.splice(idx, 1);
        }
      }
      if (meldPlayer !== 'me') { opponentHandRemove(meldPlayer, tile, 4); opponentHandDraw(meldPlayer, 0); }
      state.players[meldPlayer].melds.push({type:'kong_an', tiles:[tile,tile,tile,tile]});
      state.history.push({type:'meld', player:meldPlayer});
      closePicker(); renderTable(); renderMyHand();
      validateTileCount(meldPlayer, '暗杠');
      showToast(`${PLAYER_LABEL[meldPlayer]} 暗杠：${tile.value}${SUIT_NAME[tile.type]}`);

    }
    document.getElementById('picker-confirm-btn').onclick = confirmPicker;
  };
  openPickerModal();
}

// ═══════════════════════════════════════
//  弹窗：胡牌流程
// ═══════════════════════════════════════
let winPlayer = null;

function openWinTilePicker(player) {
  winPlayer = player;
  pickerMode = 'win';
  pickerMaxCount = 1;
  pickerSelected = [];
  document.getElementById('picker-title').textContent = `${PLAYER_LABEL[player]} 胡牌 — 选胡的牌`;
  document.getElementById('picker-hint').textContent = '选1张';
  document.getElementById('picker-confirm-btn').onclick = function() {
    if(!pickerSelected.length) { showToast('请选一张牌'); return; }
    const tile = pickerSelected[0];
    closePicker();
    openWinFromModal(winPlayer, tile);
  };
  openPickerModal();
}

function openWinFromModal(player, tile) {
  document.getElementById('kong-from-title').textContent = `${PLAYER_LABEL[player]} 胡牌 — 谁点炮？`;
  const container = document.getElementById('kong-from-options');
  container.innerHTML = '';

  // 自摸按钮
  const selfBtn = document.createElement('button');
  selfBtn.className = 'py-3 rounded-xl bg-teal-800 border border-teal-600 text-teal-200 font-bold text-sm hover:bg-teal-700 transition';
  selfBtn.textContent = '自摸';
  selfBtn.onclick = () => { closeKongFrom(); doWin(player, tile, player); };
  container.appendChild(selfBtn);

  // 其他玩家按钮（含我方，别家可能胡我打出的牌）
  ['me','left','right','across'].filter(p => p !== player).forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-700 hover:border-amber-500 transition';
    btn.textContent = PLAYER_LABEL[p];
    btn.onclick = () => { closeKongFrom(); doWin(player, tile, p); };
    container.appendChild(btn);
  });

  document.getElementById('modal-kong-from').classList.remove('hidden');
}

function doWin(player, tile, fromPlayer) {
  const isSelfDraw = fromPlayer === player;

  // 非自摸：从点炮玩家的出牌堆移除该牌
  if (!isSelfDraw) {
    const srcDiscards = state.players[fromPlayer].discards;
    const srcIdx = srcDiscards.findIndex(t => t.type === tile.type && t.value === tile.value);
    if (srcIdx !== -1) {
      srcDiscards.splice(srcIdx, 1);
    }
  }

  // 将胡牌记录为 meld（自摸时 fromPlayer 为 null）
  state.players[player].melds.push({type:'hu', tiles:[{...tile}], fromPlayer: isSelfDraw ? null : fromPlayer});
  state.history.push({type:'meld', player});

  renderTable(); renderMyHand();
  const label = isSelfDraw ? '自摸' : `${PLAYER_LABEL[fromPlayer]}点炮`;
  showToast(`${PLAYER_LABEL[player]} 胡牌！${label} — ${tile.value}${SUIT_NAME[tile.type]}`);
}

// ═══════════════════════════════════════
//  弹窗：定缺
// ═══════════════════════════════════════
function closeDingque() { document.getElementById('modal-dingque').classList.add('hidden'); }
function confirmDingque(suit) {
  if(!currentActionPlayer) return;

  const prev = state.players[currentActionPlayer].dingque;
  state.players[currentActionPlayer].dingque = suit;
  state.history.push({type:'dingque', player:currentActionPlayer, prev});
  updateBadge(currentActionPlayer);
  closeDingque();

  showToast(`${PLAYER_LABEL[currentActionPlayer]} 定缺：${SUIT_NAME[suit]}`);
  currentActionPlayer = null;
}

// ═══════════════════════════════════════
//  弹窗：通用选牌器（支持同牌多选）
// ═══════════════════════════════════════
let pickerMode = 'discard';
let pickerMaxCount = 99;
let pickerSelected = [];
let discardTarget = null;
let claimTileIdx = null;   // 公共河牌中待认领牌的索引

function openDiscardModal(player) {
  discardTarget = player;
  pickerMode = 'discard';
  pickerMaxCount = 99;
  pickerSelected = [];
  document.getElementById('picker-title').textContent = `录入 ${PLAYER_LABEL[player]} 出牌`;
  document.getElementById('picker-hint').textContent = '可多选（含同牌），完成后确认';
  document.getElementById('picker-confirm-btn').onclick = confirmPicker;
  openPickerModal();
}

function openTilePicker(mode, maxCount) {
  pickerMode = mode;
  pickerMaxCount = maxCount;
  pickerSelected = [];
  if(mode==='swapIn') {
    document.getElementById('picker-title').textContent = '选择换入3张牌';
    document.getElementById('picker-hint').textContent = '选3张';
  }
  document.getElementById('picker-confirm-btn').onclick = confirmPicker;
  openPickerModal();
}

function openHandEditor() {
  pickerMode = 'handEdit';
  pickerMaxCount = 14;
  pickerSelected = state.myHand.map(t=>({...t}));
  document.getElementById('picker-title').textContent = '录入/编辑我方手牌';
  document.getElementById('picker-hint').textContent = `当前${pickerSelected.length}张 (最多14张)`;
  document.getElementById('picker-confirm-btn').onclick = function() {
    state.myHand = [...pickerSelected];
    state.myHand.sort((a,b) => {const so={W:0,T:1,B:2}; return so[a.type]-so[b.type]||a.value-b.value;});
    state.selectedHandIdx = null;
    state.swapOut = []; state.swapIn = []; state.swapDir = null;
    renderSwapOut(); renderSwapIn();
    renderMyHand(); renderTable();
    closePicker();
    document.getElementById('picker-confirm-btn').onclick = confirmPicker;

    validateTileCount('me', '录入手牌');
    showToast(`手牌已更新（${state.myHand.length}张）`);
  };
  openPickerModal();
}

function openPickerModal() {
  renderPickerGrid();
  renderPickerPreview();
  document.getElementById('modal-picker').classList.remove('hidden');
}

function closePicker() {
  document.getElementById('modal-picker').classList.add('hidden');
  pickerSelected = [];
  discardTarget = null;
}

function closePickerIfOutside(e) { if(e.target===document.getElementById('modal-picker')) closePicker(); }

function renderPickerGrid() {
  const used = getTileUsed();

  ['W','T','B'].forEach(suit => {
    const grid = document.getElementById(`grid-${suit}`);
    grid.innerHTML = '';
    for(let v=1;v<=9;v++) {
      const key = `${suit}${v}`;
      let baseUsed = used[key] || 0;

      // 编辑手牌/碰杠/胡牌模式：自己手牌不算已用（合规检查在确认时单独做）
      if(pickerMode==='handEdit' || pickerMode==='meld' || pickerMode==='win') {
        const inMyHand = state.myHand.filter(t=>t.type===suit&&t.value===v).length;
        baseUsed = baseUsed - inMyHand;
      }

      const inSel = pickerSelected.filter(t=>t.type===suit&&t.value===v).length;
      const totalUsedWithSel = baseUsed + inSel;
      // 胡牌模式不限制牌的使用次数（胡牌可能来自已打出的牌）
      const isWinMode = pickerMode === 'win';
      const remaining = isWinMode ? 4 : (4 - baseUsed);
      const canAdd = isWinMode ? (pickerSelected.length < pickerMaxCount) : ((4 - totalUsedWithSel) > 0 && pickerSelected.length < pickerMaxCount);

      const btn = document.createElement('button');
      const isActive = inSel > 0;
      btn.style.cssText = `flex:1;aspect-ratio:0.72;max-width:34px;border-radius:5px;border:${isActive?'2px':'1px'} solid ${isActive?SUIT_COLOR[suit]:'#334155'};background:${isActive?'#1e3a5f':'#1e293b'};color:${SUIT_COLOR[suit]};font-size:12px;font-weight:bold;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:${(!canAdd&&!isActive)?'not-allowed':'pointer'};opacity:${(!canAdd&&!isActive)?'0.25':'1'};transition:all 0.1s;padding:2px;position:relative;`;

      // 显示数字 + 选中数/剩余数
      const countLabel = isActive ? `${inSel}选` : `余${remaining}`;
      btn.innerHTML = `<span style="font-size:14px;line-height:1.2">${v}</span><span style="font-size:8px;color:${isActive?'#94a3b8':'#475569'}">${countLabel}</span>`;

      if(canAdd || isActive) {
        btn.addEventListener('click', () => togglePickerTile(suit, v));
      }
      grid.appendChild(btn);
    }
  });
}

function togglePickerTile(suit, v) {
  // 长按或再次点击已选牌：减少选中数量
  const idx = pickerSelected.findIndex(t=>t.type===suit&&t.value===v);

  // 计算该牌当前选了几张
  const inSel = pickerSelected.filter(t=>t.type===suit&&t.value===v).length;
  const used = getTileUsed();
  const key = `${suit}${v}`;
  let baseUsed = used[key]||0;
  if(pickerMode==='handEdit' || pickerMode==='meld' || pickerMode==='win') {
    baseUsed -= state.myHand.filter(t=>t.type===suit&&t.value===v).length;
  }
  const totalUsed = baseUsed + inSel;
  const isWinMode = pickerMode === 'win';
  const canAddMore = isWinMode ? (pickerSelected.length < pickerMaxCount) : (totalUsed < 4 && pickerSelected.length < pickerMaxCount);

  if(canAddMore) {
    // 可以继续添加
    pickerSelected.push({type:suit, value:v});
  } else if(inSel > 0) {
    // 已达上限或总数已满，点击则减少一张
    const lastIdx = pickerSelected.map((t,i)=>({t,i})).filter(x=>x.t.type===suit&&x.t.value===v).pop().i;
    pickerSelected.splice(lastIdx, 1);
  }

  renderPickerGrid();
  renderPickerPreview();
  if(pickerMode==='handEdit') {
    document.getElementById('picker-hint').textContent = `当前${pickerSelected.length}张 (最多14张)`;
  }
}

function renderPickerPreview() {
  const el = document.getElementById('picker-selected-preview');
  el.innerHTML = '';
  if(!pickerSelected.length) {
    el.innerHTML = '<span style="font-size:10px;color:#475569">已选：无（点击牌张添加，再点减少）</span>';
  } else {
    el.innerHTML = `<span style="font-size:10px;color:#64748b;margin-right:4px">已选${pickerSelected.length}张：</span>`;
    pickerSelected.forEach(t => el.appendChild(createTileEl(t,'sm','up')));
  }
}

function confirmPicker() {
  if(!pickerSelected.length) { showToast('请选择牌张'); return; }
  if(pickerMode==='discard' && discardTarget) {
    // 我方出牌需校验手牌中是否有该牌
    if (discardTarget === 'me') {
      const handCopy = state.myHand.map(t => ({type:t.type, value:t.value}));
      for (const sel of pickerSelected) {
        const idx = handCopy.findIndex(t => t.type === sel.type && t.value === sel.value);
        if (idx === -1) {
          showWarning(`我方手牌中没有 ${sel.value}${SUIT_NAME[sel.type]}，无法打出`);
          return;
        }
        handCopy.splice(idx, 1);
      }
      pickerSelected.forEach(sel => {
        const idx = state.myHand.findIndex(t => t.type === sel.type && t.value === sel.value);
        if (idx !== -1) state.myHand.splice(idx, 1);
        state.players.me.discards.push({...sel});
        state.history.push({type:'discard', player:'me', tile:sel});
      });
      state.selectedHandIdx = null;
      renderMyHand();
    } else {
      pickerSelected.forEach(t => {
        opponentHandDraw(discardTarget, 1);
        opponentHandRemove(discardTarget, t, 1);
        state.players[discardTarget].discards.push({...t});
        state.history.push({type:'discard', player:discardTarget, tile:t});
      });
    }
    renderTable();
    showToast(`已录入${PLAYER_LABEL[discardTarget]}出牌`);
  } else if(pickerMode==='swapIn') {
    if(pickerSelected.length!==3) { showToast('换入必须3张'); return; }
    state.swapIn = [...pickerSelected];
    renderSwapIn();
  }
  closePicker();
}

// ═══════════════════════════════════════
//  拍照录入
// ═══════════════════════════════════════
function openCameraInput() {
  document.getElementById('camera-preview').classList.add('hidden');
  document.getElementById('modal-camera').classList.remove('hidden');
}
function closeCamera() { document.getElementById('modal-camera').classList.add('hidden'); }
function triggerFileInput() { document.getElementById('camera-file-input').click(); }
let selectedPhotoFile = null;

function handlePhotoSelected(e) {
  const file = e.target.files[0];
  if(!file) return;
  selectedPhotoFile = file;
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('camera-preview-img').src = ev.target.result;
    document.getElementById('camera-preview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

async function analyzePhoto() {
  if (!USE_MOCK_RECOGNIZE && !selectedPhotoFile) {
    showToast('请先选择照片');
    return;
  }
  showToast('AI 识别中...');

  try {
    if (USE_MOCK_RECOGNIZE) {
      // 模拟模式：延时500ms后使用内嵌示例数据
      await new Promise(r => setTimeout(r, 500));
      loadGameState(SAMPLE_GAME_DATA);
      closeCamera();
      showToast('识别完成！牌桌数据已加载（模拟）');
    } else {
      const formData = new FormData();
      formData.append('image', selectedPhotoFile);
      const resp = await fetch(API_URL + '/api/recognize', {
        method: 'POST',
        body: formData
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      loadGameState(data);
      closeCamera();
      showToast('识别完成！牌桌数据已加载');
    }
  } catch (err) {
    console.error('拍照识别失败', err);
    closeCamera();
    showToast('后端不可用：' + err.message);
  } finally {
    selectedPhotoFile = null;
  }
}

// ═══════════════════════════════════════
//  AI 分析
// ═══════════════════════════════════════
async function requestAI() {
  if (!validateHandCountsForAI()) return;

  const btn = document.getElementById('ai-btn');
  const origText = btn.textContent;
  btn.textContent = '分析中...'; btn.disabled = true; btn.style.opacity = '0.7';

  try {
    if (USE_MOCK_AI) {
      // 模拟模式：延时500ms后使用内嵌模拟数据
      await new Promise(r => setTimeout(r, 500));
      renderAIResponse(MOCK_AI_DATA);
    } else {
      const payload = buildRequestPayload();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', blob, 'game_state.json');

      const resp = await fetch(API_URL + '/analyze/file', {
        method: 'POST',
        body: formData
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${resp.status}`);
      }
      const result = await resp.json();
      // 后端返回格式: { analysis: {...}, message: "...", status: "success" }
      const data = result.analysis || result;
      renderAIResponse(data);
    }
    document.getElementById('advice-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    console.error('AI 分析请求失败', err);
    showToast('AI 分析请求失败，请确认后端服务已启动');
  } finally {
    btn.textContent = origText; btn.disabled = false; btn.style.opacity = '1';
  }
}

// ═══════════════════════════════════════
//  AI 响应渲染
// ═══════════════════════════════════════

function sectionBox(title, icon) {
  const div = document.createElement('div');
  div.className = 'bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg mb-3';
  div.innerHTML = `<div class="px-4 py-2.5 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
    <span class="text-xs">${icon||''}</span>
    <span class="text-[11px] font-bold text-slate-300">${title}</span>
  </div>`;
  div._body = document.createElement('div');
  div._body.className = 'p-3';
  div.appendChild(div._body);
  return div;
}

function renderAIResponse(data) {
  const section = document.getElementById('advice-section');
  section.innerHTML = '';

  // 元数据
  if (data.metadata || data.game_stage) {
    section.appendChild(buildMetadataBar(data));
  }

  // 手牌分析
  if (data.hand_analysis) {
    section.appendChild(buildHandAnalysis(data.hand_analysis, data.hand_direction));
  }

  // 河牌分析
  if (data.river_analysis) {
    section.appendChild(buildRiverAnalysis(data.river_analysis));
  }

  // 听牌进度
  if (data.tenpai_progress) {
    section.appendChild(buildTenpaiProgress(data.tenpai_progress));
  }

  // 最终推荐
  if (data.recommendation) {
    section.appendChild(buildRecommendation(data.recommendation));
  }

  // 对手分析
  if (data.opponent_info) {
    section.appendChild(buildOpponentInfo(data.opponent_info));
  }

  // 策略参考
  if (data.strategy_references && data.strategy_references.length) {
    section.appendChild(buildStrategyRefs(data.strategy_references));
  }

  // 总结
  if (data.summary) {
    section.appendChild(buildSummary(data.summary));
  }
}

function buildMetadataBar(data) {
  const box = sectionBox('分析概览', '🏷');
  const stage = data.game_stage || '';
  const model = data.metadata?.model || '';
  const time = data.analysis_timestamp || data.metadata?.analysis_timestamp || '';
  box._body.innerHTML = `
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
      ${stage ? `<span>阶段：<span class="text-slate-200 font-bold">${stage}</span></span>` : ''}
      ${model ? `<span>模型：<span class="text-slate-200">${model}</span></span>` : ''}
      ${time ? `<span>时间：<span class="text-slate-200">${time.slice(0,19).replace('T',' ')}</span></span>` : ''}
    </div>`;
  return box;
}

const SUIT_STYLE = {
  '万': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  '筒': { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  '索': { color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
};

function buildHandAnalysis(ha, handDirection) {
  const box = sectionBox('手牌分析', '🀄');

  const sd = ha.suit_distribution || {};
  const distHtml = Object.entries(sd).map(([k, v]) => {
    const suitName = k.replace('子', '');
    const style = SUIT_STYLE[suitName] || { color: '#94a3b8', bg: 'transparent' };
    return `<span class="text-xs font-bold" style="color:${style.color}">${k}：${v}</span>`;
  }).join('&nbsp;&nbsp;');

  let structHtml = '';
  const hs = ha.hand_structure;
  if (hs) {
    const parts = [];
    if (hs.triplets && hs.triplets.length) {
      parts.push(`<span class="text-amber-300">刻子：${hs.triplets.map(t => `${t.tile}×${t.count}`).join('、')}</span>`);
    }
    if (hs.pairs && hs.pairs.length) {
      parts.push(`<span class="text-blue-300">对子：${hs.pairs.map(t => `${t.tile}×${t.count}`).join('、')}</span>`);
    }
    if (hs.sequences_potential && hs.sequences_potential.length) {
      parts.push(`<span class="text-green-300">顺子：${hs.sequences_potential.map(s => `<span title="${s.needs||''}">${s.tiles}(${s.status})</span>`).join('、')}</span>`);
    }
    if (hs.isolated_tiles && hs.isolated_tiles.length) {
      parts.push(`<span class="text-red-400/80">孤张：${hs.isolated_tiles.map(t => `${t.tile}(${t.reason})`).join('、')}</span>`);
    }
    if (parts.length) structHtml = `<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">${parts.join('')}</div>`;
  }

  box._body.innerHTML = `
    <div class="flex flex-wrap gap-x-4 gap-y-1 mb-2">${distHtml}</div>
    <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
      ${ha.missing_suit ? `<span>缺门：<span class="text-slate-200">${ha.missing_suit}</span></span>` : ''}
      ${ha.missing_suit_status ? `<span>状态：<span class="text-slate-200">${ha.missing_suit_status}</span></span>` : ''}
      ${handDirection ? `<span>做牌方向：<span class="text-amber-400 font-bold">${handDirection}</span></span>` : ''}
    </div>
    ${structHtml}
    <p class="text-[10px] text-slate-500 mt-2">共 ${ha.total_tiles} 张</p>`;
  return box;
}

function buildRiverAnalysis(ra) {
  const box = sectionBox('河牌分析', '🌊');

  const cats = [
    { key: 'wanzi', label: '万', color: '#ef4444' },
    { key: 'tongzi', label: '筒', color: '#3b82f6' },
    { key: 'suosu', label: '索', color: '#10b981' }
  ];

  let countsHtml = '';
  for (const c of cats) {
    const tiles = ra[c.key];
    if (tiles && Object.keys(tiles).length) {
      const entries = Object.entries(tiles).map(([t, n]) => `<span style="color:${c.color}">${t}×${n}</span>`).join(' ');
      countsHtml += `<div class="text-[10px] mb-1"><span class="text-slate-500">${c.label}：</span>${entries}</div>`;
    }
  }

  let insightsHtml = '';
  if (ra.key_insights && ra.key_insights.length) {
    insightsHtml = `<div class="mt-2 flex flex-col gap-1">${ra.key_insights.map(i => `<div class="text-[10px] text-amber-400/80">• ${i}</div>`).join('')}</div>`;
  }

  box._body.innerHTML = countsHtml + insightsHtml;
  return box;
}

function buildTenpaiProgress(tp) {
  const box = sectionBox('听牌进度', '📊');
  box._body.innerHTML = `
    <div class="grid grid-cols-3 gap-2 text-xs mb-2">
      <div class="bg-slate-800 rounded-lg p-2 text-center">
        <div class="text-[10px] text-slate-500">向听数</div>
        <div class="text-slate-200 font-bold">${tp.current_shanten||'—'}</div>
      </div>
      <div class="bg-slate-800 rounded-lg p-2 text-center">
        <div class="text-[10px] text-slate-500">目标</div>
        <div class="text-slate-200 font-bold">${tp.target||'—'}</div>
      </div>
      <div class="bg-slate-800 rounded-lg p-2 text-center">
        <div class="text-[10px] text-slate-500">牌效</div>
        <div class="text-slate-200 font-bold">${tp.efficiency||'—'}</div>
      </div>
    </div>
    ${tp.blocked_tiles && tp.blocked_tiles.length ? `<p class="text-[10px] text-slate-500">绝张/受阻牌：${tp.blocked_tiles.join('、')}</p>` : ''}`;
  return box;
}

function buildRecommendation(rec) {
  const box = sectionBox('AI 推荐', '🎯');

  box._body.innerHTML = `
    <div class="flex items-baseline gap-2 mb-2">
      <span class="text-xl font-black text-amber-400">${rec.primary_choice || '—'}</span>
      ${rec.secondary_choice ? `<span class="text-xs text-slate-500">备选：${rec.secondary_choice}</span>` : ''}
    </div>
    <p class="text-xs text-slate-400 leading-relaxed mb-2">${rec.reasoning || ''}</p>`;

  // 决策矩阵
  if (rec.decision_matrix) {
    const dm = rec.decision_matrix;
    box._body.innerHTML += `
      <div class="grid grid-cols-3 gap-1.5 mt-2 mb-3">
        ${Object.entries(dm).map(([k, v]) => `
          <div class="bg-slate-800 rounded-lg p-2 text-center">
            <div class="text-[10px] text-slate-500">${k}</div>
            <div class="text-[10px] text-slate-300 font-bold">${v}</div>
          </div>`).join('')}
      </div>`;
  }

  // 策略列表
  if (rec.strategies && rec.strategies.length) {
    const riskColor = { '高': 'text-red-400', '中': 'text-amber-400', '低': 'text-green-400', '中低': 'text-green-400' };
    rec.strategies.forEach((s, i) => {
      const card = document.createElement('div');
      card.className = 'bg-slate-800 rounded-lg p-3 mb-2 last:mb-0';
      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="text-sm font-bold text-slate-200">${s.strategy_id}. ${s.strategy_name}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 ${riskColor[s.risk_level]||'text-slate-400'}">${s.risk_level||'?'}风险</span>
        </div>
        <p class="text-xs text-slate-300 mb-2"><span class="text-amber-400 font-bold">${s.action}</span> — ${s.reasoning}</p>
        <div class="grid grid-cols-2 gap-2 text-[10px] mb-2">
          <div><span class="text-slate-500">方向</span><br><span class="text-slate-300">${s.direction||'—'}</span></div>
          <div><span class="text-slate-500">收益/胜率</span><br><span class="text-slate-300">${s.reward_level||'—'} / ${s.win_probability||'—'}</span></div>
        </div>
        ${s.expected_value ? `<p class="text-[10px] text-slate-500 mb-1">预期：${s.expected_value}</p>` : ''}
        ${s.advantages ? `<div class="mb-1">${s.advantages.map(a => `<div class="text-[10px] text-green-400/80">✓ ${a}</div>`).join('')}</div>` : ''}
        ${s.risks ? `<div class="mb-1">${s.risks.map(r => `<div class="text-[10px] text-red-400/80">✗ ${r}</div>`).join('')}</div>` : ''}
        ${s.target_tiles ? `<p class="text-[10px] text-slate-500">目标牌：${s.target_tiles.join('、')}</p>` : ''}
        ${s.next_moves ? `<div class="mt-1">${s.next_moves.map(m => `<div class="text-[10px] text-blue-400/70">→ ${m}</div>`).join('')}</div>` : ''}
      `;
      box._body.appendChild(card);
    });
  }

  return box;
}

function buildOpponentInfo(oi) {
  const box = sectionBox('对手分析', '👁');
  const items = [];
  const labelMap = { left_hand: '上家', right_hand: '下家', across_hand: '对家' };
  const threatColor = { '高': 'text-red-400', '中': 'text-amber-400', '低': 'text-green-400', '无': 'text-slate-500' };

  for (const [key, info] of Object.entries(oi)) {
    if (key === 'summary') continue;
    items.push(`
      <div class="bg-slate-800 rounded-lg p-2 mb-1 last:mb-0">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-300">${labelMap[key]||key}</span>
          <span class="text-[10px] ${threatColor[info.threat_level]||'text-slate-400'}">威胁度：${info.threat_level||'?'}</span>
        </div>
        <div class="flex gap-3 mt-1 text-[10px] text-slate-500">
          <span>定缺：<span class="text-slate-300">${info.dingque||'未知'}</span></span>
          <span>明牌：<span class="text-slate-300">${info.exposed||'无'}</span></span>
        </div>
      </div>`);
  }

  if (oi.summary) {
    items.push(`<p class="text-[10px] text-slate-400 mt-2 leading-relaxed">${oi.summary}</p>`);
  }

  box._body.innerHTML = items.join('');
  return box;
}

function buildStrategyRefs(refs) {
  const box = sectionBox('策略参考', '📖');
  box._body.innerHTML = refs.map(r => `<div class="text-[10px] text-slate-400 mb-1">• ${r}</div>`).join('');
  return box;
}

function buildSummary(text) {
  const box = sectionBox('总结', '💡');
  box._body.innerHTML = `<p class="text-xs text-slate-300 leading-relaxed">${text}</p>`;
  return box;
}

// ═══════════════════════════════════════
//  Toast
// ═══════════════════════════════════════
function showToast(msg) {
  let toast = document.getElementById('toast');
  if(!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;border:1px solid #334155;color:#e2e8f0;padding:8px 18px;border-radius:20px;font-size:12px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:none;transition:opacity 0.3s;white-space:nowrap;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity='0'; }, 2000);
}


function initMockData() {
  // 所有玩家定缺初始为空，出牌堆为空，等待后端图片识别结果重新加载
  ['me','left','right','across'].forEach(p => {
    state.players[p].dingque = null;
    state.players[p].discards = [];
    state.players[p].melds = [];
  });
  state.opponentHands = {
    left: Array(13).fill(null).map(() => ({ ...SENTINEL })),
    right: Array(13).fill(null).map(() => ({ ...SENTINEL })),
    across: Array(13).fill(null).map(() => ({ ...SENTINEL }))
  };
  state.currentTurn = 'me';
  state.dealer = null;
  state.myHand = [];
  state.history = [];
  state.selectedHandIdx = null;
  state.swapOut = []; state.swapIn = []; state.swapDir = null;
  state.personalRiverVisible = true;
  state.publicRiverTiles = [];
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  renderMyHand();
  renderSwapOut();
  renderSwapIn();
});

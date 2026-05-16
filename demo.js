// ═══════════════════════════════════════
//  常量
// ═══════════════════════════════════════
const SUIT_NAME = { W: '万', T: '筒', B: '条' };
const SUIT_COLOR = { W: '#ef4444', T: '#3b82f6', B: '#10b981' };
const SUIT_BG = { W: 'bg-red-500', T: 'bg-blue-500', B: 'bg-emerald-500' };
const SUIT_BORDER = { W: 'border-red-400', T: 'border-blue-400', B: 'border-emerald-400' };
const SUIT_TEXT = { W: 'text-red-400', T: 'text-blue-400', B: 'text-emerald-400' };
const PLAYER_LABEL = { me: '我方', left: '上家', right: '下家', across: '对家' };

// ═══════════════════════════════════════
//  状态
// ═══════════════════════════════════════
const state = {
  players: {
    me:     { dingque: null, melds: [], discards: [] },
    left:   { dingque: null, melds: [], discards: [] },
    right:  { dingque: null, melds: [], discards: [] },
    across: { dingque: null, melds: [], discards: [] },
  },
  handCounts: { left: 13, right: 13, across: 13 },
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
    count += state.handCounts[player];
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

// 获取某玩家实际手牌上限（基础13张 + 杠数补偿）
function getActualHandLimit(player) {
  return 13 + getPlayerKongCount(player);
}

// AI分析前校验所有玩家总牌数（手牌 + 副露）
function validateHandCountsForAI() {
  const players = ['me', 'left', 'right', 'across'];

  for (const p of players) {
    const totalCount = getPlayerTotalTiles(p);
    const actualLimit = getActualHandLimit(p);

    let expected;
    if (state.currentTurn === 'me') {
      // 我的回合：我 = 我的上限 + 1，其他 = 对应上限
      expected = (p === 'me') ? actualLimit + 1 : actualLimit;
    } else {
      // 其他家的回合：我 = 我的上限，其他 = 对应上限
      expected = actualLimit;
    }

    if (totalCount !== expected) {
      const label = p === 'me' ? '我方' : PLAYER_LABEL[p];
      showWarning(`${label} 总牌数 ${totalCount} 张（手牌+副露），预期 ${expected} 张（实际上限 ${actualLimit}）。请检查录入数据。`);
      return false;
    }
  }
  return true;
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

function cycleTurn() {
  const order = ['me', 'left', 'right', 'across'];
  const idx = order.indexOf(state.currentTurn);
  state.currentTurn = order[(idx + 1) % order.length];
  renderTable();
  showToast(`当前回合：${PLAYER_LABEL[state.currentTurn]}`);
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
      state.history.push({type:'undoDiscard', player, tile, idx});
      renderTable();
      showToast(`已撤回${PLAYER_LABEL[player]}出牌：${tile.value}${SUIT_NAME[tile.type]}`);
    });
    // 单击也阻止冒泡，防止误触发容器的 onclick
    tileEl.addEventListener('click', (e) => { e.stopPropagation(); });
    tileEl.style.cursor = 'pointer';
    tileEl.title = '双击撤回';
    el.appendChild(tileEl);
  });
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
      state.players[player].melds.splice(idx, 1);
      state.history.push({type:'undoMeld', player, meld, idx});
      renderTable();
      showToast(`已撤回${PLAYER_LABEL[player]}的${meld.type==='pong'?'碰':'杠'}`);
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
  for(let i=0;i<state.handCounts[player];i++) el.appendChild(createHiddenTileEl(direction));
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
  document.getElementById('hand-count-label').textContent = `(${state.myHand.length}张)`;

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
        state.handCounts[last.player] += 2;
      } else if (meld.type === 'kong_ming') {
        state.handCounts[last.player] += 3;
      } else if (meld.type === 'kong_an') {
        state.handCounts[last.player] += 4;
      } else if (meld.type === 'kong_bu') {
        state.handCounts[last.player] += 1;
      }
    }
    // 恢复来源玩家出牌堆（碰和明杠从来源玩家拿走1张）
    const fromPlayer = meld.fromPlayer || meld.fromDir;
    if ((meld.type === 'pong' || meld.type === 'kong_ming') && fromPlayer) {
      state.players[fromPlayer].discards.push({type: tile.type, value: tile.value});
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

  // 如果有碰牌，增加补杠选项
  const pongTiles = state.players[player].melds.filter(m => m.type==='pong');
  if(pongTiles.length > 0) {
    actions.splice(2, 0, {id:'kong_bu', label:'补杠', hover:'hover:bg-pink-900/40 hover:border-pink-600 hover:text-pink-300'});
  }

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
  if(action==='win') { showToast(`${PLAYER_LABEL[p]} 胡牌！`); currentActionPlayer=null; return; }
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
    state.handCounts[player] -= 1;
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

        if (meldPlayer !== 'me') state.handCounts[meldPlayer] -= 2;
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

        if (meldPlayer !== 'me') state.handCounts[meldPlayer] -= 3;
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
      if (meldPlayer !== 'me') state.handCounts[meldPlayer] -= 4;
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

      // 编辑手牌/碰杠模式：自己手牌不算已用（合规检查在确认时单独做）
      if(pickerMode==='handEdit' || pickerMode==='meld') {
        const inMyHand = state.myHand.filter(t=>t.type===suit&&t.value===v).length;
        baseUsed = baseUsed - inMyHand;
      }

      const inSel = pickerSelected.filter(t=>t.type===suit&&t.value===v).length;
      const totalUsedWithSel = baseUsed + inSel;
      const remaining = 4 - baseUsed;  // 总共还能选几张
      const canAdd = (4 - totalUsedWithSel) > 0 && pickerSelected.length < pickerMaxCount;

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
  if(pickerMode==='handEdit' || pickerMode==='meld') {
    baseUsed -= state.myHand.filter(t=>t.type===suit&&t.value===v).length;
  }
  const totalUsed = baseUsed + inSel;
  const canAddMore = totalUsed < 4 && pickerSelected.length < pickerMaxCount;

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
        state.players[discardTarget].discards.push({...t});
        state.history.push({type:'discard', player:discardTarget, tile:t});
      });
    }
    renderTable();
    showToast(`已录入${PLAYER_LABEL[discardTarget]}出牌 ${pickerSelected.length}张`);
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
function handlePhotoSelected(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('camera-preview-img').src = ev.target.result;
    document.getElementById('camera-preview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}
function analyzePhoto() {
  showToast('AI 识别中...');
  setTimeout(() => {
    closeCamera();
    showToast('识别完成！（Demo模式：已加载示例数据）');
  }, 1500);
}

// ═══════════════════════════════════════
//  AI 分析（Mock）
// ═══════════════════════════════════════
const mockAdvice = {
  primary: '打 7条', confidence: '把握极高', benefitScore: 85, riskScore: 10,
  warnings: ['下家连续打出万字，极大概率在做筒子清一色！','场上4万、6万已出尽，5万成为绝张断头牌，请防暗对。'],
  reasons: [
    {title:'清理缺门', detail:'规则强制必须缺一门，优先打出最后的条子。'},
    {title:'保留核心搭子', detail:'手中有3、4、5、6筒的高联络张，保留可最大化听牌面。'},
    {title:'安全性极高', detail:'7条在场上已经是熟张，放铳概率接近0。'},
  ],
  alternatives: [{card:'1万', gap:'收益差 -25分（纯防守降级）'}]
};

function requestAI() {
  if (!state.currentTurn) {
    showWarning('请先设置当前回合（点击顶部"轮到XX"标签切换），确保有且只有一人处于当前回合。');
    return;
  }
  if (!validateHandCountsForAI()) return;
  const btn = document.getElementById('ai-btn');
  btn.textContent = '分析中...'; btn.disabled=true; btn.style.opacity='0.7';
  setTimeout(() => {
    renderAdvice(mockAdvice);
    btn.textContent = '⚡ 请求 AI 分析出牌建议'; btn.disabled=false; btn.style.opacity='1';
    document.getElementById('advice-section').scrollIntoView({behavior:'smooth',block:'start'});
  }, 1200);
}

function renderAdvice(advice) {
  document.getElementById('advice-placeholder').classList.add('hidden');
  const warnBox = document.getElementById('warning-box');
  const warnContent = document.getElementById('warning-content');
  if(advice.warnings&&advice.warnings.length) {
    warnContent.innerHTML = '';
    advice.warnings.forEach(w => { const p=document.createElement('p'); p.className='text-xs text-orange-400 leading-relaxed'; p.textContent=w; warnContent.appendChild(p); });
    warnBox.classList.remove('hidden');
  }
  document.getElementById('advice-card').classList.remove('hidden');
  document.getElementById('advice-primary').textContent = advice.primary;
  document.getElementById('advice-confidence').textContent = advice.confidence;
  document.getElementById('benefit-score').textContent = advice.benefitScore;
  document.getElementById('risk-score').textContent = advice.riskScore;
  setTimeout(() => {
    document.getElementById('benefit-bar').style.width = advice.benefitScore+'%';
    document.getElementById('risk-bar').style.width = advice.riskScore+'%';
  }, 100);
  const reasonsList = document.getElementById('reasons-list');
  reasonsList.innerHTML = '';
  advice.reasons.forEach(r => {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-2';
    div.innerHTML = `<div style="width:6px;height:6px;border-radius:50%;background:#64748b;margin-top:6px;flex-shrink:0"></div><p class="text-xs text-slate-300 leading-relaxed"><span class="font-bold text-slate-200">${r.title}：</span>${r.detail}</p>`;
    reasonsList.appendChild(div);
  });
  const altList = document.getElementById('alternatives-list');
  altList.innerHTML = '';
  advice.alternatives.forEach(alt => {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center text-xs';
    div.innerHTML = `<span class="text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">${alt.card}</span><span class="text-slate-500 text-[10px]">${alt.gap}</span>`;
    altList.appendChild(div);
  });
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
  state.handCounts = { left: 13, right: 13, across: 13 };
  state.currentTurn = 'me';
  state.dealer = null;
  state.myHand = [];
  state.history = [];
  state.selectedHandIdx = null;
  state.swapOut = []; state.swapIn = []; state.swapDir = null;
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  renderMyHand();
  renderSwapOut();
  renderSwapIn();
});

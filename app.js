const state = {
  hasGame: false,
  mode: "empty",
  discards: { p0: [], p1: [], p2: [], p3: [] },
  melds: { p0: [], p1: [], p2: [], p3: [] },
  hand: [],
  handCounts: { p1: 13, p2: 13, p3: 13 },
  bankerSeat: "p0",
  dingque: { p0: "", p1: "", p2: "", p3: "" },
  turnSeat: "p0",
  targetHandCount: 14,
  handAddCounts: {},
  usedCounts: {},
  lastAdvice: null,
  picking: null,
  actionSeat: null,
  actionType: null,
  actionTile: null,
  panX: 0,
  panY: 0,
};

function $(id) {
  return document.getElementById(id);
}

const SUITS = [
  { suit: "wan", name: "万" },
  { suit: "tong", name: "筒" },
  { suit: "tiao", name: "条" },
];

function tileText(t) {
  const suitName = t.suit === "wan" ? "万" : t.suit === "tong" ? "筒" : "条";
  return `${t.rank}${suitName}`;
}

function seatText(seat) {
  if (seat === "p0") return "我（p0）";
  if (seat === "p1") return "下家（p1）";
  if (seat === "p2") return "对家（p2）";
  return "上家（p3）";
}

function seatShortText(seat) {
  if (seat === "p0") return "我";
  if (seat === "p1") return "下家";
  if (seat === "p2") return "对家";
  return "上家";
}

function nextSeat(seat) {
  const order = ["p0", "p1", "p2", "p3"];
  const idx = order.indexOf(seat);
  if (idx < 0) return "p0";
  return order[(idx + 1) % 4];
}

function setTurn(seat) {
  state.turnSeat = seat;
  for (const s of ["p0", "p1", "p2", "p3"]) {
    const seatEl = document.querySelector(`.seat[data-seat="${s}"]`);
    if (seatEl) seatEl.classList.toggle("isTurn", s === seat);
    const edge = document.querySelector(`.edgeRiver[data-seat="${s}"]`);
    if (edge) edge.classList.toggle("isTurn", s === seat);
  }
}

function suitText(suit) {
  if (suit === "wan") return "万";
  if (suit === "tong") return "筒";
  if (suit === "tiao") return "条";
  return "未定缺";
}

function show(el) {
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}

function hide(el) {
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
}

function openModal(id) {
  show($("modalMask"));
  show($(id));
}

function closeModal(id) {
  hide($(id));
  const anyOpen = !document.querySelectorAll(".modal:not(.hidden)").length;
  if (anyOpen) hide($("modalMask"));
}

function setGameStatus(text) {
  $("gameStatus").textContent = text;
}

function setEnginePill(text, color) {
  $("enginePill").textContent = text;
  $("enginePill").style.borderColor = color || "rgba(255,255,255,0.12)";
}

function tileKey(tile) {
  return `${tile.rank}${tile.suit}`;
}

function allTileKeys() {
  const out = [];
  for (const s of ["wan", "tong", "tiao"]) {
    for (let r = 1; r <= 9; r++) out.push(`${r}${s}`);
  }
  return out;
}

function getUsedCount(key) {
  return state.usedCounts[key] || 0;
}

function getRemainingCount(key) {
  return 4 - getUsedCount(key);
}

function incUsed(key, n) {
  state.usedCounts[key] = (state.usedCounts[key] || 0) + n;
}

function decUsed(key, n) {
  state.usedCounts[key] = Math.max(0, (state.usedCounts[key] || 0) - n);
}

function countInHand(tile) {
  return state.hand.filter((t) => t.suit === tile.suit && t.rank === tile.rank).length;
}

function relativePos(actor, fromSeat) {
  const order = ["p0", "p1", "p2", "p3"];
  const ai = order.indexOf(actor);
  const fi = order.indexOf(fromSeat);
  if (ai < 0 || fi < 0) return "mid";
  const d = (fi - ai + 4) % 4;
  if (d === 1) return "right";
  if (d === 3) return "left";
  return "mid";
}

function renderTiles(container, tiles) {
  container.innerHTML = "";
  for (const t of tiles) {
    const span = document.createElement("span");
    span.className = `tile ${t.suit}`;
    span.textContent = tileText(t);
    container.appendChild(span);
  }
}

function renderBackTiles(container, count) {
  container.innerHTML = "";
  const n = Math.max(0, Math.min(14, count));
  for (let i = 0; i < n; i++) {
    const span = document.createElement("span");
    span.className = "tile back";
    span.textContent = "牌";
    container.appendChild(span);
  }
}

function renderMelds(container, melds) {
  container.innerHTML = "";
  for (const m of melds) {
    if (typeof m === "string") {
      const span = document.createElement("span");
      span.className = "tile";
      span.textContent = m;
      container.appendChild(span);
      continue;
    }
    const group = document.createElement("span");
    group.className = "meldGroup";
    if (m.kind === "pong") {
      for (let i = 0; i < 3; i++) {
        const span = document.createElement("span");
        span.className = `tile ${m.tile.suit}`;
        span.textContent = tileText(m.tile);
        group.appendChild(span);
      }
    } else if (m.kind === "kong") {
      const pos = m.kongType === "明杠" ? relativePos(m.actorSeat, m.fromSeat) : null;
      for (let i = 0; i < 4; i++) {
        const span = document.createElement("span");
        span.className = `tile ${m.tile.suit}`;
        if (m.kongType === "暗杠") {
          const isBack = i === 1;
          span.textContent = isBack ? "牌" : tileText(m.tile);
          if (isBack) span.classList.add("back");
        } else {
          span.textContent = tileText(m.tile);
        }
        if (m.kongType === "补杠") span.classList.add("stand");
        if (m.kongType === "明杠") {
          if (pos === "left" && i === 0) span.classList.add("rot90");
          if (pos === "right" && i === 3) span.classList.add("rot90");
          if (pos === "mid" && i === 1) span.classList.add("rot90");
        }
        group.appendChild(span);
      }
    } else if (m.kind === "hu") {
      const span = document.createElement("span");
      span.className = `tile ${m.tile.suit}`;
      span.textContent = tileText(m.tile);
      group.appendChild(span);
    }
    container.appendChild(group);
  }
}

function refreshTable() {
  for (const seat of ["p0", "p1", "p2", "p3"]) {
    const river = document.querySelector(`.tiles[data-seat="${seat}"][data-zone="riverTiles"]`);
    const edgeRiver = document.querySelector(`.tiles[data-seat="${seat}"][data-zone="edgeRiverTiles"]`);
    const melds = document.querySelector(`.melds[data-seat="${seat}"][data-zone="melds"]`);
    if (river) renderTiles(river, state.discards[seat]);
    if (edgeRiver) renderTiles(edgeRiver, state.discards[seat]);
    renderMelds(melds, state.melds[seat]);
  }
  const h0 = document.querySelector(`.tiles[data-seat="p0"][data-zone="handTiles"]`);
  if (h0) renderTiles(h0, state.hand);
  for (const seat of ["p1", "p2", "p3"]) {
    const h = document.querySelector(`.tiles[data-seat="${seat}"][data-zone="handTiles"]`);
    if (h) renderBackTiles(h, state.handCounts[seat]);
  }

  const banker = $("centerBanker");
  if (banker) banker.textContent = `庄家：${seatShortText(state.bankerSeat)}`;

  for (const seat of ["p0", "p1", "p2", "p3"]) {
    const tag = document.querySelector(`.dingqueTag[data-seat="${seat}"]`);
    if (tag) tag.textContent = suitText(state.dingque[seat]);
  }

  setTurn(state.turnSeat);
}

function setEmptyOverlay(on) {
  if (on) show($("tableEmptyOverlay"));
  else hide($("tableEmptyOverlay"));
}

function setAdvice(advice) {
  state.lastAdvice = advice;
  if (!advice) {
    $("primaryAdvice").textContent = "—";
    $("scores").textContent = "—";
    $("reasons").innerHTML = "";
    $("missing").innerHTML = "";
    setEnginePill("规则兜底");
    return;
  }
  $("primaryAdvice").textContent = advice.primary;
  $("scores").textContent = `收益 ${advice.benefit} / 风险 ${advice.risk}`;
  $("reasons").innerHTML = "";
  for (const r of advice.reasons) {
    const li = document.createElement("li");
    li.textContent = r;
    $("reasons").appendChild(li);
  }
  $("missing").innerHTML = "";
  for (const r of advice.missing) {
    const li = document.createElement("li");
    li.textContent = r;
    $("missing").appendChild(li);
  }
  setEnginePill(advice.engine, advice.engineColor);
}

function resetGame() {
  state.hasGame = true;
  state.mode = "full";
  state.bankerSeat = "p0";
  state.handCounts = { p1: 13, p2: 13, p3: 13 };
  state.usedCounts = {};
  state.hand = [];
  state.discards = { p0: [], p1: [], p2: [], p3: [] };
  state.melds = { p0: [], p1: [], p2: [], p3: [] };
  state.dingque = { p0: "", p1: "", p2: "", p3: "" };
  state.turnSeat = "p0";
  state.panX = 0;
  state.panY = 0;
  setGameStatus("已创建牌局（原型）");
  setEmptyOverlay(false);
  setAdvice({
    engine: "规则兜底",
    engineColor: "rgba(255,255,255,0.12)",
    primary: "原型已就绪：从我方手牌开始",
    benefit: "—",
    risk: "—",
    reasons: ["点击“手牌（仅我方）”录入手牌", "点击任意出牌区录入出牌", "点击任意头像录入碰/杠/胡（支持转移牌与轮转高亮）"],
    missing: [],
  });
  refreshTable();
}

function computeMissing() {
  const missing = [];
  if (!state.hasGame) missing.push("未创建牌局");
  if (!state.hand.length) missing.push("未录入我方手牌");
  if (!state.dingque.p0) missing.push("未录入我方定缺");
  const hasAnyDiscard = Object.values(state.discards).some((arr) => arr.length > 0);
  if (!hasAnyDiscard) missing.push("暂无任何出牌记录");
  return missing;
}

function analyze() {
  const missing = computeMissing();
  if (missing.length) {
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "信息不足，无法给出稳定建议",
      benefit: "—",
      risk: "—",
      reasons: ["先补全必要信息，再点击分析", "可从“出牌区”追加任意一家出牌开始"],
      missing,
    });
    return;
  }
  const myLast = state.discards.p0.at(-1);
  const sample = myLast ? `下一步倾向打：${tileText(myLast)}` : "下一步倾向打：5筒";
  setAdvice({
    engine: "大模型（受控）",
    engineColor: "rgba(59,130,246,0.45)",
    primary: sample,
    benefit: 0.62,
    risk: 0.33,
    reasons: ["优先减少生张风险", "保留顺子潜力，减少拆搭", "对局信息不足时倾向稳健策略"],
    missing: [],
  });
}

function buildTileGrid(onPick, isEnabled) {
  const grid = $("tileGrid");
  grid.innerHTML = "";
  for (const s of SUITS) {
    for (let r = 1; r <= 9; r++) {
      const t = { suit: s.suit, rank: r };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tileBtn";
      btn.textContent = `${r}${s.name}`;
      const ok = isEnabled ? !!isEnabled(t) : true;
      btn.disabled = !ok;
      btn.style.opacity = ok ? "1" : "0.35";
      btn.addEventListener("click", () => {
        if (!ok) return;
        onPick(t);
      });
      grid.appendChild(btn);
    }
  }
}

function openTilePicker(title, cb, isEnabled) {
  $("pickerTitle").textContent = title;
  state.picking = cb;
  buildTileGrid((t) => {
    closeModal("modalPicker");
    const fn = state.picking;
    state.picking = null;
    if (fn) fn(t);
  }, isEnabled);
  openModal("modalPicker");
}

function onClickRiver(seat) {
  if (!state.hasGame) {
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "请先创建牌局",
      benefit: "—",
      risk: "—",
      reasons: ["顶部“牌局” → “创建”"],
      missing: ["未创建牌局"],
    });
    return;
  }
  openTilePicker(
    `给${seat === "p0" ? "我" : seat === "p1" ? "下家" : seat === "p2" ? "对家" : "上家"}追加出牌`,
    (t) => {
      if (seat === "p0") {
        const idx = state.hand.findIndex((x) => x.suit === t.suit && x.rank === t.rank);
        if (idx >= 0) {
          state.hand.splice(idx, 1);
        } else {
          const key = tileKey(t);
          if (getRemainingCount(key) <= 0) return;
          incUsed(key, 1);
        }
        state.discards[seat].push(t);
      } else {
        state.discards[seat].push(t);
        incUsed(tileKey(t), 1);
      }
      setTurn(nextSeat(seat));
      refreshTable();
    },
    (t) => (seat === "p0" ? (countInHand(t) > 0 || getRemainingCount(tileKey(t)) > 0) : getRemainingCount(tileKey(t)) > 0),
  );
}

function onClickEdgeRiver(seat) {
  if (!state.hasGame) {
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "请先创建牌局",
      benefit: "—",
      risk: "—",
      reasons: ["顶部“牌局” → “创建”"],
      missing: ["未创建牌局"],
    });
    return;
  }
  openTilePicker(
    `给${seatText(seat)}追加出牌`,
    (t) => {
      state.discards[seat].push(t);
      incUsed(tileKey(t), 1);
      setTurn(nextSeat(seat));
      refreshTable();
    },
    (t) => getRemainingCount(tileKey(t)) > 0,
  );
}

function renderHandEditor() {
  const box = $("handEditor");
  box.innerHTML = "";
  for (let i = 0; i < state.hand.length; i++) {
    const t = state.hand[i];
    const span = document.createElement("span");
    span.className = `tile ${t.suit} removable`;
    span.textContent = tileText(t);
    span.title = "点击移除";
    span.addEventListener("click", () => {
      const removed = state.hand.splice(i, 1)[0];
      if (removed) decUsed(tileKey(removed), 1);
      renderHandEditor();
      refreshTable();
    });
    box.appendChild(span);
  }
  if (!state.hand.length) {
    const tip = document.createElement("span");
    tip.className = "mono";
    tip.textContent = "尚未录入手牌，点击“添加手牌”";
    box.appendChild(tip);
  }
  const hint = $("handCountHint");
  if (hint) hint.textContent = `目标 ${state.targetHandCount} / 当前 ${state.hand.length}`;
}

function openHandEditor() {
  if (!state.hasGame) {
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "请先创建牌局",
      benefit: "—",
      risk: "—",
      reasons: ["顶部“牌局” → “创建”"],
      missing: ["未创建牌局"],
    });
    return;
  }
  renderHandEditor();
  openModal("modalHand");
}

function openOtherHandHint(seat) {
  setAdvice({
    engine: "规则兜底",
    engineColor: "rgba(255,255,255,0.12)",
    primary: "他家手牌未知（仅展示牌背占位）",
    benefit: "—",
    risk: "—",
    reasons: ["小白助手默认只需要录入他家公共信息：出牌/碰杠/胡/定缺公开", `当前点击：${seatText(seat)}`],
    missing: [],
  });
}

function resetHandAddSelection(revertUsed) {
  if (revertUsed) {
    for (const [k, cnt] of Object.entries(state.handAddCounts)) {
      decUsed(k, cnt);
    }
  }
  state.handAddCounts = {};
  for (const b of document.querySelectorAll("#tileGridHandAdd .tileBtn")) {
    b.classList.remove("selected1", "selected2", "selected3", "selected4");
    b.classList.remove("hasCount");
    const badge = b.querySelector(".countBadge");
    if (badge) badge.textContent = "";
  }
  const remaining = Math.max(0, state.targetHandCount - state.hand.length);
  const hint = $("handAddHint");
  if (hint) hint.textContent = `可添加：${remaining}`;
  const max = $("handAddMax");
  if (max) max.textContent = String(remaining);
}

function openActions(seat) {
  if (!state.hasGame) {
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "请先创建牌局",
      benefit: "—",
      risk: "—",
      reasons: ["顶部“牌局” → “创建”"],
      missing: ["未创建牌局"],
    });
    return;
  }
  state.actionSeat = seat;
  state.actionType = null;
  state.actionTile = null;
  $("actionTilePreview").textContent = "—";
  hide($("actionForm"));
  hide($("rowKongType"));
  hide($("rowHuType"));
  hide($("rowFan"));
  hide($("rowFromSeat"));
  $("actionTitle").textContent = `${seat === "p0" ? "我" : seat === "p1" ? "下家" : seat === "p2" ? "对家" : "上家"}：碰/杠/胡`;
  openModal("modalActions");
}

function startAction(type) {
  state.actionType = type;
  state.actionTile = null;
  $("actionTilePreview").textContent = "—";
  show($("actionForm"));
  hide($("rowDingque"));
  show($("rowActionTile"));
  if (type === "pong") {
    hide($("rowKongType"));
    hide($("rowHuType"));
    hide($("rowFan"));
    show($("rowFromSeat"));
  }
  if (type === "kong") {
    show($("rowKongType"));
    hide($("rowHuType"));
    hide($("rowFan"));
    show($("rowFromSeat"));
  }
  if (type === "hu") {
    hide($("rowKongType"));
    show($("rowHuType"));
    show($("rowFan"));
    show($("rowFromSeat"));
  }
  if (type === "dingque") {
    show($("rowDingque"));
    hide($("rowActionTile"));
    hide($("rowKongType"));
    hide($("rowHuType"));
    hide($("rowFan"));
    hide($("rowFromSeat"));
  }
  if (type === "pass") {
    hide($("actionForm"));
    closeModal("modalActions");
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "机会节点：建议过",
      benefit: 0.4,
      risk: 0.2,
      reasons: ["信息不足时，先不暴露意图", "等待更明确的进张机会"],
      missing: [],
    });
  }
  updateActionDependentRows();
}

function updateActionDependentRows() {
  const type = state.actionType;
  if (!type) return;
  if (type === "kong") {
    const kongType = $("kongType")?.value;
    if (kongType === "minggang") show($("rowFromSeat"));
    else hide($("rowFromSeat"));
  }
  if (type === "hu") {
    const huType = $("huType")?.value;
    if (huType === "zimo" || huType === "gangshanghua") hide($("rowFromSeat"));
    else show($("rowFromSeat"));
  }
}

function removeOneDiscard(fromSeat, tile) {
  const idx = state.discards[fromSeat].findIndex((x) => x.suit === tile.suit && x.rank === tile.rank);
  if (idx < 0) return false;
  state.discards[fromSeat].splice(idx, 1);
  return true;
}

function commitAction() {
  const seat = state.actionSeat;
  const type = state.actionType;
  const tile = state.actionTile;
  if (!seat || !type) return;
  if (type !== "dingque" && type !== "pass" && !tile) return;
  if (type === "dingque") {
    state.dingque[seat] = $("dingqueSuit").value || "";
    refreshTable();
    closeModal("modalActions");
    return;
  }
  if (type === "pong") {
    const from = $("fromSeat").value;
    const ok = removeOneDiscard(from, tile);
    if (!ok) {
      setAdvice({
        engine: "规则兜底",
        engineColor: "rgba(255,255,255,0.12)",
        primary: "无法碰：来源玩家出牌区未找到该牌",
        benefit: "—",
        risk: "—",
        reasons: ["先给来源玩家补一张对应出牌，再执行碰", `来源：${seatText(from)}`, `目标：${tileText(tile)}`],
        missing: [],
      });
      return;
    }
    if (seat === "p0") {
      const need = 2;
      if (countInHand(tile) < need) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法碰：我方手牌不足以组成碰",
          benefit: "—",
          risk: "—",
          reasons: [`需要手里至少有 ${need} 张 ${tileText(tile)}`],
          missing: [],
        });
        return;
      }
      for (let i = 0; i < need; i++) {
        const idx = state.hand.findIndex((x) => x.suit === tile.suit && x.rank === tile.rank);
        state.hand.splice(idx, 1);
      }
    }
    if (seat !== "p0") {
      const key = tileKey(tile);
      if (getRemainingCount(key) < 2) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法碰：已知牌数量约束不允许",
          benefit: "—",
          risk: "—",
          reasons: ["同一张牌全场最多 4 张", `当前已知数量：${getUsedCount(key)} / 4`],
          missing: [],
        });
        return;
      }
      incUsed(key, 2);
    }
    state.melds[seat].push({ kind: "pong", actorSeat: seat, tile, fromSeat: from });
    setTurn(seat);
  } else if (type === "kong") {
    const from = $("fromSeat").value;
    const kt = $("kongType").value;
    const kongType = kt === "angang" ? "暗杠" : kt === "bugang" ? "补杠" : "明杠";
    if (kongType === "暗杠") {
      const key = tileKey(tile);
      if (seat !== "p0" && getRemainingCount(key) < 4) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法暗杠：已知牌数量约束不允许",
          benefit: "—",
          risk: "—",
          reasons: ["暗杠需要同一张牌凑齐 4 张", `当前已知数量：${getUsedCount(key)} / 4`],
          missing: [],
        });
        return;
      }
      if (seat === "p0" && countInHand(tile) < 4) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法暗杠：我方手牌不足以暗杠",
          benefit: "—",
          risk: "—",
          reasons: [`需要手里至少有 4 张 ${tileText(tile)}`],
          missing: [],
        });
        return;
      }
      if (seat === "p0") {
        for (let i = 0; i < 4; i++) {
          const idx = state.hand.findIndex((x) => x.suit === tile.suit && x.rank === tile.rank);
          state.hand.splice(idx, 1);
        }
      }
      if (seat !== "p0") incUsed(key, 4);
      state.melds[seat].push({ kind: "kong", actorSeat: seat, tile, kongType: "暗杠" });
      setTurn(seat);
    } else if (kongType === "补杠") {
      const hasPong = state.melds[seat].some((m) => typeof m !== "string" && m.kind === "pong" && m.tile.suit === tile.suit && m.tile.rank === tile.rank);
      if (!hasPong) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法补杠：没有对应的碰",
          benefit: "—",
          risk: "—",
          reasons: ["补杠必须在已有“碰”的基础上进行"],
          missing: [],
        });
        return;
      }
      const key = tileKey(tile);
      if (seat !== "p0" && getRemainingCount(key) < 1) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法补杠：已知牌数量约束不允许",
          benefit: "—",
          risk: "—",
          reasons: ["同一张牌全场最多 4 张", `当前已知数量：${getUsedCount(key)} / 4`],
          missing: [],
        });
        return;
      }
      if (seat === "p0" && countInHand(tile) < 1) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法补杠：我方手牌不足",
          benefit: "—",
          risk: "—",
          reasons: [`需要手里至少有 1 张 ${tileText(tile)}`],
          missing: [],
        });
        return;
      }
      if (seat === "p0") {
        const idx = state.hand.findIndex((x) => x.suit === tile.suit && x.rank === tile.rank);
        state.hand.splice(idx, 1);
      }
      if (seat !== "p0") incUsed(key, 1);
      state.melds[seat].push({ kind: "kong", actorSeat: seat, tile, kongType: "补杠" });
      setTurn(seat);
    } else {
      const ok = removeOneDiscard(from, tile);
      if (!ok) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法明杠：来源玩家出牌区未找到该牌",
          benefit: "—",
          risk: "—",
          reasons: ["先给来源玩家补一张对应出牌，再执行明杠", `来源：${seatText(from)}`, `目标：${tileText(tile)}`],
          missing: [],
        });
        return;
      }
      const key = tileKey(tile);
      if (seat !== "p0" && getRemainingCount(key) < 3) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法明杠：已知牌数量约束不允许",
          benefit: "—",
          risk: "—",
          reasons: ["明杠需要额外凑齐 3 张同牌", `当前已知数量：${getUsedCount(key)} / 4`],
          missing: [],
        });
        return;
      }
      if (seat === "p0" && countInHand(tile) < 3) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法明杠：我方手牌不足以明杠",
          benefit: "—",
          risk: "—",
          reasons: [`需要手里至少有 3 张 ${tileText(tile)}`],
          missing: [],
        });
        return;
      }
      if (seat === "p0") {
        for (let i = 0; i < 3; i++) {
          const idx = state.hand.findIndex((x) => x.suit === tile.suit && x.rank === tile.rank);
          state.hand.splice(idx, 1);
        }
      }
      if (seat !== "p0") incUsed(key, 3);
      state.melds[seat].push({ kind: "kong", actorSeat: seat, tile, kongType: "明杠", fromSeat: from });
      setTurn(seat);
    }
  } else if (type === "hu") {
    const ht = $("huType").value;
    const from = ht === "zimo" || ht === "gangshanghua" ? seat : $("fromSeat").value;
    const fan = $("fan").value || "0";
    const label =
      ht === "zimo"
        ? "自摸"
        : ht === "gangshanghua"
          ? "杠上花"
          : ht === "gangshangpao"
            ? "杠上炮"
            : ht === "qiangganghu"
              ? "抢杠胡"
              : "点炮";
    if (from !== seat) {
      const ok = removeOneDiscard(from, tile);
      if (!ok) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法胡：来源玩家出牌区未找到该牌",
          benefit: "—",
          risk: "—",
          reasons: ["先给来源玩家补一张对应出牌，再执行点炮胡/抢杠胡", `来源：${seatText(from)}`, `目标：${tileText(tile)}`],
          missing: [],
        });
        return;
      }
    } else {
      const key = tileKey(tile);
      if (getRemainingCount(key) < 1) {
        setAdvice({
          engine: "规则兜底",
          engineColor: "rgba(255,255,255,0.12)",
          primary: "无法胡：已知牌数量约束不允许",
          benefit: "—",
          risk: "—",
          reasons: ["同一张牌全场最多 4 张", `当前已知数量：${getUsedCount(key)} / 4`],
          missing: [],
        });
        return;
      }
      incUsed(key, 1);
    }
    state.melds[seat].push({ kind: "hu", actorSeat: seat, tile, fromSeat: from, label, fan });
    setTurn(seat);
  }
  refreshTable();
  closeModal("modalActions");
}

function init() {
  hide($("gameMenu"));
  resetGame();

  $("btnGame").addEventListener("click", () => {
    const menu = $("gameMenu");
    if (menu.classList.contains("hidden")) show(menu);
    else hide(menu);
  });

  $("menuCreate").addEventListener("click", () => {
    resetGame();
    hide($("gameMenu"));
  });

  $("menuDestroy").addEventListener("click", () => {
    state.hasGame = false;
    state.mode = "empty";
    state.discards = { p0: [], p1: [], p2: [], p3: [] };
    state.melds = { p0: [], p1: [], p2: [], p3: [] };
    state.hand = [];
    state.handCounts = { p1: 13, p2: 13, p3: 13 };
    state.bankerSeat = "p0";
    state.dingque = { p0: "", p1: "", p2: "", p3: "" };
    state.usedCounts = {};
    state.turnSeat = "p0";
    state.panX = 0;
    state.panY = 0;
    refreshTable();
    setGameStatus("未创建牌局");
    setEmptyOverlay(true);
    setAdvice(null);
    hide($("gameMenu"));
  });

  $("menuRefresh").addEventListener("click", () => {
    hide($("gameMenu"));
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "已刷新（原型不连后端）",
      benefit: "—",
      risk: "—",
      reasons: ["正式版会拉取 /state 与 /events 并刷新牌桌"],
      missing: [],
    });
  });

  $("btnAnalyze").addEventListener("click", analyze);
  $("btnStart").addEventListener("click", () => openModal("modalStart"));
  $("startFull").addEventListener("click", () => {
    state.mode = "full";
    setEmptyOverlay(false);
    closeModal("modalStart");
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "全量输入模式（原型）",
      benefit: "—",
      risk: "—",
      reasons: ["点击我方“手牌区”录入手牌（仅 p0）", "点击牌桌中间可设置庄家", "他家默认只录公共信息（出牌/碰杠/胡/定缺公开）"],
      missing: [],
    });
  });
  $("startStep").addEventListener("click", () => {
    state.mode = "step";
    setEmptyOverlay(false);
    closeModal("modalStart");
    setAdvice({
      engine: "规则兜底",
      engineColor: "rgba(255,255,255,0.12)",
      primary: "依次输入模式（原型）",
      benefit: "—",
      risk: "—",
      reasons: ["点击任意玩家的“出牌区”追加出牌", "点击头像追加碰/杠/胡"],
      missing: [],
    });
  });

  $("tableEmptyOverlay").addEventListener("click", () => {
    if (!state.hasGame) {
      setAdvice({
        engine: "规则兜底",
        engineColor: "rgba(255,255,255,0.12)",
        primary: "请先创建牌局",
        benefit: "—",
        risk: "—",
        reasons: ["顶部“牌局” → “创建”"],
        missing: ["未创建牌局"],
      });
      return;
    }
    openModal("modalStart");
  });

  $("modalMask").addEventListener("click", () => {
    resetHandAddSelection(true);
    for (const el of document.querySelectorAll(".modal")) hide(el);
    hide($("modalMask"));
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const closeId = t.getAttribute("data-close");
    if (closeId) {
      if (closeId === "modalHandAdd") resetHandAddSelection(true);
      closeModal(closeId);
    }
  });

  for (const river of document.querySelectorAll(".river")) {
    river.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const seat = el.getAttribute("data-seat");
      if (!seat) return;
      onClickRiver(seat);
    });
  }

  for (const edge of document.querySelectorAll(".edgeRiver")) {
    edge.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const seat = el.getAttribute("data-seat");
      if (!seat) return;
      if (seat === "p0") onClickRiver(seat);
      else onClickEdgeRiver(seat);
    });
  }

  for (const avatar of document.querySelectorAll(".avatarBtn")) {
    avatar.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const seat = el.getAttribute("data-seat");
      if (!seat) return;
      openActions(seat);
    });
  }

  for (const hand of document.querySelectorAll(".hand")) {
    hand.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const seat = el.getAttribute("data-seat");
      if (!seat) return;
      if (seat === "p0") openHandEditor();
      else openOtherHandHint(seat);
    });
  }

  $("btnHandAdd").addEventListener("click", () => {
    const remaining = Math.max(0, state.targetHandCount - state.hand.length);
    const maxAdd = remaining;
    state.handAddCounts = {};
    const hint = $("handAddHint");
    if (hint) hint.textContent = `可添加：${maxAdd}`;
    const max = $("handAddMax");
    if (max) max.textContent = String(maxAdd);
    const grid = $("tileGridHandAdd");
    grid.innerHTML = "";
    for (const s of SUITS) {
      for (let r = 1; r <= 9; r++) {
        const key = `${r}${s.suit}`;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tileBtn";
        btn.textContent = `${r}${s.name}`;
        btn.dataset.key = key;
        const badge = document.createElement("span");
        badge.className = "countBadge";
        btn.appendChild(badge);
        const ok = getRemainingCount(key) > 0 && maxAdd > 0;
        btn.disabled = !ok;
        btn.style.opacity = ok ? "1" : "0.35";
        btn.addEventListener("click", () => {
          const totalSelected = Object.values(state.handAddCounts).reduce((a, b) => a + b, 0);
          const cur = state.handAddCounts[key] || 0;
          if (cur >= 4) return;
          if (totalSelected >= maxAdd) return;
          if (getRemainingCount(key) <= 0) return;
          state.handAddCounts[key] = cur + 1;
          incUsed(key, 1);
          btn.classList.remove("selected1", "selected2", "selected3", "selected4");
          btn.classList.add(`selected${state.handAddCounts[key]}`);
          btn.classList.add("hasCount");
          badge.textContent = String(state.handAddCounts[key]);
          if (hint) hint.textContent = `可添加：${maxAdd - (totalSelected + 1)}（已选 ${totalSelected + 1}）`;
          for (const b of document.querySelectorAll("#tileGridHandAdd .tileBtn")) {
            const k = b.dataset.key;
            if (!k) continue;
            const enabled = getRemainingCount(k) > 0 && Object.values(state.handAddCounts).reduce((a, c) => a + c, 0) < maxAdd;
            b.disabled = !enabled;
            b.style.opacity = enabled ? "1" : "0.35";
          }
        });
        grid.appendChild(btn);
      }
    }
    openModal("modalHandAdd");
  });

  $("btnHandAddClear").addEventListener("click", () => {
    resetHandAddSelection(true);
  });

  $("btnHandAddConfirm").addEventListener("click", () => {
    const remaining = Math.max(0, state.targetHandCount - state.hand.length);
    const maxAdd = remaining;
    const totalSelected = Object.values(state.handAddCounts).reduce((a, b) => a + b, 0);
    const toAdd = Math.min(maxAdd, totalSelected);
    if (!toAdd) {
      resetHandAddSelection(true);
      closeModal("modalHandAdd");
      return;
    }
    let added = 0;
    for (const [key, cnt] of Object.entries(state.handAddCounts)) {
      const rank = Number(key.slice(0, 1));
      const suit = key.slice(1);
      for (let i = 0; i < cnt && added < toAdd; i++) {
        state.hand.push({ rank, suit });
        added++;
      }
      if (added >= toAdd) break;
    }
    resetHandAddSelection(false);
    closeModal("modalHandAdd");
    renderHandEditor();
    refreshTable();
  });

  $("btnHandClear").addEventListener("click", () => {
    for (const t of state.hand) decUsed(tileKey(t), 1);
    state.hand = [];
    renderHandEditor();
    refreshTable();
  });

  $("btnHandClose").addEventListener("click", () => closeModal("modalHand"));

  $("centerPanel").addEventListener("click", () => {
    if (!state.hasGame) {
      setAdvice({
        engine: "规则兜底",
        engineColor: "rgba(255,255,255,0.12)",
        primary: "请先创建牌局",
        benefit: "—",
        risk: "—",
        reasons: ["顶部“牌局” → “创建”"],
        missing: ["未创建牌局"],
      });
      return;
    }
    $("bankerSeat").value = state.bankerSeat;
    openModal("modalCenter");
  });

  $("btnCenterSave").addEventListener("click", () => {
    state.bankerSeat = $("bankerSeat").value;
    closeModal("modalCenter");
    refreshTable();
  });

  for (const btn of document.querySelectorAll('#modalActions [data-action]')) {
    btn.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const type = el.getAttribute("data-action");
      if (!type) return;
      startAction(type);
    });
  }

  $("btnActionTile").addEventListener("click", () => {
    if (!state.actionType) return;
    const actionType = state.actionType;
    const actor = state.actionSeat;
    const from = $("fromSeat")?.value;
    const kongType = $("kongType")?.value;
    const huType = $("huType")?.value;

    const isEnabled = (t) => {
      const key = tileKey(t);
      if (actionType === "pong") {
        if (!from || from === actor) return false;
        const hasDiscard = state.discards[from].some((x) => x.suit === t.suit && x.rank === t.rank);
        if (!hasDiscard) return false;
        if (actor === "p0") return countInHand(t) >= 2;
        return getRemainingCount(key) >= 2;
      }
      if (actionType === "kong") {
        if (!kongType) return false;
        if (kongType === "angang") {
          if (actor === "p0") return countInHand(t) >= 4;
          return getRemainingCount(key) >= 4;
        }
        if (kongType === "bugang") {
          const hasPong = state.melds[actor].some((m) => typeof m !== "string" && m.kind === "pong" && m.tile.suit === t.suit && m.tile.rank === t.rank);
          if (!hasPong) return false;
          if (actor === "p0") return countInHand(t) >= 1;
          return getRemainingCount(key) >= 1;
        }
        if (!from || from === actor) return false;
        const hasDiscard = state.discards[from].some((x) => x.suit === t.suit && x.rank === t.rank);
        if (!hasDiscard) return false;
        if (actor === "p0") return countInHand(t) >= 3;
        return getRemainingCount(key) >= 3;
      }
      if (actionType === "hu") {
        if (huType === "zimo" || huType === "gangshanghua") return getRemainingCount(key) >= 1;
        if (!from || from === actor) return getRemainingCount(key) >= 1;
        return state.discards[from].some((x) => x.suit === t.suit && x.rank === t.rank);
      }
      return true;
    };

    openTilePicker("选择目标牌", (t) => {
      state.actionTile = t;
      $("actionTilePreview").textContent = tileText(t);
    }, isEnabled);
  });

  $("btnCommitAction").addEventListener("click", commitAction);

  $("kongType").addEventListener("change", updateActionDependentRows);
  $("huType").addEventListener("change", updateActionDependentRows);

  const wrap = document.querySelector(".tableWrap");
  if (wrap) {
    const stage = document.querySelector(".tableStage");
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let activated = false;
    let justDragged = false;

    const applyPan = () => {
      if (!stage) return;
      stage.style.setProperty("--panX", `${state.panX}px`);
      stage.style.setProperty("--panY", `${state.panY}px`);
    };

    const clampPan = (x, y) => {
      const stageW = stage ? stage.clientWidth : 980;
      const stageH = stage ? stage.clientHeight : 980;
      const wrapW = wrap.clientWidth;
      const wrapH = wrap.clientHeight;
      const maxX = Math.max(0, (stageW - wrapW) / 2);
      const maxY = Math.max(0, (stageH - wrapH) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    };

    const clampAndApply = () => {
      if (stage) {
        const size = Math.max(420, Math.min(980, wrap.clientWidth - 20, wrap.clientHeight - 20));
        stage.style.setProperty("--stageSize", `${size}px`);
      }
      const p = clampPan(state.panX, state.panY);
      state.panX = p.x;
      state.panY = p.y;
      applyPan();
    };

    clampAndApply();
    window.addEventListener("resize", clampAndApply);

    const isInteractiveTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      return !!target.closest(
        "button, .hand, .edgeRiver, .tile, .tileBtn, .avatarBtn, .menu, .menuItem, .modal, .modalMask, .select, .input",
      );
    };

    wrap.addEventListener(
      "pointerdown",
      (ev) => {
      if (ev.button !== 0) return;
      if (isInteractiveTarget(ev.target)) return;
      dragging = true;
      activated = false;
      justDragged = false;
      startX = ev.clientX;
      startY = ev.clientY;
      startPanX = state.panX;
      startPanY = state.panY;
      wrap.classList.add("isPanning");
      wrap.setPointerCapture(ev.pointerId);
      },
      true,
    );

    wrap.addEventListener("pointermove", (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!activated && Math.hypot(dx, dy) > 6) activated = true;
      if (!activated) return;
      ev.preventDefault();
      ev.stopPropagation();
      const p = clampPan(startPanX + dx, startPanY + dy);
      state.panX = p.x;
      state.panY = p.y;
      applyPan();
    });

    const end = (ev) => {
      if (!dragging) return;
      if (activated) {
        justDragged = true;
        setTimeout(() => {
          justDragged = false;
        }, 200);
      }
      dragging = false;
      activated = false;
      wrap.classList.remove("isPanning");
      try {
        wrap.releasePointerCapture(ev.pointerId);
      } catch {}
    };
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);

    wrap.addEventListener(
      "click",
      (ev) => {
        if (!justDragged) return;
        ev.preventDefault();
        ev.stopPropagation();
      },
      true,
    );
  }
}

init();

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(mode) {
  const isDark = mode === 'dark' || (mode === 'auto' && getSystemTheme() === 'dark');
  document.body.classList.toggle('dark', isDark);
  updateThemeIcon();
}
function loadTheme() {
  const saved = localStorage.getItem('fund_monitor_theme');
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
  } else {
    localStorage.setItem('fund_monitor_theme', 'auto');
    applyTheme('auto');
  }
}
function toggleTheme() {
  document.body.classList.add('no-theme-transition');
  const current = localStorage.getItem('fund_monitor_theme') || 'auto';
  // 循环：auto -> dark -> light -> auto
  let next;
  if (current === 'auto') next = 'dark';
  else if (current === 'dark') next = 'light';
  else next = 'auto';
  localStorage.setItem('fund_monitor_theme', next);
  applyTheme(next);
  // 显示提示
  const modeText = next === 'auto' ? '自动' : (next === 'dark' ? '深色' : '浅色');
  showToast(`已切换至${modeText}模式`);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.remove('no-theme-transition');
    // 重绘弹窗内折线图适配深色/浅色
    const c = document.querySelector('#fundDetailModal .trend-chart');
    if(c && c._history){
      const code = c.dataset.code;
      const fund = funds.find(f => f.code === code);
      const costNav = _costNav(fund);
      c._chart = createTrendChart(c, c._history, parseInt(c.dataset.period) || 30, costNav);
    }
  }));
}
function updateThemeIcon() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const mode = localStorage.getItem('fund_monitor_theme') || 'auto';
  if (mode === 'auto') {
    btn.innerHTML = '<span class="theme-text">Auto</span>';
    btn.title = '自动模式（点击切换）';
  } else if (document.body.classList.contains('dark')) {
    btn.innerHTML = '<svg class="图标" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    btn.title = '深色模式（点击切换）';
  } else {
    btn.innerHTML = '<svg class="图标" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    btn.title = '浅色模式（点击切换）';
  }
}
if (window.matchMedia) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', () => {
    const saved = localStorage.getItem('fund_monitor_theme');
    if (!saved || saved === 'auto') {
      applyTheme('auto');
    }
  });
}
loadTheme();
// ============ 金额隐藏 ============
let hideMarketVal = false;
const ICON_EYE_SHOW = '<svg class="图标" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_HIDE = '<svg class="图标" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
const ICON_GEAR = '<svg class="图标" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>';
function loadHideMarketVal() { hideMarketVal = localStorage.getItem('fund_monitor_hide_mv') === '1'; const btn = document.getElementById('hideMvBtn'); if (btn) btn.innerHTML = hideMarketVal ? ICON_EYE_HIDE : ICON_EYE_SHOW; }
function toggleHideMarketVal() { hideMarketVal = !hideMarketVal; localStorage.setItem('fund_monitor_hide_mv', hideMarketVal ? '1' : '0'); const btn = document.getElementById('hideMvBtn'); if (btn) btn.innerHTML = hideMarketVal ? ICON_EYE_HIDE : ICON_EYE_SHOW; renderFunds(); }
loadHideMarketVal();
// ============ 固定4列网格 ============
const GRID_COLS = '165px 105px 105px 105px';
// 共享拖拽排序
function _initDragSort(container, rowSel, dataAttr, onReorder) {
  // 移除上次拖拽残留的监听器，防止叠加
  if (container._dragCleanup) container._dragCleanup();
  let dragIdx = -1, dragOverRow = null, _allRows = null;
  const prevent = e => e.preventDefault();
  const getRowAt = y => {
    for (const r of _allRows) { const rc = r.getBoundingClientRect(); if (y >= rc.top && y <= rc.bottom) return r; }
    return null;
  };
  const cleanup = () => {
    if (_allRows) _allRows.forEach(r => r.classList.remove('dragging', 'drag-over'));
    dragIdx = -1; dragOverRow = null; _allRows = null;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointerleave', cleanup);
    container.removeEventListener('selectstart', prevent);
  };
  const onMove = e => {
    if (dragIdx === -1) return;
    e.preventDefault();
    const over = getRowAt(e.clientY);
    if (over && parseInt(over.dataset[dataAttr]) !== dragIdx && over !== dragOverRow) {
      if (dragOverRow) dragOverRow.classList.remove('drag-over');
      over.classList.add('drag-over'); dragOverRow = over;
    }
  };
  const onUp = () => {
    if (dragOverRow && dragIdx !== -1) {
      const tgt = parseInt(dragOverRow.dataset[dataAttr]);
      if (tgt !== dragIdx) onReorder(dragIdx, tgt);
    }
    cleanup();
  };
  const onDown = e => {
    const row = e.target.closest(rowSel);
    if (!row) return;
    dragIdx = parseInt(row.dataset[dataAttr]);
    _allRows = Array.from(container.querySelectorAll(rowSel));
    row.classList.add('dragging');
    container.addEventListener('selectstart', prevent);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointerleave', cleanup);
  };
  container.addEventListener('pointerdown', onDown);
  container._dragCleanup = () => { cleanup(); container.removeEventListener('pointerdown', onDown); };
}
// ============ 数据 ============
let funds = [];
let expandedCode = null;
let autoRefreshTimer = null;
let isAutoRefresh = localStorage.getItem('fund_monitor_auto_refresh') !== 'false';
let sortField = 'amount';
let sortDir = -1;
let confirmCallback = null;
// ============ 交易日历 ============
let _holidayCache = null;
const HOLIDAY_CACHE_KEY = 'fund_monitor_holidays';
const HOLIDAY_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
// ============ 分组 ============
let groups = ['默认'];
let activeGroup = '默认';
const GROUP_STORAGE_KEY = 'fund_monitor_groups';
const ACTIVE_GROUP_KEY = 'fund_monitor_active_group';
function loadGroups() {
  try {
    const g = localStorage.getItem(GROUP_STORAGE_KEY);
    if (g) { var parsed = JSON.parse(g); if (Array.isArray(parsed)) groups = parsed; }
    const a = localStorage.getItem(ACTIVE_GROUP_KEY);
    if (a) activeGroup = a;
  } catch(e) { console.warn('读取分组失败:', e); }
}
function saveGroups() { safeSet(GROUP_STORAGE_KEY, groups); }
function saveActiveGroup() { try { localStorage.setItem(ACTIVE_GROUP_KEY, activeGroup); } catch(e) { console.warn('保存当前分组失败:', e); } }
function getGroupFunds() {
  if(!Array.isArray(funds)) funds=[];
  if (activeGroup === groups[0]) return funds.filter(f => !f.group || f.group === groups[0]);
  return funds.filter(f => f.group === activeGroup);
}
function setFundGroup(code, groupName) {
  const f = funds.find(x => x.code === code);
  if (!f) return;
  f.group = groupName;
  saveFunds(); renderFunds();
  showToast(`已移动到「${groupName}」`, 'success');
}
let isGroupSummaryView = false;
function renderGroupTabs() {
  const bar = document.getElementById('groupBar');
  const container = document.getElementById('groupTabs');
  if (!groups.length) { bar.classList.add('hidden'); container.innerHTML = ''; return; }
  bar.classList.remove('hidden');
  bar.classList.add('group-bar-inline');
  let html = '';
  const summaryActive = isGroupSummaryView ? 'active' : '';
  html += `<div class="一类 ${summaryActive}" onclick="switchToGroupSummary()">账户汇总</div>`;
  groups.forEach(g => {
    const active = !isGroupSummaryView && g === activeGroup ? 'active' : '';
    const count = g === groups[0] ? funds.filter(f => !f.group || f.group === groups[0]).length : funds.filter(f => f.group === g).length;
    const escapedG = g.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/</g,'&lt;');
    html += `<div class="一类 ${active}" onclick="switchGroup('${escapedG}')">${escapeHtml(g)} (${count})</div>`;
  });
  container.innerHTML = html;
}

function switchGroup(name) {
  isGroupSummaryView = false;
  activeGroup = name; saveActiveGroup();
  renderFunds();
}
function switchToGroupSummary() {
  isGroupSummaryView = true;
  renderGroupTabs();
  renderGroupSummary();
}
function calcGroupSummary(g) {
  const gFunds = g === groups[0] ? funds.filter(f => !f.group || f.group === groups[0]) : funds.filter(f => f.group === g);
  if (!gFunds.length) return null;
  let sumLocked = 0, sumPToday = 0, sumPTotal = 0, sumCost = 0, upCount = 0, downCount = 0, allUpdated = true;
  gFunds.forEach(fund => {
    const isMarketOpen = isMarketOpenNow(fund);
    if (isMarketOpen) allUpdated = false;
    const todayP = calcTodayProfit(fund, isMarketOpen);
    const lockedProfit = calcLockedProfit(fund, isMarketOpen);
    const lockedMarketVal = (fund.amount || 0) + lockedProfit;
    const amt = fund.amount || 0;
    sumLocked += lockedMarketVal;
    sumPToday += todayP;
    sumPTotal += lockedProfit;
    sumCost += amt;
    const gszzl = parseFloat(fund.gszzl) || 0;
    if (isMarketOpen) {
      if (gszzl > 0) upCount++;
      else if (gszzl < 0) downCount++;
    } else {
      if (todayP > 0) upCount++;
      else if (todayP < 0) downCount++;
    }
  });
  const r = sumCost > 0 ? sumPTotal / sumCost * 100 : 0;
  return { gFunds, sumLocked, sumPToday, sumPTotal, sumCost, r, upCount, downCount, allUpdated };
}

function renderGroupSummary() {
  const fundList = document.getElementById('fundList');
  const groupSummaryView = document.getElementById('groupSummaryView');
  const fundListArea = document.getElementById('fundListArea');
  const emptyHint = document.getElementById('emptyHint');
  if(!Array.isArray(funds)){ funds=[]; saveFunds(true); }
  if(!funds.length){
    fundList.style.display='none';
    groupSummaryView.style.display='none';
    fundListArea.style.display='none';
    emptyHint.style.display='block';
    return;
  }
  fundListArea.style.display='';
  emptyHint.style.display='none';
  fundList.style.display='none';
  groupSummaryView.style.display='block';

  // 计算全局汇总（所有分组）
  let globalLocked = 0, globalPToday = 0, globalPTotal = 0, globalCost = 0, globalAllUpdated = true;
  groups.forEach(g => {
    const s = calcGroupSummary(g);
    if (!s) return;
    globalLocked += s.sumLocked;
    globalPToday += s.sumPToday;
    globalPTotal += s.sumPTotal;
    globalCost += s.sumCost;
    if (!s.allUpdated) globalAllUpdated = false;
  });
  const gCc1 = globalPToday > 0 ? 'up' : globalPToday < 0 ? 'down' : '';
  const todayRateVal = globalLocked > 0 ? (globalPToday / globalLocked * 100) : 0;
  const gCc1Rate = todayRateVal > 0 ? 'up' : todayRateVal < 0 ? 'down' : '';
  const sumUpdatedTag = globalAllUpdated ? `<span class="updated-tag">已更新</span>` : '';

  // 全局汇总行
  let html = `<div class="基金-数据行 汇总-行" style="grid-template-columns:${GRID_COLS}">
    <div class="基金-数据格"><div class="基金-名称">
      <div class="汇总-资产标签">账户资产 <span class="汇总-眼睛" onclick="toggleHideMarketVal()">${hideMarketVal ? ICON_EYE_HIDE : ICON_EYE_SHOW}</span></div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:2px;"><div class="汇总-资产数值 flat">${hideMarketVal ? '****' : formatMoney(globalLocked)}</div></div>
    </div></div>
    <div class="基金-数据格"></div>
    <div class="基金-数据格" style="grid-column:3/5;"><div class="基金-今日" style="text-align:right;">
      <div class="汇总-资产标签" style="justify-content:flex-end;gap:6px;">${sumUpdatedTag}<span style="color:var(--三类字体颜色);">当日收益</span></div>
      <div style="display:flex;align-items:baseline;gap:6px;justify-content:flex-end;">
        <span class="汇总-今日比率 ${gCc1Rate}">${todayRateVal>=0?'+':'-'}${Math.abs(todayRateVal).toFixed(2)}%</span>
        <span class="汇总-今日数值 ${gCc1}" style="margin-left:10px;">${globalPToday>=0?'+':'-'}${formatMoney(Math.abs(globalPToday))}</span>
      </div>
    </div></div>
  </div>`;
  // 渲染分组卡片
  html += '<div class="group-summary-cards">';
  groups.forEach(g => {
    const s = calcGroupSummary(g);
    if (!s) return;
    const cc1 = s.sumPToday > 0 ? 'up' : s.sumPToday < 0 ? 'down' : '';
    const cc2 = s.sumPTotal > 0 ? 'up' : s.sumPTotal < 0 ? 'down' : '';
    const cc3 = s.r > 0 ? 'up' : s.r < 0 ? 'down' : '';
    const gRate = s.sumLocked > 0 ? (s.sumPToday / s.sumLocked * 100) : 0;
    const gRateCc = gRate > 0 ? 'up' : gRate < 0 ? 'down' : '';
    const safeG = g.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/</g,'&lt;');
    html += `<div class="group-summary-card" data-group="${escapeHtml(g)}" onclick="switchGroup('${safeG}')">`;
    html += `<div class="gsc-header">`;
    html += `<div class="gsc-name">${escapeHtml(g)}（${s.gFunds.length}只）</div>`;
    html += `<div class="gsc-trend">`;
    html += `<span class="gsc-trend-up">${s.upCount}↑</span>`;
    html += `<span class="gsc-trend-down">${s.downCount}↓</span>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="gsc-main">`;
    html += `<div class="gsc-asset-section">`;
    html += `<div class="gsc-asset-label">账户资产</div>`;
    html += `<div class="gsc-asset-value">${hideMarketVal ? '****' : formatMoney(s.sumLocked)}</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="gsc-bottom">`;
    html += `<div class="gsc-bottom-left">`;
    html += `<div class="gsc-bottom-label">持有收益</div>`;
    html += `<div class="gsc-bottom-val ${cc2}">${s.sumPTotal>=0?'+':'-'}${formatMoney(Math.abs(s.sumPTotal))} <span class="gsc-bottom-rate ${cc3}">${s.r>=0?'+':''}${s.r.toFixed(2)}%</span></div>`;
    html += `</div>`;
    html += `<div class="gsc-today-section">`;
    html += `<div class="gsc-today-label">当日收益</div>`;
    html += `<div class="gsc-today-value ${cc1}"><span class="gsc-today-rate-inline ${gRateCc}">${gRate>=0?'+':'-'}${Math.abs(gRate).toFixed(2)}%</span> ${s.sumPToday>=0?'+':'-'}${formatMoney(Math.abs(s.sumPToday))}</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
  });
  html += '</div>';
  groupSummaryView.innerHTML = html;
}
function openGroupModal() { renderGroupModal(); _openModal(document.getElementById('groupModal')); }
function closeGroupModal() { _closeModal(document.getElementById('groupModal')); }
function renderGroupModal() {
  const body = document.getElementById('groupModalBody');
  let html = '';
  groups.forEach((g, idx) => {
    const isAll = idx === 0;
    const count = isAll ? funds.filter(f => !f.group || f.group === groups[0]).length : funds.filter(f => f.group === g).length;
    html += `<div class="group-list-item">
      <input type="text" class="group-list-name" value="${safeHtml(g)}" onchange="renameGroup(${idx},this.value)" onclick="event.stopPropagation()">
      <span class="t-12" style="white-space:nowrap;">${count}只</span>
      ${isAll?'<span class="t-12">默认</span>':`<button class="四类" onclick="deleteGroup(this.dataset.name)" data-name="${safeHtml(g)}">删除</button>`}
    </div>`;
  });
  html += `<div class="group-add-row">
    <input type="text" class="页面-输入框 弹性1" id="newGroupName" placeholder="新分组名称" onclick="event.stopPropagation()">
  </div>`;
  body.innerHTML = html;
}
function addGroup() {
  const input = document.getElementById('newGroupName');
  const name = input.value.trim();
  if (!name) { showToast('请输入分组名称', 'warning'); return; }
  if (groups.includes(name)) { showToast('分组已存在', 'warning'); return; }
  groups.push(name); saveGroups(); renderGroupModal(); renderGroupTabs(); input.value = '';
  showToast('分组已添加', 'success');
}
function renameGroup(idx, newName) {
  newName = newName.trim();
  if (!newName) { showToast('名称不能为空', 'warning'); renderGroupModal(); return; }
  if (groups.includes(newName)) { showToast('名称已存在', 'warning'); renderGroupModal(); return; }
  const oldName = groups[idx]; const isAll = idx === 0;
  groups[idx] = newName;
  if (isAll) funds.forEach(f => { if (!f.group || f.group === oldName) f.group = newName; });
  else funds.forEach(f => { if (f.group === oldName) f.group = newName; });
  if (activeGroup === oldName) activeGroup = newName;
  saveGroups(); saveActiveGroup(); saveFunds(); renderGroupModal(); renderGroupTabs(); renderFunds();
  showToast('分组已重命名', 'success');
}
function deleteGroup(name) {
  if (groups.length <= 1) { showToast('至少保留一个分组', 'warning'); return; }
  const allName = groups[0];
  _showDeleteGroupDialog(name, allName);
}
function _showDeleteGroupDialog(name, allName) {
  var _origTitle = document.getElementById('confirmTitle').textContent;
  var _origClose = closeConfirmModal;
  document.getElementById('confirmTitle').textContent = '删除分组';
  document.getElementById('confirmBody').innerHTML =
    `删除分组「${escapeHtml(name)}」？` +
    `<div style="margin-top:8px;color:var(--三类字体大小);color:var(--三类字体颜色);">该分组下 ${funds.filter(function(f){return f.group===name}).length} 只基金</div>`;
  document.getElementById('confirmBtn').style.display = 'none';
  confirmCallback = null;
  function cleanup() {
    document.getElementById('confirmBtn').style.display = '';
    document.getElementById('confirmTitle').textContent = _origTitle;
    closeConfirmModal = _origClose;
  }
  closeConfirmModal = function() { cleanup(); _origClose(); };
  var div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
  var btn1 = document.createElement('button');
  btn1.className = '四类';
  btn1.textContent = '移入「' + allName + '」';
  btn1.onclick = function() { _execDeleteGroup(name, allName, true, cleanup); };
  var btn2 = document.createElement('button');
  btn2.className = '四类';
  btn2.textContent = '删除基金「不移入」';
  btn2.onclick = function() { _execDeleteGroup(name, allName, false, cleanup); };
  div.appendChild(btn1);
  div.appendChild(btn2);
  document.getElementById('confirmBody').appendChild(div);
  _openModal(document.getElementById('confirmModal'));
}
function _execDeleteGroup(name, allName, moveToDefault, cleanup) {
  var deletedCodes = [];
  if (moveToDefault) {
    groups = groups.filter(function(g) { return g !== name; });
    funds.forEach(function(f) { if (f.group === name) f.group = allName; });
  } else {
    groups = groups.filter(function(g) { return g !== name; });
    deletedCodes = funds.filter(function(f) { return f.group === name; }).map(function(f) { return f.code; });
    funds = funds.filter(function(f) { return f.group !== name; });
    // 清理已删除基金当日的每日收益记录
    if (deletedCodes.length > 0) {
      var profits = getDailyProfits();
      var t = todayStr();
      if (profits[t]) {
        var changed = false;
        for (var i = 0; i < deletedCodes.length; i++) {
          if (profits[t][deletedCodes[i]] !== undefined) {
            delete profits[t][deletedCodes[i]];
            changed = true;
          }
        }
        if (changed) setDailyProfits(profits);
      }
    }
  }
  if (activeGroup === name) activeGroup = allName;
  saveGroups(); saveActiveGroup(); saveFunds(); renderGroupModal(); renderGroupTabs(); renderFunds();
  cleanup();
  closeAllModals();
  showToast('分组已删除', 'success');
}
const allIndices = [
  { code:'sh000001', name:'上证指数', tencent:'sh000001', secid:'1.000001' },
  { code:'sz399001', name:'深证成指', tencent:'sz399001', secid:'0.399001' },
  { code:'sz399006', name:'创业板指', tencent:'sz399006', secid:'0.399006' },
  { code:'sh000688', name:'科创50', tencent:'sh000688', secid:'1.000688' },
  { code:'sh000300', name:'沪深300', tencent:'sh000300', secid:'1.000300' },
  { code:'sh000016', name:'上证50', tencent:'sh000016', secid:'1.000016' },
  { code:'sz399905', name:'中证500', tencent:'sz399905', secid:'0.399905' },
  { code:'sh000852', name:'中证1000', tencent:'sh000852', secid:'1.000852' },
  { code:'hkHSI',    name:'恒生指数', tencent:'hkHSI', secid:'hkHSI' },
  { code:'hkHSTECH', name:'恒生科技', tencent:'hkHSTECH', secid:'hkHSTECH' },
  { code:'usIXIC',   name:'纳斯达克', tencent:'usIXIC', secid:'usIXIC' },
  { code:'usDJI',    name:'道琼斯', tencent:'usDJI', secid:'usDJI' },
  { code:'usSPX',    name:'标普500', tencent:'usINX', secid:'usINX' },
];
let selectedIndices = ['sh000001','sz399001','sz399006','sh000688','hkHSTECH','usIXIC'];
let indexDataCache = {};
// ============ 持久化 ============
function loadStorage() {
  try {
    const s1 = localStorage.getItem('fund_monitor_v3');
    if (s1) {
      const parsed = JSON.parse(s1);
      if (!Array.isArray(parsed)) { funds = []; saveFunds(true); return; }
      funds = parsed;
      funds.forEach(f => {
        // 清理瞬态数据（每次启动重新从 API 获取）
        delete f.history;
        delete f._holdings;
        if (f.totalProfit === undefined) f.totalProfit = null;
        if (f.calibrateTime === undefined) f.calibrateTime = null;
        if (f.addDate === undefined) f.addDate = todayStr();
        if (f.purchaseDate === undefined) f.purchaseDate = f.addDate || todayStr();
        if (f.shares === undefined) f.shares = 0;
        if (f._origMarketVal === undefined) {
          if (f.totalProfit !== null && f.totalProfit !== undefined) {
            f._origMarketVal = (f.amount || 0) + f.totalProfit;
          } else { f._origMarketVal = null; }
        }
        if (f.operations === undefined) f.operations = [];
        // 每次加载确保 cost 和 amount 一致
        if (f.shares > 0) {
          if (f.amount > 0) {
            f.cost = f.amount / f.shares;
          } else if (f.cost > 0) {
            f.amount = r2(f.cost * f.shares);
          }
        } else if (!f.cost || f.cost <= 0) {
          f.cost = 0;
        }
        delete f._lastAccumJzrq;
        // 每次打开默认3个月
        f._chartPeriod = 3;
      });
    }
    const s2 = localStorage.getItem('fund_monitor_indices');
    if (s2) { const parsed = JSON.parse(s2); if(parsed.length) selectedIndices = parsed; }
    loadGroups();
  } catch(e){ console.error('加载存储失败:', e); }
}
var _saveFundsTimer = null;
function saveFunds(force=false) {
  if (!force) {
    clearTimeout(_saveFundsTimer);
    _saveFundsTimer = setTimeout(function(){ saveFunds(true); }, 300);
    return;
  }
  try{
    if(!funds.length && !force){ console.warn('保存时资金列表为空，跳过保存'); return; }
    const cleaned = funds.map(f => { const { history, _holdings, ...rest } = f; return rest; });
    safeSet('fund_monitor_v3', cleaned);
  }catch(e){ console.error('保存资金失败:', e); }
}
function saveIndices() {
  safeSet('fund_monitor_indices', selectedIndices);
}
// ============ 更多菜单 ============
function toggleMoreMenu() { document.getElementById('moreDropdown').classList.toggle('active'); }
function closeMoreMenu() { document.getElementById('moreDropdown').classList.remove('active'); }
// ============ 公共工具函数（优化：抽取重复逻辑） ============
function createFundObj(code, amount, profitInput, _origMarketVal, purchaseDate, group, isQDII, _chartPeriod) {
  return {
    code, name:'',
    shares: 0,          // 份额，calcSharesFromPurchaseDate 计算
    cost: 0,            // 成本价，calcSharesFromPurchaseDate 计算
    amount,             // 本金，calcSharesFromPurchaseDate 用于计算份额
    dwjz:'0', gsz:'0', gszzl:'0', gztime:'', jzrq:'',
    totalProfit: profitInput,
    _origMarketVal,
    calibrateTime: null,
    addDate: todayStr(),
    purchaseDate,
    group: group || activeGroup,
    isQDII: !!isQDII,
    _chartPeriod: _chartPeriod || 3,
    operations: []
  };
}
async function calcSharesFromPurchaseDate(fund, purchaseDate, isUpdated) {
  if (!fund) return;
  await fetchFundHistory(fund.code);
  if (!fund.name) await fetchFundData(fund.code);
  fund.isQDII = !!(fund.name||'').toUpperCase().includes('QDII');
  const history = fund.history;
  if (!history || !history.length) return;
  const historyTradeDays = history.map(d => new Date(d.date + 'T00:00:00').getTime()).sort((a,b) => a - b);
  const historyLatest = historyTradeDays[historyTradeDays.length - 1];
  const purchaseTime = new Date(purchaseDate).getTime();
  // 规则一：填的日期不在净值列表里 → 强制按已更新（复选框无效）
  const inHistory = historyTradeDays.includes(purchaseTime);
  const baseOffset = inHistory ? (isUpdated ? 0 : 1) : 0;
  // 规则二：QDII多退一天，但只在填的日期 ≤ 最新净值日时叠加（数据已齐全才需要补偿）
  const qdiiOffset = (fund.isQDII && purchaseTime <= historyLatest) ? 1 : 0;
  let targetTime;
  if (inHistory) {
    let offset = baseOffset + qdiiOffset;
    targetTime = purchaseTime;
    while (offset > 0) {
      const idx = historyTradeDays.indexOf(targetTime);
      if (idx > 0) { targetTime = historyTradeDays[idx - 1]; } else break;
      offset--;
    }
  } else {
    const nearestTradeDay = historyTradeDays.filter(t => t <= purchaseTime).pop() || historyTradeDays[0];
    let offset = baseOffset + qdiiOffset;
    targetTime = nearestTradeDay;
    while (offset > 0) {
      const idx = historyTradeDays.indexOf(targetTime);
      if (idx > 0) { targetTime = historyTradeDays[idx - 1]; } else break;
      offset--;
    }
  }
  const purchaseData = history.find(d => new Date(d.date + 'T00:00:00').getTime() === targetTime);
  if (purchaseData) {
    const purchaseNav = purchaseData.value;
    if (purchaseNav <= 0) return;
    const marketValBase = (fund._origMarketVal || fund.amount || 0);
    const principal = fund.amount || 0;
    fund.shares = marketValBase / purchaseNav;
    fund.cost = fund.shares > 0 ? (principal / fund.shares) : purchaseNav;
    fund.calibrateTime = purchaseNav;
    fund.purchaseDate = purchaseData.date;
    fund._origMarketVal = principal;
  }
}
// ============ 单个添加 ============
async function submitAddFund(){
  const ci=document.getElementById('addCode'), ai=document.getElementById('addAmount'), pi=document.getElementById('addProfit'), di=document.getElementById('addPurchaseDate');
  const code=ci.value.split(' - ')[0].trim();
  const marketAmount=parseFloat(ai.value)||0;
  const profitInput=pi.value.trim()===''?null:parseFloat(pi.value);
  const isUpdated = document.getElementById('addIsUpdated')?.checked ?? true;
  const purchaseDate=di.value||todayStr();
  const sectorInput = document.getElementById('addSector')?.value.trim() || '';
  const amount=marketAmount-(profitInput||0);
  let cleanCode=code.replace(/\D/g,'');
  if(cleanCode.length===5) cleanCode='0'+cleanCode;
  if(cleanCode.length<4||cleanCode.length>6){ showToast('请输入4-6位基金代码','error'); ci.focus(); ci.select(); return; }
  const fundObj = createFundObj(cleanCode, amount, profitInput, marketAmount, purchaseDate);
  if (sectorInput) fundObj.sectors = [sectorInput];
  const ex=funds.find(f=>f.code===cleanCode);
  const needCalc = purchaseDate <= todayStr();
  if(ex){
    showConfirm(`已存在 ${ex.name||cleanCode}（本金 ${formatMoney(ex.amount)}）\n覆盖为新数据？（本金 ${formatMoney(amount)}）`,async ()=>{
      const idx=funds.indexOf(ex);
      if(idx>=0) funds.splice(idx,1);
      funds.push(fundObj);
      if(needCalc){
        showToast('正在获取历史净值...', 'warning');
        await calcSharesFromPurchaseDate(fundObj, purchaseDate, isUpdated);
      }
      saveFunds(); renderFunds(); fetchFundData(cleanCode);
      showToast('已覆盖','success'); closeAllModals();
    });
    return;
  }
  funds.push(fundObj);
  if(needCalc){
    showToast('正在获取历史净值...', 'warning');
    await calcSharesFromPurchaseDate(fundObj, purchaseDate, isUpdated);
  }
  saveFunds(); renderFunds(); fetchFundData(cleanCode);
  showToast('已添加：'+cleanCode,'success'); closeAllModals();
}
// ============ 弹窗栈管理（防止多层弹窗 blur/透明度叠加）============
let _modalStack = [];
function _openModal(el) {
  if (_modalStack.length > 0) {
    var prev = _modalStack[_modalStack.length - 1];
    prev.style.setProperty('backdrop-filter', 'none', 'important');
    prev.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
    var prevBox = prev.querySelector('.弹窗-卡片');
    if (prevBox) { prevBox.style.display = 'none'; prevBox.classList.add('跳过动画'); }
  }
  el.classList.add('active');
  el.offsetHeight;
  _modalStack.push(el);
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('modal-open');
}
function _closeModal(el) {
  el.classList.remove('active');
  var box = el.querySelector('.弹窗-卡片');
  if (box) { box.style.display = ''; box.classList.remove('跳过动画'); }
  var idx;
  while ((idx = _modalStack.indexOf(el)) >= 0) _modalStack.splice(idx, 1);
  el.style.removeProperty('backdrop-filter');
  el.style.removeProperty('-webkit-backdrop-filter');
  if (_modalStack.length === 0) {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('modal-open');
  } else {
    var top = _modalStack[_modalStack.length - 1];
    top.style.removeProperty('backdrop-filter');
    top.style.removeProperty('-webkit-backdrop-filter');
    var topBox = top.querySelector('.弹窗-卡片');
    if (topBox) { topBox.style.display = ''; topBox.classList.remove('跳过动画'); }
  }
}
function closeAllModals() {
  while (_modalStack.length > 0) {
    var el = _modalStack[_modalStack.length - 1];
    _closeModal(el);
  }
}
// ============ 确认弹窗 ============
function showConfirm(msg, callback){ confirmCallback=callback; document.getElementById('confirmBody').innerHTML=msg.split('\n').map(safeHtml).join('<br>'); _openModal(document.getElementById('confirmModal')); }
function closeConfirmModal(){ _closeModal(document.getElementById('confirmModal')); confirmCallback=null; }
async function executeConfirm(){ if(confirmCallback) await confirmCallback(); closeConfirmModal(); }
// ============ 排序 ============
function toggleSort(field) { if (sortField === field) sortDir = -sortDir; else { sortField = field; sortDir = -1; } updateSortUI(); renderFunds(); }
function updateSortUI() {
  document.querySelectorAll('.列表-排序').forEach(el => {
    el.classList.remove('asc','desc');
    if (el.dataset.field === sortField) el.classList.add(sortDir===1?'asc':'desc');
  });
}
function getSortedFunds() {
  const base = getGroupFunds();
  if (!sortField) return base.slice();
  const arr = base.slice();
  arr.sort((a,b) => {
    let va,vb;
    if (sortField === 'name') {
      // 特殊需求：点"基金名称"列按市值排序（而非名称字母序）
      va = getMarketValue(a);
      vb = getMarketValue(b);
    }
    else if (sortField === 'gszzl') {
      const aOpen=isMarketOpenNow(a), bOpen=isMarketOpenNow(b);
      va=calcTodayProfit(a,aOpen); vb=calcTodayProfit(b,bOpen);
    }
    else if (sortField === 'amount') {
      const aDwjz=parseFloat(a.dwjz)||0, aValDwjz=parseFloat(a._valuationDwjz)||0;
      const bDwjz=parseFloat(b.dwjz)||0, bValDwjz=parseFloat(b._valuationDwjz)||0;
      const aRate=(aDwjz>0&&aValDwjz>0&&Math.abs(aDwjz-aValDwjz)>0.0001) ? ((aDwjz-aValDwjz)/aValDwjz)*100 : (parseFloat(a.gszzl)||0);
      const bRate=(bDwjz>0&&bValDwjz>0&&Math.abs(bDwjz-bValDwjz)>0.0001) ? ((bDwjz-bValDwjz)/bValDwjz)*100 : (parseFloat(b.gszzl)||0);
      va=aRate; vb=bRate;
    }
    else if (sortField === 'profit') {
      const aOpen=isMarketOpenNow(a), bOpen=isMarketOpenNow(b);
      va=calcDisplayProfit(a, aOpen); vb=calcDisplayProfit(b, bOpen);
    }
    if (va<vb) return -sortDir; if (va>vb) return sortDir; return 0;
  });
  return arr;
}
// 共享：输入框失去焦点后查基金名称，填入输入框
function _onFundCodeBlur(inputId) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  var raw = inp.value;
  // 已含名称（从 datalist 选的），直接提取代码
  if (raw.indexOf(' - ') > 0) {
    var parts = raw.split(' - ');
    var code = parts[0].trim();
    var name = parts.slice(1).join(' - ');
    if (code && name) { inp.value = code + ' - ' + name; _onFundCodeReady(inputId, code, name); return; }
  }
  var code = raw.trim().replace(/\D/g, '');
  if (code.length === 5) code = '0' + code;
  if (code.length !== 6) return;
  var fund = funds.find(function(f){ return f.code === code; });
  if (fund && fund.name) { inp.value = code + ' - ' + fund.name; _onFundCodeReady(inputId, code, fund.name); return; }
  lookupFundName(code, function(name){
    if (!name) return;
    var cur = document.getElementById(inputId);
    if (!cur) return;
    var curCode = cur.value.trim().replace(/\D/g, '');
    if (curCode.length === 5) curCode = '0' + curCode;
    if (curCode !== code) return;
    cur.value = curCode + ' - ' + name;
    _onFundCodeReady(inputId, code, name);
  });
}
function _onFundCodeReady(inputId, code, name) {
  if (inputId === 'convertInFund') {
    var fund = funds.find(function(f){return f.code===code});
    _convertState.inCode = code;
    _convertState.inName = name || (fund ? (fund.name||fund.code) : code);
    _convertState.outNav = null; _convertState.outNavDate = null;
    _convertState.inNav = null; _convertState.inNavDate = null;
    _renderConvertModal();
    _scheduleConvertRefresh();
  }
}
// 导入基金弹窗
function openImportModal(){ _openModal(document.getElementById('importModal')); }
function closeImportModal(){ _closeModal(document.getElementById('importModal')); }
function switchImportTab(tab, btn){
  document.querySelectorAll('#importModal .二类').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('importSinglePanel').style.display = tab==='single' ? '' : 'none';
  document.getElementById('importBatchPanel').style.display = tab==='batch' ? '' : 'none';
}
function importBatchFunds(){
  if(!Array.isArray(funds)){ funds=[]; }
  const ta=document.getElementById('batchInput'), lines=ta.value.trim().split('\n');
  let added=0, updated=0, errs=[];
  const isUpdated = document.getElementById('batchIsUpdated')?.checked ?? true;
  lines.forEach((line,i)=>{
    line=line.trim(); if(!line)return;
    const p=line.split(/\s+/);
    let code=p[0].replace(/\D/g,'');
    const marketAmount=parseFloat(p[1])||0;
    let profitInput=null, purchaseDate=todayStr();
    if(p.length===3){
      if(p[2].includes('-')){ purchaseDate=p[2]; }
      else { profitInput=parseFloat(p[2]); }
    } else if(p.length>=4){
      profitInput=parseFloat(p[2]); purchaseDate=p[3];
    }
    const sectorName = p.length >= 5 ? p[4] : '';
    const amount=marketAmount-(profitInput||0);
    if(code.length===5) code='0'+code;
    else if(code.length===4) code='00'+code;
    if(!/^\d{6}$/.test(code)){errs.push(`第${i+1}行`); return;}
    const ex=funds.find(f=>f.code===code);
    const fundObj = createFundObj(code, amount, profitInput, marketAmount, purchaseDate, null, false);
    if (sectorName) fundObj.sectors = [sectorName];
    if(ex){
      const idx=funds.indexOf(ex); if(idx>=0) funds.splice(idx,1);
      funds.push(fundObj); updated++;
    } else {
      funds.push(fundObj); added++;
    }
  });
  if(errs.length){showToast(`错误：${errs.join(',')}`,'warning');}
  else if(!added&&!updated){showToast('无数据','warning');}
  else {
    showToast('正在计算...', 'warning');
    saveFunds(); closeAllModals(); ta.value='';
    const today = todayStr();
    (async () => {
      const pending = funds.filter(f => !f._tnCalculated && f.purchaseDate && f.purchaseDate <= today);
      for (const f of pending) {
        try { await calcSharesFromPurchaseDate(f, f.purchaseDate, isUpdated); } catch {}
      }
      saveFunds(); renderFunds();
      showToast(`成功：新增${added},更新${updated}`,'success');
      refreshAll();
    })();
  }
}
// ============ 修改持仓 ============
function confirmHoldingModify(code){
  const f = funds.find(x => x.code === code);
  if (!f) return;
  const nav = parseFloat(f.dwjz) || parseFloat(f.gsz) || 0;
  if (nav <= 0) { showToast('净值未获取，无法修改', 'error'); return; }
  const mode = document.getElementById('holdEditPanel_'+code)?.dataset?.holdMode || 'amount';
  const fundName = f.name || code;
  if (mode === 'share') {
    const newShare = parseFloat(document.getElementById('modalShares')?.value);
    const newCost = parseFloat(document.getElementById('modalCost')?.value);
    if (isNaN(newShare) || newShare <= 0) { showToast('请输入有效份额', 'error'); return; }
    if (isNaN(newCost) || newCost <= 0) { showToast('请输入有效成本价', 'error'); return; }
    var msgShare = `确认修改持仓\n${fundName}\n份额：${newShare.toFixed(2)}\n成本价：${newCost.toFixed(4)}`;
    showConfirm(msgShare, () => { saveHoldingModify(code); });
  } else {
    const newAmount = parseFloat(document.getElementById('modalMarketVal')?.value);
    const newProfit = parseFloat(document.getElementById('modalProfit')?.value);
    if (isNaN(newAmount) || newAmount <= 0) { showToast('请输入有效金额', 'error'); return; }
    showConfirm(`确认修改持仓\n${fundName}\n持有金额：${newAmount.toFixed(2)}${!isNaN(newProfit) ? '\n持有收益：' + newProfit.toFixed(2) : ''}`, () => { saveHoldingModify(code); });
  }
}
function saveHoldingModify(code){
  const f = funds.find(x => x.code === code);
  if (!f) return;
  const nav = parseFloat(f.dwjz) || parseFloat(f.gsz) || 0;
  if (nav <= 0) { showToast('净值未获取，无法修改', 'error'); return; }
  const mode = document.getElementById('holdEditPanel_'+code)?.dataset?.holdMode || 'amount';
  if (mode === 'share') {
    const elShare = document.getElementById('modalShares');
    const elCost = document.getElementById('modalCost');
    const newShare = parseFloat(elShare?.value);
    const newCost = parseFloat(elCost?.value);
    if (isNaN(newShare) || newShare <= 0) { showToast('请输入有效份额', 'error'); return; }
    if (isNaN(newCost) || newCost <= 0) { showToast('请输入有效成本价', 'error'); return; }
    f.shares = newShare;
    f.cost = newCost;
    f.amount = r2(f.cost * f.shares);
  } else {
    const elAmount = document.getElementById('modalMarketVal');
    const elProfit = document.getElementById('modalProfit');
    const newAmount = parseFloat(elAmount?.value);
    const newProfit = parseFloat(elProfit?.value);
    if (isNaN(newAmount) || newAmount <= 0) { showToast('请输入有效金额', 'error'); return; }
    const profit = isNaN(newProfit) ? 0 : newProfit;
    f.shares = newAmount / nav;
    f.cost = f.shares > 0 ? ((newAmount - profit) / f.shares) : 0;
    f.amount = r2(f.cost * f.shares);
  }
  saveFunds(); renderFunds();
  showToast('持仓已更新', 'success');
  closeAllModals();
}
function showActionModal(code, type){
  const fund = funds.find(f=>f.code===code);
  const fundName = fund?.name || code;
  const titles = {group:'修改分组', oplist:'交易记录', holding:'修改持仓'};
  const title = titles[type] || '操作';
  const inputCls = 'class="form-input"';
  let bodyHtml = `<div style="margin-bottom:8px;"><div style="font-size:var(--三类字体大小);color:var(--三类字体颜色);font-weight:500;">${escapeHtml(fundName)}</div><div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-top:2px;">${escapeHtml(code)}</div></div>`;
  if(type === 'group'){
    const opts=groups.map(g => `<option value="${safeHtml(g)}" ${(fund&&(fund.group===g||(!fund.group&&g===groups[0])))?'selected':''}>${safeHtml(g)}</option>`).join('');
    bodyHtml += `<select id="modalInput" onchange="setFundGroup('${code}',this.value);closeAllModals()" ${inputCls}>${opts}</select>`;
  } else if(type === 'oplist'){
    bodyHtml += `<div id="oplist_${code}" style="max-height:300px;overflow-y:auto;"></div>`;
  } else if(type === 'holding'){
    const nav = parseFloat(fund?.dwjz) || parseFloat(fund?.gsz) || 0;
    const shares = (fund.shares || 0);
    const marketVal = nav > 0 && shares > 0 ? r2(shares * nav) : (fund?._origMarketVal || fund?.amount || 0);
    const totalProfit = nav > 0 && shares > 0 && fund?.cost ? r2((nav - Number(fund.cost)) * shares) : (fund?.totalProfit || 0);
    const currentShares2 = (fund?.shares || 0).toFixed(2);
    bodyHtml += `<div style="display:flex;flex-direction:column;gap:10px;">
      <div id="holdEditPanel_${code}" data-hold-mode="amount">
        <div style="font-size:var(--二类字体大小);font-weight:600;color:var(--二类字体颜色);margin-bottom:8px;">修改持仓数据</div>
        <div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-bottom:6px;">当前净值 ${nav > 0 ? nav : '--'} · 持有 ${currentShares2} 份</div>
        <div style="display:flex;gap:12px;margin-bottom:10px;">
          <button class="二类 active" id="holdTabAmount_${code}" onclick="document.getElementById('holdEditPanel_${code}').dataset.holdMode='amount';document.getElementById('holdTabAmount_${code}').classList.add('active');document.getElementById('holdTabShare_${code}').classList.remove('active');document.getElementById('holdFieldsAmount_${code}').style.display='';document.getElementById('holdFieldsShare_${code}').style.display='none'">按金额</button>
          <button class="二类" id="holdTabShare_${code}" onclick="document.getElementById('holdEditPanel_${code}').dataset.holdMode='share';document.getElementById('holdTabShare_${code}').classList.add('active');document.getElementById('holdTabAmount_${code}').classList.remove('active');document.getElementById('holdFieldsShare_${code}').style.display='';document.getElementById('holdFieldsAmount_${code}').style.display='none'">按份额</button>
        </div>
        <div id="holdFieldsAmount_${code}">
          <div class="下距6">
            <label class="t-12 字段标签">持有金额</label>
            <input type="number" id="modalMarketVal" placeholder="请输入持有总金额" step="0.01" min="0" value="${marketVal}" ${inputCls}>
          </div>
          <div class="下距8">
            <label class="t-12 字段标签">持有收益</label>
            <input type="number" id="modalProfit" placeholder="请输入持有总收益（可为负）" step="0.01" value="${totalProfit}" ${inputCls}>
          </div>
        </div>
        <div id="holdFieldsShare_${code}" style="display:none;">
          <div class="下距6">
            <label class="t-12 字段标签">持有份额</label>
            <input type="number" id="modalShares" placeholder="请输入持有份额" step="0.01" min="0" value="${currentShares2}" ${inputCls}>
          </div>
          <div class="下距8">
            <label class="t-12 字段标签">持仓成本价</label>
            <input type="number" id="modalCost" placeholder="请输入持仓成本价" step="0.0001" min="0" value="${(fund?.cost||0).toFixed(2)}" ${inputCls}>
          </div>
        </div>
        <button class="三类" onclick="confirmHoldingModify('${escapeHtml(code)}')">确认修改</button>
      </div>
      <div id="tradePanel_${code}">
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <button class="六类" onclick="showTradeModal('${escapeHtml(code)}','add')" style="flex:1;">加仓</button>
          <button class="六类" onclick="showTradeModal('${escapeHtml(code)}','reduce')" style="flex:1;">减仓</button>
        </div>
        <div style="display:flex;gap:12px;">
          <button class="六类" style="flex:1;" onclick="openDcaModal('${escapeHtml(code)}')">定投</button>
          <button class="六类" style="flex:1;" onclick="openConvertModal('${escapeHtml(code)}')">转换</button>
        </div>
      </div>
    </div>`;
  }
  document.getElementById('actionModalTitle').textContent = title;
  document.getElementById('actionModalBody').innerHTML = bodyHtml;
  _openModal(document.getElementById('actionModal'));
  if (type === 'oplist') {
    renderOpListModal(code);
  }
}
// 公共：生成单条操作记录HTML
function _renderOpItem(op, opts) {
  const m = _fmtOpMeta(op, opts);
  const code = opts.code;
  const fundLabel = opts.showFundName ? `<span style="font-size:var(--三类字体大小);font-weight:600;color:var(--一类字体颜色);">${safeHtml(op.fundName)}</span>` : '';
  const badgeOrInline = opts.badge !== false ? m.badge : `<span style="color:${m.sc};font-size:var(--二类字体大小);font-weight:600;">${m.sl}</span>`;
  const cancelBtn = m.canCancel ? `<button class="四类" style="font-size:var(--一类字体大小);" data-op-action="cancel" data-op-code="${escapeHtml(op.fundCode||code)}" data-op-id="${escapeHtml(op.id)}">撤回</button>` : '';
  const deleteBtn = m.canDelete ? `<button class="四类" style="font-size:var(--一类字体大小);" data-op-action="delete" data-op-code="${escapeHtml(op.fundCode||code)}" data-op-id="${escapeHtml(op.id)}">删除</button>` : '';
  return `<div style="padding:10px 0;border-bottom:1px solid var(--浅色边框);">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">${fundLabel}<span style="font-size:${opts.showFundName?'12':'13'}px;font-weight:500;color:${opts.showFundName?'var(--二类字体颜色)':'var(--一类字体颜色)'};">${m.tl} ${safeHtml(op.amount)}${m.unit}</span></div>
        <div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-top:2px;">${m.infoLine}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">${badgeOrInline}${cancelBtn}${deleteBtn}</div>
    </div>
  </div>`;
}
// 公共：操作记录按钮事件委托
var _opRefreshFn = null;
function setOpRefreshFn(fn) { _opRefreshFn = fn; }
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-op-action]');
  if (!btn) return;
  var action = btn.dataset.opAction;
  var code = btn.dataset.opCode;
  var opId = btn.dataset.opId;
  var fn = action === 'cancel' ? cancelOperation : deleteOperation;
  if (!fn(code, opId)) return;
  showToast(action === 'cancel' ? '已撤回' : '已删除', 'success');
  if (_opRefreshFn) _opRefreshFn(code);
  if (action === 'cancel') renderFunds();
});
// 渲染操作记录弹窗内容
function renderOpListModal(code) {
  const container = document.getElementById('oplist_' + code);
  if (!container) return;
  const fund = funds.find(f => f.code === code);
  var ops = [];
  if (fund && fund.operations) { ops = ops.concat(fund.operations); }
  funds.forEach(function(f){ if (f.code === code) return; (f.operations||[]).forEach(function(op){ if (op.type === 'convert' && op.inCode === code) ops.push(op); }); });
  const pendingCount = ops.filter(op => op.status === 'pending').length;
  let html = '';
  if (pendingCount > 0) html += `<div style="font-size:var(--二类字体大小);color:var(--四类字体颜色);font-weight:600;margin-bottom:8px;">有 ${pendingCount} 笔待确认操作</div>`;
  if (!ops.length) { html += '<div class="左对齐" style="font-size:var(--三类字体大小);color:var(--三类字体颜色);padding:24px;">暂无操作记录</div>'; container.innerHTML = html; return; }
  const sorted = [...ops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  setOpRefreshFn(renderOpListModal);
  sorted.forEach(op => { html += _renderOpItem(op, { code, badge: true }); });
  container.innerHTML = html;
}
function closeActionModal(){
  _closeModal(document.getElementById('actionModal'));
}
// ============ 删除 ============
function removeFund(code){
  const idx=funds.findIndex(x=>x.code===code); if(idx<0)return;
  const name=funds[idx].name||code;
  showConfirm(`确定删除 ${name}？`,()=>{
    funds.splice(idx,1);
    const profits = getDailyProfits();
    const today = todayStr();
    if (profits[today] && profits[today][code] !== undefined) {
      delete profits[today][code];
      setDailyProfits(profits);
    }
    saveDcaPlanToStorage(code,null); saveFunds(); renderFunds(); closeAllModals(); showToast('已删除','success');
  });
}
function clearAllFunds(){
  if(!funds.length)return;
  showConfirm(`清空所有 ${funds.length} 个基金？`,()=>{
    funds=[];
    setDcaAllPlans({});
    var p=getDailyProfits(), t=todayStr();
    if (p[t]) { delete p[t]; setDailyProfits(p); }
    saveFunds(true); renderFunds(); closeAllModals(); showToast('已清空','success');
  });
}
function exportDataToClipboard(){
  if(!funds.length){ showToast('暂无数据可导出','warning'); return; }
  const today = todayStr();
  const exportFields = [
    { key: 'name', label: '基金名称', checked: true },
    { key: 'code', label: '基金代码', checked: true },
    { key: 'mv', label: '市值', checked: true },
    { key: 'profit', label: '持有收益', checked: true },
    { key: 'time', label: '时间', checked: true },
    { key: 'sectors', label: '关联板块', checked: true },
  ];
  let html = '<div style="margin-bottom:10px;font-size:var(--三类字体大小);font-weight:600;color:var(--二类字体颜色);">选择要导出的列：</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--默认边框);">';
  exportFields.forEach((f, i) => {
    html += `<label class="行内标签" style="font-size:var(--三类字体大小);">
      <input type="checkbox" id="exportChk_${i}" ${f.checked ? 'checked' : ''} onchange="updateExportPreview()" /> ${f.label}
    </label>`;
  });
  html += '</div>';
  html += '<div style="font-size:var(--二类字体大小);font-weight:600;color:var(--二类字体颜色);margin-bottom:6px;">数据预览：</div>';
  html += '<div id="exportPreview" style="font-size:var(--二类字体大小);color:var(--一类字体颜色);background:var(--二类背景-卡片表格输入框);border-radius:8px;padding:8px 10px;max-height:200px;overflow-y:auto;"></div>';
  document.getElementById('exportBody').innerHTML = html;
  _exportFundsData = funds;
  _exportFields = exportFields;
  _exportToday = today;
  updateExportPreview();
  _openModal(document.getElementById('exportModal'));
}
function updateExportPreview(){
  const fields = _exportFields;
  const checked = fields.filter((f, i) => document.getElementById('exportChk_' + i)?.checked);
  if (!checked.length) { document.getElementById('exportPreview').innerHTML = '<div style="color:var(--三类字体颜色);">请至少勾选一列</div>'; _exportText = ''; return; }
  const today = _exportToday;
  let text = checked.map(f => f.label).join('\t');
  let tableHtml = '<table style="width:100%;border-collapse:collapse;font-size:var(--二类字体大小);"><thead><tr>';
  checked.forEach(f => {
    tableHtml += `<th style="text-align:left;padding:4px 6px;border-bottom:1px solid var(--浅色边框);color:var(--三类字体颜色);font-weight:600;white-space:nowrap;">${f.label}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';
  _exportFundsData.forEach(f => {
    const vals = checked.map(f2 => {
      if (f2.key === 'name') return f.name || ('基金' + f.code);
      if (f2.key === 'code') return f.code;
      if (f2.key === 'mv') return formatMoney(getMarketValue(f));
      if (f2.key === 'profit') return f.totalProfit !== null && f.totalProfit !== undefined ? formatMoney(f.totalProfit) : '--';
      if (f2.key === 'time') return today;
      if (f2.key === 'sectors') return (f.sectors || []).join('、') || '--';
      return '';
    });
    text += '\n' + vals.join('\t');
    tableHtml += '<tr>';
    vals.forEach((v, i) => {
      const align = (checked[i].key === 'name' || checked[i].key === 'sectors') ? 'left' : 'right';
      tableHtml += `<td style="padding:3px 6px;white-space:nowrap;text-align:${align};">${safeHtml(v)}</td>`;
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';
  document.getElementById('exportPreview').innerHTML = tableHtml;
  _exportText = text;
}
function doExportData(){
  if (!_exportText) { showToast('无数据可导出','warning'); return; }
  navigator.clipboard.writeText(_exportText).then(() => {
    showToast('已复制到剪贴板','success');
    closeExportModal();
  }).catch(() => {
    showToast('复制失败，请手动复制','error');
  });
}
function closeExportModal(){
  _closeModal(document.getElementById('exportModal'));
}
let _exportFundsData = [];
let _exportFields = [];
let _exportToday = '';
let _exportText = '';
// ============ 基金数据获取 ============
function fetchFundData(code){
  return new Promise(resolve=>{
    let resolved=false;
    function doResolve(val){if(!resolved){resolved=true;resolve(val);}}
    fetchFundBaseFirst(code, doResolve);
  });
}
function lookupFundName(code, callback){
  const cb='fn_'+code+'_'+Date.now();
  const sc=document.createElement('script');
  const t=setTimeout(()=>{cleanup();callback(null);},JSONP_TIMEOUT);
  function cleanup(){clearTimeout(t);delete window[cb];if(sc.parentNode)sc.parentNode.removeChild(sc);}
  window[cb]=function(resp){
    try{
      if(!resp||!resp.Datas){callback(null);return;}
      var name=resp.Datas.SHORTNAME||null;
      callback(name);
    }catch(e){callback(null);}finally{cleanup();}
  };
  sc.src='https://fundmobapi.eastmoney.com/FundMApi/FundBase.ashx?FCODE='+code+'&deviceid=1&plat=Iphone&product=EFund&version=6.3.5&callback='+cb;
  sc.onerror=function(){cleanup();callback(null);};
  document.head.appendChild(sc);
}
// FundBase JSONP
function fetchFundBaseFirst(code, doResolve){
  const cb='fb_first_'+code+'_'+Date.now();
  const sc=document.createElement('script');
  const t=setTimeout(()=>{cleanup();console.warn(`[FundBase超时] ${code}`);doResolve(null);},JSONP_TIMEOUT);
  function cleanup(){clearTimeout(t);delete window[cb];if(sc.parentNode)sc.parentNode.removeChild(sc);}
  window[cb]=resp=>{
    try{
      if(!resp||!resp.Datas){ doResolve(null); return; }
      const d=resp.Datas;
      const f=funds.find(x=>x.code===code);
      if(!f){doResolve(null);return;}
      let valData=null;
      if(d.Valuation){ try{valData=JSON.parse(d.Valuation);}catch(e){console.warn('解析估值数据失败:',e);} }
      if(valData && valData.dwjz && parseFloat(valData.dwjz)>0){
        f._valuationDwjz=String(valData.dwjz);
      }
      if(valData && valData.jzrq){
        f._valuationJzrq=String(valData.jzrq);
      }
      const latestNav=d.DWJZ; const latestDate=d.FSRQ; const latestChange=d.RZDF;
      if(d.SHORTNAME) f.name=d.SHORTNAME;
      const isQDII = (f.name||'').toUpperCase().includes('QDII');
      if(isQDII) f.isQDII=true; else delete f.isQDII;
      if(valData && valData.dwjz && parseFloat(valData.dwjz)>0){
        f._prevDwjz=String(valData.dwjz);
      } else {
        const oldDwjz=parseFloat(f.dwjz)||0;
        if(oldDwjz>0) f._prevDwjz=String(oldDwjz);
      }
      f.dwjz=latestNav; f.jzrq=latestDate;
      if(valData && valData.gsz && parseFloat(valData.gsz)>0){
        f.gsz=valData.gsz; f.gszzl=valData.gszzl||'0'; f.gztime=valData.gztime||'';
      } else {
        if(latestChange!==undefined&&latestChange!=='') f.gszzl=String(latestChange);
        f.gsz=latestNav; f.gztime=latestDate;
      }
      if(f.totalProfit!==null && f.calibrateTime===null) f.calibrateTime=parseFloat(f.dwjz)||null;
      doResolve({fundcode:code});
    }catch(e){ doResolve(null); }finally{ cleanup(); }
  };
  sc.src=`https://fundmobapi.eastmoney.com/FundMApi/FundBase.ashx?FCODE=${code}&deviceid=1&plat=Iphone&product=EFund&version=6.3.5&callback=${cb}`;
  sc.onerror=()=>{ cleanup(); doResolve(null); };
  document.head.appendChild(sc);
}
// ============ 指数基金指数验证 ============
const fundIndexMap={ '161725':'sz399997', '001186':'sz399006' };
function fetchIndexQuote(indexCode){
  return new Promise(resolve=>{
    const xhr=new XMLHttpRequest();
    xhr.open('GET',`https://qt.gtimg.cn/q=${indexCode}`,true);
    xhr.onerror=()=>resolve(null); xhr.timeout = XHR_TIMEOUT; xhr.ontimeout=()=>resolve(null);
    xhr.onload=()=>{
      if(xhr.status!==200){resolve(null);return;}
      const txt=xhr.responseText||''; const m=txt.match(/"([^"]+)"/);
      if(!m){resolve(null);return;}
      const parts=m[1].split('~');
      if(!parts||parts.length<6){resolve(null);return;}
      const name=parts[1]||''; const latest=parseFloat(parts[3])||0; const prev=parseFloat(parts[4])||0;
      const change=prev>0?((latest-prev)/prev*100).toFixed(2):'0.00';
      resolve({name,latest,prev,change});
    };
    xhr.send();
  });
}
async function renderIndexReference(code,container){
  const indexCode=fundIndexMap[code]; if(!indexCode)return;
  const data=await fetchIndexQuote(indexCode); if(!data)return;
  const fund=funds.find(x=>x.code===code); if(!fund)return;
  const fundChange=parseFloat(fund.gszzl)||0; const indexChange=parseFloat(data.change)||0;
  const diff=(fundChange-indexChange).toFixed(2);
  container.innerHTML=`<div class="index-ref">
    <div class="index-ref-title">${safeHtml(data.name)} 参考</div>
    <div class="index-ref-row">
      <span>指数涨跌：${indexChange>0?'+':''}${indexChange}%</span>
      <span>基金估算：${fundChange>0?'+':''}${fundChange.toFixed(2)}%</span>
      <span class="index-diff">偏差：${diff>0?'+':''}${diff}%</span>
    </div>
  </div>`;
}
// ============ 基金历史净值 ============
// ====== 历史净值：pingzhongdata 全量数据（与 real-time-fund 一致，一次请求，无需分页） ======
const HISTORY_CACHE_KEY = 'fund_history_cache_v2';
const HISTORY_CACHE_TTL = 60 * 60 * 1000;
const HISTORY_STALE_TTL = 10 * 60 * 1000;
const HISTORY_CACHE_MAX = 50; // LRU max entries
function _readHistoryCache() {
  return safeGet(HISTORY_CACHE_KEY, {});
}
function getHistoryCache(code) {
  const entry = _readHistoryCache()[code];
  if (entry && Date.now() - entry.ts < HISTORY_CACHE_TTL) return entry.data;
  return null;
}
function getHistoryCacheStale(code) {
  const entry = _readHistoryCache()[code];
  return entry ? { data: entry.data, ts: entry.ts } : null;
}
function setHistoryCache(code, data) {
  try {
    const cache = _readHistoryCache();
    // 只缓存最近3年的数据，减少localStorage占用
    var trimmed = data;
    if (data && data.length > 750) {
      var cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      var cutoffStr = cutoff.getFullYear() + '-' + String(cutoff.getMonth()+1).padStart(2,'0') + '-' + String(cutoff.getDate()).padStart(2,'0');
      var idx = data.findIndex(function(d){ return d.date >= cutoffStr; });
      if (idx > 0) trimmed = data.slice(idx);
    }
    cache[code] = { ts: Date.now(), data: trimmed };
    // LRU eviction: keep only the most recent HISTORY_CACHE_MAX entries
    const keys = Object.keys(cache);
    if (keys.length > HISTORY_CACHE_MAX) {
      keys.sort((a, b) => cache[a].ts - cache[b].ts);
      for (let i = 0; i < keys.length - HISTORY_CACHE_MAX; i++) delete cache[keys[i]];
    }
    safeSet(HISTORY_CACHE_KEY, cache);
  } catch (e) { console.warn('写入历史缓存失败:', e); }
}
// 后台刷新防重
const _histRefreshing = new Set();
// 一次 JSONP 请求获取基金全部历史净值（pingzhongdata/{code}.js）
function _doFetchHistory(code){
  return new Promise(resolve => {
    const sc = document.createElement('script');
    const t = setTimeout(() => { cleanup(); resolve(null); }, JSONP_TIMEOUT);
    function cleanup() {
      clearTimeout(t);
      if (sc.parentNode) sc.parentNode.removeChild(sc);
      delete window.Data_netWorthTrend;
    }
    sc.onload = () => {
      try {
        const trend = window.Data_netWorthTrend;
        if (!Array.isArray(trend) || !trend.length) { resolve(null); return; }
        const now = new Date();
        const endMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
        const history = trend
          .filter(d => d && typeof d.x === 'number' && Number.isFinite(Number(d.y)) && d.x <= endMs)
          .sort((a, b) => a.x - b.x)
          .map(d => {
            const dt = new Date(Number(d.x));
            const date = formatDate(dt);
            return { date, value: Number(d.y) };
          });
        resolve(history.length ? history : null);
      } catch (e) { resolve(null); } finally { cleanup(); }
    };
    sc.onerror = () => { cleanup(); resolve(null); };
    sc.src = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
    document.head.appendChild(sc);
  });
}
// JSONP 脚本注入（用于东方财富 F10 / FundArchives 接口，返回 window.apidata）
function _runF10Script(url, timeoutMs = 10000) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    let done = false;
    const cleanup = () => {
      done = true;
      if (timer) clearTimeout(timer);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
    const timer = setTimeout(() => {
      if (done) return;
      cleanup();
      resolve({ ok: false, error: '请求超时' });
    }, timeoutMs);
    script.onload = () => {
      if (done) return;
      cleanup();
      let apidata;
      try { apidata = window?.apidata ? JSON.parse(JSON.stringify(window.apidata)) : undefined; }
      catch (e) { apidata = window?.apidata; }
      resolve({ ok: true, apidata });
    };
    script.onerror = () => {
      if (done) return;
      cleanup();
      resolve({ ok: false, error: '数据加载失败' });
    };
    document.body.appendChild(script);
  });
}
async function fetchFundHistory(code){
  const f = funds.find(x => x.code === code);
  if (f && f.history) return f.history;
  const stale = getHistoryCacheStale(code);
  if (stale) {
    if (f) f.history = stale.data;
    if (Date.now() - stale.ts >= HISTORY_STALE_TTL && !_histRefreshing.has(code)) {
      _histRefreshing.add(code);
      _doFetchHistory(code).then(newData => {
        if (newData) {
          const f2 = funds.find(x => x.code === code);
          if (f2) f2.history = newData;
          setHistoryCache(code, newData);
          const canvas = document.querySelector('#fundDetailModal .trend-chart');
          if (canvas && expandedCode === code) {
            canvas._history = newData;
            const period = parseInt(canvas.dataset.period) || 90;
            const costNav = _costNav(f2);
            canvas._chart = updateTrendChart(canvas, newData, period, costNav);
          }
          const historyPanel = document.querySelector('#fundDetailModal .tab-panel-history');
          if (historyPanel && historyPanel.dataset.loaded === 'true') {
            const rows = _buildHistoryRows(newData);
            _renderHistoryMiniTable(historyPanel, rows);
            historyPanel._allRows = rows;
          }
        }
      }).catch(() => {}).finally(() => _histRefreshing.delete(code));
    }
    return stale.data;
  }
  const allHistory = await _doFetchHistory(code);
  if (!allHistory) return null;
  const f2 = funds.find(x => x.code === code);
  if (f2) f2.history = allHistory;
  setHistoryCache(code, allHistory);
  return allHistory;
}
// ============ 单日净值查询（lsjz 接口，更新快）============
// 注意：此函数使用全局变量 window.apidata 传递数据，必须串行调用，不能并发
function fetchFundNetValue(code, date) {
  return new Promise(resolve => {
    const sc = document.createElement('script');
    const t = setTimeout(() => { cleanup(); resolve(null); }, 10000);
    let done = false;
    function cleanup() { if (done) return; done = true; clearTimeout(t); if (sc.parentNode) sc.parentNode.removeChild(sc); }
    sc.onload = () => {
      cleanup();
      try {
        const resp = window.apidata;
        const content = resp?.content || '';
        if (content.includes('暂无数据')) { resolve(null); return; }
        const rows = content.split('<tr>');
        for (const row of rows) {
          const cells = row.match(/<td[^>]*>(.*?)<\/td>/g) || [];
          if (cells.length < 2) continue;
          const d = cells[0].replace(/<[^>]+>/g, '').trim();
          if (d !== date) continue;
          const nav = parseFloat(cells[1].replace(/<[^>]+>/g, ''));
          resolve(Number.isFinite(nav) ? nav : null);
          return;
        }
        resolve(null);
      } catch(e) { resolve(null); }
    };
    sc.onerror = () => { cleanup(); resolve(null); };
    sc.src = `https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=1&sdate=${date}&edate=${date}`;
    document.head.appendChild(sc);
  });
}
// 从 startDate 开始逐日往后查，最多30天或到今天为止，返回第一个有净值的 { date, value }
async function fetchSmartNetValue(code, startDate) {
  const d = new Date(startDate);
  const today = formatDate(new Date());
  for (let i = 0; i < 30; i++) {
    const ds = formatDate(d);
    if (ds > today) break;
    const nav = await fetchFundNetValue(code, ds);
    if (nav !== null) return { date: ds, value: nav };
    d.setDate(d.getDate() + 1);
  }
  return null;
}
// ============ 持仓数据获取（东方财富 F10 接口） ============
const HOLDINGS_CACHE_KEY = 'fund_holdings_cache_v2';
const HOLDINGS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时，持仓每季度才变
function getHoldingsCache(code) {
  try {
    const cache = JSON.parse(localStorage.getItem(HOLDINGS_CACHE_KEY) || '{}');
    const entry = cache[code];
    if (entry && Date.now() - entry.ts < HOLDINGS_CACHE_TTL) return entry.data;
  } catch (e) { console.warn('读取持仓缓存失败:', e); }
  return null;
}
function setHoldingsCache(code, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(HOLDINGS_CACHE_KEY) || '{}');
    cache[code] = { ts: Date.now(), data };
    // 限制缓存条目
    const keys = Object.keys(cache);
    if (keys.length > 50) { keys.sort((a, b) => cache[b].ts - cache[a].ts); keys.slice(50).forEach(k => delete cache[k]); }
    safeSet(HOLDINGS_CACHE_KEY, cache);
  } catch (e) { console.warn('写入持仓缓存失败:', e); }
}
// 从 F10 HTML 中提取报告期日期（照抄 fund.js L365-375）
function extractHoldingsReportDate(html) {
  if (!html) return null;
  const m1 = html.match(/(报告期|截止日期)[^0-9]{0,20}(\d{4}-\d{2}-\d{2})/);
  if (m1) return m1[2];
  const m2 = html.match(/(\d{4}-\d{2}-\d{2})/);
  return m2 ? m2[1] : null;
}
// 判断报告期是否为上一季度（照抄 fund.js L377-387，用原生 Date 替代 dayjs）
function isLastQuarterReport(reportDateStr) {
  if (!reportDateStr) return false;
  const parts = reportDateStr.split('-');
  const r = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  if (isNaN(r.getTime())) return false;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  return r > sixMonthsAgo;
}
// 从 HTML 中解析前10持仓（股票名称、占净值比例）
function parseHoldingsFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  // 解析 thead 找列索引（照抄 real-time-fund fund.js L654-662）
  const headerRow = (html.match(/<thead[\s\S]*?<tr[\s\S]*?<\/tr>[\s\S]*?<\/thead>/i) || [])[0] || '';
  const headerCells = (headerRow.match(/<th[\s\S]*?>([\s\S]*?)<\/th>/gi) || []).map(th => th.replace(/<[^>]*>/g, '').trim());
  let idxCode = -1, idxName = -1, idxWeight = -1;
  headerCells.forEach((h, i) => {
    const t = h.replace(/\s+/g, '');
    if (idxCode < 0 && (t.includes('股票代码') || t.includes('证券代码'))) idxCode = i;
    if (idxName < 0 && (t.includes('股票名称') || t.includes('证券名称'))) idxName = i;
    if (idxWeight < 0 && (t.includes('占净值比例') || t.includes('占比'))) idxWeight = i;
  });
  // 解析 tbody 中的行
  const rows = html.match(/<tbody[\s\S]*?<\/tbody>/i) || [];
  const dataRows = rows.length ? rows[0].match(/<tr[\s\S]*?<\/tr>/gi) || [] : html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const holdings = [];
  for (const r of dataRows) {
    if (holdings.length >= 10) break;
    const tds = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]*>/g, '').trim());
    if (!tds.length) continue;
    let hc = '', hn = '', hw = '';
    // 代码解析（照抄 fund.js L671-681）：支持6位A股、5位港股、英文代码
    if (idxCode >= 0 && tds[idxCode]) {
      const raw = String(tds[idxCode] || '').trim();
      const mA = raw.match(/(\d{6})/);
      const mHK = raw.match(/(\d{5})/);
      const mAlpha = raw.match(/\b([A-Za-z]{1,10})\b/);
      hc = mA ? mA[1] : (mHK ? mHK[1] : (mAlpha ? mAlpha[1].toUpperCase() : raw));
    } else {
      const codeIdx = tds.findIndex(txt => /^\d{6}$/.test(txt));
      if (codeIdx >= 0) hc = tds[codeIdx];
    }
    // 名称解析（照抄 fund.js L682-687）：有兜底按位置推断
    if (idxName >= 0 && tds[idxName]) {
      hn = tds[idxName];
    } else if (hc) {
      const i = tds.findIndex(txt => txt && txt !== hc && !/%$/.test(txt));
      hn = i >= 0 ? tds[i] : '';
    }
    // 权重解析（照抄 fund.js L688-694）：有兜底找含%的列
    if (idxWeight >= 0 && tds[idxWeight]) {
      const wm = tds[idxWeight].match(/([\d.]+)\s*%/);
      hw = wm ? `${wm[1]}%` : tds[idxWeight];
    } else {
      const wIdx = tds.findIndex(txt => /\d+(?:\.\d+)?\s*%/.test(txt));
      hw = wIdx >= 0 ? tds[wIdx].match(/([\d.]+)\s*%/)?.[1] + '%' : '';
    }
    if (hc || hn || hw) {
      holdings.push({ code: hc, name: hn, weight: hw, change: null });
    }
  }
  return holdings.length ? holdings : null;
}
// 股票代码 → 腾讯行情代码格式
function _normalizeTencentCode(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const mPref = raw.match(/^(us|hk|sh|sz|bj)(.+)$/i);
  if (mPref) {
    const p = mPref[1].toLowerCase();
    const rest = String(mPref[2] || '').trim();
    return `${p}${/^\d+$/.test(rest) ? rest : rest.toUpperCase()}`;
  }
  if (/^\d{6}$/.test(raw)) {
    const pfx = raw.startsWith('6') || raw.startsWith('9') ? 'sh' : (raw.startsWith('4') || raw.startsWith('8') ? 'bj' : 'sz');
    return `s_${pfx}${raw}`;
  }
  if (/^\d{5}$/.test(raw)) return `s_hk${raw}`;
  const mHkDot = raw.match(/^(\d{4,5})\.(?:HK)$/i);
  if (mHkDot) return `s_hk${mHkDot[1].padStart(5, '0')}`;
  if (/^[A-Za-z]{1,10}$/.test(raw)) return `us${raw.toUpperCase()}`;
  return null;
}
// 通过腾讯行情 JSONP 拉取涨跌幅（照抄 fund.js L752-805）
function enrichHoldingsWithQuotes(holdings) {
  const needQuotes = holdings
    .map(h => ({ h, tcode: _normalizeTencentCode(h.code) }))
    .filter(x => Boolean(x.tcode));
  if (!needQuotes.length) return Promise.resolve();
  const tencentCodes = needQuotes.map(x => x.tcode).join(',');
  const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = quoteUrl;
    let done = false;
    const cleanup = () => {
      done = true;
      if (timer) clearTimeout(timer);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
    const timer = setTimeout(() => { if (!done) { cleanup(); resolve(); } }, 8000);
    script.onload = () => {
      if (done) return;
      needQuotes.forEach(({ h, tcode }) => {
        const varName = `v_${tcode}`;
        const dataStr = window[varName];
        delete window[varName];
        if (dataStr) {
          const parts = dataStr.split('~');
          const isUS = /^us/i.test(String(tcode || ''));
          const idx = isUS ? 32 : 5;
          if (parts.length > idx) {
            h.change = parseFloat(parts[idx]);
          }
        }
      });
      cleanup();
      resolve();
    };
    script.onerror = () => { cleanup(); resolve(); };
    document.body.appendChild(script);
  });
}
async function fetchFundHoldings(code) {
  const fund = funds.find(f => f.code === code);
  if (fund && fund._holdings) return fund._holdings;
  const cached = getHoldingsCache(code);
  if (cached) {
    if (fund) fund._holdings = cached;
    return cached;
  }
  const url = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&year=&month=&_=${Date.now()}`;
  const r = await _runF10Script(url);
  if (!r?.ok) return null;
  const html = r.apidata?.content || '';
  const reportDate = extractHoldingsReportDate(html);
  if (!isLastQuarterReport(reportDate)) return null;
  const holdings = parseHoldingsFromHtml(html);
  if (holdings && holdings.length) {
    await enrichHoldingsWithQuotes(holdings);
    if (fund) fund._holdings = holdings;
    setHoldingsCache(code, holdings);
  }
  return holdings;
}
// 切换详情 Tab
function switchDetailTab(code, tabName, btn) {
  const modal = document.getElementById('fundDetailModal');
  if (!modal || !modal.classList.contains('active')) return;
  const tabs = btn.parentElement.querySelectorAll('button');
  tabs.forEach(t => { t.style.color = ''; t.classList.remove('active'); });
  btn.classList.add('active');

  modal.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = modal.querySelector('.tab-panel-' + tabName);
  if (panel) panel.classList.add('active');
  if (tabName === 'trend') {
    const canvas = modal.querySelector('.trend-chart');
    if (canvas && !canvas._chart) renderTrendCharts();
  }
  if (tabName === 'holdings') {
    _loadHoldingsPanel(code);
  }
  if (tabName === 'history') {
    _loadHistoryPanel(code);
  }
}
async function _loadHoldingsPanel(code) {
  const modal = document.getElementById('fundDetailModal');
  if (!modal || !modal.classList.contains('active')) return;
  const panel = modal.querySelector('.tab-panel-holdings');
  if (!panel || panel.dataset.loaded === 'true') return;
  panel.innerHTML = '<div class="holding-empty">加载中...</div>';
  panel.dataset.loaded = 'true';
  const holdings = await fetchFundHoldings(code);
  if (!holdings || !holdings.length) {
    panel.innerHTML = '<div class="holding-empty">暂无持仓数据</div>';
    return;
  }
  // 重新拉取实时涨跌幅（缓存中的行情可能已过期）
  await enrichHoldingsWithQuotes(holdings);
  let html = '<div class="holdings-list">';
  html += `<div class="holding-item" style="font-size:var(--一类字体大小);color:var(--三类字体颜色);font-weight:500;padding:8px;border-bottom:1px solid var(--默认边框);">
    <span class="序号列">#</span>
    <span class="h-name" style="color:var(--三类字体颜色);font-weight:500;">股票名称</span>
    <span class="右对齐" style="min-width:52px;">涨幅</span>
    <span class="右对齐" style="min-width:44px;">持仓占比</span>
  </div>`;
  holdings.forEach((h, i) => {
    const weightStr = h.weight || '—';
    let changeStr = '—';
    let changeCls = '';
    if (h.change != null && Number.isFinite(h.change)) {
      const sign = h.change > 0 ? '+' : '';
      changeCls = h.change > 0 ? 'up' : h.change < 0 ? 'down' : '';
      changeStr = `${sign}${h.change.toFixed(2)}%`;
    }
    html += `<div class="holding-item">
      <span class="t-10 序号列">${i + 1}</span>
      <span class="h-name" title="${safeHtml(h.name)}">${safeHtml(h.name)}</span>
      <span class="h-change ${changeCls}">${changeStr}</span>
      <span class="h-weight">${weightStr}</span>
    </div>`;
  });
  html += '</div>';
  panel.innerHTML = html;
}
// ============ 历史净值 Tab ============
// 把原始历史数据转为表格行（日期降序，计算日涨幅），照抄 FundHistoryNetValue.jsx buildRows
function _buildHistoryRows(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const reversed = [...history].reverse();
  return reversed.map((item, i) => {
    const prev = reversed[i + 1];
    let dailyChange = null;
    if (prev && Number.isFinite(item.value) && Number.isFinite(prev.value) && prev.value !== 0) {
      dailyChange = ((item.value - prev.value) / prev.value) * 100;
    }
    return { date: item.date, netValue: item.value, dailyChange };
  });
}
// 渲染历史净值 mini 表（5行 + 加载更多按钮）
function _fmtChangeCell(r) {
  if (r.dailyChange != null && Number.isFinite(r.dailyChange)) {
    const sign = r.dailyChange > 0 ? '+' : '';
    const cls = r.dailyChange > 0 ? 'up' : r.dailyChange < 0 ? 'down' : '';
    return `<span class="${cls}">${sign}${r.dailyChange.toFixed(2)}%</span>`;
  }
  return '—';
}
function _renderHistoryRow(r) {
  return `<tr>
    <td class="左对齐">${r.date.slice(2)}</td>
    <td class="居中对齐">${Number.isFinite(r.netValue) ? r.netValue.toFixed(4) : '—'}</td>
    <td class="右对齐 ${r.dailyChange > 0 ? 'up' : r.dailyChange < 0 ? 'down' : ''}">${_fmtChangeCell(r)}</td>
  </tr>`;
}
function _renderHistoryMiniTable(container, rows) {
  if (!rows.length) { container.innerHTML = '<div class="holding-empty">暂无历史净值</div>'; return; }
  const visible = rows.slice(0, 10);
  let html = `<table class="history-mini-table"><thead><tr>
    <th class="左对齐">日期</th><th class="居中对齐">净值</th><th class="右对齐">日涨幅</th>
  </tr></thead><tbody>`;
  visible.forEach(r => { html += _renderHistoryRow(r); });
  html += '</tbody></table>';
  if (rows.length > 15) {
    html += `<div style="margin-top:8px;display:flex;justify-content:center;">
      <button type="button" class="五类 t-12"
        onclick="_showHistoryModal(this)">加载更多历史净值</button></div>`;
  }
  container.innerHTML = html;
  container._allRows = rows;
}
async function _loadHistoryPanel(code) {
  const modal = document.getElementById('fundDetailModal');
  if (!modal || !modal.classList.contains('active')) return;
  const panel = modal.querySelector('.tab-panel-history');
  if (!panel || panel.dataset.loaded === 'true') return;
  panel.innerHTML = '<div class="holding-empty">加载中...</div>';
  panel.dataset.loaded = 'true';
  const history = await fetchFundHistory(code);
  const rows = _buildHistoryRows(history || []);
  _renderHistoryMiniTable(panel, rows);
}
// 历史净值全量弹窗
function _showHistoryModal(btn) {
  const panel = btn.closest('.tab-panel-history');
  const rows = panel?._allRows;
  if (!rows || !rows.length) return;
  // 移除旧弹窗
  const old = document.getElementById('historyModal');
  if (old) { _closeModal(old); old.remove(); }
  const overlay = document.createElement('div');
  overlay.id = 'historyModal';
  overlay.className = '弹窗-遮罩层';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) { _closeModal(overlay); overlay.remove(); } });
  let tableHtml = `<table class="history-mini-table 字号12"><thead><tr>
    <th class="左对齐">日期</th><th class="居中对齐">净值</th><th class="右对齐">日涨幅</th>
  </tr></thead><tbody>`;
  rows.forEach(r => { tableHtml += _renderHistoryRow(r); });
  tableHtml += '</tbody></table>';
  overlay.innerHTML = `<div class="弹窗-卡片" style="max-height:80vh;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;">
      <span style="font-weight:600;font-size:var(--三类字体大小);color:var(--一类字体颜色);">历史净值</span>
      <button type="button" class="五类" style="font-size:var(--五类字体大小);color:var(--三类字体颜色);padding:4px 8px;line-height:1;"
        onclick="var el=document.getElementById('historyModal');_closeModal(el);el.remove()">✕</button>
    </div>
    <div class="弹窗-内容" style="flex:1;overflow-y:auto;padding:0 16px 16px;max-height:60vh;">${tableHtml}</div>
  </div>`;
  document.body.appendChild(overlay);
  _openModal(overlay);
}
// ---- 图表代码已提取至 指数图基金图.js ----
// ---- 渲染趋势图 ----
function renderTrendCharts() {
  const canvas = document.querySelector('#fundDetailModal .trend-chart');
  if (!canvas) return;
  const code = canvas.dataset.code; if (!code) return;
  const period = parseInt(canvas.dataset.period) || 90;
  const fund = funds.find(f => f.code === code);
  if (fund?.history) {
    const costNav = _costNav(fund);
    canvas._chart = createTrendChart(canvas, fund.history, period, costNav);
    canvas._history = fund.history;
    showChartLoading(code, false);
    return;
  }
  const loadingTimer = setTimeout(() => showChartLoading(code, true), 2000);
  fetchFundHistory(code).then(history => {
    clearTimeout(loadingTimer);
    showChartLoading(code, false);
    if (!history) return;
    const cur = funds.find(f => f.code === code);
    const costNav = _costNav(cur);
    canvas._chart = createTrendChart(canvas, history, period, costNav);
    canvas._history = history;
  });
}
function renderIndexReferences(){
  const el = document.querySelector('#fundDetailModal .index-ref');
  if (!el) return;
  const code = el.id.replace('indexRef_', '');
  if(!code||!fundIndexMap[code]){el.style.display='none';return;}
  el.style.display='block'; renderIndexReference(code,el);
}
async function switchChartPeriod(period,btn){
  const canvas=document.querySelector('#fundDetailModal .trend-chart');
  if(!canvas)return;
  const code=canvas.dataset.code;
  canvas.dataset.period=period;
  btn.closest('.图表-标签')?.querySelectorAll('.二类').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const fund=funds.find(f=>f.code===code);
  if(fund) fund._chartPeriod=period;
  let history = canvas._history;
  if(!history){
    history=fund?.history;
    if(!history) history=await fetchFundHistory(code);
    if(history) canvas._history = history;
  }
  if(history){
    const costNav = _costNav(fund);
    const existingChart = Chart.getChart(canvas);
    if(existingChart){
      canvas._chart = updateTrendChart(canvas,history,period,costNav);
    } else {
      canvas._chart = createTrendChart(canvas,history,period,costNav);
    }
  }
}
// ============ 指数数据获取 ============
function fetchIndices(){
  if(!selectedIndices.length) return;
  // 构建代码映射和备选格式（美股需要多种格式尝试）
  const codeMap = {}; // tencentCode -> originalCode
  const altMap = {};  // originalCode -> [altTencentCodes]
  selectedIndices.forEach(code => {
    const info = allIndices.find(i => i.code === code);
    if (info) {
      codeMap[info.tencent] = code;
      // 美股添加备选格式
      if (code.startsWith('us')) {
        const suffix = code.slice(2).toLowerCase();
        const alts = ['us_' + suffix, 'gb_' + suffix, code];
        altMap[code] = alts;
        alts.forEach(alt => { if (!codeMap[alt]) codeMap[alt] = code; });
      }
    }
  });
  const codes = Object.keys(codeMap).join(',');
  const sc = document.createElement('script');
  sc.src = `https://qt.gtimg.cn/q=${codes}`;
  var timeout = setTimeout(function() {
    if (sc.parentNode) sc.parentNode.removeChild(sc);
  }, XHR_TIMEOUT);
  sc.onload = function() {
    clearTimeout(timeout);
    Object.keys(codeMap).forEach(function(tcode) {
      var code = codeMap[tcode];
      if (indexDataCache[code] && indexDataCache[code].price > 0) return;
      var key = 'v_' + tcode;
      var raw = window[key];
      delete window[key];
      if (raw && typeof raw === 'string') {
        var parts = raw.split('~');
        if (parts.length >= 5) {
          var name = parts[1], price = parseFloat(parts[3]), prev = parseFloat(parts[4]);
          var open = parts.length > 5 ? (parseFloat(parts[5]) || 0) : 0;
          var high = parts.length > 33 ? (parseFloat(parts[33]) || 0) : 0;
          var low = parts.length > 34 ? (parseFloat(parts[34]) || 0) : 0;
          var vol = parts.length > 36 ? (parseFloat(parts[36]) || 0) : 0;
          if (!isNaN(price) && !isNaN(prev) && price > 0) {
            var chg = ((price - prev) / prev * 100);
            indexDataCache[code] = { name: name, price: price, prev: prev, chg: chg, open: open, high: high, low: low, vol: vol };
          }
        }
      }
    });
    renderIndices();
    if (sc.parentNode) sc.parentNode.removeChild(sc);
  };
  sc.onerror = function() { clearTimeout(timeout); if (sc.parentNode) sc.parentNode.removeChild(sc); };
  document.head.appendChild(sc);
}
// ============ 指数渲染与弹窗 ============
function renderIndices(){
  const container=document.getElementById('indexCards');
  if(!selectedIndices.length){
    container.innerHTML='<div class="指数-卡片 add-card 居中对齐" onclick="openIndexModal()" style="grid-column:1/-1;color:var(--三类字体颜色);font-size:var(--二类字体大小);padding:14px;">+ 点击选择指数</div>';
    return;
  }
  let html='';
  selectedIndices.forEach(code=>{
    const info=allIndices.find(i=>i.code===code); const data=indexDataCache[code];
    const name=info?info.name:(data?data.name:code);
    if(data){
      const absChg=Math.abs(data.chg);
      const isFlat=absChg<0.005;
      const cls=isFlat?'flat':(data.chg>=0?'up':'down');
      const sign=isFlat?'':(data.chg>0?'+':'-');
      const pointChange=data.price-data.prev;
      const pointSign=isFlat?'':(pointChange>0?'+':(pointChange<0?'-':''));
      const chgDisplay=isFlat?'0.00':Math.abs(data.chg).toFixed(2);
      const pointDisplay=isFlat?'0.00':Math.abs(pointChange).toFixed(2);
      const borderCls='border-'+cls;
      html+=`<div class="指数-卡片 ${borderCls}" onclick="openIndexDetail('${code}')">
        <div class="index-name">${safeHtml(name)}</div>
        <div class="index-value ${cls}">${data.price.toFixed(2)}</div>
        <div class="index-change-row ${cls}">${pointSign}${pointDisplay} ${sign}${chgDisplay}%</div>
      </div>`;
    } else {
      html+=`<div class="指数-卡片" onclick="openIndexModal()">
        <div class="index-name">${safeHtml(name)}</div><div class="index-value">--</div><div class="index-change">--</div>
      </div>`;
    }
  });
  container.innerHTML=html;
}
function openIndexModal(){
  const body=document.getElementById('indexOptions'); let html='';
  allIndices.forEach(idx=>{
    const checked=selectedIndices.includes(idx.code)?'checked':'';
    html+=`<label class="index-option"><input type="checkbox" value="${idx.code}" ${checked} onchange="onIndexCheck(this)"><span class="io-name">${idx.name}</span><span class="io-code">${idx.code}</span></label>`;
  });
  body.innerHTML=html; _openModal(document.getElementById('indexModal'));
}
function closeIndexModal(){_closeModal(document.getElementById('indexModal'));}
function onIndexCheck(el){
  const val=el.value;
  if(el.checked){ if(selectedIndices.length>=6){el.checked=false;showToast('最多选择6个指数','warning');} else selectedIndices.push(val); }
  else { selectedIndices=selectedIndices.filter(c=>c!==val); }
}
function saveIndexSelection(){ saveIndices(); closeIndexModal(); fetchIndices(); showToast('已保存','success'); }
function resetIndexSelection(){
  selectedIndices = ['sh000001','sz399001','sz399006','sh000688','hkHSTECH','usIXIC'];
  saveIndices();
  closeIndexModal();
  fetchIndices();
  showToast('已恢复默认指数','success');
}
// ============ 指数详情弹窗 ============
let _indexDetailCode = null;
let _indexDetailPeriod = 'trend';
let _indexPeriodChanged = false;
// Tabs自定义顺序
let _indexTabOrder = ['day','trend','trend5','week','month'];
function openIndexDetail(code) {
  const info = allIndices.find(i => i.code === code);
  if (!info) { openIndexModal(); return; }
  _startIndexBgObserver();
  _indexDetailCode = code;
  _indexDetailPeriod = _indexTabOrder[0] || 'trend';
  document.getElementById('indexDetailTitle').textContent = info.name;
  var periodNames = PERIOD_NAMES;
  var tabsHtml = _indexTabOrder.map(function(p) {
    return '<button class="二类 ' + (p === _indexDetailPeriod ? 'active' : '') + '" onclick="switchIndexPeriod(\'' + p + '\')">' + (periodNames[p] || p) + '</button>';
  }).join('') + '<button class="五类" onclick="toggleTabSettings(event)" title="自定义排序">' + ICON_GEAR + '</button>';
  // 从缓存获取数据，直接填充
  var data = indexDataCache[code];
  var chg = data ? (data.chg || 0) : 0;
  var cls = Math.abs(chg) < 0.005 ? 'flat' : (chg >= 0 ? 'up' : 'down');
  var sign = chg > 0 ? '+' : (chg < 0 ? '-' : '');
  var pointChg = data ? (data.price - data.prev) : 0;
  var pointChgSign = pointChg > 0 ? '+' : (pointChg < 0 ? '-' : '');
  var amp = data && data.prev > 0 && data.high && data.low ? ((data.high - data.low) / data.prev * 100).toFixed(2) : '--';
  var priceColor = cls === 'up' ? 'var(--五类字体颜色)' : (cls === 'down' ? 'var(--六类字体颜色)' : 'var(--一类字体颜色)');
  var chgColor = cls === 'up' ? 'var(--五类字体颜色)' : (cls === 'down' ? 'var(--六类字体颜色)' : 'var(--三类字体颜色)');
  var vVal = data ? (data.price || '--') : '--';
  var vChg = data ? (sign + Math.abs(chg).toFixed(2) + '%') : '--';
  var vChgPt = data ? (pointChgSign + Math.abs(pointChg).toFixed(2)) : '--';
  var vOpen = data && data.open ? data.open.toFixed(2) : '--';
  var vPrev = data && data.prev ? data.prev.toFixed(2) : '--';
  var vHigh = data && data.high ? data.high.toFixed(2) : '--';
  var vLow = data && data.low ? data.low.toFixed(2) : '--';
  var vVol = data && data.vol ? (data.vol > 100000000 ? (data.vol/100000000).toFixed(2)+'亿' : data.vol > 10000 ? (data.vol/10000).toFixed(2)+'万' : data.vol.toFixed(0)) : '--';
  var body = document.getElementById('indexDetailBody');
  body.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 6px;margin-bottom:8px;">'
    + '<div><div class="t-9">最新</div><div id="icVal" style="font-size:var(--四类字体大小);font-weight:700;color:' + priceColor + '">' + vVal + '</div></div>'
    + '<div><div class="t-9">涨跌幅</div><div id="icChg" style="font-size:var(--三类字体大小);font-weight:600;color:' + chgColor + '">' + vChg + '</div></div>'
    + '<div><div class="t-9">涨跌额</div><div id="icChgPt" style="font-size:var(--三类字体大小);font-weight:600;color:' + chgColor + '">' + vChgPt + '</div></div>'
    + '<div><div class="t-9">今开</div><div id="icOpen2" class="统计值">' + vOpen + '</div></div>'
    + '<div><div class="t-9">昨收</div><div id="icPrev" class="统计值">' + vPrev + '</div></div>'
    + '<div><div class="t-9">振幅</div><div id="icAmp" class="统计值">' + amp + '%</div></div>'
    + '<div><div class="t-9">最高</div><div id="icHigh" class="统计值">' + vHigh + '</div></div>'
    + '<div><div class="t-9">最低</div><div id="icLow" class="统计值">' + vLow + '</div></div>'
    + '<div><div class="t-9" id="icVolLabel">成交量</div><div id="icVol" class="统计值">' + vVol + '</div></div>'
    + '</div>'
    + '<div id="indexDetailTabs" style="display:flex;gap:4px;margin-bottom:8px;overflow-x:auto;flex-wrap:nowrap;">' + tabsHtml + '</div>'
    + '<div id="indexChartSection">'
    + '<div id="indexChartInfo" style="font-size:var(--二类字体大小);background:transparent;border:none;border-radius:12px;min-height:34px;box-sizing:border-box;padding:6px 10px;margin-bottom:4px;display:flex;align-items:center;gap:12px;font-variant-numeric:tabular-nums;overflow:hidden;">'
    + '<div class="左对齐" style="flex:0 0 auto;white-space:nowrap;"><div id="icDate" class="信息标签"></div></div>'
    + '<div class="左对齐" style="flex:0 0 auto;white-space:nowrap;"><div id="icPct" class="信息标签"></div></div>'
    + '<div class="左对齐" style="flex:0 0 auto;white-space:nowrap;"><div id="icClose" class="信息标签"></div></div>'
    + '<div class="左对齐" style="flex:0 0 auto;white-space:nowrap;"><div id="icOpen" class="信息标签"></div></div>'
    + '</div>'
    + '<div style="position:relative;height:215px;border-radius:12px;background:transparent;overflow:hidden;">'
    + '<canvas id="indexDetailCanvas" style="width:100%;height:100%;"></canvas>'
    + '<div id="hkChartOverlay" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;z-index:2;pointer-events:none;"><span style="color:var(--二类字体颜色);font-size:var(--三类字体大小);font-weight:500;background:var(--二类背景-卡片表格输入框);padding:6px 16px;border-radius:6px;">分时/五日暂不支持港股</span></div>'
    + '</div></div>';
  _openModal(document.getElementById('indexDetailModal'));
  _indexPeriodChanged = true;
  var _idxRendered = false;
  function _delayIndexFetch(){
    if (_idxRendered) return;
    _idxRendered = true;
    fetchIndexData(info, _indexDetailPeriod);
  }
  _delayIndexFetch();
}
function closeIndexDetail() {
  _stopIndexBgObserver();
  _indexDetailCode = null;
  if (_indexChartInstance) { _indexChartInstance.destroy(); _indexChartInstance = null; }
  _closeModal(document.getElementById('indexDetailModal'));
}
function fetchIndexData(info, period) {
  const secid = info.secid || '';
  if (!secid || secid.startsWith('us')) {
    renderIndexStatic(info);
    return;
  }
  if (secid.startsWith('hk') && (period === 'trend' || period === 'trend5')) {
    fetchTencentKline(info, 101, period, 60);
  } else if (period === 'trend') {
    fetchTencentTrend(info, 1);
  } else if (period === 'trend5') {
    fetchTencentTrend(info, 5);
  } else {
    const kltMap = { day: 101, week: 102, month: 103 };
    fetchTencentKline(info, kltMap[period] || 101, period, 60);
  }
}
function renderIndexStatic(info) {
  var _c = document.getElementById('indexDetailCanvas');
  if (_c) _c.style.filter = '';
  var _ov = document.getElementById('hkChartOverlay');
  if (_ov) _ov.style.display = 'none';
  const data = indexDataCache[info.code];
  const body = document.getElementById('indexDetailBody');
  if (!data) { body.innerHTML = '<div class="居中对齐" style="padding:40px 0;color:var(--三类字体颜色);">暂无数据</div>'; return; }
  const chg = data.chg || 0;
  const cls = Math.abs(chg) < 0.005 ? 'flat' : (chg >= 0 ? 'up' : 'down');
  const sign = chg > 0 ? '+' : (chg < 0 ? '-' : '');
  const pointChg = data.price - data.prev;
  const pointChgSign = pointChg > 0 ? '+' : (pointChg < 0 ? '-' : '');
  var code = info.code;
  var secid = info.secid || '';
  var isUs = !secid || secid.startsWith('us');
  var chartMsg = isUs ? '该指数暂不支持K线图' : '图表数据加载失败，请检查网络后重试';
    var retryBtn = isUs ? '' : '<button class="三类 字号12" onclick="retryIndexChart(\'' + code + '\')">重新加载</button>';
  body.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">'
    + '<div class="统计卡"><div class="t-10">最新价</div><div style="font-size:var(--五类字体大小);font-weight:700;color:' + (cls==='up'?'var(--五类字体颜色)':cls==='down'?'var(--六类字体颜色)':'var(--一类字体颜色)') + '">' + data.price.toFixed(2) + '</div></div>'
    + '<div class="统计卡"><div class="t-10">涨跌幅</div><div style="font-size:var(--三类字体大小);font-weight:600;color:' + (cls==='up'?'var(--五类字体颜色)':cls==='down'?'var(--六类字体颜色)':'var(--三类字体颜色)') + '">' + sign + Math.abs(chg).toFixed(2) + '%</div></div>'
    + '<div class="统计卡"><div class="t-10">涨跌额</div><div style="font-size:var(--三类字体大小);font-weight:600;color:' + (cls==='up'?'var(--五类字体颜色)':cls==='down'?'var(--六类字体颜色)':'var(--三类字体颜色)') + '">' + pointChgSign + Math.abs(pointChg).toFixed(2) + '</div></div>'
    + '</div>'
    + '<div class="居中对齐" style="padding:30px 0;">'
    + '<div style="color:var(--三类字体颜色);font-size:var(--二类字体大小);margin-bottom:10px;">' + chartMsg + '</div>'
    + retryBtn
    + '</div>';
}
function retryIndexChart(code) {
  var info = allIndices.find(function(i) { return i.code === code; });
  if (info) fetchIndexData(info, _indexDetailPeriod || 'day');
}
// 公共：腾讯数据 fetch，提取 bars 和 preClose
function _fetchTencent(url, tcode, type, info) {
  return fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res && res.data && res.data[tcode] && res.data[tcode][type]) {
        return { bars: res.data[tcode][type], preClose: parseFloat((res.data[tcode].prec || '0')) || 0 };
      }
      return null;
    })
    .catch(function() { return null; });
}
function fetchTencentTrend(info, ndays) {
  var tcode = info.tencent;
  var period = ndays === 1 ? 'trend' : 'trend5';
  var mktype = period === 'trend' ? 'm1' : 'm5';
  var barCount = period === 'trend5' ? 288 : 240; // 特殊需求：请求288根确保五日基准有前一天数据
  var url = 'https://ifzq.gtimg.cn/appstock/app/kline/mkline?param=' + tcode + ',' + mktype + ',,' + barCount;
  _fetchTencent(url, tcode, mktype, info).then(function(result) {
    if (!result) { renderIndexStatic(info); return; }
    var bars = result.bars, preClose = result.preClose;
    var rawData = bars.map(function(b) { var t = b[0]; var ft = t.slice(0,4)+'-'+t.slice(4,6)+'-'+t.slice(6,8)+' '+t.slice(8,10)+':'+t.slice(10,12); return ft + ',' + b[2] + ',' + b[1]; });
    rawData = rawData.filter(function(s) { return parseFloat(s.split(',')[1]) > 0; });
    var dayMap = {}, dayList = [];
    rawData.forEach(function(s) {
      var d = s.slice(0, 10);
      if (!dayMap[d]) { dayMap[d] = []; dayList.push(d); }
      dayMap[d].push(s);
    });
    var trend5Base = 0;
    if (ndays === 1) {
      var todayDate = formatDate(new Date());
      if (dayMap[todayDate]) {
        rawData = dayMap[todayDate];
      } else {
        var lastDay = dayList[dayList.length - 1];
        if (lastDay) rawData = dayMap[lastDay];
      }
    }
    if (dayList.length >= 6) {
      var refDayBars = dayMap[dayList[dayList.length - 6]];
      trend5Base = parseFloat(refDayBars[refDayBars.length - 1].split(',')[1]) || 0;
      var keep = dayList.slice(dayList.length - 5);
      rawData = [];
      keep.forEach(function(d) { rawData = rawData.concat(dayMap[d]); });
    }
    if (rawData.length > 0) {
      renderIndexChart(info, rawData, period, preClose, trend5Base);
    } else {
      renderIndexStatic(info);
    }
  });
}
function fetchTencentKline(info, klt, period, limit) {
  var tcode = info.tencent;
  var ktypeMap = { 101: 'day', 102: 'week', 103: 'month' };
  var ktype = ktypeMap[klt] || 'day';
  var url = 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=' + tcode + ',' + ktype + ',,,' + limit + ',qfq';
  _fetchTencent(url, tcode, ktype, info).then(function(result) {
    if (!result) { renderIndexStatic(info); return; }
    var rawData = result.bars.map(function(b) { return b[0] + ',' + b[1] + ',' + b[2] + ',' + b[3] + ',' + b[4] + ',' + b[5]; });
    if (rawData.length > 0) {
      renderIndexChart(info, rawData, period, result.preClose);
    } else {
      renderIndexStatic(info);
    }
  });
}
function renderIndexChart(info, rawData, period, apiPreClose, trend5Base) {
  if (period !== _indexDetailPeriod) return;
  if (_pendingIndexRender) { _indexRenderSeq++; }
  _pendingIndexRender = true;
  const data = indexDataCache[info.code];
  const chg = data ? (data.chg || 0) : 0;
  const cls = Math.abs(chg) < 0.005 ? 'flat' : (chg >= 0 ? 'up' : 'down');
  const sign = chg > 0 ? '+' : (chg < 0 ? '-' : '');
  const pointChg = data ? (data.price - data.prev) : 0;
  const pointChgSign = pointChg > 0 ? '+' : (pointChg < 0 ? '-' : '');
  // 解析图表数据（根据字段数自动判断格式：≤4字段=分时，≥5字段=K线）
  let chartPoints, isTrend;
  const klineFmt = rawData.length > 0 && rawData[0].split(',').length >= 5;
  if (!klineFmt && (period === 'trend' || period === 'trend5')) {
    isTrend = true;
    chartPoints = rawData.map(s => {
      const parts = s.split(',');
      return { time: parts[0], price: parseFloat(parts[1]) || 0, open: parts.length > 2 ? (parseFloat(parts[2]) || 0) : 0 };
    }).filter(p => p.price > 0);
  } else {
    isTrend = false;
    chartPoints = rawData.map(s => {
      const parts = s.split(',');
      return { time: parts[0], open: parseFloat(parts[1]), close: parseFloat(parts[2]), high: parseFloat(parts[3]), low: parseFloat(parts[4]), vol: parseFloat(parts[5]) || 0 };
    }).filter(p => p.close > 0);
  }
  // 五日图限制最多5个交易日（K线数据不截断）
  if (isTrend && period === 'trend5' && chartPoints.length > 0) {
    var dayMap = {}, dayList = [];
    chartPoints.forEach(function(p) {
      var d = p.time.slice(0, 10);
      if (!dayMap[d]) { dayMap[d] = []; dayList.push(d); }
      dayMap[d].push(p);
    });
    if (dayList.length >= 5) {
      var keep = dayList.slice(dayList.length - 5);
      chartPoints = [];
      keep.forEach(function(d) { chartPoints = chartPoints.concat(dayMap[d]); });
    }
  }
  if (!chartPoints.length) { renderIndexStatic(info); return; }
  // 优先使用腾讯实时行情（刷新快、数据准），图表数据作为兜底
  const lastPoint = chartPoints[chartPoints.length-1];
  const lastVal = (data && data.price > 0) ? data.price : (isTrend ? lastPoint.price : lastPoint.close);
  let todayOpen, todayHigh, todayLow, todayVol;
  if (isTrend) {
    const prices = chartPoints.map(p => p.price);
    todayOpen = (data && data.open > 0) ? data.open : chartPoints[0].price;
    todayHigh = (data && data.high > 0) ? data.high : Math.max(...prices);
    todayLow = (data && data.low > 0) ? data.low : Math.min(...prices);
    todayVol = 0;
  } else {
    todayOpen = (data && data.open > 0) ? data.open : lastPoint.open;
    todayHigh = (data && data.high > 0) ? data.high : lastPoint.high;
    todayLow = (data && data.low > 0) ? data.low : lastPoint.low;
    todayVol = lastPoint.vol;
  }
  // 优先使用腾讯行情缓存的昨收价，API返回的preClose作为兜底
  const prevClose = (data && data.prev > 0) ? data.prev : ((apiPreClose > 0 ? apiPreClose : 0) || 0);
  // 五日图基准：统一使用五日前一日的收盘价
  var trend5Ref = prevClose;
  if (period === 'trend5' && trend5Base > 0) {
    trend5Ref = trend5Base;
  }
  const amplitude = prevClose > 0 ? ((todayHigh - todayLow) / prevClose * 100).toFixed(2) : '0.00';
  // 构建界面
  const priceColor = cls === 'up' ? 'var(--五类字体颜色)' : (cls === 'down' ? 'var(--六类字体颜色)' : 'var(--一类字体颜色)');
  const chgColor = cls === 'up' ? 'var(--五类字体颜色)' : (cls === 'down' ? 'var(--六类字体颜色)' : 'var(--三类字体颜色)');
  // 更新信息栏（不重建 HTML）
  var _icVal = document.getElementById('icVal');
  if (_icVal) { _icVal.textContent = lastVal.toFixed(2); _icVal.style.color = priceColor; }
  var _icChg = document.getElementById('icChg');
  if (_icChg) { _icChg.textContent = sign + Math.abs(chg).toFixed(2) + '%'; _icChg.style.color = chgColor; }
  var _icChgPt = document.getElementById('icChgPt');
  if (_icChgPt) { _icChgPt.textContent = pointChgSign + Math.abs(pointChg).toFixed(2); _icChgPt.style.color = chgColor; }
  var _icOpen2 = document.getElementById('icOpen2');
  if (_icOpen2) _icOpen2.textContent = todayOpen.toFixed(2);
  var _icPrev = document.getElementById('icPrev');
  if (_icPrev) _icPrev.textContent = prevClose.toFixed(2);
  var _icAmp = document.getElementById('icAmp');
  if (_icAmp) _icAmp.textContent = amplitude + '%';
  var _icHigh = document.getElementById('icHigh');
  if (_icHigh) { _icHigh.textContent = todayHigh.toFixed(2); _icHigh.style.color = 'var(--五类字体颜色)'; }
  var _icLow = document.getElementById('icLow');
  if (_icLow) { _icLow.textContent = todayLow.toFixed(2); _icLow.style.color = 'var(--六类字体颜色)'; }
  if (!isTrend) {
    var _icVolLabel = document.getElementById('icVolLabel');
    if (_icVolLabel) _icVolLabel.textContent = '成交量';
    var _icVol = document.getElementById('icVol');
    if (_icVol) _icVol.textContent = todayVol > 100000000 ? (todayVol/100000000).toFixed(2)+'亿' : todayVol > 10000 ? (todayVol/10000).toFixed(2)+'万' : todayVol.toFixed(0);
  }
  // 更新 tabs 激活状态
  document.querySelectorAll('#indexDetailTabs .二类').forEach(function(t) { t.classList.remove('active'); });
  var activeTab = document.querySelector('#indexDetailTabs .二类[onclick*="\'' + period + '\'"]');
  if (activeTab) activeTab.classList.add('active');
  var canvas = document.getElementById('indexDetailCanvas');
  // 双重 rAF 确保移动端 canvas 已完成首次布局渲染再画图
  var _mySeq = _indexRenderSeq;
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      _pendingIndexRender = false;
      if (_mySeq !== _indexRenderSeq) return;
      if (!canvas || !canvas.parentElement) return;
      var _ref = period === 'trend5' ? trend5Ref : prevClose;
      var _color = cls !== 'down' ? '#ef4444' : '#22c55e';
      drawIndexChart(canvas, chartPoints, isTrend, _color, _ref, period);
    });
  });
  // 如果昨收数据暂时不可用（缓存未就绪），1秒后重试一次
  if (prevClose <= 0 && info && !data) {
    setTimeout(() => {
      const retryData = indexDataCache[info.code];
      if (retryData && retryData.prev > 0) {
        const retryCanvas = document.getElementById('indexDetailCanvas');
        if (retryCanvas) {
          drawIndexChart(retryCanvas, chartPoints, isTrend, cls !== 'down' ? '#ef4444' : '#22c55e', retryData.prev, period);
        }
      }
    }, 1000);
  }
  var _canvas = document.getElementById('indexDetailCanvas');
  var _hkOverlay = document.getElementById('hkChartOverlay');
  if (!isTrend && info.secid && info.secid.startsWith('hk') && (period === 'trend' || period === 'trend5')) {
    if (_canvas) _canvas.style.filter = 'blur(3px)';
    if (_hkOverlay) _hkOverlay.style.display = 'flex';
  } else {
    if (_canvas) _canvas.style.filter = '';
    if (_hkOverlay) _hkOverlay.style.display = 'none';
  }
}
function switchIndexPeriod(period) {
  if (!_indexDetailCode) return;
  _indexDetailPeriod = period;
  const info = allIndices.find(i => i.code === _indexDetailCode);
  if (!info) return;
  // 更新 tab 激活状态
  document.querySelectorAll('#indexDetailTabs .二类').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`#indexDetailTabs .二类[onclick*="'${period}'"]`);
  if (activeTab) activeTab.classList.add('active');
  // 旧图变淡，提示正在加载新数据
  const canvas = document.getElementById('indexDetailCanvas');
  if (canvas) canvas.style.opacity = '0.3';
  _indexPeriodChanged = true;
  fetchIndexData(info, period);
}
// Tabs排序控制
function toggleTabSettings(e) {
  e.stopPropagation();
  _openModal(document.getElementById('tabSettingsModal'));
  renderTabOrderList();
}
function renderTabOrderList() {
  const list = document.getElementById('tsList');
  if (!list) return;
  list.innerHTML = _indexTabOrder.map((id, i) =>
    `<div class="ts-row" data-idx="${i}" onselectstart="return false" oncontextmenu="return false">
      <span class="ts-drag">☰</span>
      <span class="ts-label">${PERIOD_NAMES[id]||id}</span>
    </div>`
  ).join('');
  _initDragSort(list, '.ts-row', 'idx', (src, tgt) => {
    const [moved] = _indexTabOrder.splice(src, 1);
    _indexTabOrder.splice(tgt, 0, moved);
    renderTabOrderList();
  });
}
function applyTabOrder() {
  closeTabSettings();
  // 如果详情已打开，重新渲染tabs
  const container = document.getElementById('indexDetailTabs');
  if (container && _indexDetailCode) {
    const period = _indexDetailPeriod || 'trend';
    const periodNames = PERIOD_NAMES;
    container.innerHTML = _indexTabOrder.map(p =>
      `<button class="二类 ${p===period?'active':''}" onclick="switchIndexPeriod('${p}')">${periodNames[p]}</button>`
    ).join('') + '<button class="五类" onclick="toggleTabSettings(event)" title="自定义排序">' + ICON_GEAR + '</button>';
  }
}
function closeTabSettings() {
  _closeModal(document.getElementById('tabSettingsModal'));
}
// ---- 指数图代码已提取至 指数图基金图.js ----
// 覆盖body.dark下的canvas背景（仅在指数详情弹窗打开时生效）
var _indexDetailObserver = null;
function _startIndexBgObserver() {
  if (_indexDetailObserver) return;
  _indexDetailObserver = new MutationObserver(() => {
    const c = document.getElementById('indexDetailCanvas');
    if (c) c.parentElement.style.background = 'transparent';
  });
  _indexDetailObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
function _stopIndexBgObserver() {
  if (_indexDetailObserver) { _indexDetailObserver.disconnect(); _indexDetailObserver = null; }
}
document.addEventListener('DOMContentLoaded', () => {
  // 弹窗触摸：遮罩层→背景可滚，弹窗内→背景不动，边界→不穿透
  var _lastTouchY = 0, _overlayTouchMoved = false;
  document.addEventListener('touchstart', function(e) {
    _lastTouchY = e.touches[0].clientY;
    if (document.querySelector('.弹窗-遮罩层.active') && !e.target.closest('.弹窗-卡片')) {
      _overlayTouchMoved = false;
    }
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    if (!document.querySelector('.弹窗-遮罩层.active')) return;
    var touchY = e.touches[0].clientY;
    var dy = touchY - _lastTouchY;
    _lastTouchY = touchY;
    if (!e.target.closest('.弹窗-卡片')) {
      _overlayTouchMoved = true;
      return;
    }
    // [已关闭] 弹窗内非滚动区阻止
    // if (!e.target.closest('.弹窗-内容')) { e.preventDefault(); return; }
    // [已关闭] 弹窗内容区边界防穿透
    // var body = e.target.closest('.弹窗-内容');
    // var atTop = body.scrollTop <= 0;
    // var atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
    // if ((atTop && dy > 0) || (atBottom && dy < 0)) e.preventDefault();
  }, { passive: false });
  document.addEventListener('click', function(e) {
    if (!document.querySelector('.弹窗-遮罩层.active')) return;
    if (e.target.closest('.弹窗-卡片')) return;
    if (e.target.classList.contains('弹窗-遮罩层')) return;
    // 滑动过遮罩层 → 不关闭弹窗
    if (_overlayTouchMoved) return;
    e.stopPropagation();
    e.preventDefault();
    var top = _modalStack[_modalStack.length - 1];
    if (top) top.click();
  }, true);
});
// ============ 核心计算逻辑（官方标准公式）============
function isMarketOpenNow(fund) {
  const fsrq = fund.jzrq || '';
  const vJzrq = fund._valuationJzrq || '';
  // 特殊需求：只比日期判断开盘，不检查实际交易时段（9:30-15:00）
  // fsrq == vJzrq 为盘中，其他情况为盘后（QDII 和非 QDII 相同逻辑）
  return (fsrq !== '' && vJzrq !== '' && fsrq === vJzrq);
}
function isTradingDay(dateStr) {
  var d = new Date(dateStr);
  var day = d.getDay();
  if (day === 0 || day === 6) return false;
  if (_holidayCache && _holidayCache[dateStr]) return false;
  return true;
}
function _initHolidayCache() {
  try {
    var cached = localStorage.getItem(HOLIDAY_CACHE_KEY);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.data) {
        _holidayCache = parsed.data; // 过期也先用着，后台静默刷新
        if (parsed.expiry > Date.now()) return;
      }
    }
  } catch(e) { console.warn('读取假期缓存失败:', e); }
  _fetchHolidayFromApi();
}
function _fetchHolidayFromApi() {
  var curYear = new Date().getFullYear();
  var years = [curYear, curYear + 1];
  var allData = {};
  var done = 0;
  years.forEach(function(year) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://cdn.jsdelivr.net/npm/chinese-days@1/dist/years/' + year + '.json', true);
    xhr.onload = function() {
      try {
        var resp = JSON.parse(xhr.responseText);
        if (resp && resp.holidays) {
          for (var dateStr in resp.holidays) allData[dateStr] = true;
        }
      } catch(e) { console.warn('解析假期数据失败:', e); }
      done++; if (done === years.length) { _holidayCache = allData; localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify({ data: allData, expiry: Date.now() + HOLIDAY_CACHE_TTL })); }
    };
    xhr.onerror = function() { done++; if (done === years.length) { _holidayCache = allData; localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify({ data: allData, expiry: Date.now() + HOLIDAY_CACHE_TTL })); } };
    xhr.send();
  });
}
var _convertInIndexCache = null, _convertInIndexDate = '';
function _buildConvertInIndex() {
  var today = todayStr();
  if (_convertInIndexDate === today && _convertInIndexCache) return _convertInIndexCache;
  var idx = {};
  for (var i = 0; i < funds.length; i++) {
    var ops = funds[i].operations || [];
    for (var j = 0; j < ops.length; j++) {
      var op = ops[j];
      if (op.date === today && op.status === 'confirmed' && op.type === 'convert' && op.inCode) {
        idx[op.inCode] = (idx[op.inCode] || 0) + (op.inShares || 0);
      }
    }
  }
  _convertInIndexDate = today;
  _convertInIndexCache = idx;
  return idx;
}
function calcTodayProfit(fund, isMarketOpen=true) {
  const shares = (fund.shares || 0);
  const dwjz = parseFloat(fund.dwjz) || 0;
  const prevDwjz = parseFloat(fund._prevDwjz) || 0;
  const gsz = parseFloat(fund.gsz) || 0;
  if (shares > 0 && prevDwjz > 0) {
    // 当日买入份额不参与当日收益，当日卖出份额仍参与当日涨跌
    // 转换：转出份额仍参与当日涨跌，转入份额不参与当日涨跌
    const today = todayStr();
    let buyToday = 0, sellToday = 0;
    for (const op of (fund.operations || [])) {
      if (op.date !== today || op.status !== 'confirmed') continue;
      if (op.type === 'add') buyToday += (op.confirmShares || 0);
      else if (op.type === 'reduce') sellToday += (op.confirmShares || 0);
      else if (op.type === 'convert') sellToday += (op.outShares || 0);
    }
    // 处理其他基金转入本基金的转换：转入份额不参与今日收益
    var _idx = _buildConvertInIndex();
    buyToday += (_idx[fund.code] || 0);
    const shareForProfit = Math.max(0, shares - buyToday + sellToday);
    if (isMarketOpen && gsz > 0 && Math.abs(gsz - prevDwjz) > 0.0001) {
      return r2(shareForProfit * (gsz - prevDwjz));
    }
    return r2(shareForProfit * (dwjz - prevDwjz));
  }
  return 0;
}
function calcDisplayProfit(fund, isMarketOpen=true) {
  const base = (fund.totalProfit !== null && fund.totalProfit !== undefined) ? fund.totalProfit : 0;
  return base + calcTodayProfit(fund, isMarketOpen);
}
function calcDisplayRate(profit, amount) {
  if (profit === null || amount <= 0) return null;
  return profit / amount * 100;
}
function calcMarketValue(fund) {
  const shares = (fund.shares || 0);
  const nav = parseFloat(fund.dwjz) || parseFloat(fund.gsz) || 0;
  if (shares > 0 && nav > 0) {
    const cost = Number(fund.cost) || 0;
    const profit = cost > 0 ? r2((nav - cost) * shares) : 0;
    const marketVal = r2(shares * nav);
    return { marketVal, profit, amount: r2(cost * shares), calculated: true };
  }
  return { marketVal: fund.amount || 0, profit: 0, amount: fund.amount || 0, calculated: false };
}
function applyMarketValue(fund) {
  const r = calcMarketValue(fund);
  if (r.calculated) {
    fund.totalProfit = r.profit;
    fund._origMarketVal = r.marketVal;
    fund.amount = r.amount;
    fund._tnCalculated = true;
  }
  return r.marketVal;
}
function getMarketValue(fund) {
  return calcMarketValue(fund).marketVal;
}
// ============ 渲染 ============
// DOM缓存：这些元素不会被重建，启动时查一次即可
const $fundList=document.getElementById('fundList');
const $fundListArea=document.getElementById('fundListArea');
const $emptyHint=document.getElementById('emptyHint');
function renderFunds(){
  _convertInIndexDate = '';
  if(!Array.isArray(funds)){ funds=[]; saveFunds(true); }
  const container=$fundList;
  const groupSummaryView = document.getElementById('groupSummaryView');
  renderGroupTabs();
  if(isGroupSummaryView){
    renderGroupSummary();
    return;
  }
  const displayFunds = getSortedFunds();
  if(!displayFunds.length){
    container.style.display='none';
    if(groupSummaryView) groupSummaryView.style.display='none';
    $fundListArea.style.display='none';
    $emptyHint.style.display='block';
    return;
  }
  $fundListArea.style.display='';
  $emptyHint.style.display='none';
  if(groupSummaryView) groupSummaryView.style.display='none';
  container.style.display='block';
  // 固定4列表头
  const _sort = (field) => `列表-排序${sortField===field?(sortDir===1?' asc':' desc'):''}`;
  let html = `<div class="基金-表头行" style="grid-template-columns:${GRID_COLS}">
    <div class="基金-表头格 ${_sort('name')}" data-field="name" onclick="event.stopPropagation();toggleSort('name')">基金名称<span class="sort-arrow"></span></div>
    <div class="基金-表头格 ${_sort('amount')}" data-field="amount" onclick="event.stopPropagation();toggleSort('amount')"><span class="sort-arrow"></span>实时估值</div>
    <div class="基金-表头格 ${_sort('gszzl')}" data-field="gszzl" onclick="event.stopPropagation();toggleSort('gszzl')"><span class="sort-arrow"></span>当日收益</div>
    <div class="基金-表头格 ${_sort('profit')}" data-field="profit" onclick="event.stopPropagation();toggleSort('profit')"><span class="sort-arrow"></span>持有收益</div>
  </div>`;
  displayFunds.forEach(f => applyMarketValue(f));
  const _dcaPlans = getDcaAllPlans();
  let sumLocked = 0, sumPToday = 0, sumPTotal = 0, sumRateW = 0, sumRateWeight = 0, sumCost = 0;
  let allUpdated = displayFunds.length > 0;
  displayFunds.forEach(fund=>{
    const dwjz=parseFloat(fund.dwjz)||0,gszzl=parseFloat(fund.gszzl)||0;
    const amt=fund.amount||0,name=fund.name||('基金'+fund.code);
    const isMarketOpen=isMarketOpenNow(fund);
    if (isMarketOpen) allUpdated = false;
    const todayP = calcTodayProfit(fund, isMarketOpen);
    const isUp=isMarketOpen ? (gszzl>0) : (todayP>0);
    const isDown=isMarketOpen ? (gszzl<0) : (todayP<0);
    const cc=isUp?'up':isDown?'down':'';
    const lockedProfit = calcLockedProfit(fund, isMarketOpen);
    const lockedMarketVal = (fund.amount || 0) + lockedProfit;
    const lockedRate = calcDisplayRate(lockedProfit, amt);
    const lpc = lockedProfit !== null ? (lockedProfit > 0 ? 'up' : lockedProfit < 0 ? 'down' : '') : '';
    const lrc = lockedRate !== null ? (lockedRate > 0 ? 'up' : lockedRate < 0 ? 'down' : '') : '';
    const rowClass = isUp ? 'up' : isDown ? 'down' : '';
    const isUpdated = !isMarketOpen;
    const updatedTag = isUpdated ? `<span class="updated-tag">已更新</span>` : '';
    const valuationDwjz = parseFloat(fund._valuationDwjz) || 0;
    let realRate = gszzl;
    if (dwjz > 0 && valuationDwjz > 0 && Math.abs(dwjz - valuationDwjz) > 0.0001) {
      realRate = ((dwjz - valuationDwjz) / valuationDwjz) * 100;
    }
    const rateUp = realRate > 0, rateDown = realRate < 0;
    const rateCc = rateUp ? 'up' : rateDown ? 'down' : '';
    const sectors = fund.sectors || [];
    const sectorName = sectors.length > 0 ? sectors.join(' ') : '';
    html += `<div class="基金-数据行 ${rowClass}" data-code="${fund.code}" style="grid-template-columns:${GRID_COLS}">
      <div class="基金-数据格"><div class="基金-名称">
        <div class="基金-基金名">${safeHtml(name)}<span class="dca-badge" style="display:${_dcaPlans[fund.code]&&_dcaPlans[fund.code].enabled?'inline':'none'};margin-left:6px;font-size:var(--一类字体大小);color:var(--五类字体颜色);background:var(--九类背景-上涨红色底);padding:0 5px;border-radius:6px;vertical-align:middle;">定</span></div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap;">
          ${updatedTag}
          <div class="基金-金额数值">${hideMarketVal ? '<span class="val-hidden">****</span>' : formatMoney(lockedMarketVal)}</div>
        </div>
      </div></div>
      <div class="基金-数据格"><div class="基金-涨跌">
        <div class="基金-涨跌数值 ${rateCc}">${rateUp?'+':rateDown?'-':''}${Math.abs(realRate).toFixed(2)}%</div>
        <div class="基金-板块">${safeHtml(sectorName)}</div>
      </div></div>
      <div class="基金-数据格"><div class="基金-今日">
        <div class="基金-收益 ${cc}">${todayP>=0?'+':'-'}${formatMoney(Math.abs(todayP))}</div>
      </div></div>
      <div class="基金-数据格"><div class="基金-累计">
        ${lockedProfit!==null
          ? `<div class="基金-累计数值 ${lpc}">${lockedProfit>=0?'+':'-'}${formatMoney(Math.abs(lockedProfit))}</div>
             <div class="基金-累计比率 ${lrc}">${lockedRate != null ? (lockedRate>=0?'+':'') + lockedRate.toFixed(2) + '%' : '--'}</div>`
          : `<div class="基金-累计数值 pending">未校准</div>
             <div class="基金-累计比率 pending">--</div>`}
      </div></div>
    </div>`;
    // 汇总栏累加
    sumLocked += lockedMarketVal;
    sumPToday += todayP;
    sumPTotal += lockedProfit;
    sumCost += amt;
    if (lockedMarketVal > 0) { sumRateW += realRate * lockedMarketVal; sumRateWeight += lockedMarketVal; }
  });
  // 汇总行
  const cc1 = sumPToday > 0 ? 'up' : sumPToday < 0 ? 'down' : '';
  const todayRateVal2 = sumLocked > 0 ? (sumPToday / sumLocked * 100) : 0;
  const cc1Rate2 = todayRateVal2 > 0 ? 'up' : todayRateVal2 < 0 ? 'down' : '';
  const sumUpdatedTag = allUpdated ? `<span class="updated-tag">已更新</span>` : '';
  html = `<div class="基金-数据行 汇总-行" style="grid-template-columns:${GRID_COLS}">
    <div class="基金-数据格"><div class="基金-名称">
      <div class="汇总-资产标签">账户资产 <span class="汇总-眼睛" onclick="toggleHideMarketVal()">${hideMarketVal ? ICON_EYE_HIDE : ICON_EYE_SHOW}</span></div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:2px;"><div class="汇总-资产数值 flat">${hideMarketVal ? '****' : formatMoney(sumLocked)}</div></div>
    </div></div>
    <div class="基金-数据格"></div>
    <div class="基金-数据格" style="grid-column:3/5;"><div class="基金-今日" style="text-align:right;">
      <div class="汇总-资产标签" style="justify-content:flex-end;gap:6px;">${sumUpdatedTag}<span style="color:var(--三类字体颜色);">当日收益</span></div>
      <div style="display:flex;align-items:baseline;gap:6px;justify-content:flex-end;">
        <span class="汇总-今日比率 ${cc1Rate2}">${todayRateVal2>=0?'+':'-'}${Math.abs(todayRateVal2).toFixed(2)}%</span>
        <span class="汇总-今日数值 ${cc1}" style="margin-left:10px;">${sumPToday>=0?'+':'-'}${formatMoney(Math.abs(sumPToday))}</span>
      </div>
    </div></div>
  </div>` + html;
  container.innerHTML=html;
}
// 操作记录通用数据提取
function _fmtOpMeta(op, opts) {
  const unit = op.isMoney ? '元' : '份';
  const sc = STATUS_COLORS[op.status] || 'var(--三类字体颜色)';
  const sl = STATUS_LABELS[op.status] || op.status;
  var canCancel = op.status === 'pending';
  var canDelete = op.status === 'confirmed' || op.status === 'cancelled';
  if (op.type === 'convert') {
    var viewFundCode = opts && opts.code;
    var isTargetView = (viewFundCode && op.inCode === viewFundCode) || op._viewAsIn;
    var partnerLabel = isTargetView ? '转换自' : '转换至';
    var partnerName = safeHtml(isTargetView ? (op.outName || op.outCode) : (op.inName || op.inCode));
    var tl2 = partnerLabel + partnerName;
    var dateStr = (op.date||'').slice(2);
    var timeStr = op.timeType === 'before3' ? '3点前' : '3点后';
    var outShares = (op.outShares||0).toFixed(2);
    var detail;
    if (op.outNav && op.inNav) {
      var outNav = op.outNav.toFixed(4);
      var inAmount = (op.inAmount||0).toFixed(2);
      var inNav = op.inNav.toFixed(4);
      var inShares = (op.inShares||0).toFixed(2);
      detail = dateStr + '·' + timeStr + '<br>转出' + outShares + '份×' + outNav + '=' + inAmount + '元  →  获' + inShares + '份@' + inNav;
    } else {
      detail = dateStr + '·' + timeStr + '<br>转出' + outShares + '份，<span style="color:var(--四类字体颜色);">待确认净值…</span>';
    }
    var infoLine2 = detail;
    var badge2 = '<span style="font-size:var(--二类字体大小);font-weight:600;color:' + sc + ';padding:2px 8px;border-radius:12px;">' + sl + '</span>';
    return { unit: '', sc: sc, sl: sl, tl: tl2, canCancel: canCancel, canDelete: canDelete, infoLine: infoLine2, badge: badge2 };
  }
  const tl = op.isDca ? '定投' : (TYPE_LABELS[op.type] || op.type);
  const dcaTag = op.isDca ? ' <span style="font-size:var(--一类字体大小);color:var(--四类字体颜色);background:var(--九类背景-上涨红色底);padding:1px 6px;border-radius:8px;">定投</span>' : '';
  const infoLine = `${safeHtml(op.date.slice(2))} · ${op.timeType === 'before3' ? '3点前' : '3点后'}${dcaTag}${op.status === 'confirmed' && op.confirmDate ? ' · ' + safeHtml(op.confirmDate.slice(2)) + '确认 · 净值' + safeHtml(op.confirmNav) : ''}`;
  const badge = `<span style="font-size:var(--二类字体大小);font-weight:600;color:${sc};padding:2px 8px;border-radius:12px;">${sl}</span>`;
  return { unit, sc, sl, tl, canCancel, canDelete, infoLine, badge };
}
// ============ 定投 ============
const DCA_STORAGE_KEY = 'fund_monitor_dca_plans';
function getDcaAllPlans() {
  try { var v = localStorage.getItem(DCA_STORAGE_KEY); return v ? JSON.parse(v) : {}; } catch(e) { return {}; }
}
function setDcaAllPlans(plans) { safeSet(DCA_STORAGE_KEY, plans); }
function getDcaPlan(code) { return getDcaAllPlans()[code] || null; }
function saveDcaPlanToStorage(code, plan) {
  var plans = getDcaAllPlans();
  if (plan) plans[code] = plan; else delete plans[code];
  setDcaAllPlans(plans);
}
var _dcaEditCode = null;
function openDcaModal(code) {
  _dcaEditCode = code;
  var fund = funds.find(function(f){return f.code===code});
  var plan = getDcaPlan(code);
  var hasExistingPlan = !!plan;
  if (!plan) plan = { amount:1000, feeRate:0, cycle:'weekly', firstDate:todayStr(), enabled:true, weeklyDay:1, monthlyDay:15, timeType:'after3', lastDate:'' };
  var weekLabels = ['一','二','三','四','五'];
  var cycleOptions = [
    {v:'daily',l:'每日'},{v:'weekly',l:'每周'},{v:'biweekly',l:'每两周'},{v:'monthly',l:'每月'}
  ];
  var cycleHtml = cycleOptions.map(function(o){
    return '<button class="二类 ' + (plan.cycle===o.v?'active':'') + '" onclick="selectDcaCycle(\'' + o.v + '\',this)">' + o.l + '</button>';
  }).join('');
  var weekHtml = [1,2,3,4,5].map(function(d){
    return '<button class="二类 ' + (plan.weeklyDay===d?'active':'') + ' 字号11" onclick="selectDcaWeekDay(' + d + ',this)">周' + weekLabels[d-1] + '</button>';
  }).join('');
  var monthHtml = Array.from({length:28},function(_,i){
    return '<button class="二类 ' + (plan.monthlyDay===i+1?'active':'') + ' 字号11" onclick="selectDcaMonthDay(' + (i+1) + ',this)" style="min-width:32px">' + (i+1) + '</button>';
  }).join('');
  var html = '<div style="display:flex;flex-direction:column;gap:10px;">'
    + '<div><div><span style="font-size:var(--三类字体大小);font-weight:500;color:var(--三类字体颜色);">' + safeHtml(fund?fund.name:code) + '</span><button class="四类" id="dcaDeleteBtn" style="display:none;margin-left:8px;" onclick="deleteDcaPlan()">删除定投</button></div><div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-top:2px;">' + safeHtml(code) + '</div></div>'
    + '<label class="行内标签" style="padding:4px 0;"><span>启用定投</span><input type="checkbox" id="dcaEnabled" style="margin-left:6px;" ' + (plan.enabled?'checked':'') + '></label>'
    + '<div style="display:flex;gap:8px;"><div style="flex:1;"><label class="t-12 字段标签">定投金额</label><input type="number" id="dcaAmount" class="form-input" style="width:100%;box-sizing:border-box;" value="' + plan.amount + '" step="0.01" min="0"></div><div style="flex:1;"><label class="t-12 字段标签">买入费率（%）</label><input type="number" id="dcaFeeRate" class="form-input" style="width:100%;box-sizing:border-box;" value="' + plan.feeRate + '" step="0.01" min="0"></div></div>'
    + '<div><label class="t-12 字段标签">定投周期</label><div style="display:flex;gap:6px;flex-wrap:wrap;" id="dcaCycleGroup">' + cycleHtml + '</div></div>'
    + '<div id="dcaWeeklyDayGroup" style="display:' + ((plan.cycle==='weekly'||plan.cycle==='biweekly')?'':'none') + '"><label class="t-12 字段标签">扣款日</label><div style="display:flex;gap:6px;flex-wrap:wrap;">' + weekHtml + '</div></div>'
    + '<div id="dcaMonthlyDayGroup" style="display:' + (plan.cycle==='monthly'?'':'none') + '"><label class="t-12 字段标签">扣款日</label><div style="display:flex;gap:4px;flex-wrap:wrap;">' + monthHtml + '</div></div>'
    + '<div><label class="t-12 字段标签">首次扣款日期</label><div id="dcaFirstDateRow" style="display:flex;gap:6px;"><input type="date" id="dcaFirstDate" class="form-input" style="flex:1;box-sizing:border-box;" value="' + plan.firstDate + '"><button class="二类 ' + (plan.timeType==='before3'?'active':'') + '" onclick="selectDcaTimeType(\'before3\',this)">3点前</button><button class="二类 ' + (plan.timeType==='after3'?'active':'') + '" onclick="selectDcaTimeType(\'after3\',this)">3点后</button></div></div>'
    + '</div>';
  document.getElementById('dcaModalBody').innerHTML = html;
  var delBtn = document.getElementById('dcaDeleteBtn');
  if (delBtn) delBtn.style.display = hasExistingPlan ? '' : 'none';
  _openModal(document.getElementById('dcaModal'));
}
function closeDcaModal() { _closeModal(document.getElementById('dcaModal')); _dcaEditCode = null; }
function selectDcaCycle(cycle, btn) {
  document.querySelectorAll('#dcaCycleGroup .二类').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
  document.getElementById('dcaWeeklyDayGroup').style.display = (cycle==='weekly'||cycle==='biweekly')?'':'none';
  document.getElementById('dcaMonthlyDayGroup').style.display = cycle==='monthly'?'':'none';
}
function selectDcaWeekDay(day, btn) {
  document.querySelectorAll('#dcaWeeklyDayGroup .二类').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
}
function selectDcaMonthDay(day, btn) {
  document.querySelectorAll('#dcaMonthlyDayGroup .二类').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
}
function selectDcaTimeType(type, btn) {
  document.querySelectorAll('#dcaFirstDateRow .二类').forEach(function(b){b.classList.remove('active')});
  btn.classList.add('active');
}
function saveDcaPlan() {
  var code = _dcaEditCode; if (!code) return;
  var enabled = document.getElementById('dcaEnabled').checked;
  var amount = parseFloat(document.getElementById('dcaAmount').value);
  var feeRate = parseFloat(document.getElementById('dcaFeeRate').value);
  if (!amount||amount<=0) { showToast('请输入有效金额','error'); return; }
  var firstDate = document.getElementById('dcaFirstDate').value;
  if (!firstDate) { showToast('请选择首次扣款日期','error'); return; }
  var cycleEl = document.querySelector('#dcaCycleGroup .active');
  var cycleMap = {每日:'daily',每周:'weekly',每两周:'biweekly',每月:'monthly'};
  var cycle = cycleEl ? (cycleMap[cycleEl.textContent.trim()]||'weekly') : 'weekly';
  var plan = getDcaPlan(code) || {};
  plan.enabled = enabled; plan.amount = amount; plan.feeRate = feeRate; plan.cycle = cycle; plan.firstDate = firstDate;
  if (cycle==='weekly'||cycle==='biweekly') {
    var wd = document.querySelector('#dcaWeeklyDayGroup .active');
    plan.weeklyDay = wd ? parseInt(wd.textContent.replace(/周/,'').replace(/一/,1).replace(/二/,2).replace(/三/,3).replace(/四/,4).replace(/五/,5)) : 1;
  }
  if (cycle==='monthly') {
    var md = document.querySelector('#dcaMonthlyDayGroup .active');
    plan.monthlyDay = md ? parseInt(md.textContent) : 1;
  }
  var tt = document.querySelector('#dcaFirstDateRow .二类.active');
  plan.timeType = tt ? (tt.textContent.trim() === '3点前' ? 'before3' : 'after3') : 'after3';
  saveDcaPlanToStorage(code, plan);
  scheduleDcaTrades();
  closeAllModals();
  renderFunds();
  showToast('定投计划已保存','success');
}
function deleteDcaPlan() {
  var code = _dcaEditCode; if (!code) return;
  var fund = funds.find(function(f){return f.code===code});
  var name = fund ? (fund.name || code) : code;
  showConfirm('确定删除 ' + name + ' 的定投计划？', function() {
    saveDcaPlanToStorage(code, null);
    closeAllModals();
    renderFunds();
    showToast('定投计划已删除','success');
  });
}
// ============ 基金转换 ============
var _convertState = { code: null, inCode: '', inName: '', shares: 0, date: '', timeType: 'before3', outNav: null, outNavDate: null, inNav: null, inNavDate: null, _showCustomInput: false };
var _convertRefreshTimer = null;

function _convertGetConfirmDate() {
  if (!_convertState.date) return '';
  var d = new Date(_convertState.date);
  if (_convertState.timeType === 'after3') d.setDate(d.getDate() + 1);
  return formatDate(d);
}
function openConvertModal(code) {
  var fund = funds.find(function(f){return f.code===code});
  if (!fund) return;
  _convertState.code = code; _convertState.inCode = ''; _convertState.inName = ''; _convertState.shares = 0; _convertState._showCustomInput = false;
  _convertState.outNav = null; _convertState.outNavDate = null; _convertState.inNav = null; _convertState.inNavDate = null;
  _convertState.date = todayStr(); _convertState.timeType = 'before3';
  _renderConvertModal(); _openModal(document.getElementById('convertModal'));
}
function closeConvertModal() {
  if (_convertRefreshTimer) { clearTimeout(_convertRefreshTimer); _convertRefreshTimer = null; }
  _closeModal(document.getElementById('convertModal'));
}
function _renderConvertModal() {
  var fund = funds.find(function(f){return f.code===_convertState.code});
  if (!fund) return;
  var fundName = fund.name || fund.code;
  var available = getAvailableShares(fund);
  var inputVal = _convertState.inCode ? (_convertState.inCode + (_convertState.inName && _convertState.inName !== _convertState.inCode ? ' - ' + _convertState.inName : '')) : '';
  var otherFunds = funds.filter(function(f){return f.code !== _convertState.code});
  var fundOpts = otherFunds.map(function(f){
    var label = escapeHtml(f.code) + ' - ' + escapeHtml(f.name||f.code);
    return '<option value="' + label + '">' + label + '</option>';
  }).join('');
  var html =
    '<div style="margin-bottom:12px;"><div style="font-size:var(--三类字体大小);color:var(--三类字体颜色);font-weight:500;">转出：' + safeHtml(fundName) + '</div><div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-top:2px;">' + escapeHtml(_convertState.code) + '</div></div>' +
     '<div class="下距10"><label class="t-12 字段标签">转入</label><input list="convertInFundList" id="convertInFund" class="form-input" style="width:100%;box-sizing:border-box;" placeholder="输入6位基金代码" value="' + escapeHtml(inputVal) + '" onblur="_onFundCodeBlur(\'convertInFund\')"><datalist id="convertInFundList">' + fundOpts + '</datalist></div>' +
    '<div class="下距8"><label class="t-12 字段标签">转出份额</label><input type="number" id="convertShares" class="form-input" style="width:100%;box-sizing:border-box;" placeholder="请输入转出份额" step="0.01" min="0" value="' + (_convertState.shares>0?_convertState.shares:'') + '" oninput="var p=document.getElementById(\'convertQuickBtns\');if(p)p.querySelectorAll(\'.二类\').forEach(function(b){b.classList.remove(\'active\')});_onConvertInputChange()"></div>' +
    '<div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-bottom:6px;">可用：' + available.toFixed(2) + '份</div>' +
    '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;" id="convertQuickBtns"><button class="二类 字号11" onclick="_setConvertShares(0.25,this)">1/4</button><button class="二类 字号11" onclick="_setConvertShares(1/3,this)">1/3</button><button class="二类 字号11" onclick="_setConvertShares(0.5,this)">1/2</button><button class="二类 字号11" onclick="_setConvertShares(1,this)">全部</button></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;">' +
      '<input type="date" id="convertDate" value="' + _convertState.date + '" class="form-input" style="width:140px;" onchange="_onConvertInputChange()">' +
      '<div style="display:flex;gap:4px;"><button class="二类 ' + (_convertState.timeType==='before3'?'active':'') + '" onclick="_setConvertTimeType(\'before3\',this)">3点前</button><button class="二类 ' + (_convertState.timeType==='after3'?'active':'') + '" onclick="_setConvertTimeType(\'after3\',this)">3点后</button></div>' +
    '</div>' +
    '<button class="三类" id="convertConfirmBtn" onclick="confirmConvert()" style="width:100%;margin-top:8px;">确认转换</button>';
  document.getElementById('convertModalBody').innerHTML = html;
}
function _buildConvertInfoHtml() {
  if (!_convertState.outNav && !_convertState.inNav && !_convertState.inCode && !_convertState.shares)
    return '<div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);padding:8px 0;">选择基金、份额和日期后将显示净值信息</div>';
  var outStr = _convertState.outNav
    ? '<span style="color:var(--上涨悬停色);">' + _convertState.outNav.toFixed(4) + ' (' + _convertState.outNavDate.slice(2) + '确认)</span>'
    : '<span style="color:var(--四类字体颜色);">' + (_convertState.inCode ? '等待净值...' : '') + '</span>';
  var inStr = _convertState.inNav
    ? '<span style="color:var(--上涨悬停色);">' + _convertState.inNav.toFixed(4) + ' (' + _convertState.inNavDate.slice(2) + '确认)</span>'
    : '<span style="color:var(--四类字体颜色);">' + (_convertState.outNav ? '等待净值...' : '') + '</span>';
  var recvAmount = _convertState.outNav ? r2(_convertState.shares * _convertState.outNav).toFixed(2) + '元' : '--';
  var getSharesStr = _convertState.inNav && _convertState.outNav ? r2(_convertState.shares * _convertState.outNav / _convertState.inNav).toFixed(2) + '份' : '--';
  return '<div style="border:1px solid var(--浅色边框);border-radius:12px;padding:12px;font-size:var(--二类字体大小);">' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="color:var(--四类字体颜色);">A转出净值：</span>' + outStr + '</div>' +
    '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:var(--四类字体颜色);">B转入净值：</span>' + inStr + '</div>' +
    '<div style="border-top:1px solid var(--浅色边框);padding-top:8px;">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>回收金额：</span><span style="font-weight:600;">' + recvAmount + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;"><span>获得份额：</span><span style="font-weight:600;">' + getSharesStr + '</span></div></div>';
}
function _scheduleConvertRefresh() {
  if (_convertRefreshTimer) { clearTimeout(_convertRefreshTimer); _convertRefreshTimer = null; }
  if (!_convertState.code || !_convertState.inCode || !_convertState.date || !_convertState.shares) return;
  if (_convertState.outNav && _convertState.inNav) return;
  _convertRefreshTimer = setTimeout(_doConvertRefresh, 1000);
}
async function _doConvertRefresh() {
  _convertRefreshTimer = null;
  if (!_convertState.code || !_convertState.inCode || !_convertState.date || !_convertState.shares) return;
  var confirmDate = _convertGetConfirmDate(); if (!confirmDate) return;
  if (!_convertState.outNav) {
    var outResult = await fetchSmartNetValue(_convertState.code, confirmDate);
    if (outResult && outResult.value > 0) { _convertState.outNav = outResult.value; _convertState.outNavDate = outResult.date; _convertState.shares = parseFloat(document.getElementById('convertShares')?.value) || 0; }
  }
  if (_convertState.outNav && !_convertState.inNav) {
    var inResult = await fetchSmartNetValue(_convertState.inCode, confirmDate);
    if (inResult && inResult.value > 0) { _convertState.inNav = inResult.value; _convertState.inNavDate = inResult.date; }
  }
  _renderConvertModal();
}
function _onConvertInputChange() {
  var sharesEl = document.getElementById('convertShares');
  var dateEl = document.getElementById('convertDate');
  _convertState.shares = parseFloat(sharesEl?.value) || 0; _convertState.date = dateEl?.value || '';
  _convertState.outNav = null; _convertState.outNavDate = null; _convertState.inNav = null; _convertState.inNavDate = null;
}
function _setConvertTimeType(type, btn) {
  _convertState.timeType = type;
  _convertState.outNav = null; _convertState.outNavDate = null; _convertState.inNav = null; _convertState.inNavDate = null;
  _renderConvertModal();
}
function _setConvertShares(ratio, btn) {
  var fund = funds.find(function(f){return f.code===_convertState.code});
  if (!fund) return;
  var available = getAvailableShares(fund);
  var v = ratio >= 1 ? available : r2(available * ratio);
  _convertState.shares = v;
  var el = document.getElementById('convertShares');
  if (el) el.value = v > 0 ? v : '';
  _convertState.outNav = null; _convertState.outNavDate = null; _convertState.inNav = null; _convertState.inNavDate = null;
  if (btn) {
    var p = document.getElementById('convertQuickBtns');
    if (p) p.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});
    btn.classList.add('active');
  }
}
function confirmConvert() {
  if (!_convertState.shares || _convertState.shares <= 0) { showToast('请输入有效份额', 'error'); return; }
  if (!_convertState.inCode) { showToast('请选择转入基金', 'error'); return; }
  var fund = funds.find(function(f){return f.code===_convertState.code});
  if (!fund) return;
  if (_convertState.shares > getAvailableShares(fund)) { showToast('转出份额超出可用份额', 'error'); return; }
  var confirmDate = _convertGetConfirmDate();
  var inAmount = _convertState.outNav ? r2(_convertState.shares * _convertState.outNav) : 0;
  var inShares = (_convertState.outNav && _convertState.inNav) ? r2(_convertState.shares * _convertState.outNav / _convertState.inNav) : 0;
  var op = {
    id: generateId(), type: 'convert', date: _convertState.date, timeType: _convertState.timeType, status: 'pending',
    outCode: _convertState.code, outName: fund.name || _convertState.code,
    outShares: _convertState.shares, outNav: _convertState.outNav, outNavDate: _convertState.outNavDate,
    inCode: _convertState.inCode, inName: _convertState.inName,
    inAmount: inAmount,
    inNav: _convertState.inNav, inNavDate: _convertState.inNavDate, inShares: inShares,
    confirmDate: confirmDate, createdAt: new Date().toISOString()
  };
  fund.operations = fund.operations || []; fund.operations.push(op);
  if (_convertState.outNav && _convertState.inNav) {
    confirmSingleOp(fund, op);
    saveFunds(); renderFunds();
    showToast('转换已确认', 'success');
  } else {
    saveFunds(); renderFunds();
    showToast('转换已加入待处理队列', 'info');
  }
  closeAllModals();
}
function scheduleDcaTrades() {
  var plans = getDcaAllPlans();
  var today = todayStr();
  var todayDate = new Date(today);
  var changed = false;
  for (var code in plans) {
    var plan = plans[code];
    if (!plan.enabled) continue;
    var fund = funds.find(function(f){return f.code===code});
    if (!fund) continue;
    var startDate = plan.lastDate || plan.firstDate;
    if (startDate > today) continue;
    var cursor = new Date(startDate);
    if (plan.lastDate) cursor.setDate(cursor.getDate() + 1);
    var endDate = new Date(today);
    var generatedDates = [];
    while (cursor <= endDate) {
      var dateStr = formatDate(cursor);
      var dayOfWeek = cursor.getDay();
      if (!isTradingDay(dateStr)) { cursor.setDate(cursor.getDate() + 1); continue; }
      var shouldExec = false;
      if (plan.cycle === 'daily') {
        shouldExec = true;
      } else if (plan.cycle === 'weekly') {
        var targetDay = plan.weeklyDay || 1;
        if (dayOfWeek === targetDay) shouldExec = true;
      } else if (plan.cycle === 'biweekly') {
        var targetDay = plan.weeklyDay || 1;
        if (dayOfWeek === targetDay) {
          var firstDateObj = new Date(plan.firstDate);
          var weeksSinceStart = Math.floor((cursor - firstDateObj) / (7 * 86400000));
          if (weeksSinceStart % 2 === 0) shouldExec = true;
        }
      } else if (plan.cycle === 'monthly') {
        var targetDay = plan.monthlyDay || 1;
        if (cursor.getDate() === targetDay) shouldExec = true;
      }
      if (shouldExec) generatedDates.push(dateStr);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (generatedDates.length > 0) {
      fund.operations = fund.operations || [];
      var isFirstBatch = !plan.lastDate;
      generatedDates.forEach(function(dateStr, idx){
        var dup = fund.operations.some(function(o){ return o.isDca && o.date === dateStr && o.status === 'pending'; });
        if (dup) return;
        var actual = plan.amount * (1 - (plan.feeRate || 0) / 100);
        var timeType = (isFirstBatch && idx === 0) ? (plan.timeType || 'after3') : 'before3';
        var op = createOperation('add', dateStr, timeType, actual, true);
        op.isDca = true; op.confirmDate = dateStr;
        fund.operations.push(op);
      });
      plan.lastDate = generatedDates[generatedDates.length - 1];
      saveDcaPlanToStorage(code, plan);
      changed = true;
    }
  }
  if (changed) saveFunds();
}
// $ic、calcPct 已提取至 指数图基金图.js
function calcLockedProfit(fund, isMarketOpen){ return (isMarketOpen||fund._tnCalculated)?((fund.totalProfit!==null&&fund.totalProfit!==undefined)?fund.totalProfit:0):calcDisplayProfit(fund,isMarketOpen); }
// ============ 展开（弹窗模式） ============
function toggleExpand(code){
  if(expandedCode===code){ closeFundDetailModal(); return; }
  expandedCode=code;
  openFundDetailModal(code);
  // 预加载相邻基金
  const displayFunds = getSortedFunds();
  const idx = displayFunds.findIndex(f=>f.code===expandedCode);
  if(idx>=0){
    if(idx>0){
      const prevFund = displayFunds[idx-1];
      if(prevFund && !prevFund.history && !getHistoryCache(prevFund.code)){
        fetchFundHistory(prevFund.code).catch(()=>{});
      }
    }
    if(idx<displayFunds.length-1){
      const nextFund = displayFunds[idx+1];
      if(nextFund && !nextFund.history && !getHistoryCache(nextFund.code)){
        fetchFundHistory(nextFund.code).catch(()=>{});
      }
    }
  }
}
function openFundDetailModal(code){
  const fund = funds.find(f=>f.code===code);
  if(!fund) return;
  const displayFunds = getSortedFunds();
  let groupTotalMV = 0;
  displayFunds.forEach(f=>{ groupTotalMV += getMarketValue(f); });
  const dwjz=parseFloat(fund.dwjz)||0, gsz=parseFloat(fund.gsz)||0;
  const isMarketOpen=isMarketOpenNow(fund);
  const lockedProfit = calcLockedProfit(fund, isMarketOpen);
  const lockedMarketVal = (fund.amount || 0) + lockedProfit;
  const chartPeriod = fund._chartPeriod || 3;
  const periodBtns = [1,3,6,12,36].map(p => {
    const labels = {1:'1月',3:'3月',6:'6月',12:'1年',36:'3年'};
    const active = p === chartPeriod ? ' active' : '';
    return `<button class="二类${active}" onclick="switchChartPeriod(${p},this);event.stopPropagation()">${labels[p]}</button>`;
  }).join('');
  const codeHtml = fund.code ? `<div style="font-size:var(--三类字体大小);color:var(--二类字体颜色);font-weight:500;margin-top:2px;">${fund.code}</div>` : '';
  document.getElementById('fundDetailTitle').innerHTML = `<div style="display:flex;flex-direction:column;min-width:0;overflow:hidden;"><span style="display:flex;align-items:center;gap:6px;min-width:0;"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${safeHtml(fund.name)||('基金'+safeHtml(fund.code))}</span> <button class="四类" style="flex-shrink:0;" onclick="event.stopPropagation();removeFund('${escapeHtml(fund.code)}')">删除</button></span>${codeHtml}</div>`;
  const sectors = (fund.sectors||[]).join(' ') || '--';
  const costVal = Number(fund.cost) ? Number(fund.cost).toFixed(4) : '--';
  const sharesVal = (fund.shares||0).toFixed(2);
  const dateNav = `${(fund.jzrq||'-').slice(2).replace(/-/g,'-')}/${dwjz}`;
  const gszVal = gsz||'--';
  const ratioVal = groupTotalMV > 0 ? (lockedMarketVal / groupTotalMV * 100).toFixed(1) + '%' : '--';
  const html = `<div class="详情-内部">
    <div class="detail-debug" style="font-size:var(--二类字体大小);color:var(--二类字体颜色);padding:4px 8px;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 8px;font-size:var(--二类字体大小);line-height:18px;">
        <div><span class="t-10">关联板块</span><br><span id="inlineSector_${escapeHtml(fund.code)}" class="信息值" onclick="event.stopPropagation();editFundSectorInline('${escapeHtml(fund.code)}')">${safeHtml(sectors)}</span></div>
        <div><span class="t-10">成本价</span><br><span class="信息值">${costVal}</span></div>
        <div><span class="t-10">份额</span><br><span class="信息值">${sharesVal}</span></div>
        <div><span class="t-10">持仓占比</span><br><span class="信息值">${ratioVal}</span></div>
        <div><span class="t-10">估算值</span><br><span class="信息值">${gszVal}</span></div>
        <div><span class="t-10">日期/净值</span><br><span class="信息值">${dateNav}</span></div>
      </div></div>
    <div class="详情-操作栏">
      <div class="详情-操作行">
        <button onclick="event.stopPropagation();showActionModal('${escapeHtml(fund.code)}','group')" class="详情操作按钮"><svg class="图标" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg> 修改分组</button>
        <button onclick="event.stopPropagation();showActionModal('${escapeHtml(fund.code)}','holding')" class="详情操作按钮"><svg class="图标" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 修改持仓</button>
        <button onclick="event.stopPropagation();showActionModal('${escapeHtml(fund.code)}','oplist')" class="详情操作按钮"><svg class="图标" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> 交易记录</button>
      </div>
      <div class="详情-分割线"></div>
      <div class="详情-标签" id="detailTabs_${fund.code}">
        <button class="详情-标签项 active" onclick="switchDetailTab('${escapeHtml(fund.code)}','trend',this);event.stopPropagation()"><svg class="图标" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg> 业绩走势</button>
        <button class="详情-标签项" onclick="switchDetailTab('${escapeHtml(fund.code)}','holdings',this);event.stopPropagation()"><svg class="图标" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> 前10持仓</button>
        <button class="详情-标签项" onclick="switchDetailTab('${escapeHtml(fund.code)}','history',this);event.stopPropagation()"><svg class="图标" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 历史净值</button>
      </div>
    </div>
    <div class="tab-panel tab-panel-trend active">
      <div class="detail-info-bar" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:6px 8px;font-size:var(--二类字体大小);line-height:16px;white-space:nowrap;align-items:center;">
          <span class="period-change" data-code="${fund.code}"><span class="基金-标签">本基金</span> <span class="基金-涨跌幅"></span></span>
          <span class="detail-info-time">持有天数：${daysBetween(fund.purchaseDate, todayStr())}天</span>
          <span class="detail-info-code">导入时间：${(fund.purchaseDate||'').slice(2).replace(/-/g,'-')}</span>
      </div>
      <div class="detail-main">
        <div class="index-ref" id="indexRef_${fund.code}" style="display:none;"></div>
        <div class="trend-chart-wrapper">
          <div class="chart-loading hidden" id="chartLoading_${fund.code}">
            <div class="chart-loading-spinner"></div>
          </div>
          <span class="chart-tooltip" id="tooltip_${fund.code}"></span>
          <canvas class="trend-chart" data-code="${fund.code}" data-period="${chartPeriod}"></canvas>
        </div>
      </div>
      <div class="detail-controls">
        <div class="图表-标签">${periodBtns}</div>
      </div>
    </div>
    <div class="tab-panel tab-panel-holdings" data-loaded="false">
      <div class="holding-empty">点击"前10持仓"加载</div>
    </div>
    <div class="tab-panel tab-panel-history" data-loaded="false">
      <div class="holding-empty">点击"历史净值"加载</div>
    </div>
  </div>`;
  document.getElementById('fundDetailBody').innerHTML = html;
  _openModal(document.getElementById('fundDetailModal'));
  var _chartRendered = false;
  function _renderDetailCharts(){
    if (_chartRendered) return;
    _chartRendered = true;
    renderTrendCharts();
    renderIndexReferences();

  }
  _renderDetailCharts();
}
function closeFundDetailModal(){
  const canvas = document.querySelector('#fundDetailModal .trend-chart');
  if(canvas){ const ch = Chart.getChart(canvas); if(ch) ch.destroy(); }
  _closeModal(document.getElementById('fundDetailModal'));
  document.getElementById('fundDetailBody').innerHTML = '';
  expandedCode = null;
}
// ============ Toast ============
var _toastT1,_toastT2;
function showToast(msg,type){ clearTimeout(_toastT1); clearTimeout(_toastT2); const t=document.getElementById('toast'); t.textContent=msg; t.className='toast '+(type||'')+' show'; _toastT1=setTimeout(()=>{t.classList.remove('show');},2500); _toastT2=setTimeout(()=>{t.className='toast';},2850); }
// ============ 刷新 ============
let _refreshStartTime = 0;
function spinRefreshIcon(btn) {
  if (_refreshing || !funds.length) return;
  const svg = btn.querySelector('.图标');
  svg.classList.add('icon-spin');
  _refreshStartTime = Date.now();
  refreshAll(btn);
}
function _stopSpin(btn) {
  var svg = btn && btn.querySelector('.图标');
  if (!svg) return;
  var elapsed = Date.now() - _refreshStartTime;
  var remain = 500 - elapsed;
  if (remain > 0) {
    setTimeout(function(){ svg.classList.remove('icon-spin'); }, remain);
  } else {
    svg.classList.remove('icon-spin');
  }
}
let _refreshing = false;
function recordDailyProfits() {
  const today = todayStr();
  // 非交易日不记录，交易日 15:00 前也不记录（盘中利润非最终值）
  if (!isTradingDay(today) || new Date().getHours() < 15) return;
  const profits = getDailyProfits();
  if (!profits[today]) profits[today] = {};
  let changed = false;
  funds.forEach(f => {
    if (!f.shares || f.shares <= 0) return;
    if (isMarketOpenNow(f)) return;
    const dwjz = parseFloat(f.dwjz);
    if (!dwjz || dwjz <= 0 || !f._prevDwjz) return;
    const todayP = calcTodayProfit(f, false);
    if (todayP === 0) return;
    if (profits[today][f.code] !== todayP) {
      profits[today][f.code] = todayP;
      changed = true;
    }
  });
  if (changed) {
    // 大小保护：超过500KB时清理最旧的记录
    try {
      var raw = JSON.stringify(profits);
      if (raw.length > 500000) {
        var dates = Object.keys(profits).sort();
        while (raw.length > 400000 && dates.length > 60) {
          delete profits[dates.shift()];
          raw = JSON.stringify(profits);
        }
      }
    } catch(e) { console.warn('每日收益数据清理失败:', e); }
    setDailyProfits(profits);
  }
}
async function refreshAll(btn){
  if(!funds.length || _refreshing) return;
  _refreshing = true;
  try {
    if(!btn)document.getElementById('updateTime').textContent='刷新中...';
    await Promise.allSettled(funds.map(f => fetchFundData(f.code)));
    scheduleDcaTrades();
    await checkPendingOperations();
    // 自动重试：shares=0但amount>0的基金，重新计算份额和成本
    const today = todayStr();
    const retryPending = funds.filter(f => f.shares === 0 && f.amount > 0 && f.purchaseDate && f.purchaseDate <= today);
    for (const f of retryPending) {
      try { await calcSharesFromPurchaseDate(f, f.purchaseDate, true); } catch {}
    }
    if (retryPending.length > 0) saveFunds();
    if (expandedCode) {
      await fetchFundHistory(expandedCode);
    }
    if (_indexDetailCode && _indexDetailPeriod) {
      var _idxInfo = allIndices.find(i => i.code === _indexDetailCode);
      if (_idxInfo) fetchIndexData(_idxInfo, _indexDetailPeriod);
    }
    saveFunds();
    renderFunds();
    recordDailyProfits();
    const n=new Date();
    document.getElementById('updateTime').textContent=`最后更新：${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  } finally {
    _refreshing = false;
    if (btn) _stopSpin(btn);
  }
}
// ============ 自动刷新 ============
function toggleAutoRefresh(){
  isAutoRefresh=!isAutoRefresh;
  localStorage.setItem('fund_monitor_auto_refresh', isAutoRefresh);
  const m=document.getElementById('moreAutoRefreshItem');
  if(isAutoRefresh){
    if(m)m.innerHTML='<svg class="图标 图标间距" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 停止自动刷新';
    refreshAll(); autoRefreshTimer=setInterval(()=>refreshAll(),AUTO_REFRESH_INTERVAL);
    showToast('自动刷新已开启（60秒）','success');
  }else{
    if(m)m.innerHTML='<svg class="图标 图标间距" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 自动刷新';
    clearInterval(autoRefreshTimer); autoRefreshTimer=null;
    showToast('自动刷新已关闭','warning');
  }
}
// ============ 事件 ============
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'){ if(e.target.id==='addCode'||e.target.id==='addAmount'||e.target.id==='addProfit')submitAddFund(); }
  if(e.key==='Escape'){
    var moreMenu=document.getElementById('moreDropdown');
    if(moreMenu&&moreMenu.classList.contains('active')){ closeMoreMenu(); }
    else if(_modalStack.length>0){ var top=_modalStack[_modalStack.length-1]; _closeModal(top); }
  }
});
document.addEventListener('click',e=>{
  const moreWrap=document.querySelector('.更多-按钮容器');
  if(moreWrap&&!moreWrap.contains(e.target))closeMoreMenu();
});
// 启动
const verEl = document.getElementById('versionTag');
if(verEl) verEl.textContent = APP_VERSION;
loadStorage();
_initHolidayCache();
// 启动时清理已失效的定投计划（基金已被删除）
(function cleanStaleDcaPlans(){
  var plans = getDcaAllPlans();
  var codeSet = {}; funds.forEach(function(f){codeSet[f.code]=true});
  var changed = false;
  for (var c in plans) { if (!codeSet[c]) { delete plans[c]; changed = true; } }
  if (changed) setDcaAllPlans(plans);
})();
updateSortUI();
// 基金行点击事件委托
document.getElementById('fundList').addEventListener('click', e => {
  const th = e.target.closest('th[data-field]');
  if (th) { toggleSort(th.dataset.field); return; }
  const cell = e.target.closest('[data-code]');
  if (cell && cell.dataset.code) toggleExpand(cell.dataset.code);
});
// 启动时不清除内存缓存，优先使用 localStorage 缓存
// 只在每天开盘前清除过期缓存
function clearExpiredCache(){
  try {
    const cache = JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY) || '{}');
    const now = Date.now();
    let changed = false;
    for(const code in cache){
      if(now - cache[code].ts > HISTORY_CACHE_TTL){
        delete cache[code];
        changed = true;
      }
    }
    if(changed) safeSet(HISTORY_CACHE_KEY, cache);
  } catch(e) { console.warn('清理缓存失败:', e); }
}
clearExpiredCache();
fetchIndices();
renderFunds();
if(funds.length) refreshAll(false);
if(isAutoRefresh){
  const m=document.getElementById('moreAutoRefreshItem');
  if(m)m.innerHTML='<svg class="图标 图标间距" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> 停止自动刷新';
  autoRefreshTimer=setInterval(()=>refreshAll(),AUTO_REFRESH_INTERVAL);
}

// 按钮不获取焦点，避免浏览器默认聚焦样式残留（在 pointerdown 时 blur，不干扰 :active 动画）
document.addEventListener('pointerdown', e => { if (e.target.matches('.一类,.三类,.二类,.四类')) e.target.blur(); });
const addPurchaseDateInput = document.getElementById('addPurchaseDate');
if (addPurchaseDateInput) {
  addPurchaseDateInput.addEventListener('change', function() {
    const profitInput = document.getElementById('addProfit');
    const today = todayStr();
    if (this.value && this.value < today) {
      profitInput.placeholder = '留空则系统自动计算';
    } else {
      profitInput.placeholder = '持有收益';
    }
  });
}
// ============ 操作记录与交易日工具 ============
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// 创建操作记录
function createOperation(type, date, timeType, amount, isMoney) {
  return {
    id: generateId(),
    type, // 'add' | 'reduce'
    date, // 用户选择的日期
    timeType, // 'before3' | 'after3'
    amount, // 金额或份额
    isMoney, // true=按金额, false=按份额
    confirmDate: null, // 计算后填写
    confirmNav: null,
    confirmShares: null,
    status: 'pending', // 'pending' | 'confirmed' | 'cancelled'
    createdAt: new Date().toISOString()
  };
}
// 为基金添加操作记录
async function addFundOperation(code, type, date, timeType, amount, isMoney) {
  const fund = funds.find(f => f.code === code);
  if (!fund) return null;
  const op = createOperation(type, date, timeType, amount, isMoney);
  const dd = new Date(date);
  if (timeType === 'after3') dd.setDate(dd.getDate() + 1);
  op.confirmDate = formatDate(dd);
  fund.operations = fund.operations || [];
  fund.operations.push(op);
  saveFunds();
  await confirmSingleOp(fund, op);
  if (op.status === 'confirmed') { saveFunds(); renderFunds(); }
  return op;
}
async function confirmSingleOp(fund, op) {
  if (op.status !== 'pending' || !op.confirmDate) return;
  if (op.type === 'convert') {
    if (!op.outNav) {
      var outResult = await fetchSmartNetValue(op.outCode, op.confirmDate);
      if (outResult && outResult.value > 0) { op.outNav = outResult.value; op.outNavDate = outResult.date; op.inAmount = r2(op.outShares * outResult.value); }
    }
    if (op.outNav && !op.inNav) {
      var inResult = await fetchSmartNetValue(op.inCode, op.confirmDate);
      if (inResult && inResult.value > 0) { op.inNav = inResult.value; op.inNavDate = inResult.date; op.inShares = r2(op.inAmount / inResult.value); }
    }
    if (op.outNav && op.inNav) {
      var srcFund = funds.find(function(f){return f.code===op.outCode});
      if (srcFund) { srcFund.shares = Math.max(0, (srcFund.shares||0) - op.outShares); if (srcFund.shares <= 0) { srcFund.cost = 0; srcFund.amount = 0; } else { var oldCost = Number(srcFund.cost)||0; srcFund.amount = oldCost * srcFund.shares; } }
      var tgtFund = funds.find(function(f){return f.code===op.inCode});
      if (!tgtFund) {
        tgtFund = { code: op.inCode, name: op.inName||'', shares:0, cost:0, amount:0, dwjz:'0', gsz:'0', gszzl:'0', gztime:'', jzrq:'', totalProfit:null, _origMarketVal:null, calibrateTime:null, addDate:todayStr(), purchaseDate:todayStr(), group:srcFund?srcFund.group:'', isQDII:false, _chartPeriod:3, operations:[] };
        funds.push(tgtFund);
      }
      var oldShare = tgtFund.shares||0; var oldAmount = tgtFund.amount||0;
      tgtFund.shares = oldShare + op.inShares;
      tgtFund.amount = r2(oldAmount + op.inAmount);
      tgtFund.cost = tgtFund.shares > 0 ? r2(tgtFund.amount / tgtFund.shares) : 0;
      op.status = 'confirmed';
    }
    return;
  }
  const result = await fetchSmartNetValue(fund.code, op.confirmDate);
  if (result && result.value > 0) {
    op.confirmNav = result.value;
    op.confirmDate = result.date;
    const nav = result.value;
    if (op.type === 'add') {
      const buyShares = op.amount / nav;
      op.confirmShares = buyShares;
      const oldShare = fund.shares || 0;
      const oldAmount = fund.amount || 0;
      const newShare = oldShare + buyShares;
      const newAmount = oldAmount + op.amount;
      fund.amount = r2(newAmount);
      fund.cost = newShare > 0 ? (newAmount / newShare) : 0;
      fund.shares = newShare;
    } else if (op.type === 'reduce') {
      const sellShares = op.isMoney ? (op.amount / nav) : op.amount;
      op.confirmShares = sellShares;
      const oldShare = fund.shares || 0;
      fund.shares = Math.max(0, oldShare - sellShares);
      if (fund.shares <= 0) { fund.cost = 0; fund.amount = 0; }
      else {
        const oldCost = Number(fund.cost) || 0;
        fund.amount = r2(oldCost * fund.shares);
      }
    }
    op.status = 'confirmed';
  }
}
// 检查并自动确认待处理的操作
async function checkPendingOperations() {
  let confirmedCount = 0;
  for (const fund of funds) {
    if (!fund.operations || !fund.operations.length) continue;
    const pendingOps = fund.operations.filter(op => op.status === 'pending');
    if (!pendingOps.length) continue;
    for (const op of pendingOps) {
      await confirmSingleOp(fund, op);
      if (op.status === 'confirmed') confirmedCount++;
    }
  }
  if (confirmedCount > 0) {
    saveFunds();
    renderFunds();
    showToast(`${confirmedCount}笔操作已自动确认`, 'success');
  }
  return confirmedCount;
}
// 撤回操作（pending直接删除；confirmed仅标记，不影响持仓）
function cancelOperation(code, opId) {
  var fund = funds.find(f => f.code === code);
  if (!fund || !fund.operations || !fund.operations.some(op => op.id === opId)) {
    fund = funds.find(f => f.operations && f.operations.some(op => op.id === opId));
    if (!fund) return false;
  }
  const idx = fund.operations.findIndex(op => op.id === opId);
  if (idx < 0) return false;
  if (fund.operations[idx].status === 'pending') fund.operations.splice(idx, 1);
  else fund.operations[idx].status = 'cancelled';
  saveFunds();
  return true;
}
// 删除操作记录（永久删除，不影响持仓）
function deleteOperation(code, opId) {
  var fund = funds.find(f => f.code === code);
  if (!fund || !fund.operations || !fund.operations.some(op => op.id === opId)) {
    fund = funds.find(f => f.operations && f.operations.some(op => op.id === opId));
    if (!fund) return false;
  }
  const idx = fund.operations.findIndex(op => op.id === opId);
  if (idx < 0) return false;
  fund.operations.splice(idx, 1);
  saveFunds();
  return true;
}
// ============ 加减仓弹窗交互 ============
let _tradeTimeType = (()=>{ try{ const s=localStorage.getItem('fund_monitor_tradetime'); return s ? JSON.parse(s) : {}; }catch(e){ return {}; } })();
function setTradeTimeType(code, type) {
  _tradeTimeType[code] = type;
  safeSet('fund_monitor_tradetime', _tradeTimeType);
  const before3 = document.getElementById('tradeBefore3_' + code);
  const after3 = document.getElementById('tradeAfter3_' + code);
  if (before3) before3.classList.toggle('active', type === 'before3');
  if (after3) after3.classList.toggle('active', type === 'after3');
}
// 获取可用份额（扣除待确认减仓）
function getAvailableShares(fund) {
  if (!fund) return 0;
  let shares = fund.shares || 0;
  const ops = fund.operations || [];
  for (var i = 0; i < ops.length; i++) {
    var op = ops[i];
    if (op.status === 'pending') {
      if (op.type === 'reduce' && !op.isMoney) shares -= (op.amount || 0);
      else if (op.type === 'convert') shares -= (op.outShares || 0);
    }
  }
  return Math.max(0, shares);
}
// 设置减仓份额（1/4, 1/3, 1/2, 全部）
function setReduceShares(code, ratio, btn) {
  const fund = funds.find(f => f.code === code);
  if (!fund) return;
  const shares = getAvailableShares(fund);
  const input = document.getElementById('reduceShares_' + code);
  if (!input) return;
  if (shares <= 0) { showToast('没有可卖出的份额', 'error'); return; }
  if (ratio >= 1) {
    input.value = shares.toFixed(2);
  } else {
    input.value = (shares * ratio).toFixed(2);
  }
  // 切换激活状态
  if (btn) {
    btn.parentElement.querySelectorAll('.二类').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}
// 统一提交加仓/减仓
function _submitTrade(code, type) {
  const isAdd = type === 'add';
  const amountInput = document.getElementById(isAdd ? ('addAmount_' + code) : ('reduceShares_' + code));
  const dateInput = document.getElementById('addDate_' + code);
  const v = parseFloat(amountInput?.value);
  if (isNaN(v) || v <= 0) { showToast(isAdd ? '请输入有效金额' : '请输入有效份额', 'error'); return; }
  const date = dateInput?.value;
  if (!date) { showToast('请选择日期', 'error'); return; }
  const fund = funds.find(f => f.code === code);
  if (!isAdd && fund && v > getAvailableShares(fund)) { showToast('卖出份额超出可用份额', 'error'); return; }
  const timeType = _tradeTimeType[code] || 'before3';
  const fundName = fund?.name || code;
  const timeLabel = timeType === 'before3' ? '3点前' : '3点后';
  const label = isAdd ? '加仓' : '减仓';
  const unit = isAdd ? '元' : '份';
  showConfirm(`确认${label} ${fundName}\n${isAdd ? '金额' : '份额'}：${v}${unit}\n日期：${date.slice(2)} · ${timeLabel}`, async () => {
    await submitTradeRaw(code, type, date, timeType, v, isAdd);
    amountInput.value = '';
    renderTradeOpList(code, isAdd ? 'addOpList' : 'reduceOpList');
  });
}
function submitAddTrade(code) { _submitTrade(code, 'add'); }
function submitReduceTrade(code) { _submitTrade(code, 'reduce'); }
// 提交交易核心逻辑
async function submitTradeRaw(code, type, date, timeType, amount, isMoney) {
  const fund = funds.find(f => f.code === code);
  if (!fund) return;
  // 获取历史净值数据（用于交易日判断）
  if (!fund.history) {
    showToast('正在获取历史净值...', 'warning');
    await fetchFundHistory(code);
  }
  const op = await addFundOperation(code, type, date, timeType, amount, isMoney);
  if (!op) { showToast('操作失败', 'error'); return; }
  const typeLabel = type === 'add' ? '加仓' : '减仓';
  const unitLabel = isMoney ? '元' : '份';
  if (op.status === 'confirmed') {
    showToast(`${typeLabel} ${amount}${unitLabel}（${date}）已确认 · 净值${op.confirmNav}`, 'success');
  } else {
    showToast(`${typeLabel} ${amount}${unitLabel}（${date}）净值暂未更新，已加入待处理队列`, 'info');
  }
}
// ============ 独立加减仓弹窗 ============
function showTradeModal(code, type) {
  const isAdd = type === 'add';
  const fund = funds.find(f => f.code === code);
  const fundName = fund?.name || code;
  const today2 = todayStr();
  let html = `<div style="margin-bottom:10px;"><div style="font-size:var(--三类字体大小);color:var(--三类字体颜色);font-weight:500;">${safeHtml(fundName)}</div><div style="font-size:var(--二类字体大小);color:var(--三类字体颜色);margin-top:2px;">${safeHtml(code)}</div></div>`;
  if (isAdd) {
    html += `<div class="下距8"><label class="t-12 字段标签">加仓金额</label><input type="number" id="tradeModalAmount_${code}" placeholder="请输入金额" step="0.01" min="0" class="form-input" style="width:100%;box-sizing:border-box;"></div>`;
  } else {
    const pendingReduce = (fund?.operations || []).filter(o => o.status === 'pending' && o.type === 'reduce' && !o.isMoney).reduce((s, o) => s + (o.amount || 0), 0);
    const currentShares2 = (fund?.shares || 0).toFixed(2);
    const sharesInfoHtml = pendingReduce > 0
      ? `<div style="font-size:var(--三类字体大小);margin-bottom:6px;">当前持有 ${currentShares2} 份 · <span style="color:var(--四类字体颜色);">预扣 ${pendingReduce.toFixed(2)} 份</span></div>`
      : `<div style="font-size:var(--三类字体大小);margin-bottom:6px;">当前持有 ${currentShares2} 份</div>`;
    html += `<div class="下距8"><label class="t-12 字段标签">减仓份额</label><input type="number" id="tradeModalShares_${code}" placeholder="请输入卖出份额" step="0.01" min="0" class="form-input" style="width:100%;box-sizing:border-box;" oninput="var b=document.getElementById('tradeModalQuickBtns_${code}');if(b)b.querySelectorAll('.二类').forEach(function(x){x.classList.remove('active')})"></div>
      <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;" id="tradeModalQuickBtns_${code}"><button class="二类 字号11" onclick="(function(){var f=funds.find(function(x){return x.code==='${escapeHtml(code)}'});if(!f)return;var a=getAvailableShares(f);var e=document.getElementById('tradeModalShares_${escapeHtml(code)}');if(e&&a>0)e.value=(a*0.25).toFixed(2);var p=document.getElementById('tradeModalQuickBtns_${escapeHtml(code)}');if(p)p.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active')})()">1/4</button><button class="二类 字号11" onclick="(function(){var f=funds.find(function(x){return x.code==='${escapeHtml(code)}'});if(!f)return;var a=getAvailableShares(f);var e=document.getElementById('tradeModalShares_${escapeHtml(code)}');if(e&&a>0)e.value=(a/3).toFixed(2);var p=document.getElementById('tradeModalQuickBtns_${escapeHtml(code)}');if(p)p.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active')})()">1/3</button><button class="二类 字号11" onclick="(function(){var f=funds.find(function(x){return x.code==='${escapeHtml(code)}'});if(!f)return;var a=getAvailableShares(f);var e=document.getElementById('tradeModalShares_${escapeHtml(code)}');if(e&&a>0)e.value=(a*0.5).toFixed(2);var p=document.getElementById('tradeModalQuickBtns_${escapeHtml(code)}');if(p)p.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active')})()">1/2</button><button class="二类 字号11" onclick="(function(){var f=funds.find(function(x){return x.code==='${escapeHtml(code)}'});if(!f)return;var a=getAvailableShares(f);var e=document.getElementById('tradeModalShares_${escapeHtml(code)}');if(e&&a>0)e.value=a.toFixed(2);var p=document.getElementById('tradeModalQuickBtns_${escapeHtml(code)}');if(p)p.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active')})()">全部</button></div>
      ${sharesInfoHtml}`;
  }
  const timeActive = _tradeTimeType[code] || 'before3';
  html += `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
      <input type="date" id="tradeModalDate_${code}" value="${today2}" class="form-input" style="width:140px;">
      <div style="display:flex;gap:4px;">
        <button class="二类 ${timeActive==='before3'?'active':''}" onclick="setTradeTimeType('${escapeHtml(code)}','before3');this.parentElement.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active');">3点前</button>
        <button class="二类 ${timeActive==='after3'?'active':''}" onclick="setTradeTimeType('${escapeHtml(code)}','after3');this.parentElement.querySelectorAll('.二类').forEach(function(b){b.classList.remove('active')});this.classList.add('active');">3点后</button>
      </div>
    </div>
    <button class="三类" onclick="submitTradeModal('${escapeHtml(code)}','${type}')" style="width:100%;">确认${isAdd ? '加仓' : '减仓'}</button>`;
  var _origTradeTitle = document.getElementById('confirmTitle').textContent;
  document.getElementById('confirmTitle').textContent = isAdd ? '加仓' : '减仓';
  document.getElementById('confirmBody').innerHTML = html;
  document.getElementById('confirmBtn').style.display = 'none';
  confirmCallback = null;
  var _origClose = closeConfirmModal;
  closeConfirmModal = function() {
    document.getElementById('confirmBtn').style.display = '';
    document.getElementById('confirmTitle').textContent = _origTradeTitle;
    closeConfirmModal = _origClose;
    _origClose();
  };
  _openModal(document.getElementById('confirmModal'));
}
function submitTradeModal(code, type) {
  const isAdd = type === 'add';
  const inputId = isAdd ? 'tradeModalAmount_' + code : 'tradeModalShares_' + code;
  const v = parseFloat(document.getElementById(inputId)?.value);
  if (isNaN(v) || v <= 0) { showToast(isAdd ? '请输入有效金额' : '请输入有效份额', 'error'); return; }
  const date = document.getElementById('tradeModalDate_' + code)?.value;
  if (!date) { showToast('请选择日期', 'error'); return; }
  const fund = funds.find(f => f.code === code);
  if (!isAdd && fund && v > getAvailableShares(fund)) { showToast('卖出份额超出可用份额', 'error'); return; }
  const timeType = _tradeTimeType[code] || 'before3';
  submitTradeRaw(code, type, date, timeType, v, isAdd);
  document.getElementById('confirmBtn').style.display = '';
  closeAllModals();
  renderFunds();
}
// 渲染某基金的操作记录列表（支持指定容器ID）
function renderTradeOpList(code, containerId) {
  const container = document.getElementById((containerId || 'tradeOpList_') + code);
  if (!container) return;
  const fund = funds.find(f => f.code === code);
  var ops = [];
  if (fund && fund.operations) { ops = ops.concat(fund.operations); }
  funds.forEach(function(f){ if (f.code === code) return; (f.operations||[]).forEach(function(op){ if (op.type === 'convert' && op.inCode === code) ops.push(op); }); });
  if (!ops.length) { container.innerHTML = '<div class="t-12 居中对齐" style="padding:12px;">暂无操作记录</div>'; return; }
  let html = '<div style="font-size:var(--二类字体大小);font-weight:600;color:var(--三类字体颜色);margin-bottom:6px;">操作记录</div>';
  const sorted = [...ops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  setOpRefreshFn(() => renderTradeOpList(code, containerId));
  sorted.forEach(op => { html += _renderOpItem(op, { code, badge: false }); });
  container.innerHTML = html;
}
// ============ 全局操作记录弹窗 ============
function openGlobalOpList() {
  renderGlobalOpList();
  _openModal(document.getElementById('globalOpModal'));
}
function closeGlobalOpModal() {
  _closeModal(document.getElementById('globalOpModal'));
}
function renderGlobalOpList() {
  const container = document.getElementById('globalOpModalBody');
  let allOps = [];
  var addedConvertPairs = {};
  funds.forEach(fund => {
    if (!fund.operations || !fund.operations.length) return;
    fund.operations.forEach(op => {
      allOps.push({ ...op, fundName: fund.name || fund.code, fundCode: fund.code });
      if (op.type === 'convert') addedConvertPairs[op.id] = true;
    });
  });
  funds.forEach(function(fund) {
    funds.forEach(function(f2) {
      if (f2.code === fund.code) return;
      (f2.operations||[]).forEach(function(op) {
        if (op.type === 'convert' && op.inCode === fund.code && !addedConvertPairs[op.id]) {
          allOps.push({ ...op, fundName: fund.name || fund.code, fundCode: fund.code, _viewAsIn: true });
          addedConvertPairs[op.id] = true;
        }
      });
    });
  });
  const pendingCount = allOps.filter(op => op.status === 'pending').length;
  let html = '';
  if (pendingCount > 0) html += `<div style="font-size:var(--二类字体大小);color:var(--四类字体颜色);font-weight:600;margin-bottom:10px;background:var(--四类背景-按钮激活色);padding:8px 12px;border-radius:12px;">有 ${pendingCount} 笔待确认操作，将在下次刷新时自动确认</div>`;
  if (!allOps.length) { html += '<div class="居中对齐" style="font-size:var(--三类字体大小);color:var(--三类字体颜色);padding:40px;">暂无操作记录</div>'; container.innerHTML = html; return; }
  allOps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  setOpRefreshFn(() => renderGlobalOpList());
  allOps.forEach(op => { html += _renderOpItem(op, { showFundName: true, badge: true }); });
  container.innerHTML = html;
}
// ============ 指数/板块切换 ============
var _currentSectorType = 'industry';
var _sectorCache = { industry: null, concept: null };
var _sectorCacheTime = { industry: 0, concept: 0 };
var _sectorSort = { field: 'pct', asc: false };
function switchIndexBarTab(tab, btn) {
  var tabs = btn.parentElement.querySelectorAll('.指数-标签项');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');

  var cards = document.getElementById('indexCards');
  var panel = document.getElementById('sectorPanel');
  if (tab === 'index') {
    cards.style.display = '';
    panel.style.display = 'none';
    cards.parentElement.style.height = '';
  } else {
    var content = cards.parentElement;
    var h = content.getBoundingClientRect().height;
    content.style.height = h + 'px';
    cards.style.display = 'none';
    panel.style.display = '';
    panel.style.height = '100%';
    var header = document.getElementById('sectorHeader');
    var headerH = header ? header.getBoundingClientRect().height : 0;
    document.getElementById('sectorList').style.height = (h - headerH) + 'px';
    _currentSectorType = tab;
    loadSectorData(tab);
  }
}
function sortSector(field) {
  if (_sectorSort.field === field) {
    _sectorSort.asc = !_sectorSort.asc;
  } else {
    _sectorSort.field = field;
    _sectorSort.asc = field === 'name';
  }
  var arrows = document.querySelectorAll('#sectorHeader .sort-arrow');
  arrows.forEach(function(a) { a.textContent = ''; });
  var idx = { name: 0, pct: 1, flow: 2 }[field];
  if (arrows[idx]) arrows[idx].textContent = _sectorSort.asc ? '↑' : '↓';
  var cached = _sectorCache[_currentSectorType];
  if (cached) renderSectorList(cached);
}
var _sectorReqId = 0;
function loadSectorData(type) {
  var now = Date.now();
  if (_sectorCache[type] && now - _sectorCacheTime[type] < 10000) {
    renderSectorList(_sectorCache[type]);
    return;
  }
  var el = document.getElementById('sectorList');
  if (el) el.innerHTML = '<div class="居中对齐 状态提示">加载中...</div>';
  var reqId = ++_sectorReqId;
  var fs = type === 'industry' ? 'm:90+t:2' : 'm:90+t:3';
  var pageSize = 100;
  var allItems = [];
  var totalPages = 1;
  var loadedPages = 0;
  var failed = false;
  function fetchPage(page, onFirstPage) {
    var cbName = 'cbSector' + reqId + '_p' + page;
    var done = false;
    window[cbName] = function(d) {
      if (done) return;
      done = true;
      delete window[cbName];
      if (reqId !== _sectorReqId || failed) return;
      if (!d || !d.data || !d.data.diff) {
        failed = true;
        if (el) el.innerHTML = '<div class="居中对齐 状态提示">暂无数据</div>';
        return;
      }
      var raw = d.data.diff;
      var arr = Array.isArray(raw) ? raw : Object.values(raw);
      allItems = allItems.concat(arr.map(function(item) {
        return { name: item.f14, pct: item.f3 / 100, flow: item.f62, vol: item.f6, code: item.f12 };
      }));
      totalPages = Math.ceil((d.data.total || arr.length) / pageSize);
      loadedPages++;
      if (loadedPages >= totalPages) {
        var baseMap = {};
        allItems.forEach(function(item) {
          var base = item.name.replace(/[ⅡⅢ]$/, '');
          if (!baseMap[base]) baseMap[base] = [];
          baseMap[base].push(item);
        });
        var filtered = [];
        Object.keys(baseMap).forEach(function(base) {
          var group = baseMap[base];
          if (group.length > 1) {
            group.forEach(function(item) { if (!/Ⅲ$/.test(item.name)) filtered.push(item); });
          } else {
            filtered.push(group[0]);
          }
        });
        _sectorCache[type] = filtered;
        _sectorCacheTime[type] = Date.now();
        renderSectorList(filtered);
      } else if (onFirstPage) {
        onFirstPage();
      }
    };
    var url = 'https://push2delay.eastmoney.com/api/qt/clist/get?pn=' + page + '&pz=' + pageSize + '&fs=' + fs + '&fields=f3,f6,f12,f14,f62&cb=' + cbName;
    var s = document.createElement('script');
    s.src = url;
    s.onerror = function() {
      if (done) return;
      done = true;
      delete window[cbName];
      s.remove();
      if (!failed && el) {
        failed = true;
        el.innerHTML = '<div class="居中对齐 错误提示">加载失败，请检查网络</div>';
      }
    };
    s.onload = function() { s.remove(); };
    setTimeout(function() {
      if (done) return;
      done = true;
      delete window[cbName];
      if (document.body.contains(s)) s.remove();
      if (!failed && el) {
        failed = true;
        el.innerHTML = '<div class="居中对齐 错误提示">请求超时，请稍后重试</div>';
      }
    }, 10000);
    document.body.appendChild(s);
  }
  fetchPage(1, function() {
    if (reqId !== _sectorReqId || failed) return;
    for (var p = 2; p <= totalPages; p++) {
      fetchPage(p);
    }
  });
}
function renderSectorList(list) {
  var el = document.getElementById('sectorList');
  if (!el) return;
  var sorted = list.slice().sort(function(a, b) {
    var field = _sectorSort.field;
    var asc = _sectorSort.asc;
    if (field === 'name') {
      var cmp = (a.name || '').localeCompare(b.name || '');
      return asc ? cmp : -cmp;
    }
    var va = parseFloat(a[field]) || 0;
    var vb = parseFloat(b[field]) || 0;
    return asc ? va - vb : vb - va;
  });
  var html = '';
  sorted.forEach(function(item) {
    var pct = parseFloat(item.pct);
    var pctCls = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
    var sign = pct > 0 ? '+' : '';
    var flow = parseFloat(item.flow);
    var flowCls = flow > 0 ? 'up' : flow < 0 ? 'down' : 'flat';
    var flowSign = flow > 0 ? '+' : '';
    html += '<div class="板块-行">'
      + '<span class="sr-name">' + safeHtml(item.name) + '</span>'
      + '<span class="sr-pct ' + pctCls + '">' + sign + pct.toFixed(2) + '%</span>'
      + '<span class="sr-flow ' + flowCls + '">' + flowSign + formatMoney(flow,{compact:true,dash:true}) + '</span>'
      + '</div>';
  });
  el.innerHTML = html;
}
// ============ 关联板块 ============
function openSectorPanel() {
  const body = document.getElementById('sectorBody');
  const batchBody = document.getElementById('sectorBatchBody');
  // 重置到单个输入 tab
  switchSectorTab('single', document.querySelector('.板块-标签 .二类'));
  document.getElementById('sectorBatchInput').value = '';
  if (!funds.length) {
    body.innerHTML = '<div class="居中对齐" style="padding:30px;color:var(--三类字体颜色);">暂无基金</div>';
    batchBody.style.display = 'none';
  } else {
    const sorted = funds.slice().sort((a, b) => (a.priority || 0) - (b.priority || 0));
    let html = '';
    sorted.forEach(f => {
      const name = f.name || ('基金' + f.code);
      const sectors = (f.sectors || []).join('、');
      html += `<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--浅色边框);">
        <div style="flex:2;min-width:0;font-size:var(--三类字体大小);font-weight:600;color:var(--一类字体颜色);">
          <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeHtml(name)}</div>
          <div style="font-size:var(--二类字体大小);font-weight:400;color:var(--三类字体颜色);margin-top:2px;">${safeHtml(f.code)}</div>
        </div>
        <input type="text" class="页面-输入框" data-sector-code="${f.code}" value="${sectors}" style="flex:1;font-size:var(--二类字体大小);" />
      </div>`;
    });
    body.innerHTML = html;
  }
  _openModal(document.getElementById('sectorModal'));
}
function switchSectorTab(tab, btn) {
  document.querySelectorAll('.板块-标签 .二类').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // 切换内容区
  const body = document.getElementById('sectorBody');
  const batchBody = document.getElementById('sectorBatchBody');
  if (tab === 'single') {
    body.style.display = '';
    batchBody.style.display = 'none';
  } else {
    body.style.display = 'none';
    batchBody.style.display = '';
  }
}
function processBatchSectors() {
  const raw = document.getElementById('sectorBatchInput').value.trim();
  if (!raw) { showToast('请输入内容', 'error'); return; }
  if (!funds.length) { showToast('暂无基金数据', 'error'); return; }
  const lines = raw.split(/[\n\r]+/).filter(l => l.trim());
  let matched = 0, unmatched = 0;
  const sectorMap = {};
  lines.forEach(line => {
    const parts = line.trim().split(/[,\s，、\t]+/);
    if (parts.length < 2) { unmatched++; return; }
    const identifier = parts[0].trim();
    const sectorName = parts[1].trim();
    const byCode = funds.find(f => f.code === identifier);
    const byNameExact = funds.find(f => f.name === identifier);
    const byNameFuzzy = funds.find(f => f.name && f.name.includes(identifier));
    const fund = byCode || byNameExact || byNameFuzzy;
    if (!fund) { unmatched++; return; }
    matched++;
    if (!sectorMap[fund.code]) sectorMap[fund.code] = [];
    if (!sectorMap[fund.code].includes(sectorName)) {
      sectorMap[fund.code].push(sectorName);
    }
  });
  // 替换模式：匹配到的基金板块完全替换为本次导入的数据
  Object.keys(sectorMap).forEach(code => {
    const fund = funds.find(f => f.code === code);
    if (fund) fund.sectors = sectorMap[code];
  });
  saveFunds();
  closeSectorPanel();
  renderFunds();
  showToast(`批量导入完成：匹配 ${matched} 条，未匹配 ${unmatched} 条`, matched > 0 ? 'success' : 'error');
}
function closeSectorPanel() {
  _closeModal(document.getElementById('sectorModal'));
}
function saveSectors() {
  // 判断当前激活的是哪个 tab
  const activeTab = document.querySelector('.板块-标签 .二类.active');
  const isBatch = activeTab && activeTab.textContent.trim().includes('批量导入');
  if (isBatch) {
    // 批量导入 tab：直接处理 textarea 内容
    processBatchSectors();
    return;
  }
  // 单个输入 tab：逐条读取 input 数据
  const inputs = document.querySelectorAll('[data-sector-code]');
  inputs.forEach(inp => {
    const code = inp.dataset.sectorCode;
    const fund = funds.find(f => f.code === code);
    if (!fund) return;
    const raw = inp.value.trim();
    fund.sectors = raw ? raw.split(/[,，、\s]+/).filter(Boolean) : [];
  });
    saveFunds();
    recordDailyProfits();
    renderFunds();
  closeSectorPanel();
  showToast('板块关联已保存', 'success');
}
function editFundSectorInline(code) {
  const el = document.getElementById('inlineSector_' + code);
  if (!el || el.querySelector('input')) return;
  const fund = funds.find(f => f.code === code);
  if (!fund) return;
  const oldVal = (fund.sectors || []).join(' ');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldVal;
  input.style.cssText = 'width:100%;font-size:var(--二类字体大小);font-weight:500;color:var(--一类字体颜色);background:var(--二类背景-卡片表格输入框);border:1px solid var(--四类字体颜色);border-radius:6px;padding:2px 6px;box-sizing:border-box;';
  el.innerHTML = '';
  el.appendChild(input);
  input.focus();
  input.select();
  var saving = false;
  var save = function() {
    if (saving) return; saving = true;
    var raw = input.value.trim();
    fund.sectors = raw ? raw.split(/[,，、\s]+/).filter(Boolean) : [];
    saveFunds();
    renderFunds();
    var newVal = (fund.sectors || []).join(' ') || '--';
    var parentDiv = el.parentElement;
    if (parentDiv) {
      parentDiv.innerHTML = '<span class="t-10">关联板块</span><br><span id="inlineSector_' + code.replace(/'/g,"\\'") + '" class="信息值" onclick="event.stopPropagation();editFundSectorInline(\'' + code.replace(/'/g,"\\'") + '\')">' + safeHtml(newVal) + '</span>';
    }
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { input.blur(); } });
}
// ============ 每日收益日历（三视图） ============
var _dpViewTab = 'day';
var _dpCursorYear = new Date().getFullYear();
var _dpCursorMonth = new Date().getMonth();
function openDailyProfitsModal() {
  _dpViewTab = 'day'; _dpCursorYear = new Date().getFullYear(); _dpCursorMonth = new Date().getMonth();
  renderDailyProfitsModal();
  _openModal(document.getElementById('dailyProfitsModal'));
}
function closeDailyProfitsModal() {
  _closeModal(document.getElementById('dailyProfitsModal'));
}
function dpSetView(tab) {
  _dpViewTab = tab;
  if (tab === 'month' || tab === 'year') _dpCursorYear = new Date().getFullYear();
  if (tab === 'day') _dpCursorMonth = new Date().getMonth();
  renderDailyProfitsModal();
}
function dpPrev() {
  if (_dpViewTab === 'day') { _dpCursorMonth--; if (_dpCursorMonth < 0) { _dpCursorMonth = 11; _dpCursorYear--; } }
  else { _dpCursorYear--; }
  renderDailyProfitsModal();
}
function dpNext() {
  var now = new Date();
  if (_dpViewTab === 'day') {
    var nm = _dpCursorMonth + 1, ny = _dpCursorYear;
    if (nm > 11) { nm = 0; ny++; }
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth())) return;
    _dpCursorMonth = nm; _dpCursorYear = ny;
  } else {
    if (_dpCursorYear >= now.getFullYear()) return;
    _dpCursorYear++;
  }
  renderDailyProfitsModal();
}
function renderDailyProfitsModal() {
  var profits = getDailyProfits();
  var series = [];
  for (var date in profits) { var t = 0; for (var c in profits[date]) t += profits[date][c]; if (t !== 0) series.push({ date: date, earnings: t }); }
  var now = new Date();
  var html = '';
  // 视图标签
  var tabs = [{ id: 'day', label: '日' }, { id: 'month', label: '月' }, { id: 'year', label: '年' }];
  html += '<div class="dp-view-tabs">';
  for (var ti = 0; ti < tabs.length; ti++) {
    var t = tabs[ti];
    html += '<span class="dp-view-tab' + (_dpViewTab === t.id ? ' active' : '') + '" onclick="dpSetView(\'' + t.id + '\')">' + t.label + '</span>';
  }
  html += '</div>';
  if (_dpViewTab === 'day') {
    // ====== 日视图 ======
    var year = _dpCursorYear, month = _dpCursorMonth;
    html += '<div class="dp-header"><button class="五类 dp-nav" onclick="dpPrev()">‹</button><span class="dp-title">' + year + '年' + (month + 1) + '月</span><button class="五类 dp-nav" onclick="dpNext()">›</button></div>';
    var prefix = year + '-' + pad(month + 1), monthSum = 0, dayProfits = {};
    for (var si = 0; si < series.length; si++) {
      if (series[si].date.indexOf(prefix) === 0) { dayProfits[parseInt(series[si].date.slice(8))] = series[si].earnings; monthSum += series[si].earnings; }
    }
    var sc = monthSum > 0 ? 'up' : monthSum < 0 ? 'down' : 'zero';
    html += '<div class="dp-month-sum"><span class="' + sc + '">' + year + '年' + (month + 1) + '月合计 ' + (monthSum >= 0 ? '+' : '') + monthSum.toFixed(2) + '</span></div>';
    var firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
    var wl = ['日','一','二','三','四','五','六'];
    html += '<table class="dp-cal"><tr>';
    for (var w = 0; w < 7; w++) html += '<th class="dp-wd">' + wl[w] + '</th>';
    html += '</tr><tr>';
    for (var i = 0; i < firstDay; i++) html += '<td class="dp-empty"></td>';
    for (var d = 1; d <= daysInMonth; d++) {
      var tf = now.getFullYear() === year && now.getMonth() === month && now.getDate() === d;
      var fu = new Date(year, month, d) > now;
      var pv = dayProfits[d], hp = pv !== undefined;
      var tn = hp ? (pv > 0 ? 'up' : pv < 0 ? 'down' : 'zero') : 'zero';
      var bg = !fu ? ' dp-bg-' + tn : '';
      html += '<td class="dp-day' + (tf ? ' dp-today' : '') + (fu ? ' dp-future' : '') + bg + '">';
      html += '<div class="dp-day-num">' + (tf ? '今' : d) + '</div>';
      if (hp && !fu) html += '<div class="dp-day-val ' + tn + '">' + (pv >= 0 ? '+' : '') + pv.toFixed(2) + '</div>';
      else if (!fu && !hp) html += '<div class="dp-day-val dp-day-val-zero">0.00</div>';
      html += '</td>';
      if ((firstDay + d) % 7 === 0 && d < daysInMonth) html += '</tr><tr>';
    }
    var lc = (firstDay + daysInMonth) % 7;
    if (lc > 0) for (var i = lc; i < 7; i++) html += '<td class="dp-empty"></td>';
    html += '</tr></table>';
  } else if (_dpViewTab === 'month') {
    // ====== 月视图 ======
    var year = _dpCursorYear;
    html += '<div class="dp-header"><button class="五类 dp-nav" onclick="dpPrev()">‹</button><span class="dp-title">' + year + '年</span><button class="五类 dp-nav" onclick="dpNext()">›</button></div>';
    var mt = [0,0,0,0,0,0,0,0,0,0,0,0], ys = 0;
    for (var si = 0; si < series.length; si++) {
      if (series[si].date.indexOf(year + '-') === 0) { var mi = parseInt(series[si].date.slice(5,7)) - 1; mt[mi] += series[si].earnings; }
    }
    for (var mi = 0; mi < 12; mi++) ys += mt[mi];
    var ysc = ys > 0 ? 'up' : ys < 0 ? 'down' : 'zero';
    html += '<div class="dp-month-sum"><span class="' + ysc + '">' + year + '年合计 ' + (ys >= 0 ? '+' : '') + ys.toFixed(2) + '</span></div>';
    html += '<div class="dp-month-grid">';
    for (var mi = 0; mi < 12; mi++) {
      var mf = now.getFullYear() < year || (now.getFullYear() === year && mi > now.getMonth());
      var mc = mt[mi] > 0 ? 'up' : mt[mi] < 0 ? 'down' : 'zero';
      html += '<div class="dp-m-cell' + (mf ? ' dp-m-future' : '') + '"><div class="dp-m-label">' + (mi + 1) + '月</div>';
      if (!mf) html += '<div class="dp-m-val ' + mc + '">' + (mt[mi] >= 0 ? '+' : '') + mt[mi].toFixed(2) + '</div>';
      else html += '<div class="dp-m-val dp-m-val-none">—</div>';
      html += '</div>';
    }
    html += '</div>';
  } else if (_dpViewTab === 'year') {
    // ====== 年视图 ======
    html += '<div class="dp-header"><span class="dp-title">历年收益</span></div>';
    var ym = {};
    for (var si = 0; si < series.length; si++) { var y = series[si].date.slice(0,4); ym[y] = (ym[y] || 0) + series[si].earnings; }
    var yk = Object.keys(ym).sort().reverse();
    if (yk.length === 0) { html += '<div class="dp-empty-state">暂无每日收益记录</div>'; }
    else {
      html += '<div class="dp-year-list">';
      for (var yi = 0; yi < yk.length; yi++) {
        var yv = ym[yk[yi]], yc = yv > 0 ? 'up' : yv < 0 ? 'down' : 'zero';
        html += '<div class="dp-y-row"><span class="dp-y-label">' + yk[yi] + '年</span><span class="dp-y-val ' + yc + '">' + (yv >= 0 ? '+' : '') + yv.toFixed(2) + '</span></div>';
      }
      html += '</div>';
    }
  }
  document.getElementById('dailyProfitsBody').innerHTML = html;
}
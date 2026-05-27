// ============================================================
// 指数图 / 基金图 —— 图表核心代码（独立文件，勿随意修改）
// 依赖：Chart.js（全局）、工具函数.js（formatDate）、主逻辑.js（funds、_indexPeriodChanged）
// ============================================================
function _arrMin(arr){var m=Infinity;for(var i=0;i<arr.length;i++)if(arr[i]<m)m=arr[i];return m;}
function _arrMax(arr){var m=-Infinity;for(var i=0;i<arr.length;i++)if(arr[i]>m)m=arr[i];return m;}

function _getAxisColor() {
  return getComputedStyle(document.body).getPropertyValue('--四类字体颜色').trim() || '#6b7b8d';
}

// ---- 公共工具 ----
function _presetCanvasSize(canvas) {
  if (!canvas) return;
  var pw = canvas.parentElement ? canvas.parentElement.offsetWidth : 0;
  var ph = canvas.parentElement ? canvas.parentElement.offsetHeight : 0;
  if (pw > 0 && ph > 0) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = pw * dpr;
    canvas.height = ph * dpr;
    canvas.style.width = pw + 'px';
    canvas.style.height = ph + 'px';
  }
  void canvas.offsetHeight; // 强制重排，确保移动端动画正常
}
function $ic(el, txt, clr) {
  if (!el) return;
  el.textContent = txt;
  if (clr) el.style.color = clr;
}
function calcPct(currVal, prevVal) {
  if (!prevVal || prevVal === 0) return { txt: '', clr: '' };
  const chgVal = ((currVal - prevVal) / prevVal * 100);
  const absVal = Math.abs(chgVal);
  if (absVal < 0.005) return { txt: '涨幅 0.00%', clr: 'var(--三类字体颜色)' };
  const sign = chgVal > 0 ? '+' : '-';
  return { txt: `涨幅 ${sign}${absVal.toFixed(2)}%`, clr: chgVal > 0 ? 'var(--五类字体颜色)' : 'var(--六类字体颜色)' };
}

// ============================================================
// 基金业绩走势图
// ============================================================

const _trendPlugin = {
  id: 'trendMarkersCrosshair',
  afterDraw(chart) {
    const { ctx, chartArea, scales: { x: xSc, y: ySc } } = chart;
    if (!chartArea) return;
    const { top, bottom, left, right } = chartArea;
    const isDark = document.body.classList.contains('dark');
    // 0%基准线 + Y轴刻度标签
    if (chart._baseVal != null && ySc) {
      var bv = chart._baseVal;
      var yMinVal = ySc.min;
      var yMaxVal = ySc.max;
      var baseY = top + (bottom - top) * (bv - ySc.min) / (ySc.max - ySc.min || 1);
      // 最高点、最低点、0%基准线
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(right, top); ctx.stroke();
      if (baseY >= top && baseY <= bottom) { ctx.beginPath(); ctx.moveTo(left, baseY); ctx.lineTo(right, baseY); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.stroke();
      ctx.restore();
      // 3个刻度标签
      ctx.save();
      ctx.fillStyle = chart._axisColor || '#6b7b8d';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      var lx = left + 4;
      ctx.textBaseline = 'middle'; ctx.fillText(((yMaxVal - bv) / bv * 100).toFixed(2) + '%', lx, top);
      ctx.textBaseline = 'middle'; ctx.fillText('0.00%', lx, baseY);
      ctx.textBaseline = 'middle'; ctx.fillText(((yMinVal - bv) / bv * 100).toFixed(2) + '%', lx, bottom);
      ctx.restore();
    }
    // 买卖标记
    if (chart._markers && chart._markers.length) {
      chart._markers.forEach(m => {
        const px = xSc.getPixelForValue(m.x);
        const py = ySc.getPixelForValue(m.y);
        if (px >= left && px <= right && py >= top && py <= bottom) {
          ctx.fillStyle = m.type === 'add' ? '#ef4444' : '#22c55e';
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
          ctx.lineWidth = 0.8; ctx.stroke();
        }
      });
    }
    // 十字线
    if (chart._ch && chart._ch.active) {
      const { idx } = chart._ch;
      const raw = chart._rawData;
      if (idx == null || idx < 0 || !raw || idx >= raw.length) return;
      const dataX = xSc.getPixelForValue(idx);
      const dataY = ySc.getPixelForValue(raw[idx].value);
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.6)' : 'rgba(71,85,105,0.5)';
      ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(dataX, top); ctx.lineTo(dataX, bottom); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
      ctx.beginPath(); ctx.arc(dataX, dataY, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // 成本线（plugin 画保证在最上层）
    if (chart._costNav != null) {
      const costY = ySc.getPixelForValue(chart._costNav);
      if (costY >= top && costY <= bottom) {
        ctx.save();
        ctx.strokeStyle = isDark ? '#f59e0b' : '#d97706';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(left, costY);
        ctx.lineTo(right, costY);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
};

// 公共：趋势图数据准备（裁切、Y轴、涨跌幅、标记）
function prepareTrendData(data, period, costNav, code) {
  if (!data || !data.length) return null;
  const latestDate = data[data.length - 1].date;
  const [ly, lm, ld] = latestDate.split('-').map(Number);
  const cutoffBase = new Date(ly, lm - 1, ld);
  cutoffBase.setMonth(cutoffBase.getMonth() - period);
  const cutoffDate = formatDate(cutoffBase);
  let baseIdx = 0;
  for (let i = data.length - 1; i >= 0; i--) { if (data[i].date <= cutoffDate) { baseIdx = i; break; } }
  const baseNav = data[baseIdx]?.value || 0;
  if (baseNav <= 0) return null;
  const recent = data.slice(baseIdx).filter(d => d && d.value > 0);
  if (recent.length < 2) return null;
  const navs = recent.map(d => d.value);
  const baseVal = navs[0];
  if (!costNav || isNaN(costNav) || costNav <= 0) {
    costNav = (_arrMin(navs) + _arrMax(navs)) / 2;
  }
  const pcts = navs.map(v => ((v - baseVal) / baseVal) * 100);
  // Y轴对称：以基准线为中心，上下取最大偏差
  const maxDev = Math.max(_arrMax(navs) - baseVal, baseVal - _arrMin(navs));
  const yMin = baseVal - maxDev;
  const yMax = baseVal + maxDev;
  const labels = recent.map(d => d.date.slice(2));
  // 更新涨跌幅显示
  const lastPct = pcts[pcts.length - 1];
  const pctEl = document.querySelector(`.period-change[data-code="${code}"]`);
  if (pctEl) {
    const cl = lastPct >= 0 ? 'up' : 'down';
    pctEl.className = 'period-change';
    pctEl.innerHTML = `<span class="基金-标签">本基金</span> <span class="基金-涨跌幅 ${cl}">${lastPct >= 0 ? '+' : ''}${lastPct.toFixed(2)}%</span>`;
  }
  // 计算买卖标记
  const fund = funds.find(f => f.code === code);
  const markers = [];
  if (fund && fund.operations && fund.operations.length) {
    const ops = fund.operations.filter(op => (op.type === 'add' || op.type === 'reduce') && op.status !== 'cancelled');
    ops.forEach(op => {
      const opDateStr = op.date.slice(0, 10);
      for (let i = 0; i < recent.length; i++) {
        if (recent[i].date === opDateStr) { markers.push({ x: i, y: recent[i].value, type: op.type }); break; }
      }
    });
  }
  return { recent, navs, baseVal, yMin, yMax, labels, costNav, markers };
}

// 创建 / 重建趋势图
function createTrendChart(canvas, data, period, costNav) {
  if (!canvas || !data || !data.length) return null;
  period = period || parseInt(canvas.dataset.period) || 1;
  const code = canvas.dataset.code;
  const pd = prepareTrendData(data, period, costNav, code);
  if (!pd) return null;
  const { recent, navs, baseVal, yMin, yMax, labels, costNav: cn, markers } = pd;
  const isDark = document.body.classList.contains('dark');
  const lineColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          data: navs,
          borderColor: lineColor,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.chartArea?.bottom || 200);
            g.addColorStop(0, isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
            g.addColorStop(1, isDark ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)');
            return g;
          },
          fill: 'start',
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 1.5,
          tension: 0.2,
          clip: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { left: 10, right: 10, top: 20, bottom: 0 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          type: 'category',
          offset: true,
          grid: { display: false, drawBorder: false },
          afterBuildTicks: function(axis) {
            var len = axis.chart.data.labels.length;
            var mid = Math.floor((len - 1) / 2);
            axis.ticks = [
              { value: 0, label: axis.chart.data.labels[0] },
              { value: mid, label: axis.chart.data.labels[mid] },
              { value: len - 1, label: axis.chart.data.labels[len - 1] },
            ];
          },
          ticks: { color: _getAxisColor(), font: { size: 10 }, maxRotation: 0, padding: 12, align: 'inner' },
          border: { display: false },
        },
        y: {
          display: false,
          min: yMin,
          max: yMax,
        },
      },
    },
    plugins: [_trendPlugin],
  };
  // 销毁旧实例
  const old = Chart.getChart(canvas);
  if (old) old.destroy();
  // 预设 canvas 尺寸，防止 Chart.js 读到错误尺寸导致动画闪烁
  _presetCanvasSize(canvas);
  const chart = new Chart(canvas.getContext('2d'), config);
  chart._axisColor = _getAxisColor();
  chart._rawData = recent;
  chart._baseVal = baseVal;
  chart._period = period;
  chart._costNav = cn;
  chart._markers = markers;
  // 绑定十字线事件（先移除旧监听器防泄漏）
  canvas.removeEventListener('mousemove', _onTrendMouseMove);
  canvas.removeEventListener('mouseleave', _onTrendMouseLeave);
  canvas.removeEventListener('touchstart', _onTrendTouchStart);
  canvas.removeEventListener('touchmove', _onTrendTouchMove);
  canvas.removeEventListener('touchend', _onTrendTouchEnd);
  canvas.removeEventListener('click', _noopClick);
  canvas.addEventListener('mousemove', _onTrendMouseMove);
  canvas.addEventListener('mouseleave', _onTrendMouseLeave);
  canvas.addEventListener('touchstart', _onTrendTouchStart, { passive: false });
  canvas.addEventListener('touchmove', _onTrendTouchMove, { passive: false });
  canvas.addEventListener('touchend', _onTrendTouchEnd, { passive: false });
  canvas.addEventListener('click', _noopClick);
  chart.resize();
  chart.draw();
  return chart;
}

// 更新已有趋势图数据（带动画过渡）
function updateTrendChart(canvas, data, period, costNav) {
  const chart = Chart.getChart(canvas);
  if (!chart || !data || !data.length) return createTrendChart(canvas, data, period, costNav);
  period = period || parseInt(canvas.dataset.period) || 1;
  const code = canvas.dataset.code;
  const pd = prepareTrendData(data, period, costNav, code);
  if (!pd) return chart;
  const { recent, navs, baseVal, yMin, yMax, labels, costNav: cn, markers } = pd;
  chart.data.labels = labels;
  chart.data.datasets[0].data = navs;
  chart.options.scales.y.min = yMin;
  chart.options.scales.y.max = yMax;
  chart._rawData = recent;
  chart._baseVal = baseVal;
  chart._period = period;
  chart._costNav = cn;
  chart._markers = markers;
  chart.update();
  return chart;
}

// ---- 基金图十字线事件处理（RAF节流） ----
var _chRafId = null, _chPendingCanvas = null, _chPendingX = 0;
function _updateCrosshair(canvas, clientX) {
  _chPendingCanvas = canvas;
  _chPendingX = clientX;
  if (_chRafId) return;
  _chRafId = requestAnimationFrame(function() {
    _chRafId = null;
    var c = _chPendingCanvas, cx = _chPendingX;
    if (!c) return;
    var chart = Chart.getChart(c);
    if (!chart || !chart._rawData || !chart._rawData.length) return;
    var rect = c.getBoundingClientRect();
    var mx = cx - rect.left;
    var xSc = chart.scales.x;
    if (!xSc) return;
    var xVal = xSc.getValueForPixel(mx);
    var idx = Math.round(xVal);
    var raw = chart._rawData;
    if (idx < 0 || idx >= raw.length) return;
    chart._ch = { active: true, idx: idx };
    var dp = raw[idx];
    var code = c.dataset.code;
    var tooltip = document.getElementById('tooltip_' + code);
    if (tooltip && dp) {
      var pct = ((dp.value - chart._baseVal) / chart._baseVal) * 100;
      var dateStr = dp.date.slice(5);
      var label = dateStr + '  ' + (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
      tooltip.textContent = label;
      var canvasRect = c.getBoundingClientRect();
      var parentRect = tooltip.parentElement.getBoundingClientRect();
      var offset = canvasRect.left - parentRect.left;
      var tLeft = mx + offset;
      var tw = tooltip.offsetWidth || 130;
      var cLeft = offset, cRight = offset + canvasRect.width;
      tLeft = Math.max(cLeft + tw / 2, Math.min(cRight - tw / 2, tLeft));
      tooltip.style.left = tLeft + 'px';
      tooltip.classList.add('visible');
    }
    chart.draw();
  });
}
function _clearCrosshair(canvas) {
  const chart = Chart.getChart(canvas);
  if (chart) { chart._ch = { active: false }; chart.draw(); }
  const code = canvas.dataset.code;
  const tooltip = document.getElementById('tooltip_' + code);
  if (tooltip) tooltip.classList.remove('visible');
}
function _onTrendMouseMove(e) {
  const canvas = e.currentTarget;
  canvas._touchActive = false;
  _updateCrosshair(canvas, e.clientX);
}
function _onTrendMouseLeave(e) {
  _clearCrosshair(e.currentTarget);
}
function _noopClick(e) { e.stopPropagation(); }
function _onTrendTouchStart(e) {
  e.preventDefault();
  const canvas = e.currentTarget;
  canvas._touchActive = true;
  if (e.touches[0]) _updateCrosshair(canvas, e.touches[0].clientX);
}
function _onTrendTouchMove(e) {
  e.preventDefault();
  const canvas = e.currentTarget;
  if (!canvas._touchActive) return;
  if (e.touches[0]) _updateCrosshair(canvas, e.touches[0].clientX);
}
function _onTrendTouchEnd(e) {
  e.preventDefault();
  const canvas = e.currentTarget;
  canvas._touchActive = false;
  setTimeout(() => { if (!canvas._touchActive) _clearCrosshair(canvas); }, 1500);
}

// ---- 加载状态 ----
function showChartLoading(code, show) {
  const loading = document.getElementById('chartLoading_' + code);
  if (loading) {
    if (show) loading.classList.remove('hidden');
    else loading.classList.add('hidden');
  }
}

// ============================================================
// 指数折线图
// ============================================================

// A股交易时段: 9:30-11:30 (120min) + 13:00-15:00 (120min) = 240min
const TOTAL_SESSION_MIN = 240;
function _sessionMinute(timeStr) {
  var p = timeStr.slice(-5).split(':');
  var h = parseInt(p[0]), m = parseInt(p[1]);
  var absMin = h * 60 + m;
  if (absMin >= 13 * 60) return absMin - (9 * 60 + 30) - 90;
  return absMin - (9 * 60 + 30);
}
var _pendingIndexRender = false;
var _indexRenderSeq = 0;
var _indexChartInstance = null;

function drawIndexChart(canvas, points, isTrend, color, preClose, period) {
  try {
    if (!canvas || points.length < 2) { return; }
    var isDark = document.body.classList.contains('dark');
    var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    var axisColor = _getAxisColor();
    var old = Chart.getChart(canvas);
    var _showAnim = _indexPeriodChanged;
    _indexPeriodChanged = false;
    if (old) old.destroy();
    _indexChartInstance = null;
    canvas.style.opacity = '1';
    _presetCanvasSize(canvas);
    var allPrices, minY, maxY;
    if (isTrend) {
      allPrices = points.map(function(p) { return p.price; });
    } else {
      allPrices = points.flatMap(function(p) { return [p.high, p.low]; });
    }
    if (isTrend) {
      var baseVal = preClose > 0 ? preClose : allPrices[0];
      var maxDev = 0;
      allPrices.forEach(function(v) { var d = Math.abs(v - baseVal); if (d > maxDev) maxDev = d; });
      if (maxDev < 0.001) maxDev = baseVal * 0.01;
      minY = baseVal - maxDev;
      maxY = baseVal + maxDev;
    } else {
      minY = Math.min.apply(null, allPrices);
      maxY = Math.max.apply(null, allPrices);
      var rng = (maxY - minY) || 1;
      minY -= rng * 0.05; maxY += rng * 0.05;
    }
    var datasets = [];
    if (isTrend) {
      var tdDays = [], tdGroups = [], tdPrevCloses = [];
      if (period === 'trend5') {
        points.forEach(function(p) {
          var d = p.time.slice(0, 10);
          if (tdGroups.length === 0 || tdDays[tdDays.length-1] !== d) { tdDays.push(d); tdGroups.push([]); }
          tdGroups[tdGroups.length-1].push(p);
        });
        if (tdDays.length > 5) { tdDays = tdDays.slice(tdDays.length-5); tdGroups = tdGroups.slice(tdGroups.length-5); }
        for (var tdi = 0; tdi < tdGroups.length; tdi++) {
          tdPrevCloses.push(tdi === 0 ? (preClose > 0 ? preClose : tdGroups[0][0].price) : tdGroups[tdi-1][tdGroups[tdi-1].length-1].price);
        }
        var tdLen = tdDays.length;
        for (var di = 0; di < tdGroups.length; di++) {
          var dps = tdGroups[di];
          var dayLast = dps[dps.length - 1].price;
          var dayPrev = tdPrevCloses[di] > 0 ? tdPrevCloses[di] : dayLast;
          var dayColor = dayLast >= dayPrev ? '#ef4444' : '#22c55e';
          var dayData = [];
          dps.forEach(function(p) {
            var sm = Math.max(0, Math.min(TOTAL_SESSION_MIN, _sessionMinute(p.time)));
            var xPos = (di / tdLen + sm / TOTAL_SESSION_MIN / tdLen) * TOTAL_SESSION_MIN * tdLen;
            dayData.push({ x: xPos, y: p.price });
          });
          datasets.push({
            data: dayData, borderColor: dayColor, borderWidth: 2, pointRadius: 0, pointHoverRadius: 0,
            fill: true, tension: 0.2,
            backgroundColor: function(c) {
              var area = c.chart.chartArea;
              if (!area) return c.dataset.borderColor + '30';
              var g = c.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
              g.addColorStop(0, c.dataset.borderColor + '30');
              g.addColorStop(1, c.dataset.borderColor + '05');
              return g;
            }
          });
        }
      } else {
        var chartData = points.map(function(p) {
          var sm = Math.max(0, Math.min(TOTAL_SESSION_MIN, _sessionMinute(p.time)));
          return { x: sm, y: p.price };
        });
        datasets.push({
          data: chartData, borderColor: color, borderWidth: 2, pointRadius: 0, pointHoverRadius: 0,
          fill: true, tension: 0.2,
          backgroundColor: function(ctx) {
            var area = ctx.chart.chartArea;
            if (!area) return color + '30';
            var g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            g.addColorStop(0, color + '30');
            g.addColorStop(1, color + '05');
            return g;
          }
        });
      }
    } else {
      var bodyData = points.map(function(p) { return [Math.min(p.open, p.close), Math.max(p.open, p.close)]; });
      var barBgColors = points.map(function(p) { return p.close >= p.open ? '#ef4444' : '#22c55e'; });
      var wickColors = points.map(function(p) { return p.close >= p.open ? '#b91c1c' : '#15803d'; });
      var wickPlugin = {
        id: 'candleWick',
        beforeDatasetsDraw: function(chart) {
          var meta = chart.getDatasetMeta(0);
          var ctx2 = chart.ctx;
          meta.data.forEach(function(el, i) {
            var p = points[i];
            ctx2.save();
            ctx2.strokeStyle = wickColors[i];
            ctx2.lineWidth = 1;
            ctx2.beginPath();
            ctx2.moveTo(el.x, chart.scales.y.getPixelForValue(p.high));
            ctx2.lineTo(el.x, chart.scales.y.getPixelForValue(p.low));
            ctx2.stroke();
            ctx2.restore();
          });
        }
      };
      datasets.push({
        data: bodyData, backgroundColor: barBgColors, borderColor: barBgColors,
        borderWidth: 1, barPercentage: 0.7, categoryPercentage: 0.8
      });
    }
    var crosshairState = { globalIdx: -1, dsIdx: 0, localIdx: 0 };
    var _origPoints = points, _origIsTrend = isTrend, _origPeriod = period, _origPreClose = preClose;
    var crosshairPlugin = {
      id: 'indexCrosshair',
      afterEvent: function(chart, args) {
        var event = args.event;
        if (event.type === 'mousemove' || event.type === 'click') {
          var x = event.x;
          var xScale = chart.scales.x;
          if (xScale && x >= xScale.left) {
            var val = xScale.getValueForPixel(x);
            var globalIdx = -1, dsIdx = 0, localIdx = 0;
            if (isTrend) {
              var bestDist = Infinity;
              var globalOffset = 0;
              var dataDsCount = chart.data.datasets.length;
              for (var di = 0; di < dataDsCount; di++) {
                var ds = chart.data.datasets[di];
                if (!ds || !ds.data) continue;
                for (var i = 0; i < ds.data.length; i++) {
                  var pt = ds.data[i];
                  var t = pt && (pt.t !== undefined ? pt.t : pt.x);
                  if (t == null) continue;
                  var d = Math.abs(t - val);
                  if (d < bestDist) { bestDist = d; globalIdx = globalOffset + i; dsIdx = di; localIdx = i; }
                }
                globalOffset += ds.data.length;
              }
            } else {
              globalIdx = Math.round(val);
              globalIdx = Math.max(0, Math.min(points.length - 1, globalIdx));
            }
            if (globalIdx >= 0) { crosshairState = { globalIdx: globalIdx, dsIdx: dsIdx, localIdx: localIdx }; } else { crosshairState.globalIdx = -1; }
          }
        } else if (event.type === 'mouseout') {
          crosshairState.globalIdx = -1;
          _updateICInfo(_origPoints, _origPoints.length - 1, _origIsTrend, _origPeriod, _origPreClose);
        }
      },
      afterDraw: function(chart) {
        if (crosshairState.globalIdx < 0) return;
        var ctx2 = chart.ctx;
        var chartArea = chart.chartArea;
        var el;
        if (isTrend) {
          var meta = chart.getDatasetMeta(crosshairState.dsIdx);
          el = meta.data[crosshairState.localIdx];
        } else {
          el = chart.getDatasetMeta(0).data[crosshairState.globalIdx];
        }
        if (!el) return;
        ctx2.save();
        ctx2.setLineDash([4, 3]);
        ctx2.strokeStyle = isDark ? 'rgba(148,163,184,0.6)' : 'rgba(71,85,105,0.5)';
        ctx2.lineWidth = 1;
        ctx2.beginPath(); ctx2.moveTo(el.x, chartArea.top); ctx2.lineTo(el.x, chartArea.bottom); ctx2.stroke();
        ctx2.setLineDash([]);
        ctx2.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
        ctx2.beginPath(); ctx2.arc(el.x, el.y, 2.5, 0, Math.PI * 2); ctx2.fill();
        ctx2.restore();
        _updateICInfo(_origPoints, crosshairState.globalIdx, _origIsTrend, _origPeriod, _origPreClose);
      }
    };
    var xMin = 0, xMax = TOTAL_SESSION_MIN;
    if (isTrend && period === 'trend5') {
      xMax = TOTAL_SESSION_MIN * tdDays.length;
    }
    _indexChartInstance = new Chart(canvas, {
      type: isTrend ? 'line' : 'bar',
      data: isTrend ? { datasets: datasets } : {
        labels: points.map(function(p) { return p.time.slice(2); }),
        datasets: datasets
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: _showAnim ? { duration: 1000, easing: 'easeOutQuart' } : false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        layout: { padding: { left: 4, right: 4 } },
        scales: {
          x: isTrend ? {
            type: 'linear', min: xMin, max: xMax,
            grid: { display: false }, border: { display: false },
            afterBuildTicks: period === 'trend5' ? function(axis) {
              var ticks = [];
              for (var di = 0; di < tdDays.length; di++) {
                ticks.push((di + 0.5) * TOTAL_SESSION_MIN);
              }
              axis.ticks = ticks.map(function(v) { return { value: v }; });
            } : undefined,
            ticks: { color: axisColor, font: { size: 9 }, maxRotation: 0, autoSkip: false, align: period === 'trend5' ? 'center' : 'inner', stepSize: period === 'trend5' ? TOTAL_SESSION_MIN : 120,
              callback: function(val) {
                if (period === 'trend5') {
                  for (var di = 0; di < tdDays.length; di++) {
                    if (Math.abs(val - (di + 0.5) * TOTAL_SESSION_MIN) < 1) {
                      return (new Date(tdDays[di]).getMonth() + 1) + '/' + new Date(tdDays[di]).getDate();
                    }
                  }
                  return '';
                } else {
                  if (val === 0) return '09:30';
                  if (val === 120) return '11:30/13:00';
                  if (val === 240) return '15:00';
                  return '';
                }
              }
            }
          } : {
            grid: { display: false }, border: { display: false },
            ticks: { color: axisColor, font: { size: 9 }, maxRotation: 0, autoSkip: false, align: 'inner',
              callback: function(val, idx) {
                var len = this.chart.data.labels.length;
                if (idx === 0 || idx === Math.floor((len - 1) / 2) || idx === len - 1) return this.getLabelForValue(val);
                return '';
              }
            }
          },
          y: {
            position: 'left', min: minY, max: maxY,
            grid: { color: gridColor, drawBorder: false }, border: { display: false },
            afterFit: function(scale) { scale.width = 0; },
            ticks: { color: axisColor, font: { size: 9 }, count: isTrend ? 3 : 5, mirror: true, padding: 0,
              callback: function(val) { return val.toFixed(2); }
            }
          }
        }
      },
      plugins: isTrend ? [crosshairPlugin] : [wickPlugin, crosshairPlugin]
    });
    canvas.removeEventListener('touchstart', _onTrendTouchStart);
    canvas.removeEventListener('touchmove', _onTrendTouchMove);
    canvas.removeEventListener('touchend', _onTrendTouchEnd);
    canvas.removeEventListener('click', _noopClick);
    canvas.addEventListener('touchstart', _onTrendTouchStart, { passive: false });
    canvas.addEventListener('touchmove', _onTrendTouchMove, { passive: false });
    canvas.addEventListener('touchend', _onTrendTouchEnd, { passive: false });
    canvas.addEventListener('click', _noopClick);
    var lastP = points[points.length - 1];
    var lastV = isTrend ? lastP.price : lastP.close;
    var dEl = document.getElementById('icDate');
    var cEl = document.getElementById('icClose');
    var pEl = document.getElementById('icPct');
    var oEl = document.getElementById('icOpen');
    if (dEl) {
      if (isTrend) {
        var prevPrice;
        if (period === 'trend') { prevPrice = preClose > 0 ? preClose : lastV; }
        else if (period === 'trend5' && tdPrevCloses && tdPrevCloses.length) { prevPrice = tdPrevCloses[tdPrevCloses.length - 1]; }
        else { prevPrice = points.length >= 2 ? points[points.length - 2].price : lastV; }
        var pct = calcPct(lastV, prevPrice);
        var tOpen = period === 'trend' ? points[0].price : (points[0] ? points[0].price : lastV);
        $ic(dEl, '时间 ' + (period === 'trend' ? lastP.time.slice(11, 16) : lastP.time.slice(2)));
        $ic(cEl, '收 ' + lastV.toFixed(2));
        if (oEl && oEl.parentElement) oEl.parentElement.style.display = '';
        $ic(oEl, '开 ' + tOpen.toFixed(2));
        $ic(pEl, pct.txt || '涨幅 --', pct.clr || 'var(--三类字体颜色)');
      } else {
        if (oEl && oEl.parentElement) oEl.parentElement.style.display = '';
        var prevClose2 = points.length >= 2 ? points[points.length - 2].close : lastP.close;
        var pct2 = calcPct(lastP.close, prevClose2);
        var isUp = lastP.close >= lastP.open;
        var kColor = isUp ? '#ef4444' : '#22c55e';
        $ic(dEl, '时间 ' + lastP.time.slice(2));
        $ic(cEl, '收 ' + lastP.close.toFixed(2), kColor);
        $ic(oEl, '开 ' + lastP.open.toFixed(2));
        $ic(pEl, pct2.txt || '涨幅 --', pct2.clr || 'var(--三类字体颜色)');
      }
    }
  } catch(e) { console.warn('drawIndexChart error:', e); }
}

function _updateICInfo(points, idx, isTrend, period, preClose) {
  var dEl = document.getElementById('icDate');
  var cEl = document.getElementById('icClose');
  var pEl = document.getElementById('icPct');
  var oEl = document.getElementById('icOpen');
  if (!dEl || idx < 0 || idx >= points.length) return;
  var p = points[idx];
  if (isTrend) {
    var tLabel = period === 'trend' ? p.time.slice(11, 16) : p.time.slice(2);
    $ic(dEl, '时间 ' + tLabel);
    var trOpen;
    if (period === 'trend') { trOpen = points[0].price; }
    else {
      var pDate = p.time.slice(0, 10);
      var firstOfDay = points.find(function(pt) { return pt.time.slice(0, 10) === pDate; });
      trOpen = firstOfDay ? firstOfDay.price : p.price;
    }
    var trIsUp = p.price >= trOpen;
    $ic(cEl, '收 ' + p.price.toFixed(2), trIsUp ? 'var(--五类字体颜色)' : 'var(--六类字体颜色)');
    if (oEl && oEl.parentElement) oEl.parentElement.style.display = '';
    $ic(oEl, '开 ' + trOpen.toFixed(2));
    var prevPrice;
    if (period === 'trend') { prevPrice = preClose > 0 ? preClose : p.price; }
    else {
      var curDate = p.time.slice(0, 10);
      var lastPrevPrice = null;
      for (var pi = 0; pi < idx; pi++) {
        if (points[pi].time.slice(0, 10) !== curDate) { lastPrevPrice = points[pi].price; }
        else if (lastPrevPrice !== null) { break; }
      }
      prevPrice = lastPrevPrice !== null ? lastPrevPrice : (preClose > 0 ? preClose : p.price);
    }
    var pct = calcPct(p.price, prevPrice);
    $ic(pEl, pct.txt || '涨幅 --', pct.clr || 'var(--三类字体颜色)');
  } else {
    if (oEl && oEl.parentElement) oEl.parentElement.style.display = '';
    var isUp = p.close >= p.open;
    var kColor = isUp ? '#ef4444' : '#22c55e';
    $ic(dEl, '时间 ' + p.time.slice(2));
    $ic(cEl, '收 ' + p.close.toFixed(2), kColor);
    $ic(oEl, '开 ' + p.open.toFixed(2));
    var prevClose = idx > 0 ? points[idx - 1].close : p.close;
    var pct = calcPct(p.close, prevClose);
    $ic(pEl, pct.txt || '涨幅 --', pct.clr || 'var(--三类字体颜色)');
  }
}

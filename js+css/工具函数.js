// APP_VERSION 由 index.html 全局定义，此处不再重复声明
const PERIOD_NAMES = { trend: '分时', trend5: '五日', day: '日K', week: '周K', month: '月K' };
const XHR_TIMEOUT = 8000;
const JSONP_TIMEOUT = 10000;
const AUTO_REFRESH_INTERVAL = 60000;
const STATUS_COLORS = { pending: 'var(--四类字体颜色)', confirmed: 'var(--六类字体颜色)', cancelled: 'var(--三类字体颜色)' };
const STATUS_LABELS = { pending: '待确认', confirmed: '已确认', cancelled: '已撤回' };
const TYPE_LABELS = { add: '加仓', reduce: '减仓', convert: '转换' };

function safeGet(key, fallback) { try { var v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch(e) { return fallback; } }
function safeSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.warn('数据保存失败:', key, e); try { if(typeof showToast==='function') showToast('数据保存失败，请检查浏览器存储设置','error'); } catch(_){} } }
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function pad(n){return String(n).padStart(2,'0');}
function formatDate(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function todayStr(){return formatDate(new Date());}
function r2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }
function formatMoney(n,opts){ if(n===null||n===undefined)return opts&&opts.dash?'--':'0.00'; if(isNaN(n))return'--'; if(opts&&opts.compact){var abs=Math.abs(n);if(abs>=1e8)return(n/1e8).toFixed(2)+'亿';if(abs>=1e4)return(n/1e4).toFixed(1)+'万';return n.toFixed(0);} const sign = n < 0 ? '-' : ''; return sign + r2(Math.abs(n)).toFixed(2); }
function safeHtml(s){ return escapeHtml(String(s==null?'':s)); }
function daysBetween(d1,d2){
  if(d1==null||d2==null)return'--';
  const a=new Date(d1),b=new Date(d2);
  return Math.max(0,Math.floor((b-a)/(86400000)));
}
function _costNav(f) { return f && f.amount > 0 && f.shares > 0 ? f.amount / f.shares : 0; }

const DAILY_PROFITS_KEY = 'fund_daily_profits';
function getDailyProfits() { return safeGet(DAILY_PROFITS_KEY, {}); }
function setDailyProfits(v) { safeSet(DAILY_PROFITS_KEY, v); }

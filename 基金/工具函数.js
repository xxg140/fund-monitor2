const APP_VERSION = 'V4.1';
const PERIOD_NAMES = { trend: '分时', trend5: '五日', day: '日K', week: '周K', month: '月K' };
const XHR_TIMEOUT = 8000;
const JSONP_TIMEOUT = 10000;
const AUTO_REFRESH_INTERVAL = 60000;
const STATUS_COLORS = { pending: 'var(--强调色)', confirmed: 'var(--下跌色)', cancelled: 'var(--弱化文字色)' };
const STATUS_LABELS = { pending: '待确认', confirmed: '已确认', cancelled: '已撤回' };
const TYPE_LABELS = { add: '加仓', reduce: '减仓' };

function safeGet(key, fallback) { try { var v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch(e) { return fallback; } }
function safeSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function pad(n){return String(n).padStart(2,'0');}
function formatDate(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function todayStr(){return formatDate(new Date());}
function r2(n){ return Math.round(n*100)/100; }
function formatMoney(n,opts){ if(n===null||n===undefined)return opts&&opts.dash?'--':'0.00'; if(isNaN(n))return'0.00'; if(opts&&opts.compact){var abs=Math.abs(n);if(abs>=1e8)return(n/1e8).toFixed(2)+'亿';if(abs>=1e4)return(n/1e4).toFixed(1)+'万';return n.toFixed(0);} const sign = n < 0 ? '-' : ''; return sign + r2(Math.abs(n)).toFixed(2); }
function safeHtml(s){ return escapeHtml(String(s==null?'':s)); }
function daysBetween(d1,d2){
  if(!d1||!d2)return'--';
  const a=new Date(d1),b=new Date(d2);
  return Math.max(0,Math.floor((b-a)/(86400000)));
}
function _costNav(f) { return f && f.amount > 0 && f.shares > 0 ? f.amount / f.shares : 0; }

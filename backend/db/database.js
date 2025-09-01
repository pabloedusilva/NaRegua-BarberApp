require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL não definida');

// Conexão PostgreSQL adaptada para Railway (SSL automático / configurável)
function resolveSSL(url) {
  if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') return false;
  const urlHasMode = /sslmode=([a-z-]+)/i.exec(url);
  const explicitMode = (process.env.DB_SSLMODE || '').toLowerCase();
  let mode = explicitMode || (urlHasMode ? urlHasMode[1].toLowerCase() : '');
  const inRailway = !!(process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  if (!mode) {
    if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') mode = 'require';
    else if (inRailway) mode = 'no-verify';
  }
  if (!mode || mode === 'disable' || mode === 'off') return false;
  const noVerify = ['no-verify','allow','prefer'].includes(mode);
  return { rejectUnauthorized: !noVerify };
}

const ssl = resolveSSL(dbUrl);
const pool = new Pool({
  connectionString: dbUrl,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 10_000,
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS) || 8_000,
  ssl
});

let ready = false; let lastCheck = 0;
async function checkConnection(force=false){
  const now = Date.now();
  if(!force && ready) return true;
  if(!force && now - lastCheck < 5000) return ready;
  lastCheck = now;
  try {
    await pool.query('SELECT 1');
    if(!ready) console.log('[DB] Conectado com sucesso.');
    ready = true; return true;
  } catch(e){
    if (e && e.code === 'SELF_SIGNED_CERT_IN_CHAIN' && ssl && ssl.rejectUnauthorized){
      console.warn('[DB] Cert self-signed. Relaxando verificação SSL...');
      try { pool.options.ssl.rejectUnauthorized = false; await pool.query('SELECT 1'); if(!ready) console.log('[DB] Conectado (no-verify).'); ready = true; return true; } catch{}
    }
    if(ready) console.error('[DB] Perda de conexão:', e.message);
    ready = false; return false;
  }
}
checkConnection(true).catch(()=>{});
setInterval(()=>{ if(!ready) checkConnection(true); }, 10000);

function isTransientError(err){
  if(!err) return false;
  const m = (err.message||'').toLowerCase();
  return m.includes('fetch failed')||m.includes('econnreset')||m.includes('timeout')||m.includes('network');
}
async function retry(fn,{attempts=Number(process.env.DB_MAX_RETRIES)||3,delay=Number(process.env.DB_RETRY_DELAY_MS)||400}={}){
  let last;
  for(let i=1;i<=attempts;i++){
    try { return await fn(); } catch(err){
      last = err; if(!isTransientError(err) || i===attempts) throw err; await new Promise(r=>setTimeout(r, delay*i));
    }
  }
  throw last;
}
function buildQuery(text,params){ return retry(()=>pool.query(text,params)); }
function sql(strings,...values){ const text = strings.reduce((a,c,i)=>a+c+(i<values.length?`$${i+1}`:''),''); return buildQuery(text,values).then(r=>r.rows); }
sql.query = (t,p)=>buildQuery(t,p);
sql.pool = pool; sql.raw = sql; sql.check = checkConnection;
Object.defineProperty(sql,'ready',{get:()=>ready});
process.on('SIGINT', async ()=>{ try{ await pool.end(); }catch{} process.exit(0); });
module.exports = sql;

require('dotenv').config();
const { Pool } = require('pg');
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL não definida');
const ssl = /sslmode=require|sslmode=no-verify/i.test(dbUrl) ? { rejectUnauthorized: !/sslmode=no-verify/i.test(dbUrl) } : false;
const pool = new Pool({ connectionString: dbUrl, max: 10, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8000, ssl });

let ready = false;
let lastCheck = 0;
async function checkConnection(force = false) {
	const now = Date.now();
	if (!force && ready) return true;
	if (!force && now - lastCheck < 5000) return ready; // evita flood
	lastCheck = now;
	try {
		await pool.query('SELECT 1');
		if (!ready) console.log('[DB] Conectado com sucesso.');
		ready = true; return true;
	} catch (e) {
		if (ready) console.error('[DB] Perda de conexão:', e.message);
		ready = false; return false;
	}
}
// Primeira checagem em background
checkConnection(true).catch(()=>{});
// Re-tentativa periódica se ainda não conectado
setInterval(() => { if (!ready) checkConnection(true); }, 10000);

// Detecta erros transitórios de rede que valem retry
function isTransientError(err) {
	if (!err) return false;
	const msg = (err.message || '').toLowerCase();
	return (
		msg.includes('fetch failed') ||
		msg.includes('econnreset') ||
		msg.includes('timeout') ||
		msg.includes('network')
	);
}

async function retry(fn, { attempts = Number(process.env.DB_MAX_RETRIES) || 3, delay = Number(process.env.DB_RETRY_DELAY_MS) || 400 } = {}) {
	let lastErr;
	for (let i = 1; i <= attempts; i++) {
		try { return await fn(); } catch (err) {
			lastErr = err;
			if (!isTransientError(err) || i === attempts) throw err;
			const backoff = delay * i;
			await new Promise(r => setTimeout(r, backoff));
		}
	}
	throw lastErr;
}

// Proxy para suportar uso sql`...` com retry automático
function buildQuery(text, params) { return retry(() => pool.query(text, params)); }

// Template tag simplificada: converte para parametrizado $1, $2 ...
function sql(strings, ...values) {
	const text = strings.reduce((acc, curr, i) => acc + curr + (i < values.length ? `$${i + 1}` : ''), '');
	return buildQuery(text, values).then(r => r.rows);
}

sql.query = (text, params) => buildQuery(text, params);
sql.pool = pool;
sql.raw = sql; // compatibilidade
sql.check = checkConnection;
Object.defineProperty(sql, 'ready', { get: () => ready });

process.on('SIGINT', async () => { try { await pool.end(); } catch {} process.exit(0); });

module.exports = sql;

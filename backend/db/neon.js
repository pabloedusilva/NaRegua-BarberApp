require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL não definida');

/**
 * Estratégia SSL:
 * 1. Se a URL contiver ?sslmode=... usamos isso.
 * 2. Caso esteja em ambiente Railway (variáveis RAILWAY_*) e a URL não possua sslmode,
 *    forçamos SSL com rejectUnauthorized=false (equivalente a no-verify) para evitar
 *    erro SELF_SIGNED_CERT_IN_CHAIN.
 * 3. Variáveis manuais:
 *    - DB_SSL=false (desliga SSL explicitamente)
 *    - DB_SSL=true  (força SSL com verificação)
 *    - DB_SSLMODE=no-verify|require (prioridade sobre a query string)
 */

function resolveSSL(url) {
	if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') return false;

	const urlHasMode = /sslmode=([a-z-]+)/i.exec(url);
	const explicitMode = (process.env.DB_SSLMODE || '').toLowerCase();
	let mode = explicitMode || (urlHasMode ? urlHasMode[1].toLowerCase() : '');

	const inRailway = !!(process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);

	if (!mode) {
		if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') mode = 'require';
		else if (inRailway) mode = 'no-verify'; // fallback seguro para evitar erro de certificado
	}

	if (!mode) return false; // permanece sem SSL

	if (mode === 'disable' || mode === 'off') return false;
	const noVerify = mode === 'no-verify' || mode === 'allow' || mode === 'prefer';
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
			// Se falhou por self-signed e ainda não tentamos modo no-verify implicitamente
			if (e && e.code === 'SELF_SIGNED_CERT_IN_CHAIN' && ssl && ssl.rejectUnauthorized) {
				console.warn('[DB] Erro de certificado autoassinado. Re-tentando com rejectUnauthorized=false (modo no-verify).');
				try {
					// Criar novo pool relaxando SSL
					pool.options.ssl.rejectUnauthorized = false; // ajuste direto
					await pool.query('SELECT 1');
					if (!ready) console.log('[DB] Conectado com sucesso (SSL no-verify).');
					ready = true; return true;
				} catch (e2) {
					if (ready) console.error('[DB] Perda de conexão (retry no-verify falhou):', e2.message);
				}
			}
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

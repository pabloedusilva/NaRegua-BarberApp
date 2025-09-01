require('dotenv').config();
const { neon, Pool } = require('@neondatabase/serverless');

// Normaliza a URL removendo parâmetros potencialmente incompatíveis com o driver serverless
function sanitizeConnectionString(url) {
	if (!url) return url;
	// Remover channel_binding=require (pode causar problemas / não é necessário para auth do neon serverless)
	return url.replace(/([&?])channel_binding=require&?/i, '$1').replace(/[&?]$/, '');
}

let rawUrl = process.env.DATABASE_URL;
const dbUrl = sanitizeConnectionString(rawUrl);
if (rawUrl && rawUrl !== dbUrl) {
	console.warn('[DB] Removido parâmetro channel_binding=require da DATABASE_URL para compatibilidade.');
}

// Função tagged template (neon) + pool estilo pg
const sqlTagged = neon(dbUrl);
const pool = new Pool({ connectionString: dbUrl, min: 0, max: 5, idleTimeoutMillis: 10_000 });

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
function sql(strings, ...values) {
	return retry(() => sqlTagged(strings, ...values));
}

// Anexa métodos auxiliares
sql.query = async (text, params) => retry(() => pool.query(text, params));
sql.pool = pool;
sql.raw = sqlTagged; // acesso direto sem retry se necessário

process.on('SIGINT', async () => { try { await pool.end(); } catch {} process.exit(0); });

module.exports = sql;

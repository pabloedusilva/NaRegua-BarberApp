// FONTE ÚNICA E CONTROLÁVEL DE DATA/HORA (VIRTUAL) PARA TODA A APLICAÇÃO
// Pode ser inicializada por variável de ambiente VIRTUAL_TIME="YYYY-MM-DD HH:mm:ss" (horário de Brasília)
// e alterada em runtime via endpoint administrativo.

// _brazilVirtualDate: data base fixa (Brasil) capturada ou definida.
// Em modo FIXO ela nunca avança; em modo LIVE ela avança proporcionalmente ao tempo real decorrido.
let _brazilVirtualDate = initVirtualDate();
let _baseRealMillis = Date.now(); // marca o momento real em que a base foi definida
const _isLiveMode = /^(live|1|true)$/i.test(process.env.VIRTUAL_MODE || '');

function parseEnvVirtual(str) {
  if (!str) return null;
  // Aceita formatos: YYYY-MM-DD HH:mm:ss ou YYYY-MM-DDTHH:mm:ss
  const norm = str.trim().replace('T', ' ');
  const m = norm.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [ , y, mo, d, h, mi, s ] = m;
  // Construir como horário de Brasília (UTC-3)
  const dateUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h) + 3, Number(mi), Number(s || '0'));
  return new Date(dateUtc - 3 * 3600000); // volta para representação local Brasil
}

function initVirtualDate() {
  const envDate = parseEnvVirtual(process.env.VIRTUAL_TIME || process.env.FIXED_TIME);
  if (envDate) return envDate;
  // fallback: captura uma vez e fixa
  const sys = new Date();
  const utcMillis = sys.getTime() + sys.getTimezoneOffset() * 60000;
  return new Date(utcMillis + -3 * 3600000);
}

function getBrazilNow() {
  if (_isLiveMode) {
    const elapsed = Date.now() - _baseRealMillis;
    return new Date(_brazilVirtualDate.getTime() + elapsed);
  }
  return new Date(_brazilVirtualDate.getTime());
}

function setBrazilVirtualNow(isoLike) {
  const parsed = parseEnvVirtual(isoLike);
  if (!parsed) throw new Error('Formato inválido. Use YYYY-MM-DD HH:mm:ss');
  _brazilVirtualDate = parsed;
  _baseRealMillis = Date.now(); // reseta referência para modo live
  return getBrazilNow();
}

function getBrazilDateTimeParts() {
  const dateObject = getBrazilNow();
  const iso = dateObject.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 19),
    datetime: iso.slice(0, 19).replace('T', ' '),
    dateObject
  };
}

module.exports = { getBrazilNow, getBrazilDateTimeParts, setBrazilVirtualNow, __isLiveMode: _isLiveMode };

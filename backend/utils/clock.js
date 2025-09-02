// Clock unificado usando Luxon.
// Mantém base UTC e converte para America/Sao_Paulo de forma confiável.
// Modos: fixed (default) ou live (VIRTUAL_MODE=live|1|true) avançando com o tempo real.

const { DateTime } = require('luxon');

const TZ = 'America/Sao_Paulo';
const LIVE = /^(live|1|true)$/i.test(process.env.VIRTUAL_MODE || '');
let baseUtc = initBaseUtc(); // DateTime UTC base
let baseRealMillis = Date.now();

function parseSeed(str){
  if(!str) return null;
  const m = str.trim().replace('T',' ').match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/);
  if(!m) return null;
  const [ , y, mo, d, h, mi, s ] = m;
  // Interpreta como horário do Brasil e converte para UTC
  return DateTime.fromObject({
    year: Number(y), month: Number(mo), day: Number(d),
    hour: Number(h), minute: Number(mi), second: Number(s||'0'),
    zone: TZ
  }).toUTC();
}
function initBaseUtc(){
  const seed = parseSeed(process.env.VIRTUAL_TIME || process.env.FIXED_TIME);
  return seed || DateTime.utc();
}
function nowUtc(){
  if(!LIVE) return baseUtc; // base congelada
  const elapsed = Date.now() - baseRealMillis;
  return baseUtc.plus({ milliseconds: elapsed });
}
function nowBrazilParts(){
  const utc = nowUtc();
  const zoned = utc.setZone(TZ);
  const date = zoned.toFormat('yyyy-LL-dd');
  const time = zoned.toFormat('HH:mm:ss');
  return { date, time, datetime: `${date} ${time}`, epoch: utc.toMillis(), mode: LIVE ? 'live' : 'fixed' };
}
function setVirtual(str){
  const parsed = parseSeed(str);
  if(!parsed) throw new Error('Formato inválido. Use YYYY-MM-DD HH:mm:ss');
  baseUtc = parsed;
  baseRealMillis = Date.now();
  return nowBrazilParts();
}
function advanceMinutes(mins){
  const current = nowUtc();
  baseUtc = current.plus({ minutes: Number(mins)||0 });
  baseRealMillis = Date.now();
  return nowBrazilParts();
}
module.exports = { nowUtc: ()=>nowUtc().toJSDate(), nowBrazilParts, setVirtual, advanceMinutes, mode: LIVE ? 'live':'fixed' };

// FONTE ÚNICA E FIXA DE DATA/HORA PARA TODA A APLICAÇÃO
// Congelada no momento do boot do servidor.

const _systemNow = new Date();
// Ajusta para horário de Brasília (UTC-3) ignorando possível horário de verão
const _utcMillis = _systemNow.getTime() + _systemNow.getTimezoneOffset() * 60000;
const _brazilFixedDate = new Date(_utcMillis + -3 * 3600000);

function getBrazilNow() {
  // Sempre retorna uma CÓPIA da data/hora fixa (não avança)
  return new Date(_brazilFixedDate.getTime());
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

module.exports = { getBrazilNow, getBrazilDateTimeParts, BRAZIL_FIXED_DATE: getBrazilNow() };

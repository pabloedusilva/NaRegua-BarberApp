function getBrazilNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + -3 * 3600000);
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

module.exports = { getBrazilNow, getBrazilDateTimeParts };

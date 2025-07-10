// db/neon.js
require('dotenv').config();

const smartDb = require('../Infinity-DB/core/smart-db');
module.exports = smartDb;


// Sistema de backup inteligente habilitado
// Para desabilitar, comente a linha abaixo e descomente a implementação original

/* Implementação original (desabilitada)
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
module.exports = sql;
*/
/**
 * 🔄 Infinity-DB - Sistema de Manipulação de Banco de Dados
 * 
 * Sistema inteligente de backup e manipulação automática de bancos de dados Neon
 * para integração fácil em aplicativos Node.js existentes.
 * 
 * @author Pablo Eduardo Silva
 * @version 1.0.0
 * @description Drop-in replacement para @neondatabase/serverless com backup automático
 */

// Exportar componentes principais para uso programático
module.exports = {
    // Sistema inteligente de banco (substituto do neon)
    SmartDatabase: require('./core/smart-db'),
    
    // Componentes do sistema
    DatabaseManager: require('./core/database-manager'), 
    BackupScheduler: require('./core/scheduler'),
    
    // Configurações
    config: require('./config/config'),
    
    // API Routes para controle
    apiRoutes: require('./api/api-routes'),
    
    // Utilitários
    utils: {
        initializeDatabase: require('./scripts/initialize'),
        initializeSimple: require('./scripts/init-simple')
    }
};

// Para uso direto como substituto do neon (recomendado)
module.exports.default = require('./core/smart-db');

// Para compatibilidade com import default
module.exports.createSmartDatabase = () => require('./core/smart-db');

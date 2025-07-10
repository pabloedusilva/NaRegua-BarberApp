const config = require('../config/config');
const DatabaseManager = require('./database-manager');

// Instância global do gerenciador de banco
let dbManager = null;

// Auto-instalação das dependências
async function ensureDependencies() {
    const fs = require('fs');
    const path = require('path');
    
    const infinityDbPath = path.join(__dirname, '..');
    const setupFlagPath = path.join(infinityDbPath, '.setup-complete');
    
    // Se setup já foi executado, verificar apenas dependências críticas
    if (fs.existsSync(setupFlagPath)) {
        const nodeModulesPath = path.join(infinityDbPath, 'node_modules');
        return fs.existsSync(nodeModulesPath);
    }
    
    // Executar auto-setup na primeira vez
    console.log('🔧 Infinity-DB: Primeira execução detectada. Executando setup automático...');
    
    try {
        const autoSetup = require('../scripts/auto-setup');
        const success = await autoSetup();
        
        if (success) {
            console.log('✅ Infinity-DB: Setup automático concluído com sucesso!');
            return true;
        } else {
            console.log('⚠️ Infinity-DB: Setup automático falhou. Continuando com configuração manual...');
            return false;
        }
    } catch (error) {
        console.error('❌ Infinity-DB: Erro no setup automático:', error.message);
        console.log('💡 Execute manualmente: cd Infinity-DB && npm install');
        return false;
    }
}

// Inicializar o sistema de backup com auto-instalação
async function initializeBackupSystem() {
    if (!dbManager) {
        // Verificar e instalar dependências automaticamente
        const depsOk = await ensureDependencies();
        if (!depsOk) {
            console.log('⚠️ Infinity-DB: Iniciando sem algumas dependências. Sistema pode não funcionar completamente.');
        }
        
        dbManager = new DatabaseManager(config);
        console.log('🔧 Sistema de backup inicializado');
    }
    return dbManager;
}

// Wrapper que substitui o neon original
function createSmartDatabase() {
    // Retorna uma função que funciona como o neon original
    function smartDb(strings, ...values) {
        // Inicializar de forma assíncrona na primeira chamada
        if (!dbManager) {
            // Usar Promise para lidar com inicialização assíncrona
            return initializeBackupSystem().then(manager => {
                if (typeof strings === 'string') {
                    // Query simples: db('SELECT * FROM table', [params])
                    const params = values.length > 0 ? values[0] : [];
                    return manager.executeQuery(strings, params);
                } else if (Array.isArray(strings)) {
                    // Template literals: db`SELECT * FROM table WHERE id = ${id}`
                    return manager.query(strings, ...values);
                } else {
                    throw new Error('Formato de query inválido');
                }
            });
        }
        
        // Se já estiver inicializado, usar normalmente
        if (typeof strings === 'string') {
            // Query simples: db('SELECT * FROM table', [params])
            const params = values.length > 0 ? values[0] : [];
            return dbManager.executeQuery(strings, params);
        } else if (Array.isArray(strings)) {
            // Template literals: db`SELECT * FROM table WHERE id = ${id}`
            return dbManager.query(strings, ...values);
        } else {
            throw new Error('Formato de query inválido');
        }
    }
    
    // Adicionar método query para compatibilidade com uso antigo
    smartDb.query = function(queryString, params = []) {
        if (!dbManager) {
            return initializeBackupSystem().then(manager => {
                return manager.executeQuery(queryString, params);
            });
        }
        return dbManager.executeQuery(queryString, params);
    };
    
    return smartDb;
}

module.exports = createSmartDatabase();

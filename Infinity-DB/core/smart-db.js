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
    const nodeModulesPath = path.join(infinityDbPath, 'node_modules');
    
    // Verificar se dependências críticas existem
    const criticalModules = ['@neondatabase/serverless', 'express', 'node-cron'];
    let hasAllDeps = fs.existsSync(nodeModulesPath);
    
    if (hasAllDeps) {
        for (const mod of criticalModules) {
            const modPath = path.join(nodeModulesPath, mod);
            if (!fs.existsSync(modPath)) {
                hasAllDeps = false;
                break;
            }
        }
    }
    
    // Se todas as dependências existem, verificar flag de setup
    if (hasAllDeps && fs.existsSync(setupFlagPath)) {
        return true;
    }
    
    // Executar auto-setup se necessário
    console.log('🔧 Infinity-DB: Configurando dependências automaticamente...');
    
    try {
        const autoSetup = require('../scripts/auto-setup');
        const success = await autoSetup();
        
        if (success) {
            console.log('✅ Infinity-DB: Configuração automática concluída!');
            return true;
        } else {
            console.log('⚠️ Infinity-DB: Configuração automática falhou. Verificando dependências mínimas...');
            return hasAllDeps;
        }
    } catch (error) {
        console.log('⚠️ Infinity-DB: Erro na configuração automática, continuando...');
        return hasAllDeps;
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

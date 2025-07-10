const express = require('express');
const router = express.Router();
const BackupScheduler = require('../core/scheduler');
const config = require('../config/config');

// Instância do scheduler
let scheduler = null;

// Inicializar scheduler se não existir
function getScheduler() {
    if (!scheduler) {
        try {
            console.log('🚀 Inicializando scheduler...');
            scheduler = new BackupScheduler();
            // Não iniciar automaticamente para evitar conflitos em modo API
            console.log('✅ Scheduler inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar scheduler:', error.message);
            throw error;
        }
    }
    return scheduler;
}

// Status do sistema de backup
router.get('/status', async (req, res) => {
    try {
        console.log('📊 API: Requisição de status recebida');
        const sched = getScheduler();
        const report = await sched.getSystemReport();
        
        console.log('✅ API: Relatório gerado com sucesso');
        res.json({
            success: true,
            report: report,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ API: Erro ao gerar status:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Forçar backup manual
router.post('/force-backup', async (req, res) => {
    try {
        const sched = getScheduler();
        const success = await sched.forceBackup();
        
        res.json({
            success: success,
            message: success ? 'Backup forçado iniciado' : 'Erro ao iniciar backup',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Forçar troca de banco
router.post('/force-switch', async (req, res) => {
    try {
        const sched = getScheduler();
        const success = await sched.forceDatabaseSwitch();
        
        res.json({
            success: success,
            message: success ? 'Troca de banco forçada' : 'Erro ao trocar banco',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Parar sistema de backup
router.post('/stop', async (req, res) => {
    try {
        if (scheduler) {
            scheduler.stop();
            res.json({
                success: true,
                message: 'Sistema de backup parado',
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                message: 'Sistema não estava executando'
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Reiniciar sistema de backup
router.post('/restart', async (req, res) => {
    try {
        if (scheduler) {
            scheduler.stop();
        }
        
        scheduler = new BackupScheduler();
        scheduler.start();
        
        res.json({
            success: true,
            message: 'Sistema de backup reiniciado',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Logs do sistema
router.get('/logs', async (req, res) => {
    try {
        console.log('📋 API: Requisição de logs recebida');
        const fs = require('fs').promises;
        const path = require('path');
        
        // config.monitoring.logFile já é um caminho absoluto
        const logFile = config.monitoring.logFile;
        console.log('📂 Lendo arquivo de log:', logFile);
        
        try {
            // Garantir que o diretório existe
            const logDir = path.dirname(logFile);
            await fs.mkdir(logDir, { recursive: true });
            
            const logs = await fs.readFile(logFile, 'utf8');
            const lines = logs.split('\n').filter(line => line.trim());
            
            // Retornar últimas 100 linhas
            const recentLogs = lines.slice(-100);
            
            console.log(`✅ API: ${recentLogs.length} linhas de log retornadas`);
            res.json({
                success: true,
                logs: recentLogs,
                totalLines: lines.length
            });
            
        } catch (err) {
            console.log('⚠️ API: Arquivo de log não encontrado, criando estrutura padrão');
            
            // Garantir que o diretório existe
            const logDir = path.dirname(logFile);
            await fs.mkdir(logDir, { recursive: true });
            
            // Criar log inicial
            const initialLog = '[' + new Date().toISOString() + '] Sistema de backup inicializado - arquivo de log criado\n';
            await fs.writeFile(logFile, initialLog, 'utf8');
            
            res.json({
                success: true,
                logs: [initialLog.trim()],
                totalLines: 1
            });
        }
        
    } catch (error) {
        console.error('❌ API: Erro ao carregar logs:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Configurações do sistema
router.get('/config', (req, res) => {
    try {
        // Remover URLs sensíveis da configuração
        const safeConfig = {
            monitoring: {
                checkInterval: config.monitoring.checkInterval,
                systemType: config.monitoring.systemType || 'date-based'
            },
            backup: {
                tables: config.backup.tables,
                retentionDays: config.backup.retentionDays,
                backupDays: config.backup.backupDays || [24, 25],
                switchDay: config.backup.switchDay || 25,
                switchHour: config.backup.switchHour || 23
            },
            databases: {
                primary: {
                    name: config.databases.primary.name
                },
                secondary: {
                    name: config.databases.secondary.name
                }
            }
        };
        
        res.json({
            success: true,
            config: safeConfig
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

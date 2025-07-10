const express = require('express');
const router = express.Router();
const BackupScheduler = require('../core/scheduler');
const config = require('../config/config');

// Instância do scheduler
let scheduler = null;

// Inicializar scheduler se não existir
function getScheduler() {
    if (!scheduler) {
        scheduler = new BackupScheduler();
        // Não iniciar automaticamente para evitar conflitos
    }
    return scheduler;
}

// Status do sistema de backup (sem auth para teste)
router.get('/status', async (req, res) => {
    try {
        const sched = getScheduler();
        const report = await sched.getSystemReport();
        
        res.json({
            success: true,
            report: report,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Forçar backup manual (sem auth para teste)
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

// Forçar troca de banco (sem auth para teste)
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

// Logs do sistema (sem auth para teste)
router.get('/logs', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // config.monitoring.logFile já é um caminho absoluto
        const logFile = config.monitoring.logFile;
        
        try {
            const logs = await fs.readFile(logFile, 'utf8');
            const lines = logs.split('\n').filter(line => line.trim());
            
            // Retornar últimas 50 linhas
            const recentLogs = lines.slice(-50);
            
            res.json({
                success: true,
                logs: recentLogs,
                totalLines: lines.length
            });
            
        } catch (err) {
            res.json({
                success: true,
                logs: ['Nenhum log encontrado'],
                totalLines: 0
            });
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Configurações do sistema (sem auth para teste)
router.get('/config', (req, res) => {
    try {
        // Remover URLs sensíveis da configuração
        const safeConfig = {
            monitoring: config.monitoring,
            backup: {
                tables: config.backup.tables,
                retentionDays: config.backup.retentionDays
            },
            databases: {
                primary: {
                    name: config.databases.primary.name,
                    monthlyLimit: config.databases.primary.monthlyLimit
                },
                secondary: {
                    name: config.databases.secondary.name,
                    monthlyLimit: config.databases.secondary.monthlyLimit
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

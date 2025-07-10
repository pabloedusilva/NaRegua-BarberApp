const cron = require('node-cron');
const config = require('../config/config');
const DatabaseManager = require('./database-manager');

class BackupScheduler {
    constructor() {
        this.dbManager = new DatabaseManager(config);
        this.jobs = [];
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Scheduler já está executando');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Iniciando Sistema de Backup Automático por Data');
        
        // Backup automático no dia 24 de cada mês às 3h da manhã
        const monthlyBackup24Job = cron.schedule('0 3 24 * *', async () => {
            await this.performMonthlyBackup(24);
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Backup automático no dia 25 de cada mês às 3h da manhã
        const monthlyBackup25Job = cron.schedule('0 3 25 * *', async () => {
            await this.performMonthlyBackup(25);
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Alternância automática no dia 25 às 23h de cada mês
        const monthlySwitchJob = cron.schedule('0 23 25 * *', async () => {
            await this.performMonthlySwitch();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Verificação de saúde do sistema a cada 12 horas
        const healthCheckJob = cron.schedule('0 */12 * * *', async () => {
            await this.performHealthCheck();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        // Limpeza de logs antigos (semanal)
        const cleanupJob = cron.schedule('0 2 * * 0', async () => {
            await this.performCleanup();
        }, {
            scheduled: false,
            timezone: 'America/Sao_Paulo'
        });

        this.jobs = [monthlyBackup24Job, monthlyBackup25Job, monthlySwitchJob, healthCheckJob, cleanupJob];
        
        // Iniciar todos os jobs
        this.jobs.forEach(job => job.start());
        
        // Executar verificação inicial
        setTimeout(() => this.performHealthCheck(), 5000);
        
        console.log('✅ Sistema de backup baseado em data iniciado com sucesso');
        console.log('📋 Jobs agendados:');
        console.log('   - Backup dia 24: Todo dia 24 às 3h');
        console.log('   - Backup dia 25: Todo dia 25 às 3h');
        console.log('   - Alternância: Todo dia 25 às 23h');
        console.log('   - Verificação: A cada 12 horas');
        console.log('   - Limpeza: Domingos às 2h');
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Scheduler não está executando');
            return;
        }

        this.jobs.forEach(job => job.stop());
        this.isRunning = false;
        console.log('🛑 Sistema de backup parado');
    }

    async performMonthlyBackup(day) {
        try {
            await this.dbManager.log(`� Iniciando backup automático do dia ${day} do mês`);
            
            const currentDate = new Date();
            const backupInfo = {
                day: day,
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear(),
                database: this.dbManager.currentDatabase
            };
            
            await this.dbManager.log(`📋 Backup programado - Dia ${day}/${backupInfo.month}/${backupInfo.year}`);
            await this.dbManager.log(`🎯 Banco ativo: ${backupInfo.database.toUpperCase()}`);
            
            // Realizar backup completo
            await this.dbManager.createFullBackup();
            
            await this.dbManager.log(`✅ Backup do dia ${day} concluído com sucesso`);
            
        } catch (error) {
            await this.dbManager.log(`❌ Erro no backup do dia ${day}:`, error.message);
        }
    }

    async performMonthlySwitch() {
        try {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            
            await this.dbManager.log(`🔄 Iniciando alternância automática mensal - ${currentMonth}/${currentYear}`);
            await this.dbManager.log(`📊 Banco atual antes da troca: ${this.dbManager.currentDatabase.toUpperCase()}`);
            
            // Fazer backup final antes da troca
            await this.dbManager.log('📦 Realizando backup final antes da alternância');
            await this.dbManager.createFullBackup();
            
            // Realizar a troca
            await this.dbManager.switchToBackupDatabase();
            
            await this.dbManager.log(`✅ Alternância mensal concluída - Novo banco ativo: ${this.dbManager.currentDatabase.toUpperCase()}`);
            await this.dbManager.log(`📅 Próxima alternância: 25/${currentMonth + 1 > 12 ? 1 : currentMonth + 1}/${currentMonth + 1 > 12 ? currentYear + 1 : currentYear} às 23:00`);
            
        } catch (error) {
            await this.dbManager.log('❌ Erro na alternância mensal:', error.message);
        }
    }

    async performHealthCheck() {
        try {
            await this.dbManager.log('� Verificação de saúde do sistema');
            
            const currentDate = new Date();
            const currentDay = currentDate.getDate();
            const currentHour = currentDate.getHours();
            
            // Verificar conexões com ambos os bancos
            const healthStatus = await this.dbManager.checkDatabasesHealth();
            
            for (const [dbName, status] of Object.entries(healthStatus)) {
                if (status.connected) {
                    await this.dbManager.log(`✅ ${dbName.toUpperCase()}: Conectado - ${status.responseTime}ms`);
                } else {
                    await this.dbManager.log(`❌ ${dbName.toUpperCase()}: Desconectado - ${status.error}`);
                }
            }
            
            // Informar próximos eventos
            let nextBackup = '';
            let nextSwitch = '';
            
            if (currentDay < 24) {
                nextBackup = `dia 24 às 3h`;
                nextSwitch = `dia 25 às 23h`;
            } else if (currentDay === 24) {
                if (currentHour < 3) {
                    nextBackup = `hoje às 3h`;
                } else {
                    nextBackup = `dia 25 às 3h`;
                }
                nextSwitch = `dia 25 às 23h`;
            } else if (currentDay === 25) {
                if (currentHour < 3) {
                    nextBackup = `hoje às 3h`;
                } else {
                    nextBackup = `próximo mês dia 24`;
                }
                if (currentHour < 23) {
                    nextSwitch = `hoje às 23h`;
                } else {
                    nextSwitch = `próximo mês dia 25`;
                }
            } else {
                nextBackup = `próximo mês dia 24`;
                nextSwitch = `próximo mês dia 25`;
            }
            
            await this.dbManager.log(`📅 Próximo backup: ${nextBackup}`);
            await this.dbManager.log(`🔄 Próxima alternância: ${nextSwitch}`);
            await this.dbManager.log(`� Banco ativo atual: ${this.dbManager.currentDatabase.toUpperCase()}`);
            
        } catch (error) {
            await this.dbManager.log('❌ Erro na verificação de saúde:', error.message);
        }
    }

    async performCleanup() {
        try {
            await this.dbManager.log('🧹 Iniciando limpeza de arquivos antigos');
            
            const fs = require('fs').promises;
            const path = require('path');
            
            // Limpar logs antigos (manter últimos 30 dias)
            const logFile = config.monitoring.logFile;
            try {
                const stats = await fs.stat(logFile);
                const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysOld > 30) {
                    await fs.writeFile(logFile, ''); // Limpar arquivo
                    await this.dbManager.log('🗑️ Log antigo limpo');
                }
            } catch (err) {
                // Arquivo não existe ou erro ao acessar
            }
            
            // Limpar backups temporários antigos
            if (config.backup.tempDir) {
                try {
                    const tempDir = config.backup.tempDir;
                    const files = await fs.readdir(tempDir);
                    const cutoffDate = Date.now() - (config.backup.retentionDays * 24 * 60 * 60 * 1000);
                    
                    for (const file of files) {
                        const filePath = path.join(tempDir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime.getTime() < cutoffDate) {
                            await fs.unlink(filePath);
                            await this.dbManager.log(`🗑️ Backup temporário removido: ${file}`);
                        }
                    }
                } catch (err) {
                    // Diretório não existe ou erro ao acessar
                }
            }
            
            await this.dbManager.log('✅ Limpeza concluída');
            
        } catch (error) {
            await this.dbManager.log('❌ Erro na limpeza:', error.message);
        }
    }

    async getSystemReport() {
        try {
            console.log('📊 Gerando relatório do sistema...');
            
            // Inicializar banco manager se necessário
            if (!this.dbManager.usageLoaded) {
                console.log('📂 Carregando dados do sistema...');
                await this.dbManager.ensureUsageLoaded();
            }
            
            const status = await this.dbManager.getStatus();
            console.log('✅ Status dos bancos obtido');
            
            const currentDate = new Date();
            const currentDay = currentDate.getDate();
            const currentHour = currentDate.getHours();
            
            // Calcular próximos eventos
            let nextBackupDate = '';
            let nextSwitchDate = '';
            
            if (currentDay < 24) {
                nextBackupDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-24 03:00`;
                nextSwitchDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-25 23:00`;
            } else if (currentDay === 24) {
                if (currentHour < 3) {
                    nextBackupDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-24 03:00`;
                } else {
                    nextBackupDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-25 03:00`;
                }
                nextSwitchDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-25 23:00`;
            } else if (currentDay === 25) {
                if (currentHour < 3) {
                    nextBackupDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-25 03:00`;
                } else {
                    const nextMonth = currentDate.getMonth() + 2 > 12 ? 1 : currentDate.getMonth() + 2;
                    const nextYear = currentDate.getMonth() + 2 > 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
                    nextBackupDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-24 03:00`;
                }
                if (currentHour < 23) {
                    nextSwitchDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-25 23:00`;
                } else {
                    const nextMonth = currentDate.getMonth() + 2 > 12 ? 1 : currentDate.getMonth() + 2;
                    const nextYear = currentDate.getMonth() + 2 > 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
                    nextSwitchDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-25 23:00`;
                }
            } else {
                const nextMonth = currentDate.getMonth() + 2 > 12 ? 1 : currentDate.getMonth() + 2;
                const nextYear = currentDate.getMonth() + 2 > 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
                nextBackupDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-24 03:00`;
                nextSwitchDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-25 23:00`;
            }
            
            const report = {
                timestamp: new Date().toISOString(),
                currentDatabase: this.dbManager.currentDatabase,
                databases: status,
                scheduler: {
                    isRunning: this.isRunning,
                    jobsCount: this.jobs.length,
                    systemType: 'Date-based Automatic Backup System'
                },
                schedule: {
                    nextBackup: nextBackupDate,
                    nextSwitch: nextSwitchDate,
                    backupDays: [24, 25],
                    switchDay: 25,
                    switchTime: '23:00'
                },
                config: {
                    systemMode: 'Backup automático baseado em data',
                    backupSchedule: 'Dias 24 e 25 de cada mês às 3h',
                    switchSchedule: 'Dia 25 de cada mês às 23h',
                    timezone: 'America/Sao_Paulo'
                }
            };
            
            console.log('✅ Relatório gerado com sucesso');
            return report;
        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error.message);
            await this.dbManager.log('❌ Erro ao gerar relatório:', error.message);
            return { 
                error: error.message,
                timestamp: new Date().toISOString(),
                success: false
            };
        }
    }

    // Método para forçar troca de banco (emergência)
    async forceDatabaseSwitch() {
        try {
            await this.dbManager.log('🔧 TROCA FORÇADA DE BANCO INICIADA');
            await this.dbManager.switchToBackupDatabase();
            await this.dbManager.log('✅ Troca forçada concluída');
            return true;
        } catch (error) {
            await this.dbManager.log('❌ Erro na troca forçada:', error.message);
            return false;
        }
    }

    // Método para forçar backup (emergência)
    async forceBackup() {
        try {
            await this.dbManager.log('🔧 BACKUP FORÇADO INICIADO');
            await this.dbManager.createFullBackup();
            await this.dbManager.log('✅ Backup forçado concluído');
            return true;
        } catch (error) {
            await this.dbManager.log('❌ Erro no backup forçado:', error.message);
            return false;
        }
    }
}

module.exports = BackupScheduler;

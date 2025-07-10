const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
    constructor(config) {
        this.config = config;
        this.currentDatabase = 'primary';
        this.connections = {};
        this.usageTracking = {};
        this.usageLoaded = false;
        
        this.initializeConnections();
    }

    initializeConnections() {
        try {
            this.connections.primary = neon(this.config.databases.primary.url);
            this.connections.secondary = neon(this.config.databases.secondary.url);
            this.log('✅ Conexões com bancos inicializadas');
        } catch (error) {
            this.log('❌ Erro ao inicializar conexões:', error.message);
            throw error;
        }
    }

    async loadUsageData() {
        try {
            for (const [dbName, dbConfig] of Object.entries(this.config.databases)) {
                try {
                    const data = await fs.readFile(dbConfig.usageFile, 'utf8');
                    this.usageTracking[dbName] = JSON.parse(data);
                } catch (err) {
                    // Arquivo não existe, criar novo tracking
                    this.usageTracking[dbName] = {
                        monthlyUsage: 0,
                        lastReset: new Date().toISOString(),
                        queries: 0,
                        lastActivity: new Date().toISOString()
                    };
                    await this.saveUsageData(dbName);
                }
            }
            this.log('📊 Dados de uso carregados');
        } catch (error) {
            this.log('❌ Erro ao carregar dados de uso:', error.message);
        }
    }

    async saveUsageData(dbName) {
        try {
            const dbConfig = this.config.databases[dbName];
            await fs.writeFile(
                dbConfig.usageFile, 
                JSON.stringify(this.usageTracking[dbName], null, 2)
            );
        } catch (error) {
            this.log(`❌ Erro ao salvar dados de uso do ${dbName}:`, error.message);
        }
    }

    async trackActivity(dbName) {
        // Garantir que os dados de uso estão carregados
        await this.ensureUsageLoaded();
        
        const usage = this.usageTracking[dbName];
        
        if (!usage) {
            // Se ainda não existe, criar novo tracking
            this.usageTracking[dbName] = {
                monthlyUsage: 0,
                lastReset: new Date().toISOString(),
                queries: 0,
                lastActivity: new Date().toISOString()
            };
        }
        
        this.usageTracking[dbName].queries += 1;
        this.usageTracking[dbName].lastActivity = new Date().toISOString();
        
        await this.saveUsageData(dbName);
    }

    async ensureUsageLoaded() {
        if (!this.usageLoaded) {
            await this.loadUsageData();
            this.usageLoaded = true;
        }
    }

    // Verificar se hoje é dia de backup
    async shouldBackupToday() {
        const now = new Date();
        const day = now.getDate();
        const backupDays = this.config.backup.backupDays || [24, 25];
        
        return backupDays.includes(day);
    }

    // Verificar se hoje é dia de alternar os bancos
    async shouldSwitchToday() {
        const now = new Date();
        const day = now.getDate();
        const hour = now.getHours();
        const switchDay = this.config.backup.switchDay || 25;
        const switchHour = this.config.backup.switchHour || 23;
        
        return day === switchDay && hour >= switchHour;
    }

    async executeQuery(query, params = []) {
        const startTime = Date.now();
        
        try {
            const connection = this.connections[this.currentDatabase];
            let result;
            
            // Convert parameterized query to interpolated query for Neon
            if (params && params.length > 0) {
                let interpolatedQuery = query;
                for (let i = 0; i < params.length; i++) {
                    const param = params[i];
                    let paramValue = this.escapeValue(param);
                    interpolatedQuery = interpolatedQuery.replace(`$${i + 1}`, paramValue);
                }
                this.log(`🔧 Query interpolada: ${interpolatedQuery}`);
                const queryFunc = new Function('connection', `return connection\`${interpolatedQuery.replace(/`/g, '\\`')}\`;`);
                result = await queryFunc(connection);
            } else {
                // Simple query - use Function constructor to safely create template literal
                const queryFunc = new Function('connection', `return connection\`${query.replace(/`/g, '\\`')}\`;`);
                result = await queryFunc(connection);
            }
            
            await this.trackActivity(this.currentDatabase);
            return result;
            
        } catch (error) {
            this.log(`❌ Erro na query no banco ${this.currentDatabase}:`, error.message);
            
            // Tentar no banco secundário se falhar
            if (this.currentDatabase === 'primary') {
                try {
                    this.log('🔄 Tentando query no banco secundário...');
                    let secondaryResult;
                    
                    if (params && params.length > 0) {
                        let interpolatedQuery = query;
                        for (let i = 0; i < params.length; i++) {
                            const param = params[i];
                            let paramValue = this.escapeValue(param);
                            interpolatedQuery = interpolatedQuery.replace(`$${i + 1}`, paramValue);
                        }
                        const queryFunc = new Function('connection', `return connection\`${interpolatedQuery.replace(/`/g, '\\`')}\`;`);
                        secondaryResult = await queryFunc(this.connections.secondary);
                    } else {
                        const queryFunc = new Function('connection', `return connection\`${query.replace(/`/g, '\\`')}\`;`);
                        secondaryResult = await queryFunc(this.connections.secondary);
                    }
                    
                    await this.trackActivity('secondary');
                    return secondaryResult;
                } catch (secondaryError) {
                    this.log('❌ Falha também no banco secundário:', secondaryError.message);
                }
            }
            
            throw error;
        }
    }

    escapeValue(value) {
        if (value === null || value === undefined) {
            return 'NULL';
        } else if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
        } else if (typeof value === 'number') {
            return value.toString();
        } else if (typeof value === 'boolean') {
            return value.toString();
        } else if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        } else if (Array.isArray(value)) {
            // PostgreSQL array format
            const escapedValues = value.map(v => this.escapeValue(v)).join(',');
            return `ARRAY[${escapedValues}]`;
        } else {
            return `'${String(value).replace(/'/g, "''")}'`;
        }
    }

    async switchToBackupDatabase() {
        const newDatabase = this.currentDatabase === 'primary' ? 'secondary' : 'primary';
        
        this.log(`🔄 Alternando de ${this.currentDatabase} para ${newDatabase}`);
        
        try {
            // Fazer backup completo antes de alternar
            await this.createFullBackup();
            
            // Alterar banco ativo
            this.currentDatabase = newDatabase;
            
            this.log(`✅ Banco alternado para ${newDatabase}`);
            
            // Enviar notificação
            await this.sendSwitchNotification();
            
        } catch (error) {
            this.log('❌ Erro ao alternar banco:', error.message);
            throw error;
        }
    }

    async createFullBackup() {
        this.log('📦 Iniciando backup completo...');
        
        try {
            const sourceDbName = this.currentDatabase;
            const targetDbName = this.currentDatabase === 'primary' ? 'secondary' : 'primary';
            
            const sourceDb = this.connections[sourceDbName];
            const targetDb = this.connections[targetDbName];
            
            this.log(`📋 Backup: ${sourceDbName} → ${targetDbName}`);
            
            for (const table of this.config.backup.tables) {
                await this.backupTable(sourceDb, targetDb, table);
            }
            
            this.log('✅ Backup completo finalizado');
            
        } catch (error) {
            this.log('❌ Erro no backup completo:', error.message);
            throw error;
        }
    }

    async backupTable(sourceDb, targetDb, tableName) {
        try {
            this.log(`📋 Fazendo backup da tabela: ${tableName}`);
            
            // Buscar dados da tabela origem usando Function constructor
            const selectFunc = new Function('db', `return db\`SELECT * FROM ${tableName}\`;`);
            const data = await selectFunc(sourceDb);
            
            if (data.length === 0) {
                this.log(`ℹ️ Tabela ${tableName} está vazia`);
                return;
            }
            
            // Limpar tabela destino
            const deleteFunc = new Function('db', `return db\`DELETE FROM ${tableName}\`;`);
            await deleteFunc(targetDb);
            
            // Inserir dados no destino
            if (data.length > 0) {
                const columns = Object.keys(data[0]);
                
                // Inserir registro por registro para garantir compatibilidade
                for (const row of data) {
                    try {
                        const values = columns.map(col => this.escapeValue(row[col]));
                        const insertQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
                        
                        const insertFunc = new Function('db', `return db\`${insertQuery}\`;`);
                        await insertFunc(targetDb);
                        
                    } catch (insertError) {
                        this.log(`⚠️ Erro ao inserir registro em ${tableName}:`, insertError.message);
                        // Continue with next record
                    }
                }
            }
            
            this.log(`✅ Backup de ${tableName} concluído (${data.length} registros)`);
            
        } catch (error) {
            this.log(`❌ Erro no backup da tabela ${tableName}:`, error.message);
            // Não parar o backup por uma tabela com erro
        }
    }

    async sendSwitchNotification() {
        const message = `🔄 Sistema NaRégua: Banco alternado para ${this.currentDatabase.toUpperCase()}`;
        const details = {
            timestamp: new Date().toISOString(),
            previousDb: this.currentDatabase === 'primary' ? 'secondary' : 'primary',
            currentDb: this.currentDatabase,
            systemType: 'date-based'
        };
        
        this.log(message, details);
        
        // Enviar email se configurado
        if (this.config.notifications.alertEmail) {
            // Implementar envio de email aqui se necessário
        }
    }

    async getStatus() {
        try {
            console.log('📊 DatabaseManager: Obtendo status dos bancos...');
            await this.ensureUsageLoaded();
            const status = {};
            
            for (const [dbName] of Object.entries(this.config.databases)) {
                console.log(`📊 Processando banco ${dbName}...`);
                const usage = this.usageTracking[dbName];
                
                // Sistema baseado em data
                const currentDate = new Date();
                const lastActivity = new Date(usage.lastActivity);
                const daysSinceActivity = Math.floor((currentDate - lastActivity) / (1000 * 60 * 60 * 24));
                
                // Próximo backup
                const day = currentDate.getDate();
                let nextBackupDay = '';
                if (day < 24) {
                    nextBackupDay = 'Dia 24';
                } else if (day === 24) {
                    nextBackupDay = 'Hoje às 3h';
                } else if (day === 25) {
                    nextBackupDay = 'Hoje às 3h';
                } else {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    nextMonth.setDate(24);
                    nextBackupDay = `${nextMonth.getDate()}/${nextMonth.getMonth() + 1}`;
                }
                
                status[dbName] = {
                    queries: usage.queries,
                    lastActivity: usage.lastActivity,
                    daysSinceActivity: daysSinceActivity,
                    isActive: dbName === this.currentDatabase,
                    systemMode: 'date-based',
                    nextBackupDay: nextBackupDay
                };
                
                console.log(`✅ Banco ${dbName}: ${usage.queries} queries executadas`);
            }
            
            console.log('✅ DatabaseManager: Status obtido com sucesso');
            return status;
        } catch (error) {
            console.error('❌ DatabaseManager: Erro ao obter status:', error.message);
            throw error;
        }
    }

    async log(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        
        console.log(logEntry, data || '');
        
        try {
            await fs.appendFile(
                this.config.monitoring.logFile, 
                logEntry + (data ? ' ' + JSON.stringify(data) : '') + '\n'
            );
        } catch (error) {
            console.error('Erro ao escrever no log:', error.message);
        }
    }

    async checkDatabasesHealth() {
        const healthStatus = {};
        
        for (const [dbName, connection] of Object.entries(this.connections)) {
            try {
                const startTime = Date.now();
                await connection`SELECT 1 as health_check`;
                const responseTime = Date.now() - startTime;
                
                healthStatus[dbName] = {
                    connected: true,
                    responseTime: responseTime,
                    error: null
                };
                
            } catch (error) {
                healthStatus[dbName] = {
                    connected: false,
                    responseTime: null,
                    error: error.message
                };
            }
        }
        
        return healthStatus;
    }

    // Método para ser usado como drop-in replacement do neon
    async query(strings, ...values) {
        if (Array.isArray(strings)) {
            // Template literal call - this is the proper tagged template format
            // Build the query string directly with the values interpolated
            let query = strings[0];
            for (let i = 0; i < values.length; i++) {
                const value = values[i];
                const interpolatedValue = this.escapeValue(value);
                query += interpolatedValue + (strings[i + 1] || '');
            }
            
            // Call executeQuery without parameters since we've already interpolated them
            return await this.executeQuery(query, []);
        } else {
            // Regular query call
            const queryString = strings;
            const params = values.length > 0 ? values[0] : [];
            return await this.executeQuery(queryString, params);
        }
    }
}

module.exports = DatabaseManager;

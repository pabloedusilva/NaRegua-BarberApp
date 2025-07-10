#!/usr/bin/env node

/**
 * Script para inicializar o banco secundário
 * Copia a estrutura e dados iniciais do banco primário
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

async function initializeSecondaryDatabase() {
    console.log('🔧 Inicializando banco secundário...\n');
    
    if (!process.env.DATABASE_URL_BACKUP) {
        console.error('❌ Erro: DATABASE_URL_BACKUP não configurado no .env');
        console.log('📋 Configure a variável DATABASE_URL_BACKUP com a URL do seu segundo banco Neon');
        return;
    }
    
    try {
        const primaryDb = neon(process.env.DATABASE_URL);
        const secondaryDb = neon(process.env.DATABASE_URL_BACKUP);
        
        console.log('✅ Conectado aos bancos primário e secundário\n');
        
        // Verificar se banco secundário está acessível
        console.log('🔍 Testando conexão com banco secundário...');
        await secondaryDb`SELECT 1`;
        console.log('✅ Banco secundário acessível\n');
        
        // Obter estrutura das tabelas do banco primário
        console.log('📋 Obtendo estrutura das tabelas...');
        const tables = await primaryDb`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        console.log(`📊 Encontradas ${tables.length} tabelas:`, tables.map(t => t.table_name).join(', '));
        
        for (const table of tables) {
            const tableName = table.table_name;
            console.log(`\n🔧 Processando tabela: ${tableName}`);
            
            // Obter definição da tabela
            const columns = await primaryDb`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = ${tableName}
                ORDER BY ordinal_position
            `;
            
            // Verificar se tabela já existe no banco secundário
            const tableExists = await secondaryDb`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = ${tableName}
            `;
            
            if (tableExists.length === 0) {
                console.log(`   📋 Criando estrutura da tabela ${tableName}...`);
                
                // Obter DDL completo da tabela (CREATE TABLE)
                const createTableQuery = `
                    SELECT 'CREATE TABLE ' || table_name || ' (' || 
                    string_agg(
                        column_name || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                            WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
                            WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
                            ELSE UPPER(data_type)
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ', '
                    ) || ')' as create_statement
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName}'
                    GROUP BY table_name
                `;
                
                try {
                    const createResult = await primaryDb(createTableQuery);
                    if (createResult.length > 0) {
                        await secondaryDb(createResult[0].create_statement);
                        console.log(`   ✅ Estrutura da tabela ${tableName} criada`);
                    }
                } catch (err) {
                    console.log(`   ⚠️ Erro ao criar ${tableName}, tentando método alternativo...`);
                    
                    // Método alternativo: criar tabela simples baseada nos dados
                    const data = await primaryDb`SELECT * FROM ${tableName} LIMIT 1`;
                    if (data.length > 0) {
                        const sampleRow = data[0];
                        const columnDefs = Object.keys(sampleRow).map(col => {
                            const value = sampleRow[col];
                            let type = 'TEXT';
                            
                            if (typeof value === 'number') {
                                type = Number.isInteger(value) ? 'INTEGER' : 'NUMERIC';
                            } else if (value instanceof Date) {
                                type = 'TIMESTAMP';
                            } else if (typeof value === 'boolean') {
                                type = 'BOOLEAN';
                            }
                            
                            return `${col} ${type}`;
                        }).join(', ');
                        
                        await secondaryDb(`CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`);
                        console.log(`   ✅ Estrutura básica da tabela ${tableName} criada`);
                    }
                }
            } else {
                console.log(`   ✅ Tabela ${tableName} já existe`);
            }
            
            // Copiar dados iniciais importantes (usuários, configurações)
            if (['usuarios', 'barbearia', 'servicos', 'horarios_turnos'].includes(tableName)) {
                console.log(`   📦 Copiando dados essenciais de ${tableName}...`);
                
                const data = await primaryDb`SELECT * FROM ${tableName}`;
                
                if (data.length > 0) {
                    // Limpar dados existentes
                    await secondaryDb`DELETE FROM ${tableName}`;
                    
                    // Inserir dados usando múltiplas queries individuais
                    for (const row of data) {
                        const columns = Object.keys(row);
                        const values = Object.values(row);
                        
                        // Inserir linha por linha de forma segura
                        try {
                            if (tableName === 'usuarios') {
                                await secondaryDb`INSERT INTO usuarios (id, username, password, role) VALUES (${row.id}, ${row.username}, ${row.password}, ${row.role}) ON CONFLICT (id) DO NOTHING`;
                            } else if (tableName === 'barbearia') {
                                await secondaryDb`INSERT INTO barbearia VALUES (${row.id}, ${row.nome}, ${row.telefone}, ${row.endereco}, ${row.horario_funcionamento}, ${row.descricao}) ON CONFLICT (id) DO NOTHING`;
                            } else if (tableName === 'servicos') {
                                await secondaryDb`INSERT INTO servicos VALUES (${row.id}, ${row.nome}, ${row.preco}, ${row.duracao_minutos}, ${row.descricao}, ${row.ativo}) ON CONFLICT (id) DO NOTHING`;
                            } else if (tableName === 'horarios_turnos') {
                                await secondaryDb`INSERT INTO horarios_turnos VALUES (${row.id}, ${row.dia_semana}, ${row.horario_inicio}, ${row.horario_fim}, ${row.ativo}) ON CONFLICT (id) DO NOTHING`;
                            }
                        } catch (insertError) {
                            console.log(`   ⚠️ Erro ao inserir registro em ${tableName}:`, insertError.message);
                        }
                    }
                    
                    console.log(`   ✅ ${data.length} registros copiados para ${tableName}`);
                } else {
                    console.log(`   ℹ️ Tabela ${tableName} está vazia`);
                }
            }
        }
        
        console.log('\n🎉 Inicialização do banco secundário concluída!');
        console.log('📋 O sistema de backup automático agora está pronto para uso.');
        console.log('\n💡 Próximos passos:');
        console.log('1. Inicie sua aplicação normalmente');
        console.log('2. Ou execute: node backup-system/standalone.js');
        console.log('3. Monitore os logs em: backup-system/backup-system.log');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        console.log('\n🔧 Dicas para solução:');
        console.log('1. Verifique se DATABASE_URL_BACKUP está correta');
        console.log('2. Confirme que o segundo banco Neon está ativo');
        console.log('3. Teste a conexão manualmente');
    }
}

initializeSecondaryDatabase().catch(console.error);

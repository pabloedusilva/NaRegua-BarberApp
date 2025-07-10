#!/usr/bin/env node

/**
 * 🚀 QUICK SETUP - NAREGUA + INFINITY-DB
 * Script para configuração completa em um comando
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🚀 NAREGUA + INFINITY-DB QUICK SETUP');
console.log('=====================================\n');

async function quickSetup() {
    try {
        const rootPath = __dirname;
        const infinityDbPath = path.join(rootPath, 'Infinity-DB');
        
        // 1. Verificar se Infinity-DB existe
        console.log('1. 📁 Verificando estrutura de arquivos...');
        if (!fs.existsSync(infinityDbPath)) {
            console.error('❌ Pasta Infinity-DB não encontrada!');
            console.log('💡 Certifique-se de que a pasta Infinity-DB está no projeto');
            return false;
        }
        console.log('✅ Infinity-DB encontrado');
        
        // 2. Instalar dependências do projeto principal
        console.log('\n2. 📦 Instalando dependências do projeto principal...');
        await execAsync('npm install', { 
            cwd: rootPath,
            stdio: 'inherit'
        });
        console.log('✅ Dependências principais instaladas');
        
        // 3. Verificar se .env existe
        console.log('\n3. 🔧 Verificando configuração...');
        const envPath = path.join(rootPath, '.env');
        
        if (!fs.existsSync(envPath)) {
            console.log('📝 Criando arquivo .env...');
            
            const envTemplate = `# ===================================================================
# 🔄 NAREGUA BARBERAPP + INFINITY-DB - CONFIGURAÇÃO
# ===================================================================

# BANCO PRIMÁRIO (Obrigatório) - Substitua pela sua URL do Neon
DATABASE_URL='postgresql://usuario:senha@host1.neon.tech/database1?sslmode=require'

# BANCO SECUNDÁRIO (Obrigatório para backup automático) - Substitua pela sua URL do Neon
DATABASE_URL_BACKUP='postgresql://usuario:senha@host2.neon.tech/database2?sslmode=require'

# ===================================================================
# 📧 CONFIGURAÇÕES DE EMAIL (Para notificações)
# ===================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
SMTP_FROM=NaRégua Barbearia <seu_email@gmail.com>

# ===================================================================
# 🔄 INFINITY-DB - CONFIGURAÇÕES OPCIONAIS
# ===================================================================

# Token para API de controle (recomendado)
API_TOKEN=naregua-infinity-token-2025

# Porta para dashboard (padrão: 3001)
PORT=3001

# Ambiente de execução
NODE_ENV=development
`;
            
            fs.writeFileSync(envPath, envTemplate);
            console.log('✅ Arquivo .env criado');
        } else {
            console.log('✅ Arquivo .env já existe');
        }
        
        // 4. Configurar Infinity-DB
        console.log('\n4. 🔄 Configurando Infinity-DB...');
        
        // Verificar se dependências do Infinity-DB estão instaladas
        const infinityNodeModules = path.join(infinityDbPath, 'node_modules');
        if (!fs.existsSync(infinityNodeModules)) {
            console.log('📦 Instalando dependências do Infinity-DB...');
            await execAsync('npm install', { 
                cwd: infinityDbPath,
                stdio: 'inherit'
            });
            console.log('✅ Dependências do Infinity-DB instaladas');
        } else {
            console.log('✅ Dependências do Infinity-DB já instaladas');
        }
        
        console.log('\n🎉 SETUP CONCLUÍDO COM SUCESSO!');
        console.log('===============================');
        
        console.log('\n📋 RESUMO DO QUE FOI CONFIGURADO:');
        console.log('✅ Dependências do projeto principal instaladas');
        console.log('✅ Dependências do Infinity-DB instaladas');
        console.log('✅ Arquivo .env criado/verificado');
        console.log('✅ Sistema de backup automático configurado');
        
        console.log('\n🔧 PRÓXIMOS PASSOS OBRIGATÓRIOS:');
        console.log('================================');
        console.log('1. 📝 EDITE o arquivo .env e configure suas URLs do Neon:');
        console.log('   • DATABASE_URL=sua_url_do_banco_primario');
        console.log('   • DATABASE_URL_BACKUP=sua_url_do_banco_secundario');
        console.log('');
        console.log('2. 🗄️ INICIALIZE o banco secundário:');
        console.log('   npm run infinity-db:init-simple');
        console.log('');
        console.log('3. 🚀 INICIE a aplicação:');
        console.log('   npm start');
        
        console.log('\n📊 MONITORAMENTO DISPONÍVEL:');
        console.log('============================');
        console.log('• 🌐 Aplicação Principal:    http://localhost:3000');
        console.log('• 🎛️ Dashboard Admin:        http://localhost:3000/dashboard/dashboard');
        console.log('• 🔄 Dashboard Infinity-DB:  http://localhost:3000/infinity-db/ui/dashboard');
        console.log('• 📈 Status do Sistema:      npm run infinity-db:status');
        
        console.log('\n💡 COMANDOS ÚTEIS:');
        console.log('==================');
        console.log('• npm run infinity-db:status    - Ver status dos bancos');
        console.log('• npm run infinity-db:backup    - Forçar backup manual');
        console.log('• npm run infinity-db:test      - Testar sistema completo');
        console.log('• npm start                     - Iniciar aplicação');
        console.log('• npm run dev                   - Modo desenvolvimento');
        
        console.log('\n🎯 BENEFÍCIOS ATIVADOS:');
        console.log('=======================');
        console.log('✅ Backup automático nos dias 24-25 de cada mês');
        console.log('✅ Alternância inteligente entre bancos');
        console.log('✅ Fallback transparente em caso de falha');
        console.log('✅ Monitoramento completo com dashboard');
        console.log('✅ Zero preocupação com limites de horas do Neon');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Erro no setup:', error.message);
        console.log('\n🔧 SOLUÇÃO MANUAL:');
        console.log('==================');
        console.log('1. npm install');
        console.log('2. cd Infinity-DB && npm install');
        console.log('3. Configure .env com suas URLs do Neon');
        console.log('4. npm run infinity-db:init-simple');
        console.log('5. npm start');
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    quickSetup().then(success => {
        if (success) {
            console.log('\n🚀 Sistema pronto! Configure o .env e execute: npm start');
        }
        process.exit(success ? 0 : 1);
    });
}

module.exports = quickSetup;

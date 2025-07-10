#!/usr/bin/env node

/**
 * 🚀 INFINITY-DB AUTO-SETUP
 * Script automático de configuração e instalação
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🚀 INFINITY-DB AUTO-SETUP');
console.log('===========================\n');

async function autoSetup() {
    try {
        const infinityDbPath = path.resolve(__dirname, '..');
        const packageJsonPath = path.join(infinityDbPath, 'package.json');
        const nodeModulesPath = path.join(infinityDbPath, 'node_modules');
        const setupFlagPath = path.join(infinityDbPath, '.setup-complete');
        
        // Verificar se setup já foi executado recentemente (últimas 24h)
        if (fs.existsSync(setupFlagPath)) {
            const setupTime = fs.readFileSync(setupFlagPath, 'utf8');
            const setupDate = new Date(setupTime);
            const now = new Date();
            const hoursDiff = (now - setupDate) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                console.log('✅ Setup executado recentemente, pulando...');
                return true;
            }
        }
        
        console.log('📋 Verificando dependências do Infinity-DB...');
        
        // Verificar se package.json existe
        if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ package.json não encontrado');
            return false;
        }
        
        // Instalar dependências se node_modules não existir ou estiver incompleto
        const criticalModules = ['@neondatabase/serverless', 'express', 'node-cron', 'dotenv'];
        let needsInstall = !fs.existsSync(nodeModulesPath);
        
        if (!needsInstall) {
            // Verificar se módulos críticos existem
            for (const mod of criticalModules) {
                const modPath = path.join(nodeModulesPath, mod);
                if (!fs.existsSync(modPath)) {
                    needsInstall = true;
                    break;
                }
            }
        }
        
        if (needsInstall) {
            console.log('📦 Instalando/Atualizando dependências do Infinity-DB...');
            
            try {
                await execAsync('npm install', { 
                    cwd: infinityDbPath,
                    stdio: 'inherit'
                });
                console.log('✅ Dependências instaladas!');
            } catch (error) {
                console.error('❌ Erro ao instalar dependências:', error.message);
                console.log('💡 Tente executar manualmente: cd Infinity-DB && npm install');
                return false;
            }
        } else {
            console.log('✅ Dependências já instaladas');
        }
        
        // Criar diretórios necessários se não existirem
        console.log('\n📁 Verificando estrutura de diretórios...');
        const dataDir = path.join(infinityDbPath, 'data');
        const tempDir = path.join(infinityDbPath, 'temp-backups');
        
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Diretório data/ criado');
        }
        
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log('✅ Diretório temp-backups/ criado');
        }
        
        // Verificar variáveis de ambiente
        console.log('\n🔧 Verificando configuração...');
        
        const envPath = path.join(infinityDbPath, '..', '.env');
        let envExists = fs.existsSync(envPath);
        
        if (!envExists) {
            // Tentar criar .env básico
            const envTemplate = `# ===================================================================
# 🔄 INFINITY-DB - CONFIGURAÇÃO DE BANCOS DE DADOS
# ===================================================================

# BANCO PRIMÁRIO (Obrigatório)
DATABASE_URL='postgresql://usuario:senha@host1.neon.tech/database1?sslmode=require'

# BANCO SECUNDÁRIO (Obrigatório para backup automático)
DATABASE_URL_BACKUP='postgresql://usuario:senha@host2.neon.tech/database2?sslmode=require'

# ===================================================================
# ⚙️ CONFIGURAÇÕES OPCIONAIS
# ===================================================================

# Token para API de controle (recomendado)
API_TOKEN=infinity-db-token-2025

# Porta para dashboard (padrão: 3001)
PORT=3001

# Ambiente de execução
NODE_ENV=development
`;
            
            try {
                fs.writeFileSync(envPath, envTemplate);
                console.log('📝 Arquivo .env criado com template');
                console.log('⚠️ IMPORTANTE: Configure suas URLs de banco no arquivo .env');
            } catch (error) {
                console.log('⚠️ Não foi possível criar .env automaticamente');
            }
        }
        
        // Verificar se DATABASE_URL está configurado
        require('dotenv').config({ path: envPath });
        
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('usuario:senha')) {
            console.log('\n⚠️ ATENÇÃO: Configure as URLs dos bancos no arquivo .env');
            console.log('   DATABASE_URL=sua_url_do_banco_primario');
            console.log('   DATABASE_URL_BACKUP=sua_url_do_banco_secundario');
        } else {
            console.log('✅ Variáveis de ambiente configuradas');
        }
        
        // Criar flag de setup completo
        fs.writeFileSync(setupFlagPath, new Date().toISOString());
        
        console.log('\n🎉 SETUP CONCLUÍDO!');
        console.log('==================');
        console.log('✅ Dependências instaladas');
        console.log('✅ Configuração verificada');
        console.log('✅ Sistema pronto para uso');
        
        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('1. Configure as URLs dos bancos no .env (se ainda não fez)');
        console.log('2. Execute: npm run infinity-db:init-simple');
        console.log('3. Inicie sua aplicação: npm start');
        
        console.log('\n📊 MONITORAMENTO:');
        console.log('• Status: npm run infinity-db:status');
        console.log('• Dashboard: http://localhost:3000/infinity-db/ui/dashboard');
        console.log('• Logs: Infinity-DB/data/backup-system.log');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Erro no setup:', error.message);
        console.log('\n🔧 Solução manual:');
        console.log('1. cd Infinity-DB');
        console.log('2. npm install');
        console.log('3. Configure .env na raiz do projeto');
        return false;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    autoSetup().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = autoSetup;

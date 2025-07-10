#!/usr/bin/env node

/**
 * Script standalone para iniciar o sistema de backup
 * Use: node backup-system/standalone.js
 */

require('dotenv').config({ path: '../../.env' });
const BackupScheduler = require('../core/scheduler');

console.log('🚀 Iniciando Sistema de Backup Standalone NaRégua');
console.log('📋 Pressione Ctrl+C para parar');

const scheduler = new BackupScheduler();

// Capturar sinais de parada
process.on('SIGINT', () => {
    console.log('\n🛑 Parando sistema de backup...');
    scheduler.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Sistema terminado');
    scheduler.stop();
    process.exit(0);
});

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não tratado:', error);
    scheduler.stop();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason);
    // Não parar o processo, apenas logar
});

// Iniciar o sistema
try {
    scheduler.start();
    
    // Comandos interativos via stdin
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (input) => {
        const command = input.trim().toLowerCase();
        
        switch (command) {
            case 'status':
                console.log('📊 Gerando relatório...');
                const report = await scheduler.getSystemReport();
                console.log(JSON.stringify(report, null, 2));
                break;
                
            case 'backup':
                console.log('📦 Forçando backup...');
                const backupResult = await scheduler.forceBackup();
                console.log(backupResult ? '✅ Backup iniciado' : '❌ Erro no backup');
                break;
                
            case 'switch':
                console.log('🔄 Forçando troca de banco...');
                const switchResult = await scheduler.forceDatabaseSwitch();
                console.log(switchResult ? '✅ Banco alternado' : '❌ Erro na troca');
                break;
                
            case 'help':
                console.log('\n📋 Comandos disponíveis:');
                console.log('  status  - Mostrar status do sistema');
                console.log('  backup  - Forçar backup manual');
                console.log('  switch  - Forçar troca de banco');
                console.log('  help    - Mostrar esta ajuda');
                console.log('  exit    - Parar o sistema\n');
                break;
                
            case 'exit':
                console.log('👋 Parando sistema...');
                scheduler.stop();
                process.exit(0);
                break;
                
            default:
                if (command) {
                    console.log('❓ Comando desconhecido. Digite "help" para ver os comandos disponíveis.');
                }
                break;
        }
    });
    
    console.log('\n💡 Digite "help" para ver comandos disponíveis');
    
} catch (error) {
    console.error('❌ Erro ao iniciar sistema:', error);
    process.exit(1);
}

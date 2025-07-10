#!/usr/bin/env node

/**
 * Script simples para inicializar o banco secundário
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

async function initializeSecondaryDatabase() {
    console.log('🔧 Inicializando banco secundário de forma simples...\n');
    
    if (!process.env.DATABASE_URL_BACKUP) {
        console.error('❌ Erro: DATABASE_URL_BACKUP não configurado no .env');
        return;
    }
    
    try {
        const primaryDb = neon(process.env.DATABASE_URL);
        const secondaryDb = neon(process.env.DATABASE_URL_BACKUP);
        
        console.log('✅ Conectado aos bancos primário e secundário\n');
        
        // Testar conexões
        await primaryDb`SELECT 1`;
        await secondaryDb`SELECT 1`;
        console.log('✅ Ambas as conexões funcionando\n');
        
        // Copiar dados essenciais da tabela usuarios
        console.log('📦 Copiando usuários...');
        const usuarios = await primaryDb`SELECT * FROM usuarios`;
        
        for (const usuario of usuarios) {
            try {
                await secondaryDb`
                    INSERT INTO usuarios (username, password, role) 
                    VALUES (${usuario.username}, ${usuario.password}, ${usuario.role})
                    ON CONFLICT (username) DO NOTHING
                `;
            } catch (e) {
                console.log(`   ⚠️ Usuário ${usuario.username} já existe ou erro`);
            }
        }
        console.log(`✅ ${usuarios.length} usuários processados\n`);
        
        // Copiar dados da barbearia
        console.log('📦 Copiando dados da barbearia...');
        const barbearia = await primaryDb`SELECT * FROM barbearia LIMIT 1`;
        
        if (barbearia.length > 0) {
            const b = barbearia[0];
            try {
                await secondaryDb`
                    INSERT INTO barbearia (nome, endereco, cidade_estado, whatsapp, instagram, foto, email_notificacao)
                    VALUES (${b.nome}, ${b.endereco}, ${b.cidade_estado}, ${b.whatsapp}, ${b.instagram}, ${b.foto}, ${b.email_notificacao})
                `;
            } catch (e) {
                console.log('   ⚠️ Dados da barbearia já existem ou erro');
            }
        }
        console.log('✅ Dados da barbearia copiados\n');
        
        // Copiar serviços
        console.log('📦 Copiando serviços...');
        const servicos = await primaryDb`SELECT * FROM servicos`;
        
        for (const servico of servicos) {
            try {
                await secondaryDb`
                    INSERT INTO servicos (nome, tempo, preco, imagem, ativo)
                    VALUES (${servico.nome}, ${servico.tempo}, ${servico.preco}, ${servico.imagem}, ${servico.ativo})
                `;
            } catch (e) {
                // Serviço já existe
            }
        }
        console.log(`✅ ${servicos.length} serviços processados\n`);
        
        console.log('🎉 Inicialização do banco secundário concluída!');
        console.log('📋 O sistema de backup automático está pronto para uso.');
        console.log('\n💡 Próximos passos:');
        console.log('1. Inicie sua aplicação normalmente');
        console.log('2. O sistema fará backup automático quando necessário');
        console.log('3. Monitore através do dashboard em /dashboard/dashboard');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error.message);
        console.log('\n🔧 Dicas para solução:');
        console.log('1. Verifique se DATABASE_URL_BACKUP está correta');
        console.log('2. Confirme que o segundo banco Neon está ativo');
        console.log('3. Certifique-se que ambos bancos têm a mesma estrutura');
    }
}

initializeSecondaryDatabase().catch(console.error);

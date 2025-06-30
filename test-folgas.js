const db = require('./db/neon');

async function testFolgasEspeciais() {
    try {
        console.log('Buscando folgas especiais...');
        const rows = await db`SELECT * FROM folgas_especiais`;
        console.log('Folgas especiais:', rows);
        
        // Inserir uma folga de teste para 03/07/2025
        console.log('Inserindo folga de teste para 03/07/2025...');
        await db`
            INSERT INTO folgas_especiais (data, motivo)
            VALUES ('2025-07-03', 'Teste de folga especial')
            ON CONFLICT (data) DO UPDATE SET motivo = EXCLUDED.motivo
        `;
        
        console.log('Folga inserida/atualizada com sucesso!');
        
        // Verificar novamente
        const updatedRows = await db`SELECT * FROM folgas_especiais`;
        console.log('Folgas especiais atualizadas:', updatedRows);
        
    } catch (err) {
        console.error('Erro:', err);
    }
    process.exit(0);
}

testFolgasEspeciais();

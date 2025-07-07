-- Script de migração: atualizar caminhos das imagens para nova estrutura
-- Execute este script após mover a pasta img para uploads/img

-- Atualizar URLs dos wallpapers
UPDATE wallpapers 
SET url = REPLACE(url, '/img/', '/uploads/img/') 
WHERE url LIKE '/img/%';

-- Atualizar URLs das imagens de serviços  
UPDATE servico_imagens 
SET url = REPLACE(url, '/img/', '/uploads/img/') 
WHERE url LIKE '/img/%';

-- Atualizar avatares dos profissionais
UPDATE profissionais 
SET avatar = REPLACE(avatar, 'img/', '/uploads/img/') 
WHERE avatar LIKE 'img/%' OR avatar LIKE '/img/%';

-- Atualizar possíveis imagens de serviços cadastrados
UPDATE servicos 
SET imagem = REPLACE(imagem, '/img/', '/uploads/img/') 
WHERE imagem LIKE '/img/%';

-- Atualizar foto da barbearia se necessário
UPDATE barbearia 
SET foto = REPLACE(foto, '/img/', '/uploads/img/') 
WHERE foto LIKE '/img/%';

-- Atualizar possíveis imagens de alertas/promos
UPDATE alertas_promos 
SET imagem = REPLACE(imagem, '/img/', '/uploads/img/') 
WHERE imagem LIKE '/img/%';

-- Verificar se as atualizações foram feitas corretamente
SELECT 'Wallpapers atualizados:' as tipo, COUNT(*) as total FROM wallpapers WHERE url LIKE '/uploads/img/%'
UNION ALL
SELECT 'Imagens de serviços atualizadas:', COUNT(*) FROM servico_imagens WHERE url LIKE '/uploads/img/%'
UNION ALL  
SELECT 'Avatares atualizados:', COUNT(*) FROM profissionais WHERE avatar LIKE '/uploads/img/%'
UNION ALL
SELECT 'Serviços atualizados:', COUNT(*) FROM servicos WHERE imagem LIKE '/uploads/img/%'
UNION ALL
SELECT 'Fotos da barbearia atualizadas:', COUNT(*) FROM barbearia WHERE foto LIKE '/uploads/img/%';

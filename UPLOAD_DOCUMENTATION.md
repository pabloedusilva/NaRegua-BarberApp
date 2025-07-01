# Documentação do Sistema de Upload de Imagens

## Visão Geral
O sistema de upload foi completamente implementado e organizado para permitir upload real de arquivos do dispositivo para pastas específicas dentro de `public/uploads/` com compressão automática de imagens para otimizar o desempenho do site.

## Estrutura de Pastas
```
public/
├── uploads/
│   ├── services/          # Novas imagens de serviços (uploads via dashboard)
│   ├── wallpapers/        # Novos wallpapers (uploads via dashboard)
│   ├── logos/             # Novas fotos da barbearia/logos
│   ├── avatars/           # Novos avatares de profissionais
│   ├── promos/            # Novas imagens de promoções/alertas
│   └── img/               # Pasta legacy (imagens originais do sistema)
│       ├── servicos/      # Imagens de serviços originais
│       ├── wallpappers/   # Wallpapers originais
│       └── logo/          # Logos originais
```

## Funcionalidades Implementadas

### 1. Upload de Imagens de Serviços
- **Local:** Modais de adicionar/editar serviços na dashboard
- **Botão:** "Fazer Upload de Imagem"
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Pasta:** `public/uploads/services/`
- **Galeria:** Exibe apenas imagens de serviços (pasta `services` + `img/servicos`)
- **Integração:** As imagens são automaticamente incluídas na galeria de seleção

### 2. Upload de Avatares de Profissionais
- **Local:** Modal de adicionar/editar profissionais
- **Compressão:** 200x200px (quadrado), qualidade 90%, formato WebP
- **Pasta:** `public/uploads/avatars/`
- **Preview:** Tempo real antes do upload

### 3. Upload de Foto da Barbearia
- **Local:** Modal de editar informações da barbearia
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Pasta:** `public/uploads/logos/`
- **Preview:** Tempo real com fallback para ícone

### 4. Upload de Imagens para Alertas/Promos
- **Local:** Modal de criar/editar alertas e promoções
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Pasta:** `public/uploads/promos/`
- **Galeria:** Exibe apenas imagens de promoções
- **Preview:** Tempo real

### 5. Upload de Wallpapers
- **Local:** Seção de wallpapers na dashboard
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Pasta:** `public/uploads/wallpapers/`
- **Funcionalidade:** Automaticamente adicionado à lista de wallpapers

## Rotas de API

### Rotas de Upload por Categoria
- `POST /api/upload/service` - Upload de imagens de serviços
- `POST /api/upload/wallpaper` - Upload de wallpapers
- `POST /api/upload/logo` - Upload de logos/fotos da barbearia
- `POST /api/upload/avatar` - Upload de avatares
- `POST /api/upload/promo` - Upload de imagens de promoções

### Rotas de Listagem por Categoria
- `GET /api/imagens-servicos` - Lista imagens de serviços
- `GET /api/imagens-wallpapers` - Lista wallpapers
- `GET /api/imagens-logos` - Lista logos
- `GET /api/imagens-avatars` - Lista avatares
- `GET /api/imagens-promos` - Lista imagens de promoções
- `GET /api/imagens-todas` - Lista todas as imagens (compatibilidade)

## Funções JavaScript

### Funções de Upload Específicas
```javascript
window.uploadService(file)    // Upload para pasta services
window.uploadWallpaper(file)  // Upload para pasta wallpapers  
window.uploadLogo(file)       // Upload para pasta logos
window.uploadAvatar(file)     // Upload para pasta avatars
window.uploadPromo(file)      // Upload para pasta promos
window.uploadImage(file)      // Compatibilidade (usa service)
```

### Funções de Galeria
```javascript
carregarGaleriaImagens(galleryId, inputId, selectedUrl, tipoImagem)
carregarGaleriaImagensServico(galleryId, inputId, selectedUrl)
carregarGaleriaWallpapers(galleryId, inputId, selectedUrl)
carregarGaleriaLogos(galleryId, inputId, selectedUrl)
carregarGaleriaAvatares(galleryId, inputId, selectedUrl)
carregarGaleriaPromos(galleryId, inputId, selectedUrl)
```

## Migração de Dados

### Script de Migração
Criado o arquivo `migration_update_image_paths.sql` para atualizar caminhos existentes no banco de dados:
```sql
-- Atualiza todos os caminhos de /img/ para /uploads/img/
UPDATE wallpapers SET url = REPLACE(url, '/img/', '/uploads/img/');
UPDATE servico_imagens SET url = REPLACE(url, '/img/', '/uploads/img/');
-- etc...
```

### Banco de Dados Atualizado
- URLs no `scriptDB_postgres.sql` atualizadas para usar `/uploads/img/`
- Compatibilidade total mantida entre imagens novas e legacy

## Separação por Tipos

### ✅ Implementado
- **Serviços:** Galeria mostra apenas imagens de `uploads/services` + `uploads/img/servicos`
- **Wallpapers:** Sistema de banco + pasta `uploads/wallpapers` + `uploads/img/wallpappers`
- **Avatares:** Upload direto para `uploads/avatars`
- **Logos:** Upload para `uploads/logos` + compatibilidade com `uploads/img/logo`
- **Promoções:** Galeria específica para `uploads/promos`

## Uso Prático

### Para Desenvolvedores
1. Use as funções específicas de upload: `uploadService()`, `uploadWallpaper()`, etc.
2. Use as funções de galeria para cada tipo: `carregarGaleriaImagensServico()`, etc.
3. Execute o script de migração no banco se houver dados existentes

### Para Usuários Finais
1. **Serviços:** Cada modal de serviço mostra apenas imagens de serviços na galeria
2. **Wallpapers:** Upload via botão específico, aparecem automaticamente na lista
3. **Promoções:** Galeria específica no modal de criação/edição
4. **Avatares:** Upload direto com preview instantâneo
5. **Barbearia:** Upload da foto com preview

## Arquivos Modificados
- `middleware/upload.js` - Middleware de upload categorizado
- `routes/imagens.js` - Rotas de listagem por categoria
- `public/js/upload-helper.js` - Funções de upload específicas
- `dashboard/js/dashboard.js` - Galerias e uploads categorizados
- `dashboard/dashboard.html` - Galeria para promoções
- `scriptDB_postgres.sql` - URLs atualizadas
- `migration_update_image_paths.sql` - Script de migração

### 2. Upload de Avatares de Profissionais
- **Local:** Modal de adicionar/editar profissionais
- **Compressão:** 200x200px (quadrado), qualidade 90%, formato WebP
- **Preview:** Tempo real antes do upload

### 3. Upload de Foto da Barbearia
- **Local:** Modal de editar informações da barbearia
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Preview:** Tempo real com fallback para ícone

### 4. Upload de Imagens para Alertas/Promos
- **Local:** Modal de criar/editar alertas e promoções
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Preview:** Tempo real

### 5. Upload de Wallpapers
- **Local:** Seção de wallpapers na dashboard
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Funcionalidade:** Automaticamente adicionado à lista de wallpapers

## Características Técnicas

### Compressão de Imagens
- **Biblioteca:** Sharp (alta performance)
- **Formato de saída:** WebP (melhor compressão)
- **Redução de tamanho:** Aproximadamente 60-80% menor que o original
- **Qualidade:** Mantida em 85-90% para preservar a qualidade visual

### Validações
- **Tipos permitidos:** JPG, JPEG, PNG, GIF, WEBP
- **Tamanho máximo:** 10MB (antes da compressão)
- **Validação no frontend e backend**

### Estrutura de Arquivos
```
uploads/
├── {timestamp}-{random}.webp          # Imagens gerais
├── avatar-{timestamp}-{random}.webp   # Avatares
└── ...
```

### APIs Disponíveis
- `POST /api/upload/image` - Upload de imagens gerais
- `POST /api/upload/avatar` - Upload de avatares
- `GET /api/imagens-todas` - Lista todas as imagens (servicos + uploads)
- `GET /api/imagens-servicos` - Lista apenas imagens da pasta servicos
- `GET /api/imagens-uploads` - Lista apenas imagens da pasta uploads

## Como Usar

### Para o Usuário Final
1. Abra qualquer modal que tenha campo de imagem
2. Clique no botão "Fazer Upload de Imagem"
3. Selecione uma imagem do seu dispositivo
4. Aguarde o upload e compressão (indicador de loading)
5. A imagem será automaticamente selecionada e será mostrado um preview

### Para Desenvolvedores
```javascript
// Fazer upload de uma imagem
const uploadResult = await window.uploadImage(file);
console.log(uploadResult.path); // /uploads/123456-789.webp

// Fazer upload de um avatar
const avatarResult = await window.uploadAvatar(file);
console.log(avatarResult.path); // /uploads/avatar-123456-789.webp

// Validar arquivo antes do upload
window.validateImageFile(file); // Throws error se inválido

// Mostrar preview
window.showImagePreview(file, previewElement);
```

## Benefícios

### Performance
- **Arquivos 60-80% menores** que o original
- **Formato WebP** para melhor compressão
- **Carregamento mais rápido** das páginas

### Usabilidade
- **Upload real** do dispositivo do usuário
- **Preview em tempo real** de todas as imagens
- **Loading indicators** durante o processo
- **Validação** com mensagens de erro claras

### Manutenção
- **Arquivos organizados** na pasta uploads
- **Nomes únicos** evitam conflitos
- **Integração perfeita** com funcionalidades existentes

## Estrutura do Projeto

### Arquivos Modificados/Criados
- `middleware/upload.js` - Middleware de upload e compressão
- `routes/imagens.js` - APIs de listagem de imagens
- `public/js/upload-helper.js` - Utilitários frontend
- `dashboard/dashboard.html` - Botões de upload
- `dashboard/js/dashboard.js` - Funcionalidades de upload
- `server.js` - Rotas de upload configuradas

### Dependências
- `multer@2.0.1` - Gerenciamento de uploads
- `sharp@0.34.2` - Compressão de imagens

## Status
✅ **IMPLEMENTADO E FUNCIONAL**

Todas as funcionalidades de upload foram implementadas com sucesso, mantendo as funcionalidades existentes e adicionando upload real com compressão automática de imagens.

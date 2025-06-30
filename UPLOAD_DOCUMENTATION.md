# Documentação do Sistema de Upload de Imagens

## Visão Geral
O sistema de upload foi completamente implementado para permitir upload real de arquivos do dispositivo para a pasta `uploads/` com compressão automática de imagens para otimizar o desempenho do site.

## Funcionalidades Implementadas

### 1. Upload de Imagens de Serviços
- **Local:** Modais de adicionar/editar serviços na dashboard
- **Botão:** "Fazer Upload de Imagem"
- **Compressão:** 800x600px, qualidade 85%, formato WebP
- **Integração:** As imagens são automaticamente incluídas na galeria de seleção

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

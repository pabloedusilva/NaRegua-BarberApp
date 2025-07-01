const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Função auxiliar para ler imagens de um diretório
const lerImagens = (dir, prefixo) => {
    try {
        const files = fs.readdirSync(dir);
        return files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
                  .map(f => `${prefixo}/${f}`);
    } catch (err) {
        return [];
    }
};

// Rota para listar imagens de serviços (uploads/services + uploads/img/servicos)
router.get('/imagens-servicos', (req, res) => {
    const uploadsServicesDir = path.join(__dirname, '../public/uploads/services');
    const imgServicosDir = path.join(__dirname, '../public/uploads/img/servicos');
    
    let imagens = [];
    
    // Adicionar imagens da nova pasta services
    imagens = imagens.concat(lerImagens(uploadsServicesDir, '/uploads/services'));
    
    // Adicionar imagens da pasta img/servicos (legacy)
    imagens = imagens.concat(lerImagens(imgServicosDir, '/uploads/img/servicos'));
    
    res.json(imagens);
});

// Rota para listar imagens de wallpapers
router.get('/imagens-wallpapers', (req, res) => {
    const wallpapersDir = path.join(__dirname, '../public/uploads/wallpapers');
    const legacyWallpapersDir = path.join(__dirname, '../public/uploads/img/wallpappers');
    
    let imagens = [];
    
    // Adicionar imagens da nova pasta wallpapers
    imagens = imagens.concat(lerImagens(wallpapersDir, '/uploads/wallpapers'));
    
    // Adicionar imagens da pasta legacy (note: wallpappers com 2 p's)
    imagens = imagens.concat(lerImagens(legacyWallpapersDir, '/uploads/img/wallpappers'));
    
    res.json(imagens);
});

// Rota para listar imagens de logos
router.get('/imagens-logos', (req, res) => {
    const logosDir = path.join(__dirname, '../public/uploads/logos');
    const legacyLogosDir = path.join(__dirname, '../public/uploads/img/logo');
    
    let imagens = [];
    
    // Adicionar imagens da nova pasta logos
    imagens = imagens.concat(lerImagens(logosDir, '/uploads/logos'));
    
    // Adicionar imagens da pasta legacy
    imagens = imagens.concat(lerImagens(legacyLogosDir, '/uploads/img/logo'));
    
    res.json(imagens);
});

// Rota para listar avatars
router.get('/imagens-avatars', (req, res) => {
    const avatarsDir = path.join(__dirname, '../public/uploads/avatars');
    const imagens = lerImagens(avatarsDir, '/uploads/avatars');
    res.json(imagens);
});

// Rota para listar imagens de promoções
router.get('/imagens-promos', (req, res) => {
    const promosDir = path.join(__dirname, '../public/uploads/promos');
    const imagens = lerImagens(promosDir, '/uploads/promos');
    res.json(imagens);
});

// Rota para listar imagens da pasta uploads (todas as categorias)
router.get('/imagens-uploads', (req, res) => {
    const baseDir = path.join(__dirname, '../public/uploads');
    let todasImagens = [];
    
    // Listar imagens de todas as subpastas
    const subfolders = ['services', 'wallpapers', 'logos', 'avatars', 'promos'];
    
    subfolders.forEach(subfolder => {
        const dir = path.join(baseDir, subfolder);
        todasImagens = todasImagens.concat(lerImagens(dir, `/uploads/${subfolder}`));
    });
    
    res.json(todasImagens);
});

// Rota para listar todas as imagens (uploads + legacy img)
router.get('/imagens-todas', (req, res) => {
    const baseUploadsDir = path.join(__dirname, '../public/uploads');
    const imgDir = path.join(__dirname, '../public/uploads/img');
    
    let todasImagens = [];
    
    // Adicionar imagens das novas pastas organizadas
    const subfolders = ['services', 'wallpapers', 'logos', 'avatars', 'promos'];
    subfolders.forEach(subfolder => {
        const dir = path.join(baseUploadsDir, subfolder);
        todasImagens = todasImagens.concat(lerImagens(dir, `/uploads/${subfolder}`));
    });
    
    // Adicionar imagens da pasta img legacy
    if (fs.existsSync(imgDir)) {
        const imgSubfolders = fs.readdirSync(imgDir, { withFileTypes: true })
                               .filter(dirent => dirent.isDirectory())
                               .map(dirent => dirent.name);
        
        imgSubfolders.forEach(subfolder => {
            const dir = path.join(imgDir, subfolder);
            todasImagens = todasImagens.concat(lerImagens(dir, `/uploads/img/${subfolder}`));
        });
    }
    
    res.json(todasImagens);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Rota para listar imagens da pasta servicos
router.get('/imagens-servicos', (req, res) => {
    const dir = path.join(__dirname, '../public/img/servicos');
    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ler imagens.' });
        }
        // Filtra apenas arquivos de imagem
        const imagens = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .map(f => `/img/servicos/${f}`);
        res.json(imagens);
    });
});

// Rota para listar imagens da pasta uploads
router.get('/imagens-uploads', (req, res) => {
    const dir = path.join(__dirname, '../uploads');
    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ler imagens da pasta uploads.' });
        }
        // Filtra apenas arquivos de imagem
        const imagens = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .map(f => `/uploads/${f}`);
        res.json(imagens);
    });
});

// Rota para listar todas as imagens (servicos + uploads)
router.get('/imagens-todas', (req, res) => {
    const servicosDir = path.join(__dirname, '../public/img/servicos');
    const uploadsDir = path.join(__dirname, '../uploads');
    
    let todasImagens = [];
    
    // Função para ler imagens de um diretório
    const lerImagens = (dir, prefixo) => {
        try {
            const files = fs.readdirSync(dir);
            return files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
                      .map(f => `${prefixo}/${f}`);
        } catch (err) {
            return [];
        }
    };
    
    // Adicionar imagens de serviços
    todasImagens = todasImagens.concat(lerImagens(servicosDir, '/img/servicos'));
    
    // Adicionar imagens de uploads
    todasImagens = todasImagens.concat(lerImagens(uploadsDir, '/uploads'));
    
    res.json(todasImagens);
});

module.exports = router;

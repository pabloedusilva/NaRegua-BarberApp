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

module.exports = router;

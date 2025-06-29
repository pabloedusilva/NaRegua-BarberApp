const express = require('express');
const router = express.Router();
const db = require('../db/neon');
const { requireLogin } = require('../middleware/auth');

// Listar todos (dashboard)
router.get('/', requireLogin, async (req, res) => {
    const rows = await db`SELECT * FROM alertas_promos ORDER BY id DESC`;
    res.json(rows);
});

// Listar ativos (index)
router.get('/ativos', async (req, res) => {
    const rows = await db`SELECT * FROM alertas_promos WHERE ativo = true ORDER BY id DESC`;
    res.json(rows);
});

// Criar
router.post('/', requireLogin, async (req, res) => {
    const { titulo, texto, imagem, link, ativo } = req.body;
    const [row] = await db`
        INSERT INTO alertas_promos (titulo, texto, imagem, link, ativo)
        VALUES (${titulo}, ${texto}, ${imagem}, ${link}, ${ativo})
        RETURNING *`;
    res.json(row);
});

// Editar
router.put('/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    const { titulo, texto, imagem, link, ativo } = req.body;
    const [row] = await db`
        UPDATE alertas_promos
        SET titulo=${titulo}, texto=${texto}, imagem=${imagem}, link=${link}, ativo=${ativo}
        WHERE id=${id}
        RETURNING *`;
    res.json(row);
});

// Remover
router.delete('/:id', requireLogin, async (req, res) => {
    const { id } = req.params;
    await db`DELETE FROM alertas_promos WHERE id=${id}`;
    res.json({ success: true });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const FRONTEND_PUBLIC = path.join(__dirname, '..', '..', 'frontend', 'public');

const lerImagens = (dir, prefixo) => {
	try {
		const files = fs.readdirSync(dir);
		return files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map(f => `${prefixo}/${f}`);
	} catch { return []; }
};

router.get('/imagens-servicos', (req, res) => {
	const uploadsServicesDir = path.join(FRONTEND_PUBLIC, 'uploads', 'services');
	const imgServicosDir = path.join(FRONTEND_PUBLIC, 'uploads', 'img', 'servicos');
	let imagens = [];
	imagens = imagens.concat(lerImagens(uploadsServicesDir, '/uploads/services'));
	imagens = imagens.concat(lerImagens(imgServicosDir, '/uploads/img/servicos'));
	res.json(imagens);
});

router.get('/imagens-wallpapers', (req, res) => {
	const wallpapersDir = path.join(FRONTEND_PUBLIC, 'uploads', 'wallpapers');
	const legacyWallpapersDir = path.join(FRONTEND_PUBLIC, 'uploads', 'img', 'wallpappers');
	let imagens = [];
	imagens = imagens.concat(lerImagens(wallpapersDir, '/uploads/wallpapers'));
	imagens = imagens.concat(lerImagens(legacyWallpapersDir, '/uploads/img/wallpappers'));
	res.json(imagens);
});

router.get('/imagens-logos', (req, res) => {
	const logosDir = path.join(FRONTEND_PUBLIC, 'uploads', 'logos');
	const legacyLogosDir = path.join(FRONTEND_PUBLIC, 'uploads', 'img', 'logo');
	let imagens = [];
	imagens = imagens.concat(lerImagens(logosDir, '/uploads/logos'));
	imagens = imagens.concat(lerImagens(legacyLogosDir, '/uploads/img/logo'));
	res.json(imagens);
});

router.get('/imagens-avatars', (req, res) => {
	const avatarsDir = path.join(FRONTEND_PUBLIC, 'uploads', 'avatars');
	res.json(lerImagens(avatarsDir, '/uploads/avatars'));
});

router.get('/imagens-promos', (req, res) => {
	const promosDir = path.join(FRONTEND_PUBLIC, 'uploads', 'promos');
	res.json(lerImagens(promosDir, '/uploads/promos'));
});

router.get('/imagens-uploads', (req, res) => {
	const baseDir = path.join(FRONTEND_PUBLIC, 'uploads');
	let todasImagens = [];
	const subfolders = ['services', 'wallpapers', 'logos', 'avatars', 'promos'];
	subfolders.forEach(subfolder => { todasImagens = todasImagens.concat(lerImagens(path.join(baseDir, subfolder), `/uploads/${subfolder}`)); });
	res.json(todasImagens);
});

router.get('/imagens-todas', (req, res) => {
	const baseUploadsDir = path.join(FRONTEND_PUBLIC, 'uploads');
	const imgDir = path.join(FRONTEND_PUBLIC, 'uploads', 'img');
	let todasImagens = [];
	const subfolders = ['services', 'wallpapers', 'logos', 'avatars', 'promos'];
	subfolders.forEach(subfolder => { todasImagens = todasImagens.concat(lerImagens(path.join(baseUploadsDir, subfolder), `/uploads/${subfolder}`)); });
	if (fs.existsSync(imgDir)) {
		const imgSubfolders = fs.readdirSync(imgDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
		imgSubfolders.forEach(sub => { todasImagens = todasImagens.concat(lerImagens(path.join(imgDir, sub), `/uploads/img/${sub}`)); });
	}
	res.json(todasImagens);
});

module.exports = router;

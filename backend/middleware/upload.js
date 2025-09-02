const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { nowUtc } = require('../utils/clock');

// Base uploads agora dentro de frontend/public/uploads
const baseUploadsDir = path.join(__dirname, '../../frontend/public/uploads');
const uploadsSubDirs = {
    services: path.join(baseUploadsDir, 'services'),
    avatars: path.join(baseUploadsDir, 'avatars'),
    wallpapers: path.join(baseUploadsDir, 'wallpapers'),
    logos: path.join(baseUploadsDir, 'logos'),
    promos: path.join(baseUploadsDir, 'promos')
};

Object.values(uploadsSubDirs).forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) cb(null, true); else cb(new Error('Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)'));
    }
});

const compressAndSaveImage = (uploadType = 'services') => async (req, res, next) => {
    if (!req.file) return next();
    try {
        const uploadDir = uploadsSubDirs[uploadType] || uploadsSubDirs.services;
    const timestamp = nowUtc().getTime();
        const randomNum = Math.floor(Math.random() * 1000);
        const filename = `${uploadType}-${timestamp}-${randomNum}.webp`;
        const filepath = path.join(uploadDir, filename);

        let resizeOptions = { fit: 'inside', withoutEnlargement: true };
        let quality = 85;
        switch (uploadType) {
            case 'wallpapers': resizeOptions = { width: 1920, height: 1080, fit: 'cover' }; quality = 80; break;
            case 'logos': resizeOptions = { width: 400, height: 400, fit: 'inside', withoutEnlargement: true }; quality = 90; break;
            case 'avatars': resizeOptions = { width: 200, height: 200, fit: 'cover' }; quality = 90; break;
            case 'promos': resizeOptions = { width: 800, height: 600, fit: 'inside', withoutEnlargement: true }; quality = 85; break;
            default: resizeOptions = { width: 800, height: 600, fit: 'inside', withoutEnlargement: true }; quality = 85;
        }

        await sharp(req.file.buffer).resize(resizeOptions).webp({ quality, effort: 6 }).toFile(filepath);

        req.processedFile = {
            filename,
            path: `/uploads/${uploadType}/${filename}`,
            originalname: req.file.originalname,
            size: fs.statSync(filepath).size,
            type: uploadType
        };
        next();
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        res.status(500).json({ error: 'Erro ao processar imagem' });
    }
};

const compressAndSaveAvatar = compressAndSaveImage('avatars');
module.exports = { upload, compressAndSaveImage, compressAndSaveAvatar, uploadsSubDirs };

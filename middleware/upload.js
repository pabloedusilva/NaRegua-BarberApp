const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Certificar que a pasta uploads existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer para armazenar em memória temporariamente
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limite inicial (será comprimido)
    },
    fileFilter: function (req, file, cb) {
        // Aceitar apenas imagens
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)'));
        }
    }
});

// Middleware para comprimir e salvar imagem
const compressAndSaveImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const extension = '.webp'; // Converter tudo para webp para melhor compressão
        const filename = `${timestamp}-${randomNum}${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Comprimir a imagem usando Sharp
        await sharp(req.file.buffer)
            .resize(800, 600, { 
                fit: 'inside', 
                withoutEnlargement: true 
            }) // Redimensionar mantendo proporção
            .webp({ 
                quality: 85, // Qualidade boa com compressão
                effort: 6 // Máxima compressão
            })
            .toFile(filepath);

        // Adicionar informações do arquivo processado ao request
        req.processedFile = {
            filename: filename,
            path: `/uploads/${filename}`,
            originalname: req.file.originalname,
            size: fs.statSync(filepath).size
        };

        next();
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        res.status(500).json({ error: 'Erro ao processar imagem' });
    }
};

// Middleware para comprimir avatar (tamanho menor)
const compressAndSaveAvatar = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const extension = '.webp';
        const filename = `avatar-${timestamp}-${randomNum}${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Comprimir avatar para tamanho específico
        await sharp(req.file.buffer)
            .resize(200, 200, { 
                fit: 'cover' // Cortar para manter proporção quadrada
            })
            .webp({ 
                quality: 90, // Qualidade alta para avatares
                effort: 6
            })
            .toFile(filepath);

        // Adicionar informações do arquivo processado ao request
        req.processedFile = {
            filename: filename,
            path: `/uploads/${filename}`,
            originalname: req.file.originalname,
            size: fs.statSync(filepath).size
        };

        next();
    } catch (error) {
        console.error('Erro ao processar avatar:', error);
        res.status(500).json({ error: 'Erro ao processar avatar' });
    }
};

module.exports = {
    upload,
    compressAndSaveImage,
    compressAndSaveAvatar
};

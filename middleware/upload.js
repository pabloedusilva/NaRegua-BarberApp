const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Função para obter data/hora do Brasil (UTC-3)
function getBrazilDateTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const brazilTime = new Date(utc + (-3 * 3600000));
    return brazilTime;
}

// Certificar que as pastas de upload existem
const baseUploadsDir = path.join(__dirname, '../public/uploads');
const uploadsSubDirs = {
    services: path.join(baseUploadsDir, 'services'),
    avatars: path.join(baseUploadsDir, 'avatars'),
    wallpapers: path.join(baseUploadsDir, 'wallpapers'),
    logos: path.join(baseUploadsDir, 'logos'),
    promos: path.join(baseUploadsDir, 'promos')
};

// Criar todas as pastas necessárias
Object.values(uploadsSubDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

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
const compressAndSaveImage = (uploadType = 'services') => {
    return async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            // Determinar o diretório baseado no tipo de upload
            const uploadDir = uploadsSubDirs[uploadType] || uploadsSubDirs.services;
            
            // Gerar nome único para o arquivo
            const timestamp = getBrazilDateTime().getTime();
            const randomNum = Math.floor(Math.random() * 1000);
            const extension = '.webp'; // Converter tudo para webp para melhor compressão
            const filename = `${uploadType}-${timestamp}-${randomNum}${extension}`;
            const filepath = path.join(uploadDir, filename);

            // Configurar compressão baseada no tipo
            let resizeOptions = { fit: 'inside', withoutEnlargement: true };
            let quality = 85;
            
            switch (uploadType) {
                case 'wallpapers':
                    resizeOptions = { width: 1920, height: 1080, fit: 'cover' };
                    quality = 80;
                    break;
                case 'logos':
                    resizeOptions = { width: 400, height: 400, fit: 'inside', withoutEnlargement: true };
                    quality = 90;
                    break;
                case 'avatars':
                    resizeOptions = { width: 200, height: 200, fit: 'cover' };
                    quality = 90;
                    break;
                case 'promos':
                    resizeOptions = { width: 800, height: 600, fit: 'inside', withoutEnlargement: true };
                    quality = 85;
                    break;
                default: // services
                    resizeOptions = { width: 800, height: 600, fit: 'inside', withoutEnlargement: true };
                    quality = 85;
            }

            // Comprimir a imagem usando Sharp
            await sharp(req.file.buffer)
                .resize(resizeOptions)
                .webp({ 
                    quality: quality,
                    effort: 6 // Máxima compressão
                })
                .toFile(filepath);

            // Adicionar informações do arquivo processado ao request
            req.processedFile = {
                filename: filename,
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
};

// Middleware para comprimir avatar (compatibilidade com código antigo)
const compressAndSaveAvatar = compressAndSaveImage('avatars');

module.exports = {
    upload,
    compressAndSaveImage,
    compressAndSaveAvatar,
    uploadsSubDirs
};

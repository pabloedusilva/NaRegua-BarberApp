// Utilitário para upload de imagens comprimidas
(function() {
    // Função genérica para fazer upload com tipo específico
    window.uploadImageByType = async function(file, type = 'service') {
        const formData = new FormData();
        const fieldName = type === 'avatar' ? 'avatar' : 'image';
        formData.append(fieldName, file);

        try {
            const response = await fetch(`/api/upload/${type}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || `Erro no upload de ${type}`);
            }

            return result;
        } catch (error) {
            console.error(`Erro no upload de ${type}:`, error);
            throw error;
        }
    };

    // Função para fazer upload de uma imagem comum (compatibilidade)
    window.uploadImage = async function(file) {
        return await uploadImageByType(file, 'service');
    };

    // Função para fazer upload de imagem de serviço
    window.uploadService = async function(file) {
        return await uploadImageByType(file, 'service');
    };

    // Função para fazer upload de um avatar
    window.uploadAvatar = async function(file) {
        return await uploadImageByType(file, 'avatar');
    };

    // Função para fazer upload de wallpaper
    window.uploadWallpaper = async function(file) {
        return await uploadImageByType(file, 'wallpaper');
    };

    // Função para fazer upload de logo
    window.uploadLogo = async function(file) {
        return await uploadImageByType(file, 'logo');
    };

    // Função para fazer upload de promo
    window.uploadPromo = async function(file) {
        return await uploadImageByType(file, 'promo');
    };

    // Função para mostrar preview da imagem antes do upload
    window.showImagePreview = function(file, previewElement) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewElement) {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
            }
        };
        reader.readAsDataURL(file);
    };

    // Função para validar arquivo de imagem
    window.validateImageFile = function(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de arquivo não permitido. Use apenas: JPG, PNG, GIF ou WEBP');
        }

        if (file.size > maxSize) {
            throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
        }

        return true;
    };
})();

// Utilitário para upload de imagens comprimidas
(function() {
    // Função para fazer upload de uma imagem comum
    window.uploadImage = async function(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erro no upload');
            }

            return result;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    };

    // Função para fazer upload de um avatar
    window.uploadAvatar = async function(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erro no upload do avatar');
            }

            return result;
        } catch (error) {
            console.error('Erro no upload do avatar:', error);
            throw error;
        }
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

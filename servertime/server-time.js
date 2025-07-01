// UTILITÁRIO CENTRAL DE DATA/HORA DO SERVIDOR - ÚNICO NO SISTEMA
// Retorna SEMPRE a data/hora do Brasil no formato "br": "YYYY-MM-DD HH:mm:ss"
// Este é o ÚNICO arquivo responsável por data/hora em todo o sistema
(function() {
    let serverTime = null;
    let offset = 0;
    let syncInterval = null;
    let updateInterval = null;

    // Busca a hora do servidor (formato brasileiro)
    async function fetchServerTime() {
        try {
            const res = await fetch('/servertime');
            const data = await res.json();
            if (data && data.br) {
                // Converte "YYYY-MM-DD HH:mm:ss" para Date object (horário do Brasil)
                const serverDate = new Date(data.br.replace(' ', 'T') + '-03:00');
                const localDate = new Date();
                offset = serverDate.getTime() - localDate.getTime();
                serverTime = new Date(localDate.getTime() + offset);
                console.log('Hora do servidor sincronizada:', data.br);
            }
        } catch (e) {
            console.warn('Erro ao buscar hora do servidor, usando fallback:', e);
        }
    }

    // Retorna SEMPRE a hora do servidor (nunca local)
    function getServerTime() {
        return new Date(Date.now() + offset);
    }

    // Inicia sincronização automática
    async function startSync() {
        await fetchServerTime();
        
        // Limpa intervalos existentes
        if (syncInterval) clearInterval(syncInterval);
        if (updateInterval) clearInterval(updateInterval);
        
        // Atualiza serverTime a cada segundo
        updateInterval = setInterval(() => {
            serverTime = new Date(Date.now() + offset);
        }, 1000);
        
        // Resincroniza com servidor a cada 30 segundos
        syncInterval = setInterval(fetchServerTime, 30000);
    }

    // Expor funções globalmente - ÚNICA FONTE DE DATA/HORA
    window.getServerTime = getServerTime;
    window.startServerTimeSync = startSync;
    window.serverTime = getServerTime; // Alias principal
    
    // Função para formatar como string brasileira "YYYY-MM-DD HH:mm:ss"
    window.getServerTimeString = () => {
        const date = getServerTime();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Função para formatar data brasileira "DD/MM/YYYY"
    window.getServerDateBR = () => {
        const date = getServerTime();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Auto-start
    startSync();
})();

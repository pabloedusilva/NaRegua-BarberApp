// Utilitário global para manter a hora do servidor em tempo real
// window.serverTime sempre atualizado
(function() {
    let serverTime = null;
    let offset = 0;
    let interval = null;

    async function fetchServerTime() {
        try {
            const res = await fetch('/dashboard/servertime');
            const data = await res.json();
            if (data && data.iso) {
                const serverDate = new Date(data.iso);
                const localDate = new Date();
                offset = serverDate.getTime() - localDate.getTime();
                serverTime = new Date(localDate.getTime() + offset);
            }
        } catch (e) {
            // fallback: mantém o último valor
        }
    }

    function getServerTime() {
        return new Date(Date.now() + offset);
    }

    // Atualiza a cada 10 segundos
    async function startSync() {
        await fetchServerTime();
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
            serverTime = new Date(Date.now() + offset);
        }, 1000);
        setInterval(fetchServerTime, 10000);
    }

    window.getServerTime = getServerTime;
    window.startServerTimeSync = startSync;
    window.serverTime = () => getServerTime();

    startSync();
})();
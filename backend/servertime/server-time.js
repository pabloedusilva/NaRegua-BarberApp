// (Conteúdo original movido)
// UTILITÁRIO CENTRAL DE DATA/HORA DO SERVIDOR - ÚNICO NO SISTEMA
// Retorna SEMPRE a data/hora do Brasil no formato "br": "YYYY-MM-DD HH:mm:ss"
(function() {
	// Fonte ÚNICA de data/hora virtual (fixa ou alterada via backend). Não avança automaticamente.
	// Este script agora também detecta alterações no backend e atualiza os clientes.

	let fixedDate = null;           // Date base virtual recebida do servidor
	let lastBrString = null;        // Última string recebida ("YYYY-MM-DD HH:mm:ss")
	let pollingIntervalId = null;   // ID do setInterval de auto-sync
	let mode = 'fixed';             // 'fixed' | 'live'
	let baseRealMillis = 0;         // Momento real quando recebemos a base (para live)

	function parseBrToDate(br) {
		if (!br) return null;
		const [datePart, timePart] = br.split(' ');
		if (!datePart || !timePart) return null;
		const [y, m, d] = datePart.split('-').map(Number);
		const [hh, mm, ss] = timePart.split(':').map(Number);
		// Converte horário Brasil (-03:00) para UTC interno
		return new Date(Date.UTC(y, m - 1, d, hh + 3, mm, ss || 0));
	}

	async function fetchFixedServerTime(force = false) {
		if (fixedDate && !force) return fixedDate;
		try {
			const res = await fetch('/servertime', { cache: 'no-store' });
			if (!res.ok) throw new Error('HTTP ' + res.status);
			const data = await res.json();
			if (data && data.br) {
				if (data.mode) mode = data.mode; else mode = 'fixed';
				const newStr = data.br;
				if (newStr !== lastBrString) {
					const newDate = parseBrToDate(newStr);
					if (newDate) {
						fixedDate = newDate;
						baseRealMillis = Date.now();
						lastBrString = newStr;
						dispatchEvent(new CustomEvent('server-time-updated', { detail: { br: newStr, date: new Date(fixedDate.getTime()) } }));
					}
				}
			}
		} catch (e) {
			if (!fixedDate) fixedDate = new Date(); // fallback inicial
		}
		return fixedDate;
	}

	function ensurePolling(intervalMs = 15000) { // 15s padrão
		if (pollingIntervalId) return;
		pollingIntervalId = setInterval(() => {
			fetchFixedServerTime(true);
		}, intervalMs);
	}

	// API pública
	window.startServerTimeSync = async function(options = {}) {
		const { autoRefresh = true, intervalMs = 15000 } = options;
		if (!fixedDate) await fetchFixedServerTime();
		if (autoRefresh) ensurePolling(intervalMs);
		return fixedDate;
	};

	window.serverTime = function() {
		if (!fixedDate) return new Date();
		if (mode === 'live') {
			const elapsed = Date.now() - baseRealMillis;
			return new Date(fixedDate.getTime() + elapsed);
		}
		return new Date(fixedDate.getTime());
	};

	window.refreshServerTime = async function() {
		await fetchFixedServerTime(true);
		return window.serverTime();
	};

	window.stopServerTimeAutoRefresh = function() {
		if (pollingIntervalId) {
			clearInterval(pollingIntervalId);
			pollingIntervalId = null;
		}
	};
})();

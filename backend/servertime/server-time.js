// (Conteúdo original movido)
// UTILITÁRIO CENTRAL DE DATA/HORA DO SERVIDOR - ÚNICO NO SISTEMA
// Retorna SEMPRE a data/hora do Brasil no formato "br": "YYYY-MM-DD HH:mm:ss"
(function() {
	// Tempo fixo fornecido pelo backend (gerado no boot). Este script NÃO atualiza com o relógio real.
	// Espera-se que o servidor sirva sempre a mesma resposta /servertime coerente com o boot.
	let fixedDate = null;

	async function fetchFixedServerTime() {
		try {
			const res = await fetch('/servertime');
			const data = await res.json();
			if (data && data.br) {
				// data.br: YYYY-MM-DD HH:mm:ss
				const [datePart, timePart] = data.br.split(' ');
				const [y, m, d] = datePart.split('-').map(Number);
				const [hh, mm, ss] = timePart.split(':').map(Number);
				fixedDate = new Date(Date.UTC(y, m - 1, d, hh + 3, mm, ss)); // converte para UTC compensando -3
			}
		} catch (e) {
			// fallback: se falhar, cria uma data fixa local (não ideal, mas evita quebra)
			if (!fixedDate) fixedDate = new Date();
		}
	}

	window.startServerTimeSync = async function() {
		if (!fixedDate) await fetchFixedServerTime();
		return fixedDate;
	};

	window.serverTime = function() {
		// Retorna cópia para evitar mutações externas
		return fixedDate ? new Date(fixedDate.getTime()) : new Date();
	};
})();

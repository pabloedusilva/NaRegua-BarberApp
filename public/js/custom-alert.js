// Custom Alert Modal Utility
// Usage: showCustomAlert('Mensagem', optionalCallback)
(function() {
    if (window.showCustomAlert) return;
    const modal = document.createElement('div');
    modal.id = 'customAlertModal';
    modal.className = 'custom-alert-modal';
    modal.innerHTML = `
      <div class="custom-alert-content">
        <span class="custom-alert-close" id="customAlertClose" title="Fechar">&times;</span>
        <div class="custom-alert-icon" id="customAlertIcon"></div>
        <span id="customAlertMessage"></span>
        <div class="custom-alert-btns" id="customAlertBtns" style="display:flex;gap:16px;justify-content:center;margin-top:18px;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    const style = document.createElement('style');
    style.textContent = `
      .custom-alert-modal { display: none; position: fixed; z-index: 99999; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(30,30,30,0.38); backdrop-filter: blur(2.5px); align-items: center; justify-content: center; animation: fadeIn 0.3s; }
      .custom-alert-modal.active { display: flex; }
      .custom-alert-content { background: linear-gradient(135deg, var(--card, #fff) 85%, var(--primary-light, #dac02d) 100%); color: var(--text, #222); border-radius: 22px; box-shadow: 0 8px 40px 0 #dac02d55, 0 1.5px 8px 0 #dac02d11; padding: 38px 32px 24px 32px; min-width: 320px; max-width: 96vw; width: 100%; text-align: center; position: relative; animation: modalPopIn 0.38s cubic-bezier(.23, 1.12, .32, 1); border: 2.5px solid var(--primary-light, #dac02d); font-size: 1.08rem; transition: box-shadow 0.2s, border-color 0.2s; }
      .custom-alert-close { position: absolute; top: 14px; right: 18px; font-size: 1.3rem; color: var(--primary, #dac02d); cursor: pointer; font-weight: bold; transition: color 0.2s; z-index: 2; background: none; border: none; }
      .custom-alert-close:hover { color: var(--primary-dark, #816a02); }
      .custom-alert-icon { font-size: 2.3rem; margin-bottom: 12px; color: var(--primary, #dac02d); display: flex; justify-content: center; }
      #customAlertMessage { font-size: 1.08rem; margin-bottom: 22px; color: var(--text, #222); word-break: break-word; display: block; text-align: left; }
      .custom-alert-btns button { background: var(--primary, #dac02d); color: #fff; border: none; border-radius: 22px; padding: 10px 32px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.18s; box-shadow: 0 2px 8px rgba(218, 192, 45, 0.10); }
      .custom-alert-btns button#customAlertCancelBtn, .custom-alert-btns .btn-cancel { background: #eee; color: #222; border: 1.5px solid #dac02d; }
      .custom-alert-btns button#customAlertCancelBtn:hover, .custom-alert-btns .btn-cancel:hover { background: #f7f7f7; color: #816a02; }
      .custom-alert-btns button#customAlertConfirmBtn:hover { background: var(--accent, #b99729); transform: scale(1.04); }
      @media (min-width: 900px) { .custom-alert-content { min-width: 420px; max-width: 420px; padding: 48px 38px 38px 38px; font-size: 1.18rem; } #customAlertMessage { font-size: 1.08rem; } .custom-alert-btns button { font-size: 1.08rem; padding: 12px 38px; } }
      @media (max-width: 899px) and (min-width: 481px) { .custom-alert-content { min-width: 280px; max-width: 360px; padding: 32px 18px 22px 18px; font-size: 1rem; } #customAlertMessage { font-size: 0.98rem; } .custom-alert-btns button { font-size: 1rem; padding: 10px 28px; } }
      @media (max-width: 480px) { .custom-alert-content { min-width: 0; max-width: 96vw; padding: 18px 4vw 14px 4vw; font-size: 0.95rem; } #customAlertMessage { font-size: 0.93rem; } .custom-alert-btns button { font-size: 0.95rem; padding: 8px 18px; } }
      @keyframes modalPopIn { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
    window.showCustomAlert = function(message, onConfirm, options = {}) {
        const msg = document.getElementById('customAlertMessage');
        const closeBtn = document.getElementById('customAlertClose');
        const iconDiv = document.getElementById('customAlertIcon');
        const btnsDiv = document.getElementById('customAlertBtns');
        modal.classList.add('active');
        msg.textContent = message;
        iconDiv.innerHTML = options.icon || '';
        btnsDiv.innerHTML = '';
        let confirmBtn, cancelBtn, okBtn;
        // Modal de confirmação (exclusão)
        if (options.type === 'confirm') {
            confirmBtn = document.createElement('button');
            confirmBtn.id = 'customAlertConfirmBtn';
            confirmBtn.textContent = options.btnText || 'Excluir';
            cancelBtn = document.createElement('button');
            cancelBtn.id = 'customAlertCancelBtn';
            cancelBtn.className = 'btn-cancel';
            cancelBtn.textContent = options.cancelText || 'Cancelar';
            btnsDiv.appendChild(confirmBtn);
            btnsDiv.appendChild(cancelBtn);
            confirmBtn.focus();
        } else {
            // Modal simples (erro, alerta, etc)
            okBtn = document.createElement('button');
            okBtn.id = 'customAlertOkBtn';
            okBtn.textContent = options.btnText || 'OK';
            btnsDiv.appendChild(okBtn);
            okBtn.focus();
        }

        function close() {
            modal.classList.remove('active');
            if (confirmBtn) confirmBtn.removeEventListener('click', confirmHandler);
            if (cancelBtn) cancelBtn.removeEventListener('click', cancelHandler);
            if (okBtn) okBtn.removeEventListener('click', okHandler);
            closeBtn.removeEventListener('click', cancelHandler);
            document.removeEventListener('keydown', escListener);
            modal.removeEventListener('click', outsideHandler);
        }

        function confirmHandler(e) {
            e.preventDefault();
            close();
            if (typeof onConfirm === 'function') onConfirm();
        }

        function cancelHandler(e) {
            e.preventDefault();
            close();
        }

        function okHandler(e) {
            e.preventDefault();
            close();
            if (typeof onConfirm === 'function') onConfirm();
        }

        function escListener(e) { if (e.key === 'Escape') close(); }

        function outsideHandler(e) { if (e.target === modal) close(); }
        if (options.type === 'confirm') {
            confirmBtn.addEventListener('click', confirmHandler);
            cancelBtn.addEventListener('click', cancelHandler);
            closeBtn.addEventListener('click', cancelHandler);
        } else {
            okBtn.addEventListener('click', okHandler);
            closeBtn.addEventListener('click', okHandler);
        }
        document.addEventListener('keydown', escListener);
        modal.addEventListener('click', outsideHandler);
    };
})();
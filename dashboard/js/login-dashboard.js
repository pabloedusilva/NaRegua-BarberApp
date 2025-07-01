// Carrega utilitário de alerta customizado
const script = document.createElement('script');
script.src = '/js/custom-alert.js';
document.head.appendChild(script);

// Carrega utilitário de hora do servidor
const serverTimeScript = document.createElement('script');
serverTimeScript.src = '/js/server-time.js';
document.head.appendChild(serverTimeScript);

document.addEventListener('DOMContentLoaded', function() {
    // Toggle theme
    let themeToggle = document.getElementById('themeToggle');
    let themeIcon;

    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.id = 'themeToggle';
        themeToggle.title = 'Alternar tema';
        themeToggle.style.position = 'fixed';
        themeToggle.style.top = '18px';
        themeToggle.style.right = '18px';
        themeToggle.style.zIndex = '9999';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        document.body.appendChild(themeToggle);
    }
    themeIcon = themeToggle.querySelector('i');

    // Verificar preferência de tema no localStorage
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Alternar tema
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // Tabs functionality (simplified for single tab)
    const tabs = document.querySelectorAll('.auth-tab');
    const tabsContainer = document.querySelector('.auth-tabs');
    
    // Since we only have one tab now, we can remove the complex tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Keep the tab active (no switching needed)
            this.classList.add('active');
        });
    });

    // Form submission
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/dashboard/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (res.ok) {
                // Login bem-sucedido, redireciona para a dashboard
                window.location.href = '/dashboard/dashboard';
            } else {
                const data = await res.json();
                showCustomAlert(data.message || 'Usuário ou senha inválidos', null, { type: 'alert', btnText: 'OK', icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>' });
            }
        } catch (err) {
            showCustomAlert('Erro ao conectar ao servidor.', null, { type: 'alert', btnText: 'OK', icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>' });
        }
    });

    // Modal "Esqueceu sua senha?"
    const forgotLink = document.querySelector('.auth-footer a');
    const forgotModal = document.getElementById('forgotModal');
    const closeForgotModal = document.getElementById('closeForgotModal');

    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotModal.classList.add('active');
    });
    closeForgotModal.addEventListener('click', function() {
        forgotModal.classList.remove('active');
    });
    window.addEventListener('click', function(e) {
        if (e.target === forgotModal) {
            forgotModal.classList.remove('active');
        }
    });
});
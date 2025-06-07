// Carrega utilitário de alerta customizado
const script = document.createElement('script');
script.src = '/js/custom-alert.js';
document.head.appendChild(script);

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

    // Tabs functionality
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
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
                showCustomAlert(data.message || 'Usuário ou senha inválidos');
            }
        } catch (err) {
            showCustomAlert('Erro ao conectar ao servidor.');
        }
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // Aqui você adicionaria a lógica de cadastro
        console.log('Register submitted');

        // Verificar se as senhas coincidem
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            showCustomAlert('As senhas não coincidem!');
            return;
        }
        // Simulação de cadastro bem-sucedido
        showCustomAlert('Cadastro realizado com sucesso! Redirecionando para o login...');

        // Mudar para a aba de login após cadastro
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });

    // Máscara para telefone
    const phoneInput = document.getElementById('register-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);

            if (value.length > 0) {
                value = value.replace(/^(\d{0,2})(\d{0,5})(\d{0,4})$/, function(match, g1, g2, g3) {
                    let result = '';
                    if (g1) result = `(${g1}`;
                    if (g2) result += `) ${g2}`;
                    if (g3) result += `-${g3}`;
                    return result;
                });
            }

            e.target.value = value;
        });
    }

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
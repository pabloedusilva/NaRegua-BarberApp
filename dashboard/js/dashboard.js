let serverNow = null;

// Carrega utilitário de alerta customizado
const script = document.createElement('script');
script.src = '/js/custom-alert.js';
document.head.appendChild(script);

async function getServerTime() {
    try {
        const res = await fetch('/dashboard/servertime');
        const data = await res.json();
        if (data && data.iso) {
            serverNow = new Date(data.iso);
        } else {
            serverNow = new Date(); // fallback
        }
    } catch (err) {
        serverNow = new Date(); // fallback
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await getServerTime();
    renderCalendar(serverNow);
});
document.addEventListener('DOMContentLoaded', function() {
            // Toggle theme
            const themeToggle = document.getElementById('themeToggle');
            const themeIcon = themeToggle.querySelector('i');

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

            // Modal functionality
            const modals = document.querySelectorAll('.modal');
            const modalTriggers = {
                'addProfessionalBtn': 'addProfessionalModal',
                'viewAllAppointments': 'allAppointmentsModal',
                'addDayOffBtn': 'addDayOffModal',
                'changePasswordBtn': 'changePasswordModal',
            };

            // Open modals
            Object.keys(modalTriggers).forEach(triggerId => {
                const trigger = document.getElementById(triggerId);
                const modalId = modalTriggers[triggerId];
                const modal = document.getElementById(modalId);

                if (trigger && modal) {
                    trigger.addEventListener('click', () => {
                        modal.style.display = 'flex';
                    });
                }
            });

            // Close modals
            document.querySelectorAll('.close-modal').forEach(closeBtn => {
                closeBtn.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    modal.style.display = 'none';
                });
            });

            // Close when clicking outside modal content
            modals.forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                });
            });

            // Tab functionality
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabContainer = this.closest('.tab-container');
                    const tabId = this.getAttribute('data-tab');

                    // Remove active class from all tabs and contents
                    tabContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    tabContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                    // Add active class to clicked tab and corresponding content
                    this.classList.add('active');
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });

            // Avatar upload preview
            const avatarInput = document.getElementById('avatarInput');
            const avatarPreview = document.querySelector('.avatar-preview');

            if (avatarInput && avatarPreview) {
                document.querySelector('.avatar-upload-btn').addEventListener('click', function() {
                    avatarInput.click();
                });

                avatarInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Avatar upload preview para foto do estabelecimento
            const barbershopPhotoInput = document.getElementById('barbershopPhotoInput');
            const barbershopPhotoBtn = document.getElementById('barbershop-photo-btn');
            const barbershopPhotoPreview = document.getElementById('barbershop-photo-preview');

            if (barbershopPhotoInput && barbershopPhotoBtn && barbershopPhotoPreview) {
                barbershopPhotoBtn.addEventListener('click', function() {
                    barbershopPhotoInput.click();
                });

                barbershopPhotoInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            barbershopPhotoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Add another time slot
            document.querySelectorAll('.add-another-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const timeSlotsEdit = this.previousElementSibling;
                    const newTimeInputGroup = document.createElement('div');
                    newTimeInputGroup.className = 'time-input-group';
                    newTimeInputGroup.innerHTML = `
                        <input type="time" class="time-input" value="09:00">
                        <span>às</span>
                        <input type="time" class="time-input" value="12:00">
                        <button class="remove-time-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    timeSlotsEdit.appendChild(newTimeInputGroup);

                    // Add event listener to new remove button
                    newTimeInputGroup.querySelector('.remove-time-btn').addEventListener('click', function() {
                        this.parentElement.remove();
                    });
                });
            });

            // Remove time slot
            document.querySelectorAll('.remove-time-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    this.parentElement.remove();
                });
            });

            // Compartilhar link de agendamento moderno melhorado
            const copyBtn = document.getElementById('copyBookingLinkBtn');
            const bookingLink = document.getElementById('bookingLink');
            const globalCopyMsg = document.getElementById('globalCopySuccessMsg');

            if (copyBtn && bookingLink && globalCopyMsg) {
                copyBtn.addEventListener('click', function() {
                    bookingLink.select();
                    bookingLink.setSelectionRange(0, 99999); // Para mobile
                    document.execCommand('copy');
                    globalCopyMsg.style.display = 'flex';
                    setTimeout(() => {
                        globalCopyMsg.style.display = 'none';
                    }, 1800);
                });
            }

            // Modal de adicionar dia de folga especial
            const addDayOffModal = document.getElementById('addDayOffModal');
            const saveDayOffBtn = document.getElementById('saveDayOffBtn');
            const dayOffDate = document.getElementById('dayOffDate');
            const dayOffReason = document.getElementById('dayOffReason');
            const specialDaysOffList = document.getElementById('specialDaysOffList');
            const specialDayOffEmpty = document.getElementById('specialDayOffEmpty');

            // Setar data mínima para hoje
            if (dayOffDate) {
                const today = serverNow;
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                dayOffDate.min = `${yyyy}-${mm}-${dd}`;
            }

            // Adicionar dia de folga especial
            if (saveDayOffBtn && dayOffDate && specialDaysOffList) {
                saveDayOffBtn.addEventListener('click', function() {
                            const date = dayOffDate.value;
                            const reason = dayOffReason.value.trim();
                            if (!date) {
                                dayOffDate.focus();
                                return;
                            }

                            // Formatar data para dd/mm/yyyy
                            const [yyyy, mm, dd] = date.split('-');
                            const formattedDate = `${dd}/${mm}/${yyyy}`;

                            // Criar item visual
                            const item = document.createElement('div');
                            item.className = 'special-day-off-item';
                            item.innerHTML = `
                        <div>
                            <span class="special-day-off-date"><i class="fas fa-calendar-day"></i> ${formattedDate}</span>
                            ${reason ? `<span class="special-day-off-reason">(${reason})</span>` : ''}
                        </div>
                        <button class="special-day-off-remove" title="Remover" aria-label="Remover">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    // Remover mensagem de vazio
                    if (specialDayOffEmpty) specialDayOffEmpty.style.display = 'none';
                    specialDaysOffList.appendChild(item);

                    // Fechar modal
                    addDayOffModal.style.display = 'none';

                    // Remover item ao clicar no botão
                    item.querySelector('.special-day-off-remove').addEventListener('click', function() {
                        item.remove();
                        // Se não houver mais itens, mostrar mensagem de vazio
                        if (specialDaysOffList.querySelectorAll('.special-day-off-item').length === 0 && specialDayOffEmpty) {
                            specialDayOffEmpty.style.display = '';
                        }
                    });
                });
            }

            // Logout functionality
            document.getElementById('logoutBtn').addEventListener('click', function() {
                window.location.href = '/dashboard/logout';
            });

// Atualiza o contador de agendamentos totais
function atualizarTotalAgendamentos() {
    fetch('/dashboard/total-agendamentos')
        .then(res => res.json())
        .then(data => {
            const totalEl = document.querySelectorAll('#total-appointments');
            totalEl.forEach(el => {
                el.textContent = data.total;
            });
        });
}
atualizarTotalAgendamentos();

// Atualiza o contador de agendamentos do mês
function atualizarTotalAgendamentosMes() {
    fetch('/dashboard/total-agendamentos-mes')
        .then(res => res.json())
        .then(data => {
            const monthEl = document.getElementById('month-appointments');
            if (monthEl) monthEl.textContent = data.total || 0;
        });
}
atualizarTotalAgendamentosMes();

// Atualiza o contador de agendamentos da semana
function atualizarTotalAgendamentosSemana() {
    fetch('/dashboard/total-agendamentos-semana')
        .then(res => res.json())
        .then(data => {
            const weekEl = document.getElementById('week-appointments');
            if (weekEl) weekEl.textContent = data.total || 0;
        });
}
atualizarTotalAgendamentosSemana();

// Atualiza o contador de clientes totais
function atualizarTotalClientes() {
    fetch('/dashboard/total-clientes')
        .then(res => res.json())
        .then(data => {
            const clientEl = document.getElementById('total-clients');
            if (clientEl) {
                if (typeof data.total === 'number') {
                    clientEl.textContent = data.total;
                } else if (data && data.total) {
                    clientEl.textContent = data.total;
                } else {
                    clientEl.textContent = '0';
                }
            }
        })
        .catch(() => {
            const clientEl = document.getElementById('total-clients');
            if (clientEl) clientEl.textContent = '0';
        });
}
atualizarTotalClientes();

// Carregar agendamentos do dia
function carregarAgendamentosHoje() {
    fetch('/dashboard/agendamentos-hoje')
        .then(res => res.json())
        .then(data => {
            // Atualiza o número no painel
            const todayCountEl = document.getElementById('today-appointments');
            if (todayCountEl) {
                todayCountEl.textContent = data.agendamentos ? data.agendamentos.length : 0;
            }

            // Filtro de status
            const container = document.getElementById('todayAppointmentsList');
            if (container) {
                container.innerHTML = '';
                // Adiciona filtro select
                let filterDiv = document.getElementById('todayAppointmentsFilter');
                if (!filterDiv) {
                    filterDiv = document.createElement('div');
                    filterDiv.id = 'todayAppointmentsFilter';
                    filterDiv.className = 'dashboard-appointments-filter';
                    filterDiv.innerHTML = `
                        <label for="todayAppointmentsStatusFilter">Filtrar:</label>
                        <select id="todayAppointmentsStatusFilter">
                            <option value="all">Todos</option>
                            <option value="confirmed">Confirmados</option>
                            <option value="cancelled">Cancelados</option>
                            <option value="completed">Concluídos</option>
                        </select>
                    `;
                    container.parentNode.insertBefore(filterDiv, container);
                }
                function renderTodayAppointmentsList(statusFilter) {
                    container.innerHTML = '';
                    if (data.agendamentos && data.agendamentos.length > 0) {
                        // Determina status
                        const now = new Date();
                        let ags = data.agendamentos.map(ag => {
                            let status = 'confirmed';
                            if (ag.status && ag.status.toLowerCase() === 'cancelado') status = 'cancelled';
                            else {
                                const agDate = new Date(ag.data + 'T' + (ag.hora || '00:00'));
                                if (agDate < now) status = 'completed';
                            }
                            return { ...ag, _status: status };
                        });
                        if (statusFilter && statusFilter !== 'all') {
                            ags = ags.filter(ag => ag._status === statusFilter);
                        }
                        if (ags.length === 0) {
                            container.innerHTML = `<div style="color:var(--text-secondary);padding:18px 0;text-align:center;">Nenhum agendamento encontrado.</div>`;
                            return;
                        }
                        ags.forEach(ag => {
                            const item = document.createElement('div');
                            item.className = 'appointment-item';
                            item.innerHTML = `
    <div class="appointment-card">
    <div class="appointment-header">
        <span class="appointment-client">
            <i class="fas fa-user"></i> ${ag.nome || 'Cliente'}
        </span>
    </div>
<div class="appointment-details">
    <span><i class="far fa-clock"></i> ${ag.hora || '--:--'}</span>
    <span><i class="fas fa-cut"></i> ${ag.servico || '-'}</span>
    <span><i class="fas fa-user-tie"></i> ${ag.profissional || '-'}</span>
    <span><i class="fas fa-phone"></i> ${ag.telefone || '-'}</span>
    <div class="appointment-status-group">
        <span class="appointment-status status-${ag._status}">
            ${ag._status === 'confirmed' ? 'Confirmado' : ag._status === 'cancelled' ? 'Cancelado' : 'Concluído'}
        </span>
        <button class="send-notificacoes-btn" title="Notificar">
            <i class="fas fa-bell"></i>
        </button>
    </div>
</div>
</div>
                            `;
                            container.appendChild(item);
                        });
                    } else {
                        container.innerHTML = `<div style="color:var(--text-secondary);padding:18px 0;text-align:center;">Nenhum agendamento para hoje.</div>`;
                    }
                }
                // Inicializa lista
                renderTodayAppointmentsList('all');
                // Filtro
                const statusFilterEl = document.getElementById('todayAppointmentsStatusFilter');
                if (statusFilterEl) {
                    statusFilterEl.addEventListener('change', function() {
                        renderTodayAppointmentsList(this.value);
                    });
                }
            }
        })
        .catch(() => {
            const todayCountEl = document.getElementById('today-appointments');
            if (todayCountEl) todayCountEl.textContent = '0';
            const container = document.getElementById('todayAppointmentsList');
            if (container) {
                container.innerHTML = `<div style="color:var(--red);padding:18px 0;text-align:center;">Erro ao carregar agendamentos.</div>`;
            }
        });
}
carregarAgendamentosHoje();

// Sidebar navigation
const sidebarBtns = document.querySelectorAll('.mac-sidebar-btn[data-section]');
const sections = [
    {section: 'painel', selector: '.stats-container, .dashboard-section:nth-of-type(1)'},
    {section: 'agendamentos', selector: '.dashboard-section:nth-of-type(2), .dashboard-section:nth-of-type(10)'},
    {section: 'servicos', selector: '.dashboard-section:nth-of-type(3)'},
    {section: 'horarios', selector: '.dashboard-section:nth-of-type(5)'},
    {section: 'folgas', selector: '.dashboard-section:nth-of-type(6)'},
    {section: 'barbearia', selector: '.dashboard-section:nth-of-type(7)'},
    {section: 'notificacoes', selector: '#notificacoes-section'},
    {section: 'compartilhar', selector: '.dashboard-section:nth-of-type(4)'},
];
function showSection(sectionName) {
    // Esconde todas as seções
    document.querySelectorAll('.dashboard-section').forEach(sec => sec.style.display = 'none');
    // Mostra apenas a(s) seção(ões) correspondente(s)
    const sec = sections.find(s => s.section === sectionName);
    if (sec) {
        sec.selector.split(',').forEach(sel => {
            const el = document.querySelector(sel.trim());
            if (el) el.style.display = '';
        });
    }
    // Ativa o botão correto
    sidebarBtns.forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.mac-sidebar-btn[data-section="${sectionName}"]`);
    if (btn) btn.classList.add('active');
}
sidebarBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        sidebarBtns.forEach(b => {
            b.classList.remove('active');
            if (b.nextElementSibling) b.nextElementSibling.classList.remove('active');
        });
        btn.classList.add('active');
        if (btn.nextElementSibling) btn.nextElementSibling.classList.add('active');
        showSection(btn.getAttribute('data-section'));
    });
});
    // Inicializa mostrando o painel
    showSection('painel');

    document.querySelectorAll('.password-eye-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentNode.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.firstElementChild.classList.remove('fa-eye');
                this.firstElementChild.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.firstElementChild.classList.remove('fa-eye-slash');
                this.firstElementChild.classList.add('fa-eye');
            }
        });
    });

    const filterBtns = document.querySelectorAll('.filter-btn');
    const filteredAppointmentsList = document.getElementById('filteredAppointmentsList');

    function fetchAppointments(filter) {
        let url = '';
        if (filter === 'today') url = '/dashboard/agendamentos-hoje';
        else if (filter === 'week') url = '/dashboard/agendamentos-semana';
        else if (filter === 'month') url = '/dashboard/agendamentos-mes';

        const filteredAppointmentsList = document.getElementById('filteredAppointmentsList');
        filteredAppointmentsList.innerHTML = '<div style="padding:18px 0;text-align:center;color:var(--primary-dark);">Carregando...</div>';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                let ags = data.agendamentos || [];
                if (ags.length === 0) {
                    filteredAppointmentsList.innerHTML = `<div style="color:var(--gray-dark);padding:18px 0;text-align:center;">Nenhum agendamento encontrado.</div>`;
                    return;
                }
                // Agrupa por data
                const grupos = {};
                ags.forEach(ag => {
                    const dataStr = ag.data;
                    if (!grupos[dataStr]) grupos[dataStr] = [];
                    grupos[dataStr].push(ag);
                });
                const datasOrdenadas = Object.keys(grupos).sort();

                filteredAppointmentsList.innerHTML = '';
                const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                datasOrdenadas.forEach(dataStr => {
                    // Cabeçalho do dia
                    const dataObj = new Date(dataStr);
                    const header = document.createElement('div');
                    header.className = 'dia-header';
                    header.innerHTML = `<h3 style="margin:18px 0 8px 0;font-size:1.1em;color:var(--primary-dark);">${dias[dataObj.getDay()]}, ${dataObj.toLocaleDateString('pt-BR')}</h3>`;
                    filteredAppointmentsList.appendChild(header);

                    // Lista de agendamentos do dia
                    let agsDia = grupos[dataStr].slice();
                    // Se for hoje, destacar o próximo agendamento futuro
                    if (filter === 'today') {
                        // Ordena por hora crescente
                        agsDia.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
                        // Pega o próximo agendamento futuro
                        let now = new Date();
                        let idxProximo = agsDia.findIndex(ag => {
                            if (!ag.hora) return false;
                            const [h, m] = ag.hora.split(':');
                            const agDate = new Date();
                            agDate.setHours(Number(h), Number(m), 0, 0);
                            return agDate > now;
                        });
                        if (idxProximo === -1) idxProximo = 0; // Se todos já passaram, destaca o primeiro
                        agsDia.forEach((ag, idx) => {
                            const item = document.createElement('div');
                            item.className = 'appointment-item';
                            if (idx === idxProximo) item.classList.add('next-appointment');
                            item.innerHTML = `
                                <div class="appointment-card">
                                    <div class="appointment-header">
                                        <span class="appointment-client">
                                            <i class="fas fa-user"></i> ${ag.nome || 'Cliente'}
                                        </span>
                                    </div>
                                    <div class="appointment-details">
                                        <span><i class="far fa-clock"></i> ${ag.hora || '--:--'}</span>
                                        <span><i class="fas fa-cut"></i> ${ag.servico || '-'}</span>
                                        <span><i class="fas fa-user-tie"></i> ${ag.profissional || '-'}</span>
                                        <span><i class="fas fa-phone"></i> ${ag.telefone || '-'}</span>
                                        <div class="appointment-status-group">
                                            <span class="appointment-status status-confirmed">Confirmado</span>
                                            <button class="send-notificacoes-btn" title="Notificar">
                                                <i class="fas fa-bell"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                            filteredAppointmentsList.appendChild(item);
                        });
                    } else {
                        agsDia.forEach(ag => {
                            const item = document.createElement('div');
                            item.className = 'appointment-item';
                            item.innerHTML = `
                                <div class="appointment-card">
                                    <div class="appointment-header">
                                        <span class="appointment-client">
                                            <i class="fas fa-user"></i> ${ag.nome || 'Cliente'}
                                        </span>
                                    </div>
                                    <div class="appointment-details">
                                        <span><i class="far fa-clock"></i> ${ag.hora || '--:--'}</span>
                                        <span><i class="fas fa-cut"></i> ${ag.servico || '-'}</span>
                                        <span><i class="fas fa-user-tie"></i> ${ag.profissional || '-'}</span>
                                        <span><i class="fas fa-phone"></i> ${ag.telefone || '-'}</span>
                                        <div class="appointment-status-group">
                                            <span class="appointment-status status-confirmed">Confirmado</span>
                                            <button class="send-notificacoes-btn" title="Notificar">
                                                <i class="fas fa-bell"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                            filteredAppointmentsList.appendChild(item);
                        });
                    }
                });
            })
            .catch(() => {
                filteredAppointmentsList.innerHTML = `<div style="color:var(--red);padding:18px 0;text-align:center;">Erro ao carregar agendamentos.</div>`;
            });
}

// Função para obter o nome do dia da semana em português
function diaSemanaExtenso(dataStr) {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const data = new Date(dataStr);
    return dias[data.getDay()];
}

// Função para agrupar agendamentos por data
function agruparPorData(agendamentos) {
    const grupos = {};
    agendamentos.forEach(ag => {
        const data = ag.data;
        if (!grupos[data]) grupos[data] = [];
        grupos[data].push(ag);
    });
    return grupos;
}

// Função para renderizar os agendamentos agrupados por dia
function renderAgendamentosAgrupados(agendamentos) {
    const container = document.getElementById('lista-agendamentos');
    container.innerHTML = '';
    const grupos = agruparPorData(agendamentos);
    const datasOrdenadas = Object.keys(grupos).sort();

    datasOrdenadas.forEach(dataStr => {
        // Cabeçalho do dia
        const header = document.createElement('div');
        header.className = 'dia-header';
        header.innerHTML = `<h3>${diaSemanaExtenso(dataStr)}, ${new Date(dataStr).toLocaleDateString('pt-BR')}</h3>`;
        container.appendChild(header);

        // Lista de agendamentos do dia
        grupos[dataStr].forEach(ag => {
            const item = document.createElement('div');
            item.className = 'appointment-item';
            item.innerHTML = `
                <div class="appointment-card">
    <div class="appointment-header">
        <span class="appointment-client">
            <i class="fas fa-user"></i> ${ag.nome || 'Cliente'}
        </span>
    </div>
<div class="appointment-details">
    <span><i class="far fa-clock"></i> ${ag.hora || '--:--'}</span>
    <span><i class="fas fa-cut"></i> ${ag.servico || '-'}</span>
    <span><i class="fas fa-user-tie"></i> ${ag.profissional || '-'}</span>
    <span><i class="fas fa-phone"></i> ${ag.telefone || '-'}</span>
    <div class="appointment-status-group">
        <span class="appointment-status status-confirmed">Confirmado</span>
        <button class="send-notificacoes-btn"
            <i class="fas fa-bell"></i>
        </button>
    </div>
</div>
</div>
                    `;
            container.appendChild(item);
        });
    });
}

// Filtro inicial: hoje
fetchAppointments('today');

// Troca de filtro
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        fetchAppointments(this.dataset.filter);
    });
});

// Função para renderizar os serviços na dashboard
   async function renderDashboardServices() {
    const container = document.getElementById('servicesContainer');
    if (!container) return;
    container.innerHTML = '<div style="padding:18px 0;text-align:center;color:var(--primary-dark);">Carregando...</div>';
    try {
        const res = await fetch('/dashboard/servicos-admin');
        const data = await res.json();
        if (data.success && Array.isArray(data.servicos)) {
            if (data.servicos.length === 0) {
                container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Nenhum serviço cadastrado.</div>';
                return;
            }
            let html = '';
            data.servicos.forEach(servico => {
                html += `
                <div class="service-card" data-id="${servico.id}">
    <div class="service-card-header">
        <div class="service-switch-title">
            <label class="toggle-switch" style="margin-right:10px;">
                <input type="checkbox" class="service-switch" ${servico.ativo ? 'checked' : ''} data-id="${servico.id}">
                <span class="slider"></span>
            </label>
            <span class="service-card-name">${servico.nome}</span>
        </div>
        <div class="service-actions">
            <button class="service-action-btn edit-btn" title="Editar serviço" data-id="${servico.id}" data-nome="${servico.nome}" data-tempo="${servico.tempo}" data-preco="${servico.preco}" data-imagem="${servico.imagem || ''}">
                <i class="fas fa-pen"></i>
            </button>
            <button class="service-action-btn delete-btn" title="Excluir serviço" data-id="${servico.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
    <div class="service-card-details">
        <span><i class="far fa-clock"></i> ${servico.tempo}</span>
        <span><i class="fas fa-dollar-sign"></i> R$ ${Number(servico.preco).toFixed(2).replace('.', ',')}</span>
    </div>
</div>
                `;
            });
            container.innerHTML = html;

            // Adiciona evento aos switches
            container.querySelectorAll('.service-switch').forEach(switchEl => {
                switchEl.addEventListener('change', async function() {
                    const id = this.getAttribute('data-id');
                    const ativo = this.checked ? 1 : 0;
                    await fetch(`/dashboard/servicos/${id}/ativo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ativo })
                    });
                });
            });

            // Eventos dos botões de editar e deletar
            container.querySelectorAll('.service-action-btn.edit-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    openEditServiceModal({
                        id: btn.dataset.id,
                        nome: btn.dataset.nome,
                        tempo: btn.dataset.tempo,
                        preco: btn.dataset.preco,
                        imagem: btn.dataset.imagem
                    });
                });
            });
            container.querySelectorAll('.service-action-btn.delete-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm('Tem certeza que deseja excluir este serviço?')) {
                        fetch(`/dashboard/servicos/${id}`, {
                            method: 'DELETE'
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                renderDashboardServices();
                            } else {
                                showCustomAlert(data.message || 'Erro ao excluir serviço.');
                            }
                        })
                        .catch(() => showCustomAlert('Erro ao conectar ao servidor.'));
                    }
                });
            });
        } else {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar serviços.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar serviços.</div>';
    }
}

    // Chama ao carregar a página
    renderDashboardServices();

    // MODAL DE EDIÇÃO DE SERVIÇO
    const editServiceModal = document.getElementById('editServiceModal');
    const closeEditServiceModal = document.getElementById('closeEditServiceModal');
    const cancelEditService = document.getElementById('cancelEditService');
    const editServiceForm = document.getElementById('editServiceForm');
    const editServiceMsg = document.getElementById('editServiceMsg');

    function openEditServiceModal(servico) {
        document.getElementById('editServiceId').value = servico.id;
        document.getElementById('editServiceName').value = servico.nome;
        document.getElementById('editServiceTime').value = servico.tempo;
        document.getElementById('editServicePrice').value = servico.preco;
        document.getElementById('editServiceImage').value = servico.imagem || '';
        editServiceMsg.textContent = '';
        editServiceModal.style.display = 'flex';

        carregarGaleriaImagensServico('editServiceImageGallery', 'editServiceImage', servico.imagem || '');
    }
    function closeEditModal() {
        editServiceModal.style.display = 'none';
    }
    closeEditServiceModal.onclick = closeEditModal;
    cancelEditService.onclick = closeEditModal;
    editServiceModal.onclick = function(e) {
        if (e.target === editServiceModal) closeEditModal();
    };

    // Evento do botão de editar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-action-btn.edit-btn')) {
            const btn = e.target.closest('.service-action-btn.edit-btn');
            openEditServiceModal({
                id: btn.dataset.id,
                nome: btn.dataset.nome,
                tempo: btn.dataset.tempo,
                preco: btn.dataset.preco,
                imagem: btn.dataset.imagem
            });
        }
    });

    // Submissão do formulário de edição
    editServiceForm.onsubmit = async function(e) {
        e.preventDefault();
        editServiceMsg.textContent = '';
        const id = document.getElementById('editServiceId').value;
        const nome = document.getElementById('editServiceName').value.trim();
        const tempo = document.getElementById('editServiceTime').value.trim();
        const preco = document.getElementById('editServicePrice').value;
        const imagem = document.getElementById('editServiceImage').value.trim();

        if (!nome || !tempo || !preco) {
            editServiceMsg.textContent = 'Preencha todos os campos obrigatórios.';
            return;
        }
        try {
            const res = await fetch(`/dashboard/servicos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, tempo, preco, imagem })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                editServiceMsg.style.color = 'var(--success)';
                editServiceMsg.textContent = 'Serviço atualizado com sucesso!';
                setTimeout(() => {
                    closeEditModal();
                    renderDashboardServices();
                }, 900);
            } else {
                editServiceMsg.style.color = 'var(--primary-dark)';
                editServiceMsg.textContent = data.message || 'Erro ao atualizar serviço.';
            }
        } catch (err) {
            editServiceMsg.style.color = 'var(--primary-dark)';
            editServiceMsg.textContent = 'Erro ao conectar ao servidor.';
        }
    };

    // Evento do botão de excluir
    document.addEventListener('click', function(e) {
        if (e.target.closest('.service-action-btn.delete-btn')) {
            const btn = e.target.closest('.service-action-btn.delete-btn');
            const id = btn.dataset.id;
            if (confirm('Tem certeza que deseja excluir este serviço?')) {
fetch(`/dashboard/servicos/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        renderDashboardServices();
                    } else {
                        showCustomAlert(data.message || 'Erro ao excluir serviço.');
                    }
                })
                .catch(() => showCustomAlert('Erro ao conectar ao servidor.'));
            }
        }
    });

    // Abrir modal de adicionar serviço
const addServiceBtn = document.getElementById('addServiceBtn');
const addServiceModal = document.getElementById('addServiceModal');
const closeAddServiceModal = document.getElementById('closeAddServiceModal');
const addServiceForm = document.getElementById('addServiceForm');
const addServiceMsg = document.getElementById('addServiceMsg');

if (addServiceBtn && addServiceModal) {
    addServiceBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Impede propagação para não fechar o modal
        addServiceModal.style.display = 'flex';
        addServiceMsg.textContent = '';
        addServiceForm.reset();

        carregarGaleriaImagensServico('serviceImageGallery', 'addServiceImage');
    });
}
if (closeAddServiceModal && addServiceModal) {
    closeAddServiceModal.addEventListener('click', function() {
        addServiceModal.style.display = 'none';
    });
}
if (addServiceModal) {
    addServiceModal.addEventListener('click', function(e) {
        if (e.target === addServiceModal) addServiceModal.style.display = 'none';
    });
}

    // Submissão do formulário de novo serviço
    if (addServiceForm) {
        addServiceForm.onsubmit = async function(e) {
            e.preventDefault();
            addServiceMsg.textContent = '';
            const nome = document.getElementById('addServiceName').value.trim();
            const tempo = document.getElementById('addServiceTime').value.trim();
            const preco = document.getElementById('addServicePrice').value;
            const imagem = document.getElementById('addServiceImage').value.trim();

            if (!nome || !tempo || !preco) {
                addServiceMsg.style.color = 'var(--primary-dark)';
                addServiceMsg.textContent = 'Preencha todos os campos obrigatórios.';
                return;
            }
            try {
                const res = await fetch('/dashboard/servicos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, tempo, preco, imagem })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    addServiceMsg.style.color = 'var(--success)';
                    addServiceMsg.textContent = 'Serviço adicionado com sucesso!';
                    setTimeout(() => {
                        addServiceModal.style.display = 'none';
                        if (typeof renderDashboardServices === 'function') renderDashboardServices();
                    }, 900);
                } else {
                    addServiceMsg.style.color = 'var(--primary-dark)';
                    addServiceMsg.textContent = data.message || 'Erro ao adicionar serviço.';
                }
            } catch (err) {
                addServiceMsg.style.color = 'var(--primary-dark)';
                addServiceMsg.textContent = 'Erro ao conectar ao servidor.';
            }
        };
    }
    // Modal de alterar senha
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const cancelBtn = document.querySelector('#changePasswordModal .btn.btn-secondary[type="button"]');
const closeChangePasswordBtns = changePasswordModal ? changePasswordModal.querySelectorAll('.close-modal') : [];
const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordError = document.getElementById('changePasswordError');
const changePasswordSuccess = document.getElementById('changePasswordSuccess');

if (cancelBtn && changePasswordModal) {
    cancelBtn.addEventListener('click', function() {
        changePasswordModal.style.display = 'none';
    });
}

// Abrir modal
if (changePasswordBtn && changePasswordModal) {
    changePasswordBtn.addEventListener('click', function() {
        changePasswordModal.style.display = 'flex';
        changePasswordForm.reset();
        changePasswordError.style.display = 'none';
        changePasswordSuccess.style.display = 'none';
    });
}

document.querySelectorAll('#changePasswordModal .password-eye-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const input = this.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            this.querySelector('i').classList.remove('fa-eye');
            this.querySelector('i').classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.querySelector('i').classList.remove('fa-eye-slash');
            this.querySelector('i').classList.add('fa-eye');
        }
    });
});

// Fechar modal
closeChangePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        changePasswordModal.style.display = 'none';
    });
});
if (changePasswordModal) {
    changePasswordModal.addEventListener('click', function(e) {
        if (e.target === changePasswordModal) changePasswordModal.style.display = 'none';
    });
}

// Mostrar/ocultar senha
changePasswordModal?.querySelectorAll('.password-eye-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.parentNode.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            this.firstElementChild.classList.remove('fa-eye');
            this.firstElementChild.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            this.firstElementChild.classList.remove('fa-eye-slash');
            this.firstElementChild.classList.add('fa-eye');
        }
    });
});

// Submissão do formulário de alteração de senha
if (changePasswordForm) {
    changePasswordForm.onsubmit = async function(e) {
        e.preventDefault();
        changePasswordError.style.display = 'none';
        changePasswordSuccess.style.display = 'none';

        const atual = document.getElementById('currentPassword').value.trim();
        const nova = document.getElementById('newPassword').value.trim();
        const confirmar = document.getElementById('confirmPassword').value.trim();

        if (!atual || !nova || !confirmar) {
            changePasswordError.textContent = 'Preencha todos os campos.';
            changePasswordError.style.display = 'block';
            return;
        }
        if (nova !== confirmar) {
            changePasswordError.textContent = 'As senhas não coincidem.';
            changePasswordError.style.display = 'block';
            return;
        }
        if (nova.length < 4) {
            changePasswordError.textContent = 'A senha deve ter pelo menos 4 caracteres.';
            changePasswordError.style.display = 'block';
            return;
        }
        try {
            const res = await fetch('/dashboard/alterar-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ atual, nova })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                changePasswordSuccess.textContent = data.message || 'Senha alterada com sucesso!';
                changePasswordSuccess.style.display = 'block';
                setTimeout(() => {
                    changePasswordModal.style.display = 'none';
                }, 1200);
            } else {
                changePasswordError.textContent = data.message || 'Erro ao alterar senha.';
                changePasswordError.style.display = 'block';
            }
        } catch (err) {
            changePasswordError.textContent = 'Erro ao conectar ao servidor.';
            changePasswordError.style.display = 'block';
        }
    };
}

// Preview da imagem no modal de adicionar serviço
const addServiceImageInput = document.getElementById('addServiceImage');
const addServiceImagePreview = document.getElementById('addServiceImagePreview');
if (addServiceImageInput && addServiceImagePreview) {
    function updateAddServicePreview() {
        const url = addServiceImageInput.value.trim();
        if (url) {
            addServiceImagePreview.innerHTML = `<img src="${url}" alt="Pré-visualização" style="max-width:100%;max-height:80px;border-radius:8px;box-shadow:0 1px 6px #0001;">`;
        } else {
            addServiceImagePreview.innerHTML = '';
        }
    }
    addServiceImageInput.addEventListener('input', updateAddServicePreview);
    // Limpa preview ao abrir modal
    addServiceBtn?.addEventListener('click', () => { addServiceImagePreview.innerHTML = ''; });
}

// Preview da imagem no modal de editar serviço
const editServiceImageInput = document.getElementById('editServiceImage');
const editServiceImagePreview = document.getElementById('editServiceImagePreview');
if (editServiceImageInput && editServiceImagePreview) {
    function updateEditServicePreview() {
        const url = editServiceImageInput.value.trim();
        if (url) {
            editServiceImagePreview.innerHTML = `<img src="${url}" alt="Pré-visualização" style="max-width:100%;max-height:80px;border-radius:8px;box-shadow:0 1px 6px #0001;">`;
        } else {
            editServiceImagePreview.innerHTML = '';
        }
    }
    editServiceImageInput.addEventListener('input', updateEditServicePreview);
    // Atualiza preview ao abrir modal de edição
    function setEditServicePreviewOnOpen() {
        updateEditServicePreview();
    }
    if (typeof openEditServiceModal === 'function') {
        const originalOpenEditServiceModal = openEditServiceModal;
        window.openEditServiceModal = function(servico) {
            originalOpenEditServiceModal(servico);
            setTimeout(updateEditServicePreview, 50);
        };
    }
}

async function carregarHorariosSemana() {
    const res = await fetch('/dashboard/horarios-semana');
    const data = await res.json();
    if (data.success) {
        data.horarios.forEach(h => {
            const input = document.querySelector(`[data-dia="${h.dia_semana}"]`);
            if (input) input.value = h.horario;
        });
    }
}

async function salvarHorarioSemana(dia, horario) {
    await fetch('/dashboard/horarios-semana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia_semana: dia, horario })
    });
}

// Exemplo: ao salvar um campo
document.querySelectorAll('.input-horario-semana').forEach(input => {
    input.addEventListener('change', function() {
        const dia = this.getAttribute('data-dia');
        salvarHorarioSemana(dia, this.value);
    });
});

// Horários da semana
const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
];

let turnosSemana = []; // [{dia_semana, turno_inicio, turno_fim}, ...]

const horarioModal = document.getElementById('horarioModal');
const closeHorarioModal = document.getElementById('closeHorarioModal');
const horarioForm = document.getElementById('horarioForm');
const modalDiaSemana = document.getElementById('modalDiaSemana');
const modalHorarioTitle = document.getElementById('modalHorarioTitle');
const turnosContainer = document.getElementById('turnosContainer');
const addTurnoBtn = document.getElementById('addTurnoBtn');
addTurnoBtn.onclick = () => addTurnoRow();

// Render cards dos dias (exemplo)
function renderHorariosSemana() {
    workingHoursGrid.innerHTML = '';
    diasSemana.forEach(dia => {
        const turnos = turnosSemana.filter(t => t.dia_semana === dia.key);
        workingHoursGrid.innerHTML += `
        <div class="day-schedule" style="background-color: var(--gray-light); border-radius: 12px; padding: 18px 18px 14px 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1.5px solid var(--primary-light); min-width: 0; position: relative;">
            <div class="day-header" style="display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                    <i class="fas fa-calendar-day" style="color:#888;font-size:1.1rem;"></i>
                    <div class="day-title">${dia.label}</div>
                </div>
                <button class="edit-btn" data-dia="${dia.key}" title="Editar horários" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--gray);border:none;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.04);transition:background 0.2s;">
                    <i class="fas fa-pen" style="color:#FFD700;font-size:1.1rem;"></i>
                </button>
            </div>
            <div class="time-slots" style="margin-top:10px;">
                ${turnos.length === 0
                    ? '<span class="time-slot" style="color:#e74c3c;font-weight:bold;">Fechado</span>'
                    : turnos.map(t => `<span class="time-slot">${t.turno_inicio.slice(0,5)} - ${t.turno_fim.slice(0,5)}</span>`).join('')}
            </div>
        </div>
        `;
    });
    document.querySelectorAll('.edit-btn[data-dia]').forEach(btn => {
        btn.onclick = () => abrirModalHorario(btn.getAttribute('data-dia'));
    });
}

// Modal: abrir para editar/adicionar turnos
function abrirModalHorario(diaKey) {
    modalDiaSemana.value = diaKey;
    modalHorarioTitle.textContent = `Editar horários de ${diasSemana.find(d => d.key === diaKey).label}`;
    turnosContainer.innerHTML = '';
    const turnos = turnosSemana.filter(t => t.dia_semana === diaKey);
    const diaFechado = turnos.length === 0;

    // Limpa botões antigos
    fecharDiaBtn.remove();
    abrirDiaBtn.remove();

    if (diaFechado) {
        // Dia fechado: mostra botão "Abrir dia"
        turnosContainer.innerHTML = `
            <div class="dia-fechado-msg animate-fade-in">
                <i class="fas fa-lock" style="color:#e74c3c;font-size:2rem;margin-bottom:8px;"></i>
                <div style="color:#e74c3c;font-weight:600;font-size:1.1rem;">Fechado</div>
                <div style="color:var(--gray-dark);font-size:0.95rem;margin-top:4px;">Nenhum horário disponível neste dia.</div>
            </div>
        `;
        turnosContainer.parentNode.insertBefore(abrirDiaBtn, turnosContainer.nextSibling);
    } else {
        // Dia aberto: mostra horários e botão "Fechar dia"
        turnos.forEach(t => addTurnoRow(t.turno_inicio, t.turno_fim));
        if (turnos.length === 0) addTurnoRow();
        turnosContainer.parentNode.insertBefore(fecharDiaBtn, turnosContainer.nextSibling);
    }
    horarioModal.style.display = 'flex';

    // Evento para fechar o dia
    fecharDiaBtn.onclick = () => {
        turnosContainer.innerHTML = `
            <div class="dia-fechado-msg animate-fade-in">
                <i class="fas fa-lock" style="color:#e74c3c;font-size:2rem;margin-bottom:8px;"></i>
                <div style="color:#e74c3c;font-weight:600;font-size:1.1rem;">Fechado</div>
                <div style="color:var(--gray-dark);font-size:0.95rem;margin-top:4px;">Nenhum horário disponível neste dia.</div>
            </div>
        `;
        // Remove todos os turnos do dia (fecha o dia)
        turnosSemana = turnosSemana.filter(t => t.dia_semana !== diaKey);
        fecharDiaBtn.remove();
        turnosContainer.parentNode.insertBefore(abrirDiaBtn, turnosContainer.nextSibling);
    };

    // Evento para abrir o dia
    abrirDiaBtn.onclick = () => {
        turnosContainer.innerHTML = '';
        addTurnoRow();
        abrirDiaBtn.remove();
        turnosContainer.parentNode.insertBefore(fecharDiaBtn, turnosContainer.nextSibling);
    };
}

// Adiciona um campo de turno ao modal
function addTurnoRow(inicio = '', fim = '') {
    const row = document.createElement('div');
    row.className = 'turno-row';
    row.innerHTML = `
        <input type="time" class="turno-inicio" value="${inicio}" required>
        <span>às</span>
        <input type="time" class="turno-fim" value="${fim}" required>
        <button type="button" class="remove-turno-btn" title="Remover turno"><i class="fas fa-trash"></i></button>
    `;
    row.querySelector('.remove-turno-btn').onclick = () => {
        row.remove();
        if (turnosContainer.childElementCount === 0) addTurnoRow();
    };
    turnosContainer.appendChild(row);
}

// Botão para adicionar turno
addTurnoBtn.onclick = () => addTurnoRow();

// Fechar modal
closeHorarioModal.onclick = () => { horarioModal.style.display = 'none'; };
window.onclick = function(event) {
    if (event.target === horarioModal) horarioModal.style.display = 'none';
};
const fecharDiaBtn = document.createElement('button');
fecharDiaBtn.type = 'button';
fecharDiaBtn.className = 'btn fechar-dia-btn';
fecharDiaBtn.innerHTML = '<i class="fas fa-lock"></i> Fechar dia';

const abrirDiaBtn = document.createElement('button');
abrirDiaBtn.type = 'button';
abrirDiaBtn.className = 'btn abrir-dia-btn';
abrirDiaBtn.innerHTML = '<i class="fas fa-unlock"></i> Abrir dia';

// ...dentro da função abrirModalHorario(diaKey) substitua o conteúdo do modal...
function abrirModalHorario(diaKey) {
    modalDiaSemana.value = diaKey;
    modalHorarioTitle.textContent = `Editar horários de ${diasSemana.find(d => d.key === diaKey).label}`;
    turnosContainer.innerHTML = '';

    // Verifica se o dia está fechado (sem turnos e flag especial)
    const turnos = turnosSemana.filter(t => t.dia_semana === diaKey);
    const diaFechado = turnos.length === 0;

    // Limpa botões antigos
    fecharDiaBtn.remove();
    abrirDiaBtn.remove();

    if (diaFechado) {
        // Dia fechado: mostra botão "Abrir dia"
        turnosContainer.innerHTML = `
            <div class="dia-fechado-msg animate-fade-in">
                <i class="fas fa-lock" style="color:#e74c3c;font-size:2rem;margin-bottom:8px;"></i>
                <div style="color:#e74c3c;font-weight:600;font-size:1.1rem;">Fechado</div>
                <div style="color:var(--gray-dark);font-size:0.95rem;margin-top:4px;">Nenhum horário disponível neste dia.</div>
            </div>
        `;
        turnosContainer.parentNode.insertBefore(abrirDiaBtn, turnosContainer.nextSibling);
    } else {
        // Dia aberto: mostra horários e botão "Fechar dia"
        turnos.forEach(t => addTurnoRow(t.turno_inicio, t.turno_fim));
        if (turnos.length === 0) addTurnoRow();
        turnosContainer.parentNode.insertBefore(fecharDiaBtn, turnosContainer.nextSibling);
    }
    horarioModal.style.display = 'flex';

    // Evento para fechar o dia
    fecharDiaBtn.onclick = () => {
        turnosContainer.innerHTML = `
            <div class="dia-fechado-msg animate-fade-in">
                <i class="fas fa-lock" style="color:#e74c3c;font-size:2rem;margin-bottom:8px;"></i>
                <div style="color:#e74c3c;font-weight:600;font-size:1.1rem;">Fechado</div>
                <div style="color:var(--gray-dark);font-size:0.95rem;margin-top:4px;">Nenhum horário disponível neste dia.</div>
            </div>
        `;
        // Remove todos os turnos do dia (fecha o dia)
        turnosSemana = turnosSemana.filter(t => t.dia_semana !== diaKey);
        fecharDiaBtn.remove();
        turnosContainer.parentNode.insertBefore(abrirDiaBtn, turnosContainer.nextSibling);
    };

    // Evento para abrir o dia
    abrirDiaBtn.onclick = () => {
        turnosContainer.innerHTML = '';
        addTurnoRow();
        abrirDiaBtn.remove();
        turnosContainer.parentNode.insertBefore(fecharDiaBtn, turnosContainer.nextSibling);
    };
}

// ...no onsubmit do horarioForm, ajuste para salvar corretamente...
horarioForm.onsubmit = async function(e) {
    e.preventDefault();
    const dia_semana = modalDiaSemana.value;
    let turnos = [];
    // Se o dia está fechado, salva array vazio
    if (turnosContainer.textContent.includes('Fechado')) {
        turnos = [];
    } else {
        turnosContainer.querySelectorAll('.turno-row').forEach(row => {
            const inicio = row.querySelector('.turno-inicio').value;
            const fim = row.querySelector('.turno-fim').value;
            if (inicio && fim) turnos.push({ inicio, fim });
        });
    }
    await fetch('/dashboard/horarios-turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia_semana, turnos })
    });
    await carregarHorariosTurnos();
    horarioModal.style.display = 'none';
};

// Carregar turnos do backend
async function carregarHorariosTurnos() {
    const res = await fetch('/dashboard/horarios-turnos');
    const data = await res.json();
    if (data.success) {
        // turnosSemana agora é só os turnos válidos (sem flag fechado)
        turnosSemana = data.turnos;
        renderHorariosSemana();
    }
}

// Inicialização
if (document.getElementById('horarios-section')) {
    carregarHorariosTurnos();
}

// Notificações
const notificationBtn = document.getElementById('notificationBtn');
const notificationsModal = document.getElementById('notificationsModal');
const closeNotificationsModal = document.getElementById('closeNotificationsModal');
const notificationsList = document.getElementById('notificationsList');
const notificationDot = document.getElementById('notificationDot');

notificationBtn.onclick = () => {
    notificationsModal.style.display = 'flex';
    carregarNotificacoes();
};
closeNotificationsModal.onclick = () => notificationsModal.style.display = 'none';
notificationsModal.onclick = function(e) {
    if (e.target === notificationsModal) notificationsModal.style.display = 'none';
};

async function carregarNotificacoes() {
    notificationsList.innerHTML = '<div style="padding:18px 0;text-align:center;color:var(--primary-dark);">Carregando...</div>';
    try {
        const res = await fetch('/dashboard/notificacoes');
        const data = await res.json();
        if (data.success && data.notificacoes.length > 0) {
            notificationsList.innerHTML = '';
            let hasUnread = false;
            data.notificacoes.forEach(n => {
                const item = document.createElement('div');
                item.className = 'notification-item';
                // Corrige bug de fuso horário: mostra sempre a data correta em Brasília (UTC-3)
                let dataNotificacao = new Date(n.data);
                // Se a data vier como string sem fuso, trata como local. Se vier como UTC, ajusta:
                // Força para UTC e soma 3 horas (Brasília)
                let dataBrasilia = new Date(dataNotificacao.getTime() + (3 * 60 * 60 * 1000));
                // Se já estiver correta, não haverá efeito colateral
                let dataFormatada = dataBrasilia.toLocaleString('pt-BR');
                item.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-title"><i class="fas fa-bell"></i> ${n.titulo}</div>
                        <div class="notification-date">${dataFormatada}</div>
                        <div class="notification-message">${n.mensagem}</div>
                    </div>
                    <button class="delete-notification-btn" data-id="${n.id}" title="Marcar como lida">
                        <i class="fas fa-check"></i>
                    </button>
                `;
                item.querySelector('.delete-notification-btn').onclick = async function() {
                    await fetch('/dashboard/notificacoes/' + n.id, { method: 'DELETE' });
                    item.remove();
                    carregarNotificacoes();
                };
                notificationsList.appendChild(item);
                if (!n.lida) hasUnread = true;
            });
            notificationDot.style.display = hasUnread ? 'block' : 'none';
        } else {
            notificationsList.innerHTML = '<div style="color:var(--gray-dark);padding:18px 0;text-align:center;">Nenhuma notificação.</div>';
            notificationDot.style.display = 'none';
        }
    } catch (err) {
        notificationsList.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar notificações.</div>';
    }
}

// Atualizar dot de notificação ao abrir dashboard
carregarNotificacoes();

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.send-notificacoes-btn');
    if (!btn) return;
    // Botão permanece visível, mas não faz nada.
});

        });

        // Abrir modal
const editProfessionalsBtn = document.getElementById('editProfessionalsBtn');
const addProfessionalModal = document.getElementById('addProfessionalModal');
if (editProfessionalsBtn && addProfessionalModal) {
    editProfessionalsBtn.addEventListener('click', () => {
        addProfessionalModal.style.display = 'flex';
        document.getElementById('addProfessionalMsg').textContent = '';
        document.getElementById('professionalNameInput').value = '';
        document.getElementById('avatarPreview').innerHTML = `<i class="fas fa-user" style="font-size: 40px; color: #aaa;"></i>`;
        avatarBase64 = '';
    });
}

// Fechar modal
document.getElementById('closeAddProfessionalModal').onclick =
document.getElementById('cancelAddProfessional').onclick = function() {
    addProfessionalModal.style.display = 'none';
};

// Avatar preview e conversão para base64
let avatarBase64 = '';
const avatarInput = document.getElementById('avatarInput');
const avatarUploadBtn = document.getElementById('avatarUploadBtn');
const avatarPreview = document.getElementById('avatarPreview');

avatarUploadBtn.onclick = () => avatarInput.click();
avatarInput.onchange = function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        avatarBase64 = e.target.result;
        avatarPreview.innerHTML = `<img src="${avatarBase64}" alt="Avatar" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
};

// Adicionar profissional
document.getElementById('addProfessionalBtn').onclick = async function() {
    const nome = document.getElementById('professionalNameInput').value.trim();
    const msg = document.getElementById('addProfessionalMsg');
    msg.textContent = '';
    if (!nome) {
        msg.style.color = 'var(--primary-dark)';
        msg.textContent = 'Digite o nome do profissional.';
        return;
    }
    this.disabled = true;
    msg.textContent = 'Adicionando...';
    try {
        const res = await fetch('/dashboard/profissionais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, avatar: avatarBase64 })
        });
        const data = await res.json();
        if (data.success) {
            msg.style.color = 'var(--success)';
            msg.textContent = 'Profissional adicionado!';
            setTimeout(() => {
                addProfessionalModal.style.display = 'none';
                carregarProfissionaisDashboard();
            }, 900);
        } else {
            msg.style.color = 'var(--primary-dark)';
            msg.textContent = data.message || 'Erro ao adicionar profissional.';
        }
    } catch {
        msg.style.color = 'var(--primary-dark)';
        msg.textContent = 'Erro ao conectar ao servidor.';
    }
    this.disabled = false;
};


// Informações da barbearia
async function carregarBarbeariaDashboard() {
    const container = document.getElementById('barbershopInfoDashboard');
    try {
        const res = await fetch('/dashboard/barbearia');
        const data = await res.json();
        if (data.success) {
            const b = data.barbearia;
            container.innerHTML = `
                <div class="barbershop-photo">
                    <div class="barbershop-photo-inner">
                        <img src="${b.foto || 'img/sua-logo.png'}" alt="Foto da Barbearia">
                    </div>
                </div>
                <div class="barbershop-main">
                    <div class="barbershop-title-row">
                        <span class="barbershop-title">${b.nome}</span>
                    </div>
                    <div class="barbershop-address-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${b.endereco}, ${b.cidade_estado}</span>
                    </div>
                    <div class="barbershop-whatsapp-row">
                        <i class="fab fa-whatsapp"></i>
                        <a href="https://wa.me/${b.whatsapp}" target="_blank">
                            (${b.whatsapp.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')})
                        </a>
                    </div>
                    <div class="barbershop-instagram-row">
                        <i class="fab fa-instagram"></i>
                        <a href="https://instagram.com/${b.instagram}" target="_blank">
                            @${b.instagram}
                        </a>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Informações da barbearia não cadastradas.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar informações.</div>';
    }
}
carregarBarbeariaDashboard();

// Elementos do modal
const editBarbershopModal = document.getElementById('editBarbershopModal');
const closeEditBarbershopModal = document.getElementById('closeEditBarbershopModal');
const cancelEditBarbershop = document.getElementById('cancelEditBarbershop');
const editBarbershopForm = document.getElementById('editBarbershopForm');
const editBarbershopMsg = document.getElementById('editBarbershopMsg');

// Abrir modal e preencher campos
document.getElementById('editBarbershopInfoBtn').onclick = async function() {
    try {
        const res = await fetch('/dashboard/barbearia');
        const data = await res.json();
        if (data.success) {
            const b = data.barbearia;
            document.getElementById('editBarbershopName').value = b.nome || '';
            document.getElementById('editBarbershopWhatsapp').value = b.whatsapp || '';
            document.getElementById('editBarbershopInstagram').value = b.instagram || '';
            document.getElementById('editBarbershopAddress').value = b.endereco || '';
            document.getElementById('editBarbershopCityState').value = b.cidade_estado || '';
            document.getElementById('editBarbershopPhoto').value = b.foto || '';
            document.getElementById('editBarbershopMsg').textContent = '';
            document.getElementById('editBarbershopModal').style.display = 'flex';
        } else {
            showCustomAlert('Informações da barbearia não cadastradas.');
        }
    } catch (err) {
        showCustomAlert('Erro ao carregar informações da barbearia.');
    }
};

// Fechar modal
closeEditBarbershopModal.onclick = () => editBarbershopModal.style.display = 'none';
cancelEditBarbershop.onclick = () => editBarbershopModal.style.display = 'none';
editBarbershopModal.onclick = function(e) {
    if (e.target === editBarbershopModal) editBarbershopModal.style.display = 'none';
};

// Submissão do formulário
editBarbershopForm.onsubmit = async function(e) {
    e.preventDefault();
    editBarbershopMsg.textContent = '';
    const nome = document.getElementById('editBarbershopName').value.trim();
    const whatsapp = document.getElementById('editBarbershopWhatsapp').value.trim();
    const instagram = document.getElementById('editBarbershopInstagram').value.trim();
    const endereco = document.getElementById('editBarbershopAddress').value.trim();
    const cidade_estado = document.getElementById('editBarbershopCityState').value.trim();
    let foto = document.getElementById('editBarbershopPhoto').value.trim();

    // Limita o campo foto a 255 caracteres
    if (foto.length > 255) {
        editBarbershopMsg.style.color = 'var(--primary-dark)';
        editBarbershopMsg.textContent = 'A imagem é muito grande. Use uma URL de imagem ou uma imagem menor.';
        return;
    }

    try {
        const res = await fetch('/dashboard/barbearia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, whatsapp, instagram, endereco, cidade_estado, foto })
        });
        const data = await res.json();
        if (data.success) {
            editBarbershopMsg.style.color = 'var(--success)';
            editBarbershopMsg.textContent = 'Informações atualizadas com sucesso!';
            setTimeout(() => {
                editBarbershopModal.style.display = 'none';
                carregarBarbeariaDashboard();
            }, 900);
        } else {
            editBarbershopMsg.style.color = 'var(--primary-dark)';
            editBarbershopMsg.textContent = data.message || 'Erro ao atualizar informações.';
        }
    } catch (err) {
        editBarbershopMsg.style.color = 'var(--primary-dark)';
        editBarbershopMsg.textContent = 'Erro ao conectar ao servidor.';
    }
};
// Elementos do preview de foto
const barbershopPhotoPreview = document.getElementById('barbershopPhotoPreview');
const barbershopPhotoImg = document.getElementById('barbershopPhotoImg');
const barbershopPhotoIcon = document.getElementById('barbershopPhotoIcon');
const barbershopPhotoInput = document.getElementById('barbershopPhotoInput');
const barbershopPhotoBtn = document.getElementById('barbershopPhotoBtn');
const editBarbershopPhoto = document.getElementById('editBarbershopPhoto');

// Função para atualizar preview da imagem
function updateBarbershopPhotoPreview(src) {
    if (src) {
        barbershopPhotoImg.src = src;
        barbershopPhotoImg.style.display = 'block';
        barbershopPhotoIcon.style.display = 'none';
    } else {
        barbershopPhotoImg.src = '';
        barbershopPhotoImg.style.display = 'none';
        barbershopPhotoIcon.style.display = 'block';
    }
}

// Quando abrir o modal, carrega preview da imagem
document.getElementById('editBarbershopInfoBtn').onclick = async function() {
    try {
        const res = await fetch('/dashboard/barbearia');
        const data = await res.json();
        if (data.success) {
            const b = data.barbearia;
            document.getElementById('editBarbershopName').value = b.nome || '';
            document.getElementById('editBarbershopWhatsapp').value = b.whatsapp || '';
            document.getElementById('editBarbershopInstagram').value = b.instagram || '';
            document.getElementById('editBarbershopAddress').value = b.endereco || '';
            document.getElementById('editBarbershopCityState').value = b.cidade_estado || '';
            document.getElementById('editBarbershopPhoto').value = b.foto || '';
            updateBarbershopPhotoPreview(b.foto || '');
            document.getElementById('editBarbershopMsg').textContent = '';
            document.getElementById('editBarbershopModal').style.display = 'flex';
        } else {
            showCustomAlert('Informações da barbearia não cadastradas.');
        }
    } catch (err) {
        showCustomAlert('Erro ao carregar informações da barbearia.');
    }
};

// Preview ao digitar/clicar no campo de URL
editBarbershopPhoto.addEventListener('input', function() {
    updateBarbershopPhotoPreview(this.value.trim());
});

// Botão para abrir explorador de arquivos
barbershopPhotoBtn.onclick = () => barbershopPhotoInput.click();
barbershopPhotoPreview.onclick = () => barbershopPhotoInput.click();

// Quando selecionar arquivo, faz preview e converte para base64 (ou pode fazer upload para o backend se desejar)
barbershopPhotoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            updateBarbershopPhotoPreview(event.target.result);
            editBarbershopPhoto.value = event.target.result; // Salva base64 no campo de texto
        };
        reader.readAsDataURL(file);
    }
});

async function carregarWallpapers() {
    const list = document.getElementById('bgChooserList');
    list.innerHTML = 'Carregando...';
    try {
        const res = await fetch('/dashboard/wallpapers');
        const data = await res.json();
               if (data.success && Array.isArray(data.wallpapers)) {
            list.innerHTML = '';
            // Busca o wallpaper atualmente selecionado
            const selectedRes = await fetch('/dashboard/wallpaper-selecionado');
            const selectedData = await selectedRes.json();
            const selectedId = selectedData.success && selectedData.wallpaper ? selectedData.wallpaper.id : null;

            data.wallpapers.forEach(wallpaper => {
                const card = document.createElement('div');
                card.className = 'bg-chooser-item';
                card.title = wallpaper.nome || 'Wallpaper';
                card.dataset.bg = wallpaper.id;
                card.style.cursor = 'pointer';
                // Carrega a imagem do banco de dados no card
                card.innerHTML = `
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <img src="${wallpaper.url}" alt="${wallpaper.nome || 'Wallpaper'}" sty>
                        <span style="margin-top:4px;font-size:0.95em;color:#222;">${wallpaper.nome || ''}</span>
                    </div>
                `;
                if (wallpaper.id === selectedId) card.classList.add('selected');
                card.onclick = async function() {
                    document.querySelectorAll('.bg-chooser-item').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    await fetch('/dashboard/wallpaper-selecionado', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ wallpaper_id: wallpaper.id })
                    });
                };
                list.appendChild(card);
            });
        } else {
            list.innerHTML = 'Nenhum wallpaper cadastrado.';
       
        }
    } catch (err) {
        list.innerHTML = 'Erro ao carregar wallpapers.';
    }
}
carregarWallpapers();

// Função para buscar a data/hora do servidor em tempo real (NUNCA do dispositivo)
async function getServerDateTime() {

    try {
        const res = await fetch('/dashboard/servertime');
        const data = await res.json();
        if (data && data.iso) {
            return new Date(data.iso);
        }
    } catch ( err) {}
    // fallback: retorna null, nunca usa data local
    return null;
}

// Exemplo de uso para exibir data/hora de notificações SEMPRE do servidor
async function renderNotificacoesComDataReal() {
    notificationsList.innerHTML = '<div style="padding:18px 0;text-align:center;color:var(--primary-dark);">Carregando...</div>';
    try {
        const res = await fetch('/dashboard/notificacoes');
        const data = await res.json();
        if (data.success && data.notificacoes.length > 0) {
            notificationsList.innerHTML = '';
            let hasUnread = false;
            for (const n of data.notificacoes) {
                // Busca a data/hora do servidor para cada notificação
                let dataServidor = null;
                if (n.data) {
                    // Chama rota que retorna a data/hora do servidor (pode ser otimizado para batch)
                    dataServidor = await getServerDateTime();
                }
                let dataFormatada = dataServidor ? dataServidor.toLocaleString('pt-BR') : 'Indisponível';
                const item = document.createElement('div');
                item.className = 'notification-item';
                item.innerHTML = `
                    <div class="notification-content">
                        <div class="notification-title"><i class="fas fa-bell"></i> ${n.titulo}</div>
                        <div class="notification-date">${dataFormatada}</div>
                        <div class="notification-message">${n.mensagem}</div>
                    </div>
                    <button class="delete-notification-btn" data-id="${n.id}" title="Marcar como lida">
                        <i class="fas fa-check"></i>
                    </button>
                `;
                item.querySelector('.delete-notification-btn').onclick = async function() {
                    await fetch('/dashboard/notificacoes/' + n.id, { method: 'DELETE' });
                    item.remove();
                    renderNotificacoesComDataReal();
                };
                notificationsList.appendChild(item);
                if (!n.lida) hasUnread = true;
            }
            notificationDot.style.display = hasUnread ? 'block' : 'none';
        } else {
            notificationsList.innerHTML = '<div style="color:var(--gray-dark);padding:18px 0;text-align:center;">Nenhuma notificação.</div>';
            notificationDot.style.display = 'none';
        }
    } catch (err) {
        notificationsList.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar notificações.</div>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const el = document.getElementById('dashboardTodayDate');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    }
});

// Função para carregar galeria de imagens de serviço
async function carregarGaleriaImagensServico(galleryId, inputId, selectedUrl = '') {
    const gallery = document.getElementById(galleryId);
    const input = document.getElementById(inputId);
    if (!gallery || !input) return;

    // Agora busca da rota correta
    let imagens = [];
    try {
        const res = await fetch('/dashboard/servico-imagens');
        const data = await res.json();
        if (data.success && Array.isArray(data.imagens)) {
            imagens = data.imagens;
        }
    } catch (e) {
        gallery.innerHTML = '<div style="color:#b00;">Erro ao carregar imagens.</div>';
        return;
    }

    if (!imagens.length) {
        gallery.innerHTML = '<div style="color:#888;">Nenhuma imagem disponível.</div>';
        return;
    }

    gallery.innerHTML = '';
    imagens.forEach(img => {
        const el = document.createElement('img');
        el.src = img.url;
        el.alt = img.nome || 'Imagem';
        el.className = 'gallery-img' + (img.url === selectedUrl ? ' selected' : '');
        el.title = img.nome || '';
        el.onclick = () => {
            gallery.querySelectorAll('.gallery-img').forEach(i => i.classList.remove('selected'));
            el.classList.add('selected');
            input.value = img.url;
        };
        gallery.appendChild(el);
    });

    if (selectedUrl) {
        input.value = selectedUrl;
    } else {
        input.value = imagens[0].url;
        gallery.querySelector('.gallery-img').classList.add('selected');
    }
}

// Ao abrir modal de adicionar serviço
if (addServiceBtn && addServiceModal) {
    addServiceBtn.addEventListener('click', () => {
        carregarGaleriaImagensServico('serviceImageGallery', 'addServiceImage');

    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const form = document.getElementById('alertaPromocaoForm');
    const lista = document.getElementById('alertaPromocaoLista');
    const modal = document.getElementById('alertaPromocaoModal');
    const modalClose = document.getElementById('alertaPromocaoClose');
    const modalTitulo = document.getElementById('alertaPromocaoTitulo');
    const modalMensagem = document.getElementById('alertaPromocaoMensagem');
    const modalImagem = document.getElementById('alertaPromocaoImagem');

    // Salva e carrega alertas/promos no localStorage (pode adaptar para backend se quiser)
    function getAlertasPromos() {
        try {
            return JSON.parse(localStorage.getItem('alertasPromosDashboard') || '[]');
        } catch {
            return [];
        }
    }
    function setAlertasPromos(arr) {
        localStorage.setItem('alertasPromosDashboard', JSON.stringify(arr));
    }

    // Renderiza lista de alertas/promos no painel
    function renderAlertasPromos() {
        const arr = getAlertasPromos();
        lista.innerHTML = '';
        arr.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'alerta-promocao-item';
            div.innerHTML = `
                ${item.imagem ? `<img src="${item.imagem}" alt="Banner">` : ''}
                <div>
                    <div style="font-weight:700;color:var(--primary-dark);">${item.titulo}</div>
                    <div style="color:#222;">${item.mensagem}</div>
                </div>
                <button class="alerta-promocao-remove" title="Remover" aria-label="Remover alerta">&times;</button>
            `;
            div.querySelector('.alerta-promocao-remove').onclick = () => {
                const arr2 = getAlertasPromos();
                arr2.splice(idx, 1);
                setAlertasPromos(arr2);
                renderAlertasPromos();
            };
            lista.appendChild(div);
        });
    }

    // Adiciona novo alerta/promo
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            const titulo = document.getElementById('alertaTitulo').value.trim();
            const mensagem = document.getElementById('alertaMensagem').value.trim();
            const imagem = document.getElementById('alertaImagem').value.trim();
            if (!titulo || !mensagem) return;
            const arr = getAlertasPromos();
            arr.unshift({ titulo, mensagem, imagem });
            setAlertasPromos(arr);
            renderAlertasPromos();
            form.reset();
        };
    }

    renderAlertasPromos();

    // Exibe o modal de alerta/promo no início do site (apenas o mais recente)
    function showAlertaPromoModal() {
        const arr = getAlertasPromos();
        if (arr.length === 0) return;
        const item = arr[0];
        modalTitulo.textContent = item.titulo;
        modalMensagem.textContent = item.mensagem;
        if (item.imagem) {
            modalImagem.innerHTML = `<img src="${item.imagem}" alt="Banner">`;
        } else {
            modalImagem.innerHTML = '';
        }
        modal.classList.add('active');
    }

    // Só mostra o modal se não foi fechado nesta sessão
    if (!sessionStorage.getItem('alertaPromoModalFechado')) {
        setTimeout(showAlertaPromoModal, 600); // delay para UX
    }

    // Fecha o modal e não mostra de novo nesta sessão
    modalClose.onclick = () => {
        modal.classList.remove('active');
        sessionStorage.setItem('alertaPromoModalFechado', '1');
    };
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            sessionStorage.setItem('alertaPromoModalFechado', '1');
        }
    };
});

// Faz os labels da sidebar funcionarem como os botões
document.querySelectorAll('.mac-sidebar-item').forEach(item => {
    const btn = item.querySelector('.mac-sidebar-btn');
    const label = item.querySelector('.mac-sidebar-label');
    if (btn && label) {
        label.style.cursor = 'pointer';
        label.addEventListener('click', function(e) {
            e.preventDefault();
            btn.focus(); // foca o botão
            btn.click(); // dispara o clique do botão
        });
    }
});

// Permite que o .mac-sidebar-item seja clicável como o botão interno
document.querySelectorAll('.mac-sidebar-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function(e) {
        // Evita disparar duplo clique se clicar no botão
        if (!e.target.classList.contains('mac-sidebar-btn')) {
            const btn = item.querySelector('.mac-sidebar-btn');
            if (btn) btn.click();
        }
    });
});

// Sidebar hamburger responsivo e overlay
const macSidebar = document.querySelector('.mac-sidebar');
const macSidebarHamburger = document.getElementById('macSidebarHamburger');
const macSidebarOverlay = document.getElementById('macSidebarOverlay');

function openSidebar() {
    macSidebar.classList.add('open');
    macSidebarHamburger.classList.add('active');
    // Só bloqueia o body se o overlay estiver ativo (telas pequenas)
    if (window.innerWidth <= 1024) {
        macSidebarOverlay.classList.add('active');
        macSidebarOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    } else {
        macSidebarOverlay.classList.remove('active');
        macSidebarOverlay.style.display = 'none';
        document.body.style.overflow = ''; // Libera o body em telas grandes
    }
}
function closeSidebar() {
    macSidebar.classList.remove('open');
    macSidebarHamburger.classList.remove('active');
    macSidebarOverlay.classList.remove('active');
    macSidebarOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Sempre libera o body ao fechar
}
if (macSidebarHamburger && macSidebar && macSidebarOverlay) {
    macSidebarHamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (macSidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    // Overlay só fecha a sidebar em telas pequenas
    macSidebarOverlay.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
            closeSidebar();
        }
    });
    // Fecha ao clicar em qualquer botão da sidebar em telas pequenas
    macSidebar.querySelectorAll('.mac-sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeSidebar();
        });
    });
    // Fecha ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (macSidebar.classList.contains('open')) {
            if (window.innerWidth > 1024) {
                macSidebarOverlay.style.display = 'none';
            } else {
                macSidebarOverlay.style.display = 'block';
            }
        }
    });
}

// Função para carregar profissionais no dashboard (barbearia)

// Atualizar evento dos botões de editar após renderizar profissionais
const _oldCarregarProfissionaisDashboard = carregarProfissionaisDashboard;
carregarProfissionaisDashboard = async function() {
  await _oldCarregarProfissionaisDashboard();
  bindEditProfessionalBtns();
};
bindEditProfessionalBtns();

document.addEventListener('DOMContentLoaded', function() {
    carregarProfissionaisDashboard();
});
async function carregarProfissionaisDashboard() {
    const container = document.getElementById('professionalsContainer');
    if (!container) return;
    try {
        const res = await fetch('/agendamento/profissionais');
        const data = await res.json();
        if (data.success && Array.isArray(data.profissionais) && data.profissionais.length > 0) {
            container.innerHTML = '';
            data.profissionais.forEach(prof => {
                const card = document.createElement('div');
                card.className = 'professional-card';
                card.style.position = 'relative';
                card.setAttribute('data-id', prof.id);
                card.innerHTML = `
                    <div class="professional-avatar">
                        ${prof.avatar ? `<img src="${prof.avatar}" alt="Avatar ${prof.nome}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />` : `<i class='fas fa-user' style='font-size: 32px; color: #aaa;'></i>`}
                    </div>
                    <div class="professional-name" style="text-align:center;">${prof.nome}</div>
                    <div class="professional-actions" style="display:flex;justify-content:center;gap:16px;margin-top:10px;">
                        <button class="action-btn edit-professional-btn" title="Editar profissional" style="background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-pen" style="color:#666;font-size:1.15rem;"></i>
                        </button>
                        <button class="action-btn delete-professional-btn" title="Excluir profissional" style="background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;">
                            <i class="fas fa-trash" style="color:#c82333;font-size:1.15rem;"></i>
                        </button>
                    </div>
                `;
                // Evento do botão de editar
                card.querySelector('.edit-professional-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    openEditProfessionalModal({
                        id: prof.id,
                        nome: prof.nome,
                        avatar: prof.avatar || ''
                    });
                });
                // Evento do botão de excluir (na listagem de profissionais)
                card.querySelector('.delete-professional-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const self = this;
                    window.showCustomAlert(
                        'Tem certeza que deseja excluir este profissional?',
                        function() {
                            self.disabled = true;
                            fetch(`/dashboard/profissionais/${prof.id}`, { method: 'DELETE' })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success) {
                                        card.remove();
                                    } else {
                                        showCustomAlert(data.message || 'Erro ao excluir profissional.');
                                    }
                                })
                                .catch(() => showCustomAlert('Erro ao conectar ao servidor.'))
                                .finally(() => { self.disabled = false; });
                        },
                        { type: 'delete-professional', btnText: 'Excluir', cancelText: 'Cancelar', icon: '<i class="fas fa-trash-alt" style="color:var(--primary-dark);"></i>' }
                    );
                });
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Nenhum profissional cadastrado.</div>';
        }
    } catch (err) {
        container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar profissionais.</div>';
    }
}

// Modal de edição de profissional
const editProfessionalModal = document.createElement('div');
editProfessionalModal.id = 'editProfessionalModal';
editProfessionalModal.className = 'modal';
editProfessionalModal.innerHTML = `
  <div class="modal-content" style="max-width:410px;">
    <div class="modal-header">
      <h3 class="modal-title"><i class="fas fa-user-tie"></i> Editar Profissional</h3>
      <button class="close-modal" id="closeEditProfessionalModal" type="button">&times;</button>
    </div>
    <div class="modal-body">
      <div class="avatar-upload">
        <div class="avatar-preview" id="editAvatarPreview">
          <i class="fas fa-user" style="font-size: 40px; color: #aaa;"></i>
        </div>
        <button class="avatar-upload-btn" id="editAvatarUploadBtn" type="button">
          <i class="fas fa-camera"></i> Alterar Foto
        </button>
        <input type="file" id="editAvatarInput" accept="image/*" style="display: none;">
      </div>
      <div class="form-group">
        <label class="form-label" for="editProfessionalNameInput">Nome do Profissional</label>
        <input type="text" class="form-control" id="editProfessionalNameInput" maxlength="100">
      </div>
      <div id="editProfessionalMsg" style="margin-top:8px;font-size:0.98rem;"></div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;gap:10px;">
      <button class="btn btn-secondary" id="cancelEditProfessional" type="button">Cancelar</button>
      <button class="btn btn-primary" id="saveEditProfessionalBtn" type="button">Salvar Alterações</button>
    </div>
  </div>
`;
document.body.appendChild(editProfessionalModal);

let editProfessionalId = null;
let editAvatarBase64 = '';

// Abrir modal de edição ao clicar no botão de editar do card
function openEditProfessionalModal(prof) {
  editProfessionalId = prof.id;
  document.getElementById('editProfessionalNameInput').value = prof.nome;
  editAvatarBase64 = prof.avatar || '';
  const preview = document.getElementById('editAvatarPreview');
  if (prof.avatar) {
    preview.innerHTML = `<img src="${prof.avatar}" alt="Avatar" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">`;
  } else {
    preview.innerHTML = '<i class="fas fa-user" style="font-size: 40px; color: #aaa;"></i>';
  }
  document.getElementById('editProfessionalMsg').textContent = '';
  editProfessionalModal.style.display = 'flex';
}

// Evento do botão de editar do card
function bindEditProfessionalBtns() {
  document.querySelectorAll('.edit-professional-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const card = btn.closest('.professional-card');
      const nome = card.querySelector('.professional-name').textContent;
      const avatarImg = card.querySelector('.professional-avatar img');
      const avatar = avatarImg ? avatarImg.src : '';
      const id = card.getAttribute('data-id') || card.dataset.id || (card.profId || null);
      // Busca o id real do profissional
      let prof = { id, nome, avatar };
      // Se o id não estiver no DOM, busca pelo nome (fallback)
      if (!prof.id && window.__profissionaisDashboard) {
        const found = window.__profissionaisDashboard.find(p => p.nome === nome);
        if (found) prof.id = found.id;
      }
      openEditProfessionalModal(prof);
    };
  });
}

// Preview e upload de avatar
const editAvatarInput = document.getElementById('editAvatarInput');
const editAvatarUploadBtn = document.getElementById('editAvatarUploadBtn');
const editAvatarPreview = document.getElementById('editAvatarPreview');
editAvatarUploadBtn.onclick = () => editAvatarInput.click();
editAvatarInput.onchange = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    editAvatarBase64 = e.target.result;
    editAvatarPreview.innerHTML = `<img src="${editAvatarBase64}" alt="Avatar" style="width:64px;height:64px;border-radius:50%;object-fit:cover;">`;
  };
  reader.readAsDataURL(file);
};

// Salvar alterações
const saveEditProfessionalBtn = document.getElementById('saveEditProfessionalBtn');
saveEditProfessionalBtn.onclick = async function() {
  const nome = document.getElementById('editProfessionalNameInput').value.trim();
  const msg = document.getElementById('editProfessionalMsg');
  msg.textContent = '';
  if (!nome) {
    msg.style.color = 'var(--primary-dark)';
    msg.textContent = 'Digite o nome do profissional.';
    return;
  }
  this.disabled = true;
  msg.textContent = 'Salvando...';
  try {
    const res = await fetch(`/dashboard/profissionais/${editProfessionalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, avatar: editAvatarBase64 })
    });
    const data = await res.json();
    if (data.success) {
      msg.style.color = 'var(--success)';
      msg.textContent = 'Profissional atualizado!';
      setTimeout(() => {
        editProfessionalModal.style.display = 'none';
        carregarProfissionaisDashboard();
      }, 900);
    } else {
      msg.style.color = 'var(--primary-dark)';
      msg.textContent = data.message || 'Erro ao atualizar profissional.';
    }
  } catch {
    msg.style.color = 'var(--primary-dark)';
    msg.textContent = 'Erro ao conectar ao servidor.';
  }
};

// Excluir profissional
const deleteProfessionalBtn = document.getElementById('deleteProfessionalBtn');
if (deleteProfessionalBtn) {
    deleteProfessionalBtn.onclick = function() {
        const self = this;
        window.showCustomAlert(
            'Tem certeza que deseja excluir este profissional?',
            function() {
                self.disabled = true;
                fetch(`/dashboard/profissionais/${prof.id}`, { method: 'DELETE' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            card.remove();
                        } else {
                            showCustomAlert(data.message || 'Erro ao excluir profissional.');
                        }
                    })
                    .catch(() => showCustomAlert('Erro ao conectar ao servidor.'))
                    .finally(() => { self.disabled = false; });
            },
            { type: 'delete-professional', btnText: 'Excluir', cancelText: 'Cancelar', icon: '<i class="fas fa-trash-alt" style="color:var(--primary-dark);"></i>' }
        );
    };
}
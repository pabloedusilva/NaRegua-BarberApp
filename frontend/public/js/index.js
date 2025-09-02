// =========================
// Loading Page Controller
// =========================

// Sincronizar tema imediatamente ao carregar
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
    }
    
    // Aplicar tema ao loading page quando disponível
    function applyLoadingTheme() {
        const loadingPage = document.getElementById('loadingPage');
        if (loadingPage) {
            if (savedTheme === 'dark') {
                loadingPage.classList.add('dark-mode');
            } else {
                loadingPage.classList.remove('dark-mode');
            }
        }
    }
    
    // Tentar aplicar imediatamente
    applyLoadingTheme();
    
    // Tentar novamente quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLoadingTheme);
    } else {
        applyLoadingTheme();
    }
})();

// Variáveis do loading
let loadingProgress = 0;
let loadingComplete = false;
let loadingTasks = [];

// Função para atualizar o progresso do loading
function updateLoadingProgress(percentage) {
    const progressFill = document.getElementById('loadingBarFill');
    const progressText = document.getElementById('loadingPercentage');
    
    if (progressFill) {
        progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
        progressText.textContent = Math.round(percentage) + '%';
    }
    
    // Atualizar variável global
    loadingProgress = percentage;
}

// Função para adicionar tarefa de loading
function addLoadingTask(taskName) {
    loadingTasks.push({ name: taskName, completed: false });
    console.log(`Loading task added: ${taskName}`);
}

// Função para marcar tarefa como completa
function completeLoadingTask(taskName) {
    const task = loadingTasks.find(t => t.name === taskName);
    if (task && !task.completed) {
        task.completed = true;
        console.log(`Loading task completed: ${taskName}`);
        updateLoadingDisplay();
    }
}

// Função para atualizar o display do loading
function updateLoadingDisplay() {
    const completedTasks = loadingTasks.filter(t => t.completed).length;
    const totalTasks = loadingTasks.length;
    
    if (totalTasks > 0) {
        const targetPercentage = (completedTasks / totalTasks) * 100;
        
        // Animar progresso suavemente
        animateProgress(loadingProgress, targetPercentage, 800);
        
        if (targetPercentage >= 100 && !loadingComplete) {
            loadingComplete = true;
            setTimeout(hideLoadingPage, 1200);
        }
    }
}

// Função para animar o progresso suavemente
function animateProgress(from, to, duration) {
    const startTime = performance.now();
    const difference = to - from;
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Usar easing para animação suave
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = from + (difference * easeProgress);
        
        updateLoadingProgress(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Função para sincronizar tema entre loading page e body
function syncTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const loadingPage = document.getElementById('loadingPage');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
        if (loadingPage) {
            loadingPage.classList.add('dark-mode');
        }
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
        if (loadingPage) {
            loadingPage.classList.remove('dark-mode');
        }
    }
}

// Função para esconder o loading page
function hideLoadingPage() {
    const loadingPage = document.getElementById('loadingPage');
    if (loadingPage) {
        // Completar a barra de progresso
        updateLoadingProgress(100);
        
        // Aguardar um pouco antes de esconder
        setTimeout(() => {
            loadingPage.classList.add('hidden');
            setTimeout(() => {
                loadingPage.style.display = 'none';
                document.body.style.overflow = 'auto';
                loadingComplete = true;
            }, 1000); // Tempo da transição CSS
        }, 400);
    }
}

// Função para mostrar loading page (caso necessário)
function showLoadingPage() {
    const loadingPage = document.getElementById('loadingPage');
    if (loadingPage) {
        loadingPage.style.display = 'flex';
        loadingPage.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Inicializar loading page
document.addEventListener('DOMContentLoaded', function() {
    // Bloquear scroll durante loading
    document.body.style.overflow = 'hidden';
    
    // Sincronizar tema
    syncTheme();
    
    // Adicionar tarefas essenciais apenas
    addLoadingTask('dom-ready');
    addLoadingTask('resources-loaded');
    addLoadingTask('data-loaded');
    
    // Marcar DOM como ready
    completeLoadingTask('dom-ready');
    
    // Marcar recursos como carregados após verificações
    setTimeout(() => {
        completeLoadingTask('resources-loaded');
    }, 800);
});

// Verificar conexão com API (simplificado)
async function checkApiConnection() {
    try {
        // Simular verificação rápida
        await new Promise(resolve => setTimeout(resolve, 500));
        completeLoadingTask('data-loaded');
        return true;
    } catch (error) {
        console.warn('API check skipped');
        completeLoadingTask('data-loaded');
        return false;
    }
}

// Verificar se todos os recursos críticos foram carregados (simplificado)
function checkCriticalResources() {
    // Aguardar um tempo mínimo para garantir carregamento
    setTimeout(() => {
        checkApiConnection();
    }, 1000);
}

// Timeout de segurança reduzido
setTimeout(() => {
    if (!loadingComplete) {
        console.warn('Loading timeout reached, forcing completion');
        loadingTasks.forEach(task => {
            if (!task.completed) {
                task.completed = true;
            }
        });
        updateLoadingDisplay();
    }
}, 5000); // 5 segundos máximo

// Carrega utilitário de alerta customizado
const script = document.createElement('script');
script.src = '/js/custom-alert.js';
document.head.appendChild(script);

// Carrega utilitário de hora do servidor
const serverTimeScript = document.createElement('script');
serverTimeScript.src = '/js/server-time.js';
document.head.appendChild(serverTimeScript);

// Aguarda sincronização da hora do servidor antes de executar o restante
document.addEventListener('DOMContentLoaded', async function () {
    // Verificar recursos críticos
    checkCriticalResources();
    
    // Verificar conexão com API
    await checkApiConnection();
    
    // Aguarda o utilitário carregar e sincronizar
    if (typeof window.startServerTimeSync === 'function') {
        await window.startServerTimeSync();
        console.log('Sistema de horário do servidor iniciado');
        completeLoadingTask('server-time-synced');
    } else {
        completeLoadingTask('server-time-synced');
    }
    
    // Todas as funções que dependem de data/hora usam window.serverTime()
    // Atualização de textos de UI dependentes do tempo (caso clock seja alterado via admin)
    window.updateTimeTexts = function() {
        const now = typeof window.serverTime === 'function' ? window.serverTime() : null;
        if (!now) return;
        // Exemplos: elementos com data dinâmica
        document.querySelectorAll('[data-datetime-fixed]').forEach(el => {
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            el.textContent = `${d}/${m}/${y} ${hh}:${mm}`;
        });
    };
    window.updateTimeTexts();
});

// Função para formatar a data no formato brasileiro (DD/MM/AAAA)
function formatarDataBR(dataISO) {
    if (!dataISO) return '';
    // Normaliza se vier com tempo: pega só a parte da data antes de espaço ou 'T'
    const pure = dataISO.split('T')[0].split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(pure)) {
        const [ano, mes, dia] = pure.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    return pure;
}

// Adicione esta função antes de renderCalendar ou logo no início do <script>
function animateWeekTransition(direction, callback) {
    const weekDays = document.querySelector('.week-days');
    if (!weekDays) {
        callback();
        return;
    }
    // Remove classes de transição anteriores
    weekDays.classList.remove('slide-left', 'slide-right', 'active');
    // Força reflow para reiniciar a animação
    void weekDays.offsetWidth;
    // Adiciona a classe de transição
    weekDays.classList.add(direction === 'left' ? 'slide-left' : 'slide-right');
    setTimeout(() => {
        callback();
    }, 450); // Duração igual ao CSS transition
}

document.addEventListener('DOMContentLoaded', async function () {
    // Adicionar tarefa de carregamento para serviços
    addLoadingTask('services-loaded');
    
    // Carregar serviços do backend
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        try {
            const res = await fetch('/dashboard/servicos');
            const data = await res.json();
            if (data.success && Array.isArray(data.servicos)) {
                window.servicosList = data.servicos;
                let html = `<h2 class="section-title"><i class="fas fa-cut"></i> Serviços</h2>
                        <div class="service-list">`;
                data.servicos.forEach(servico => {
                    html += `
                            <div class="service-item">
                                <img class="service-image" src="${servico.imagem || 'img/servicos/default.jpg'}" alt="${servico.nome}">
                                <div class="service-info">
                                    <div class="service-name">${servico.nome}</div>
                                    <div class="service-details">
                                        <div class="service-time">
                                            <i class="far fa-clock"></i> ${servico.tempo}
                                        </div>
                                        <div class="service-price">
                                            <i class="fas fa-dollar-sign"></i> a partir de R$ ${Number(servico.preco).toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                </div>
                                <button class="book-button" data-service="${servico.nome}" data-price="${Number(servico.preco).toFixed(2)}" data-time="${servico.tempo}">
                                    <i class="far fa-calendar-alt"></i> Reservar
                                </button>
                            </div>
                            `;
                });
                html += `</div>`;
                servicesSection.innerHTML = html;
                
                // Marcar serviços como carregados (não afeta loading principal)
                console.log('Serviços carregados com sucesso');
            } else {
                servicesSection.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Nenhum serviço cadastrado.</div>';
            }
        } catch (err) {
            servicesSection.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar serviços.</div>';
        }
    } else {
        console.log('Seção de serviços não encontrada');
    }

    // Variáveis para armazenar as seleções
    let selectedService = '';
    let selectedServicePrice = '';
    let selectedServiceTime = '';
    let selectedProfessional = 'Pablo barber';
    let selectedDate = null;
    let selectedTime = '';
    let currentSelectedButton = null;
    let calendarMode = 'month'; // Pode ser 'month' ou 'week'
    let turnosSemana = []; // [{dia_semana, turno_inicio, turno_fim}, ...]
    let folgasEspeciais = []; // Array de datas de folgas especiais no formato 'YYYY-MM-DD'

    // Elementos da página
    const calendarSection = document.getElementById('calendar-section');
    const confirmationSection = document.getElementById('confirmation-section');
    const calendarDaysContainer = document.querySelector('.calendar-days');
    const monthNameElement = document.querySelector('.month-name');
    const calendarToggleBtn = document.getElementById('calendarToggleBtn');

    // Elementos do tema
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // Função para aplicar tema
    function applyTheme(theme) {
        const loadingPage = document.getElementById('loadingPage');
        
        console.log('Aplicando tema:', theme);
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
            if (loadingPage) {
                loadingPage.classList.add('dark-mode');
            }
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
            if (loadingPage) {
                loadingPage.classList.remove('dark-mode');
            }
            if (themeIcon) {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
            localStorage.setItem('theme', 'light');
        }
    }

    // Verificar preferência de tema no localStorage e aplicar
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    // Alternar tema - só adicionar listener se o botão existir
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const newTheme = isDarkMode ? 'light' : 'dark';
            console.log('Botão clicado, mudando tema para:', newTheme);
            applyTheme(newTheme);
        });
    } else {
        console.warn('Botão de tema não encontrado');
    }

    // Feriados (pode ser expandido)
    const holidays = {
        '1/1': 'Ano Novo',
        '21/4': 'Tiradentes',
        '1/5': 'Dia do Trabalho',
        '7/9': 'Independência',
        '12/10': 'Nossa Senhora Aparecida',
        '2/11': 'Finados',
        '15/11': 'Proclamação da República',
        '25/12': 'Natal'
    };

    // Inicializar calendário com data do servidor
    let currentDate = window.serverTime ? window.serverTime() : null;
    if (typeof currentDate === 'object' && typeof currentDate.toDate === 'function') {
        currentDate = currentDate.toDate();
    }
    
    // Inicialização do calendário usando servidor
    async function initializeCalendarDate() {
    if (typeof window.serverTime === 'function') currentDate = window.serverTime();
        await renderCalendar(currentDate);
    }
    
    // Chamar inicialização
    if (typeof window.startServerTimeSync === 'function') {
        window.startServerTimeSync().then(() => {
            initializeCalendarDate();
        });
    } else {
        initializeCalendarDate();
    }

    // Selecionar serviço
    const bookButtons = document.querySelectorAll('.book-button');
    bookButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remover seleção anterior
            if (currentSelectedButton) {
                currentSelectedButton.classList.remove('selected');
            }

            // Adicionar seleção atual
            this.classList.add('selected');
            currentSelectedButton = this;

            selectedService = this.getAttribute('data-service');
            selectedServicePrice = this.getAttribute('data-price');
            selectedServiceTime = this.getAttribute('data-time');

            // Mostrar a seção de calendário
            calendarSection.style.display = 'block';

            // Scroll para o calendário
            calendarSection.scrollIntoView({
                behavior: 'smooth'
            });

            // Atualizar os campos de confirmação
            updateConfirmationDetails();
            // Recarregar horários disponíveis ao selecionar serviço
            if (selectedDate) {
                renderTimeSlots(getDiaSemana(selectedDate));
            }
        });
    });

    // Selecionar profissional
    const professionalCards = document.querySelectorAll('.professional-card');
    professionalCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remover seleção anterior
            professionalCards.forEach(c => c.classList.remove('selected'));

            // Adicionar seleção atual
            this.classList.add('selected');

            // Guardar o profissional selecionado
            selectedProfessional = this.getAttribute('data-professional');

            // Atualizar os campos de confirmação
            updateConfirmationDetails();
        });
    });

    // Navegação do calendário
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');

    prevMonthButton.addEventListener('click', async function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        await renderCalendar(currentDate);
    });

    nextMonthButton.addEventListener('click', async function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        await renderCalendar(currentDate);
    });

    // Alternar visualização do calendário
    calendarToggleBtn.addEventListener('click', async function () {
        if (calendarMode === 'month') {
            calendarMode = 'week';
            calendarSection.classList.add('calendar-compact');
            calendarToggleBtn.textContent = 'Visualização mensal';
        } else {
            calendarMode = 'month';
            calendarSection.classList.remove('calendar-compact');
            calendarToggleBtn.textContent = 'Visualização semanal';
        }
        await renderCalendar(currentDate);
    });

    // Renderizar calendário
    async function renderCalendar(date) {
        // Recarregar folgas especiais para garantir informação atualizada
        await carregarFolgasEspeciais();
        
        const year = date.getFullYear();
        const month = date.getMonth();
    const today = window.serverTime();
        today.setHours(0, 0, 0, 0);

        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Atualizar o título do mês - SEMPRE atualiza com a data passada
        monthNameElement.textContent = `${monthNames[month]} ${year}`;

        let days = '';
        const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

        if (calendarMode === 'week') {
            // Encontrar o início da semana (domingo)
            let weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());

            // Cabeçalho dos dias da semana
            days += '<div class="calendar-week-view">';
            days += '<div class="week-navigation">';
            days += '<button class="prev-week"><i class="fas fa-chevron-left"></i></button>';
            days += '<div class="week-days">';

            // Gerar os 7 dias da semana
            const today = window.serverTime();
            today.setHours(0, 0, 0, 0);

            const weekDayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
            for (let i = 0; i < 7; i++) {
                const weekDay = new Date(weekStart);
                weekDay.setDate(weekStart.getDate() + i);
                weekDay.setHours(0, 0, 0, 0);

                let dayClass = 'day';
                if (weekDay < today) {
                    dayClass += ' past-day';
                }
                if (
                    weekDay.getDate() === today.getDate() &&
                    weekDay.getMonth() === today.getMonth() &&
                    weekDay.getFullYear() === today.getFullYear()
                ) {
                    dayClass += ' today';
                }

                // Verificar se este dia da semana é uma folga especial
                const weekDateStr = weekDay.toLocaleDateString('pt-BR');
                if (isFolgaEspecial(weekDateStr)) {
                    dayClass += ' folga-especial';
                }

                // Adicione o nome do dia acima do número
                days += `<div class="day-column">
                                    <div class="week-day-name">${weekDayNames[i]}</div>
                                    <div class="${dayClass}" data-date="${weekDateStr}">${weekDay.getDate()}</div>
                                </div>`;
            }

            days += '</div>';
            days += '<button class="next-week"><i class="fas fa-chevron-right"></i></button>';
            days += '</div></div>';
        } else {
            // Código existente do calendário mensal
            dayNames.forEach(day => {
                days += `<div class="day-header">${day}</div>`;
            });
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const prevLastDay = new Date(year, month, 0).getDate();
            const firstDayIndex = firstDay.getDay();
            const lastDayIndex = lastDay.getDay();
            const nextDays = 7 - lastDayIndex - 1;

            const today = window.serverTime();
            today.setHours(0, 0, 0, 0); // Garante comparação só por data

            for (let i = firstDayIndex; i > 0; i--) {
                const dayNum = prevLastDay - i + 1;
                const prevMonth = month === 0 ? 12 : month;
                const prevYear = month === 0 ? year - 1 : year;
                const dateStr = `${String(dayNum).padStart(2, '0')}/${String(prevMonth).padStart(2, '0')}/${prevYear}`;
                
                let dayClass = 'day disabled prev-month-day';
                if (isFolgaEspecial(dateStr)) {
                    dayClass += ' folga-especial';
                }
                
                days += `<div class="${dayClass}" 
                            data-date="${dateStr}" 
                            data-month="${prevMonth}"
                            data-year="${prevYear}"
                            data-day="${dayNum}">
                            ${dayNum}
                        </div>`;
            }
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const dayDate = new Date(year, month, i);
                dayDate.setHours(0, 0, 0, 0);

                let dayClass = 'day';
                if (dayDate < today) {
                    dayClass += ' past-day';
                }
                const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                if (isToday) dayClass += ' today';
                
                const dateStr = `${String(i).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
                
                // Verificar se este dia é uma folga especial
                if (isFolgaEspecial(dateStr)) {
                    dayClass += ' folga-especial';
                }
                
                // Verificar se este dia está selecionado
                if (selectedDate === dateStr) {
                    dayClass += ' selected';
                }
                
                days += `<div class="${dayClass}" data-date="${dateStr}" data-day="${i}" data-month="${month + 1}" data-year="${year}">${i}</div>`;
            }
            for (let i = 1; i <= nextDays; i++) {
                const nextMonth = month === 11 ? 1 : month + 2;
                const nextYear = month === 11 ? year + 1 : year;
                const dateStr = `${String(i).padStart(2, '0')}/${String(nextMonth).padStart(2, '0')}/${nextYear}`;
                
                let dayClass = 'day disabled next-month-day';
                if (isFolgaEspecial(dateStr)) {
                    dayClass += ' folga-especial';
                }
                
                days += `<div class="${dayClass}" 
                            data-date="${dateStr}"
                            data-month="${nextMonth}"
                            data-year="${nextYear}"
                            data-day="${i}">
                            ${i}
                        </div>`;
            }
        }

        calendarDaysContainer.innerHTML = days;

        // Adicionar event listeners para os botões de navegação semanal
        if (calendarMode === 'week') {
            document.querySelector('.prev-week').addEventListener('click', () => {
                animateWeekTransition('right', async () => {
                    currentDate.setDate(currentDate.getDate() - 7);
                    await renderCalendar(currentDate);
                });
            });

            document.querySelector('.next-week').addEventListener('click', () => {
                animateWeekTransition('left', async () => {
                    currentDate.setDate(currentDate.getDate() + 7);
                    await renderCalendar(currentDate);
                });
            });

            // Após renderizar, marque a semana como ativa para a transição inicial
            setTimeout(() => {
                const weekDays = document.querySelector('.week-days');
                if (weekDays) weekDays.classList.add('active');
            }, 10);
        }

        // Adicionar event listeners para os dias
        const dayElements = document.querySelectorAll('.day');
        dayElements.forEach(day => {
            day.addEventListener('click', function () {
                // Se for uma folga especial ou dia passado, não fazer nada
                if (this.classList.contains('folga-especial') || this.classList.contains('past-day')) {
                    return;
                }
                
                // Se for um dia do mês anterior
                if (this.classList.contains('prev-month-day')) {
                    const targetDate = this.getAttribute('data-date');
                    const targetMonth = parseInt(this.getAttribute('data-month'));
                    const targetYear = parseInt(this.getAttribute('data-year'));
                    const targetDay = parseInt(this.getAttribute('data-day'));
                    
                    // Atualizar currentDate para o mês anterior preservando o dia clicado
                    currentDate.setFullYear(targetYear, targetMonth - 1, targetDay);
                    
                    // Renderizar o calendário
                    renderCalendar(currentDate);
                    
                    // Aguardar render e então selecionar o dia
                    setTimeout(() => {
                        // Buscar especificamente o dia do mês atual (não próximo/anterior)
                        const newDayElement = document.querySelector(`[data-date="${targetDate}"][data-day="${targetDay}"]:not(.prev-month-day):not(.next-month-day)`);
                        if (newDayElement) {
                            // Remover seleções anteriores
                            document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                            
                            // Selecionar o novo dia
                            newDayElement.classList.add('selected');
                            selectedDate = targetDate;
                            
                            // Atualizar confirmação e carregar horários
                            updateConfirmationDetails();
                            confirmationSection.style.display = 'block';
                            
                            // Mostrar time-slots
                            const timeSlotsEl = document.querySelector('.time-slots');
                            if (timeSlotsEl) timeSlotsEl.style.display = '';
                            
                            if (selectedService) {
                                const [d, m, y] = targetDate.split('/');
                                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                renderTimeSlots(getDiaSemana(dateObj));
                            }
                            
                            newDayElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }, 100);
                    return;
                }

                // Se for um dia do próximo mês
                if (this.classList.contains('next-month-day')) {
                    const targetDate = this.getAttribute('data-date');
                    const targetMonth = parseInt(this.getAttribute('data-month'));
                    const targetYear = parseInt(this.getAttribute('data-year'));
                    const targetDay = parseInt(this.getAttribute('data-day'));
                    
                    // Atualizar currentDate para o próximo mês preservando o dia clicado
                    currentDate.setFullYear(targetYear, targetMonth - 1, targetDay);
                    
                    // Renderizar o calendário
                    renderCalendar(currentDate);
                    
                    // Aguardar render e então selecionar o dia
                    setTimeout(() => {
                        // Buscar especificamente o dia do mês atual (não próximo/anterior)
                        const newDayElement = document.querySelector(`[data-date="${targetDate}"][data-day="${targetDay}"]:not(.prev-month-day):not(.next-month-day)`);
                        if (newDayElement) {
                            // Remover seleções anteriores
                            document.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                            
                            // Selecionar o novo dia
                            newDayElement.classList.add('selected');
                            selectedDate = targetDate;
                            
                            // Atualizar confirmação e carregar horários
                            updateConfirmationDetails();
                            confirmationSection.style.display = 'block';
                            
                            // Mostrar time-slots
                            const timeSlotsEl = document.querySelector('.time-slots');
                            if (timeSlotsEl) timeSlotsEl.style.display = '';
                            
                            if (selectedService) {
                                const [d, m, y] = targetDate.split('/');
                                const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                renderTimeSlots(getDiaSemana(dateObj));
                            }
                            
                            newDayElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }, 100);
                    return;
                }

                // Código para dias normais do mês atual
                if (!this.classList.contains('disabled') && !this.classList.contains('past-day') && !this.classList.contains('folga-especial')) {
                    // Remover seleção anterior
                    dayElements.forEach(d => d.classList.remove('selected'));
                    this.classList.add('selected');

                    const dateStr = this.getAttribute('data-date');
                    selectedDate = dateStr;

                    updateConfirmationDetails();
                    confirmationSection.style.display = 'block';
                    
                    // Mostrar time-slots
                    const timeSlotsEl = document.querySelector('.time-slots');
                    if (timeSlotsEl) timeSlotsEl.style.display = '';
                    
                    // Carregar horários se um serviço já foi selecionado
                    if (selectedService) {
                        const [d, m, y] = dateStr.split('/');
                        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                        renderTimeSlots(getDiaSemana(dateObj));
                    }
                } else if (this.classList.contains('past-day') || this.classList.contains('folga-especial')) {
                    // Esconder time-slots para dias passados ou folgas especiais
                    const timeSlotsEl = document.querySelector('.time-slots');
                    if (timeSlotsEl) timeSlotsEl.style.display = 'none';
                }
            });
        });

        document.querySelectorAll('.day').forEach(dayEl => {
            // Para modo mensal
            if (dayEl.hasAttribute('data-day')) {
                const year = Number(dayEl.getAttribute('data-year'));
                const month = Number(dayEl.getAttribute('data-month')) - 1;
                const day = Number(dayEl.getAttribute('data-day'));
                const dateObj = new Date(year, month, day);
                const weekDay = dateObj.getDay();
                if (weekDay === 0) dayEl.classList.add('sunday');
                if (weekDay === 6) dayEl.classList.add('saturday');
            }
            // Para modo semanal
            if (dayEl.hasAttribute('data-date')) {
                const [d, m, y] = dayEl.getAttribute('data-date').split('/');
                const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                const weekDay = dateObj.getDay();
                if (weekDay === 0) dayEl.classList.add('sunday');
                if (weekDay === 6) dayEl.classList.add('saturday');
            }
        });
    }

    // Selecionar horário
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function () {
            // Remover seleção anterior
            timeSlots.forEach(s => s.classList.remove('selected'));

            // Adicionar seleção atual
            this.classList.add('selected');

            // Guardar o horário selecionado
            selectedTime = this.textContent;

            // Mostrar a seção de confirmação
            confirmationSection.style.display = 'block';

            // Atualizar os campos de confirmação
            updateConfirmationDetails();

            // Scroll para a confirmação
            confirmationSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Atualizar detalhes de confirmação
    function updateConfirmationDetails() {
        document.getElementById('confirm-service').textContent = selectedService || '-';
        document.getElementById('confirm-professional').textContent = selectedProfessional || '-';
        document.getElementById('confirm-date').textContent = selectedDate || '-';
        document.getElementById('confirm-time').textContent = selectedTime || '-';
        document.getElementById('confirm-price').textContent = selectedServicePrice ? `R$ ${selectedServicePrice}` : '-';
    }

    // Botão de confirmação final
    const confirmButton = document.querySelector('.confirm-button');
    const phoneModal = document.getElementById('phoneModal');
    const phoneModalClose = document.getElementById('phoneModalClose');
    const phoneModalBtn = document.getElementById('phoneModalBtn');
    const userPhone = document.getElementById('userPhone');
    const userNameContainer = document.getElementById('userNameContainer');
    const userName = document.getElementById('userName');
    const notificationsOptIn = document.getElementById('notificationsOptIn');
    const emailFieldContainer = document.getElementById('emailFieldContainer');
    const userEmail = document.getElementById('userEmail');

    // Função para validar e-mail
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Mostrar/esconder campo de e-mail ao marcar o checkbox
    if (notificationsOptIn && emailFieldContainer && userEmail) {
        notificationsOptIn.addEventListener('change', function () {
            if (this.checked) {
                emailFieldContainer.style.display = '';
                userEmail.required = true;
            } else {
                emailFieldContainer.style.display = 'none';
                userEmail.required = false;
                userEmail.value = '';
            }
            atualizarEstadoBtn();
        });
        userEmail.addEventListener('input', atualizarEstadoBtn);
    }

    // Função para validar telefone (10 ou 11 dígitos)
    function validarTelefone(telefone) {
        return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(telefone.replace(/\s/g, ''));
    }

    let aguardandoNome = false;

    // Atualiza o estado do botão
    function atualizarEstadoBtn() {
        const telefoneValido = validarTelefone(userPhone.value.trim());
        let nomeValido = true;
        if (userNameContainer.style.display !== 'none') {
            nomeValido = !!userName.value.trim();
        }
        let emailValido = true;
        if (notificationsOptIn && notificationsOptIn.checked) {
            emailValido = validarEmail(userEmail.value.trim());
            if (!emailValido && userEmail.value.trim() !== '') {
                userEmail.style.borderColor = 'var(--primary-dark)';
            } else {
                userEmail.style.borderColor = '';
            }
        }
        phoneModalBtn.disabled = !(telefoneValido && (userNameContainer.style.display === 'none' || nomeValido) && (!notificationsOptIn || !notificationsOptIn.checked || emailValido));
    }
    userPhone.addEventListener('input', atualizarEstadoBtn);
    if (userName) userName.addEventListener('input', atualizarEstadoBtn);

    // Sempre que abrir o modal, reseta o fluxo
    if (confirmButton) {
        confirmButton.addEventListener('click', function () {
            if (selectedService && selectedProfessional && selectedDate && selectedTime) {
                phoneModal.classList.add('active');
                userPhone.value = '';
                userName.value = '';
                userNameContainer.style.display = 'none';
                phoneModalBtn.disabled = true;
                aguardandoNome = false;
            } else {
                showCustomModal({
                    message: 'Por favor, complete todas as informações para agendar.',
                    icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                    btnText: 'OK'
                });
            }
        });
    }

    phoneModalBtn.onclick = async function () {
        const tel = userPhone.value.trim();
        const nome = userNameContainer.style.display !== 'none' ? userName.value.trim() : '';
        const email = (notificationsOptIn && notificationsOptIn.checked) ? userEmail.value.trim() : undefined;
        if (!tel) {
            userPhone.style.borderColor = 'var(--primary-dark)';
            return;
        }
        if (userNameContainer.style.display !== 'none') {
            if (!nome) {
                userName.style.borderColor = 'var(--primary-dark)';
                return;
            }
            if (notificationsOptIn && notificationsOptIn.checked && !validarEmail(userEmail.value.trim())) {
                userEmail.style.borderColor = 'var(--primary-dark)';
                return;
            }
            try {
                await fetch('/agendamento/novo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: nome,
                        telefone: tel,
                        servico: selectedService,
                        profissional: selectedProfessional,
                        data: selectedDate.split('/').reverse().join('-'),
                        hora: selectedTime,
                        preco: selectedServicePrice.replace('R$', '').replace(',', '.').trim(),
                        email: email || undefined
                    })
                });
                phoneModal.classList.remove('active');
                showCustomModal({
                    message: `
        <div class="confirmed-modal-content">
            <div class="confirmed-modal-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="confirmed-modal-title">Agendamento confirmado!</div>
            <ul class="confirmed-modal-list">
                <li><span>Serviço:</span> <strong>${selectedService}</strong></li>
                <li><span>Profissional:</span> <strong>${selectedProfessional}</strong></li>
                <li><span>Data:</span> <strong>${selectedDate}</strong></li>
                <li><span>Horário:</span> <strong>${selectedTime}</strong></li>
                <li><span>Valor:</span> <strong style="color:var(--success);">R$ ${selectedServicePrice}</strong></li>
                <li><span>Telefone:</span> <strong>${tel}</strong></li>
                ${email ? `<li><span>E-mail:</span> <strong>${email}</strong></li>` : ''}
            </ul>
            <div class="confirmed-modal-thanks">Obrigado por agendar conosco!<br></div>
        </div>
    `,
                    icon: '',
                    btnText: 'Fechar',
                    onClose: function () {
                        setTimeout(() => {
                            location.reload();
                        }, 300);
                    }
                });
            } catch (err) {
                alert('Erro ao agendar: ' + err.message);
            }
            return;
        }
        // Se o campo de nome está visível, é porque já foi solicitado
        if (userNameContainer.style.display !== 'none') {
            if (!nome) {
                userName.style.borderColor = 'var(--primary-dark)';
                return;
            }
            try {
                await fetch('/agendamento/novo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: nome,
                        telefone: tel,
                        servico: selectedService,
                        profissional: selectedProfessional,
                        data: selectedDate.split('/').reverse().join('-'),
                        hora: selectedTime,
                        preco: selectedServicePrice.replace('R$', '').replace(',', '.').trim()
                    })
                });
                phoneModal.classList.remove('active');
                showCustomModal({
                    message: `
        <div class="confirmed-modal-content">
            <div class="confirmed-modal-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="confirmed-modal-title">Agendamento confirmado!</div>
            <ul class="confirmed-modal-list">
                <li><span>Serviço:</span> <strong>${selectedService}</strong></li>
                <li><span>Profissional:</span> <strong>${selectedProfessional}</strong></li>
                <li><span>Data:</span> <strong>${selectedDate}</strong></li>
                <li><span>Horário:</span> <strong>${selectedTime}</strong></li>
                <li><span>Valor:</span> <strong style="color:var(--success);">R$ ${selectedServicePrice}</strong></li>
                <li><span>Telefone:</span> <strong>${tel}</strong></li>
            </ul>
            <div class="confirmed-modal-thanks">Obrigado por agendar conosco!<br></div>
        </div>
    `,
                    icon: '', // Ícone já inclusos acima
                    btnText: 'Fechar',
                    onClose: function () {
                        setTimeout(() => {
                            location.reload();
                        }, 300);
                    }
                });
            } catch (err) {
                alert('Erro ao agendar: ' + err.message);
            }
            return;
        }
        // Se ainda não pediu o nome, verifica no banco se já é cliente cadastrado
        if (!aguardandoNome) {
            phoneModalBtn.disabled = true;
            try {
                const res = await fetch(`/agendamento/meus?telefone=${encodeURIComponent(tel)}`);
                const data = await res.json();
                if (data.success && !data.cliente) {
                    // Não existe cliente: pede o nome
                    userNameContainer.style.display = '';
                    aguardandoNome = true;
                    phoneModalBtn.disabled = false;
                    userName.focus();
                    atualizarEstadoBtn();
                    return;
                } else if (data.success && data.cliente) {
                    // Já existe cliente: agenda normalmente
                    await fetch('/agendamento/novo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nome: '', // backend irá buscar o nome já cadastrado
                            telefone: tel,
                            servico: selectedService,
                            profissional: selectedProfessional,
                            data: selectedDate.split('/').reverse().join('-'),
                            hora: selectedTime,
                            preco: selectedServicePrice.replace('R$', '').replace(',', '.').trim()
                        })
                    });
                    phoneModal.classList.remove('active');
                    showCustomModal({
                        message: `<div class="confirmed-modal-content">
            <div class="confirmed-modal-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="confirmed-modal-title">Agendamento confirmado!</div>
            <ul class="confirmed-modal-list">
                <li><span>Serviço:</span> <strong>${selectedService}</strong></li>
                <li><span>Profissional:</span> <strong>${selectedProfessional}</strong></li>
                <li><span>Data:</span> <strong>${selectedDate}</strong></li>
                <li><span>Horário:</span> <strong>${selectedTime}</strong></li>
                <li><span>Valor:</span> <strong style="color:var(--success);">R$ ${selectedServicePrice}</strong></li>
                <li><span>Telefone:</span> <strong>${tel}</strong></li>
            </ul>
            <div class="confirmed-modal-thanks">Obrigado por agendar conosco!<br></div>
        </div>
    `,
                        icon: '', // Ícone já inclusos acima
                        btnText: 'Fechar',
                        onClose: function () {
                            setTimeout(() => {
                                location.reload();
                            }, 300);
                        }
                    });
                }
            } catch (err) {
                alert('Erro ao verificar telefone: ' + err.message);
                phoneModalBtn.disabled = false;
            }
        }
    };

    // Código para o modal de "Meus agendamentos"
    const myAppointmentsBtn = document.querySelector('.my-appointments');
    const appointmentsModal = document.getElementById('appointmentsModal');
    const appointmentsModalClose = document.getElementById('appointmentsModalClose');
    const appointmentsModalBtn = document.getElementById('appointmentsModalBtn');
    const appointmentsPhone = document.getElementById('appointmentsPhone');

    // Abrir modal ao clicar em "Meus agendamentos"
    myAppointmentsBtn.addEventListener('click', function (e) {
        e.preventDefault();
        appointmentsModal.classList.add('active');
        appointmentsPhone.value = '';
        appointmentsPhone.focus();
    });

    // Fechar modal
    appointmentsModalClose.onclick = () => appointmentsModal.classList.remove('active');

    // Fechar ao clicar fora do conteúdo
    appointmentsModal.onclick = function (e) {
        if (e.target === appointmentsModal) appointmentsModal.classList.remove('active');
    };

    // Ação do botão do modal
    appointmentsModalBtn.onclick = async function () {
        const tel = appointmentsPhone.value.trim();

        appointmentsPhone.style.borderColor = '';

        if (!tel) {
            appointmentsPhone.style.borderColor = 'var(--primary-dark)';
            return;
        }

        // Buscar agendamentos do usuário
        try {
            const res = await fetch(`/agendamento/meus?telefone=${encodeURIComponent(tel)}`);
            const data = await res.json();
            if (data.success && data.agendamentos.length > 0) {
                const nomeCliente = data.agendamentos[0].nome ? data.agendamentos[0].nome.split(' ')[0] : '';
                let html = `
        <div class="my-appointments-modal">
            <div class="my-appointments-icon">
                <i class="fas fa-calendar-check"></i>
            </div>
            <div class="my-appointments-title">Meus agendamentos${nomeCliente ? `, ${nomeCliente}` : ''}</div>
            <div class="my-appointments-filter">
                <label for="myAppointmentsStatusFilter">Filtrar:</label>
                <select id="myAppointmentsStatusFilter">
                    <option value="all">Todos</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="cancelled">Cancelados</option>
                    <option value="completed">Concluídos</option>
                </select>
            </div>
            <ul class="my-appointments-list"></ul>
        </div>
    `;
                appointmentsModal.classList.remove('active');
                showCustomModal({
                    message: html,
                    icon: '',
                    btnText: 'Fechar'
                });

                // Renderização dinâmica da lista com filtro
                function renderMyAppointmentsList(statusFilter) {
                    const ul = document.querySelector('.my-appointments-list');
                    if (!ul) return;
                    let ags = data.agendamentos.slice();

                    // Use apenas o status do banco
                    ags = ags.map(ag => {
                        let status = 'confirmed';
                        if (ag.status && ag.status.toLowerCase() === 'cancelado') {
                            status = 'cancelled';
                        } else if (ag.status && ag.status.toLowerCase() === 'concluido') {
                            status = 'completed';
                        } else if (ag.status && ag.status.toLowerCase() === 'confirmado') {
                            status = 'confirmed';
                        }
                        return { ...ag, _status: status };
                    });
                    // Atualiza status no banco se necessário
                    ags.forEach(async ag => {
                        if (ag._status === 'completed' && (!ag.status || ag.status.toLowerCase() !== 'concluido')) {
                            // Atualiza no banco
                            try {
                                await fetch(`/agendamento/concluir/${ag.id}`, { method: 'PATCH' });
                            } catch (e) { }
                        }
                    });
                    if (statusFilter && statusFilter !== 'all') {
                        ags = ags.filter(ag => ag._status === statusFilter);
                    }
                    if (ags.length === 0) {
                        ul.innerHTML = '<li style="color:var(--text-secondary);padding:18px 0;text-align:center;">Nenhum agendamento encontrado.</li>';
                        return;
                    }
                    ul.innerHTML = ags.map(ag => `
            <li data-id="${ag.id}">
                <div class="my-appointments-row">
                    <span class="my-appointments-service"><i class="fas fa-cut"></i> ${ag.servico}</span>
                    <span class="my-appointments-prof"><i class="fas fa-user-tie"></i> ${ag.profissional}</span>
                </div>
                <div class="my-appointments-row">
                    <span class="my-appointments-date"><i class="far fa-calendar-alt"></i> ${formatarDataBR(ag.data)}</span>
                    <span class="my-appointments-time"><i class="far fa-clock"></i> ${ag.hora}</span>
                </div>
                <div class="my-appointments-row">
                    <span class="my-appointments-price"><i class="fas fa-money-bill-wave"></i> R$ ${Number(ag.preco).toFixed(2).replace('.', ',')}</span>
                    <span class="my-appointments-status status-${ag._status}">
                        ${ag._status === 'confirmed' ? 'Confirmado' : ag._status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                    </span>
                    ${ag._status === 'confirmed' ? `<button class="delete-appointment-btn" data-id="${ag.id}"><i class="fas fa-trash"></i> Cancelar</button>` : ''}
                </div>
            </li>
        `).join('');
                    // Reaplica eventos de cancelar SEMPRE após renderizar
                    document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
                        btn.onclick = async function () {
                            const id = this.getAttribute('data-id');
                            try {
                                const res = await fetch(`/agendamento/cancelar/${id}`, { method: 'PATCH' });
                                const result = await res.json();
                                if (result.success) {
                                    // Atualiza status visualmente sem remover o item e sem fechar o modal
                                    const li = this.closest('li');
                                    if (li) {
                                        // Atualiza status
                                        const statusSpan = li.querySelector('.my-appointments-status');
                                        if (statusSpan) {
                                            statusSpan.className = 'my-appointments-status status-cancelled';
                                            statusSpan.textContent = 'Cancelado';
                                        }
                                        // Remove o botão de cancelar
                                        this.remove();
                                    }
                                    showCustomModal({
                                        message: 'Agendamento cancelado com sucesso!',
                                        icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
                                        btnText: 'Fechar',
                                        onClose: null // Não fecha o modal de agendamentos
                                    });
                                } else {
                                    showCustomModal({
                                        message: 'Erro ao cancelar agendamento.',
                                        icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                                        btnText: 'Fechar',
                                        onClose: null
                                    });
                                }
                            } catch (err) {
                                showCustomModal({
                                    message: 'Erro ao conectar ao servidor.',
                                    icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                                    btnText: 'Fechar',
                                    onClose: null
                                });
                            }
                        };
                    });
                }
                // Inicializa lista
                renderMyAppointmentsList('all');
                // Filtro
                const statusFilterEl = document.getElementById('myAppointmentsStatusFilter');
                if (statusFilterEl) {
                    statusFilterEl.value = 'confirmed'; // Deixa "Confirmados" selecionado visualmente
                    renderMyAppointmentsList('confirmed'); // Mostra confirmados inicialmente
                    statusFilterEl.addEventListener('change', function () {
                        renderMyAppointmentsList(this.value);
                    });
                }
                // Ativar botões de exclusão
                setTimeout(() => {
                    document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
                        btn.onclick = async function () {
                            const id = this.getAttribute('data-id');
                            try {
                                const res = await fetch(`/agendamento/cancelar/${id}`, { method: 'PATCH' });
                                const result = await res.json();
                                if (result.success) {
                                    // Atualiza status visualmente sem remover o item
                                    const statusSpan = this.parentElement.querySelector('.my-appointments-status');
                                    if (statusSpan) {
                                        statusSpan.className = 'my-appointments-status status-cancelled';
                                        statusSpan.textContent = 'Cancelado';
                                    }
                                    // Desabilita o botão após cancelar
                                    this.disabled = true;
                                    this.innerHTML = '<i class="fas fa-ban"></i> Cancelado';
                                    showCustomModal({
                                        message: 'Agendamento cancelado com sucesso!',
                                        icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
                                        btnText: 'Fechar'
                                    });
                                } else {
                                    showCustomModal({
                                        message: 'Erro ao cancelar agendamento.',
                                        icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                                        btnText: 'Fechar'
                                    });
                                }
                            } catch (err) {
                                showCustomModal({
                                    message: 'Erro ao conectar ao servidor.',
                                    icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                                    btnText: 'Fechar'
                                });
                            }
                        };
                    });
                }, 100);

            } else {
                appointmentsModal.classList.remove('active');
                showCustomModal({
                    message: `
        <div class="no-appointments-modal">
            <div class="no-appointments-icon">
                <i class="far fa-calendar-times"></i>
            </div>
            <div class="no-appointments-title">Você ainda não possui agendamentos</div>
            <div class="no-appointments-text">
                Que tal agendar um serviço agora mesmo?<br>
                Assim que você fizer um agendamento, ele aparecerá aqui.
            </div>
        </div>
    `,
                    icon: '',
                    btnText: 'Fechar'
                });
            }
        } catch (err) {
            appointmentsModal.classList.remove('active');
            showCustomModal({
                message: 'Erro ao buscar agendamentos.',
                icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                btnText: 'Fechar'
            });
        }
    };

    // Função para carregar turnos do backend
    async function carregarHorariosTurnos() {
        try {
            const res = await fetch('/dashboard/horarios-turnos');
            const data = await res.json();
            if (data.success) {
                turnosSemana = data.turnos;
            } else {
                turnosSemana = [];
            }
        } catch (err) {
            turnosSemana = [];
        }
    }

    // Função para carregar folgas especiais do backend
    async function carregarFolgasEspeciais() {
        try {
            const res = await fetch('/dashboard/folgas-especiais-public');
            const data = await res.json();
            if (data.success) {
                folgasEspeciais = data.datas || [];
            } else {
                folgasEspeciais = [];
            }
        } catch (err) {
            folgasEspeciais = [];
        }
    }

    // Função auxiliar para verificar se uma data é folga especial
    function isFolgaEspecial(dateStr) {
        // Converte a data do formato DD/MM/YYYY para YYYY-MM-DD
        const [day, month, year] = dateStr.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return folgasEspeciais.includes(isoDate);
    }

    // Função para exibir horários disponíveis do dia selecionado
    async function renderTimeSlots(diaSemana) {
        const slotsContainer = document.querySelector('.slots-container');
        slotsContainer.innerHTML = '';
        
        // Verificar se o dia selecionado é uma folga especial
        if (selectedDate && isFolgaEspecial(selectedDate)) {
            slotsContainer.innerHTML = `
              <div style="display:flex;justify-content:center;align-items:center;height:100px;width:100%;">
                <div style="color:#b71c1c;border-radius:12px;padding:18px 28px;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:180px;max-width:90vw;">
                  <i class='fas fa-store-slash' style='font-size:1.5rem;color:#b71c1c;margin-bottom:2px;opacity:0.7;'></i>
                  <span style="font-size:1.05rem;font-weight:500;letter-spacing:0.2px;">Fechado</span>
                </div>
              </div>
            `;
            return;
        }
        
        const turnos = turnosSemana.filter(t => t.dia_semana === diaSemana);
        if (turnos.length === 0) {
            slotsContainer.innerHTML = `
              <div style="display:flex;justify-content:center;align-items:center;height:100px;width:100%;">
                <div style="color:#b71c1c;border-radius:12px;padding:18px 28px;display:flex;flex-direction:column;align-items:center;gap:6px;min-width:180px;max-width:90vw;">
                  <i class='fas fa-store-slash' style='font-size:1.5rem;color:#b71c1c;margin-bottom:2px;opacity:0.7;'></i>
                  <span style="font-size:1.05rem;font-weight:500;letter-spacing:0.2px;">Fechado</span>
                </div>
              </div>
            `;
            return;
        }
        let duracaoMin = 0;
        if (selectedServiceTime) {
            const match = selectedServiceTime.match(/(\d+)\s*h\s*(\d+)?\s*min?|^(\d+)\s*min/);
            if (match) {
                if (match[1]) {
                    duracaoMin = parseInt(match[1], 10) * 60 + (match[2] ? parseInt(match[2], 10) : 0);
                } else if (match[3]) {
                    duracaoMin = parseInt(match[3], 10);
                }
            } else {
                duracaoMin = parseInt(selectedServiceTime, 10) || 0;
            }
        }
        if (!duracaoMin || duracaoMin < 10) duracaoMin = 10;

        // Buscar agendamentos ocupados do backend
        let ocupados = [];
        if (selectedProfessional && selectedDate) {
            try {
                const res = await fetch(`/agendamento/ocupados?profissional=${encodeURIComponent(selectedProfessional)}&data=${selectedDate.split('/').reverse().join('-')}`);
                const data = await res.json();
                if (data.success && Array.isArray(data.agendamentos)) {
                    ocupados = data.agendamentos.map(ag => ({
                        hora: ag.hora,
                        servico: ag.servico
                    }));
                }
            } catch (err) { }
        }

        // Monta lista de intervalos ocupados [{ini, fim}]
        let horariosOcupados = [];
        ocupados.forEach(ag => {
            let duracaoAg = duracaoMin;
            if (ag.servico && window.servicosList) {
                const serv = window.servicosList.find(s => s.nome === ag.servico);
                if (serv && serv.tempo) {
                    const match = serv.tempo.match(/(\d+)\s*h\s*(\d+)?\s*min?|^(\d+)\s*min/);
                    if (match) {
                        if (match[1]) {
                            duracaoAg = parseInt(match[1], 10) * 60 + (match[2] ? parseInt(match[2], 10) : 0);
                        } else if (match[3]) {
                            duracaoAg = parseInt(match[3], 10);
                        }
                    } else {
                        duracaoAg = parseInt(serv.tempo, 10) || duracaoMin;
                    }
                }
            }
            const [h, m] = ag.hora.split(':').map(Number);
            const ini = h * 60 + m;
            const fim = ini + duracaoAg;
            horariosOcupados.push({ ini, fim });
        });
        horariosOcupados.sort((a, b) => a.ini - b.ini);

        function slotLivre(tIni, tFim) {
            for (const o of horariosOcupados) {
                if (tIni < o.fim && tFim > o.ini) return false;
            }
            return true;
        }

        // BLOQUEIO DE HORÁRIOS PASSADOS USANDO window.serverTime()
        let minutosLimiteHoje = null;
        let isHoje = false;
        if (selectedDate && typeof window.serverTime === 'function') {
            const [d, m, y] = selectedDate.split('/');
            const dataSelecionada = new Date(`${y}-${m}-${d}T00:00:00`);
            const agora = window.serverTime();
            const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
            if (dataSelecionada.getTime() === hoje.getTime()) {
                minutosLimiteHoje = agora.getHours() * 60 + agora.getMinutes();
                isHoje = true;
            }
        }

        turnos.forEach(turno => {
            let inicio = turno.turno_inicio.slice(0, 5);
            let fim = turno.turno_fim.slice(0, 5);
            let [hIni, mIni] = inicio.split(':').map(Number);
            let [hFim, mFim] = fim.split(':').map(Number);
            let tIni = hIni * 60 + mIni;
            let tFim = hFim * 60 + mFim;
            let t = tIni;
            while (t + duracaoMin <= tFim) {
                let diff = t - tIni;
                if (diff % duracaoMin !== 0) {
                    t += duracaoMin - (diff % duracaoMin);
                    continue;
                }
                let slotIni = t;
                let slotFim = t + duracaoMin;
                // BLOQUEIA slots anteriores ao horário real no dia de hoje
                if (isHoje && minutosLimiteHoje !== null && slotIni < minutosLimiteHoje) {
                    t += duracaoMin;
                    continue;
                }
                if (slotLivre(slotIni, slotFim)) {
                    let h = Math.floor(t / 60);
                    let m = t % 60;
                    let horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'time-slot';
                    slotDiv.textContent = horaStr;
                    slotsContainer.appendChild(slotDiv);
                }
                t += duracaoMin;
            }
        });
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function () {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                selectedTime = this.textContent;
                confirmationSection.style.display = 'block';
                updateConfirmationDetails();
                confirmationSection.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    // Ao selecionar um dia, busque os turnos do banco e exiba os horários
    function getDiaSemana(dateInput) {
        // Aceita Date ou string nos formatos 'dd/mm/yyyy' ou 'yyyy-mm-dd'
        let date;
        if (dateInput instanceof Date) {
            date = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
        } else if (typeof dateInput === 'string') {
            if (dateInput.includes('/')) {
                const parts = dateInput.split('/');
                if (parts.length === 3) {
                    const [d, m, y] = parts;
                    date = new Date(Number(y), Number(m) - 1, Number(d));
                }
            } else if (dateInput.includes('-')) {
                // yyyy-mm-dd
                const parts = dateInput.split('-');
                if (parts.length === 3) {
                    const [y, m, d] = parts;
                    date = new Date(Number(y), Number(m) - 1, Number(d));
                }
            }
        }
        if (!date || isNaN(date.getTime())) return null; // fallback
        const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];
        return dias[date.getDay()];
    }

    // No evento de clique do dia do calendário, chame renderTimeSlots:
    document.addEventListener('click', async function (e) {
        if (e.target.classList.contains('day') && !e.target.classList.contains('past-day')) {
            const dateStr = e.target.getAttribute('data-date');
            selectedDate = dateStr;
            updateConfirmationDetails();
            // Chame renderTimeSlots com o dia da semana do dia selecionado
            renderTimeSlots(getDiaSemana(dateStr));
            // Mostre a seção de confirmação se quiser
            confirmationSection.style.display = 'block';
        }
    });

    // No carregamento da página, carregue os turnos e folgas especiais:
    await carregarHorariosTurnos();
    await carregarFolgasEspeciais();

    // Função para carregar profissionais do backend e renderizar os cards
    async function carregarProfissionais() {
        const container = document.querySelector('.professional-list');
        if (!container) return;
        try {
            const res = await fetch('/agendamento/profissionais');
            const data = await res.json();
            if (data.success && Array.isArray(data.profissionais) && data.profissionais.length > 0) {
                container.innerHTML = '';
                data.profissionais.forEach((prof, idx) => {
                    const card = document.createElement('div');
                    card.className = 'professional-card' + (idx === 0 ? ' selected' : '');
                    card.setAttribute('data-professional', prof.nome);
                    card.innerHTML = `
                        <div class="professional-img">
                            <img src="${prof.avatar}" alt="Avatar ${prof.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" />
                        </div>
                        <div class="professional-name">${prof.nome}</div>
                    `;
                    container.appendChild(card);
                });
                // Seleção de profissional
                const professionalCards = container.querySelectorAll('.professional-card');
                professionalCards.forEach(card => {
                    card.addEventListener('click', function () {
                        professionalCards.forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedProfessional = this.getAttribute('data-professional');
                        updateConfirmationDetails();
                    });
                });
                // Define o primeiro como selecionado por padrão
                selectedProfessional = data.profissionais[0].nome;
                updateConfirmationDetails();
                
                // Profissionais carregados
                console.log('Profissionais carregados com sucesso');
            } else {
                container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Nenhum profissional cadastrado.</div>';
            }
        } catch (err) {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar profissionais.</div>';
        }
    }

    // Chamar carregarProfissionais ao carregar a página
    carregarProfissionais();

    // Substitua os alerts por esta função e use-a nos lugares dos alerts
    function showCustomModal({
        message,
        icon = '',
        btnText = 'OK',
        onClose = null
    }) {
        const modal = document.getElementById('customModal');
        const modalMsg = document.getElementById('customModalMessage');
        const modalIcon = document.getElementById('customModalIcon');
        const modalBtn = document.getElementById('customModalBtn');
        const modalClose = document.getElementById('customModalClose');

        modalMsg.innerHTML = message;
        modalIcon.innerHTML = icon;
        modalBtn.textContent = btnText;

        function closeModal() {
            modal.classList.remove('active');
            if (onClose) onClose();
        }

        modalBtn.onclick = closeModal;
        modalClose.onclick = closeModal;

        modal.classList.add('active');
    }

    // Botão "Ver endereço" - mostrar/ocultar endereço
    const addressToggle = document.getElementById('addressToggle');
    const addressContent = document.getElementById('addressContent');
    if (addressToggle && addressContent) {
        addressToggle.addEventListener('click', function (e) {
            e.preventDefault();
            if (addressContent.style.display === 'block') {
                addressContent.style.display = 'none';
                addressToggle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ver endereço';
            } else {
                addressContent.style.display = 'block';
                addressToggle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ocultar endereço';
            }
        });
    }

    // Informações da Barbearia
    async function carregarBarbearia() {
        const container = document.getElementById('barbershopInfo');
        const welcomeSection = document.querySelector('.welcome-section');
        try {
            // Busca o wallpaper selecionado
            const wallpaperRes = await fetch('/dashboard/wallpaper-selecionado');
            const wallpaperData = await wallpaperRes.json();
            let wallpaperUrl = wallpaperData.success && wallpaperData.wallpaper && wallpaperData.wallpaper.url ? wallpaperData.wallpaper.url : null;

            const res = await fetch('/dashboard/barbearia');
            const data = await res.json();
            if (data.success) {
                const b = data.barbearia;
                // Defina o background na seção welcome
                if (welcomeSection) {
                    welcomeSection.style.backgroundImage = wallpaperUrl ? `url('${wallpaperUrl}')` : 'none';
                }
                container.innerHTML = `
                    <div class="profile-pic">
                        <img src="${b.foto}" alt="Foto da Barbearia" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
                    </div>
                    <div class="welcome-text">Seja bem vindo(a) ao</div>
                    <h1 class="barbershop-name">${b.nome}</h1>
                    <div class="social-icons-welcome">
                        <a href="https://wa.me/${b.whatsapp}" target="_blank" class="social-icon-welcome" aria-label="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <a href="https://instagram.com/${b.instagram}" target="_blank" class="social-icon-welcome" aria-label="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                    </div>
                    <div class="address-container">
                        <button class="address-toggle" id="addressToggle">
                            <i class="fas fa-map-marker-alt"></i> Ver endereço
                        </button>
                        <div class="address-content" id="addressContent">
                            <p>${b.endereco}</p>
                            <p>${b.cidade_estado}</p>
                            <a href="https://maps.google.com?q=${encodeURIComponent(b.endereco + ', ' + b.cidade_estado)}" target="_blank" class="map-link">
                                <i class="fas fa-external-link-alt"></i> Abrir no Google Maps
                            </a>
                        </div>
                    </div>
                `;
                // Reaplica evento do botão de endereço
                const addressToggle = document.getElementById('addressToggle');
                const addressContent = document.getElementById('addressContent');
                if (addressToggle && addressContent) {
                    addressToggle.addEventListener('click', function (e) {
                        e.preventDefault();
                        if (addressContent.style.display === 'block') {
                            addressContent.style.display = 'none';
                            addressToggle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ver endereço';
                        } else {
                            addressContent.style.display = 'block';
                            addressToggle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ocultar endereço';
                        }
                    });
                }
                
                // Informações da barbearia carregadas
                console.log('Informações da barbearia carregadas');
            } else {
                container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Informações da barbearia não cadastradas.</div>';
            }
        } catch (err) {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar informações.</div>';
        }
    }
    
    // Adicionar tarefa para carregamento dos dados da barbearia
    carregarBarbearia();

    document.addEventListener('DOMContentLoaded', function () {
        // Para todos os modais customizados
        document.querySelectorAll('.custom-modal').forEach(function (modal) {
            // Fecha ao clicar no X
            const closeBtn = modal.querySelector('.custom-modal-close');
            if (closeBtn) {
                closeBtn.onclick = function () {
                    modal.classList.remove('active');
                };
            }
            // Fecha ao clicar fora do conteúdo
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    });

    // Garantir fechamento correto do phoneModal
    if (phoneModal && phoneModalClose) {
        phoneModalClose.onclick = function () {
            phoneModal.classList.remove('active');
        };
        phoneModal.addEventListener('click', function (e) {
            if (e.target === phoneModal) {
                phoneModal.classList.remove('active');
            }
        });
    }

   async function getAlertasPromosAtivos() {
  try {
    const res = await fetch('/api/alertas-promos/ativos');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
});

async function getAlertasPromosAtivos() {
    try {
        const res = await fetch('/api/alertas-promos/ativos');
        return await res.json();
    } catch {
        return [];
    }
}

async function showAlertaPromoSiteModal() {
    const arr = await getAlertasPromosAtivos();
    if (!arr.length) return;
    const item = arr[0];
    const modal = document.getElementById('alertaPromoSiteModal');
    const content = document.getElementById('alertaPromoSiteContent');
    if (!modal || !content) return;
    content.innerHTML = `
        <div class="promo-modal-header">
            <span class="custom-modal-close" id="alertaPromoSiteClose" title="Fechar">&times;</span>
        </div>
        ${item.imagem ? `<div class="promo-img-cover" style="background-image:url('${item.imagem}');"></div>` : ''}
        ${item.link ? `<a href="${item.link}" target="_blank" class="promo-btn" style="margin-top:18px;"><i class="fas fa-external-link-alt"></i> Saiba mais</a>` : ''}
    `;
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.getElementById('alertaPromoSiteClose').onclick = function () {
        modal.classList.remove('active');
        modal.style.display = 'none';
    };
    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    };
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(showAlertaPromoSiteModal, 600);
});
// Carrega utilitário de alerta customizado
const script = document.createElement('script');
script.src = '/js/custom-alert.js';
document.head.appendChild(script);

// Adiciona suporte a dayjs (data/hora em tempo real)
if (typeof dayjs === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js';
    script.onload = function() {
        if (typeof dayjs !== 'undefined') {
            window.dayjs = dayjs;
        }
    };
    document.head.appendChild(script);
}

// Função para buscar data/hora do servidor e garantir precisão com dayjs
async function getServerDateTime() {
    try {
        const res = await fetch('/dashboard/servertime');
        const data = await res.json();
        if (data && data.iso && typeof dayjs !== 'undefined') {
            return dayjs(data.iso);
        } else if (data && data.iso) {
            return new Date(data.iso);
        }
    } catch (err) {}
    // fallback: retorna dayjs() local
    if (typeof dayjs !== 'undefined') return dayjs();
    return new Date();
}

// Função para formatar a data no formato brasileiro (DD/MM/AAAA)
function formatarDataBR(dataISO) {
    if (!dataISO) return '';
    // Se vier só a data (ex: 2025-05-26)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    // Se vier no formato ISO completo (ex: 2025-05-26T03:00:00.000Z)
    const data = new Date(dataISO);
    if (!isNaN(data.getTime())) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    // Se não conseguir converter, retorna original
    return dataISO;
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

document.addEventListener('DOMContentLoaded', async function() {
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
                    } else {
                        servicesSection.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Nenhum serviço cadastrado.</div>';
                    }
                } catch (err) {
                    servicesSection.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar serviços.</div>';
                }
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

            // Elementos da página
            const calendarSection = document.getElementById('calendar-section');
            const confirmationSection = document.getElementById('confirmation-section');
            const calendarDaysContainer = document.querySelector('.calendar-days');
            const monthNameElement = document.querySelector('.month-name');
            const calendarToggleBtn = document.getElementById('calendarToggleBtn');

            // Elementos do tema
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

            // Inicializar calendário
            let currentDate = new Date();
            renderCalendar(currentDate);

            // Selecionar serviço
            const bookButtons = document.querySelectorAll('.book-button');
            bookButtons.forEach(button => {
                button.addEventListener('click', function() {
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
                card.addEventListener('click', function() {
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

            prevMonthButton.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar(currentDate);
            });

            nextMonthButton.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar(currentDate);
            });

            // Alternar visualização do calendário
            calendarToggleBtn.addEventListener('click', function() {
                if (calendarMode === 'month') {
                    calendarMode = 'week';
                    calendarSection.classList.add('calendar-compact');
                    calendarToggleBtn.textContent = 'Visualização mensal';
                } else {
                    calendarMode = 'month';
                    calendarSection.classList.remove('calendar-compact');
                    calendarToggleBtn.textContent = 'Visualização semanal';
                }
                renderCalendar(currentDate);
            });

            // Renderizar calendário
            function renderCalendar(date) {
                const year = date.getFullYear();
                const month = date.getMonth();
                const today = new Date();

                const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];

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
                    const today = new Date();
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

                        // Adicione o nome do dia acima do número
                        days += `<div class="day-column">
                                    <div class="week-day-name">${weekDayNames[i]}</div>
                                    <div class="${dayClass}" data-date="${weekDay.toLocaleDateString('pt-BR')}">${weekDay.getDate()}</div>
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

                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Garante comparação só por data

                    for (let i = firstDayIndex; i > 0; i--) {
                        const prevMonthDate = new Date(year, month - 1, prevLastDay - i + 1);
                        const dateStr = `${String(prevLastDay - i + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
                        days += `<div class="day disabled prev-month-day" 
                            data-date="${dateStr}" 
                            data-month="${month === 0 ? 12 : month}"
                            data-year="${month === 0 ? year - 1 : year}">
                            ${prevLastDay - i + 1}
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
                        if (selectedDate) {
                            const [sd, sm, sy] = selectedDate.split('/');
                            if (Number(sd) === i && Number(sm) === month + 1 && Number(sy) === year) {
                                dayClass += ' selected';
                            }
                        }
                        const dateStr = `${String(i).padStart(2, '0')}/${String(month+1).padStart(2, '0')}/${year}`;
                        // Ao criar cada dia:
                        if (selectedDate === dateStr) {
                            dayClass += ' selected';
                        }
                        days += `<div class="${dayClass}" data-date="${dateStr}">${i}</div>`;
                    }
                    for (let i = 1; i <= nextDays; i++) {
                        const nextMonthDate = new Date(year, month + 1, i);
                        const dateStr = `${String(i).padStart(2, '0')}/${String(month + 2).padStart(2, '0')}/${month === 11 ? year + 1 : year}`;
                        days += `<div class="day disabled next-month-day" 
                            data-date="${dateStr}"
                            data-month="${month === 11 ? 1 : month + 2}"
                            data-year="${month === 11 ? year + 1 : year}">
                            ${i}
                        </div>`;
                    }
                }

                calendarDaysContainer.innerHTML = days;

                // Adicionar event listeners para os botões de navegação semanal
                if (calendarMode === 'week') {
                    document.querySelector('.prev-week').addEventListener('click', () => {
                        animateWeekTransition('right', () => {
                            currentDate.setDate(currentDate.getDate() - 7);
                            renderCalendar(currentDate);
                        });
                    });

                    document.querySelector('.next-week').addEventListener('click', () => {
                        animateWeekTransition('left', () => {
                            currentDate.setDate(currentDate.getDate() + 7);
                            renderCalendar(currentDate);
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
                    day.addEventListener('click', function() {
                        // Se for um dia do mês anterior
                        if (this.classList.contains('prev-month-day')) {
                            currentDate.setMonth(currentDate.getMonth() - 1);
                            renderCalendar(currentDate);

                            setTimeout(() => {
                                const dayToSelect = this.textContent.trim();
                                const newDays = document.querySelectorAll('.day:not(.disabled)');
                                newDays.forEach(newDay => {
                                    if (newDay.textContent.trim() === dayToSelect) {
                                        newDay.click();
                                        newDay.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center'
                                        });
                                    }
                                });
                            }, 100);
                            return;
                        }

                        // Se for um dia do próximo mês
                        if (this.classList.contains('next-month-day')) {
                            currentDate.setMonth(currentDate.getMonth() + 1);
                            renderCalendar(currentDate);

                            setTimeout(() => {
                                const dayToSelect = this.textContent.trim();
                                const newDays = document.querySelectorAll('.day:not(.disabled)');
                                newDays.forEach(newDay => {
                                    if (newDay.textContent.trim() === dayToSelect) {
                                        newDay.click();
                                        newDay.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center'
                                        });
                                    }
                                });
                            }, 100);
                            return;
                        }

                        // Código existente para dias normais
                        dayElements.forEach(d => d.classList.remove('selected'));
                        this.classList.add('selected');

                        const dateStr = this.getAttribute('data-date');
                        const [d, m, y] = dateStr.split('/');
                        selectedDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;

                        updateConfirmationDetails();
                        confirmationSection.style.display = 'block';
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

                document.querySelectorAll('.day').forEach(dayEl => {
                    dayEl.addEventListener('click', function() {
                        if (this.classList.contains('past-day')) {
                            document.querySelector('.time-slots').style.display = 'none';
                            return;
                        }
                        // ...código normal para dias válidos...
                        document.querySelector('.time-slots').style.display = '';
                    });
                });
            }

            // Selecionar horário
            const timeSlots = document.querySelectorAll('.time-slot');
            timeSlots.forEach(slot => {
                slot.addEventListener('click', function() {
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
                notificationsOptIn.addEventListener('change', function() {
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
                confirmButton.addEventListener('click', function() {
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

            phoneModalBtn.onclick = async function() {
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
                            onClose: function() {
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
                            onClose: function() {
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
                                onClose: function() {
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
            myAppointmentsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                appointmentsModal.classList.add('active');
                appointmentsPhone.value = '';
                appointmentsPhone.focus();
            });

            // Fechar modal
            appointmentsModalClose.onclick = () => appointmentsModal.classList.remove('active');

            // Fechar ao clicar fora do conteúdo
            appointmentsModal.onclick = function(e) {
                if (e.target === appointmentsModal) appointmentsModal.classList.remove('active');
            };

            // Ação do botão do modal
            appointmentsModalBtn.onclick = async function() {
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
        const now = new Date();
ags = ags.map(ag => {
    let status = 'confirmed';
    if (ag.status && ag.status.toLowerCase() === 'cancelado') status = 'cancelled';
    else if (ag.status && ag.status.toLowerCase() === 'concluido') status = 'completed';
    else {
        // Corrigido: só marca como concluído se data+hora < agora
        const agDateTime = new Date(`${ag.data}T${(ag.hora || '00:00')}:00`);
        if (agDateTime.getTime() < Date.now()) status = 'completed';
    }
    return { ...ag, _status: status };
});
        // Atualiza status no banco se necessário
        ags.forEach(async ag => {
            if (ag._status === 'completed' && (!ag.status || ag.status.toLowerCase() !== 'concluido')) {
                // Atualiza no banco
                try {
                    await fetch(`/agendamento/concluir/${ag.id}`, { method: 'PATCH' });
                } catch (e) {}
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
            btn.onclick = async function() {
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
        statusFilterEl.addEventListener('change', function() {
            renderMyAppointmentsList(this.value);
        });
    }
    // Ativar botões de exclusão
    setTimeout(() => {
        document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
            btn.onclick = async function() {
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

    // =========================
    // BLOCO: Data/hora do servidor SEMPRE (ignora dispositivo)
    // =========================

    // Função para buscar a data/hora do servidor (UTC) via backend
    async function getServerDateTime() {
        try {
            const res = await fetch('/dashboard/servertime');
            const data = await res.json();
            if (data && data.iso && typeof dayjs !== 'undefined') {
                return dayjs(data.iso);
            } else if (data && data.iso) {
                return new Date(data.iso);
            }
        } catch (err) {}
        // fallback: retorna dayjs() local
        if (typeof dayjs !== 'undefined') return dayjs();
        return new Date();
    }

    // Variável global para data/hora do servidor
    let serverDate = null;

    // Função para atualizar a data/hora do servidor periodicamente (ex: a cada 30s)
    async function atualizarDataServidor() {
        serverDate = await getServerDateTime();
        if (!serverDate) {
            // fallback: mostra mensagem de erro
            showCustomModal({
                message: 'Erro ao obter data/hora do servidor. Atualize a página.',
                icon: '<i class="fas fa-exclamation-triangle" style="color:var(--primary-dark);"></i>',
                btnText: 'Fechar'
            });
            return;
        }
        // Atualiza o calendário e outros componentes dependentes da data
        renderCalendar(serverDate);
        // Se quiser atualizar outros componentes, chame aqui
    }

    // Inicializa a data do servidor ao carregar a página
    window.addEventListener('DOMContentLoaded', atualizarDataServidor);
    // Atualiza a cada 30 segundos para garantir precisão
    setInterval(atualizarDataServidor, 30000);

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

    // Função para exibir horários disponíveis do dia selecionado
    async function renderTimeSlots(diaSemana) {
        const slotsContainer = document.querySelector('.slots-container');
        slotsContainer.innerHTML = '';
        const turnos = turnosSemana.filter(t => t.dia_semana === diaSemana);
        if (turnos.length === 0) {
            slotsContainer.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Fechado</div>';
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
            } catch (err) {}
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
        // Ordena por início
        horariosOcupados.sort((a, b) => a.ini - b.ini);

        // Função para checar se um slot está livre
        function slotLivre(tIni, tFim) {
            for (const o of horariosOcupados) {
                // Se houver qualquer sobreposição, bloqueia
                if (tIni < o.fim && tFim > o.ini) return false;
            }
            return true;
        }

        // === BLOQUEIO DE HORÁRIOS PASSADOS NO DIA ATUAL ===
        let minutosLimiteHoje = null;
        if (selectedDate && typeof dayjs !== 'undefined') {
            // selectedDate: 'dd/mm/yyyy'
            const [d, m, y] = selectedDate.split('/');
            const dataSelecionada = dayjs(`${y}-${m}-${d}`);
            const serverNow = await getServerDateTime();
            if (dataSelecionada.isSame(serverNow, 'day')) {
                minutosLimiteHoje = serverNow.hour() * 60 + serverNow.minute();
            }
        }
        // ================================================

        // Gera os horários de cada turno
        turnos.forEach(turno => {
            let inicio = turno.turno_inicio.slice(0, 5);
            let fim = turno.turno_fim.slice(0, 5);
            let [hIni, mIni] = inicio.split(':').map(Number);
            let [hFim, mFim] = fim.split(':').map(Number);
            let tIni = hIni * 60 + mIni;
            let tFim = hFim * 60 + mFim;
            let t = tIni;
            while (t + duracaoMin <= tFim) {
                // Arredonda para o próximo múltiplo de duracaoMin a partir do início
                let diff = t - tIni;
                if (diff % duracaoMin !== 0) {
                    t += duracaoMin - (diff % duracaoMin);
                    continue;
                }
                let slotIni = t;
                let slotFim = t + duracaoMin;
                // BLOQUEIA slots anteriores ao horário real no dia de hoje
                if (minutosLimiteHoje !== null && slotIni < minutosLimiteHoje) {
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
        // Reaplica eventos de seleção
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function() {
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
    function getDiaSemana(dateStr) {
        // dateStr: 'dd/mm/yyyy'
        const [d, m, y] = dateStr.split('/');
        // Corrija o mês para 0-based
        const date = new Date(y, Number(m) - 1, d);
        const dias = [
            'domingo', // 0
            'segunda', // 1
            'terca', // 2
            'quarta', // 3
            'quinta', // 4
            'sexta', // 5
            'sabado' // 6
        ];
        return dias[date.getDay()];
    }

    // No evento de clique do dia do calendário, chame renderTimeSlots:
    document.addEventListener('click', function(e) {
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

    // No carregamento da página, carregue os turnos:
    await carregarHorariosTurnos();

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
                            <img src="${prof.avatar || 'img/sua-logo.png'}" alt="Avatar ${prof.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" />
                        </div>
                        <div class="professional-name">${prof.nome}</div>
                    `;
                    container.appendChild(card);
                });
                // Seleção de profissional
                const professionalCards = container.querySelectorAll('.professional-card');
                professionalCards.forEach(card => {
                    card.addEventListener('click', function() {
                        professionalCards.forEach(c => c.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedProfessional = this.getAttribute('data-professional');
                        updateConfirmationDetails();
                    });
                });
                // Define o primeiro como selecionado por padrão
                selectedProfessional = data.profissionais[0].nome;
                updateConfirmationDetails();
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
        addressToggle.addEventListener('click', function(e) {
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
                        <img src="${b.foto || 'img/sua-logo.png'}" alt="Foto da Barbearia" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
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
                    addressToggle.addEventListener('click', function(e) {
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
            } else {
                container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Informações da barbearia não cadastradas.</div>';
            }
        } catch (err) {
            container.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Erro ao carregar informações.</div>';
        }
    }
    carregarBarbearia();

    document.addEventListener('DOMContentLoaded', function() {
        // Para todos os modais customizados
        document.querySelectorAll('.custom-modal').forEach(function(modal) {
            // Fecha ao clicar no X
            const closeBtn = modal.querySelector('.custom-modal-close');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    modal.classList.remove('active');
                };
            }
            // Fecha ao clicar fora do conteúdo
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    });

    // Garantir fechamento correto do phoneModal
    if (phoneModal && phoneModalClose) {
        phoneModalClose.onclick = function() {
            phoneModal.classList.remove('active');
        };
        phoneModal.addEventListener('click', function(e) {
            if (e.target === phoneModal) {
                phoneModal.classList.remove('active');
            }
        });
    }
});
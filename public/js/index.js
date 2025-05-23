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
    const acceptNotifications = document.getElementById('acceptNotifications');
    const acceptNotificationsLabel = document.querySelector('label[for="acceptNotifications"]');
    const userNameContainer = document.getElementById('userNameContainer');
    const userName = document.getElementById('userName');

    // Função para validar telefone (10 ou 11 dígitos)
    function validarTelefone(telefone) {
        return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(telefone.replace(/\s/g, ''));
    }

    let aguardandoNome = false;

    // Atualiza o estado do botão
    function atualizarEstadoBtn() {
        const telefoneValido = validarTelefone(userPhone.value.trim());
        const notificacaoAceita = acceptNotifications.checked;
        let nomeValido = true;
        if (userNameContainer.style.display !== 'none') {
            nomeValido = !!userName.value.trim();
        }
        phoneModalBtn.disabled = !(telefoneValido && notificacaoAceita && (userNameContainer.style.display === 'none' || nomeValido));
    }
    userPhone.addEventListener('input', atualizarEstadoBtn);
    acceptNotifications.addEventListener('change', atualizarEstadoBtn);
    if (userName) userName.addEventListener('input', atualizarEstadoBtn);

    // Sempre que abrir o modal, reseta o fluxo
    if (confirmButton) {
        confirmButton.addEventListener('click', function() {
            if (selectedService && selectedProfessional && selectedDate && selectedTime) {
                phoneModal.classList.add('active');
                userPhone.value = '';
                userName.value = '';
                userNameContainer.style.display = 'none';
                acceptNotifications.checked = false;
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
        if (!tel) {
            userPhone.style.borderColor = 'var(--primary-dark)';
            return;
        }
        if (!acceptNotifications.checked) {
            alert('Você precisa aceitar receber notificações para continuar.');
            return;
        }
        // Se o campo de nome está visível, é porque já foi solicitado
        if (userNameContainer.style.display !== 'none') {
            if (!nome) {
                userName.style.borderColor = 'var(--primary-dark)';
                return;
            }
            try {
                const subscription = await subscribeUserToPush();
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
                        subscription
                    })
                });
                phoneModal.classList.remove('active');
                showCustomModal({
                    message: `<strong>Agendamento confirmado!</strong><br><br>
                    <b>Serviço:</b> ${selectedService}<br>
                    <b>Profissional:</b> ${selectedProfessional}<br>
                    <b>Data:</b> ${selectedDate}<br>
                    <b>Horário:</b> ${selectedTime}<br>
                    <b>Valor:</b> R$ ${selectedServicePrice}<br>
                    <b>Telefone:</b> ${tel}`,
                    icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
                    btnText: 'Fechar',
                    onClose: function() {
                        setTimeout(() => {
                            location.reload();
                        }, 300);
                    }
                });
            } catch (err) {
                alert('Erro ao ativar notificações: ' + err.message);
            }
            return;
        }
        // Se ainda não pediu o nome, verifica no banco se já é usuário cadastrado
        if (!aguardandoNome) {
            phoneModalBtn.disabled = true;
            try {
                const res = await fetch(`/agendamento/meus?telefone=${encodeURIComponent(tel)}`);
                const data = await res.json();
                if (data.success && (!data.agendamentos || data.agendamentos.length === 0)) {
                    // Primeiro agendamento: pede o nome
                    userNameContainer.style.display = '';
                    aguardandoNome = true;
                    phoneModalBtn.disabled = false;
                    userName.focus();
                    atualizarEstadoBtn();
                    return;
                } else {
                    // Já é usuário: agenda normalmente
                    const subscription = await subscribeUserToPush();
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
                            preco: selectedServicePrice.replace('R$', '').replace(',', '.').trim(),
                            subscription
                        })
                    });
                    phoneModal.classList.remove('active');
                    showCustomModal({
                        message: `<strong>Agendamento confirmado!</strong><br><br>
                        <b>Serviço:</b> ${selectedService}<br>
                        <b>Profissional:</b> ${selectedProfessional}<br>
                        <b>Data:</b> ${selectedDate}<br>
                        <b>Horário:</b> ${selectedTime}<br>
                        <b>Valor:</b> R$ ${selectedServicePrice}<br>
                        <b>Telefone:</b> ${tel}`,
                        icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
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
                // Obtém o nome do primeiro agendamento retornado
                const nomeCliente = data.agendamentos[0].nome ? data.agendamentos[0].nome.split(' ')[0] : '';
                let html = `<b style="color:var(--text-main);">Olá${nomeCliente ? ', ' + nomeCliente : ''}!</b><br><br>
        <div style="display: flex; flex-direction: column; gap: 18px;">`;
                data.agendamentos.forEach(ag => {
                    html += `
            <div style="
                border: 1px solid var(--primary-dark);
                border-radius: 12px;
                padding: 12px 18px;
                display: flex;
                flex-direction: column;
                gap: 6px;
                background: var(--card);
                margin-bottom: 8px;
                position: relative;
            ">
                <div>
                    <span style="font-weight: 500; color: var(--text-secondary);">Serviço:</span>
                    <span style="color:var(--text-main);">${ag.servico}</span>
                </div>
                <div>
                    <span style="font-weight: 500; color: var(--text-secondary);">Profissional:</span>
                    <span style="color:var(--text-main);">${ag.profissional}</span>
                </div>
                <div>
                    <span style="font-weight: 500; color: var(--text-secondary);">Data:</span>
                    <span style="color:var(--text-main);">${ag.data.split('-').reverse().join('/')}</span>
                </div>
                <div>
                    <span style="font-weight: 500; color: var(--text-secondary);">Horário:</span>
                    <span style="color:var(--text-main);">${ag.hora}</span>
                </div>
                <div>
                    <span style="font-weight: 500; color: var(--text-secondary);">Valor:</span>
                    <span style="color:var(--success); font-weight: bold;">R$ ${Number(ag.preco).toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="delete-appointment-btn" data-id="${ag.id}" style="
                    margin-top: 8px;
                    align-self: flex-end;
                    background: var(--red);
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 6px 16px;
                    font-size: 0.98rem;
                    cursor: pointer;
                    transition: background 0.2s;
                ">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
            `;
                });
                html += '</div>';
                appointmentsModal.classList.remove('active');
                showCustomModal({
                    message: html,
                    icon: `<i class="fas fa-calendar-check" style="color:var(--primary);"></i>`,
                    btnText: 'Fechar'
                });

                // Ativar botões de exclusão
                setTimeout(() => {
                    document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
                        btn.onclick = async function() {
                            const id = this.getAttribute('data-id');
                            try {
                                const res = await fetch(`/agendamento/excluir/${id}`, {
                                    method: 'DELETE'
                                });
                                const result = await res.json();
                                if (result.success) {
                                    this.closest('div').remove();
                                    showCustomModal({
                                        message: 'Agendamento excluído com sucesso!',
                                        icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
                                        btnText: 'Fechar'
                                    });
                                } else {
                                    showCustomModal({
                                        message: 'Erro ao excluir agendamento.',
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
                    message: `<b>Olá!</b><br>Você ainda não possui agendamentos.`,
                    icon: '<i class="fas fa-calendar-check" style="color:var(--primary);"></i>',
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
            if (data && data.iso) {
                return new Date(data.iso);
            }
        } catch (err) {}
        // fallback: retorna null, nunca usa data local
        return null;
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

    // =========================
    // SUBSTITUIR USO DE new Date() por serverDate
    // =========================
    // Exemplo: dentro de renderCalendar, use:
    // const today = serverDate;
    // ...existing code...
    // Em qualquer lugar que precise da data "real", use serverDate
    // =========================
    // FIM BLOCO DATA SERVIDOR

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
    function renderTimeSlots(diaSemana) {
        const slotsContainer = document.querySelector('.slots-container');
        slotsContainer.innerHTML = '';
        // Filtra turnos do dia da semana selecionado
        const turnos = turnosSemana.filter(t => t.dia_semana === diaSemana);
        if (turnos.length === 0) {
            slotsContainer.innerHTML = '<div style="color:var(--primary-dark);padding:18px 0;text-align:center;">Fechado</div>';
            return;
        }
        // Gera os horários de cada turno
        turnos.forEach(turno => {
            let inicio = turno.turno_inicio.slice(0, 5);
            let fim = turno.turno_fim.slice(0, 5);
            let [hIni, mIni] = inicio.split(':').map(Number);
            let [hFim, mFim] = fim.split(':').map(Number);
            let tIni = hIni * 60 + mIni;
            let tFim = hFim * 60 + mFim;
            for (let t = tIni; t < tFim; t += 10) { // intervalos de 10 minutos
                let h = Math.floor(t / 60);
                let m = t % 60;
                let horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                const slotDiv = document.createElement('div');
                slotDiv.className = 'time-slot';
                slotDiv.textContent = horaStr;
                slotsContainer.appendChild(slotDiv);
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
});

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

async function subscribeUserToPush() {
    if (!('serviceWorker' in navigator)) throw new Error('Service Worker não suportado.');
    if (!('PushManager' in window)) throw new Error('Push API não suportada.');

    // Registra o SW se ainda não estiver registrado
    const reg = await navigator.serviceWorker.register('/sw.js');
    // Solicita permissão
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permissão de notificação negada.');

    // Verifica se já existe subscription
    let subscription = await reg.pushManager.getSubscription();
    const applicationServerKey = urlBase64ToUint8Array('BElvOnVGxu5czvx63n1FEo3ea90bKMVWwxlky9nZBMNB39u97JOckXngiEKParctze7ciGdPvEZkSAnMSGGfo_s');
    if (!subscription) {
        subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });
    }
    return subscription;
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// No evento do botão de confirmação do agendamento:
phoneModalBtn.onclick = async function() {
    const tel = userPhone.value.trim();
    // ...validações...
    if (!acceptNotifications.checked) {
        alert('Você precisa aceitar receber notificações para continuar.');
        return;
    }
    try {
        const subscription = await subscribeUserToPush();
        // Envie a subscription junto com o agendamento
        await fetch('/agendamento/novo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: '', // ou peça o nome do usuário
                telefone: tel,
                servico: selectedService,
                profissional: selectedProfessional,
                data: selectedDate.split('/').reverse().join('-'),
                hora: selectedTime,
                preco: selectedServicePrice.replace('R$', '').replace(',', '.').trim(),
                subscription
            })
        });
        // Fecha o modal de telefone
        phoneModal.classList.remove('active');
        showCustomModal({
            message: `<strong>Agendamento confirmado!</strong><br><br>
                    <b>Serviço:</b> ${selectedService}<br>
                    <b>Profissional:</b> ${selectedProfessional}<br>
                    <b>Data:</b> ${selectedDate}<br>
                    <b>Horário:</b> ${selectedTime}<br>
                    <b>Valor:</b> R$ ${selectedServicePrice}<br>
                    <b>Telefone:</b> ${tel}`,
            icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
            btnText: 'Fechar',
            onClose: function() {
                setTimeout(() => {
                    location.reload();
                }, 300);
            }
        });
    } catch (err) {
        alert('Erro ao ativar notificações: ' + err.message);
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
            let html = `<b style="color:var(--text-main);">Olá!</b><br><br>
                    <div style="display: flex; flex-direction: column; gap: 18px;">`;
            data.agendamentos.forEach(ag => {
                html += `
                        <div style="
                            border: 1px solid var(--primary-dark);
                            border-radius: 12px;
                            padding: 12px 18px;
                            display: flex;
                            flex-direction: column;
                            gap: 6px;
                            background: var(--card);
                            margin-bottom: 8px;
                            position: relative;
                        ">
                            <div>
                                <span style="font-weight: 500; color: var(--text-secondary);">Serviço:</span>
                                <span style="color:var(--text-main);">${ag.servico}</span>
                            </div>
                            <div>
                                <span style="font-weight: 500; color: var(--text-secondary);">Profissional:</span>
                                <span style="color:var(--text-main);">${ag.profissional}</span>
                            </div>
                            <div>
                                <span style="font-weight: 500; color: var(--text-secondary);">Data:</span>
                                <span style="color:var(--text-main);">${ag.data.split('-').reverse().join('/')}</span>
                            </div>
                            <div>
                                <span style="font-weight: 500; color: var(--text-secondary);">Horário:</span>
                                <span style="color:var(--text-main);">${ag.hora}</span>
                            </div>
                            <div>
                                <span style="font-weight: 500; color: var(--text-secondary);">Valor:</span>
                                <span style="color:var(--success); font-weight: bold;">R$ ${Number(ag.preco).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <button class="delete-appointment-btn" data-id="${ag.id}" style="
                                margin-top: 8px;
                                align-self: flex-end;
                                background: var(--red);
                                color: #fff;
                                border: none;
                                border-radius: 6px;
                                padding: 6px 16px;
                                font-size: 0.98rem;
                                cursor: pointer;
                                transition: background 0.2s;
                            ">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                        `;
            });
            html += '</div>';
            appointmentsModal.classList.remove('active');
            showCustomModal({
                message: html,
                icon: `<i class="fas fa-calendar-check" style="color:var(--primary);"></i>`,
                btnText: 'Fechar'
            });

            // Ativar botões de exclusão
            setTimeout(() => {
                document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
                    btn.onclick = async function() {
                        const id = this.getAttribute('data-id');
                        try {
                            const res = await fetch(`/agendamento/excluir/${id}`, {
                                method: 'DELETE'
                            });
                            const result = await res.json();
                            if (result.success) {
                                this.closest('div').remove();
                                showCustomModal({
                                    message: 'Agendamento excluído com sucesso!',
                                    icon: '<i class="fas fa-check-circle" style="color:var(--success);"></i>',
                                    btnText: 'Fechar'
                                });
                            } else {
                                showCustomModal({
                                    message: 'Erro ao excluir agendamento.',
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
                message: `<b>Olá!</b><br>Você ainda não possui agendamentos.`,
                icon: '<i class="fas fa-calendar-check" style="color:var(--primary);"></i>',
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
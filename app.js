class PeriodTracker {
    constructor() {
        this.currentDate = new Date();
        this.periods = this.loadData();
        this.settings = this.loadSettings();
        this.init();
        this.initBackground();
    }

    init() {
        this.renderCalendar();
        this.updateStats();
        this.updateMoodIndicator();
        this.setupEventListeners();
        this.checkReminders();
        this.updateBodyGradient();
    }

    initBackground() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        const flowerEmojis = ['🌸', '🌺', '🌼', '🌻', '🌷', '🏵️', '💐', '🌹'];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (20 + Math.random() * 15) + 's';
            
            const size = Math.random() * 2 + 1.5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            particlesContainer.appendChild(particle);
        }
        
        // Create floating flowers
        for (let i = 0; i < 10; i++) {
            const flower = document.createElement('div');
            flower.className = 'flower';
            flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
            flower.style.left = Math.random() * 100 + '%';
            flower.style.animationDelay = Math.random() * 25 + 's';
            flower.style.animationDuration = (25 + Math.random() * 20) + 's';
            flower.style.fontSize = (18 + Math.random() * 14) + 'px';
            
            particlesContainer.appendChild(flower);
        }
        
        // Wave canvas animation
        this.initWaveCanvas();
        
        // Scroll-based parallax
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const shapes = document.querySelectorAll('.floating-shape');
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.05;
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
        
        // Scroll reveal animations
        this.initScrollReveal();
        
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
        }
        
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            this.updateBodyGradient();
        });
        
        // Update daily message
        this.updateDailyMessage();
    }
    
    initWaveCanvas() {
        const canvas = document.getElementById('waveCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = 200;
        
        let offset = 0;
        
        const drawWave = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            
            for (let x = 0; x < canvas.width; x++) {
                const y = Math.sin((x + offset) * 0.01) * 30 + canvas.height / 2;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(255, 182, 193, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 182, 193, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fill();
            
            offset += 0.5;
            requestAnimationFrame(drawWave);
        };
        
        drawWave();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
        });
    }
    
    initScrollReveal() {
        const sections = document.querySelectorAll('.section[data-scroll]');
        
        const revealSection = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        };
        
        const sectionObserver = new IntersectionObserver(revealSection, {
            root: null,
            threshold: 0.15
        });
        
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
    
    updateDailyMessage() {
        const messages = [
            { icon: '✨', title: "Today's Affirmation", text: "You are strong, capable, and in tune with your body." },
            { icon: '💫', title: "Gentle Reminder", text: "Listen to your body. Rest when you need to, move when you can." },
            { icon: '🌟', title: "You've Got This", text: "Every cycle is a reminder of your body's incredible wisdom." },
            { icon: '💖', title: "Self-Care Moment", text: "Be kind to yourself today. You deserve all the love you give." },
            { icon: '🦋', title: "Daily Wisdom", text: "Your body is doing amazing things. Honor its rhythm." },
            { icon: '🌈', title: "Positive Vibes", text: "You're exactly where you need to be in your journey." },
            { icon: '✨', title: "Empowerment", text: "Your cycle is your superpower. Embrace every phase." },
            { icon: '💝', title: "Compassion", text: "Treat yourself with the same care you give to others." }
        ];
        
        const phase = this.getCurrentPhase();
        const phaseMessages = {
            menstrual: { icon: '🌙', title: "Rest Phase", text: "This is your time to slow down and recharge. Be gentle with yourself." },
            follicular: { icon: '🌸', title: "Energy Rising", text: "Feel your energy building. Perfect time for new beginnings." },
            ovulation: { icon: '✨', title: "Peak Power", text: "You're at your strongest. Embrace your confidence and energy." },
            luteal: { icon: '🌺', title: "Nesting Phase", text: "Time to focus inward. Comfort and calm are your priorities." }
        };
        
        const message = this.periods.length > 0 ? phaseMessages[phase] : messages[Math.floor(Math.random() * messages.length)];
        
        const messageEl = document.getElementById('dailyMessage');
        if (messageEl) {
            messageEl.querySelector('.message-icon').textContent = message.icon;
            messageEl.querySelector('.message-title').textContent = message.title;
            messageEl.querySelector('.message-content').textContent = message.text;
        }
    }

    loadData() {
        const data = localStorage.getItem('periodData');
        return data ? JSON.parse(data) : [];
    }

    saveData() {
        localStorage.setItem('periodData', JSON.stringify(this.periods));
    }

    loadSettings() {
        const settings = localStorage.getItem('periodSettings');
        return settings ? JSON.parse(settings) : {
            cycleLength: 28,
            periodLength: 5,
            reminders: true
        };
    }

    saveSettings() {
        localStorage.setItem('periodSettings', JSON.stringify(this.settings));
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('monthYear');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        calendar.innerHTML = '';
        
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            this.createDayCell(calendar, daysInPrevMonth - i, true, year, month - 1);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            this.createDayCell(calendar, day, false, year, month);
        }

        const remainingCells = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayCell(calendar, day, true, year, month + 1);
        }
    }

    createDayCell(calendar, day, isOtherMonth, year, month) {
        const cell = document.createElement('div');
        cell.className = 'day';
        cell.textContent = day;
        
        if (isOtherMonth) {
            cell.classList.add('other-month');
        }

        const cellDate = new Date(year, month, day);
        const today = new Date();
        
        if (cellDate.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        const dateStr = cellDate.toISOString().split('T')[0];
        
        if (this.isPeriodDay(dateStr)) {
            cell.classList.add('period');
        } else if (this.isPredictedPeriod(dateStr)) {
            cell.classList.add('predicted');
        } else if (this.isFertileWindow(dateStr)) {
            cell.classList.add('fertile');
        }

        cell.addEventListener('click', () => this.handleDayClick(dateStr));
        calendar.appendChild(cell);
    }

    isPeriodDay(dateStr) {
        return this.periods.some(period => {
            const start = new Date(period.start);
            const end = new Date(start);
            end.setDate(end.getDate() + (period.length || this.settings.periodLength));
            const check = new Date(dateStr);
            return check >= start && check < end;
        });
    }

    isPredictedPeriod(dateStr) {
        if (this.periods.length === 0) return false;
        
        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const predicted = new Date(lastPeriod);
        predicted.setDate(predicted.getDate() + this.getAverageCycle());
        
        const check = new Date(dateStr);
        const predictedEnd = new Date(predicted);
        predictedEnd.setDate(predictedEnd.getDate() + this.settings.periodLength);
        
        return check >= predicted && check < predictedEnd;
    }

    isFertileWindow(dateStr) {
        if (this.periods.length === 0) return false;
        
        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const ovulation = new Date(lastPeriod);
        ovulation.setDate(ovulation.getDate() + this.getAverageCycle() - 14);
        
        const fertileStart = new Date(ovulation);
        fertileStart.setDate(fertileStart.getDate() - 5);
        const fertileEnd = new Date(ovulation);
        fertileEnd.setDate(fertileEnd.getDate() + 1);
        
        const check = new Date(dateStr);
        return check >= fertileStart && check <= fertileEnd;
    }

    getAverageCycle() {
        if (this.periods.length < 2) return this.settings.cycleLength;
        
        let total = 0;
        for (let i = 1; i < this.periods.length; i++) {
            const prev = new Date(this.periods[i - 1].start);
            const curr = new Date(this.periods[i].start);
            const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
            total += diff;
        }
        
        return Math.round(total / (this.periods.length - 1));
    }

    updateStats() {
        const currentDayEl = document.getElementById('currentDay');
        const nextPeriodEl = document.getElementById('nextPeriod');
        const avgCycleEl = document.getElementById('avgCycle');
        const progressDay = document.getElementById('progressDay');
        const progressPhase = document.getElementById('progressPhase');
        const progressCircle = document.getElementById('progressCircle');

        if (this.periods.length === 0) {
            currentDayEl.textContent = '-';
            nextPeriodEl.textContent = '-';
            avgCycleEl.textContent = '-';
            if (progressDay) progressDay.textContent = 'Day -';
            if (progressPhase) progressPhase.textContent = 'Start tracking';
            if (progressCircle) progressCircle.style.strokeDashoffset = 534;
            return;
        }

        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const today = new Date();
        const daysSinceStart = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;
        
        currentDayEl.textContent = `Day ${daysSinceStart}`;
        
        const phase = this.getCurrentPhase();
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            card.className = 'stat-card';
        });

        const avgCycle = this.getAverageCycle();
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
        const daysUntil = Math.floor((nextPeriod - today) / (1000 * 60 * 60 * 24));
        
        nextPeriodEl.textContent = daysUntil > 0 ? `${daysUntil} days` : 'Soon';
        avgCycleEl.textContent = `${avgCycle} days`;
        
        // Update progress circle
        if (progressDay) progressDay.textContent = `Day ${daysSinceStart}`;
        if (progressPhase) {
            const phaseNames = {
                menstrual: 'Menstrual',
                follicular: 'Follicular',
                ovulation: 'Ovulation',
                luteal: 'Luteal'
            };
            progressPhase.textContent = phaseNames[phase];
        }
        
        if (progressCircle) {
            const circumference = 534;
            const progress = (daysSinceStart / avgCycle) * circumference;
            progressCircle.style.strokeDashoffset = circumference - progress;
        }
    }

    getCurrentPhase() {
        if (this.periods.length === 0) return 'follicular';
        
        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const today = new Date();
        const daysSinceStart = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;
        const avgCycle = this.getAverageCycle();
        
        if (daysSinceStart <= this.settings.periodLength) {
            return 'menstrual';
        } else if (daysSinceStart <= avgCycle / 2 - 3) {
            return 'follicular';
        } else if (daysSinceStart <= avgCycle / 2 + 3) {
            return 'ovulation';
        } else {
            return 'luteal';
        }
    }

    updateMoodIndicator() {
        const phase = this.getCurrentPhase();
        const moods = {
            menstrual: {
                emoji: '🌙',
                text: 'Rest & Restore',
                description: 'Take it easy, practice self-care',
                gradient: 'linear-gradient(135deg, #ff6b9d 0%, #ff8fab 100%)'
            },
            follicular: {
                emoji: '🌸',
                text: 'Energized & Creative',
                description: 'Great time for new projects',
                gradient: 'linear-gradient(135deg, #ffd93d 0%, #ffe66d 100%)'
            },
            ovulation: {
                emoji: '✨',
                text: 'Peak Energy',
                description: 'You\'re at your strongest',
                gradient: 'linear-gradient(135deg, #6bcf7f 0%, #95e1a5 100%)'
            },
            luteal: {
                emoji: '🌺',
                text: 'Wind Down',
                description: 'Focus on comfort and calm',
                gradient: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)'
            }
        };

        const mood = moods[phase];
        const indicator = document.getElementById('moodIndicator');
        if (indicator) {
            indicator.style.background = mood.gradient;
            indicator.innerHTML = `
                <span class="mood-emoji">${mood.emoji}</span>
                <div class="mood-text">${mood.text}</div>
                <div class="mood-description">${mood.description}</div>
            `;
        }
    }

    updateBodyGradient() {
        const phase = this.getCurrentPhase();
        const isDark = document.body.classList.contains('dark-mode');
        
        const gradients = {
            menstrual: isDark 
                ? 'linear-gradient(135deg, #2d1b3d 0%, #4a2c5a 25%, #5c3d6f 50%, #3d2647 75%, #2d1b3d 100%)'
                : 'linear-gradient(135deg, #ffd1dc 0%, #ffb3c6 25%, #ffc4d6 50%, #ffb3c6 75%, #ffd1dc 100%)',
            follicular: isDark
                ? 'linear-gradient(135deg, #3d2d1b 0%, #5a4a2c 25%, #6f5c3d 50%, #473d26 75%, #3d2d1b 100%)'
                : 'linear-gradient(135deg, #fff4d1 0%, #ffe6b3 25%, #fff0c4 50%, #ffe6b3 75%, #fff4d1 100%)',
            ovulation: isDark
                ? 'linear-gradient(135deg, #1b3d2d 0%, #2c5a4a 25%, #3d6f5c 50%, #26473d 75%, #1b3d2d 100%)'
                : 'linear-gradient(135deg, #d1ffd4 0%, #b3ffc6 25%, #c4ffe0 50%, #b3ffc6 75%, #d1ffd4 100%)',
            luteal: isDark
                ? 'linear-gradient(135deg, #2d1b3d 0%, #4a2c5a 25%, #5c3d6f 50%, #3d2647 75%, #2d1b3d 100%)'
                : 'linear-gradient(135deg, #e0d1ff 0%, #d0b3ff 25%, #e0c4ff 50%, #d0b3ff 75%, #e0d1ff 100%)'
        };
        
        document.body.style.background = gradients[phase];
        document.body.style.backgroundSize = '400% 400%';
    }

    handleDayClick(dateStr) {
        if (this.isPeriodDay(dateStr)) {
            if (confirm('Remove this period day?')) {
                this.removePeriodDay(dateStr);
            }
        } else {
            if (confirm('Log period start on this day?')) {
                this.logPeriod(dateStr);
            }
        }
    }

    logPeriod(dateStr = null) {
        const date = dateStr || new Date().toISOString().split('T')[0];
        this.periods.push({
            start: date,
            length: this.settings.periodLength
        });
        this.periods.sort((a, b) => new Date(a.start) - new Date(b.start));
        this.saveData();
        this.renderCalendar();
        this.updateStats();
        this.updateMoodIndicator();
        this.updateBodyGradient();
    }

    removePeriodDay(dateStr) {
        this.periods = this.periods.filter(period => {
            const start = new Date(period.start);
            const end = new Date(start);
            end.setDate(end.getDate() + period.length);
            const check = new Date(dateStr);
            return !(check >= start && check < end);
        });
        this.saveData();
        this.renderCalendar();
        this.updateStats();
        this.updateMoodIndicator();
        this.updateBodyGradient();
    }

    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('logPeriodBtn').addEventListener('click', () => {
            this.showLogPeriodModal();
        });

        document.getElementById('viewHistoryBtn').addEventListener('click', () => {
            this.showHistoryModal();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('modal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showLogPeriodModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        // Generate year options (current year and 5 years back)
        let yearOptions = '';
        for (let y = currentYear; y >= currentYear - 5; y--) {
            yearOptions += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
        }
        
        // Generate month options
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        let monthOptions = '';
        months.forEach((month, index) => {
            monthOptions += `<option value="${index}" ${index === currentMonth ? 'selected' : ''}>${month}</option>`;
        });
        
        // Generate day options
        let dayOptions = '';
        for (let d = 1; d <= 31; d++) {
            dayOptions += `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`;
        }
        
        modalBody.innerHTML = `
            <h2>Log Period Start</h2>
            <div class="form-group">
                <label>Select Date:</label>
                <div class="date-dropdowns">
                    <select id="periodMonth" class="date-select">
                        ${monthOptions}
                    </select>
                    <select id="periodDay" class="date-select">
                        ${dayOptions}
                    </select>
                    <select id="periodYear" class="date-select">
                        ${yearOptions}
                    </select>
                </div>
            </div>
            <button class="btn btn-primary" id="savePeriod">Save Period</button>
        `;
        
        modal.style.display = 'block';
        
        // Update days when month/year changes
        const monthSelect = document.getElementById('periodMonth');
        const yearSelect = document.getElementById('periodYear');
        const daySelect = document.getElementById('periodDay');
        
        const updateDays = () => {
            const month = parseInt(monthSelect.value);
            const year = parseInt(yearSelect.value);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const currentDay = parseInt(daySelect.value);
            
            daySelect.innerHTML = '';
            for (let d = 1; d <= daysInMonth; d++) {
                const option = document.createElement('option');
                option.value = d;
                option.textContent = d;
                if (d === currentDay && d <= daysInMonth) {
                    option.selected = true;
                }
                daySelect.appendChild(option);
            }
            
            // If current day is greater than days in month, select last day
            if (currentDay > daysInMonth) {
                daySelect.value = daysInMonth;
            }
        };
        
        monthSelect.addEventListener('change', updateDays);
        yearSelect.addEventListener('change', updateDays);
        
        document.getElementById('savePeriod').addEventListener('click', () => {
            const year = document.getElementById('periodYear').value;
            const month = String(parseInt(document.getElementById('periodMonth').value) + 1).padStart(2, '0');
            const day = String(document.getElementById('periodDay').value).padStart(2, '0');
            const date = `${year}-${month}-${day}`;
            this.logPeriod(date);
            modal.style.display = 'none';
        });
    }

    showHistoryModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        let historyHTML = '<h2>Period History</h2><div class="history-list">';
        
        if (this.periods.length === 0) {
            historyHTML += '<p>No periods logged yet.</p>';
        } else {
            this.periods.slice().reverse().forEach((period, index) => {
                const realIndex = this.periods.length - 1 - index;
                historyHTML += `
                    <div class="history-item">
                        <span>${new Date(period.start).toLocaleDateString()}</span>
                        <button class="delete-btn" data-index="${realIndex}">Delete</button>
                    </div>
                `;
            });
        }
        
        historyHTML += '</div>';
        modalBody.innerHTML = historyHTML;
        modal.style.display = 'block';
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.periods.splice(index, 1);
                this.saveData();
                this.renderCalendar();
                this.updateStats();
                this.updateMoodIndicator();
                this.updateBodyGradient();
                this.showHistoryModal();
            });
        });
    }

    showSettingsModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h2>Settings</h2>
            <div class="form-group">
                <label>Average Cycle Length (days):</label>
                <input type="number" id="cycleLength" value="${this.settings.cycleLength}" min="21" max="35">
            </div>
            <div class="form-group">
                <label>Period Length (days):</label>
                <input type="number" id="periodLength" value="${this.settings.periodLength}" min="3" max="7">
            </div>
            <button class="btn btn-primary" id="saveSettings">Save Settings</button>
        `;
        
        modal.style.display = 'block';
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.settings.cycleLength = parseInt(document.getElementById('cycleLength').value);
            this.settings.periodLength = parseInt(document.getElementById('periodLength').value);
            this.saveSettings();
            this.renderCalendar();
            this.updateStats();
            this.updateMoodIndicator();
            this.updateBodyGradient();
            modal.style.display = 'none';
        });
    }

    checkReminders() {
        if (!this.settings.reminders || this.periods.length === 0) return;
        
        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const today = new Date();
        const avgCycle = this.getAverageCycle();
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
        const daysUntil = Math.floor((nextPeriod - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 3 && Notification.permission === 'granted') {
            new Notification('Period Tracker', {
                body: 'Your period is expected in 3 days',
                icon: '🌸'
            });
        }
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

const tracker = new PeriodTracker();

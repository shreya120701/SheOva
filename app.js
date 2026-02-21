// 3D Background Scene
class MinimalScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.orbs = [];
        this.mouse = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0F0524, 0.015);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        const canvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xff6ec7, 1.5, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
        
        this.createParticles();
        this.createOrbs();
        
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll());
        
        this.animate();
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(500 * 3);
        
        for (let i = 0; i < 500; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.03,
            color: 0xff6ec7,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createOrbs() {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        
        for (let i = 0; i < 4; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: [0xff6ec7, 0xc8a2e0, 0xffa8d5, 0xff6ec7][i],
                transparent: true,
                opacity: 0.15,
                shininess: 100
            });
            
            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                -5 - Math.random() * 5
            );
            orb.userData = {
                speed: 0.0005 + Math.random() * 0.001,
                offset: Math.random() * Math.PI * 2
            };
            
            this.orbs.push(orb);
            this.scene.add(orb);
        }
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onScroll() {
        const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
        this.camera.position.z = 5 + scrollPercent * 10;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        if (this.particles) {
            this.particles.rotation.y += 0.0002;
        }
        
        this.orbs.forEach(orb => {
            orb.position.y += Math.sin(time * orb.userData.speed + orb.userData.offset) * 0.01;
            orb.rotation.x += 0.002;
            orb.rotation.y += 0.003;
        });
        
        this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.03;
        this.camera.position.y += (this.mouse.y * 0.3 - this.camera.position.y) * 0.03;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Period Tracker
class PeriodTracker {
    constructor() {
        this.currentDate = new Date();
        this.periods = this.loadData();
        this.settings = this.loadSettings();
        this.scene3D = null;
        this.init();
    }
    
    init() {
        this.scene3D = new MinimalScene();
        
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
            this.initScrollAnimations();
        }
        
        this.updateAllDisplays();
        this.setupEventListeners();
        this.initMiniCalendar();
    }
    
    initScrollAnimations() {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                },
                opacity: 0,
                y: 60,
                duration: 1
            });
        });
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
            periodLength: 5
        };
    }
    
    saveSettings() {
        localStorage.setItem('periodSettings', JSON.stringify(this.settings));
    }
    
    getCurrentPhase() {
        if (this.periods.length === 0) return 'follicular';
        
        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const today = new Date();
        const daysSinceStart = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;
        const avgCycle = this.getAverageCycle();
        
        if (daysSinceStart <= this.settings.periodLength) return 'menstrual';
        else if (daysSinceStart <= avgCycle / 2 - 3) return 'follicular';
        else if (daysSinceStart <= avgCycle / 2 + 3) return 'ovulation';
        else return 'luteal';
    }
    
    getAverageCycle() {
        if (this.periods.length < 2) return this.settings.cycleLength;
        
        let total = 0;
        for (let i = 1; i < this.periods.length; i++) {
            const prev = new Date(this.periods[i - 1].start);
            const curr = new Date(this.periods[i].start);
            total += Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
        }
        
        return Math.round(total / (this.periods.length - 1));
    }

    updateAllDisplays() {
        this.updateStats();
        this.updateMoodAndFood();
        this.updateRings();
    }
    
    updateStats() {
        const currentDayEl = document.getElementById('currentDay');
        const nextPeriodEl = document.getElementById('nextPeriod');
        const avgCycleEl = document.getElementById('avgCycle');

        if (this.periods.length === 0) {
            if (currentDayEl) currentDayEl.textContent = '-';
            if (nextPeriodEl) nextPeriodEl.textContent = '-';
            if (avgCycleEl) avgCycleEl.textContent = '-';
            return;
        }

        const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
        const today = new Date();
        const daysSinceStart = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;
        
        if (currentDayEl) currentDayEl.textContent = `Day ${daysSinceStart}`;
        
        const avgCycle = this.getAverageCycle();
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + avgCycle);
        const daysUntil = Math.floor((nextPeriod - today) / (1000 * 60 * 60 * 24));
        
        if (nextPeriodEl) nextPeriodEl.textContent = daysUntil > 0 ? `${daysUntil} days` : 'Soon';
        if (avgCycleEl) avgCycleEl.textContent = `${avgCycle} days`;
    }
    
    updateRings() {
        const phase = this.getCurrentPhase();
        const phaseNames = {
            menstrual: 'Menstrual',
            follicular: 'Follicular',
            ovulation: 'Ovulation',
            luteal: 'Luteal'
        };
        
        if (this.periods.length > 0) {
            const lastPeriod = new Date(this.periods[this.periods.length - 1].start);
            const today = new Date();
            const daysSinceStart = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;
            const avgCycle = this.getAverageCycle();
            
            const heroDay = document.getElementById('heroDay');
            const heroPhase = document.getElementById('heroPhase');
            const mainDay = document.getElementById('mainDay');
            const mainPhase = document.getElementById('mainPhase');
            const heroRing = document.getElementById('heroRing');
            const mainRing = document.getElementById('mainRing');
            
            if (heroDay) heroDay.textContent = `Day ${daysSinceStart}`;
            if (heroPhase) heroPhase.textContent = phaseNames[phase];
            if (mainDay) mainDay.textContent = `Day ${daysSinceStart}`;
            if (mainPhase) mainPhase.textContent = phaseNames[phase];
            
            const progress = (daysSinceStart / avgCycle);
            const circumference = 502;
            const mainCircumference = 754;
            
            if (heroRing) {
                heroRing.style.strokeDashoffset = circumference - (progress * circumference);
            }
            if (mainRing) {
                mainRing.style.strokeDashoffset = mainCircumference - (progress * mainCircumference);
            }
        }
    }
    
    updateMoodAndFood() {
        const phase = this.getCurrentPhase();
        const data = {
            menstrual: {
                emoji: '🌙',
                title: 'Rest & Restore',
                desc: 'Take it easy, practice self-care',
                affirmation: 'Your body is doing incredible work. Rest is productive.',
                foods: [
                    { emoji: '🍫', name: 'Dark Chocolate', benefit: 'Boosts mood' },
                    { emoji: '🥬', name: 'Leafy Greens', benefit: 'Iron-rich' },
                    { emoji: '🍌', name: 'Bananas', benefit: 'Reduces cramps' },
                    { emoji: '🥜', name: 'Nuts & Seeds', benefit: 'Magnesium' }
                ]
            },
            follicular: {
                emoji: '🌸',
                title: 'Energized & Creative',
                desc: 'Great time for new projects',
                affirmation: 'You are full of potential and creative energy.',
                foods: [
                    { emoji: '🥑', name: 'Avocado', benefit: 'Healthy fats' },
                    { emoji: '🥚', name: 'Eggs', benefit: 'Protein boost' },
                    { emoji: '🥗', name: 'Fresh Salads', benefit: 'Light & energizing' },
                    { emoji: '🍊', name: 'Citrus Fruits', benefit: 'Vitamin C' }
                ]
            },
            ovulation: {
                emoji: '✨',
                title: 'Peak Energy',
                desc: 'You\'re at your strongest',
                affirmation: 'You are powerful, confident, and unstoppable.',
                foods: [
                    { emoji: '🐟', name: 'Salmon', benefit: 'Omega-3' },
                    { emoji: '🍓', name: 'Strawberries', benefit: 'Antioxidants' },
                    { emoji: '🥒', name: 'Cucumber', benefit: 'Hydrating' },
                    { emoji: '🍉', name: 'Watermelon', benefit: 'Refreshing' }
                ]
            },
            luteal: {
                emoji: '🌺',
                title: 'Wind Down',
                desc: 'Focus on comfort and calm',
                affirmation: 'You deserve comfort, rest, and gentle care.',
                foods: [
                    { emoji: '🍠', name: 'Sweet Potato', benefit: 'Complex carbs' },
                    { emoji: '🥛', name: 'Yogurt', benefit: 'Calcium' },
                    { emoji: '🍗', name: 'Chicken', benefit: 'Lean protein' },
                    { emoji: '🥔', name: 'Potatoes', benefit: 'Comfort food' }
                ]
            }
        };
        
        const current = data[phase];
        
        const moodIcon = document.querySelector('.mood-icon');
        const moodTitle = document.querySelector('.mood-title');
        const moodDesc = document.querySelector('.mood-desc');
        const affirmationText = document.querySelector('.affirmation-text');
        
        if (moodIcon) moodIcon.textContent = current.emoji;
        if (moodTitle) moodTitle.textContent = current.title;
        if (moodDesc) moodDesc.textContent = current.desc;
        if (affirmationText) affirmationText.textContent = current.affirmation;
        
        const foodCards = document.getElementById('foodCards');
        if (foodCards) {
            foodCards.innerHTML = '';
            current.foods.forEach(food => {
                const card = document.createElement('div');
                card.className = 'food-card';
                card.innerHTML = `
                    <div class="food-image">${food.emoji}</div>
                    <h3 class="food-name">${food.name}</h3>
                    <p class="food-benefit">${food.benefit}</p>
                `;
                foodCards.appendChild(card);
            });
        }
    }
    
    initMiniCalendar() {
        const calendarMini = document.getElementById('calendarMini');
        if (!calendarMini) return;
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'mini-day';
            cell.textContent = day;
            
            const dateStr = new Date(year, month, day).toISOString().split('T')[0];
            
            if (this.isPeriodDay(dateStr)) {
                cell.classList.add('period');
            } else if (this.isFertileWindow(dateStr)) {
                cell.classList.add('fertile');
            }
            
            calendarMini.appendChild(cell);
        }
    }
    
    isPeriodDay(dateStr) {
        return this.periods.some(period => {
            const start = new Date(period.start);
            const end = new Date(start);
            end.setDate(end.getDate() + this.settings.periodLength);
            const check = new Date(dateStr);
            return check >= start && check < end;
        });
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

    setupEventListeners() {
        const startJourney = document.getElementById('startJourney');
        const getStarted = document.getElementById('getStarted');
        const themeToggle = document.getElementById('themeToggle');
        const modalClose = document.getElementById('modalClose');
        const modal = document.getElementById('modal');
        
        if (startJourney) {
            startJourney.addEventListener('click', () => this.showLogPeriodModal());
        }
        
        if (getStarted) {
            getStarted.addEventListener('click', () => this.showLogPeriodModal());
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
            });
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    }
    
    showLogPeriodModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        let yearOptions = '';
        for (let y = currentYear; y >= currentYear - 5; y--) {
            yearOptions += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
        }
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        let monthOptions = '';
        months.forEach((month, index) => {
            monthOptions += `<option value="${index}" ${index === currentMonth ? 'selected' : ''}>${month}</option>`;
        });
        
        let dayOptions = '';
        for (let d = 1; d <= 31; d++) {
            dayOptions += `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`;
        }
        
        modalBody.innerHTML = `
            <h2>Log Period Start</h2>
            <div class="form-group">
                <label>Select Date</label>
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
            <button class="cta-primary" id="savePeriod" style="width: 100%;">Save Period</button>
        `;
        
        modal.style.display = 'flex';
        
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
                if (d === currentDay && d <= daysInMonth) option.selected = true;
                daySelect.appendChild(option);
            }
            
            if (currentDay > daysInMonth) daySelect.value = daysInMonth;
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
    
    logPeriod(dateStr) {
        const date = dateStr || new Date().toISOString().split('T')[0];
        this.periods.push({
            start: date,
            length: this.settings.periodLength
        });
        this.periods.sort((a, b) => new Date(a.start) - new Date(b.start));
        this.saveData();
        this.updateAllDisplays();
        this.initMiniCalendar();
    }
}

// Initialize
const tracker = new PeriodTracker();

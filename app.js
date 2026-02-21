// 3D Scene Manager
class Scene3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.blobs = [];
        this.spheres = [];
        this.particles = null;
        this.mouse = { x: 0, y: 0 };
        this.targetCameraZ = 5;
        this.currentSection = 0;
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0015, 0.02);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Renderer
        const canvas = document.getElementById('webgl-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        const pointLight1 = new THREE.PointLight(0xff6ec7, 2, 100);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xc8a2e0, 2, 100);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
        
        // Create 3D elements
        this.createBlobs();
        this.createSpheres();
        this.createParticles();
        
        // Event listeners
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('scroll', () => this.onScroll());
        
        // Start animation
        this.animate();
    }
    
    createBlobs() {
        const blobGeometry = new THREE.IcosahedronGeometry(1.5, 4);
        
        const positions = [
            { x: -3, y: 2, z: -5 },
            { x: 4, y: -2, z: -8 },
            { x: -2, y: -3, z: -10 },
            { x: 3, y: 3, z: -12 }
        ];
        
        positions.forEach((pos, i) => {
            const material = new THREE.MeshPhongMaterial({
                color: [0xff6ec7, 0xc8a2e0, 0xff9a9e, 0xe8b4b8][i],
                transparent: true,
                opacity: 0.3,
                shininess: 100,
                emissive: [0xff6ec7, 0xc8a2e0, 0xff9a9e, 0xe8b4b8][i],
                emissiveIntensity: 0.2
            });
            
            const blob = new THREE.Mesh(blobGeometry, material);
            blob.position.set(pos.x, pos.y, pos.z);
            blob.userData = { 
                originalPos: { ...pos },
                speed: 0.001 + Math.random() * 0.002,
                offset: Math.random() * Math.PI * 2
            };
            
            this.blobs.push(blob);
            this.scene.add(blob);
        });
    }
    
    createSpheres() {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        
        for (let i = 0; i < 8; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.15,
                shininess: 100,
                emissive: 0xff6ec7,
                emissiveIntensity: 0.3
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                -5 - Math.random() * 10
            );
            sphere.userData = {
                speed: 0.0005 + Math.random() * 0.001,
                offset: Math.random() * Math.PI * 2
            };
            
            this.spheres.push(sphere);
            this.scene.add(sphere);
        }
    }

    createParticles() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color1 = new THREE.Color(0xff6ec7);
        const color2 = new THREE.Color(0xc8a2e0);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
            
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
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
        this.targetCameraZ = 5 + scrollPercent * 15;
        
        // Update scroll progress bar
        const progress = document.getElementById('scrollProgress');
        if (progress) {
            progress.style.width = (scrollPercent * 100) + '%';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        
        // Animate blobs
        this.blobs.forEach((blob, i) => {
            const userData = blob.userData;
            blob.position.y = userData.originalPos.y + Math.sin(time * userData.speed + userData.offset) * 0.5;
            blob.position.x = userData.originalPos.x + Math.cos(time * userData.speed + userData.offset) * 0.3;
            blob.rotation.x += 0.001;
            blob.rotation.y += 0.002;
            
            // Morph effect
            const scale = 1 + Math.sin(time * userData.speed * 2) * 0.1;
            blob.scale.set(scale, scale, scale);
        });
        
        // Animate spheres
        this.spheres.forEach(sphere => {
            sphere.position.y += Math.sin(time * sphere.userData.speed + sphere.userData.offset) * 0.01;
            sphere.rotation.x += 0.005;
            sphere.rotation.y += 0.005;
        });
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.0002;
            this.particles.rotation.x = Math.sin(time * 0.1) * 0.1;
        }
        
        // Camera parallax
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.05;
        this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.05;
        
        // Camera drift
        this.camera.position.x += Math.sin(time * 0.1) * 0.002;
        this.camera.position.y += Math.cos(time * 0.15) * 0.002;
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Period Tracker Class
class PeriodTracker {
    constructor() {
        this.currentDate = new Date();
        this.periods = this.loadData();
        this.settings = this.loadSettings();
        this.scene3D = null;
        this.init();
    }
    
    init() {
        // Hide loading screen after a delay
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 2000);
        
        // Initialize 3D scene
        this.scene3D = new Scene3D();
        
        // Initialize GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
            gsap.registerPlugin(ScrollTrigger);
            this.initScrollAnimations();
        }
        
        // Initialize app
        this.renderCalendar();
        this.updateStats();
        this.updateMoodIndicator();
        this.setupEventListeners();
        this.updateDailyMessage();
        
        // Dark mode
        const darkModeToggle = document.getElementById('darkModeToggle');
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
        }
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
            });
        }
    }
    
    initScrollAnimations() {
        const sections = document.querySelectorAll('.section');
        
        sections.forEach((section, index) => {
            gsap.from(section.querySelector('.glass-card'), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1,
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 100,
                scale: 0.9,
                duration: 1,
                ease: 'power2.out'
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
            periodLength: 5,
            reminders: true
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
        const ringDay = document.getElementById('ringDay');
        const ringPhase = document.getElementById('ringPhase');

        if (this.periods.length === 0) {
            if (currentDayEl) currentDayEl.textContent = '-';
            if (nextPeriodEl) nextPeriodEl.textContent = '-';
            if (avgCycleEl) avgCycleEl.textContent = '-';
            if (ringDay) ringDay.textContent = 'Day -';
            if (ringPhase) ringPhase.textContent = 'Start tracking';
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
        
        const phase = this.getCurrentPhase();
        const phaseNames = {
            menstrual: 'Menstrual',
            follicular: 'Follicular',
            ovulation: 'Ovulation',
            luteal: 'Luteal'
        };
        
        if (ringDay) ringDay.textContent = `Day ${daysSinceStart}`;
        if (ringPhase) ringPhase.textContent = phaseNames[phase];
    }
    
    updateMoodIndicator() {
        const phase = this.getCurrentPhase();
        const moods = {
            menstrual: {
                emoji: '🌙',
                text: 'Rest & Restore',
                description: 'Take it easy, practice self-care',
                foods: [
                    { emoji: '🍫', name: 'Dark Chocolate', benefit: 'Boosts mood' },
                    { emoji: '🥬', name: 'Leafy Greens', benefit: 'Iron-rich' },
                    { emoji: '🍌', name: 'Bananas', benefit: 'Reduces cramps' },
                    { emoji: '🥜', name: 'Nuts & Seeds', benefit: 'Magnesium' },
                    { emoji: '🫐', name: 'Berries', benefit: 'Antioxidants' },
                    { emoji: '🍵', name: 'Ginger Tea', benefit: 'Anti-inflammatory' }
                ]
            },
            follicular: {
                emoji: '🌸',
                text: 'Energized & Creative',
                description: 'Great time for new projects',
                foods: [
                    { emoji: '🥑', name: 'Avocado', benefit: 'Healthy fats' },
                    { emoji: '🥚', name: 'Eggs', benefit: 'Protein boost' },
                    { emoji: '🥗', name: 'Fresh Salads', benefit: 'Light & energizing' },
                    { emoji: '🍊', name: 'Citrus Fruits', benefit: 'Vitamin C' },
                    { emoji: '🌰', name: 'Almonds', benefit: 'Energy' },
                    { emoji: '🥦', name: 'Broccoli', benefit: 'Fiber-rich' }
                ]
            },
            ovulation: {
                emoji: '✨',
                text: 'Peak Energy',
                description: 'You\'re at your strongest',
                foods: [
                    { emoji: '🐟', name: 'Salmon', benefit: 'Omega-3' },
                    { emoji: '🍓', name: 'Strawberries', benefit: 'Antioxidants' },
                    { emoji: '🥒', name: 'Cucumber', benefit: 'Hydrating' },
                    { emoji: '🍉', name: 'Watermelon', benefit: 'Refreshing' },
                    { emoji: '🥕', name: 'Carrots', benefit: 'Beta-carotene' },
                    { emoji: '🫑', name: 'Bell Peppers', benefit: 'Vitamin C' }
                ]
            },
            luteal: {
                emoji: '🌺',
                text: 'Wind Down',
                description: 'Focus on comfort and calm',
                foods: [
                    { emoji: '🍠', name: 'Sweet Potato', benefit: 'Complex carbs' },
                    { emoji: '🥛', name: 'Yogurt', benefit: 'Calcium' },
                    { emoji: '🍗', name: 'Chicken', benefit: 'Lean protein' },
                    { emoji: '🥔', name: 'Potatoes', benefit: 'Comfort food' },
                    { emoji: '🌾', name: 'Whole Grains', benefit: 'Fiber' },
                    { emoji: '🍯', name: 'Honey', benefit: 'Natural sweetness' }
                ]
            }
        };

        const mood = moods[phase];
        const indicator = document.getElementById('moodIndicator');
        if (indicator) {
            const emoji = indicator.querySelector('.mood-emoji-3d');
            const text = indicator.querySelector('.mood-text');
            const desc = indicator.querySelector('.mood-desc');
            
            if (emoji) emoji.textContent = mood.emoji;
            if (text) text.textContent = mood.text;
            if (desc) desc.textContent = mood.description;
        }
        
        // Update food suggestions
        this.updateFoodSuggestions(mood.foods);
    }
    
    updateFoodSuggestions(foods) {
        const foodGrid = document.getElementById('foodGrid');
        if (!foodGrid) return;
        
        foodGrid.innerHTML = '';
        
        foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <span class="food-emoji">${food.emoji}</span>
                <span class="food-name">${food.name}</span>
                <span class="food-benefit">${food.benefit}</span>
            `;
            foodGrid.appendChild(foodItem);
        });
    }
    
    updateDailyMessage() {
        const messages = [
            { icon: '✨', title: "Today's Affirmation", text: "You are strong, capable, and in tune with your body." },
            { icon: '💫', title: "Gentle Reminder", text: "Listen to your body. Rest when you need to, move when you can." },
            { icon: '🌟', title: "You've Got This", text: "Every cycle is a reminder of your body's incredible wisdom." },
            { icon: '💖', title: "Self-Care Moment", text: "Be kind to yourself today. You deserve all the love you give." },
            { icon: '🦋', title: "Daily Wisdom", text: "Your body is doing amazing things. Honor its rhythm." }
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        const icon = document.getElementById('messageIcon');
        const title = document.querySelector('.message-title');
        const text = document.getElementById('messageText');
        
        if (icon) icon.textContent = message.icon;
        if (title) title.textContent = message.title;
        if (text) text.textContent = message.text;
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const monthYear = document.getElementById('monthYear');
        
        if (!calendar || !monthYear) return;
        
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
    }

    setupEventListeners() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const logPeriodBtn = document.getElementById('logPeriodBtn');
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const modalClose = document.getElementById('modalClose');
        const modal = document.getElementById('modal');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        if (logPeriodBtn) {
            logPeriodBtn.addEventListener('click', () => this.showLogPeriodModal());
        }

        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.showHistoryModal());
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettingsModal());
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
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
            <button class="action-orb primary-orb" id="savePeriod" style="width: 100%;">
                <span class="orb-text">Save Period</span>
            </button>
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
                if (d === currentDay && d <= daysInMonth) {
                    option.selected = true;
                }
                daySelect.appendChild(option);
            }
            
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
        
        if (!modal || !modalBody) return;
        
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
        modal.style.display = 'flex';
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.periods.splice(index, 1);
                this.saveData();
                this.renderCalendar();
                this.updateStats();
                this.updateMoodIndicator();
                this.showHistoryModal();
            });
        });
    }

    showSettingsModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;
        
        modalBody.innerHTML = `
            <h2>Settings</h2>
            <div class="form-group">
                <label>Average Cycle Length (days):</label>
                <input type="number" id="cycleLength" class="date-select" value="${this.settings.cycleLength}" min="21" max="35">
            </div>
            <div class="form-group">
                <label>Period Length (days):</label>
                <input type="number" id="periodLength" class="date-select" value="${this.settings.periodLength}" min="3" max="7">
            </div>
            <button class="action-orb primary-orb" id="saveSettings" style="width: 100%;">
                <span class="orb-text">Save Settings</span>
            </button>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.settings.cycleLength = parseInt(document.getElementById('cycleLength').value);
            this.settings.periodLength = parseInt(document.getElementById('periodLength').value);
            this.saveSettings();
            this.renderCalendar();
            this.updateStats();
            this.updateMoodIndicator();
            modal.style.display = 'none';
        });
    }
}

// Initialize app
const tracker = new PeriodTracker();

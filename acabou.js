// Sistema de Filtros F1 - Versão Melhorada
class F1PilotSystem {
    constructor() {
        this.pilots = [];
        this.currentFilter = 'all';
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.loadPilots();
        this.setupEventListeners();
        this.createFilterButtons();
        this.setupScrollAnimations();
        this.setupTypewriterEffect();
        this.startBackgroundAnimations();
    }

    loadPilots() {
        // Carrega pilotos do DOM
        const pilotCards = document.querySelectorAll('.pilot-card');
        pilotCards.forEach(card => {
            const pilot = {
                element: card,
                name: card.querySelector('.pilot-name')?.textContent || '',
                category: card.dataset.category || 'current',
                championships: parseInt(card.querySelector('.stat-value')?.textContent) || 0,
                country: card.querySelector('.pilot-country')?.textContent || '',
                visible: true
            };
            this.pilots.push(pilot);
        });
    }

    createFilterButtons() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            if (section.querySelector('.pilots-grid')) {
                const filterContainer = document.createElement('div');
                filterContainer.className = 'filter-buttons';
                filterContainer.innerHTML = `
                    <button class="filter-btn active" data-filter="all">🏎️ Todos</button>
                    <button class="filter-btn" data-filter="legend">⭐ Lendas</button>
                    <button class="filter-btn" data-filter="current">🏁 Atuais</button>
                    <button class="filter-btn" data-filter="champions">🏆 Campeões</button>
                `;
                section.insertBefore(filterContainer, section.querySelector('.pilots-grid'));
                
                // Adiciona eventos aos botões
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.handleFilterClick(e));
                });
            }
        });
    }

    handleFilterClick(event) {
        if (this.isAnimating) return;

        const button = event.target;
        const filter = button.dataset.filter;
        
        // Atualiza botões ativos
        button.parentElement.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        this.filterPilots(filter);
    }

    async filterPilots(filter) {
        this.isAnimating = true;
        this.currentFilter = filter;

        // Animação de saída
        const visiblePilots = this.pilots.filter(pilot => pilot.visible);
        await this.animateOut(visiblePilots);

        // Aplica filtro
        this.pilots.forEach(pilot => {
            pilot.visible = this.shouldShowPilot(pilot, filter);
            pilot.element.style.display = pilot.visible ? 'block' : 'none';
        });

        // Animação de entrada
        const newVisiblePilots = this.pilots.filter(pilot => pilot.visible);
        await this.animateIn(newVisiblePilots);

        this.isAnimating = false;
        this.updateStats();
    }

    shouldShowPilot(pilot, filter) {
        switch (filter) {
            case 'all':
                return true;
            case 'legend':
                return pilot.category === 'legend';
            case 'current':
                return pilot.category === 'current';
            case 'champions':
                return pilot.championships > 0;
            default:
                return true;
        }
    }

    async animateOut(pilots) {
        return new Promise(resolve => {
            pilots.forEach((pilot, index) => {
                setTimeout(() => {
                    pilot.element.style.transform = 'translateY(50px) scale(0.8)';
                    pilot.element.style.opacity = '0';
                    
                    if (index === pilots.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, index * 50);
            });
        });
    }

    async animateIn(pilots) {
        return new Promise(resolve => {
            pilots.forEach((pilot, index) => {
                setTimeout(() => {
                    pilot.element.style.transform = 'translateY(0) scale(1)';
                    pilot.element.style.opacity = '1';
                    
                    if (index === pilots.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, index * 100);
            });
        });
    }

    updateStats() {
        const visibleCount = this.pilots.filter(pilot => pilot.visible).length;
        const totalChampionships = this.pilots
            .filter(pilot => pilot.visible)
            .reduce((sum, pilot) => sum + pilot.championships, 0);

        // Atualiza contador se existir
        this.updateCounter(visibleCount, totalChampionships);
    }

    updateCounter(count, championships) {
        let counterElement = document.querySelector('.pilot-counter');
        if (!counterElement) {
            counterElement = document.createElement('div');
            counterElement.className = 'pilot-counter';
            counterElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 107, 107, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 1000;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(counterElement);
        }
        
        counterElement.innerHTML = `
            <div>🏎️ ${count} Pilotos</div>
            <div>🏆 ${championships} Títulos</div>
        `;
    }

    setupEventListeners() {
        // Navegação suave
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    this.smoothScrollTo(targetId);
                }
            });
        });

        // Hover effects nos cards
        document.querySelectorAll('.pilot-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleCardHover(card, false));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigateFilter(-1);
            if (e.key === 'ArrowRight') this.navigateFilter(1);
        });
    }

    handleCardHover(card, isHovering) {
        const stats = card.querySelectorAll('.stat');
        stats.forEach((stat, index) => {
            if (isHovering) {
                setTimeout(() => {
                    stat.style.transform = 'translateY(-5px) scale(1.05)';
                }, index * 50);
            } else {
                stat.style.transform = 'translateY(0) scale(1)';
            }
        });
    }

    navigateFilter(direction) {
        const activeButton = document.querySelector('.filter-btn.active');
        if (!activeButton) return;

        const buttons = Array.from(activeButton.parentElement.querySelectorAll('.filter-btn'));
        const currentIndex = buttons.indexOf(activeButton);
        const newIndex = (currentIndex + direction + buttons.length) % buttons.length;
        
        buttons[newIndex].click();
    }

    smoothScrollTo(targetId) {
        const target = document.querySelector(targetId);
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animação especial para cards
                    if (entry.target.classList.contains('pilot-card')) {
                        const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                        setTimeout(() => {
                            entry.target.style.transform = 'translateY(0) scale(1)';
                            entry.target.style.opacity = '1';
                        }, delay);
                    }
                }
            });
        }, observerOptions);

        // Observa seções e cards
        document.querySelectorAll('.section, .pilot-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupTypewriterEffect() {
        const title = document.querySelector('h1');
        if (title) {
            const text = title.textContent;
            title.textContent = '';
            title.style.opacity = '1';
            
            let index = 0;
            const typeInterval = setInterval(() => {
                title.textContent += text[index];
                index++;
                
                if (index >= text.length) {
                    clearInterval(typeInterval);
                    this.addTitleEffects();
                }
            }, 100);
        }
    }

    addTitleEffects() {
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('mouseenter', () => {
                title.style.transform = 'scale(1.05)';
                title.style.textShadow = '0 0 50px rgba(255, 107, 107, 0.8)';
            });
            
            title.addEventListener('mouseleave', () => {
                title.style.transform = 'scale(1)';
                title.style.textShadow = '0 0 30px rgba(255, 107, 107, 0.5)';
            });
        }
    }

    startBackgroundAnimations() {
        // Partículas flutuantes
        this.createFloatingParticles();
        
        // Animação de fundo pulsante
        setInterval(() => {
            document.body.style.setProperty('--pulse-opacity', Math.random() * 0.3 + 0.2);
        }, 3000);
    }

    createFloatingParticles() {
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = "floating-particle";
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(255, 107, 107, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                animation: float ${5 + Math.random() * 5}s linear infinite;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            this.animateParticle(particle);
        }
        
        // Adiciona CSS para animação das partículas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) scale(0);
                    opacity: 0;
                }
                10% {
                    opacity: 0.8;
                }
                90% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(-100px) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    animateParticle(particle) {
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        setTimeout(() => {
            this.animateParticle(particle);
        }, (5 + Math.random() * 5) * 1000);
    }

    // Método para busca de pilotos
    searchPilots(query) {
        const results = this.pilots.filter(pilot =>
            pilot.name.toLowerCase().includes(query.toLowerCase()) ||
            pilot.country.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displaySearchResults(results);
        return results;
    }

    displaySearchResults(results) {
        this.pilots.forEach(pilot => {
            pilot.visible = results.includes(pilot);
            pilot.element.style.display = pilot.visible ? 'block' : 'none';
        });
        
        this.updateStats();
    }

    // Método para estatísticas avançadas
    getStatistics() {
        const stats = {
            total: this.pilots.length,
            legends: this.pilots.filter(p => p.category === 'legend').length,
            current: this.pilots.filter(p => p.category === 'current').length,
            champions: this.pilots.filter(p => p.championships > 0).length,
            totalChampionships: this.pilots.reduce((sum, p) => sum + p.championships, 0)
        };
        
        return stats;
    }
}

// Classe para efeitos especiais
class F1SpecialEffects {
    constructor() {
        this.setup();
    }

    setup() {
        // Adicione aqui a lógica para configurar efeitos especiais
        console.log("Efeitos especiais configurados.");
    }
}

// Inicializa o sistema de pilotos
document.addEventListener('DOMContentLoaded', () => {
    const f1PilotSystem = new F1PilotSystem();
});
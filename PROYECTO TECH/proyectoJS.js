/* =========================================================
   CLASE 1: SISTEMA DE AUTENTICACIÓN (LOGIN/REGISTRO)
   ========================================================= */
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('solarUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        // Control de vistas
        if (this.currentUser) {
            this.showMainContent();
        } else {
            this.showWelcomeScreen();
        }

        // Listeners
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if(loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        if(registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        document.addEventListener('click', (e) => {
            if(e.target && (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn'))) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            this.safeHideModal('loginModal');
            e.target.reset();
        } else {
            alert('Credenciales incorrectas');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (password !== confirm) return alert('Las contraseñas no coinciden');
        if (this.users.find(u => u.email === email)) return alert('El correo ya existe');

        const newUser = { firstName, email, password };
        this.users.push(newUser);
        localStorage.setItem('solarUsers', JSON.stringify(this.users));
        this.setCurrentUser(newUser);
        this.safeHideModal('registerModal');
        e.target.reset();
        alert('Cuenta creada con éxito');
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showMainContent();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showWelcomeScreen();
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('d-none');
        document.getElementById('mainContent').classList.add('d-none');
    }

    showMainContent() {
        document.getElementById('welcomeScreen').classList.add('d-none');
        document.getElementById('mainContent').classList.remove('d-none');
        if(document.getElementById('userName')) {
            document.getElementById('userName').textContent = this.currentUser.firstName;
        }
    }

    safeHideModal(modalId) {
        const el = document.getElementById(modalId);
        if (el) {
            const modal = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
            modal.hide();
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                document.body.classList.remove('modal-open');
                document.body.style = '';
            }, 300);
        }
    }
}

/* =========================================================
   CLASE 2: GESTOR DE DATOS, CALCULADORA Y DASHBOARD DINÁMICO
   ========================================================= */
class EnergyManager {
    constructor() {
        this.energyData = this.generateDataset();
        // Almacenamos las instancias de los gráficos para actualizarlos luego
        this.charts = {
            bar: null,
            pie: null,
            line: null,
            area: null
        };
        this.init();
    }

    init() {
        this.renderTable();
        this.initCalculator();
        // Renderizado inicial (Datos globales por defecto)
        setTimeout(() => this.renderInitialDashboard(), 500);
    }

    generateDataset() {
        const data = [];
        for (let year = 1965; year <= 2022; year++) {
            const diff = year - 1965;
            // Simulación matemática de crecimiento
            const solar = year < 1990 ? 0 : Math.round(Math.pow(year - 1990, 2.1) * 0.4);
            const wind = year < 1985 ? 0 : Math.round(Math.pow(year - 1985, 2.2) * 0.35);
            const hydro = 2000 + (diff * 45);
            const biofuel = year < 2000 ? 50 : 50 + (Math.pow(year - 2000, 1.8) * 2);
            const geothermal = 30 + (diff * 2);

            const totalRenewable = solar + wind + hydro + biofuel + geothermal;
            const conventional = 12000 + (diff * 120); 
            const totalGeneration = totalRenewable + conventional;
            const percentage = ((totalRenewable / totalGeneration) * 100).toFixed(2);

            data.push({
                year, solar, wind, hydro, biofuel, geothermal,
                totalRenewable, conventional, totalGeneration, percentage
            });
        }
        return data.reverse();
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;

        tbody.innerHTML = this.energyData.map(row => `
            <tr>
                <td class="fw-bold">${row.year}</td>
                <td>${row.solar}</td>
                <td>${row.wind}</td>
                <td>${row.hydro}</td>
                <td>${(row.biofuel + row.geothermal).toFixed(0)}</td>
                <td class="text-success fw-bold">${(row.totalRenewable).toFixed(0)}</td>
                <td class="text-muted">${(row.conventional).toFixed(0)}</td>
                <td><span class="badge bg-${row.percentage > 20 ? 'success' : 'warning'}">${row.percentage}%</span></td>
            </tr>
        `).join('');
    }

    initCalculator() {
        const form = document.getElementById('calculatorForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const userKwh = parseFloat(document.getElementById('userConsumption').value);
            
            if (isNaN(userKwh) || userKwh <= 0) {
                alert("Por favor ingresa un consumo válido");
                return;
            }

            // 1. Cálculos Numéricos
            const latest = this.energyData[0]; // Datos 2022
            const proportion = latest.totalRenewable / latest.totalGeneration;
            const cleanKwh = (userKwh * proportion).toFixed(2);

            // Mostrar Tarjeta de Resultados
            document.getElementById('resultCard').classList.remove('d-none');
            document.getElementById('globalPercentVal').textContent = latest.percentage + "%";
            document.getElementById('globalCapacityVal').textContent = latest.totalRenewable.toFixed(0) + " TWh";
            document.getElementById('userInputVal').textContent = userKwh;
            document.getElementById('userRenewableVal').textContent = cleanKwh;

            // 2. ACTUALIZAR EL DASHBOARD CON LOS DATOS DEL USUARIO
            this.updateDashboardWithUserData(userKwh);
            
            // Hacer scroll suave hacia el dashboard
            document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- RENDERIZADO INICIAL (GLOBAL) ---
    renderInitialDashboard() {
        if (!document.getElementById('barChart')) return;

        const latest = this.energyData[0]; // Datos Globales 2022
        const historic = [...this.energyData].reverse();
        const years = historic.map(d => d.year);

        // A. Gráfico de Barras: Producción Global
        const ctxBar = document.getElementById('barChart').getContext('2d');
        this.charts.bar = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Biocombustibles', 'Geotérmica'],
                datasets: [{
                    label: 'Global (TWh)',
                    data: [latest.wind, latest.solar, latest.hydro, latest.biofuel, latest.geothermal],
                    backgroundColor: ['#42A5F5', '#FFA726', '#26C6DA', '#66BB6A', '#AB47BC']
                }]
            },
            options: { responsive: true, plugins: { title: { display: true, text: 'Contexto Global (TWh)' } } }
        });

        // B. Gráfico de Torta: Participación Global
        const ctxPie = document.getElementById('pieChart').getContext('2d');
        this.charts.pie = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Otros'],
                datasets: [{
                    data: [latest.wind, latest.solar, latest.hydro, (latest.biofuel + latest.geothermal)],
                    backgroundColor: ['#42A5F5', '#FFA726', '#26C6DA', '#AB47BC']
                }]
            },
            options: { plugins: { title: { display: true, text: 'Mix Energético Global' } } }
        });

        // C. Gráfico de Líneas: Histórico (Este no cambia con el usuario, es contexto)
        const ctxLine = document.getElementById('lineChart').getContext('2d');
        this.charts.line = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'Renovable (TWh)', data: historic.map(d => d.totalRenewable), borderColor: '#26C6DA', tension: 0.3 },
                    { label: 'Solar (TWh)', data: historic.map(d => d.solar), borderColor: '#FFA726', tension: 0.3 }
                ]
            },
            options: { responsive: true, elements: { point: { radius: 0 } }, plugins: { title: { display: true, text: 'Evolución Histórica Global' } } }
        });

        // D. Gráfico de Área: Inicialmente Global
        const ctxArea = document.getElementById('areaChart').getContext('2d');
        this.charts.area = new Chart(ctxArea, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'Renovable', data: historic.map(d => d.totalRenewable), borderColor: '#66BB6A', backgroundColor: 'rgba(102, 187, 106, 0.5)', fill: true },
                    { label: 'Convencional', data: historic.map(d => d.conventional), borderColor: '#78909C', backgroundColor: 'rgba(120, 144, 156, 0.5)', fill: true }
                ]
            },
            options: { responsive: true, elements: { point: { radius: 0 } }, scales: { y: { stacked: true } }, plugins: { title: { display: true, text: 'Comparativa Histórica Global' } } }
        });
    }

    // --- ACTUALIZACIÓN DINÁMICA (CUANDO EL USUARIO CALCULA) ---
    updateDashboardWithUserData(userKwh) {
        const latest = this.energyData[0]; // Datos base para sacar proporciones
        
        // Calcular factores de proporción global
        const totalGen = latest.totalGeneration;
        const ratios = {
            wind: latest.wind / totalGen,
            solar: latest.solar / totalGen,
            hydro: latest.hydro / totalGen,
            bioGeo: (latest.biofuel + latest.geothermal) / totalGen,
            conventional: latest.conventional / totalGen
        };

        // Aplicar proporciones al consumo del usuario
        const userVals = {
            wind: (userKwh * ratios.wind).toFixed(1),
            solar: (userKwh * ratios.solar).toFixed(1),
            hydro: (userKwh * ratios.hydro).toFixed(1),
            bioGeo: (userKwh * ratios.bioGeo).toFixed(1),
            conventional: (userKwh * ratios.conventional).toFixed(1)
        };

        // 1. ACTUALIZAR BARRAS: Ahora muestra TU consumo desglosado
        this.charts.bar.data.datasets[0].label = 'Tu Consumo Estimado (kWh)';
        this.charts.bar.data.datasets[0].data = [userVals.wind, userVals.solar, userVals.hydro, userVals.bioGeo, 0];
        this.charts.bar.options.plugins.title.text = `Desglose de tus ${userKwh} kWh`;
        this.charts.bar.update();

        // 2. ACTUALIZAR TORTA: Composición de TU energía
        this.charts.pie.data.datasets[0].data = [userVals.wind, userVals.solar, userVals.hydro, userVals.bioGeo];
        this.charts.pie.options.plugins.title.text = 'Tu Huella Energética';
        this.charts.pie.update();

        // 3. ACTUALIZAR ÁREA: Proyección a 1 año de TU consumo
        // Simulamos meses
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const userCleanMonthly = (parseFloat(userVals.wind) + parseFloat(userVals.solar) + parseFloat(userVals.hydro) + parseFloat(userVals.bioGeo));
        const userConvMonthly = parseFloat(userVals.conventional);

        // Crear proyección acumulada
        const projectionClean = months.map((_, i) => userCleanMonthly * (i + 1));
        const projectionConv = months.map((_, i) => userConvMonthly * (i + 1));

        this.charts.area.data.labels = months;
        this.charts.area.data.datasets[0].data = projectionClean;
        this.charts.area.data.datasets[0].label = 'Tu Consumo Limpio Acumulado';
        this.charts.area.data.datasets[1].data = projectionConv;
        this.charts.area.data.datasets[1].label = 'Tu Consumo Convencional Acumulado';
        this.charts.area.options.plugins.title.text = 'Proyección de tu impacto a 1 año (kWh)';
        this.charts.area.options.scales.y.stacked = false; // Desapilar para comparar mejor
        this.charts.area.update();
    }
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
    new EnergyManager();
});
/* =========================================================
   CLASE 1: AUTH SYSTEM
   ========================================================= */
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('solarUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.currentUser ? this.showMainContent() : this.showWelcomeScreen();
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
            Swal.fire({ icon: 'success', title: '¡Bienvenido!', text: `Hola, ${user.firstName}`, timer: 1500, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Credenciales incorrectas' });
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (password !== confirm) return Swal.fire('Error', 'Las contraseñas no coinciden', 'warning');
        if (this.users.find(u => u.email === email)) return Swal.fire('Error', 'El correo ya existe', 'warning');

        const newUser = { firstName, email, password };
        this.users.push(newUser);
        localStorage.setItem('solarUsers', JSON.stringify(this.users));
        this.setCurrentUser(newUser);
        this.safeHideModal('registerModal');
        e.target.reset();
        Swal.fire('¡Éxito!', 'Cuenta creada correctamente', 'success');
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
   CLASE 2: ENERGY MANAGER
   ========================================================= */
class EnergyManager {
    constructor() {
        this.energyData = [
            {"year": 2022, "solar": 579, "wind": 987, "hydro": 4565, "biofuel": 716, "geothermal": 144, "totalRenewable": 6991, "conventional": 18840, "totalGeneration": 25831, "percentage": "27.06"},
            {"year": 2021, "solar": 542, "wind": 929, "hydro": 4520, "biofuel": 672, "geothermal": 142, "totalRenewable": 6805, "conventional": 18720, "totalGeneration": 25525, "percentage": "26.66"},
            {"year": 2020, "solar": 506, "wind": 873, "hydro": 4475, "biofuel": 629, "geothermal": 140, "totalRenewable": 6623, "conventional": 18600, "totalGeneration": 25223, "percentage": "26.26"},
            {"year": 2019, "solar": 471, "wind": 819, "hydro": 4430, "biofuel": 588, "geothermal": 138, "totalRenewable": 6446, "conventional": 18480, "totalGeneration": 24926, "percentage": "25.86"},
            {"year": 2018, "solar": 437, "wind": 767, "hydro": 4385, "biofuel": 548, "geothermal": 136, "totalRenewable": 6273, "conventional": 18360, "totalGeneration": 24633, "percentage": "25.47"},
            {"year": 2017, "solar": 405, "wind": 717, "hydro": 4340, "biofuel": 510, "geothermal": 134, "totalRenewable": 6106, "conventional": 18240, "totalGeneration": 24346, "percentage": "25.08"},
            {"year": 2016, "solar": 374, "wind": 669, "hydro": 4295, "biofuel": 473, "geothermal": 132, "totalRenewable": 5943, "conventional": 18120, "totalGeneration": 24063, "percentage": "24.70"},
            {"year": 2015, "solar": 344, "wind": 622, "hydro": 4250, "biofuel": 438, "geothermal": 130, "totalRenewable": 5784, "conventional": 18000, "totalGeneration": 23784, "percentage": "24.32"},
            {"year": 2014, "solar": 315, "wind": 578, "hydro": 4205, "biofuel": 404, "geothermal": 128, "totalRenewable": 5630, "conventional": 17880, "totalGeneration": 23510, "percentage": "23.95"},
            {"year": 2013, "solar": 288, "wind": 535, "hydro": 4160, "biofuel": 372, "geothermal": 126, "totalRenewable": 5481, "conventional": 17760, "totalGeneration": 23241, "percentage": "23.58"},
            {"year": 2012, "solar": 261, "wind": 494, "hydro": 4115, "biofuel": 341, "geothermal": 124, "totalRenewable": 5335, "conventional": 17640, "totalGeneration": 22975, "percentage": "23.22"},
            {"year": 2011, "solar": 236, "wind": 455, "hydro": 4070, "biofuel": 312, "geothermal": 122, "totalRenewable": 5195, "conventional": 17520, "totalGeneration": 22715, "percentage": "22.87"},
            {"year": 2010, "solar": 212, "wind": 418, "hydro": 4025, "biofuel": 284, "geothermal": 120, "totalRenewable": 5059, "conventional": 17400, "totalGeneration": 22459, "percentage": "22.53"},
            {"year": 2009, "solar": 190, "wind": 382, "hydro": 3980, "biofuel": 257, "geothermal": 118, "totalRenewable": 4927, "conventional": 17280, "totalGeneration": 22207, "percentage": "22.19"},
            {"year": 2008, "solar": 169, "wind": 348, "hydro": 3935, "biofuel": 232, "geothermal": 116, "totalRenewable": 4800, "conventional": 17160, "totalGeneration": 21960, "percentage": "21.86"},
            {"year": 2007, "solar": 149, "wind": 316, "hydro": 3890, "biofuel": 208, "geothermal": 114, "totalRenewable": 4677, "conventional": 17040, "totalGeneration": 21717, "percentage": "21.54"},
            {"year": 2006, "solar": 130, "wind": 286, "hydro": 3845, "biofuel": 186, "geothermal": 112, "totalRenewable": 4559, "conventional": 16920, "totalGeneration": 21479, "percentage": "21.23"},
            {"year": 2005, "solar": 113, "wind": 257, "hydro": 3800, "biofuel": 165, "geothermal": 110, "totalRenewable": 4445, "conventional": 16800, "totalGeneration": 21245, "percentage": "20.92"},
            {"year": 2004, "solar": 97, "wind": 230, "hydro": 3755, "biofuel": 146, "geothermal": 108, "totalRenewable": 4336, "conventional": 16680, "totalGeneration": 21016, "percentage": "20.63"},
            {"year": 2003, "solar": 82, "wind": 204, "hydro": 3710, "biofuel": 128, "geothermal": 106, "totalRenewable": 4230, "conventional": 16560, "totalGeneration": 20790, "percentage": "20.35"},
            {"year": 2002, "solar": 69, "wind": 180, "hydro": 3665, "biofuel": 111, "geothermal": 104, "totalRenewable": 4129, "conventional": 16440, "totalGeneration": 20569, "percentage": "20.07"},
            {"year": 2001, "solar": 57, "wind": 158, "hydro": 3620, "biofuel": 96, "geothermal": 102, "totalRenewable": 4033, "conventional": 16320, "totalGeneration": 20353, "percentage": "19.82"},
            {"year": 2000, "solar": 46, "wind": 137, "hydro": 3575, "biofuel": 50, "geothermal": 100, "totalRenewable": 3908, "conventional": 16200, "totalGeneration": 20108, "percentage": "19.44"},
            {"year": 1999, "solar": 36, "wind": 118, "hydro": 3530, "biofuel": 50, "geothermal": 98, "totalRenewable": 3832, "conventional": 16080, "totalGeneration": 19912, "percentage": "19.24"},
            {"year": 1998, "solar": 28, "wind": 100, "hydro": 3485, "biofuel": 50, "geothermal": 96, "totalRenewable": 3759, "conventional": 15960, "totalGeneration": 19719, "percentage": "19.06"},
            {"year": 1997, "solar": 21, "wind": 84, "hydro": 3440, "biofuel": 50, "geothermal": 94, "totalRenewable": 3689, "conventional": 15840, "totalGeneration": 19529, "percentage": "18.89"},
            {"year": 1996, "solar": 15, "wind": 70, "hydro": 3395, "biofuel": 50, "geothermal": 92, "totalRenewable": 3622, "conventional": 15720, "totalGeneration": 19342, "percentage": "18.73"},
            {"year": 1995, "solar": 10, "wind": 57, "hydro": 3350, "biofuel": 50, "geothermal": 90, "totalRenewable": 3557, "conventional": 15600, "totalGeneration": 19157, "percentage": "18.57"},
            {"year": 1994, "solar": 6, "wind": 45, "hydro": 3305, "biofuel": 50, "geothermal": 88, "totalRenewable": 3494, "conventional": 15480, "totalGeneration": 18974, "percentage": "18.41"},
            {"year": 1993, "solar": 4, "wind": 35, "hydro": 3260, "biofuel": 50, "geothermal": 86, "totalRenewable": 3435, "conventional": 15360, "totalGeneration": 18795, "percentage": "18.28"},
            {"year": 1992, "solar": 2, "wind": 26, "hydro": 3215, "biofuel": 50, "geothermal": 84, "totalRenewable": 3377, "conventional": 15240, "totalGeneration": 18617, "percentage": "18.14"},
            {"year": 1991, "solar": 0, "wind": 18, "hydro": 3170, "biofuel": 50, "geothermal": 82, "totalRenewable": 3320, "conventional": 15120, "totalGeneration": 18440, "percentage": "18.00"},
            {"year": 1990, "solar": 0, "wind": 12, "hydro": 3125, "biofuel": 50, "geothermal": 80, "totalRenewable": 3267, "conventional": 15000, "totalGeneration": 18267, "percentage": "17.88"},
            {"year": 1989, "solar": 0, "wind": 7, "hydro": 3080, "biofuel": 50, "geothermal": 78, "totalRenewable": 3215, "conventional": 14880, "totalGeneration": 18095, "percentage": "17.77"},
            {"year": 1988, "solar": 0, "wind": 3, "hydro": 3035, "biofuel": 50, "geothermal": 76, "totalRenewable": 3164, "conventional": 14760, "totalGeneration": 17924, "percentage": "17.65"},
            {"year": 1987, "solar": 0, "wind": 1, "hydro": 2990, "biofuel": 50, "geothermal": 74, "totalRenewable": 3115, "conventional": 14640, "totalGeneration": 17755, "percentage": "17.54"},
            {"year": 1986, "solar": 0, "wind": 0, "hydro": 2945, "biofuel": 50, "geothermal": 72, "totalRenewable": 3067, "conventional": 14520, "totalGeneration": 17587, "percentage": "17.44"},
            {"year": 1985, "solar": 0, "wind": 0, "hydro": 2900, "biofuel": 50, "geothermal": 70, "totalRenewable": 3020, "conventional": 14400, "totalGeneration": 17420, "percentage": "17.34"},
            {"year": 1984, "solar": 0, "wind": 0, "hydro": 2855, "biofuel": 50, "geothermal": 68, "totalRenewable": 2973, "conventional": 14280, "totalGeneration": 17253, "percentage": "17.23"},
            {"year": 1983, "solar": 0, "wind": 0, "hydro": 2810, "biofuel": 50, "geothermal": 66, "totalRenewable": 2926, "conventional": 14160, "totalGeneration": 17086, "percentage": "17.13"},
            {"year": 1982, "solar": 0, "wind": 0, "hydro": 2765, "biofuel": 50, "geothermal": 64, "totalRenewable": 2879, "conventional": 14040, "totalGeneration": 16919, "percentage": "17.02"},
            {"year": 1981, "solar": 0, "wind": 0, "hydro": 2720, "biofuel": 50, "geothermal": 62, "totalRenewable": 2832, "conventional": 13920, "totalGeneration": 16752, "percentage": "16.91"},
            {"year": 1980, "solar": 0, "wind": 0, "hydro": 2675, "biofuel": 50, "geothermal": 60, "totalRenewable": 2785, "conventional": 13800, "totalGeneration": 16585, "percentage": "16.79"},
            {"year": 1979, "solar": 0, "wind": 0, "hydro": 2630, "biofuel": 50, "geothermal": 58, "totalRenewable": 2738, "conventional": 13680, "totalGeneration": 16418, "percentage": "16.68"},
            {"year": 1978, "solar": 0, "wind": 0, "hydro": 2585, "biofuel": 50, "geothermal": 56, "totalRenewable": 2691, "conventional": 13560, "totalGeneration": 16251, "percentage": "16.56"},
            {"year": 1977, "solar": 0, "wind": 0, "hydro": 2540, "biofuel": 50, "geothermal": 54, "totalRenewable": 2644, "conventional": 13440, "totalGeneration": 16084, "percentage": "16.44"},
            {"year": 1976, "solar": 0, "wind": 0, "hydro": 2495, "biofuel": 50, "geothermal": 52, "totalRenewable": 2597, "conventional": 13320, "totalGeneration": 15917, "percentage": "16.32"},
            {"year": 1975, "solar": 0, "wind": 0, "hydro": 2450, "biofuel": 50, "geothermal": 50, "totalRenewable": 2550, "conventional": 13200, "totalGeneration": 15750, "percentage": "16.19"},
            {"year": 1974, "solar": 0, "wind": 0, "hydro": 2405, "biofuel": 50, "geothermal": 48, "totalRenewable": 2503, "conventional": 13080, "totalGeneration": 15583, "percentage": "16.06"},
            {"year": 1973, "solar": 0, "wind": 0, "hydro": 2360, "biofuel": 50, "geothermal": 46, "totalRenewable": 2456, "conventional": 12960, "totalGeneration": 15416, "percentage": "15.93"},
            {"year": 1972, "solar": 0, "wind": 0, "hydro": 2315, "biofuel": 50, "geothermal": 44, "totalRenewable": 2409, "conventional": 12840, "totalGeneration": 15249, "percentage": "15.80"},
            {"year": 1971, "solar": 0, "wind": 0, "hydro": 2270, "biofuel": 50, "geothermal": 42, "totalRenewable": 2362, "conventional": 12720, "totalGeneration": 15082, "percentage": "15.66"},
            {"year": 1970, "solar": 0, "wind": 0, "hydro": 2225, "biofuel": 50, "geothermal": 40, "totalRenewable": 2315, "conventional": 12600, "totalGeneration": 14915, "percentage": "15.52"},
            {"year": 1969, "solar": 0, "wind": 0, "hydro": 2180, "biofuel": 50, "geothermal": 38, "totalRenewable": 2268, "conventional": 12480, "totalGeneration": 14748, "percentage": "15.38"},
            {"year": 1968, "solar": 0, "wind": 0, "hydro": 2135, "biofuel": 50, "geothermal": 36, "totalRenewable": 2221, "conventional": 12360, "totalGeneration": 14581, "percentage": "15.23"},
            {"year": 1967, "solar": 0, "wind": 0, "hydro": 2090, "biofuel": 50, "geothermal": 34, "totalRenewable": 2174, "conventional": 12240, "totalGeneration": 14414, "percentage": "15.08"},
            {"year": 1966, "solar": 0, "wind": 0, "hydro": 2045, "biofuel": 50, "geothermal": 32, "totalRenewable": 2127, "conventional": 12120, "totalGeneration": 14247, "percentage": "14.93"},
            {"year": 1965, "solar": 0, "wind": 0, "hydro": 2000, "biofuel": 50, "geothermal": 30, "totalRenewable": 2080, "conventional": 12000, "totalGeneration": 14080, "percentage": "14.77"}
        ];
        
        this.charts = { bar: null, pie: null, line: null, area: null };
        this.isDarkMode = false;
        this.init();
    }

    init() {
        this.renderTable();
        this.populateYearSelector();
        this.initCalculator();
        this.initDarkMode();
        setTimeout(() => this.renderInitialDashboard(), 500);
    }

    initDarkMode() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            document.body.classList.toggle('dark-mode');
            
            btn.innerHTML = this.isDarkMode 
                ? '<i class="fas fa-sun me-2"></i>Claro' 
                : '<i class="fas fa-moon me-2"></i>Oscuro';
            
            this.updateChartsTheme();
        });
    }

    updateChartsTheme() {
        const textColor = this.isDarkMode ? '#ffffff' : '#212529';
        const gridColor = this.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.options.plugins.legend.labels.color = textColor;
                chart.options.plugins.title.color = textColor;
                
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = textColor;
                    chart.options.scales.x.grid.color = gridColor;
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = textColor;
                    chart.options.scales.y.grid.color = gridColor;
                }
                chart.update();
            }
        });
    }

    // AQUI SE APLICA LA UNIFORMIDAD DE COLORES EN LA TABLA
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
                <td class="fw-bold">${(row.totalRenewable).toFixed(0)}</td>
                <td class="fw-bold">${(row.conventional).toFixed(0)}</td>
                <!-- Solo el badge mantiene color -->
                <td><span class="badge bg-${row.percentage > 20 ? 'success' : 'warning'} rounded-pill px-3 shadow-sm">${row.percentage}%</span></td>
            </tr>
        `).join('');
    }

    populateYearSelector() {
        const selector = document.getElementById('yearSelector');
        if(!selector) return;
        this.energyData.forEach(row => {
            const option = document.createElement('option');
            option.value = row.year;
            option.textContent = row.year;
            selector.appendChild(option);
        });
    }

    initCalculator() {
        const form = document.getElementById('calculatorForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const userKwh = parseFloat(document.getElementById('userConsumption').value);
            const selectedYear = parseInt(document.getElementById('yearSelector').value);

            if (isNaN(userKwh) || userKwh <= 0) return Swal.fire('Atención', 'Ingresa un consumo válido', 'warning');

            const rowData = this.energyData.find(d => d.year === selectedYear);
            if (!rowData) return;

            const proportion = rowData.totalRenewable / rowData.totalGeneration;
            const cleanKwh = (userKwh * proportion).toFixed(2);

            document.getElementById('resultCard').classList.remove('d-none');
            document.getElementById('displayYear').textContent = selectedYear;
            document.getElementById('globalPercentVal').textContent = rowData.percentage + "%";
            document.getElementById('globalCapacityVal').textContent = rowData.totalRenewable.toFixed(0) + " TWh";
            document.getElementById('userInputVal').textContent = userKwh;
            document.getElementById('userRenewableVal').textContent = cleanKwh;

            this.updateDashboardWithSelectedData(rowData, userKwh);
            document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
        });
    }

    updateDashboardWithSelectedData(rowData, userKwh) {
        const totalGen = rowData.totalGeneration;
        const ratios = {
            wind: rowData.wind / totalGen,
            solar: rowData.solar / totalGen,
            hydro: rowData.hydro / totalGen,
            bioGeo: (rowData.biofuel + rowData.geothermal) / totalGen,
            conventional: rowData.conventional / totalGen
        };

        const userVals = {
            wind: (userKwh * ratios.wind).toFixed(1),
            solar: (userKwh * ratios.solar).toFixed(1),
            hydro: (userKwh * ratios.hydro).toFixed(1),
            bioGeo: (userKwh * ratios.bioGeo).toFixed(1),
            conventional: (userKwh * ratios.conventional).toFixed(1)
        };

        this.charts.bar.data.datasets[0].data = [userVals.wind, userVals.solar, userVals.hydro, userVals.bioGeo, 0];
        this.charts.bar.options.plugins.title.text = `Desglose de tus ${userKwh} kWh (${rowData.year})`;
        this.charts.bar.update();

        this.charts.pie.data.datasets[0].data = [userVals.wind, userVals.solar, userVals.hydro, userVals.bioGeo];
        this.charts.pie.options.plugins.title.text = `Huella Energética (${rowData.year})`;
        this.charts.pie.update();

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const userCleanMonthly = parseFloat(userVals.wind) + parseFloat(userVals.solar) + parseFloat(userVals.hydro) + parseFloat(userVals.bioGeo);
        const userConvMonthly = parseFloat(userVals.conventional);

        const projectionClean = months.map((_, i) => userCleanMonthly * (i + 1));
        const projectionConv = months.map((_, i) => userConvMonthly * (i + 1));

        this.charts.area.data.datasets[0].data = projectionClean;
        this.charts.area.data.datasets[1].data = projectionConv;
        this.charts.area.options.plugins.title.text = `Proyección basada en tecnología de ${rowData.year}`;
        this.charts.area.update();

        this.charts.line.options.plugins.title.text = `Contexto Global (Seleccionado: ${rowData.year})`;
        this.charts.line.update();
    }

    renderInitialDashboard() {
        if (!document.getElementById('barChart') || this.energyData.length === 0) return;

        const latest = this.energyData[0];
        const historic = [...this.energyData].reverse();
        const years = historic.map(d => d.year);

        const commonOptions = {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#212529' } },
                title: { display: true, color: '#212529' }
            },
            scales: {
                x: { ticks: { color: '#212529' }, grid: { color: 'rgba(0,0,0,0.1)' } },
                y: { ticks: { color: '#212529' }, grid: { color: 'rgba(0,0,0,0.1)' } }
            }
        };

        const getOptions = (title) => {
            const opt = JSON.parse(JSON.stringify(commonOptions));
            opt.plugins.title.text = title;
            return opt;
        };

        const pieOptions = JSON.parse(JSON.stringify(commonOptions));
        delete pieOptions.scales;
        pieOptions.plugins.title.text = 'Mix Energético 2022';

        this.charts.bar = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Bio/Geo', 'Geotérmica'],
                datasets: [{
                    label: 'Global (TWh)',
                    data: [latest.wind, latest.solar, latest.hydro, latest.biofuel, latest.geothermal],
                    backgroundColor: ['#42A5F5', '#FFA726', '#26C6DA', '#66BB6A', '#AB47BC']
                }]
            },
            options: getOptions('Contexto Global 2022 (TWh)')
        });

        this.charts.pie = new Chart(document.getElementById('pieChart'), {
            type: 'doughnut',
            data: {
                labels: ['Eólica', 'Solar', 'Hidro', 'Otros'],
                datasets: [{
                    data: [latest.wind, latest.solar, latest.hydro, (latest.biofuel + latest.geothermal)],
                    backgroundColor: ['#42A5F5', '#FFA726', '#26C6DA', '#AB47BC']
                }]
            },
            options: pieOptions
        });

        this.charts.line = new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'Renovable (TWh)', data: historic.map(d => d.totalRenewable), borderColor: '#26C6DA', tension: 0.3 },
                    { label: 'Solar (TWh)', data: historic.map(d => d.solar), borderColor: '#FFA726', tension: 0.3 }
                ]
            },
            options: getOptions('Evolución Histórica Global')
        });

        this.charts.area = new Chart(document.getElementById('areaChart'), {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    { label: 'Limpio Acumulado', data: [], borderColor: '#66BB6A', backgroundColor: 'rgba(102, 187, 106, 0.5)', fill: true },
                    { label: 'Convencional Acumulado', data: [], borderColor: '#78909C', backgroundColor: 'rgba(120, 144, 156, 0.5)', fill: true }
                ]
            },
            options: getOptions('Proyección de Impacto (Simula para ver datos)')
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
    new EnergyManager();
});
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Инициализация Supabase клиента
const supabase = createClient('https://vihxlcvqjobqeyhkeine.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaHhsY3Zxam9icWV5aGtlaW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDA2MTcsImV4cCI6MjA2NTgxNjYxN30.sHT7G91BKM4eAAp61fZLtGbl0qRNKlM9HtPm_uBxnB4');

// Глобальные переменные
let balance = 1000;
let portfolio = {};
let transactions = [];
let cryptoPrices = {
    BTC: 0, ETH: 0, USDT: 0, BNB: 0, LTC: 0, TON: 0, XRP: 0, SOL: 0, USDC: 0, DOGE: 0,
    TRX: 0, ADA: 0, WBTC: 0, AVAX: 0, SHIB: 0, LINK: 0, DOT: 0, MATIC: 0, BCH: 0, UNI: 0
};
let cryptoPriceHistory = Object.fromEntries(Object.keys(cryptoPrices).map(c => [c, []]));
let priceChanges = Object.fromEntries(Object.keys(cryptoPrices).map(c => [c, 0]));
let previousPrices = { ...cryptoPrices };
let selectedCrypto = 'BTC';
let tradeMode = 'buy';
let chart = null;
let candlestickSeries = null;
let volumeSeries = null;
let currentTimeframe = '15m';
let selectedMarket = 'BTC/USDT';
let favoritePairs = new Set();
let currentUser = null;

// Маппинг для CoinGecko API
const cryptoIdMap = {
    BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin', LTC: 'litecoin',
    TON: 'the-open-network', XRP: 'ripple', SOL: 'solana', USDC: 'usd-coin', DOGE: 'dogecoin',
    TRX: 'tron', ADA: 'cardano', WBTC: 'wrapped-bitcoin', AVAX: 'avalanche-2', SHIB: 'shiba-inu',
    LINK: 'chainlink', DOT: 'polkadot', MATIC: 'matic-network', BCH: 'bitcoin-cash', UNI: 'uniswap'
};

// Символы криптовалют
const cryptoSymbols = {
    BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: 'B', LTC: 'Ł', TON: '$', XRP: 'Ʀ', SOL: '◎',
    USDC: '₡', DOGE: 'Ð', TRX: '₮', ADA: '₳', WBTC: '₿', AVAX: 'Ⓐ', SHIB: '柴',
    LINK: '🔗', DOT: '⚫', MATIC: '⬣', BCH: '₿', UNI: '🦄'
};

// Цвета для иконок
const cryptoColors = {
    BTC: { start: 'f7931a', end: 'ffb74d' }, ETH: { start: '627eea', end: '8e44ad' },
    USDT: { start: '26a17b', end: '5ac8a8' }, BNB: { start: 'f3ba2f', end: 'f7de8a' },
    LTC: { start: 'b5b5b5', end: 'd9d9d9' }, TON: { start: '0088cc', end: '00b7eb' },
    XRP: { start: '222222', end: '555555' }, SOL: { start: '00ffa3', end: 'dc1fff' },
    USDC: { start: '2775ca', end: '5a9bd4' }, DOGE: { start: 'c3a634', end: 'e6c44f' },
    TRX: { start: 'eb0029', end: 'ff4d4d' }, ADA: { start: '3c84b9', end: '60a5fa' },
    WBTC: { start: 'f7931a', end: 'ffb74d' }, AVAX: { start: 'e84142', end: 'ff6b6b' },
    SHIB: { start: 'ff4500', end: 'ff8c00' }, LINK: { start: '2a5ada', end: '5a9bd4' },
    DOT: { start: 'e6007a', end: 'ff4d8c' }, MATIC: { start: '8247e5', end: 'a78bfa' },
    BCH: { start: '8dc351', end: 'b3e67a' }, UNI: { start: 'ff007a', end: 'ff4d8c' }
};

// Форматирование цены
function formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price)) return '0.00';
    const fractionDigits = price < 1 ? 6 : price < 100 ? 4 : 2;
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(price);
}

// Регистрация пользователя
async function registerUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        console.log('Пользователь зарегистрирован:', data.user);
        alert('Регистрация успешна! Проверьте почту для подтверждения.');
        return data.user;
    } catch (error) {
        console.error('Ошибка регистрации:', error.message);
        alert(`Ошибка регистрации: ${error.message}`);
        return null;
    }
}

// Вход пользователя
async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('Пользователь вошел:', data.user);
        currentUser = data.user;
        await fetchUserData();
        updateAuthUI();
        return data.user;
    } catch (error) {
        console.error('Ошибка входа:', error.message);
        alert(`Ошибка входа: ${error.message}`);
        return null;
    }
}

// Выход пользователя
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('Пользователь вышел');
        currentUser = null;
        balance = 1000;
        portfolio = {};
        transactions = [];
        updateAuthUI();
        updateUI();
    } catch (error) {
        console.error('Ошибка выхода:', error.message);
        alert(`Ошибка выхода: ${error.message}`);
    }
}

// Получение данных пользователя
async function fetchUserData() {
    if (!currentUser) return;
    try {
        const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio')
            .select('*')
            .eq('user_id', currentUser.id);
        if (portfolioError) throw portfolioError;
        portfolio = {};
        portfolioData.forEach(item => {
            portfolio[item.crypto] = item.amount;
        });

        const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });
        if (transactionsError) throw transactionsError;
        transactions = transactionsData;

        console.log('Данные пользователя:', { portfolio, transactions });
        updateUI();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error.message);
    }
}

// Сохранение портфеля
async function savePortfolio(crypto, amount) {
    if (!currentUser) return;
    try {
        const { error } = await supabase
            .from('portfolio')
            .upsert([{ user_id: currentUser.id, crypto, amount }], { onConflict: ['user_id', 'crypto'] });
        if (error) throw error;
        console.log(`Портфель обновлен: ${crypto} = ${amount}`);
    } catch (error) {
        console.error('Ошибка сохранения портфеля:', error.message);
    }
}

// Сохранение транзакции
async function saveTransaction(tx) {
    if (!currentUser) return;
    try {
        const { error } = await supabase
            .from('transactions')
            .insert([{
                user_id: currentUser.id,
                date: new Date(tx.date).toISOString(),
                type: tx.type,
                crypto: tx.crypto,
                amount: tx.amount,
                price: tx.price,
                total: tx.total,
                status: tx.status
            }]);
        if (error) throw error;
        console.log('Транзакция сохранена:', tx);
    } catch (error) {
        console.error('Ошибка сохранения транзакции:', error.message);
    }
}

// Обновление UI авторизации
function updateAuthUI() {
    const userControls = document.querySelector('.user-controls');
    if (!userControls) return;

    if (currentUser) {
        userControls.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn">Профиль</button>
                <div class="dropdown-menu">
                    <a href="#" onclick="navigateTo('settings')">Настройки</a>
                    <a href="#" onclick="navigateTo('wallet')">Кошелек</a>
                    <a href="#" onclick="logoutUser()">Выйти</a>
                </div>
            </div>
        `;
        const profileBtn = document.querySelector('.profile-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (profileBtn && dropdownMenu) {
            profileBtn.addEventListener('click', () => dropdownMenu.classList.toggle('active'));
        }
    } else {
        userControls.innerHTML = `
            <button class="login-btn" onclick="showLoginModal()">Войти</button>
            <button class="register-btn" onclick="showRegisterModal()">Регистрация</button>
        `;
    }
}

// Показ модального окна входа
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>Вход</h2>
            <div class="input-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" placeholder="Введите email" required>
            </div>
            <div class="input-group">
                <label for="login-password">Пароль</label>
                <input type="password" id="login-password" placeholder="Введите пароль" required>
            </div>
            <button class="btn btn-primary" onclick="handleLogin()">Войти</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Показ модального окна регистрации
function showRegisterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>Регистрация</h2>
            <div class="input-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" placeholder="Введите email" required>
            </div>
            <div class="input-group">
                <label for="register-password">Пароль</label>
                <input type="password" id="register-password" placeholder="Введите пароль" required>
            </div>
            <button class="btn btn-primary" onclick="handleRegister()">Зарегистрироваться</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Обработка входа
async function handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    const user = await loginUser(email, password);
    if (user) {
        document.querySelector('.modal')?.remove();
    }
}

// Обработка регистрации
async function handleRegister() {
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    if (!email || !password) {
        alert('Заполните все поля');
        return;
    }
    const user = await registerUser(email, password);
    if (user) {
        document.querySelector('.modal')?.remove();
    }
}

// Навигация с учетом папки html
function navigateTo(page, event) {
    if (event) event.preventDefault();
    console.log('Navigating to:', page);
    const pages = {
        home: 'index.html',
        trade: 'html/trading.html',
        wallet: 'html/wallet.html',
        portfolio: 'html/portfolio.html',
        history: 'html/history.html',
        settings: 'html/settings.html'
    };
    const targetPage = pages[page] || 'index.html';
    console.log('Target page:', targetPage);
    window.location.href = targetPage;
}

// Рендеринг списка криптовалют
function renderCryptoList() {
    const cryptoItems = document.getElementById('crypto-items');
    if (!cryptoItems) return;
    cryptoItems.innerHTML = '';
    const searchInput = document.getElementById('pair-search');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    Object.keys(cryptoPrices).forEach(crypto => {
        if (!crypto.toLowerCase().includes(searchQuery)) return;
        const isFavorite = favoritePairs.has(`${crypto}/USDT`);
        const item = document.createElement('div');
        item.className = `crypto-item ${selectedCrypto === crypto ? 'selected' : ''}`;
        item.innerHTML = `
            <div class="crypto-info">
                <span class="crypto-icon" style="background: linear-gradient(45deg, #${cryptoColors[crypto]?.start || '555'}, #${cryptoColors[crypto]?.end || '999'});">${cryptoSymbols[crypto]}</span>
                <div>
                    <div class="crypto-name">${crypto}/USDT</div>
                    <div class="crypto-price">$${formatPrice(cryptoPrices[crypto])}</div>
                </div>
            </div>
            <div class="crypto-price">
                <div class="price">$${formatPrice(cryptoPrices[crypto])}</div>
                <div class="change ${priceChanges[crypto] >= 0 ? 'positive' : 'negative'}">
                    ${priceChanges[crypto] >= 0 ? '+' : ''}${formatPrice(priceChanges[crypto])} (${((priceChanges[crypto] / (previousPrices[crypto] || 1)) * 100).toFixed(2)}%)
                </div>
                <svg class="favorite-icon ${isFavorite ? 'active' : ''}" fill="currentColor" viewBox="0 0 24 24" onclick="toggleFavorite('${crypto}/USDT', event)">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            </div>
        `;
        item.onclick = () => selectCrypto(crypto);
        cryptoItems.appendChild(item);
    });
}

// Переключение избранных пар
function toggleFavorite(pair, event) {
    event.stopPropagation();
    if (favoritePairs.has(pair)) {
        favoritePairs.delete(pair);
    } else {
        favoritePairs.add(pair);
    }
    renderCryptoList();
}

// Получение цен
async function fetchCryptoPrices() {
    try {
        const symbols = Object.values(cryptoIdMap).join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        Object.keys(cryptoIdMap).forEach(crypto => {
            const price = data[cryptoIdMap[crypto]]?.usd || 0;
            previousPrices[crypto] = cryptoPrices[crypto] || price;
            cryptoPrices[crypto] = price;
            priceChanges[crypto] = price - previousPrices[crypto];
            cryptoPriceHistory[crypto].push({ time: Date.now() / 1000, value: price });
            if (cryptoPriceHistory[crypto].length > 100) {
                cryptoPriceHistory[crypto].shift();
            }
        });
        updateUI();
    } catch (error) {
        console.error('Ошибка получения цен:', error);
    }
}

// Обновление UI
function updateUI() {
    renderCryptoList();
    updateTradingPanel();
    updateChart();
    updateOrderBook();
    updateTradeHistory();
    updateStats();
    renderPortfolio();
    renderTransactions();
}

// Рендеринг портфеля
function renderPortfolio() {
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';
    Object.entries(portfolio).forEach(([crypto, amount]) => {
        if (amount <= 0) return;
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <span class="crypto-icon" style="background: linear-gradient(45deg, #${cryptoColors[crypto]?.start || '555'}, #${cryptoColors[crypto]?.end || '999'});">${cryptoSymbols[crypto]}</span>
            <div class="portfolio-amount">${amount.toFixed(6)} ${crypto}</div>
            <div class="portfolio-value">$${formatPrice(amount * cryptoPrices[crypto])}</div>
        `;
        portfolioGrid.appendChild(item);
    });
}

// Рендеринг транзакций
function renderTransactions() {
    const tbody = document.querySelector('.transactions-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(tx.date).toLocaleString()}</td>
            <td>${tx.type}</td>
            <td>${tx.crypto}</td>
            <td>${tx.amount.toFixed(6)}</td>
            <td>$${formatPrice(tx.price)}</td>
            <td>$${formatPrice(tx.total)}</td>
            <td><span class="status ${tx.status}">${tx.status}</span></td>
            <td>${tx.type === 'buy' ? '-' : '+'}$${formatPrice(tx.total)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Выбор криптовалюты
function selectCrypto(crypto) {
    selectedCrypto = crypto;
    selectedMarket = `${crypto}/USDT`;
    renderCryptoList();
    updateTradingPanel();
    updateChart();
    updateOrderBook();
    updateTradeHistory();
    updateStats();
}

// Обновление графика
function updateChart() {
    if (!candlestickSeries || !volumeSeries) return;
    fetchChartData(currentTimeframe).then(data => {
        candlestickSeries.setData(data);
        volumeSeries.setData(data.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(67, 233, 123, 0.3)' : 'rgba(245, 87, 43, 0.3)'
        })));
        chart.timeScale().fitContent();
    }).catch(error => console.error('Ошибка обновления графика:', error));
}

// Установка режима торговли
function setTradeMode(mode) {
    tradeMode = mode;
    const tradeBtn = document.getElementById('trade-btn');
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
    });
    if (tradeBtn) {
        tradeBtn.textContent = mode === 'buy' ? 'Купить' : 'Продать';
        tradeBtn.style.background = mode === 'buy' ? 'linear-gradient(to right, #43e97b, #38f9d7)' : 'linear-gradient(to right, #f5576c, #f093fb)';
    }
    updateTradingPanel();
}

// Обновление торговой панели
function updateTradingPanel() {
    const pairIcon = document.getElementById('pair-icon');
    const selectedPair = document.getElementById('selected-pair');
    const currentPrice = document.getElementById('current-price');
    const priceChange = document.getElementById('price-change');
    const changeValue = document.getElementById('change-value');
    const trendIcon = document.getElementById('trend-icon');
    const selectedCryptoPair = document.getElementById('selected-crypto-pair');
    const tradePrice = document.getElementById('trade-price');
    const tradeAmount = document.getElementById('trade-amount');
    const cryptoAmount = document.getElementById('crypto-amount');

    if (pairIcon) pairIcon.innerHTML = cryptoSymbols[selectedCrypto];
    if (selectedPair) selectedPair.textContent = selectedMarket;
    if (currentPrice) currentPrice.textContent = `$${formatPrice(cryptoPrices[selectedCrypto])}`;
    if (changeValue && priceChanges[selectedCrypto] !== undefined) {
        changeValue.textContent = `${priceChanges[selectedCrypto] >= 0 ? '+' : ''}${formatPrice(priceChanges[selectedCrypto])} (${((priceChanges[selectedCrypto] / (previousPrices[selectedCrypto] || 1)) * 100).toFixed(2)}%)`;
    }
    if (priceChange) priceChange.className = `price-change ${priceChanges[selectedCrypto] >= 0 ? 'positive' : 'negative'}`;
    if (trendIcon) {
        trendIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${priceChanges[selectedCrypto] >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M5 14l7 7m0 0l7-7m-7 7V3'}"/>`;
    }
    if (selectedCryptoPair) selectedCryptoPair.textContent = selectedCrypto;
    if (tradePrice) tradePrice.value = cryptoPrices[selectedCrypto]?.toFixed(2) || '0.00';
    if (tradeAmount && cryptoAmount) {
        tradeAmount.oninput = () => {
            cryptoAmount.value = (tradeAmount.value * (tradePrice.value || 0)).toFixed(2);
        };
        cryptoAmount.value = tradeAmount.value ? (tradeAmount.value * (tradePrice.value || 0)).toFixed(2) : '0.00';
    }
}

// Инициализация графика
function initChart() {
    const chartContainer = document.getElementById('trading-chart');
    if (!chartContainer) return;
    chart = LightweightCharts.createChart(chartContainer, {
        layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#e6e6e6' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
        rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
        timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal }
    });
    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#43e97b',
        downColor: '#f5576c',
        borderVisible: false,
        wickUpColor: '#43e97b',
        wickDownColor: '#f5576c'
    });
    const volumeContainer = document.getElementById('volume-bottom');
    if (volumeContainer) {
        const volumeChart = LightweightCharts.createChart(volumeContainer, {
            layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#e6e6e6' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            rightPriceScale: { visible: false },
            timeScale: { timeVisible: true, secondsVisible: false }
        });
        volumeSeries = volumeChart.addHistogramSeries({ color: '#7e6bff', priceFormat: { type: 'volume' } });
        chart.timeScale().subscribeVisibleLogicalRange(range => {
            volumeChart.timeScale().setVisibleLogicalRange(range);
        });
    }
    updateChart();
}

// Получение данных графика
async function fetchChartData(timeframe) {
    try {
        const days = timeframe === '1d' ? 1 : 30;
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoIdMap[selectedCrypto]}/ohlc?vs_currency=usd&days=${days}`);
        const data = await response.json();
        return data.map(([time, open, high, low, close]) => ({
            time: time / 1000,
            open,
            high,
            low,
            close,
            volume: Math.random() * 1000000
        }));
    } catch (error) {
        console.error('Ошибка получения данных графика:', error);
        const now = Date.now() / 1000;
        return Array.from({ length: 50 }, (_, i) => ({
            time: now - i * 3600,
            open: 30000 + Math.random() * 1000,
            high: 30500 + Math.random() * 1000,
            low: 29500 + Math.random() * 1000,
            close: 30000 + Math.random() * 1000,
            volume: Math.random() * 1000000
        }));
    }
}

// Установка таймфрейма
function setTimeframe(timeframe) {
    currentTimeframe = timeframe;
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-timeframe') === timeframe);
    });
    updateChart();
}

// Обновление книги ордеров
function updateOrderBook() {
    const bidsTbody = document.getElementById('order-book-bids');
    const asksTbody = document.getElementById('order-book-asks');
    if (!bidsTbody || !asksTbody) return;
    bidsTbody.innerHTML = '';
    asksTbody.innerHTML = '';
    const price = cryptoPrices[selectedCrypto] || 0;
    for (let i = 0; i < 5; i++) {
        const bidPrice = price * (1 - i * 0.001);
        const askPrice = price * (1 + i * 0.001);
        const amount = Math.random() * 10;
        const bidRow = document.createElement('tr');
        bidRow.innerHTML = `<td class="buy">$${formatPrice(bidPrice)}</td><td>${amount.toFixed(4)}</td>`;
        const askRow = document.createElement('tr');
        askRow.innerHTML = `<td class="sell">$${formatPrice(askPrice)}</td><td>${amount.toFixed(4)}</td>`;
        bidsTbody.appendChild(bidRow);
        asksTbody.appendChild(askRow);
    }
}

// Обновление истории торгов
function updateTradeHistory() {
    const tradeHistory = document.getElementById('trade-history-items');
    if (!tradeHistory) return;
    tradeHistory.innerHTML = '';
    const recentTrades = transactions.slice(-5).reverse();
    recentTrades.forEach(trade => {
        const item = document.createElement('div');
        item.className = 'trade-history-item';
        item.innerHTML = `
            <div class="time">${new Date(trade.date).toLocaleTimeString()}</div>
            <span class="price ${trade.type}">$${formatPrice(trade.price)}</span>
            <span class="amount">${trade.amount.toFixed(4)}</span>
        `;
        tradeHistory.appendChild(item);
    });
}

// Обновление статистики
function updateStats() {
    const statsHigh = document.getElementById('stats-high');
    const statsLow = document.getElementById('stats-low');
    const statsVolume = document.getElementById('stats-volume');
    const statsMarketCap = document.getElementById('stats-market-cap');
    const price = cryptoPrices[selectedCrypto] || 0;
    if (statsHigh) statsHigh.textContent = `$${formatPrice(price * 1.05)}`;
    if (statsLow) statsLow.textContent = `$${formatPrice(price * 0.95)}`;
    if (statsVolume) statsVolume.textContent = `${(Math.random() * 1000000).toFixed(0)} USDT`;
    if (statsMarketCap) statsMarketCap.textContent = `$${formatPrice(price * 1000000)}`;
}

// Выполнение торговли
function executeTrade() {
    const amountInput = document.getElementById('trade-amount');
    const priceInput = document.getElementById('trade-price');
    if (!amountInput || !priceInput) return;
    const amount = parseFloat(amountInput.value);
    const price = parseFloat(priceInput.value);
    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
        alert('Введите корректные значения');
        return;
    }
    const total = amount * price;
    if (tradeMode === 'buy') {
        if (total > balance) {
            alert('Недостаточно средств');
            return;
        }
        balance -= total;
        portfolio[selectedCrypto] = (portfolio[selectedCrypto] || 0) + amount;
        savePortfolio(selectedCrypto, portfolio[selectedCrypto]);
    } else {
        if (!portfolio[selectedCrypto] || portfolio[selectedCrypto] < amount) {
            alert('Недостаточно криптовалюты для продажи');
            return;
        }
        balance += total;
        portfolio[selectedCrypto] -= amount;
        if (portfolio[selectedCrypto] <= 0) {
            delete portfolio[selectedCrypto];
        } else {
            savePortfolio(selectedCrypto, portfolio[selectedCrypto]);
        }
    }
    const transaction = {
        date: Date.now(),
        type: tradeMode,
        crypto: selectedCrypto,
        amount,
        price,
        total,
        status: 'completed'
    };
    transactions.push(transaction);
    saveTransaction(transaction);
    updateUI();
    amountInput.value = '';
}

// Переключение чата поддержки
function toggleSupport() {
    const supportChat = document.getElementById('support-chat');
    if (supportChat) supportChat.classList.toggle('active');
}

// Отправка сообщения в поддержку
function sendMessage() {
    const input = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    if (!input || !chatBody || !input.value.trim()) return;
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = input.value;
    chatBody.appendChild(userMessage);
    const supportMessage = document.createElement('div');
    supportMessage.className = 'chat-message support';
    supportMessage.textContent = 'Спасибо за сообщение! Наша команда скоро ответит.';
    chatBody.appendChild(supportMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
}

// Инициализация
function init() {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user;
            console.log('Сессия найдена:', currentUser);
            fetchUserData();
        }
        updateAuthUI();
        fetchCryptoPrices();
        initChart();
        updateUI();
    });
    setInterval(fetchCryptoPrices, 60000);
    const searchInput = document.getElementById('pair-search');
    if (searchInput) {
        searchInput.addEventListener('input', renderCryptoList);
    }
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', () => setTimeframe(btn.getAttribute('data-timeframe')));
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => setTradeMode(tab.getAttribute('data-mode')));
    });
    const tradeBtn = document.getElementById('trade-btn');
    if (tradeBtn) {
        tradeBtn.addEventListener('click', executeTrade);
    }
}

document.addEventListener('DOMContentLoaded', init);

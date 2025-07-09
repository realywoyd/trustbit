let balance = 0;
let portfolio = {};
let transactions = [];
let cryptoPrices = {
    BTC: 0, ETH: 0, USDT: 0, BNB: 0, LTC: 0, TON: 0, XRP: 0, SOL: 0, USDC: 0, DOGE: 0,
    TRX: 0, ADA: 0, WBTC: 0, AVAX: 0, SHIB: 0, LINK: 0, DOT: 0, MATIC: 0, BCH: 0, UNI: 0,
    XLM: 0, VET: 0, ATOM: 0, FIL: 0, ALGO: 0, NEAR: 0, ICP: 0, APT: 0, ARB: 0, OP: 0,
    INJ: 0, SUI: 0, XTZ: 0, EOS: 0, HBAR: 0, XMR: 0, KSM: 0, AAVE: 0, MKR: 0, GRT: 0,
    RUNE: 0, FTM: 0, SAND: 0, MANA: 0, AXS: 0, CHZ: 0, CRV: 0, COMP: 0, SNX: 0, '1INCH': 0,
    LDO: 0, RNDR: 0, STX: 0, IMX: 0, FLOW: 0, GALA: 0, APE: 0, EGLD: 0, KAVA: 0, ZEC: 0,
    DASH: 0, NEO: 0, IOTA: 0, QTUM: 0, WAVES: 0, ZIL: 0, ENJ: 0, BAT: 0, LRC: 0, ANKR: 0,
    RVN: 0, HOT: 0, OMG: 0, LUNA: 0
};
let cryptoPriceHistory = Object.fromEntries(Object.keys(cryptoPrices).map(c => [c, []]));
let priceChanges = Object.fromEntries(Object.keys(cryptoPrices).map(c => [c, 0]));
let previousPrices = { ...cryptoPrices };
let selectedMarket = 'BTC/USDT';
let selectedCrypto = 'BTC';
let tradeMode = 'buy';
let currentTimeframe = '15m';
let favoritePairs = new Set();
let currentUser = null;
let tradingChart = null;
let volumeChart = null;
let candlestickSeries = null;
let volumeSeries = null;
let ws = null;
let isFetchingPrices = false;

const cryptoIdMap = {
    BTC: 'BTC', ETH: 'ETH', USDT: 'USDT', BNB: 'BNB', LTC: 'LTC',
    TON: 'TON', XRP: 'XRP', SOL: 'SOL', USDC: 'USDC', DOGE: 'DOGE',
    TRX: 'TRX', ADA: 'ADA', WBTC: 'WBTC', AVAX: 'AVAX', SHIB: 'SHIB',
    LINK: 'LINK', DOT: 'DOT', MATIC: 'MATIC', BCH: 'BCH',
    UNI: 'UNI', XLM: 'XLM', VET: 'VET', ATOM: 'ATOM', FIL: 'FIL',
    ALGO: 'ALGO', NEAR: 'NEAR', ICP: 'ICP', APT: 'APT',
    ARB: 'ARB', OP: 'OP', INJ: 'INJ', SUI: 'SUI',
    XTZ: 'XTZ', EOS: 'EOS', HBAR: 'HBAR', XMR: 'XMR',
    KSM: 'KSM', AAVE: 'AAVE', MKR: 'MKR', GRT: 'GRT', RUNE: 'RUNE',
    FTM: 'FTM', SAND: 'SAND', MANA: 'MANA', AXS: 'AXS',
    CHZ: 'CHZ', CRV: 'CRV', COMP: 'COMP', SNX: 'SNX', '1INCH': '1INCH',
    LDO: 'LDO', RNDR: 'RNDR', STX: 'STX', IMX: 'IMX', FLOW: 'FLOW',
    GALA: 'GALA', APE: 'APE', EGLD: 'EGLD', KAVA: 'KAVA', ZEC: 'ZEC',
    DASH: 'DASH', NEO: 'NEO', IOTA: 'IOTA', QTUM: 'QTUM', WAVES: 'WAVES',
    ZIL: 'ZIL', ENJ: 'ENJ', BAT: 'BAT', LRC: 'LRC', ANKR: 'ANKR',
    RVN: 'RVN', HOT: 'HOT', OMG: 'OMG', LUNA: 'LUNA'
};

const coingeckoIdMap = {
    BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', BNB: 'binancecoin', LTC: 'litecoin',
    TON: 'toncoin', XRP: 'ripple', SOL: 'solana', USDC: 'usd-coin', DOGE: 'dogecoin',
    TRX: 'tron', ADA: 'cardano', WBTC: 'wrapped-bitcoin', AVAX: 'avalanche-2', SHIB: 'shiba-inu',
    LINK: 'chainlink', DOT: 'polkadot', MATIC: 'matic-network', BCH: 'bitcoin-cash',
    UNI: 'uniswap', XLM: 'stellar', VET: 'vechain', ATOM: 'cosmos', FIL: 'filecoin',
    ALGO: 'algorand', NEAR: 'near', ICP: 'internet-computer', APT: 'aptos',
    ARB: 'arbitrum', OP: 'optimism', INJ: 'injective-protocol', SUI: 'sui',
    XTZ: 'tezos', EOS: 'eos', HBAR: 'hedera-hashgraph', XMR: 'monero',
    KSM: 'kusama', AAVE: 'aave', MKR: 'maker', GRT: 'the-graph', RUNE: 'thorchain',
    FTM: 'fantom', SAND: 'the-sandbox', MANA: 'decentraland', AXS: 'axie-infinity',
    CHZ: 'chiliz', CRV: 'curve-dao-token', COMP: 'compound-governance-token', SNX: 'synthetix-network-token',
    '1INCH': '1inch', LDO: 'lido-dao', RNDR: 'render-token', STX: 'blockstack',
    IMX: 'immutable-x', FLOW: 'flow', GALA: 'gala', APE: 'apecoin', EGLD: 'elrond-erd-2',
    KAVA: 'kava', ZEC: 'zcash', DASH: 'dash', NEO: 'neo', IOTA: 'iota',
    QTUM: 'qtum', WAVES: 'waves', ZIL: 'zilliqa', ENJ: 'enjincoin', BAT: 'basic-attention-token',
    LRC: 'loopring', ANKR: 'ankr', RVN: 'ravencoin', HOT: 'holotoken', OMG: 'omisego',
    LUNA: 'terra-luna-v2'
};

const cryptoSymbols = {
    BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: 'BNB', LTC: 'Ł', TON: 'TON', XRP: 'X', SOL: '◎', USDC: 'USDC', DOGE: 'Ð',
    TRX: 'TRX', ADA: '₳', WBTC: '₿', AVAX: 'AVAX', SHIB: 'SHIB', LINK: 'LINK', DOT: 'DOT', MATIC: 'MATIC', BCH: 'BCH', UNI: 'UNI',
    XLM: 'XLM', VET: 'VET', ATOM: 'ATOM', FIL: 'FIL', ALGO: 'ALGO', NEAR: 'NEAR', ICP: 'ICP', APT: 'APT', ARB: 'ARB', OP: 'OP',
    INJ: 'INJ', SUI: 'SUI', XTZ: 'XTZ', EOS: 'EOS', HBAR: 'HBAR', XMR: 'XMR', KSM: 'KSM', AAVE: 'AAVE', MKR: 'MKR', GRT: 'GRT',
    RUNE: 'RUNE', FTM: 'FTM', SAND: 'SAND', MANA: 'MANA', AXS: 'AXS', CHZ: 'CHZ', CRV: 'CRV', COMP: 'COMP', SNX: 'SNX', '1INCH': '1INCH',
04:14 PM CEST on Wednesday, July 09, 2025    LDO: 'LDO', RNDR: 'RNDR', STX: 'STX', IMX: 'IMX', FLOW: 'FLOW', GALA: 'GALA', APE: 'APE', EGLD: 'EGLD', KAVA: 'KAVA', ZEC: 'ZEC',
    DASH: 'DASH', NEO: 'NEO', IOTA: 'IOTA', QTUM: 'QTUM', WAVES: 'WAVES', ZIL: 'ZIL', ENJ: 'ENJ', BAT: 'BAT', LRC: 'LRC', ANKR: 'ANKR',
    RVN: 'RVN', HOT: 'HOT', OMG: 'OMG', LUNA: 'LUNA'
};

const cryptoLaunchTimes = {
    BTC: 1230940800, ETH: 1438214400, USDT: 1427846400, BNB: 1498867200, LTC: 1317945600,
    TON: 1627776000, XRP: 1341100800, SOL: 1581465600, USDC: 1537401600, DOGE: 1386115200,
    TRX: 1503964800, ADA: 1506729600, WBTC: 1548892800, AVAX: 1600041600, SHIB: 1596499200,
    LINK: 1505779200, DOT: 1592179200, MATIC: 1556582400, BCH: 1501545600, UNI: 1600214400,
    XLM: 1406505600, VET: 1501459200, ATOM: 1553049600, FIL: 1602633600, ALGO: 1560816000,
    NEAR: 1602633600, ICP: 1620604800, APT: 1665705600, ARB: 1679443200, OP: 1653955200,
    INJ: 1603065600, SUI: 1680480000, XTZ: 1506816000, EOS: 1498780800, HBAR: 1568678400,
    XMR: 1397347200, KSM: 1568764800, AAVE: 1601510400, MKR: 1419811200, GRT: 1608163200,
    RUNE: 1560816000, FTM: 1540339200, SAND: 1598918400, MANA: 1505779200, AXS: 1604966400,
    CHZ: 1536624000, CRV: 1597449600, COMP: 1592179200, SNX: 1520812800, '1INCH': 1608768000,
    LDO: 1608768000, RNDR: 1592179200, STX: 1572566400, IMX: 1617148800, FLOW: 1610409600,
    GALA: 1598918400, APE: 1647302400, EGLD: 1598832000, KAVA: 1572566400, ZEC: 1477612800,
    DASH: 1392422400, NEO: 1470009600, IOTA: 1496275200, QTUM: 1487116800, WAVES: 1462233600,
    ZIL: 1516406400, ENJ: 1509494400, BAT: 1496275200, LRC: 1502755200, ANKR: 1551312000,
    RVN: 1546214400, HOT: 1525132800, OMG: 1496275200, LUNA: 1653609600
};

const colorMap = {
    BTC: { start: 'f7931a', end: 'ffb74d' }, ETH: { start: '627eea', end: '8e44ad' },
    USDT: { start: '26a17b', end: '5ac8a8' }, BNB: { start: 'f3ba2f', end: 'f7de8a' },
    LTC: { start: 'b5b5b5', end: 'd9d9d9' }, TON: { start: '0088cc', end: '00b7eb' },
    XRP: { start: '222222', end: '555555' }, SOL: { start: '00ffa3', end: 'dc1fff' },
    USDC: { start: '2775ca', end: '5a9bd4' }, DOGE: { start: 'c3a634', end: 'e6c44f' },
    TRX: { start: 'eb0029', end: 'ff4d4d' }, ADA: { start: '3c84b9', end: '60a5fa' },
    WBTC: { start: 'f7931a', end: 'ffb74d' }, AVAX: { start: 'e84142', end: 'ff6b6b' },
    SHIB: { start: 'ff4500', end: 'ff8c00' }, LINK: { start: '2a5ada', end: '5a9bd4' },
    DOT: { start: 'e6007a', end: 'ff4d8c' }, MATIC: { start: '8247e5', end: 'a78bfa' },
    BCH: { start: '8dc351', end: 'b3ef7a' }, UNI: { start: 'ff007a', end: 'ff4d8c' },
    XLM: { start: '000000', end: '333333' }, VET: { start: '15bffd', end: '4ddbff' },
    ATOM: { start: '2e3148', end: '4a5d78' }, FIL: { start: '0090ff', end: '4dc3ff' },
    ALGO: { start: '000000', end: '333333' }, NEAR: { start: '00e3ae', end: '4dffcd' },
    ICP: { start: 'd81f Hawkins: 1620604800, APT: 1665705600, ARB: 1679443200, OP: 1653955200,
    INJ: 1603065600, SUI: 1680480000, XTZ: 1506816000, EOS: 1498780800, HBAR: 1568678400,
    XMR: 1397347200, KSM: 1568764800, AAVE: 1601510400, MKR: 1419811200, GRT: 1608163200,
    RUNE: 1560816000, FTM: 1540339200, SAND: 1598918400, MANA: 1505779200, AXS: 1604966400,
    CHZ: 1536624000, CRV: 1597449600, COMP: 1592179200, SNX: 1520812800, '1INCH': 1608768000,
    LDO: 1608768000, RNDR: 1592179200, STX: 1572566400, IMX: 1617148800, FLOW: 1610409600,
    GALA: 1598918400, APE: 1647302400, EGLD: 1598832000, KAVA: 1572566400, ZEC: 1477612800,
    DASH: 1392422400, NEO: 1470009600, IOTA: 1496275200, QTUM: 1487116800, WAVES: 1462233600,
    ZIL: 1516406400, ENJ: 1509494400, BAT: 1496275200, LRC: 1502755200, ANKR: 1551312000,
    RVN: 1546214400, HOT: 1525132800, OMG: 1496275200, LUNA: 1653609600
};

// Default transactions from history.html
const defaultTransactions = [
    {
        date: "2023-06-03T11:23:45Z",
        type: "deposit",
        crypto: "USDT",
        amount: 223529,
        price: 1.00,
        total: 223529,
        status: "success",
        pl: null
    },
    {
        date: "2023-06-03T12:47:19Z",
        type: "buy",
        crypto: "LUNA",
        amount: 174352,
        price: 1.282,
        total: 223529,
        status: "success",
        pl: null
    },
    {
        date: "2023-06-05T19:15:32Z",
        type: "sell",
        crypto: "LUNA",
        amount: 174352,
        price: 0.000,
        total: 0,
        status: "loss",
        pl: -223529
    }
];

function formatPrice(value) {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) return '$0.000000';
    const fractionDigits = value < 1 ? 6 : value < 100 ? 4 : 2;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
    }).format(value);
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function saveUserData() {
    if (currentUser) {
        localStorage.setItem(`user_${currentUser}`, JSON.stringify({ balance: 0, portfolio, transactions, favoritePairs: [...favoritePairs] }));
        console.log('User data saved for:', currentUser);
    }
}

function loadUserData() {
    if (currentUser) {
        const data = localStorage.getItem(`user_${currentUser}`);
        if (data) {
            const parsed = JSON.parse(data);
            balance = 0; // Enforce zero balance
            portfolio = parsed.portfolio || {};
            transactions = parsed.transactions || [...defaultTransactions]; // Ensure default transactions
            favoritePairs = new Set(parsed.favoritePairs || []);
            console.log('User data loaded for:', currentUser);
        } else {
            balance = 0;
            portfolio = {};
            transactions = [...defaultTransactions]; // Initialize with default transactions
            favoritePairs = new Set();
        }
        updateUI();
    }
}

function updateUI() {
    console.log('Updating UI, currentUser:', currentUser);
    const profileDropdown = document.getElementById('profile-dropdown');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    if (currentUser) {
        if (profileDropdown) profileDropdown.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        const profileBtn = document.getElementById('profile-btn');
        if (profileBtn) profileBtn.textContent = currentUser;
        // Update user info on kyc page
        const userUsername = document.getElementById('user-username');
        const userInfo = document.getElementById('user-info');
        if (userUsername) userUsername.textContent = currentUser;
        if (userInfo) userInfo.textContent = `Имя аккаунта: @${currentUser} 👤 | Email: ${currentUser.toLowerCase()}@example.com`;
    } else {
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        // Redirect to login if trying to access kyc page while not authenticated
        if (window.location.pathname.includes('kyc.html')) {
            openModal('login-modal');
            window.location.href = '../index.html';
        }
    }

    const path = window.location.pathname;
    let page;
    if (path.includes('index.html') || path === '/') page = 'home';
    else if (path.includes('trading.html')) page = 'trading';
    else if (path.includes('wallet.html')) page = 'wallet';
    else if (path.includes('portfolio.html')) page = 'portfolio';
    else if (path.includes('history.html')) page = 'history';
    else if (path.includes('kyc.html')) page = 'kyc';
    console.log('Active page:', page);

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Update main content visibility
    document.querySelectorAll('.main-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === page) {
            content.classList.add('active');
        }
    });

    if (page === 'portfolio') updatePortfolio();
    if (page === 'wallet') updateBalance();
    if (page === 'history') updateTransaction مقایسه
System: History();
    if (page === 'trading') {
        renderCryptoList();
        if (currentUser) {
            updateChart();
            updateOrderBook();
            updateTradeHistory();
        }
    }
    if (page === 'kyc' && currentUser) {
        updateKycPage();
    }
}

function updateKycPage() {
    // Handle sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const section = item.getAttribute('data-section');
            console.log('Selected sidebar section:', section);
            // Future implementation: switch content based on section
            if (section !== 'kyc') {
                alert('Эта секция еще не реализована');
            }
        });
    });
}

function restrictRegion(event) {
    event.preventDefault();
    alert('Недоступно в Вашем регионе');
}

function openModal(modalId) {
    console.log('Attempting to open modal:', modalId, 'currentUser:', currentUser);
    if (modalId === 'register-modal' && currentUser) {
        console.log('Blocked register-modal opening: User is already authenticated');
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal opened:', modalId);
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modalId) {
    console.log('Closing modal:', modalId, 'currentUser:', currentUser);
    const modal = document.getElementById(modalId);
    const error = document.getElementById(`${modalId}-error`);
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal closed:', modalId);
    } else {
        console.error('Modal not found:', modalId);
    }
    if (error) error.style.display = 'none';
}

function closeAllModals() {
    console.log('Closing all modals, currentUser:', currentUser);
    closeModal('register-modal');
    closeModal('login-modal');
}

function login() {
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    const error = document.getElementById('login-error');

    if (!username || !password) {
        if (error) {
            error.textContent = 'Введите имя пользователя и пароль';
            error.style.display = 'block';
        }
        return;
    }

    const user = localStorage.getItem(`user_${username}`);
    if (user && JSON.parse(user).password === hashPassword(password)) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        console.log('User logged in:', currentUser);
        closeAllModals();
        loadUserData();
    } else {
        if (error) {
            error.textContent = 'Неверное имя пользователя или пароль';
            error.style.display = 'block';
        }
    }
}

function register() {
    alert('Недоступно в Вашем регионе');
    return;
}

function logout() {
    console.log('Logging out, currentUser:', currentUser);
    if (ws) {
        ws.close();
        ws = null;
    }
    currentUser = null;
    localStorage.removeItem('currentUser');
    balance = 0;
    portfolio = {};
    transactions = [];
    favoritePairs = new Set();
    updateUI();
    window.location.href = '../index.html';
}

function renderCryptoList() {
    const cryptoItems = document.getElementById('crypto-items');
    if (!cryptoItems) {
        console.error('Element #crypto-items not found');
        return;
    }

    cryptoItems.innerHTML = '';
    if (!currentUser) {
        cryptoItems.innerHTML = '<div class="no-auth-message">Пожалуйста, войдите, чтобы просмотреть цены криптовалют.</div>';
        console.log('renderCryptoList: User not authenticated');
        return;
    }

    if (isFetchingPrices) {
        cryptoItems.innerHTML = '<div class="loading-message">Loading prices...</div>';
        return;
    }

    const searchInput = document.getElementById('pair-search');
    const searchQuery = searchInput ? searchInput.value.toUpperCase() : '';
    let displayedCoins = 0;
    Object.keys(cryptoPrices).forEach(crypto => {
        if (searchQuery && !crypto.includes(searchQuery) && !favoritePairs.has(`${crypto}/USDT`)) return;
        const price = cryptoPrices[crypto];
        const colors = colorMap[crypto] || colorMap.default;
        const isFavorite = favoritePairs.has(`${crypto}/USDT`);
        const changePercentage = previousPrices[crypto] && price > 0 ? ((price - previousPrices[crypto]) / previousPrices[crypto] * 100).toFixed(2) : '0.00';
        const item = document.createElement('div');
        item.className = `crypto-item ${selectedMarket.split('/')[0] === crypto ? 'selected' : ''}`;
        item.innerHTML = `
            <div class="crypto-info">
                <svg class="favorite-icon ${isFavorite ? 'active' : ''}" data-pair="${crypto}/USDT" onclick="toggleFavorite('${crypto}/USDT', event)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.286 7.03h7.397c.969 0 1.371 1.24.588 1.81l-5.98 4.34 2.286 7.03c.3.921-.755 1.688-1.54 1.118l-5.98-4.34-5.98 4.34c-.784.57-1.838-.197-1.54-1.118l2.286-7.03-5.98-4.34c-.784-.57-.381-1.81.588-1.81h7.397l2.286-7.03z"/>
                </svg>
                <span class="crypto-icon" style="background: linear-gradient(45deg, #${colors.start}, #${colors.end});">${cryptoSymbols[crypto] || crypto}</span>
                <span>${crypto}/USDT</span>
            </div>
            <div class="crypto-price">
                <div class="price">${formatPrice(price)}</div>
                <div class="change ${priceChanges[crypto] >= 0 ? 'positive' : 'negative'}">
                    ${priceChanges[crypto] >= 0 ? '+' : ''}${formatPrice(priceChanges[crypto])} (${changePercentage}%)
                </div>
            </div>
        `;
        item.onclick = () => selectCrypto(crypto);
        cryptoItems.appendChild(item);
        displayedCoins++;
    });
    if (displayedCoins === 0) {
        cryptoItems.innerHTML = '<div class="no-data-message">No coins match your search or favorites.</div>';
    }
}

function toggleFavorite(pair, event) {
    if (event) event.stopPropagation();
    if (favoritePairs.has(pair)) {
        favoritePairs.delete(pair);
    } else {
        favoritePairs.add(pair);
    }
    localStorage.setItem('favoritePairs', JSON.stringify([...favoritePairs]));
    renderCryptoList();
}

async function fetchCryptoPrices() {
    if (isFetchingPrices) return;
    isFetchingPrices = true;
    const cryptoItems = document.getElementById('crypto-items');
    if (cryptoItems) {
        cryptoItems.innerHTML = '<div class="loading-message">Loading prices...</div>';
    }

    const cacheKey = 'cryptoPricesCache';
    const cacheTTL = 5 * 60 * 1000; // 5 minutes
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cachedData) {
        const { timestamp, prices } = JSON.parse(cachedData);
        if (now - timestamp < cacheTTL && Object.values(prices).some(p => p > 0)) {
            Object.assign(cryptoPrices, prices);
            Object.keys(cryptoPrices).forEach(crypto => {
                previousPrices[crypto] = cryptoPrices[crypto] || previousPrices[crypto];
                priceChanges[crypto] = cryptoPrices[crypto] && previousPrices[crypto] ? cryptoPrices[crypto] - previousPrices[crypto] : 0;
                cryptoPriceHistory[crypto].push({ time: Math.floor(now / 1000), value: cryptoPrices[crypto] });
                if (cryptoPriceHistory[crypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
            });
            isFetchingPrices = false;
            updateUI();
            console.log('Loaded prices from cache');
            return;
        }
    }

    try {
        const symbols = Object.keys(cryptoIdMap);
        const batchSize = 30;
        const batches = [];
        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }

        const cryptoComparePrices = {};
        for (const batch of batches) {
            const batchSymbols = batch.join(',');
            const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${batchSymbols}&tsyms=USD&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
            if (!response.ok) {
                console.warn(`CryptoCompare API error for batch ${batchSymbols}: ${response.status} ${response.statusText}`);
                continue;
            }
            const data = await response.json();
            Object.assign(cryptoComparePrices, data);
        }

        const missingCoins = [];
        Object.keys(cryptoIdMap).forEach(crypto => {
            const price = cryptoComparePrices[crypto]?.USD || 0;
            if (!price || price <= 0) {
                missingCoins.push(crypto);
            } else {
                previousPrices[crypto] = cryptoPrices[crypto] || price;
                cryptoPrices[crypto] = price;
                priceChanges[crypto] = price - previousPrices[crypto];
                cryptoPriceHistory[crypto].push({ time: Math.floor(now / 1000), value: price });
                if (cryptoPriceHistory[crypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
            }
        });

        if (missingCoins.length > 0) {
            console.log('Fetching missing coins from CoinGecko:', missingCoins);
            const cgBatchSize = 20;
            const cgBatches = [];
            for (let i = 0; i < missingCoins.length; i += cgBatchSize) {
                cgBatches.push(missingCoins.slice(i, i + cgBatchSize));
            }

            for (const batch of cgBatches) {
                const coingeckoIds = batch.map(c => coingeckoIdMap[c]).join(',');
                const coingeckoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`);
                if (!coingeckoResponse.ok) {
                    console.warn(`CoinGecko API error for batch ${coingeckoIds}: ${coingeckoResponse.status} ${coingeckoResponse.statusText}`);
                    continue;
                }
                const coingeckoData = await coingeckoResponse.json();
                batch.forEach(crypto => {
                    const price = coingeckoData[coingeckoIdMap[crypto]]?.usd || 0;
                    if (price > 0) {
                        previousPrices[crypto] = cryptoPrices[crypto] || price;
                        cryptoPrices[crypto] = price;
                        priceChanges[crypto] = price - previousPrices[crypto];
                        cryptoPriceHistory[crypto].push({ time: Math.floor(now / 1000), value: price });
                        if (cryptoPriceHistory[crypto].length > 100) {
                            cryptoPriceHistory[crypto].shift();
                        }
                    }
                });
            }
        }

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, prices: cryptoPrices }));
        console.log('Crypto prices fetched and cached:', cryptoPrices);
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        const cryptoItems = document.getElementById('crypto-items');
        if (cryptoItems) {
            cryptoItems.innerHTML = '<div class="no-data-message">Failed to load prices. Please try again later.</div>';
        }
    } finally {
        isFetchingPrices = false;
        updateUI();
    }
}

function selectCrypto(crypto) {
    if (!currentUser) {
        openModal('login-modal');
        return;
    }
    selectedMarket = `${crypto}/USDT`;
    selectedCrypto = crypto;
    const marketSelect = document.getElementById('market-select');
    if (marketSelect) {
        marketSelect.value = selectedMarket;
    }
    updateChart();
    updateOrderBook();
    updateTradeHistory();
    renderCryptoList();
}

function setTimeframe(timeframe) {
    currentTimeframe = timeframe;
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    timeframeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') === `setTimeframe('${timeframe}')`) {
            btn.classList.add('active');
        }
    });
    updateChart();
}

async function updateChart() {
    if (!currentUser) return;
    const tradingChartContainer = document.getElementById('trading-chart');
    const volumeChartContainer = document.getElementById('volume-chart');
    if (!tradingChartContainer || !volumeChartContainer) return;

    // Initialize trading chart
    if (!tradingChart) {
        tradingChart = LightweightCharts.createChart(tradingChartContainer, {
            width: tradingChartContainer.offsetWidth,
            height: 400,
            layout: { background: { type: 'solid', color: '#1a1a1a' }, textColor: '#e6e6e6' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        candlestickSeries = tradingChart.addCandlestickSeries({
            upColor: '#43e97b',
            downColor: '#ff5733',
            borderVisible: false,
            wickUpColor: '#43e97b',
            wickDownColor: '#ff5733',
        });
    }

    // Initialize volume chart
    if (!volumeChart) {
        volumeChart = LightweightCharts.createChart(volumeChartContainer, {
            width: volumeChartContainer.offsetWidth,
            height: 100,
            layout: { background: { type: 'solid', color: '#1a1a1a' }, textColor: '#e6e6e6' },
            grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        volumeSeries = volumeChart.addHistogramSeries({
            color: '#7e6bff',
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.1, bottom: 0.1 },
        });
    }

    // Fetch historical data based on timeframe
    const timeframeSeconds = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '1h': 3600,
        '4h': 14400,
        '1d': 86400
    };
    const interval = timeframeSeconds[currentTimeframe] || 900;
    const now = Date.now() / 1000;
    const from = now - (100 * interval); // Fetch last 100 periods
    const symbol = cryptoIdMap[selectedCrypto];

    try {
        const response = await fetch(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=100&aggregate=${interval / 60}&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
        if (!response.ok) {
            console.warn(`Failed to fetch historical data for ${symbol}: ${response.status} ${response.statusText}`);
            return;
        }
        const data = await response.json();
        const historicalData = data.Data.Data.filter(d => d.close > 0).map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volumeto
        }));

        const candlestickData = historicalData.map(d => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close
        }));

        const volumeData = historicalData.map(d => ({
            time: d.time,
            value: d.volume,
            color: d.close >= d.open ? 'rgba(67, 233, 123, 0.3)' : 'rgba(255, 99, 132, 0.3)'
        }));

        candlestickSeries.setData(candlestickData);
        volumeSeries.setData(volumeData);

        // Synchronize time scales
        tradingChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            volumeChart.timeScale().setVisibleLogicalRange(range);
        });
        volumeChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            tradingChart.timeScale().setVisibleLogicalRange(range);
        });
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }

    // Resize charts on window resize
    window.addEventListener('resize', () => {
        if (tradingChart && tradingChartContainer) {
            tradingChart.resize(tradingChartContainer.offsetWidth, 400);
        }
        if (volumeChart && volumeChartContainer) {
            volumeChart.resize(volumeChartContainer.offsetWidth, 100);
        }
    });
}

function updateOrderBook() {
    if (!currentUser) return;
    const bidsContainer = document.getElementById('order-book-bids');
    const asksContainer = document.getElementById('order-book-asks');
    if (!bidsContainer || !asksContainer) return;

    const price = cryptoPrices[selectedCrypto] || 0;
    let bidRows = '';
    let askRows = '';
    for (let i = 0; i < 5; i++) {
        const bidPrice = price * (1 - i * 0.01);
        const askPrice = price * (1 + i * 0.01);
        const amount = (Math.random() * 10).toFixed(2);
        bidRows += `
            <tr>
                <td class="bid-price">${formatPrice(bidPrice)}</td>
                <td>${amount}</td>
            </tr>
        `;
        askRows += `
            <tr>
                <td class="ask-price">${formatPrice(askPrice)}</td>
                <td>${amount}</td>
            </tr>
        `;
    }
    bidsContainer.innerHTML = bidRows;
    asksContainer.innerHTML = askRows;
}

function updateTradeHistory() {
    if (!currentUser) return;
    const tradeHistoryItems = document.getElementById('trade-history-items');
    if (!tradeHistoryItems) return;

    tradeHistoryItems.innerHTML = transactions
        .filter(t => t.crypto === selectedCrypto)
        .map(t => `
            <div class="trade-row">
                <span>${new Date(t.date).toLocaleTimeString()}</span>
                <span class="${t.type === 'buy' ? 'buy' : 'sell'}">${t.type}</span>
                <span>${t.amount.toFixed(2)}</span>
                <span>${formatPrice(t.price)}</span>
                <span>${formatPrice(t.total)}</span>
            </div>
        `).join('');
}

function updatePortfolio() {
    const portfolioList = document.getElementById('portfolio-list');
    if (!portfolioList) return;

    portfolioList.innerHTML = '';
    Object.keys(portfolio).forEach(crypto => {
        const amount = portfolio[crypto];
        const currentPrice = cryptoPrices[crypto] || 0;
        const totalValue = amount * currentPrice;
        const colors = colorMap[crypto] || colorMap.default;
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <span class="crypto-icon" style="background: linear-gradient(45deg, #${colors.start}, #${colors.end});">${cryptoSymbols[crypto] || crypto}</span>
            <span>${crypto}</span>
            <span>${amount.toFixed(4)}</span>
            <span>${formatPrice(currentPrice)}</span>
            <span>${formatPrice(totalValue)}</span>
        `;
        portfolioList.appendChild(item);
    });
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = formatPrice(balance);
    }
}

function updateTransactionHistory() {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;

    transactionList.innerHTML = '';
    transactions.forEach(t => {
        const colors = colorMap[t.crypto] || colorMap.default;
        const row = document.createElement('div');
        row.className = 'transaction-row';
        row.innerHTML = `
            <span>${new Date(t.date).toLocaleString()}</span>
            <span class="${t.type}">${t.type}</span>
            <span class="crypto-icon" style="background: linear-gradient(45deg, #${colors.start}, #${colors.end});">${cryptoSymbols[t.crypto] || t.crypto}</span>
            <span>${t.amount.toFixed(2)}</span>
            <span>${formatPrice(t.price)}</span>
            <span>${formatPrice(t.total)}</span>
            <span class="${t.status}">${t.status}</span>
            <span class="${t.pl >= 0 ? 'positive' : 'negative'}">${t.pl !== null ? (t.pl >= 0 ? '+' : '') + formatPrice(t.pl) : '-'}</span>
        `;
        transactionList.appendChild(row);
    });
}

function toggleSupportChat() {
    const supportChat = document.getElementById('support-chat');
    if (supportChat) {
        supportChat.classList.toggle('active');
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    if (!chatInput || !chatBody) return;

    const message = chatInput.value.trim();
    if (message) {
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.textContent = message;
        chatBody.appendChild(userMessage);
        chatInput.value = '';

        setTimeout(() => {
            const supportMessage = document.createElement('div');
            supportMessage.className = 'chat-message support';
            supportMessage.textContent = 'Thank you for your message! Our support team will respond shortly.';
            chatBody.appendChild(supportMessage);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    }
}

function setTradeMode(mode) {
    tradeMode = mode;
    const buyTab = document.querySelector('.tabs .tab[onclick="setTradeMode(\'buy\')"]');
    const sellTab = document.querySelector('.tabs .tab[onclick="setTradeMode(\'sell\')"]');
    const tradeBtn = document.getElementById('trade-btn');
    if (buyTab && sellTab && tradeBtn) {
        buyTab.classList.toggle('active', mode === 'buy');
        sellTab.classList.toggle('active', mode === 'sell');
        tradeBtn.textContent = mode === 'buy' ? 'Buy' : 'Sell';
    }
}

function executeTrade() {
    const price = parseFloat(document.getElementById('trade-price')?.value) || 0;
    const amount = parseFloat(document.getElementById('trade-amount')?.value) || 0;
    const total = price * amount;
    if (!currentUser) {
        openModal('login-modal');
        return;
    }
    if (price <= 0 || amount <= 0) {
        alert('Please enter valid price and amount');
        return;
    }

    const transaction = {
        date: new Date().toISOString(),
        type: tradeMode,
        crypto: selectedCrypto,
        amount,
        price,
        total,
        status: 'success',
        pl: null
    };
    transactions.push(transaction);
    saveUserData();
    updateTradeHistory();
}

document.addEventListener('DOMContentLoaded', () => {
    currentUser = localStorage.getItem('currentUser');
    loadUserData();
    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 60000);

    const marketSelect = document.getElementById('market-select');
    if (marketSelect) {
        Object.keys(cryptoPrices).forEach(crypto => {
            const option = document.createElement('option');
            option.value = `${crypto}/USDT`;
            option.textContent = `${crypto}/USDT`;
            marketSelect.appendChild(option);
        });
        marketSelect.value = selectedMarket;
        marketSelect.addEventListener('change', () => {
            selectCrypto(marketSelect.value.split('/')[0]);
        });
    }

    const pairSearch = document.getElementById('pair-search');
    if (pairSearch) {
        pairSearch.addEventListener('input', renderCryptoList);
    }

    window.addEventListener('resize', () => {
        if (tradingChart && document.getElementById('trading chart')) {
            tradingChart.resize(document.getElementById('trading-chart').offsetWidth, 400);
        }
        if (volumeChart && document.getElementById('volume-chart')) {
            volumeChart.resize(document.getElementById('volume-chart').offsetWidth, 100);
        }
    });
});

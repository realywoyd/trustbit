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
let chart = null;
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
    LDO: 'LDO', RNDR: 'RNDR', STX: 'STX', IMX: 'IMX', FLOW: 'FLOW', GALA: 'GALA', APE: 'APE', EGLD: 'EGLD', KAVA: 'KAVA', ZEC: 'ZEC',
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
    ICP: { start: 'd81f26', end: 'ff4d4d' }, APT: { start: '17e6b9', end: '4dffd4' },
    ARB: { start: '2a3b5a', end: '5a7aa8' }, OP: { start: 'ff0420', end: 'ff4d4d' },
    INJ: { start: '1e4dd8', end: '4d8bff' }, SUI: { start: '1a8cff', end: '4db3ff' },
    XTZ: { start: '2c7dfe', end: '5aa8ff' }, EOS: { start: '000000', end: '333333' },
    HBAR: { start: '000000', end: '333333' }, XMR: { start: 'ff6600', end: 'ff9933' },
    KSM: { start: '000000', end: '333333' }, AAVE: { start: 'b6509e', end: 'e68bc5' },
    MKR: { start: '1aab9b', end: '4dd4b3' }, GRT: { start: '6747ed', end: '8b6bff' },
    RUNE: { start: '00d18b', end: '4dffa8' }, FTM: { start: '1969ff', end: '4d8bff' },
    SAND: { start: '00aeef', end: '4ddbff' }, MANA: { start: 'ff2a44', end: 'ff6b7a' },
    AXS: { start: '0085d2', end: '4db3ff' }, CHZ: { start: 'e30013', end: 'ff4d4d' },
    CRV: { start: '4066e0', end: '6b8bff' }, COMP: { start: '00d395', end: '4dffa8' },
    SNX: { start: '00d1ff', end: '4dffff' }, '1INCH': { start: '1f3b5b', end: '4d7aa8' },
    LDO: { start: '00a3ff', end: '4ddbff' }, RNDR: { start: 'ff3c3c', end: 'ff7a7a' },
    STX: { start: '5548de', end: '7a6bff' }, IMX: { start: '00c4b4', end: '4dffcd' },
    FLOW: { start: '00ef8b', end: '4dffa8' }, GALA: { start: '000000', end: '333333' },
    APE: { start: '0033cc', end: '4d7aff' }, EGLD: { start: '0d0221', end: '333366' },
    KAVA: { start: 'ff4338', end: 'ff7a7a' }, ZEC: { start: 'f4b728', end: 'ffd966' },
    DASH: { start: '008ce7', end: '4db3ff' }, NEO: { start: '58bf00', end: '8bff4d' },
    IOTA: { start: '000000', end: '333333' }, QTUM: { start: '2e9dfd', end: '6bb8ff' },
    WAVES: { start: '0153ff', end: '4d8bff' }, ZIL: { start: '49a49b', end: '7ad4b3' },
    ENJ: { start: '624de4', end: '8b6bff' }, BAT: { start: 'ff5000', end: 'ff8c4d' },
    LRC: { start: '2ab6f6', end: '6bd4ff' }, ANKR: { start: '1e4dd8', end: '4d8bff' },
    RVN: { start: '3848a0', end: '6b7aa8' }, HOT: { start: 'ff3c3c', end: 'ff7a7a' },
    OMG: { start: '1a1a1a', end: '4d4d4d' }, LUNA: { start: '2a2a72', end: '5c5cff' },
    default: { start: '7e6bff', end: '5a4bff' }
};

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

function saveUserData() {
    if (currentUser) {
        localStorage.setItem(`user_${currentUser}`, JSON.stringify({
            balance,
            portfolio,
            transactions,
            favoritePairs: [...favoritePairs]
        }));
        console.log('User data saved for:', currentUser);
    }
}

function loadUserData() {
    if (currentUser) {
        const data = localStorage.getItem(`user_${currentUser}`);
        if (data) {
            const parsed = JSON.parse(data);
            balance = parsed.balance || 0;
            portfolio = parsed.portfolio || {};
            transactions = parsed.transactions || [...defaultTransactions];
            favoritePairs = new Set(parsed.favoritePairs || []);
            console.log('User data loaded for:', currentUser);
        } else {
            balance = 0;
            portfolio = {};
            transactions = [...defaultTransactions];
            favoritePairs = new Set();
            console.log('Initialized default user data for:', currentUser);
        }
        updateUI();
    }
}

function updateUI() {
    console.log('updateUI called, currentUser:', currentUser);
    const profileDropdown = document.getElementById('profile-dropdown');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const profileBtn = document.getElementById('profile-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (currentUser) {
        if (profileDropdown) profileDropdown.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (profileBtn) profileBtn.textContent = currentUser;
        const userUsername = document.getElementById('user-username');
        const userInfo = document.getElementById('user-info');
        if (userUsername) userUsername.textContent = currentUser;
        if (userInfo) userInfo.textContent = `Имя аккаунта: @${currentUser} 👤 | Email: ${currentUser.toLowerCase()}@example.com`;
        if (dropdownMenu) dropdownMenu.style.display = 'none'; // Ensure dropdown is hidden by default
    } else {
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'none';
        if (dropdownMenu) dropdownMenu.style.display = 'none';
    }

    const path = window.location.pathname;
    let page;
    if (path.includes('index.html') || path === '/' || path === '') page = 'home';
    else if (path.includes('trading.html')) page = 'trading';
    else if (path.includes('wallet.html')) page = 'wallet';
    else if (path.includes('portfolio.html')) page = 'portfolio';
    else if (path.includes('history.html')) page = 'history';
    else if (path.includes('kyc.html')) page = 'kyc';
    console.log('Active page:', page);

    // Restrict access to KYC, Wallet, and History pages for unauthorized users
    if (['kyc', 'wallet', 'history'].includes(page) && !currentUser) {
        console.log(`Unauthorized access attempt to ${page}.html, redirecting to index.html`);
        openModal('login-modal');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100); // Small delay to ensure modal opens before redirect
        return;
    }

    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.main-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === page) {
            content.classList.add('active');
        }
    });

    if (page === 'portfolio') updatePortfolio();
    if (page === 'wallet') updateBalance();
    if (page === 'history') updateTransactionHistory();
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
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.removeEventListener('click', handleSidebarClick); // Remove previous listeners
        item.addEventListener('click', handleSidebarClick);
    });
}

function handleSidebarClick() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    const section = this.getAttribute('data-section');
    console.log('Selected sidebar section:', section);
    if (section !== 'kyc') {
        alert('Эта секция еще не реализована');
    }
}

function restrictRegion(event) {
    event.preventDefault();
    console.log('restrictRegion called');
    alert('Недоступно в Вашем регионе');
}

function openModal(modalId) {
    console.log('openModal called with:', modalId, 'currentUser:', currentUser);
    if (modalId === 'register-modal') {
        console.log('Blocked register-modal opening: Registration is disabled');
        alert('Регистрация недоступна');
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal opened:', modalId);
        const error = document.getElementById(`${modalId}-error`);
        if (error) error.style.display = 'none';
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeModal(modalId) {
    console.log('closeModal called with:', modalId, 'currentUser:', currentUser);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal closed:', modalId);
        const error = document.getElementById(`${modalId}-error`);
        if (error) error.style.display = 'none';
    } else {
        console.error('Modal not found:', modalId);
    }
}

function closeAllModals() {
    console.log('closeAllModals called, currentUser:', currentUser);
    closeModal('login-modal');
}

async function login() {
    console.log('login function called at', new Date().toISOString());
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    const error = document.getElementById('login-error');

    if (!username || !password) {
        if (error) {
            error.textContent = 'Введите имя пользователя и пароль';
            error.style.display = 'block';
        }
        console.error('Login failed: Username or password missing');
        return;
    }

    const validUsername = 'anna_186';
    const validPassword = '!QwertY123';
    if (username === validUsername && password === validPassword) {
        currentUser = username;
        localStorage.setItem('currentUser', currentUser);
        if (!localStorage.getItem(`user_${currentUser}`)) {
            localStorage.setItem(`user_${currentUser}`, JSON.stringify({
                balance: 0,
                portfolio: {},
                transactions: [...defaultTransactions],
                favoritePairs: []
            }));
        }
        console.log('User logged in:', currentUser);
        closeAllModals();
        await loadUserData();
    } else {
        if (error) {
            error.textContent = 'Неверное имя пользователя или пароль';
            error.style.display = 'block';
        }
        console.error('Login failed: Invalid credentials');
    }
}

function register() {
    console.log('register function called, but registration is disabled');
    alert('Регистрация недоступна');
}

async function logout() {
    console.log('logout called, currentUser:', currentUser);
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
    window.location.href = 'index.html';
}

function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu) {
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';
        console.log('Dropdown toggled, visible:', !isVisible);
    } else {
        console.error('Dropdown menu not found');
    }
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
    saveUserData();
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
    const cacheTTL = 5 * 60 * 1000;
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();

    try {
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

        const symbols = Object.keys(cryptoIdMap);
        const batchSize = 30;
        const batches = [];
        for (let i = 0; i < symbols.length; i += batchSize) {
            batches.push(symbols.slice(i, i + batchSize));
        }

        const cryptoComparePrices = {};
        for (const batch of batches) {
            const batchSymbols = batch.join(',');
            try {
                const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${batchSymbols}&tsyms=USD&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
                if (!response.ok) {
                    console.warn(`CryptoCompare API error for batch ${batchSymbols}: ${response.status} ${response.statusText}`);
                    continue;
                }
                const data = await response.json();
                Object.assign(cryptoComparePrices, data);
            } catch (error) {
                console.warn(`Error fetching CryptoCompare prices for batch ${batchSymbols}:`, error);
            }
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
                try {
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
                } catch (error) {
                    console.warn(`Error fetching CoinGecko prices for batch ${coingeckoIds}:`, error);
                }
            }
        }

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, prices: cryptoPrices }));
        console.log('Crypto prices fetched and cached:', cryptoPrices);
    } catch (error) {
        console.error('Unexpected error fetching crypto prices:', error);
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
        console.log('selectCrypto: No currentUser, opening login modal');
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

function initChart() {
    const chartContainer = document.getElementById('trading-chart');
    const volumeContainer = document.getElementById('volume-chart');
    if (!chartContainer || !volumeContainer) {
        console.error('Chart containers not found');
        return;
    }

    chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 400,
        layout: { background: { type: 'solid', color: '#1e222d' }, textColor: '#e6e6e6' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
        rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)' },
        timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
    });

    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#43e97b', downColor: '#f5576c', borderVisible: false, wickUpColor: '#43e97b', wickDownColor: '#f5576c'
    });

    const volumeChart = LightweightCharts.createChart(volumeContainer, {
        width: volumeContainer.clientWidth,
        height: 100,
        layout: { background: { type: 'solid', color: '#1e222d' }, textColor: '#e6e6e6' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
        rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', visible: false },
        timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false },
    });

    volumeSeries = volumeChart.addHistogramSeries({ color: '#7e6bff', priceFormat: { type: 'volume' } });

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
        volumeChart.timeScale().setVisibleLogicalRange(chart.timeScale().getVisibleLogicalRange());
    });
    volumeChart.timeScale().subscribeVisibleLogicalRangeChange(() => {
        chart.timeScale().setVisibleLogicalRange(volumeChart.timeScale().getVisibleLogicalRange());
    });

    if (currentUser) {
        initWebSocket();
        updateChart();
    }
}

function initWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
    }
    const symbol = cryptoIdMap[selectedCrypto];
    const interval = currentTimeframe === '1m' ? '60' : currentTimeframe === '5m' ? '300' : currentTimeframe === '15m' ? '900' : currentTimeframe === '1h' ? '3600' : currentTimeframe === '4h' ? '14400' : '86400';
    ws = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
    ws.onopen = () => {
        console.log(`WebSocket opened for ${selectedMarket}`);
        ws.send(JSON.stringify({
            action: 'SubAdd',
            subs: [`2~Binance~${symbol}~USDT~${interval}`]
        }));
    };
    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.TYPE === '2' && message.FROMSYMBOL === symbol && message.TOSYMBOL === 'USDT' && message.CLOSE) {
                const candlestick = {
                    time: Math.floor(message.TS),
                    open: parseFloat(message.OPEN),
                    high: parseFloat(message.HIGH),
                    low: parseFloat(message.LOW),
                    close: parseFloat(message.CLOSE),
                    volume: parseFloat(message.VOLUME)
                };
                candlestickSeries.update(candlestick);
                volumeSeries.update({
                    time: candlestick.time,
                    value: candlestick.volume,
                    color: candlestick.close >= candlestick.open ? 'rgba(67, 233, 123, 0.3)' : 'rgba(245, 87, 108, 0.3)'
                });
                previousPrices[selectedCrypto] = cryptoPrices[selectedCrypto] || candlestick.close;
                cryptoPrices[selectedCrypto] = candlestick.close;
                priceChanges[selectedCrypto] = candlestick.close - previousPrices[selectedCrypto];
                cryptoPriceHistory[selectedCrypto].push({ time: Math.floor(Date.now() / 1000), value: candlestick.close });
                if (cryptoPriceHistory[selectedCrypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
                updateUI();
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    };
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    ws.onclose = () => {
        console.log('WebSocket closed, attempting to reconnect...');
        setTimeout(initWebSocket, 5000);
    };
}

async function fetchChartData(timeframe) {
    try {
        const symbol = cryptoIdMap[selectedCrypto];
        const interval = timeframe === '1m' ? 'histominute' : timeframe === '5m' ? 'histominute' : timeframe === '15m' ? 'histominute' : timeframe === '1h' ? 'histohour' : timeframe === '4h' ? 'histohour' : 'histoday';
        const aggregate = timeframe === '1m' ? 1 : timeframe === '5m' ? 5 : timeframe === '15m' ? 15 : timeframe === '1h' ? 1 : timeframe === '4h' ? 4 : 1;
        const limit = 1000;
        let allData = [];
        let toTs = Math.floor(Date.now() / 1000);
        const launchTs = cryptoLaunchTimes[selectedCrypto] || 1230940800;

        while (toTs > launchTs) {
            try {
                const response = await fetch(`https://min-api.cryptocompare.com/data/v2/${interval}?fsym=${symbol}&tsym=USDT&limit=${limit}&aggregate=${aggregate}&toTs=${toTs}&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
                if (!response.ok) {
                    console.warn(`CryptoCompare chart API error: ${response.status} ${response.statusText}`);
                    break;
                }
                const data = await response.json();
                if (data.Response !== 'Success' || !data.Data || data.Data.length === 0) {
                    console.log('No more historical data available from CryptoCompare');
                    break;
                }
                const candles = data.Data.Data.map(item => ({
                    time: item.time,
                    open: parseFloat(item.open),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    close: parseFloat(item.close),
                    volume: parseFloat(item.volumeto)
                }));
                allData = [...candles, ...allData];
                toTs = data.Data.TimeFrom - 1;
                if (data.Data.Data.length < limit) break;
            } catch (error) {
                console.warn(`Error fetching chart data from CryptoCompare for ${symbol}:`, error);
                break;
            }
        }

        if (allData.length === 0) {
            console.log(`Fetching chart data for ${selectedCrypto} from CoinGecko`);
            const cgId = coingeckoIdMap[selectedCrypto];
            const days = timeframe === '1m' || timeframe === '5m' || timeframe === '15m' ? 1 : timeframe === '1h' || timeframe === '4h' ? 7 : 30;
            try {
                const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`);
                if (!cgResponse.ok) {
                    console.warn(`CoinGecko chart API error: ${cgResponse.status} ${cgResponse.statusText}`);
                    return [];
                }
                const cgData = await cgResponse.json();
                allData = cgData.prices.map(([time, price]) => ({
                    time: Math.floor(time / 1000),
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: cgData.total_volumes.find(v => v[0] === time)?.[1] || 0
                }));
            } catch (error) {
                console.warn(`Error fetching chart data from CoinGecko for ${cgId}:`, error);
                return [];
            }
        }

        const uniqueData = Array.from(new Map(allData.map(item => [item.time, item])).values()).sort((a, b) => a.time - b.time);
        return uniqueData;
    } catch (error) {
        console.error('Unexpected error fetching chart data:', error);
        return [];
    }
}

async function updateChart() {
    if (!candlestickSeries || !volumeSeries || !currentUser) {
        console.log('Chart update skipped: missing series or user');
        return;
    }
    const data = await fetchChartData(currentTimeframe);
    if (data.length === 0) {
        console.warn('No chart data available, using dummy data');
        const now = Math.floor(Date.now() / 1000);
        data.push({
            time: now - 3600,
            open: cryptoPrices[selectedCrypto] || 100,
            high: (cryptoPrices[selectedCrypto] || 100) * 1.01,
            low: (cryptoPrices[selectedCrypto] || 100) * 0.99,
            close: cryptoPrices[selectedCrypto] || 100,
            volume: 50000
        });
    }
    candlestickSeries.setData(data);
    volumeSeries.setData(data.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(67, 233, 123, 0.3)' : 'rgba(245, 87, 108, 0.3)'
    })));
    chart.timeScale().fitContent();
}

function updateOrderBook() {
    if (!currentUser) return;
    const orderBook = document.getElementById('order-book');
    if (!orderBook) return;

    orderBook.innerHTML = `
        <div class="order-book-header">Order Book</div>
        <div class="order-book-section">
            <div class="order-book-title">Bids</div>
            ${generateOrderRows(true)}
        </div>
        <div class="order-book-section">
            <div class="order-book-title">Asks</div>
            ${generateOrderRows(false)}
        </div>
    `;
}

function generateOrderRows(isBid) {
    const price = cryptoPrices[selectedCrypto] || 0;
    let rows = '';
    for (let i = 0; i < 5; i++) {
        const priceOffset = isBid ? -i * 0.01 : i * 0.01;
        const adjustedPrice = price * (1 + priceOffset);
        rows += `
            <div class="order-row">
                <span class="${isBid ? 'bid-price' : 'ask-price'}">${formatPrice(adjustedPrice)}</span>
                <span>${(Math.random() * 10).toFixed(2)}</span>
                <span>${formatPrice(adjustedPrice * (Math.random() * 10))}</span>
            </div>
        `;
    }
    return rows;
}

function updateTradeHistory() {
    if (!currentUser) return;
    const tradeHistory = document.getElementById('trade-history');
    if (!tradeHistory) return;

    tradeHistory.innerHTML = `
        <div class="trade-history-header">Trade History</div>
        ${transactions
            .filter(t => t.crypto === selectedCrypto)
            .map(t => `
                <div class="trade-row">
                    <span>${new Date(t.date).toLocaleTimeString()}</span>
                    <span class="${t.type === 'buy' ? 'buy' : 'sell'}">${t.type}</span>
                    <span>${t.amount.toFixed(2)}</span>
                    <span>${formatPrice(t.price)}</span>
                    <span>${formatPrice(t.total)}</span>
                </div>
            `).join('')}
    `;
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
        console.log('Support chat toggled, active:', supportChat.classList.contains('active'));
    } else {
        console.error('Support chat element not found');
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    if (!chatInput || !chatBody) {
        console.error('Chat elements not found:', { chatInput: !!chatInput, chatBody: !!chatBody });
        return;
    }

    const message = chatInput.value.trim();
    if (message) {
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-message user';
        userMessage.textContent = message;
        chatBody.appendChild(userMessage);
        chatInput.value = '';
        console.log('User message sent:', message);

        setTimeout(() => {
            const supportMessage = document.createElement('div');
            supportMessage.className = 'chat-message support';
            supportMessage.textContent = 'Thank you for your message! Our support team will respond shortly.';
            chatBody.appendChild(supportMessage);
            chatBody.scrollTop = chatBody.scrollHeight;
            console.log('Support response added');
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded triggered at', new Date().toISOString());
    try {
        currentUser = localStorage.getItem('currentUser');
        if (currentUser && currentUser !== 'anna_186') {
            console.log('Invalid stored user, clearing:', currentUser);
            currentUser = null;
            localStorage.removeItem('currentUser');
        }
        loadUserData();
        fetchCryptoPrices();
        initChart();
        setInterval(fetchCryptoPrices, 60000);

        const marketSelect = document.getElementById('market-select');
        if (marketSelect) {
            console.log('Populating market-select');
            Object.keys(cryptoPrices).forEach(crypto => {
                const option = document.createElement('option');
                option.value = `${crypto}/USDT`;
                option.textContent = `${crypto}/USDT`;
                marketSelect.appendChild(option);
            });
            marketSelect.value = selectedMarket;
            marketSelect.addEventListener('change', () => {
                console.log('Market select changed to:', marketSelect.value);
                selectCrypto(marketSelect.value.split('/')[0]);
            });
        } else {
            console.error('market-select not found');
        }

        const pairSearch = document.getElementById('pair-search');
        if (pairSearch) {
            pairSearch.addEventListener('input', () => {
                console.log('Pair search input:', pairSearch.value);
                renderCryptoList();
            });
        } else {
            console.error('pair-search not found');
        }

        const timeframeSelect = document.getElementById('timeframe-select');
        if (timeframeSelect) {
            timeframeSelect.addEventListener('change', () => {
                currentTimeframe = timeframeSelect.value;
                console.log('Timeframe changed to:', currentTimeframe);
                updateChart();
            });
        } else {
            console.error('timeframe-select not found');
        }

        const buyTab = document.getElementById('buy-tab');
        const sellTab = document.getElementById('sell-tab');
        if (buyTab && sellTab) {
            buyTab.addEventListener('click', () => {
                tradeMode = 'buy';
                buyTab.classList.add('active');
                sellTab.classList.remove('active');
                console.log('Trade mode set to buy');
            });
            sellTab.addEventListener('click', () => {
                tradeMode = 'sell';
                sellTab.classList.add('active');
                buyTab.classList.remove('active');
                console.log('Trade mode set to sell');
            });
        } else {
            console.error('Trade tabs not found:', { buyTab: !!buyTab, sellTab: !!sellTab });
        }

        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const loginSubmit = document.getElementById('login-submit');
        const profileBtn = document.getElementById('profile-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');

        console.log('Checking UI elements:', {
            loginBtn: !!loginBtn,
            registerBtn: !!registerBtn,
            loginSubmit: !!loginSubmit,
            profileBtn: !!profileBtn,
            dropdownMenu: !!dropdownMenu
        });

        if (loginBtn) {
            loginBtn.removeEventListener('click', openLoginModal); // Prevent duplicate listeners
            loginBtn.addEventListener('click', openLoginModal);
        } else {
            console.error('login-btn not found in DOM');
        }

        if (registerBtn) {
            registerBtn.removeEventListener('click', register); // Prevent duplicate listeners
            registerBtn.addEventListener('click', register);
        } else {
            console.error('register-btn not found in DOM');
        }

        if (loginSubmit) {
            loginSubmit.removeEventListener('click', login); // Prevent duplicate listeners
            loginSubmit.addEventListener('click', login);
        } else {
            console.error('login-submit not found in DOM');
        }

        if (profileBtn) {
            // Remove any existing listeners and attributes to prevent navigation
            profileBtn.replaceWith(profileBtn.cloneNode(true));
            const newProfileBtn = document.getElementById('profile-btn');
            // Remove href attribute and ensure no navigation
            if (newProfileBtn.hasAttribute('href')) {
                newProfileBtn.removeAttribute('href');
                console.log('Removed href attribute from profile-btn');
            }
            // Set pointer cursor to indicate clickability
            newProfileBtn.style.cursor = 'pointer';
            newProfileBtn.removeEventListener('click', handleProfileClick); // Prevent duplicate listeners
            newProfileBtn.addEventListener('click', handleProfileClick);
        } else {
            console.error('profile-btn not found in DOM');
        }

        // Close dropdown when clicking outside
        document.removeEventListener('click', handleOutsideClick); // Prevent duplicate listeners
        document.addEventListener('click', handleOutsideClick);

        // Handle dropdown menu item clicks
        if (dropdownMenu) {
            dropdownMenu.querySelectorAll('a').forEach(link => {
                link.removeEventListener('click', handleDropdownItemClick); // Prevent duplicate listeners
                link.addEventListener('click', handleDropdownItemClick);
            });
        } else {
            console.error('dropdown-menu not found in DOM');
        }

        window.addEventListener('resize', () => {
            if (chart && document.getElementById('trading-chart')) {
                chart.resize(document.getElementById('trading-chart').offsetWidth, 400);
            }
            if (volumeSeries && document.getElementById('volume-chart')) {
                const volumeChart = volumeSeries.chart();
                volumeChart.resize(document.getElementById('volume-chart').offsetWidth, 100);
            }
        });
    } catch (error) {
        console.error('Error during DOMContentLoaded:', error);
    }
});

// Helper functions to avoid duplicate event listeners
function openLoginModal() {
    console.log('Login button clicked');
    openModal('login-modal');
}

function handleProfileClick(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('Profile button clicked, toggling dropdown only');
    toggleDropdown(event);
}

function handleOutsideClick(event) {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileBtn = document.getElementById('profile-btn');
    if (dropdownMenu && profileBtn && !dropdownMenu.contains(event.target) && !profileBtn.contains(event.target)) {
        dropdownMenu.style.display = 'none';
        console.log('Dropdown closed due to outside click');
    }
}

function handleDropdownItemClick(event) {
    const href = this.getAttribute('href');
    const text = this.textContent.toLowerCase();
    console.log('Dropdown item clicked:', { text, href });
    if (href === '#' && text === 'logout') {
        event.preventDefault();
        logout();
        console.log('Logout link clicked');
    } else if (href && text === 'profile') {
        console.log('Profile link clicked, navigating to:', href);
        // Allow navigation to kyc.html
    } else {
        event.preventDefault();
        console.log('Unhandled dropdown link clicked:', text);
    }
}

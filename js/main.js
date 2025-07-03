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

// Маппинг для CoinGecko (некоторые тикеры отличаются, например, LUNA -> terra-luna-v2)
const coingeckoIdMap = {
    ...cryptoIdMap,
    LUNA: 'terra-luna-v2', // Terra 2.0 в CoinGecko
    '1INCH': '1inch',
    RNDR: 'render-token'
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
    default: { start: '7e6bff', end: '5a4bff' } // Добавлено: резервный цвет
};

function formatPrice(value) {
    if (typeof value !== 'number') return 'N/A';
    const fractionDigits = value < 1 ? 6 : value < 100 ? 4 : 2;
    return new Intl.NumberFormat('ru-RU', {
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
        localStorage.setItem(`user_${currentUser}`, JSON.stringify({ balance, portfolio, transactions, favoritePairs: [...favoritePairs] }));
        console.log('User data saved for:', currentUser);
    }
}

function loadUserData() {
    if (currentUser) {
        const data = localStorage.getItem(`user_${currentUser}`);
        if (data) {
            const parsed = JSON.parse(data);
            balance = parsed.balance || 1000;
            portfolio = parsed.portfolio || {};
            transactions = parsed.transactions || [];
            favoritePairs = new Set(parsed.favoritePairs || []);
            console.log('User data loaded for:', currentUser);
        }
    }
    updateUI();
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
    } else {
        if (profileDropdown) profileDropdown.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
    }

    const page = document.querySelector('.main-content.active')?.id;
    console.log('Active page:', page);
    if (page === 'portfolio') updatePortfolio();
    if (page === 'wallet') updateBalance();
    if (page === 'trading' && currentUser) {
        renderCryptoList();
        updateChart();
        updateOrderBook();
        updateTradeHistory();
    }
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
    balance = 1000;
    portfolio = {};
    transactions = [];
    favoritePairs = new Set();
    updateUI();
}

function renderCryptoList() {
    const cryptoItems = document.getElementById('crypto-items');
    if (!cryptoItems) {
        console.error('Element #crypto-items not found');
        return;
    }

    if (!currentUser) {
        cryptoItems.innerHTML = '<div class="no-auth-message">Пожалуйста, войдите, чтобы просмотреть цены криптовалют.</div>';
        console.log('renderCryptoList: User not authenticated');
        return;
    }

    cryptoItems.innerHTML = '';
    const searchInput = document.getElementById('pair-search');
    const searchQuery = searchInput ? searchInput.value.toUpperCase() : '';
    Object.keys(cryptoPrices).forEach(crypto => {
        if (searchQuery && !crypto.includes(searchQuery) && !favoritePairs.has(`${crypto}/USDT`)) return;
        const colors = colorMap[crypto] || colorMap.default;
        const isFavorite = favoritePairs.has(`${crypto}/USDT`);
        const price = cryptoPrices[crypto] || 0;
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
                <div class="price ${price === 0 ? 'zero' : ''}">$${formatPrice(price)}</div>
                <div class="change ${priceChanges[crypto] >= 0 ? 'positive' : 'negative'}">
                    ${priceChanges[crypto] >= 0 ? '+' : ''}${formatPrice(priceChanges[crypto])} (${((priceChanges[crypto] / previousPrices[crypto]) * 100).toFixed(2)}%)
                </div>
            </div>
        `;
        item.onclick = () => selectCrypto(crypto);
        cryptoItems.appendChild(item);
    });
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
    const cacheKey = 'cryptoPricesCache';
    const cacheTTL = 5 * 60 * 1000; // 5 минут
    const cachedData = localStorage.getItem(cacheKey);
    const now = Date.now();

    if (cachedData) {
        const { timestamp, prices } = JSON.parse(cachedData);
        if (now - timestamp < cacheTTL) {
            Object.assign(cryptoPrices, prices);
            Object.keys(cryptoPrices).forEach(crypto => {
                previousPrices[crypto] = cryptoPrices[crypto];
                priceChanges[crypto] = 0;
                cryptoPriceHistory[crypto].push({ time: Math.floor(now / 1000), value: cryptoPrices[crypto] });
                if (cryptoPriceHistory[crypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
            });
            updateUI();
            console.log('Loaded prices from cache');
            return;
        }
    }

    try {
        // Основной API: CryptoCompare
        const symbols = Object.keys(cryptoIdMap).join(',');
        const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
        const data = await response.json();
        const missingCoins = [];

        Object.keys(cryptoIdMap).forEach(crypto => {
            const price = data[crypto]?.USD || 0;
            if (price === 0) {
                missingCoins.push(crypto);
                console.warn(`No USD price for ${crypto} from CryptoCompare`);
            } else {
                previousPrices[crypto] = cryptoPrices[crypto] || price;
                cryptoPrices[crypto] = price;
                priceChanges[crypto] = (price - previousPrices[crypto]) || 0;
                cryptoPriceHistory[crypto].push({ time: Math.floor(Date.now() / 1000), value: price });
                if (cryptoPriceHistory[crypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
            }
        });

        // Резервный API: CoinGecko для монет, не найденных в CryptoCompare
        if (missingCoins.length > 0) {
            console.log('Fetching missing coins from CoinGecko:', missingCoins);
            const coingeckoIds = missingCoins.map(c => coingeckoIdMap[c]).join(',');
            const coingeckoResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`);
            const coingeckoData = await coingeckoResponse.json();
            missingCoins.forEach(crypto => {
                const cgId = coingeckoIdMap[crypto];
                const price = coingeckoData[cgId]?.usd || 0;
                if (price === 0) {
                    console.warn(`No USD price for ${crypto} from CoinGecko`);
                }
                previousPrices[crypto] = cryptoPrices[crypto] || price;
                cryptoPrices[crypto] = price;
                priceChanges[crypto] = (price - previousPrices[crypto]) || 0;
                cryptoPriceHistory[crypto].push({ time: Math.floor(Date.now() / 1000), value: price });
                if (cryptoPriceHistory[crypto].length > 100) {
                    cryptoPriceHistory[crypto].shift();
                }
            });
        }

        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, prices: cryptoPrices }));
        updateUI();
        console.log('Fetched and cached crypto prices');
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        Object.keys(cryptoPrices).forEach(crypto => {
            if (cryptoPrices[crypto] === 0) {
                cryptoPrices[crypto] = Math.random() * 1000; // Последний резерв для тестирования
                previousPrices[crypto] = cryptoPrices[crypto];
                priceChanges[crypto] = 0;
            }
        });
        updateUI();
    }
}

function selectCrypto(crypto) {
    selectedMarket = `${crypto}/USDT`;
    selectedCrypto = crypto;
    const selectedPair = document.getElementById('selected-pair');
    const pairIcon = document.getElementById('pair-icon');
    const selectedCryptoPair = document.getElementById('selected-crypto-pair');
    const tradePrice = document.getElementById('trade-price');
    const currentPrice = document.getElementById('current-price');
    const changeValue = document.getElementById('change-value');
    const trendIcon = document.getElementById('trend-icon');
    if (selectedPair) selectedPair.textContent = selectedMarket;
    if (pairIcon) pairIcon.textContent = cryptoSymbols[crypto] || crypto;
    if (selectedCryptoPair) selectedCryptoPair.textContent = crypto;
    if (tradePrice) tradePrice.value = formatPrice(cryptoPrices[crypto]);
    if (currentPrice) currentPrice.textContent = `$${formatPrice(cryptoPrices[crypto])}`;
    if (changeValue) changeValue.textContent = `${priceChanges[crypto] >= 0 ? '+' : ''}${formatPrice(priceChanges[crypto])} (${((priceChanges[crypto] / previousPrices[crypto]) * 100).toFixed(2)}%)`;
    if (trendIcon) {
        trendIcon.innerHTML = priceChanges[crypto] >= 0
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 14l7 7m0 0l7-7m-7 7V3"/>';
        trendIcon.style.stroke = priceChanges[crypto] >= 0 ? '#43e97b' : '#f5576c';
    }
    if (currentUser) {
        initWebSocket();
        updateChart();
        updateTradeHistory();
        updateOrderBook();
    }
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
            cryptoPrices[selectedCrypto] = candlestick.close;
            previousPrices[selectedCrypto] = cryptoPrices[selectedCrypto];
            priceChanges[selectedCrypto] = 0;
            updateUI();
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
            const response = await fetch(`https://min-api.cryptocompare.com/data/v2/${interval}?fsym=${symbol}&tsym=USDT&limit=${limit}&aggregate=${aggregate}&toTs=${toTs}&api_key=cf13104fc6185223c007641dec6e62a504b54ebacee65c51f757012da0ac5e4a`);
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
        }

        // Если данных нет, пробуем CoinGecko
        if (allData.length === 0) {
            console.log(`Fetching chart data for ${selectedCrypto} from CoinGecko`);
            const cgId = coingeckoIdMap[selectedCrypto];
            const days = timeframe === '1m' || timeframe === '5m' || timeframe === '15m' ? 1 : timeframe === '1h' || timeframe === '4h' ? 7 : 30;
            const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}`);
            const cgData = await cgResponse.json();
            allData = cgData.prices.map(([time, price]) => ({
                time: Math.floor(time / 1000),
                open: price,
                high: price,
                low: price,
                close: price,
                volume: cgData.total_volumes.find(v => v[0] === time)?.[1] || 0
            }));
        }

        const uniqueData = Array.from(new Map(allData.map(item => [item.time, item])).values()).sort((a, b) => a.time - b.time);
        return uniqueData;
    } catch (error) {
        console.error('Error fetching chart data:', error);
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

    const statsHigh = document.getElementById('stats-high');
    const statsLow = document.getElementById('stats-low');
    const statsVolume = document.getElementById('stats-volume');
    const statsMarketCap = document.getElementById('stats-market-cap');
    if (statsHigh && data.length) statsHigh.textContent = `$${formatPrice(Math.max(...data.map(d => d.high)))}`;
    if (statsLow && data.length) statsLow.textContent = `$${formatPrice(Math.min(...data.map(d => d.low)))}`;
    if (statsVolume && data.length) statsVolume.textContent = `${formatPrice(data.reduce((sum, d) => sum + d.volume, 0))} USDT`;
    if (statsMarketCap) statsMarketCap.textContent = `${formatPrice(cryptoPrices[selectedCrypto] * 1000000)} USDT`;
}

function setTradeMode(mode) {
    tradeMode = mode;
    const tabs = document.querySelectorAll('.tab');
    const tradeBtn = document.getElementById('trade-btn');
    if (tabs && tradeBtn) {
        tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.tab[onclick="setTradeMode('${mode}')"]`).classList.add('active');
        tradeBtn.textContent = mode === 'buy' ? 'Купить' : 'Продать';
        tradeBtn.style.background = mode === 'buy' ? 'linear-gradient(45deg, #43e97b, #38f9d7)' : 'linear-gradient(45deg, #f5576c, #f093fb)';
    }
}

function setTimeframe(timeframe) {
    currentTimeframe = timeframe;
    const timeframeButtons = document.querySelectorAll('.timeframe-btn');
    if (timeframeButtons) {
        timeframeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.timeframe-btn[onclick="setTimeframe('${timeframe}')"]`).classList.add('active');
        if (currentUser) {
            initWebSocket();
            updateChart();
        }
    }
}

function updateOrderBook() {
    if (!currentUser) return;
    const bids = document.getElementById('order-book-bids');
    const asks = document.getElementById('order-book-asks');
    if (!bids || !asks) return;

    bids.innerHTML = '';
    asks.innerHTML = '';

    const price = cryptoPrices[selectedCrypto];
    for (let i = 1; i <= 5; i++) {
        const bidPrice = price * (1 - i * 0.002);
        const askPrice = price * (1 + i * 0.002);
        const amount = Math.random() * 10;

        bids.innerHTML += `
            <tr class="buy">
                <td>${formatPrice(bidPrice)}</td>
                <td>${formatPrice(amount)}</td>
            </tr>
        `;
        asks.innerHTML += `
            <tr class="sell">
                <td>${formatPrice(askPrice)}</td>
                <td>${formatPrice(amount)}</td>
            </tr>
        `;
    }
}

function updateTradeHistory() {
    if (!currentUser) return;
    const tradeHistoryItems = document.getElementById('trade-history-items');
    if (!tradeHistoryItems) return;

    tradeHistoryItems.innerHTML = '';
    const trades = transactions.filter(t => t.crypto === selectedCrypto).slice(-5);
    trades.forEach(trade => {
        tradeHistoryItems.innerHTML += `
            <div class="trade-history-item">
                <span class="time">${new Date(trade.date).toLocaleTimeString()}</span>
                <span class="price ${trade.type === 'buy' ? 'positive' : 'negative'}">
                    ${formatPrice(trade.price)}
                </span>
                <span>${formatPrice(trade.amount)}</span>
            </div>
        `;
    });
}

function executeTrade() {
    if (!currentUser) {
        console.log('executeTrade: User not authenticated, opening login modal');
        openModal('login-modal');
        return;
    }

    const amount = parseFloat(document.getElementById('trade-amount')?.value);
    const price = parseFloat(document.getElementById('trade-price')?.value);
    if (!amount || amount <= 0 || !price) {
        alert('Введите корректные данные');
        return;
    }

    const total = amount * price;
    if (tradeMode === 'buy' && total > balance) {
        alert('Недостаточно средств');
        return;
    }

    if (tradeMode === 'sell' && (!portfolio[selectedCrypto] || portfolio[selectedCrypto] < amount)) {
        alert('Недостаточно криптовалюты');
        return;
    }

    if (tradeMode === 'buy') {
        balance -= total;
        portfolio[selectedCrypto] = (portfolio[selectedCrypto] || 0) + amount;
    } else {
        balance += total;
        portfolio[selectedCrypto] -= amount;
        if (portfolio[selectedCrypto] <= 0) delete portfolio[selectedCrypto];
    }

    transactions.push({
        date: new Date().toISOString(),
        type: tradeMode,
        crypto: selectedCrypto,
        amount,
        price,
        total,
        status: 'success'
    });

    saveUserData();
    updateUI();
    const tradeAmount = document.getElementById('trade-amount');
    const cryptoAmount = document.getElementById('crypto-amount');
    if (tradeAmount) tradeAmount.value = '';
    if (cryptoAmount) cryptoAmount.value = total.toFixed(2);
}

function updatePortfolio() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';
    Object.entries(portfolio).forEach(([crypto, amount]) => {
        const value = amount * cryptoPrices[crypto];
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <div class="crypto-icon" style="background: linear-gradient(45deg, #${colorMap[crypto]?.start || colorMap.default.start}, #${colorMap[crypto]?.end || colorMap.default.end})">
                ${cryptoSymbols[crypto] || crypto}
            </div>
            <h3>${crypto}</h3>
            <div class="portfolio-amount">${formatPrice(amount)} ${crypto}</div>
            <div class="portfolio-value">$${formatPrice(value)}</div>
        `;
        portfolioGrid.appendChild(item);
    });
}

function updateBalance() {
    const walletBalance = document.getElementById('wallet-balance-page');
    if (walletBalance) walletBalance.textContent = formatPrice(balance);
}

function updateTransactionHistory() {
    // Skip updating transaction history to preserve static content in history.html
}

function depositFunds() {
    if (!currentUser) {
        console.log('depositFunds: User not authenticated, opening login modal');
        openModal('login-modal');
        return;
    }

    const amount = parseFloat(document.getElementById('deposit-amount-page')?.value);
    const crypto = document.getElementById('deposit-crypto')?.value;
    if (!amount || amount <= 0 || !crypto) {
        alert('Введите корректные данные');
        return;
    }

    balance += amount * cryptoPrices[crypto];
    portfolio[crypto] = (portfolio[crypto] || 0) + amount;
    transactions.push({
        date: new Date().toISOString(),
        type: 'deposit',
        crypto,
        amount,
        price: cryptoPrices[crypto],
        total: amount * cryptoPrices[crypto],
        status: 'success'
    });

    saveUserData();
    updateUI();
    const depositAmount = document.getElementById('deposit-amount-page');
    if (depositAmount) depositAmount.value = '';
}

function updateWalletAddress() {
    const network = document.getElementById('deposit-network')?.value;
    const walletAddress = document.getElementById('wallet-address');
    if (!walletAddress || !network) return;
    const chars = '0123456789abcdef';
    let address = network === 'BTC' ? '1' : network === 'ETH' ? '0x' : '';
    const length = network === 'BTC' ? 33 : 40;
    for (let i = 0; i < length; i++) {
        address += chars[Math.floor(Math.random() * chars.length)];
    }
    walletAddress.textContent = address;
}

function toggleSupportChat() {
    const chat = document.getElementById('support-chat');
    if (chat) chat.classList.toggle('active');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    if (!input || !chatBody) return;

    const message = input.value.trim();
    if (!message) return;

    chatBody.innerHTML += `
        <div class="chat-message user">${message}</div>
    `;
    input.value = '';

    setTimeout(() => {
        chatBody.innerHTML += `
            <div class="chat-message support">Спасибо за ваше сообщение! Наша команда ответит вам в ближайшее время.</div>
        `;
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);

    chatBody.scrollTop = chatBody.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for currentUser:', localStorage.getItem('currentUser'));

    closeAllModals();

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        console.log('User authenticated on load:', currentUser);
        loadUserData();
    } else {
        console.log('No authenticated user found');
        openModal('login-modal');
    }

    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) dropdown.classList.toggle('active');
        });
    }

    const savedFavorites = localStorage.getItem('favoritePairs');
    if (savedFavorites) {
        favoritePairs = new Set(JSON.parse(savedFavorites));
    }

    fetchCryptoPrices();
    initChart();
    setInterval(fetchCryptoPrices, 60000);

    const pairSearch = document.getElementById('pair-search');
    if (pairSearch) {
        pairSearch.addEventListener('input', renderCryptoList);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('Navigating to page:', link.getAttribute('data-page'), 'currentUser:', currentUser);
            const pageId = link.getAttribute('data-page');
            document.querySelectorAll('.main-content').forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.add('active');
            if (currentUser) {
                closeAllModals();
            }
            updateUI();
        });
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

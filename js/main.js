import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// Initialize Supabase client
const supabase = createClient(
    'https://vihxlcvqjobqeyhkeine.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpaHhsY3Zxam9icWV5aGtlaW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDA2MTcsImV4cCI6MjA2NTgxNjYxN30.sHT7G91BKM4eAAp61fZLtGbl0qRNKlM9HtPm_uBxnB4'
);

// Global variables
let currentUser = null;
let balance = 1000; // Placeholder balance
let selectedPair = 'BTC/USDT';
let selectedCrypto = 'BTC';

// Navigation
function navigateTo(page, event) {
    if (event) event.preventDefault();
    console.log(`Navigating to: ${page}`);
    const pages = {
        home: 'index.html',
        trade: 'html/trading.html',
        wallet: 'html/wallet.html',
        portfolio: 'html/portfolio.html',
        history: 'html/history.html'
    };
    const targetPage = pages[page] || 'index.html';
    console.log(`Target page: ${targetPage}`);
    window.location.href = targetPage;
}

// Show login modal
function showLoginModal() {
    console.log('Opening login modal');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>Login</h2>
            <div class="input-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" placeholder="Enter email" required>
            </div>
            <div class="input-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" placeholder="Enter password" required>
            </div>
            <button class="btn btn-primary" onclick="handleLogin()">Login</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Show register modal
function showRegisterModal() {
    console.log('Opening register modal');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>Register</h2>
            <div class="input-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" placeholder="Enter email" required>
            </div>
            <div class="input-group">
                <label for="register-password">Password</label>
                <input type="password" id="register-password" placeholder="Enter password" required>
            </div>
            <button class="btn btn-primary" onclick="handleRegister()">Register</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Toggle support chat
function toggleSupport() {
    console.log('Toggling support chat');
    const supportChat = document.getElementById('support-chat');
    if (supportChat) {
        supportChat.classList.toggle('active');
    } else {
        console.error('Support chat element not found');
    }
}

// Send support message
function sendMessage() {
    console.log('Sending support message');
    const input = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    if (!input || !chatBody || !input.value.trim()) {
        console.error('Chat input or body not found, or input is empty');
        return;
    }
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.textContent = input.value;
    chatBody.appendChild(userMessage);
    const supportMessage = document.createElement('div');
    supportMessage.className = 'chat-message support';
    supportMessage.textContent = 'Thank you for your message! Our team will respond soon.';
    chatBody.appendChild(supportMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
    input.value = '';
}

// Register user
async function registerUser(email, password) {
    try {
        console.log('Registering user:', email);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        console.log('User registered:', data.user);
        alert('Registration successful! Check your email for confirmation.');
        return data.user;
    } catch (error) {
        console.error('Registration error:', error.message);
        alert(`Registration error: ${error.message}`);
        return null;
    }
}

// Login user
async function loginUser(email, password) {
    try {
        console.log('Logging in user:', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        console.log('User logged in:', data.user);
        currentUser = data.user;
        updateAuthUI();
        return data.user;
    } catch (error) {
        console.error('Login error:', error.message);
        alert(`Login error: ${error.message}`);
        return null;
    }
}

// Logout user
async function logoutUser() {
    try {
        console.log('Logging out user');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log('User logged out');
        currentUser = null;
        updateAuthUI();
    } catch (error) {
        console.error('Logout error:', error.message);
        alert(`Logout error: ${error.message}`);
    }
}

// Update auth UI
function updateAuthUI() {
    const userControls = document.querySelector('.user-controls');
    if (!userControls) {
        console.error('User controls element not found');
        return;
    }
    console.log('Updating auth UI, currentUser:', !!currentUser);
    if (currentUser) {
        userControls.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn">Profile</button>
                <div class="dropdown-menu">
                    <a href="#" onclick="navigateTo('wallet')">Wallet</a>
                    <a href="#" onclick="logoutUser()">Logout</a>
                </div>
            </div>
        `;
        const profileBtn = document.querySelector('.profile-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (profileBtn && dropdownMenu) {
            profileBtn.addEventListener('click', () => {
                console.log('Toggling profile dropdown');
                dropdownMenu.classList.toggle('active');
            });
        }
    } else {
        userControls.innerHTML = `
            <button class="login-btn" onclick="showLoginModal()">Login</button>
            <button class="register-btn" onclick="showRegisterModal()">Register</button>
        `;
    }
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;
    if (!email || !password) {
        console.error('Login inputs missing:', { email, password });
        alert('Please fill all fields');
        return;
    }
    const user = await loginUser(email, password);
    if (user) {
        console.log('Closing login modal');
        document.querySelector('.modal')?.remove();
        if (window.location.pathname.includes('trading.html')) {
            initializeTradingPage();
        } else if (window.location.pathname.includes('wallet.html')) {
            initializeWalletPage();
        } else if (window.location.pathname.includes('portfolio.html')) {
            initializePortfolioPage();
        } else if (window.location.pathname.includes('history.html')) {
            initializeHistoryPage();
        }
    }
}

// Handle register
async function handleRegister() {
    const email = document.getElementById('register-email')?.value;
    const password = document.getElementById('register-password')?.value;
    if (!email || !password) {
        console.error('Register inputs missing:', { email, password });
        alert('Please fill all fields');
        return;
    }
    const user = await registerUser(email, password);
    if (user) {
        console.log('Closing register modal');
        document.querySelector('.modal')?.remove();
    }
}

// Fetch crypto prices
async function fetchCryptoPrices() {
    console.log('Fetching crypto prices');
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano');
        const data = await response.json();
        console.log('Crypto prices fetched:', data);
        return data.reduce((acc, coin) => {
            acc[coin.symbol.toUpperCase()] = coin.current_price;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        return {};
    }
}

// Initialize trading chart
function initializeChart() {
    console.log('Initializing chart');
    const chartContainer = document.getElementById('trading-chart');
    if (!chartContainer || !window.TradingView) {
        console.error('Chart container or TradingView not found');
        return;
    }
    const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 400,
        layout: { backgroundColor: 'transparent', textColor: '#e6e6e6' },
        grid: { vertLines: { color: 'rgba(255, 255, 255, 0.1)' }, horzLines: { color: 'rgba(255, 255, 255, 0.1)' } },
        timeScale: { timeVisible: true, secondsVisible: false }
    });
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#43e97b',
        downColor: '#f5576c',
        borderVisible: false,
        wickUpColor: '#43e97b',
        wickDownColor: '#f5576c'
    });
    // Mock data for testing
    candleSeries.setData([
        { time: '2025-06-01', open: 50000, high: 51000, low: 49000, close: 50500 },
        { time: '2025-06-02', open: 50500, high: 52000, low: 50000, close: 51500 },
        { time: '2025-06-03', open: 51500, high: 52500, low: 51000, close: 52000 }
    ]);
}

// Update trading UI
async function updateTradingUI() {
    console.log('Updating trading UI');
    const prices = await fetchCryptoPrices();
    const priceElement = document.getElementById('current-price');
    const changeElement = document.getElementById('change-value');
    if (priceElement && changeElement) {
        const price = prices[selectedCrypto] || 0;
        priceElement.textContent = `$${price.toFixed(2)}`;
        changeElement.textContent = '$0.00 (0%)'; // Placeholder
    } else {
        console.error('Price or change elements not found');
    }
}

// Render crypto list
async function renderCryptoList() {
    console.log('Rendering crypto list');
    const cryptoItems = document.getElementById('crypto-items');
    if (!cryptoItems) {
        console.error('Crypto items element not found');
        return;
    }
    const prices = await fetchCryptoPrices();
    const cryptos = [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
        { symbol: 'ADA', name: 'Cardano', icon: '₳' }
    ];
    cryptoItems.innerHTML = cryptos.map(crypto => `
        <div class="crypto-item" data-symbol="${crypto.symbol}">
            <div class="crypto-info">
                <span class="crypto-icon">${crypto.icon}</span>
                <span>${crypto.name} (${crypto.symbol}/USDT)</span>
            </div>
            <div class="crypto-price">
                <span class="price">$${prices[crypto.symbol]?.toFixed(2) || '0.00'}</span>
                <span class="change positive">+0%</span>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.crypto-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log('Selected crypto:', item.dataset.symbol);
            selectedPair = `${item.dataset.symbol}/USDT`;
            selectedCrypto = item.dataset.symbol;
            updateTradingUI();
        });
    });
}

// Render order book
function renderOrderBook() {
    console.log('Rendering order book');
    const asksElement = document.getElementById('order-book-asks');
    const bidsElement = document.getElementById('order-book-bids');
    if (!asksElement || !bidsElement) {
        console.error('Order book elements not found');
        return;
    }
    // Mock data
    asksElement.innerHTML = `
        <tr class="sell"><td>50000.00</td><td>0.5</td></tr>
        <tr class="sell"><td>49900.00</td><td>0.3</td></tr>
    `;
    bidsElement.innerHTML = `
        <tr class="buy"><td>49800.00</td><td>0.4</td></tr>
        <tr class="buy"><td>49700.00</td><td>0.6</td></tr>
    `;
}

// Render trade history
function renderTradeHistory() {
    console.log('Rendering trade history');
    const historyElement = document.getElementById('trade-history-items');
    if (!historyElement) {
        console.error('Trade history element not found');
        return;
    }
    // Mock data
    historyElement.innerHTML = `
        <div class="trade-history-item">
            <span class="time">2025-06-19 12:00</span>
            <span class="price buy">50000.00</span>
            <span>0.1</span>
        </div>
    `;
}

// Handle trade
async function handleTrade() {
    console.log('Handling trade');
    if (!currentUser) {
        console.error('User not logged in');
        alert('Please log in to trade');
        showLoginModal();
        return;
    }
    const price = parseFloat(document.getElementById('trade-price')?.value);
    const amount = parseFloat(document.getElementById('trade-amount')?.value);
    const mode = document.querySelector('.tab.active')?.dataset.mode;
    if (!price || !amount || !mode) {
        console.error('Invalid trade inputs:', { price, amount, mode });
        alert('Please fill all fields');
        return;
    }
    const total = price * amount;
    if (mode === 'buy' && total > balance) {
        console.error('Insufficient balance:', { balance, total });
        alert('Insufficient balance');
        return;
    }
    try {
        console.log('Executing trade:', { mode, crypto: selectedCrypto, amount, price, total });
        const { error } = await supabase.from('transactions').insert({
            user_id: currentUser.id,
            date: new Date().toISOString(),
            type: mode,
            crypto: selectedCrypto,
            amount,
            price,
            total,
            status: 'completed'
        });
        if (error) throw error;
        console.log('Trade recorded');
        if (mode === 'buy') {
            balance -= total;
            await supabase.from('portfolio').upsert({
                user_id: currentUser.id,
                crypto: selectedCrypto,
                amount: amount,
                updated_at: new Date().toISOString()
            }, { onConflict: ['user_id', 'crypto'] });
        } else {
            balance += total;
            const { data: portfolio } = await supabase.from('portfolio')
                .select('amount')
                .eq('user_id', currentUser.id)
                .eq('crypto', selectedCrypto)
                .single();
            if (portfolio && portfolio.amount >= amount) {
                await supabase.from('portfolio').update({
                    amount: portfolio.amount - amount,
                    updated_at: new Date().toISOString()
                }).eq('user_id', currentUser.id).eq('crypto', selectedCrypto);
            } else {
                console.error('Insufficient portfolio amount');
                alert('Insufficient crypto amount');
                return;
            }
        }
        console.log('Updating balance:', balance);
        updateTradingUI();
        renderTradeHistory();
        alert(`${mode.charAt(0).toUpperCase() + mode.slice(1)} successful!`);
    } catch (error) {
        console.error('Trade error:', error.message);
        alert(`Trade error: ${error.message}`);
    }
}

// Initialize trading page
function initializeTradingPage() {
    console.log('Initializing trading page');
    initializeChart();
    renderCryptoList();
    renderOrderBook();
    renderTradeHistory();
    updateTradingUI();
    const tradeBtn = document.getElementById('trade-btn');
    if (tradeBtn) {
        tradeBtn.addEventListener('click', handleTrade);
    } else {
        console.error('Trade button not found');
    }
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Switching tab:', tab.dataset.mode);
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tradeBtn.textContent = tab.dataset.mode === 'buy' ? 'Buy' : 'Sell';
        });
    });
}

// Render portfolio
async function renderPortfolio() {
    console.log('Rendering portfolio');
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (!portfolioGrid) {
        console.error('Portfolio grid not found');
        return;
    }
    if (!currentUser) {
        console.error('User not logged in for portfolio');
        portfolioGrid.innerHTML = '<p>Please log in to view your portfolio.</p>';
        return;
    }
    try {
        const { data, error } = await supabase.from('portfolio')
            .select('crypto, amount')
            .eq('user_id', currentUser.id);
        if (error) throw error;
        console.log('Portfolio data:', data);
        const prices = await fetchCryptoPrices();
        portfolioGrid.innerHTML = data.length ? data.map(item => `
            <div class="portfolio-item">
                <span class="crypto-icon">${item.crypto.charAt(0).toUpperCase()}</span>
                <div class="portfolio-amount">${item.amount.toFixed(4)} ${item.crypto}</div>
                <div class="portfolio-value">$${(item.amount * (prices[item.crypto] || 0)).toFixed(2)}</div>
            </div>
        `).join('') : '<p>No assets in portfolio.</p>';
    } catch (error) {
        console.error('Portfolio error:', error.message);
        portfolioGrid.innerHTML = '<p>Error loading portfolio.</p>';
    }
}

// Initialize portfolio page
function initializePortfolioPage() {
    console.log('Initializing portfolio page');
    renderPortfolio();
}

// Render transactions
async function renderTransactions() {
    console.log('Rendering transactions');
    const transactionsTable = document.querySelector('.transactions-table tbody');
    if (!transactionsTable) {
        console.error('Transactions table not found');
        return;
    }
    if (!currentUser) {
        console.error('User not logged in for transactions');
        transactionsTable.innerHTML = '<tr><td colspan="7">Please log in to view transactions.</td></tr>';
        return;
    }
    try {
        const { data, error } = await supabase.from('transactions')
            .select('date, type, crypto, amount, price, total, status')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });
        if (error) throw error;
        console.log('Transactions data:', data);
        transactionsTable.innerHTML = data.length ? data.map(tx => `
            <tr>
                <td>${new Date(tx.date).toLocaleString()}</td>
                <td>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
                <td>${tx.crypto}</td>
                <td>${tx.amount.toFixed(4)}</td>
                <td>$${tx.price.toFixed(2)}</td>
                <td>$${tx.total.toFixed(2)}</td>
                <td class="status ${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</td>
            </tr>
        `).join('') : '<tr><td colspan="7">No transactions found.</td></tr>';
    } catch (error) {
        console.error('Transactions error:', error.message);
        transactionsTable.innerHTML = '<tr><td colspan="7">Error loading transactions.</td></tr>';
    }
}

// Initialize history page
function initializeHistoryPage() {
    console.log('Initializing history page');
    renderTransactions();
}

// Initialize wallet page
function initializeWalletPage() {
    console.log('Initializing wallet page');
    const balanceElement = document.getElementById('wallet-balance');
    if (balanceElement) {
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    } else {
        console.error('Wallet balance element not found');
    }
}

// Initialize
function init() {
    console.log('Initializing app');
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Session check:', session ? 'Session found' : 'No session');
        if (session) {
            currentUser = session.user;
            console.log('Current user:', currentUser.id);
        }
        updateAuthUI();
        if (window.location.pathname.includes('trading.html')) {
            initializeTradingPage();
        } else if (window.location.pathname.includes('wallet.html')) {
            initializeWalletPage();
        } else if (window.location.pathname.includes('portfolio.html')) {
            initializePortfolioPage();
        } else if (window.location.pathname.includes('history.html')) {
            initializeHistoryPage();
        }
    }).catch(error => {
        console.error('Error checking session:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    init();
});

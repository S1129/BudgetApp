// Select necessary elements for authentication
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const appContainer = document.getElementById('app-container');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

// Select input fields for registration and login
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');

// Budget App Elements
const balanceElement = document.getElementById('balance');
const transactionList = document.getElementById('transaction-list');
const transactionNameInput = document.getElementById('transaction-name');
const transactionAmountInput = document.getElementById('transaction-amount');
const addTransactionBtn = document.getElementById('add-transaction-btn');

let transactions = [];

// Helper function to save user credentials
function saveUser(username, password) {
    localStorage.setItem(username, password);
}

// Helper function to check if user is registered
function isUserRegistered(username, password) {
    return localStorage.getItem(username) === password;
}

// Helper function to save logged-in state
function setLoggedInUser(username) {
    localStorage.setItem('loggedInUser', username);
}

// Helper function to get logged-in user
function getLoggedInUser() {
    return localStorage.getItem('loggedInUser');
}

// Helper function to logout user
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    location.reload(); // Reload the page after logout
}

// Handle registration
registerBtn.addEventListener('click', function () {
    const username = registerUsername.value;
    const password = registerPassword.value;

    if (username && password) {
        saveUser(username, password);
        alert('Registration successful! Please login.');
        showLoginForm();
    } else {
        alert('Please provide valid credentials.');
    }
});

// Handle login
loginBtn.addEventListener('click', function () {
    const username = loginUsername.value;
    const password = loginPassword.value;

    if (isUserRegistered(username, password)) {
        setLoggedInUser(username);
        loadApp();
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Handle logout
logoutBtn.addEventListener('click', logoutUser);

// Show the register form
showRegister.addEventListener('click', showRegisterForm);

// Show the login form
showLogin.addEventListener('click', showLoginForm);

// Show register form
function showRegisterForm() {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
}

// Show login form
function showLoginForm() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

// Load the budgeting app after login
function loadApp() {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loadTransactions();
    }
}

// Save transactions to local storage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Load transactions from local storage
function loadTransactions() {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
        transactions.forEach(displayTransaction);
        updateBalance();
    }
}

// Add transaction
addTransactionBtn.addEventListener('click', function (event) {
    event.preventDefault();

    const name = transactionNameInput.value;
    const amount = parseFloat(transactionAmountInput.value);
    const type = document.getElementById('transaction-type').value;

    if (name && amount) {
        const transaction = {
            name: name,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type: type
        };

        transactions.push(transaction);
        displayTransaction(transaction, transactions.length - 1);
        updateBalance();
        saveTransactions();

        transactionNameInput.value = '';
        transactionAmountInput.value = '';
    } else {
        alert('Please provide valid input.');
    }
});

// Display transaction
function displayTransaction(transaction, index) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${transaction.name}</span>
        <span>${transaction.amount >= 0 ? `+$${transaction.amount}` : `-$${Math.abs(transaction.amount)}`}</span>
        <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
    `;
    transactionList.appendChild(li);
}

// Delete transaction
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateBalance();
    saveTransactions();
    renderTransactionList();
}

// Render all transactions
function renderTransactionList() {
    transactionList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        displayTransaction(transaction, index);
    });
}

// Update balance
function updateBalance() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += Math.abs(transaction.amount);
        }
    });

    const balance = totalIncome - totalExpenses;

    balanceElement.textContent = `$${balance.toFixed(2)}`;
    document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;

    renderChart();
}

// Render pie chart
function renderChart() {
    const totalIncome = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Income vs Expenses',
                data: [totalIncome, totalExpenses],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        }
    });
}

// On page load, check if user is logged in
document.addEventListener('DOMContentLoaded', function () {
    if (getLoggedInUser()) {
        loadApp();
    } else {
        showLoginForm();
    }
});

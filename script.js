// Budget Calculator JavaScript

class BudgetCalculator {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
        this.categories = {
            'mat': '🍕 Mat & Dryck',
            'boende': '🏠 Boende',
            'transport': '🚗 Transport',
            'noje': '🎬 Nöje & Fritid',
            'halsa': '💊 Hälsa & Vård',
            'lon': '💼 Lön',
            'sparande': '💰 Sparande',
            'ovrigt': '📝 Övrigt'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.initMobileMenu();
    }
    
    bindEvents() {
        const form = document.getElementById('budgetForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Real-time updates when typing amount
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', () => this.previewCalculation());
    }
    
    initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        
        if (!description || !amount || !type || !category) {
            this.showNotification('Vänligen fyll i alla fält', 'error');
            return;
        }
        
        if (amount <= 0) {
            this.showNotification('Beloppet måste vara större än 0', 'error');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            category,
            date: new Date().toLocaleDateString('sv-SE')
        };
        
        this.addTransaction(transaction);
        this.clearForm();
        this.showNotification('Transaktion tillagd!', 'success');
    }
    
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.animateNewTransaction();
    }
    
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.showNotification('Transaktion borttagen', 'info');
    }
    
    saveToLocalStorage() {
        localStorage.setItem('budgetTransactions', JSON.stringify(this.transactions));
    }
    
    updateDisplay() {
        this.updateSummaryCards();
        this.renderTransactions();
        this.renderCategorySummary();
    }
    
    updateSummaryCards() {
        const income = this.calculateTotal('income');
        const expenses = this.calculateTotal('expense');
        const balance = income - expenses;
        
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(expenses);
        
        const balanceElement = document.getElementById('totalBalance');
        balanceElement.textContent = this.formatCurrency(balance);
        
        // Update balance color based on positive/negative
        const balanceCard = balanceElement.closest('.summary-card');
        balanceCard.classList.remove('positive', 'negative');
        
        if (balance > 0) {
            balanceCard.classList.add('positive');
            balanceCard.querySelector('.card-icon').style.backgroundColor = '#1CC88A';
        } else if (balance < 0) {
            balanceCard.classList.add('negative');
            balanceCard.querySelector('.card-icon').style.backgroundColor = '#E74A3B';
        } else {
            balanceCard.querySelector('.card-icon').style.backgroundColor = '#4E73DF';
        }
    }
    
    calculateTotal(type) {
        return this.transactions
            .filter(t => t.type === type)
            .reduce((sum, t) => sum + t.amount, 0);
    }
    
    renderTransactions() {
        const container = document.getElementById('transactionsList');
        
        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-wallet"></i>
                    <p>Inga transaktioner än. Lägg till din första transaktion ovan!</p>
                </div>
            `;
            return;
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => b.id - a.id);
        
        container.innerHTML = sortedTransactions.map(transaction => `
            <div class="transaction-item fade-in" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category">${this.categories[transaction.category]} • ${transaction.date}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <button class="delete-button" onclick="calculator.deleteTransaction(${transaction.id})" 
                            title="Ta bort transaktion">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    renderCategorySummary() {
        const categorySummary = this.calculateCategorySummary();
        const container = document.getElementById('categoryCards');
        
        if (Object.keys(categorySummary).length === 0) {
            container.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center;">Inga kategorier att visa än.</p>';
            return;
        }
        
        container.innerHTML = Object.entries(categorySummary).map(([category, data]) => `
            <div class="category-card">
                <div class="category-name">${this.categories[category]}</div>
                <div class="category-amount">${this.formatCurrency(data.total)}</div>
                <div class="category-count">${data.count} transaktion${data.count !== 1 ? 'er' : ''}</div>
            </div>
        `).join('');
    }
    
    calculateCategorySummary() {
        const summary = {};
        
        this.transactions.forEach(transaction => {
            const category = transaction.category;
            if (!summary[category]) {
                summary[category] = { total: 0, count: 0 };
            }
            
            const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
            summary[category].total += amount;
            summary[category].count++;
        });
        
        // Sort by total amount (descending)
        const sortedSummary = {};
        Object.entries(summary)
            .sort(([,a], [,b]) => Math.abs(b.total) - Math.abs(a.total))
            .forEach(([key, value]) => {
                sortedSummary[key] = value;
            });
        
        return sortedSummary;
    }
    
    previewCalculation() {
        const amount = parseFloat(document.getElementById('amount').value) || 0;
        const type = document.getElementById('type').value;
        
        if (amount > 0 && type) {
            const currentIncome = this.calculateTotal('income');
            const currentExpenses = this.calculateTotal('expense');
            
            let newIncome = currentIncome;
            let newExpenses = currentExpenses;
            
            if (type === 'income') {
                newIncome += amount;
            } else {
                newExpenses += amount;
            }
            
            const newBalance = newIncome - newExpenses;
            
            // Subtle preview effect
            const balanceElement = document.getElementById('totalBalance');
            balanceElement.style.opacity = '0.7';
            balanceElement.textContent = this.formatCurrency(newBalance);
            
            setTimeout(() => {
                balanceElement.style.opacity = '1';
            }, 200);
        }
    }
    
    clearForm() {
        document.getElementById('budgetForm').reset();
        this.updateDisplay(); // Reset any preview calculations
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: ${type === 'success' ? '#1CC88A' : type === 'error' ? '#E74A3B' : '#4E73DF'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    animateNewTransaction() {
        const transactionItems = document.querySelectorAll('.transaction-item');
        if (transactionItems.length > 0) {
            const newest = transactionItems[0];
            newest.style.backgroundColor = '#E7F3FF';
            setTimeout(() => {
                newest.style.backgroundColor = '';
            }, 1000);
        }
    }
    
    // Export functionality
    exportToCSV() {
        if (this.transactions.length === 0) {
            this.showNotification('Inga transaktioner att exportera', 'info');
            return;
        }
        
        const headers = ['Datum', 'Beskrivning', 'Kategori', 'Typ', 'Belopp'];
        const csvContent = [
            headers.join(';'),
            ...this.transactions.map(t => [
                t.date,
                `"${t.description}"`,
                `"${this.categories[t.category]}"`,
                t.type === 'income' ? 'Inkomst' : 'Utgift',
                t.amount.toString().replace('.', ',')
            ].join(';'))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `budget_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('CSV-fil exporterad!', 'success');
        }
    }
}

// Utility functions
function scrollToCalculator() {
    document.getElementById('calculator').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function exportToCSV() {
    calculator.exportToCSV();
}

// Initialize the application
let calculator;

document.addEventListener('DOMContentLoaded', function() {
    calculator = new BudgetCalculator();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation for cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.summary-card, .form-section, .transactions-section, .category-summary').forEach(el => {
        observer.observe(el);
    });
});

// Handle page refresh - preserve scroll position
window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('scrollPosition', window.pageYOffset);
});

window.addEventListener('load', function() {
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
    }
});

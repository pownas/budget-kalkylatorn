// Budget Calculator JavaScript

class BudgetCalculator {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('budgetTransactions')) || [];
        this.categories = this.loadCategories();
        this.persons = this.loadPersons();
        this.accounts = this.loadAccounts();
        this.currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        this.init();
    }
    
    loadCategories() {
        const defaultCategories = {
            'mat': { id: 'mat', name: '🍕 Mat & Dryck', type: 'shared' },
            'boende': { id: 'boende', name: '🏠 Boende', type: 'shared' },
            'transport': { id: 'transport', name: '🚗 Transport', type: 'personal' },
            'noje': { id: 'noje', name: '🎬 Nöje & Fritid', type: 'personal' },
            'halsa': { id: 'halsa', name: '💊 Hälsa & Vård', type: 'personal' },
            'lon': { id: 'lon', name: '💼 Lön', type: 'personal' },
            'sparande': { id: 'sparande', name: '💰 Sparande', type: 'shared' },
            'ovrigt': { id: 'ovrigt', name: '📝 Övrigt', type: 'shared' }
        };
        
        const saved = localStorage.getItem('budgetCategories');
        return saved ? JSON.parse(saved) : defaultCategories;
    }
    
    loadPersons() {
        const defaultPersons = {
            'person1': { id: 'person1', name: 'Person 1' },
            'person2': { id: 'person2', name: 'Person 2' }
        };
        
        const saved = localStorage.getItem('budgetPersons');
        return saved ? JSON.parse(saved) : defaultPersons;
    }
    
    loadAccounts() {
        const defaultAccounts = {
            'seb-1': { id: 'seb-1', name: 'SEB Privatkonto', bank: 'SEB', person: 'person1' },
            'handelsbanken-1': { id: 'handelsbanken-1', name: 'Handelsbanken Lönekonto', bank: 'Handelsbanken', person: 'person2' }
        };
        
        const saved = localStorage.getItem('budgetAccounts');
        return saved ? JSON.parse(saved) : defaultAccounts;
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.initMobileMenu();
        this.populateFormOptions();
    }
    
    populateFormOptions() {
        // Populate category select
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">Välj kategori</option>';
        Object.values(this.categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
        
        // Populate person select if it exists
        const personSelect = document.getElementById('person');
        if (personSelect) {
            personSelect.innerHTML = '<option value="">Välj person</option>';
            Object.values(this.persons).forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name;
                personSelect.appendChild(option);
            });
        }
        
        // Populate account select if it exists
        const accountSelect = document.getElementById('account');
        if (accountSelect) {
            accountSelect.innerHTML = '<option value="">Välj konto</option>';
            Object.values(this.accounts).forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} (${account.bank})`;
                accountSelect.appendChild(option);
            });
        }
    }
    
    bindEvents() {
        const form = document.getElementById('budgetForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Real-time updates when typing amount
        const amountInput = document.getElementById('amount');
        amountInput.addEventListener('input', () => this.previewCalculation());
        
        // CSV import functionality
        const csvInput = document.getElementById('csvFile');
        if (csvInput) {
            csvInput.addEventListener('change', (e) => this.handleCSVImport(e));
        }
        
        const importBtn = document.getElementById('importBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }
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
        const person = document.getElementById('person')?.value || 'person1';
        const account = document.getElementById('account')?.value || Object.keys(this.accounts)[0];
        
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
            person,
            account,
            date: new Date().toISOString().split('T')[0],
            month: this.currentMonth
        };
        
        this.addTransaction(transaction);
        this.clearForm();
        this.showNotification('Transaktion tillagd!', 'success');
    }
    
    showImportModal() {
        // Create modal for CSV import
        const modal = document.createElement('div');
        modal.className = 'import-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-upload"></i> Importera transaktioner</h3>
                    <button class="close-modal" onclick="this.closest('.import-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="importPerson">Välj person</label>
                        <select id="importPerson" required>
                            <option value="">Välj person</option>
                            ${Object.values(this.persons).map(p => 
                                `<option value="${p.id}">${p.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="importAccount">Välj konto</label>
                        <select id="importAccount" required>
                            <option value="">Välj konto</option>
                            ${Object.values(this.accounts).map(a => 
                                `<option value="${a.id}">${a.name} (${a.bank})</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="csvFile">Välj CSV-fil</label>
                        <input type="file" id="csvFile" accept=".csv" required>
                        <small>Stöds: SEB, Handelsbanken, Nordea, Swedbank, Danske Bank</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.import-modal').remove()">
                        Avbryt
                    </button>
                    <button type="button" class="btn-primary" onclick="calculator.processCSVImport()">
                        Importera
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for file input
        const csvInput = modal.querySelector('#csvFile');
        csvInput.addEventListener('change', (e) => this.handleCSVImport(e));
    }
    
    handleCSVImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.csvContent = event.target.result;
        };
        reader.readAsText(file, 'UTF-8');
    }
    
    processCSVImport() {
        const person = document.getElementById('importPerson').value;
        const account = document.getElementById('importAccount').value;
        
        if (!person || !account || !this.csvContent) {
            this.showNotification('Vänligen fyll i alla fält och välj en fil', 'error');
            return;
        }
        
        try {
            const transactions = this.parseCSV(this.csvContent, person, account);
            const importedCount = this.importTransactions(transactions);
            
            document.querySelector('.import-modal').remove();
            this.showNotification(`${importedCount} transaktioner importerade!`, 'success');
            this.updateDisplay();
        } catch (error) {
            console.error('CSV import error:', error);
            this.showNotification('Fel vid import av CSV-fil', 'error');
        }
    }
    
    parseCSV(csvContent, person, account) {
        const lines = csvContent.split('\n');
        const transactions = [];
        
        // Detect bank format based on headers
        const headers = lines[0].toLowerCase();
        let bankFormat = 'unknown';
        
        if (headers.includes('bokföringsdatum') || headers.includes('valutadatum')) {
            bankFormat = 'seb';
        } else if (headers.includes('datum') && headers.includes('belopp')) {
            bankFormat = 'handelsbanken';
        } else if (headers.includes('transaktion') && headers.includes('saldo')) {
            bankFormat = 'nordea';
        } else if (headers.includes('clearingnummer')) {
            bankFormat = 'swedbank';
        }
        
        // Parse based on detected format
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const transaction = this.parseCSVLine(line, bankFormat, person, account);
            if (transaction) {
                transactions.push(transaction);
            }
        }
        
        return transactions;
    }
    
    parseCSVLine(line, bankFormat, person, account) {
        const parts = line.split(';').map(p => p.replace(/"/g, '').trim());
        
        let transaction = null;
        
        switch (bankFormat) {
            case 'seb':
                transaction = this.parseSEBTransaction(parts, person, account);
                break;
            case 'handelsbanken':
                transaction = this.parseHandelsbankenTransaction(parts, person, account);
                break;
            case 'nordea':
                transaction = this.parseNordeaTransaction(parts, person, account);
                break;
            case 'swedbank':
                transaction = this.parseSwedbanksTransaction(parts, person, account);
                break;
            default:
                // Try generic format
                transaction = this.parseGenericTransaction(parts, person, account);
        }
        
        return transaction;
    }
    
    parseSEBTransaction(parts, person, account) {
        if (parts.length < 4) return null;
        
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2].replace(',', '.'));
        
        if (isNaN(amount)) return null;
        
        return {
            id: Date.now() + Math.random(),
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: this.autoCategorize(description),
            person,
            account,
            date: this.formatDate(date),
            month: this.formatDate(date).slice(0, 7)
        };
    }
    
    parseHandelsbankenTransaction(parts, person, account) {
        if (parts.length < 3) return null;
        
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2].replace(',', '.'));
        
        if (isNaN(amount)) return null;
        
        return {
            id: Date.now() + Math.random(),
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: this.autoCategorize(description),
            person,
            account,
            date: this.formatDate(date),
            month: this.formatDate(date).slice(0, 7)
        };
    }
    
    parseNordeaTransaction(parts, person, account) {
        // Similar parsing logic for Nordea
        if (parts.length < 3) return null;
        
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2].replace(',', '.'));
        
        if (isNaN(amount)) return null;
        
        return {
            id: Date.now() + Math.random(),
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: this.autoCategorize(description),
            person,
            account,
            date: this.formatDate(date),
            month: this.formatDate(date).slice(0, 7)
        };
    }
    
    parseSwedbanksTransaction(parts, person, account) {
        // Similar parsing logic for Swedbank
        if (parts.length < 3) return null;
        
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2].replace(',', '.'));
        
        if (isNaN(amount)) return null;
        
        return {
            id: Date.now() + Math.random(),
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: this.autoCategorize(description),
            person,
            account,
            date: this.formatDate(date),
            month: this.formatDate(date).slice(0, 7)
        };
    }
    
    parseGenericTransaction(parts, person, account) {
        // Generic parser for unknown formats
        if (parts.length < 3) return null;
        
        const date = parts[0];
        const description = parts[1];
        const amount = parseFloat(parts[2].replace(',', '.'));
        
        if (isNaN(amount)) return null;
        
        return {
            id: Date.now() + Math.random(),
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? 'income' : 'expense',
            category: this.autoCategorize(description),
            person,
            account,
            date: this.formatDate(date),
            month: this.formatDate(date).slice(0, 7)
        };
    }
    
    formatDate(dateString) {
        // Convert various date formats to YYYY-MM-DD
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Try Swedish format (YYYY-MM-DD or DD/MM/YYYY)
            const parts = dateString.split(/[-/]/);
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    // YYYY-MM-DD
                    return dateString;
                } else {
                    // DD/MM/YYYY
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            return new Date().toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    }
    
    autoCategorize(description) {
        const desc = description.toLowerCase();
        
        // Check if we have a previous categorization for this description
        const previousTransaction = this.transactions.find(t => 
            t.description.toLowerCase().includes(desc) || desc.includes(t.description.toLowerCase())
        );
        
        if (previousTransaction) {
            return previousTransaction.category;
        }
        
        // Auto-categorize based on keywords
        if (desc.includes('ica') || desc.includes('coop') || desc.includes('mat') || 
            desc.includes('food') || desc.includes('restaurant') || desc.includes('mcd')) {
            return 'mat';
        }
        
        if (desc.includes('hyra') || desc.includes('rent') || desc.includes('hem') || 
            desc.includes('bostads') || desc.includes('fastighet')) {
            return 'boende';
        }
        
        if (desc.includes('bensin') || desc.includes('gas') || desc.includes('tåg') || 
            desc.includes('buss') || desc.includes('taxi') || desc.includes('parkering')) {
            return 'transport';
        }
        
        if (desc.includes('bio') || desc.includes('netflix') || desc.includes('spotify') || 
            desc.includes('gym') || desc.includes('fitness')) {
            return 'noje';
        }
        
        if (desc.includes('apotek') || desc.includes('läkare') || desc.includes('tandläkare') || 
            desc.includes('vårdcentral') || desc.includes('medicin')) {
            return 'halsa';
        }
        
        if (desc.includes('lön') || desc.includes('salary') || desc.includes('avanza') || 
            desc.includes('pension') || desc.includes('ersättning')) {
            return 'lon';
        }
        
        if (desc.includes('spar') || desc.includes('investering') || desc.includes('fond') || 
            desc.includes('aktie') || desc.includes('isk')) {
            return 'sparande';
        }
        
        return 'ovrigt';
    }
    
    importTransactions(transactions) {
        let imported = 0;
        
        transactions.forEach(transaction => {
            // Check if transaction already exists
            const exists = this.transactions.some(t => 
                t.description === transaction.description && 
                t.amount === transaction.amount && 
                t.date === transaction.date &&
                t.account === transaction.account
            );
            
            if (!exists) {
                this.transactions.push(transaction);
                imported++;
            }
        });
        
        if (imported > 0) {
            this.saveToLocalStorage();
            this.saveToMonthlyFile();
        }
        
        return imported;
    }
    
    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.saveToLocalStorage();
        this.saveToMonthlyFile();
        this.updateDisplay();
        this.animateNewTransaction();
    }
    
    saveToMonthlyFile() {
        // Group transactions by month
        const monthlyData = {};
        
        this.transactions.forEach(transaction => {
            const month = transaction.month || transaction.date.slice(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = [];
            }
            monthlyData[month].push(transaction);
        });
        
        // Save each month's data
        Object.keys(monthlyData).forEach(month => {
            const filename = `budget_${month}.json`;
            const data = {
                month,
                transactions: monthlyData[month],
                categories: this.categories,
                persons: this.persons,
                accounts: this.accounts,
                created: new Date().toISOString()
            };
            
            // Save to localStorage for now (in a real app, this would be saved to a file)
            localStorage.setItem(filename, JSON.stringify(data));
        });
    }
    
    loadMonthlyFile(month) {
        const filename = `budget_${month}.json`;
        const saved = localStorage.getItem(filename);
        
        if (saved) {
            const data = JSON.parse(saved);
            return data.transactions || [];
        }
        
        return [];
    }
    
    saveCategories() {
        localStorage.setItem('budgetCategories', JSON.stringify(this.categories));
    }
    
    savePersons() {
        localStorage.setItem('budgetPersons', JSON.stringify(this.persons));
    }
    
    saveAccounts() {
        localStorage.setItem('budgetAccounts', JSON.stringify(this.accounts));
    }
    
    addCustomCategory(name, type = 'shared') {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const category = {
            id,
            name,
            type,
            custom: true
        };
        
        this.categories[id] = category;
        this.saveCategories();
        this.populateFormOptions();
        
        return category;
    }
    
    addPerson(name) {
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const person = {
            id,
            name
        };
        
        this.persons[id] = person;
        this.savePersons();
        this.populateFormOptions();
        
        return person;
    }
    
    addAccount(name, bank, person) {
        const id = `${bank.toLowerCase()}-${person}`;
        const account = {
            id,
            name,
            bank,
            person
        };
        
        this.accounts[id] = account;
        this.saveAccounts();
        this.populateFormOptions();
        
        return account;
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
                    <p>Inga transaktioner än. Lägg till din första transaktion ovan eller importera från CSV!</p>
                </div>
            `;
            return;
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = sortedTransactions.map(transaction => {
            const categoryName = this.categories[transaction.category]?.name || transaction.category;
            const personName = this.persons[transaction.person]?.name || 'Okänd';
            const accountName = this.accounts[transaction.account]?.name || 'Okänt konto';
            
            return `
                <div class="transaction-item fade-in" data-id="${transaction.id}">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">
                            ${categoryName} • ${personName} • ${accountName} • ${transaction.date}
                        </div>
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
            `;
        }).join('');
    }
    
    renderCategorySummary() {
        const categorySummary = this.calculateCategorySummary();
        const container = document.getElementById('categoryCards');
        
        if (Object.keys(categorySummary).length === 0) {
            container.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center;">Inga kategorier att visa än.</p>';
            return;
        }
        
        container.innerHTML = Object.entries(categorySummary).map(([category, data]) => {
            const categoryName = this.categories[category]?.name || category;
            const categoryType = this.categories[category]?.type || 'shared';
            
            return `
                <div class="category-card">
                    <div class="category-header">
                        <div class="category-name">${categoryName}</div>
                        <div class="category-type">${categoryType === 'shared' ? 'Gemensam' : 'Personlig'}</div>
                    </div>
                    <div class="category-amount">${this.formatCurrency(data.total)}</div>
                    <div class="category-count">${data.count} transaktion${data.count !== 1 ? 'er' : ''}</div>
                </div>
            `;
        }).join('');
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

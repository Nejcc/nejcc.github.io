const { createApp } = Vue;

const createPerson = (overrides = {}) => ({
    Assets: 0,
    Investments: 0,
    Savings: 0,
    Debt: 0,
    GrossMonthlyIncome: 0,
    NetMonthlyIncome: 0,
    RentMortgage: 0,
    Utilities: 0,
    Insurance: 0,
    CarPayment: 0,
    DebtPayments: 0,
    Groceries: 0,
    Clothes: 0,
    Phone: 0,
    Subscriptions: 0,
    Miscellaneous: 0,  // Will be calculated
    PostTaxRetirementSavings: 0,
    Stocks: 0,
    Vacations: 0,
    Gifts: 0,
    LongTermEmergencyFund: 0,
    GuiltFreeSpending: 0,
    ...overrides
});

createApp({
    data() {
        return {
            person1: createPerson(),
            person2: createPerson({ Vacations: 100 }),
            fields: ['Assets', 'Investments', 'Savings', 'Debt', 'GrossMonthlyIncome', 'NetMonthlyIncome', 'RentMortgage', 'Utilities', 'Insurance', 'CarPayment', 'DebtPayments', 'Groceries', 'Clothes', 'Phone', 'Subscriptions', 'Miscellaneous', 'PostTaxRetirementSavings', 'Stocks', 'Vacations', 'Gifts', 'LongTermEmergencyFund', 'GuiltFreeSpending'],
            showSummary: false
        };
    },
    computed: {
        together() {
            return this.sumProperties(this.person1, this.person2);
        },
        netWorthPerson1() {
            return this.calculateNetWorth(this.person1);
        },
        netWorthPerson2() {
            return this.calculateNetWorth(this.person2);
        },
        netWorthTogether() {
            return this.calculateNetWorth(this.together);
        },
        fixedCostsPerson1() {
            return this.calculateTotal(this.person1, this.fixedCostFields());
        },
        fixedCostsPerson2() {
            return this.calculateTotal(this.person2, this.fixedCostFields());
        },
        fixedCostsTogether() {
            return this.calculateTotal(this.together, this.fixedCostFields());
        },
        investmentsTotalPerson1() {
            return this.calculateTotal(this.person1, this.investmentFields());
        },
        investmentsTotalPerson2() {
            return this.calculateTotal(this.person2, this.investmentFields());
        },
        investmentsTotalTogether() {
            return this.calculateTotal(this.together, this.investmentFields());
        },
        savingsTotalPerson1() {
            return this.calculateTotal(this.person1, this.savingsFields());
        },
        savingsTotalPerson2() {
            return this.calculateTotal(this.person2, this.savingsFields());
        },
        savingsTotalTogether() {
            return this.calculateTotal(this.together, this.savingsFields());
        },
        fixedCostPercentagePerson1() {
            return this.calculatePercentage(this.fixedCostsPerson1, this.person1.NetMonthlyIncome);
        },
        fixedCostPercentagePerson2() {
            return this.calculatePercentage(this.fixedCostsPerson2, this.person2.NetMonthlyIncome);
        },
        fixedCostPercentageTogether() {
            return this.calculateCombinedPercentage(this.fixedCostsPerson1, this.person1.NetMonthlyIncome, this.fixedCostsPerson2, this.person2.NetMonthlyIncome);
        },
        investmentPercentagePerson1() {
            return this.calculatePercentage(this.investmentsTotalPerson1, this.person1.NetMonthlyIncome);
        },
        investmentPercentagePerson2() {
            return this.calculatePercentage(this.investmentsTotalPerson2, this.person2.NetMonthlyIncome);
        },
        investmentPercentageTogether() {
            return this.calculateCombinedPercentage(this.investmentsTotalPerson1, this.person1.NetMonthlyIncome, this.investmentsTotalPerson2, this.person2.NetMonthlyIncome);
        },
        savingsGoalPercentagePerson1() {
            return this.calculatePercentage(this.savingsTotalPerson1, this.person1.NetMonthlyIncome);
        },
        savingsGoalPercentagePerson2() {
            return this.calculatePercentage(this.savingsTotalPerson2, this.person2.NetMonthlyIncome);
        },
        savingsGoalPercentageTogether() {
            return this.calculateCombinedPercentage(this.savingsTotalPerson1, this.person1.NetMonthlyIncome, this.savingsTotalPerson2, this.person2.NetMonthlyIncome);
        },
        guiltFreeSpendingPercentagePerson1() {
            return this.calculatePercentage(this.person1.GuiltFreeSpending, this.person1.NetMonthlyIncome);
        },
        guiltFreeSpendingPercentagePerson2() {
            return this.calculatePercentage(this.person2.GuiltFreeSpending, this.person2.NetMonthlyIncome);
        },
        guiltFreeSpendingPercentageTogether() {
            return this.calculateCombinedPercentage(this.person1.GuiltFreeSpending, this.person1.NetMonthlyIncome, this.person2.GuiltFreeSpending, this.person2.NetMonthlyIncome);
        },
        overviewSuggestionsPerson1() {
            return this.generateSuggestions('Person 1', this.fixedCostPercentagePerson1, this.investmentPercentagePerson1, this.savingsGoalPercentagePerson1, this.guiltFreeSpendingPercentagePerson1);
        },
        overviewSuggestionsPerson2() {
            return this.generateSuggestions('Person 2', this.fixedCostPercentagePerson2, this.investmentPercentagePerson2, this.savingsGoalPercentagePerson2, this.guiltFreeSpendingPercentagePerson2);
        },
        overviewSuggestionsTogether() {
            return this.generateSuggestions('Together', this.fixedCostPercentageTogether, this.investmentPercentageTogether, this.savingsGoalPercentageTogether, this.guiltFreeSpendingPercentageTogether);
        },
        fixedCostClassPerson1() {
            const percentage = parseFloat(this.fixedCostPercentagePerson1);
            return this.getClassBasedOnPercentage(percentage, 50, 60);
        },
        fixedCostClassPerson2() {
            const percentage = parseFloat(this.fixedCostPercentagePerson2);
            return this.getClassBasedOnPercentage(percentage, 50, 60);
        },
        investmentClassPerson1() {
            const percentage = parseFloat(this.investmentPercentagePerson1);
            return this.getClassBasedOnPercentage(percentage, 10);
        },
        investmentClassPerson2() {
            const percentage = parseFloat(this.investmentPercentagePerson2);
            return this.getClassBasedOnPercentage(percentage, 10);
        },
        savingsGoalClassPerson1() {
            const percentage = parseFloat(this.savingsGoalPercentagePerson1);
            return this.getClassBasedOnPercentage(percentage, 5, 10);
        },
        savingsGoalClassPerson2() {
            const percentage = parseFloat(this.savingsGoalPercentagePerson2);
            return this.getClassBasedOnPercentage(percentage, 5, 10);
        },
        guiltFreeSpendingClassPerson1() {
            const percentage = parseFloat(this.guiltFreeSpendingPercentagePerson1);
            return this.getClassBasedOnPercentage(percentage, 20, 35);
        },
        guiltFreeSpendingClassPerson2() {
            const percentage = parseFloat(this.guiltFreeSpendingPercentagePerson2);
            return this.getClassBasedOnPercentage(percentage, 20, 35);
        }
    },
    watch: {
        person1: {
            handler(val) {
                val.Miscellaneous = this.calculateMiscellaneous(val);
            },
            deep: true
        },
        person2: {
            handler(val) {
                val.Miscellaneous = this.calculateMiscellaneous(val);
            },
            deep: true
        }
    },
    methods: {
        sumProperties(obj1, obj2) {
            return this.fields.reduce((result, key) => {
                result[key] = (obj1[key] || 0) + (obj2[key] || 0);
                return result;
            }, {});
        },
        calculateNetWorth(person) {
            return person.Assets + person.Investments + person.Savings - person.Debt;
        },
        calculateTotal(person, fields) {
            return fields.reduce((total, field) => total + (person[field] || 0), 0);
        },
        calculatePercentage(amount, total) {
            return total ? (amount / total * 100).toFixed(2) + '%' : '';
        },
        calculateCombinedPercentage(amount1, total1, amount2, total2) {
            const combinedTotal = total1 + total2;
            return combinedTotal ? ((amount1 + amount2) / combinedTotal * 100).toFixed(2) + '%' : '';
        },
        fixedCostFields() {
            return ['RentMortgage', 'Utilities', 'Insurance', 'CarPayment', 'DebtPayments', 'Groceries', 'Clothes', 'Phone', 'Subscriptions'];
        },
        investmentFields() {
            return ['PostTaxRetirementSavings', 'Stocks'];
        },
        savingsFields() {
            return ['Vacations', 'Gifts', 'LongTermEmergencyFund'];
        },
        getClassBasedOnPercentage(percentage, min, max) {
            if (percentage < min) {
                return 'text-warning';
            } else if (percentage > max) {
                return 'text-danger';
            } else {
                return 'text-success';
            }
        },
        generateSuggestions(label, fixedCostPercentage, investmentPercentage, savingsGoalPercentage, guiltFreeSpendingPercentage) {
            const suggestions = [];
            const fixedCost = parseFloat(fixedCostPercentage);
            const investment = parseFloat(investmentPercentage);
            const savingsGoal = parseFloat(savingsGoalPercentage);
            const guiltFreeSpending = parseFloat(guiltFreeSpendingPercentage);

            // Fixed Costs
            if (fixedCost > 60) {
                suggestions.push(`- Fixed costs are too high (${fixedCostPercentage}). Consider reducing rent, utilities, or other fixed expenses.`);
                suggestions.push(`  - Evaluate cheaper housing options or consider refinancing your mortgage to lower payments.`);
                suggestions.push(`  - Look for ways to reduce utility bills, such as using energy-efficient appliances or cutting down on usage.`);
                suggestions.push(`  - Review insurance policies to ensure you're not overpaying.`);
            } else if (fixedCost < 50) {
                suggestions.push(`- Fixed costs are low (${fixedCostPercentage}). Ensure you have accounted for all necessary expenses.`);
                suggestions.push(`  - Double-check that all essential expenses are included and that you're not missing out on important services.`);
            }

            // Investment Savings
            if (investment < 10) {
                suggestions.push(`- Investment savings are too low (${investmentPercentage}). Try to allocate at least 10% of your net income to investments.`);
                suggestions.push(`  - Consider automating your investments to ensure consistency.`);
                suggestions.push(`  - Look into employer-sponsored retirement plans, such as a 401(k) with matching contributions.`);
                suggestions.push(`  - Diversify your investment portfolio to balance risk and reward.`);
            }

            // Savings Goals
            if (savingsGoal < 5) {
                suggestions.push(`- Savings goals are too low (${savingsGoalPercentage}). Aim for at least 5-10% of your net income.`);
                suggestions.push(`  - Start with an emergency fund if you haven't already.`);
                suggestions.push(`  - Set specific savings goals, such as for a vacation, home purchase, or education.`);
                suggestions.push(`  - Automate savings transfers to make it easier to consistently save.`);
            }

            // Guilt-Free Spending
            if (guiltFreeSpending > 35) {
                suggestions.push(`- Guilt-free spending is too high (${guiltFreeSpendingPercentage}). Consider cutting back on non-essential expenses.`);
                suggestions.push(`  - Track your discretionary spending to identify areas where you can save.`);
                suggestions.push(`  - Create a budget for non-essential spending to avoid overspending.`);
            } else if (guiltFreeSpending < 20) {
                suggestions.push(`- Guilt-free spending is low (${guiltFreeSpendingPercentage}). You may have more room for discretionary spending.`);
                suggestions.push(`  - Treat yourself within reason to maintain a balanced budget.`);
                suggestions.push(`  - Allocate a specific amount for leisure and hobbies to enjoy your income responsibly.`);
            }

            return suggestions;
        },
        calculateMiscellaneous(person) {
            const fixedCosts = ['RentMortgage', 'Utilities', 'Insurance', 'CarPayment', 'DebtPayments', 'Groceries', 'Clothes', 'Phone', 'Subscriptions'];
            const totalFixedCosts = fixedCosts.reduce((total, key) => total + (person[key] || 0), 0);
            return totalFixedCosts * 0.15;
        }
    }
}).mount('#app');

export interface AmortizationRow {
  period: number;
  initialBalance: number;
  payment: number;
  interest: number;
  principal: number;
  insurance: number;
  totalPayment: number; // payment + insurance + other costs
  finalBalance: number;
}

export interface CreditParams {
  amount: number;
  months: number;
  annualInterestRate: number; // percentage (e.g., 12.5)
  system: 'FRENCH' | 'GERMAN';
  indirectCosts: {
    insurancePercentage: number; // e.g. 0.5% each month of the initial balance
    fixedCosts: number; // e.g. Solca donation per month
  };
}

export function calculateAmortization(params: CreditParams): AmortizationRow[] {
  const { amount, months, annualInterestRate, system, indirectCosts } = params;
  const monthlyRate = (annualInterestRate / 100) / 12;
  const table: AmortizationRow[] = [];
  
  let balance = amount;

  if (system === 'FRENCH') {
    // Cuota fija
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    for (let i = 1; i <= months; i++) {
        const interest = balance * monthlyRate;
        const principal = payment - interest;
        
        // Costos adicionales (seguros calculados sobre base inicial o saldo, asumimos base inicial o saldo actual. Usualmente desgravamen es sobre saldo actual o inicial. Hagamos sobre saldo inicial / o podemos hacer fijo:
        const insurance = (amount * (indirectCosts.insurancePercentage / 100)) + indirectCosts.fixedCosts;
        
        const totalPayment = payment + insurance;
        const finalBalance = balance - principal;

        table.push({
            period: i,
            initialBalance: balance,
            payment,
            interest,
            principal,
            insurance,
            totalPayment,
            finalBalance: finalBalance > 0.01 ? finalBalance : 0
        });

        balance = finalBalance;
    }
  } else if (system === 'GERMAN') {
    // Amortización de capital fija
    const principal = amount / months;
    
    for (let i = 1; i <= months; i++) {
        const interest = balance * monthlyRate;
        const payment = principal + interest;
        
        const insurance = (amount * (indirectCosts.insurancePercentage / 100)) + indirectCosts.fixedCosts;
        const totalPayment = payment + insurance;
        const finalBalance = balance - principal;

        table.push({
            period: i,
            initialBalance: balance,
            payment,
            interest,
            principal,
            insurance,
            totalPayment,
            finalBalance: finalBalance > 0.01 ? finalBalance : 0
        });

        balance = finalBalance;
    }
  }

  return table;
}

/**
 * Business rules for Payroll-Deductible Loans (Crédito Consignado)
 */

export interface SimulationInput {
  salary: number;
  age: number;
  loan_amount: number;
}

export interface SimulationResult {
  max_margin: number; // 35% of salary
  max_installment: number;
  interest_rate: number; // monthly
  max_installments: number; // based on age
  estimated_installment: number;
  is_approved: boolean;
  reason?: string;
}

export function simulateCredit(input: SimulationInput): SimulationResult {
  const MARGIN_PERCENTAGE = 0.35; // 35% is standard for consignado in Brazil
  const MONTHLY_INTEREST_RATE = 0.018; // 1.8% monthly (average)
  
  // Calculate max margin
  const max_margin = input.salary * MARGIN_PERCENTAGE;
  
  // Calculate max installments based on age (max age usually 80)
  let max_installments = 84; // 7 years
  if (input.age > 70) max_installments = 48;
  if (input.age > 75) max_installments = 24;
  if (input.age > 80) {
    return {
      max_margin,
      max_installment: 0,
      interest_rate: MONTHLY_INTEREST_RATE,
      max_installments: 0,
      estimated_installment: 0,
      is_approved: false,
      reason: 'Idade superior ao limite permitido (80 anos).'
    };
  }

  // Calculate installment using PMT formula: P = (r * PV) / (1 - (1 + r)^-n)
  const r = MONTHLY_INTEREST_RATE;
  const PV = input.loan_amount;
  const n = max_installments;
  
  const estimated_installment = (r * PV) / (1 - Math.pow(1 + r, -n));
  
  const is_approved = estimated_installment <= max_margin;

  return {
    max_margin,
    max_installment: max_margin,
    interest_rate: MONTHLY_INTEREST_RATE,
    max_installments,
    estimated_installment,
    is_approved,
    reason: is_approved ? 'Aprovado dentro da margem consignável.' : 'Parcela excede a margem de 35% do salário.'
  };
}

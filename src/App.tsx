import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Header Component
const Header: React.FC = () => (
  <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="https://i.imgur.com/CdnTZ20.png" alt="Tranquil Software Logo" className="w-6 h-6" />
          </div>
          <a 
            href="https://www.tranquilsoftware.com.au" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Tranquil Software
          </a>
        </div>
      </div>
    </div>
  </header>
);

// Footer Component
const Footer: React.FC = () => (
  <footer className="bg-slate-900 border-t border-slate-800 py-8">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-slate-400 text-sm">
        © {new Date().getFullYear()}{' '}
        <a 
          href="https://www.tranquilsoftware.com.au" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          Tranquil Software
        </a>
        . All rights reserved.
      </p>
    </div>
  </footer>
);

// Types
interface Plan {
  id: string;
  name: string;
  price: number;
  probability: number;
}

interface CalculatorState {
  targetIncome: number;
  avgMonthlyRevenue: number;
  plans: Plan[];
  churnRate: number;
  cac: number;
  expansionRevenue: number;
  supportCostPerUser: number;
  infrastructureCostPerUser: number;
  customersPerMonth: number | null;
}

interface MonthData {
  month: number;
  revenue: number;
  customers: number;
  mrr: number;
  churnedCustomers: number;
  netRevenue: number;
  expansionRevenue: number;
  operatingCosts: number;
  profit: number;
}

interface BusinessMetrics {
  clv: number;
  arr: number;
  valuation: number;
  paybackPeriod: number;
  grossMargin: number;
  ltvCacRatio: number;
  nrr: number;
  grr: number;
  ruleOf40: number;
  breakEvenMonth: number;
  averageArpu: number;
}

// Utility functions
const calculateProjections = (
  targetIncome: number,
  avgMonthlyRevenue: number,
  plans: Plan[],
  churnRate: number,
  cac: number,
  expansionRate: number,
  supportCost: number,
  infraCost: number,
  customersPerMonth: number | null = null,
  months: number = 60
): MonthData[] => {
  const data: MonthData[] = [];
  
  const customersNeededPerMonth = customersPerMonth !== null 
    ? customersPerMonth 
    : avgMonthlyRevenue > 0 
      ? Math.ceil(targetIncome / avgMonthlyRevenue)
      : 0;
  
  let totalCustomers = 0;
  let activeCustomers = 0;
  let cumulativeRevenue = 0;
  let cumulativeNetRevenue = 0;
  let cumulativeProfit = 0;
  let previousMrr = 0;
  
  for (let month = 1; month <= months; month++) {
    totalCustomers += customersNeededPerMonth;
    activeCustomers += customersNeededPerMonth;
    
    const churnedThisMonth = Math.floor(activeCustomers * (churnRate / 100));
    activeCustomers -= churnedThisMonth;
    
    let baseMonthlyRevenue = 0;
    if (plans.length > 0) {
      const totalProb = plans.reduce((sum, p) => sum + p.probability, 0);
      baseMonthlyRevenue = plans.reduce((sum, plan) => {
        const normalizedProb = totalProb > 0 ? plan.probability / totalProb : 0;
        return sum + (plan.price * normalizedProb * activeCustomers);
      }, 0);
    } else {
      baseMonthlyRevenue = activeCustomers * avgMonthlyRevenue;
    }
    
    // Expansion revenue from existing customers upgrading
    const expansionRevenueAmount = previousMrr * (expansionRate / 100);
    const monthlyRevenue = baseMonthlyRevenue + expansionRevenueAmount;
    
    // Operating costs
    const supportCosts = activeCustomers * supportCost;
    const infraCosts = activeCustomers * infraCost;
    const acquisitionCost = customersNeededPerMonth * cac;
    const totalOperatingCosts = supportCosts + infraCosts + acquisitionCost;
    
    const netMonthlyRevenue = monthlyRevenue - acquisitionCost;
    const monthlyProfit = monthlyRevenue - totalOperatingCosts;
    
    cumulativeRevenue += monthlyRevenue;
    cumulativeNetRevenue += netMonthlyRevenue;
    cumulativeProfit += monthlyProfit;
    previousMrr = monthlyRevenue;
    
    data.push({
      month,
      revenue: Math.round(cumulativeRevenue),
      customers: totalCustomers,
      mrr: Math.round(monthlyRevenue),
      churnedCustomers: churnedThisMonth,
      netRevenue: Math.round(cumulativeNetRevenue),
      expansionRevenue: Math.round(expansionRevenueAmount),
      operatingCosts: Math.round(totalOperatingCosts),
      profit: Math.round(cumulativeProfit)
    });
  }
  
  return data;
};

const calculateBusinessMetrics = (
  projections: MonthData[],
  avgMonthlyRevenue: number,
  churnRate: number,
  cac: number,
  expansionRate: number
): BusinessMetrics => {
  const finalMonth = projections[projections.length - 1];
  const firstMonth = projections[0];
  const arr = finalMonth?.mrr * 12 || 0;
  
  const monthlyChurnRate = churnRate / 100;
  const clv = monthlyChurnRate > 0 ? avgMonthlyRevenue / monthlyChurnRate : avgMonthlyRevenue * 12;
  
  const valuation = arr * 7;
  const paybackPeriod = avgMonthlyRevenue > 0 ? cac / avgMonthlyRevenue : 0;
  const ltvCacRatio = cac > 0 ? clv / cac : 0;
  
  // Net Revenue Retention (NRR) - includes expansion
  const retentionRate = 1 - monthlyChurnRate;
  const nrr = (retentionRate + (expansionRate / 100)) * 100;
  
  // Gross Revenue Retention (GRR) - excludes expansion
  const grr = retentionRate * 100;
  
  // Rule of 40: Growth Rate + Profit Margin
  const growthRate = firstMonth && finalMonth 
    ? ((finalMonth.mrr - firstMonth.mrr) / firstMonth.mrr) * 100 / 60 * 12 // Annualized growth
    : 0;
  const profitMargin = finalMonth && finalMonth.mrr > 0
    ? ((finalMonth.mrr - finalMonth.operatingCosts) / finalMonth.mrr) * 100
    : 0;
  const ruleOf40 = growthRate + profitMargin;
  
  // Break-even month
  const breakEvenMonth = projections.findIndex(d => d.profit >= 0);
  
  // Average ARPU
  const averageArpu = avgMonthlyRevenue;
  
  const grossMargin = 80;
  
  return {
    clv: Math.round(clv),
    arr: Math.round(arr),
    valuation: Math.round(valuation),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    grossMargin,
    ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
    nrr: Math.round(nrr * 10) / 10,
    grr: Math.round(grr * 10) / 10,
    ruleOf40: Math.round(ruleOf40 * 10) / 10,
    breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : -1,
    averageArpu: Math.round(averageArpu * 100) / 100
  };
};

// Components
const CustomersPerMonthSlider: React.FC<{
  customersPerMonth: number | null;
  targetIncome: number;
  avgMonthlyRevenue: number;
  enabled?: boolean;
  onCustomersPerMonthChange: (value: number | null) => void;
}> = ({ 
  customersPerMonth, 
  targetIncome, 
  avgMonthlyRevenue, 
  enabled = true,
  onCustomersPerMonthChange 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-foreground">
          Customers Per Month
        </label>
        {enabled ? (
          <button
            onClick={() => onCustomersPerMonthChange(null)}
            className="text-xs px-2 py-1 rounded bg-secondary border border-border hover:bg-primary/10 transition-colors"
          >
            Auto
          </button>
        ) : (
          <button
            onClick={() => onCustomersPerMonthChange(50)}
            className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Enable
          </button>
        )}
      </div>
      {!enabled ? (
        <div className="p-3 bg-secondary/50 border border-border rounded-lg text-sm text-muted-foreground">
          Auto-calculated: {avgMonthlyRevenue > 0 ? Math.ceil(targetIncome / avgMonthlyRevenue) : 0} customers/month needed to reach ${targetIncome.toLocaleString()}/month
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <span className="text-lg font-bold text-primary">
              {customersPerMonth?.toLocaleString() || 1} customers/month
            </span>
          </div>
          <input
            type="range"
            value={customersPerMonth || 1}
            onChange={(e) => onCustomersPerMonthChange(Number(e.target.value))}
            min={1}
            max={500}
            step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span>500</span>
          </div>
        </>
      )}
    </div>
  );
};

const SliderField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  formatValue?: (value: number) => string;
}> = ({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '', formatValue }) => {
  const displayValue = formatValue ? formatValue(value) : value.toLocaleString();
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
        <span className="text-lg font-bold text-primary">
          {prefix}{displayValue}{suffix}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{prefix}{min.toLocaleString()}{suffix}</span>
        <span>{prefix}{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  );
};

const PlanEditor: React.FC<{
  plans: Plan[];
  onUpdate: (plans: Plan[]) => void;
}> = ({ plans, onUpdate }) => {
  const addPlan = () => {
    const newPlan: Plan = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      probability: 0
    };
    onUpdate([...plans, newPlan]);
  };

  const updatePlan = (id: string, field: keyof Plan, value: string | number) => {
    onUpdate(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePlan = (id: string) => {
    onUpdate(plans.filter(p => p.id !== id));
  };

  const totalProb = plans.reduce((sum, p) => sum + p.probability, 0);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-foreground">
          Revenue Plans (Optional)
        </label>
        {totalProb > 0 && (
          <span className={`text-sm font-semibold ${Math.abs(totalProb - 100) < 0.01 ? 'text-green-500' : 'text-yellow-500'}`}>
            Total: {totalProb.toFixed(0)}%
          </span>
        )}
      </div>
      
      {plans.length > 0 && (
        <div className="mb-2 grid grid-cols-12 gap-2 px-3 text-xs font-semibold text-muted-foreground">
          <div className="col-span-4">Plan Name</div>
          <div className="col-span-3">Monthly Price</div>
          <div className="col-span-3">Probability</div>
          <div className="col-span-2"></div>
        </div>
      )}
      
      <div className="space-y-2">
        {plans.map((plan) => (
          <div key={plan.id} className="grid grid-cols-12 gap-2 p-3 bg-secondary rounded-lg border border-border">
            <input
              type="text"
              value={plan.name}
              onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
              placeholder="e.g., Starter, Pro, Enterprise"
              className="col-span-4 px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary text-sm"
            />
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                value={plan.price || ''}
                onChange={(e) => updatePlan(plan.id, 'price', Number(e.target.value))}
                placeholder="49"
                min="0"
                className="w-full pl-7 pr-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div className="col-span-3 relative">
              <input
                type="number"
                value={plan.probability || ''}
                onChange={(e) => updatePlan(plan.id, 'probability', Number(e.target.value))}
                placeholder="33"
                min="0"
                max="100"
                className="w-full px-3 py-2 pr-8 bg-background border border-border rounded focus:outline-none focus:border-primary text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
            <button
              onClick={() => removePlan(plan.id)}
              className="col-span-2 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={addPlan}
        className="mt-3 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-light transition-colors font-medium"
      >
        + Add Plan
      </button>
    </div>
  );
};

const ChurnSelector: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const options = [
    { label: 'Successful', rate: 5, description: '5% monthly churn', icon: '🏆' },
    { label: 'Intermediate', rate: 10, description: '10% monthly churn', icon: '📈' },
    { label: 'MVP Product', rate: 25, description: '25% monthly churn', icon: '🚀' }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-3 text-foreground">
        Business Maturity Level
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.rate}
            onClick={() => onChange(option.rate)}
            className={`p-3 rounded-lg border-2 transition-all ${
              value === option.rate
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{option.icon}</div>
            <div className="font-semibold text-foreground text-sm">{option.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  highlight = false,
  className = '',
}) => (
  <div className={`p-6 rounded-lg border ${highlight ? 'bg-primary/10 border-primary' : 'bg-secondary border-border'} ${className}`}>
    <div className="text-sm text-muted-foreground mb-1">{title}</div>
    <div className={`text-3xl font-bold mb-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
  </div>
);

const BigPictureCard: React.FC<{ 
  metrics: BusinessMetrics;
  finalMonth?: MonthData;
 }> = ({ metrics, finalMonth }) => {
  if (!finalMonth) {
    return (
      <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50 rounded-xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-foreground mb-6">Loading data...</h3>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-primary/50 rounded-xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Business Metrics Dashboard
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Customer Lifetime Value</div>
          <div className="text-3xl font-bold text-primary">${metrics.clv.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Total value per customer</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Annual Recurring Revenue</div>
          <div className="text-3xl font-bold text-primary">${(metrics.arr / 1000).toFixed(0)}k</div>
          <div className="text-xs text-muted-foreground mt-1">MRR × 12</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Business Valuation</div>
          <div className="text-3xl font-bold text-primary">${(metrics.valuation / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-muted-foreground mt-1">ARR × 7x multiple</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">LTV:CAC Ratio</div>
          <div className={`text-3xl font-bold ${metrics.ltvCacRatio >= 3 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metrics.ltvCacRatio}:1
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.ltvCacRatio >= 3 ? '✅ Healthy' : '⚠️ Improve efficiency'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">CAC Payback Period</div>
          <div className={`text-3xl font-bold ${metrics.paybackPeriod <= 12 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metrics.paybackPeriod} mo
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.paybackPeriod <= 12 ? '✅ Good' : '⚠️ Reduce CAC'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Average ARPU</div>
          <div className="text-3xl font-bold text-primary">${metrics.averageArpu}</div>
          <div className="text-xs text-muted-foreground mt-1">Per user per month</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Final Month MRR</div>
          <div className="text-3xl font-bold text-primary">${finalMonth.mrr.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</div>
        </div>

        <div>
          <div className="text-sm text-muted-foreground mb-1">Active Customers</div>
          <div className="text-3xl font-bold text-primary">{finalMonth.customers.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">At month 60</div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Net Revenue Retention</div>
          <div className={`text-3xl font-bold ${metrics.nrr >= 100 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metrics.nrr}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.nrr >= 100 ? '✅ Growing accounts' : '📊 Monitor expansion'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Gross Revenue Retention</div>
          <div className={`text-3xl font-bold ${metrics.grr >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metrics.grr}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.grr >= 90 ? '✅ Low churn' : '⚠️ High churn'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Rule of 40</div>
          <div className={`text-3xl font-bold ${metrics.ruleOf40 >= 40 ? 'text-green-500' : 'text-yellow-500'}`}>
            {metrics.ruleOf40}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.ruleOf40 >= 40 ? '✅ Excellent balance' : '📊 Growth vs margin'}
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightsCard: React.FC<{ 
  metrics: BusinessMetrics; 
  finalMonth: MonthData | undefined;
  projections: MonthData[];
}> = ({ metrics, finalMonth, projections }) => {
  const insights = [];
  
  // LTV:CAC Ratio insights
  if (metrics.ltvCacRatio >= 5) {
    insights.push({ type: 'success', text: `Outstanding LTV:CAC ratio of ${metrics.ltvCacRatio}:1 indicates highly efficient customer acquisition. Consider increasing marketing spend to accelerate growth.` });
  } else if (metrics.ltvCacRatio >= 3) {
    insights.push({ type: 'success', text: `Healthy LTV:CAC ratio of ${metrics.ltvCacRatio}:1 shows sustainable unit economics. Continue current acquisition strategy.` });
  } else if (metrics.ltvCacRatio >= 1) {
    insights.push({ type: 'warning', text: `LTV:CAC ratio of ${metrics.ltvCacRatio}:1 is below the ideal 3:1 threshold. Focus on reducing churn or CAC to improve profitability.` });
  } else {
    insights.push({ type: 'danger', text: `Critical: LTV:CAC ratio of ${metrics.ltvCacRatio}:1 means you're losing money on each customer. Urgently review pricing and acquisition strategy.` });
  }
  
  // Payback period insights
  if (metrics.paybackPeriod <= 6) {
    insights.push({ type: 'success', text: `Exceptional ${metrics.paybackPeriod}-month payback period allows for rapid reinvestment in growth.` });
  } else if (metrics.paybackPeriod <= 12) {
    insights.push({ type: 'success', text: `Good ${metrics.paybackPeriod}-month payback period keeps cash flow healthy.` });
  } else if (metrics.paybackPeriod <= 18) {
    insights.push({ type: 'warning', text: `${metrics.paybackPeriod}-month payback period is manageable but consider optimizing CAC or increasing ARPU.` });
  } else {
    insights.push({ type: 'danger', text: `Long ${metrics.paybackPeriod}-month payback period may strain cash flow. Prioritize reducing CAC.` });
  }
  
  // NRR insights
  if (metrics.nrr >= 120) {
    insights.push({ type: 'success', text: `Outstanding ${metrics.nrr}% NRR shows strong expansion revenue. Your existing customers are growing significantly.` });
  } else if (metrics.nrr >= 100) {
    insights.push({ type: 'success', text: `Positive ${metrics.nrr}% NRR means expansion revenue exceeds churn - a key indicator of product-market fit.` });
  } else if (metrics.nrr >= 90) {
    insights.push({ type: 'warning', text: `${metrics.nrr}% NRR indicates slight contraction. Focus on upselling and cross-selling to existing customers.` });
  } else {
    insights.push({ type: 'danger', text: `${metrics.nrr}% NRR shows significant revenue loss from existing customers. Address churn immediately.` });
  }
  
  // Rule of 40 insights
  if (metrics.ruleOf40 >= 40) {
    insights.push({ type: 'success', text: `Rule of 40 score of ${metrics.ruleOf40}% indicates excellent balance between growth and profitability - attractive to investors.` });
  } else {
    insights.push({ type: 'info', text: `Rule of 40 score of ${metrics.ruleOf40}% suggests optimizing either growth rate or profit margins to reach the 40% threshold.` });
  }
  
  // Break-even insights
  if (metrics.breakEvenMonth > 0 && metrics.breakEvenMonth <= 24) {
    insights.push({ type: 'success', text: `Reaching break-even at month ${metrics.breakEvenMonth} demonstrates a path to profitability within 2 years.` });
  } else if (metrics.breakEvenMonth > 24) {
    insights.push({ type: 'info', text: `Break-even projected at month ${metrics.breakEvenMonth}. Consider strategies to accelerate profitability.` });
  } else if (metrics.breakEvenMonth === -1) {
    insights.push({ type: 'warning', text: `No break-even point reached in 60 months. Review cost structure and pricing strategy.` });
  }
  
  // Customer insights
  if (finalMonth) {
    const totalChurned = projections.reduce((sum, m) => sum + m.churnedCustomers, 0);
    const churnImpact = ((totalChurned / finalMonth.customers) * 100).toFixed(1);
    insights.push({ type: 'info', text: `Total customer churn over 60 months: ${totalChurned.toLocaleString()} customers (${churnImpact}% of acquired). Reducing churn by 1% could add $${((finalMonth.mrr * 0.01 * 60) / 1000).toFixed(0)}k in revenue.` });
  }
  
  return (
    <div className="bg-card border-2 border-purple-500/50 rounded-xl p-8 shadow-xl">
      <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="text-3xl">💡</span>
        Insights
      </h3>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'success' ? 'bg-green-500/10 border-green-500' :
              insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
              insight.type === 'danger' ? 'bg-red-500/10 border-red-500' :
              'bg-blue-500/10 border-blue-500'
            }`}
          >
            <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
      
      {finalMonth && (
        <div className="mt-6 p-6 rounded-lg border-l-4 border-purple-500 bg-purple-500/10">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Growth Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <div className="text-foreground font-medium">{finalMonth.customers.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Total customers</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <div className="text-foreground font-medium">${finalMonth.profit.toLocaleString()}</div>
                <div className="text-muted-foreground text-xs">Net profit</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <div className="text-foreground font-medium">${finalMonth.expansionRevenue.toLocaleString()}<span className="text-muted-foreground text-xs">/mo</span></div>
                <div className="text-muted-foreground text-xs">Expansion revenue</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <div>
                <div className="text-foreground font-medium">${finalMonth.operatingCosts.toLocaleString()}<span className="text-muted-foreground text-xs">/mo</span></div>
                <div className="text-muted-foreground text-xs">Operating costs</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App
const SaaSCalculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    targetIncome: 10000,
    avgMonthlyRevenue: 50,
    plans: [],
    churnRate: 10,
    cac: 100,
    customersPerMonth: null,
    expansionRevenue: 5,
    supportCostPerUser: 2,
    infrastructureCostPerUser: 3
  });

  const [projections, setProjections] = useState<MonthData[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    clv: 0,
    arr: 0,
    valuation: 0,
    paybackPeriod: 0,
    grossMargin: 80,
    ltvCacRatio: 0,
    nrr: 0,
    grr: 0,
    ruleOf40: 0,
    breakEvenMonth: -1,
    averageArpu: 0
  });

  useEffect(() => {
    const data = calculateProjections(
      state.targetIncome,
      state.avgMonthlyRevenue,
      state.plans,
      state.churnRate,
      state.cac,
      state.expansionRevenue,
      state.supportCostPerUser,
      state.infrastructureCostPerUser,
      state.customersPerMonth
    );
    setProjections(data);
    
    const businessMetrics = calculateBusinessMetrics(
      data,
      state.avgMonthlyRevenue,
      state.churnRate,
      state.cac,
      state.expansionRevenue
    );
    setMetrics(businessMetrics);
  }, [state]);

  const finalMonth = projections[projections.length - 1];
  const monthsToTarget = projections.findIndex(d => d.mrr >= state.targetIncome);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            SaaS Income Calculator
          </h1>
          <p className="text-lg text-muted-foreground">
            Project your revenue growth over 60 months with real business metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card border-2 border-purple-500/50 rounded-xl p-8 shadow-xl sticky top-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-3xl">⚙️</span>
                Configuration
              </h2>
              
              <SliderField
                label="Target Monthly Income"
                value={state.targetIncome}
                onChange={(v) => setState({ ...state, targetIncome: v })}
                min={1000}
                max={100000}
                step={1000}
                prefix="$"
              />

              <SliderField
                label="Average User Payment/Month"
                value={state.avgMonthlyRevenue}
                onChange={(v) => setState({ ...state, avgMonthlyRevenue: v })}
                min={10}
                max={500}
                step={5}
                prefix="$"
              />

              <SliderField
                label="Customer Acquisition Cost (CAC)"
                value={state.cac}
                onChange={(v) => setState({ ...state, cac: v })}
                min={0}
                max={500}
                step={10}
                prefix="$"
              />

              <CustomersPerMonthSlider
                customersPerMonth={state.customersPerMonth}
                targetIncome={state.targetIncome}
                avgMonthlyRevenue={state.avgMonthlyRevenue}
                enabled={state.customersPerMonth !== null}
                onCustomersPerMonthChange={(value) => setState({ ...state, customersPerMonth: value })}
              />

              <PlanEditor
                plans={state.plans}
                onUpdate={(plans) => setState({ ...state, plans })}
              />

              <ChurnSelector
                value={state.churnRate}
                onChange={(v) => setState({ ...state, churnRate: v })}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Month 60 MRR"
                value={`$${finalMonth?.mrr.toLocaleString() || 0}`}
                subtitle="Monthly Recurring Revenue"
                highlight
              />
              <MetricCard
                title="Total Revenue"
                value={`$${finalMonth?.revenue.toLocaleString() || 0}`}
                subtitle="Cumulative over 60 months"
              />
              <MetricCard
                title="Active Customers"
                value={finalMonth?.customers || 0}
                subtitle="At month 60"
              />
              <MetricCard
                title="Time to Target"
                value={monthsToTarget > 0 ? `${monthsToTarget} mo` : 'N/A'}
                subtitle="Months to reach target"
              />
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border-2 border-purple-500/50 rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-3xl">📈</span>
                Revenue Projection
              </h3>
              <div className="h-[400px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projections}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorNetRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#a0aec0' }}
                      axisLine={{ stroke: '#4a5568' }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#a0aec0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#a0aec0' }}
                      axisLine={{ stroke: '#4a5568' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        const label = name === 'revenue' ? 'Gross Revenue' : 'Net Revenue';
                        return [`$${Number(value).toLocaleString()}`, label];
                      }}
                      labelFormatter={(month) => `Month ${month}`}
                      contentStyle={{
                        background: '#1a202c',
                        border: '1px solid #4a5568',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="url(#colorRevenue)"
                      name="Gross Revenue"
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                    <Area 
                      type="monotone"
                      dataKey="netRevenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="url(#colorNetRevenue)"
                      name="Net Revenue"
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                60-Month Projection
              </div>
            </div>

            {/* MRR Chart */}
            <div className="bg-card border-2 border-purple-500/50 rounded-xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Monthly Recurring Revenue
              </h3>
              <div className="h-[400px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projections}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#a0aec0' }}
                      axisLine={{ stroke: '#4a5568' }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#a0aec0' }}
                    />
                    <YAxis 
                      tick={{ fill: '#a0aec0' }}
                      axisLine={{ stroke: '#4a5568' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'MRR']}
                      labelFormatter={(month) => `Month ${month}`}
                      contentStyle={{
                        background: '#1a202c',
                        border: '1px solid #4a5568',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mrr" 
                      stroke="#9f7aea" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, fill: '#9f7aea' }}
                      name="MRR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                Monthly Recurring Revenue Over Time
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border-2 border-purple-500/50 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Business Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="Customer LTV"
                    value={`$${metrics.clv.toLocaleString()}`}
                    subtitle="Lifetime Value"
                  />
                  <MetricCard
                    title="ARR"
                    value={`$${metrics.arr.toLocaleString()}`}
                    subtitle="Annual Recurring Revenue"
                  />
                  <MetricCard
                    title="Valuation"
                    value={`$${metrics.valuation.toLocaleString()}`}
                    subtitle="7x ARR"
                  />
                  <MetricCard
                    title="Payback Period"
                    value={`${metrics.paybackPeriod} mo`}
                    subtitle="Time to recover CAC"
                  />
                </div>
              </div>

              <div className="bg-card border-2 border-purple-500/50 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Growth Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    title="LTV:CAC"
                    value={metrics.ltvCacRatio}
                    subtitle={metrics.ltvCacRatio >= 3 ? '✅ Healthy' : '⚠️ Needs Attention'}
                    className={metrics.ltvCacRatio >= 3 ? 'text-green-500' : 'text-yellow-500'}
                  />
                  <MetricCard
                    title="NRR"
                    value={`${metrics.nrr}%`}
                    subtitle="Net Revenue Retention"
                    className={metrics.nrr >= 100 ? 'text-green-500' : 'text-yellow-500'}
                  />
                  <MetricCard
                    title="GRR"
                    value={`${metrics.grr}%`}
                    subtitle="Gross Revenue Retention"
                    className={metrics.grr >= 90 ? 'text-green-500' : 'text-yellow-500'}
                  />
                  <MetricCard
                    title="Rule of 40"
                    value={`${metrics.ruleOf40}%`}
                    subtitle={metrics.ruleOf40 >= 40 ? '✅ Excellent' : '📊 Monitor'}
                    className={metrics.ruleOf40 >= 40 ? 'text-green-500' : 'text-yellow-500'}
                  />
                </div>
              </div>
            </div>

            {/* Big Picture - Full Width */}
            <div className="mb-6">
              <BigPictureCard metrics={metrics} finalMonth={finalMonth} />
            </div>

            {/* Insights - Full Width */}
            <div className="mb-6">
              <InsightsCard metrics={metrics} finalMonth={finalMonth} projections={projections} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SaaSCalculator;
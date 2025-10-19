# 📊 SaaS Income Calculator

A powerful financial modeling tool for SaaS businesses to project revenue, analyze metrics, and plan growth over 60 months.

## 🎯 What It Does

Projects your SaaS business growth with real financial metrics including revenue, customers, churn, and profitability. Provides actionable insights based on industry benchmarks.

## 📥 Inputs

### Core Settings
- **Target Monthly Income** ($1k - $100k)
  - Your revenue goal to reach

- **Average User Payment/Month** ($10 - $500)
  - How much each customer pays monthly

- **Customers Acquired Per Month** (Optional, 1-500)
  - Toggle between auto-calculated or manual override
  - Auto mode: Calculates based on target income ÷ avg payment

- **Customer Acquisition Cost (CAC)** ($0 - $500)
  - Cost to acquire one customer

### Advanced Options

- **Revenue Plans** (Optional)
  - Create multiple pricing tiers (Starter, Pro, Enterprise, etc.)
  - Set price and probability for each tier
  - System calculates weighted average revenue

- **Business Maturity Level**
  - 🏆 Successful (5% monthly churn)
  - 📈 Intermediate (10% monthly churn)
  - 🚀 MVP Product (25% monthly churn)

## 📤 Outputs

### 📈 Key Metrics
- **Month 60 MRR** - Monthly Recurring Revenue at 5 years
- **Total Revenue** - Cumulative revenue over 60 months
- **Active Customers** - Customer count at month 60
- **Time to Target** - Months to reach your income goal

### 💼 Business Metrics
- **Customer Lifetime Value (CLV)** - Total value per customer
- **Annual Recurring Revenue (ARR)** - MRR × 12
- **Business Valuation** - ARR × 7x multiple
- **CAC Payback Period** - Months to recover acquisition cost
- **Average ARPU** - Average Revenue Per User

### 📊 Growth Metrics
- **LTV:CAC Ratio** - Efficiency indicator (target: 3:1+)
- **Net Revenue Retention (NRR)** - Includes expansion (target: 100%+)
- **Gross Revenue Retention (GRR)** - Excludes expansion (target: 90%+)
- **Rule of 40** - Growth + Profit Margin (target: 40%+)

### 📉 Visual Charts
- **Revenue Projection** - 60-month cumulative revenue (gross vs net)
- **Monthly Recurring Revenue** - MRR growth over time

### 💡 Insights
Real-time analysis including:
- LTV:CAC efficiency recommendations
- Payback period assessment
- Revenue retention health checks
- Break-even projections
- Growth optimization suggestions

## 🚀 How to Use

1. **Set your target income** - What monthly revenue do you want?
2. **Define pricing** - Average payment or create detailed pricing plans
3. **Choose maturity level** - Select churn rate based on product stage
4. **Add acquisition cost** - How much to acquire each customer?
5. **Review projections** - Analyze charts and metrics
6. **Read insights** - Get actionable recommendations

## ✅ Health Indicators

- 🟢 **Green** - Healthy metrics, on track
- 🟡 **Yellow** - Needs attention, optimize
- 🔴 **Red** - Critical, requires immediate action

## 🎓 Understanding Key Ratios

**LTV:CAC Ratio**
- 5:1+ = Excellent, scale up marketing
- 3:1+ = Healthy, sustainable growth
- 1:1- = Losing money per customer

**Net Revenue Retention**
- 120%+ = Outstanding expansion
- 100%+ = Growth from existing customers
- <100% = Revenue contraction

**Rule of 40**
- 40%+ = Excellent balance
- <40% = Focus on growth or profitability

## 💻 Technical Details

Built with React, TypeScript, and Recharts. Uses realistic financial modeling with:
- Monthly churn calculations
- Expansion revenue modeling
- Operating cost projections
- Cumulative profit tracking

---

**Made with ❤️ by [Tranquil Software](https://tranquilsoftware.com.au)**
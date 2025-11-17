# Net Worth Engine & Financial Freedom Scorecard

A comprehensive financial planning tool that helps you track your net worth and plan for financial freedom.

## Features

### Net Worth Engine
- **Assets Tracking**: Track Cash, Stocks & ETFs, Property, Super, and Other assets
- **Liabilities Tracking**: Monitor Mortgage, Credit Card, Personal Loans, Margin Loan, and Other liabilities
- **Real-time Calculations**: Automatic calculation of total assets, liabilities, and net worth
- **Visual Analytics**:
  - Donut charts for asset and liability allocation
  - Projection graph showing net worth growth over time
- **Interactive Controls**: Sliders and input fields for easy adjustments
- **Projection Settings**: Adjustable growth rate and time horizon

### Financial Freedom Scorecard
- **Lifestyle Planning**: Set your target annual lifestyle cost
- **Income Tracking**: Monitor passive and active income
- **Savings Management**: Adjustable savings rate with real-time calculations
- **Growth Projections**: Visualize when you'll achieve financial freedom
- **Progress Tracking**: See your current freedom percentage and expected date

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Dark Mode** - Theme switching support

## Usage

### Net Worth Engine
1. Enter your asset values in the left panel
2. Enter your liability values in the right panel
3. View real-time calculations in the summary cards
4. Explore allocation charts to understand your portfolio distribution
5. Adjust growth rate and horizon to see future projections

### Freedom Scorecard
1. Set your target lifestyle cost
2. Enter your current passive income
3. Optionally add active income and savings rate
4. Adjust growth rate to see different scenarios
5. View the projection graph to see when you'll achieve financial freedom

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page with tab navigation
├── components/
│   ├── NetWorthEngine.tsx    # Net worth tracking component
│   └── FreedomScorecard.tsx  # Financial freedom planning component
└── package.json
```

## License

MIT


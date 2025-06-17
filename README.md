# Black-Scholes Interactive Dashboard

A modern, interactive Black-Scholes options pricing calculator with real-time parameter controls and dynamic heatmap visualizations. Built for financial professionals, educators, and traders seeking intuitive options analysis tools.

## ✨ Features

- **Real-time Options Pricing** - Instant Call/Put price calculations using the Black-Scholes formula
- **Interactive Parameter Controls** - Real-time sliders for spot price, strike, volatility, time to expiration, and risk-free rate
- **Dynamic Heatmaps** - Interactive visualizations showing option price sensitivity across spot price and volatility ranges
- **Greeks Calculations** - Delta, Gamma, and other sensitivity metrics
- **Professional UI** - Clean, dark-themed interface optimized for financial analysis
- **Educational Focus** - Clear parameter explanations and intuitive design for learning options concepts

## 🛠️ Tech Stack

**Backend**
- FastAPI (Python) - High-performance API framework
- NumPy & SciPy - Mathematical computations
- Pydantic - Data validation and serialization

**Frontend**
- Next.js 14 - React framework with App Router
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first styling
- Plotly.js - Interactive data visualizations

**Deployment**
- Vercel (Frontend) - Optimized for Next.js
- Railway/Render (Backend) - FastAPI hosting

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm/yarn

### Backend Setup
```bash
# Clone repository and navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 How It Works

1. **Input Parameters** - Adjust option parameters using the sidebar controls
2. **Real-time Calculation** - Backend processes Black-Scholes formula instantly
3. **Visual Analysis** - View results through price displays and interactive heatmaps
4. **Sensitivity Analysis** - Explore how parameter changes affect option prices

## 🎯 Use Cases

- **Educational** - Learn Black-Scholes concepts through interactive visualization
- **Professional Analysis** - Analyze option pricing scenarios and sensitivities
- **Strategy Development** - Explore different market conditions and their impact
- **Risk Assessment** - Understand how Greeks affect option positions

## 📈 Project Structure

```
blackscholes-dashboard/
├── backend/                 # FastAPI application
│   ├── models/             # Black-Scholes calculation engine
│   ├── routers/            # API endpoints
│   ├── schemas/            # Request/response models
│   └── main.py             # Application entry point
└── frontend/               # Next.js application
    ├── app/                # App Router pages
    ├── components/         # React components
    ├── lib/                # API client and utilities
    └── types/              # TypeScript definitions
```

# PayNoti 💳

> **Never miss a payment. Track everything, pay smarter.**

PayNoti is a comprehensive Web3 payment management platform that helps users track bills, manage subscriptions, and optimize their spending through intelligent automation and analytics.

![PayNoti Dashboard](https://via.placeholder.com/800x400/8B5CF6/FFFFFF?text=PayNoti+Dashboard)

## ✨ Features

### 🔔 **Automated Payment Reminders**
- Proactive notifications for upcoming bill due dates
- Multi-channel alerts (Push, Email, Farcaster Frames)
- Customizable reminder schedules
- Never miss a payment again

### 🔗 **Cross-Platform Payment Aggregation**
- Unified dashboard for all payment obligations
- Base blockchain transaction monitoring
- Real-time balance tracking
- Comprehensive transaction history

### 🚨 **Spending Anomaly Detection**
- AI-powered duplicate charge detection
- Unusual spending pattern alerts
- Fraud protection and security monitoring
- Smart transaction categorization

### 📊 **Subscription Management & Optimization**
- Complete subscription tracking and analytics
- Usage-based optimization suggestions
- Billing cycle management
- Cost-saving recommendations

### 📈 **Advanced Analytics** *(Premium)*
- Detailed spending insights and trends
- Category-based expense breakdown
- Monthly/yearly projections
- Data export capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Base wallet (Coinbase Wallet, MetaMask, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vistara-apps/paynoti.git
cd paynoti
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
VITE_API_BASE_URL=https://api.paynoti.app
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:5173](http://localhost:5173)

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

### Web3 Integration
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **Base Blockchain** - Layer 2 scaling solution

### APIs & Services
- **Axios** - HTTP client for API requests
- **Date-fns** - Modern date utility library
- **X402 Payment Protocol** - Micropayment integration

## 📱 Usage

### 1. **Connect Your Wallet**
- Click "Connect Wallet" in the top right
- Choose your preferred wallet (Coinbase Wallet, MetaMask, etc.)
- Approve the connection

### 2. **Set Up Payment Tracking**
- Navigate to the Dashboard
- Your Base transactions will be automatically imported
- Review and categorize your payments

### 3. **Create Payment Reminders**
- Go to the Reminders section
- Select upcoming payments
- Configure reminder preferences (1, 3, 7 days before due)
- Choose notification channels

### 4. **Manage Subscriptions** *(Premium)*
- Access the Subscriptions tab
- View all recurring payments
- Get optimization suggestions
- Track usage scores and savings opportunities

### 5. **Analyze Spending** *(Premium)*
- Visit the Analytics dashboard
- Review spending trends and patterns
- Export data for external analysis
- Monitor anomalies and unusual activity

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | PayNoti API endpoint | `https://api.paynoti.app` |
| `VITE_BASE_RPC_URL` | Base blockchain RPC | `https://mainnet.base.org` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | Required |

### Customization

#### Design System
PayNoti uses a comprehensive design system with customizable tokens:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220 89.2% 50%)',
        accent: 'hsl(10, 90%, 55%)',
        // ... more colors
      }
    }
  }
}
```

#### API Configuration
Customize API endpoints and behavior in `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.paynoti.app';
const BASE_RPC_URL = process.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org';
```

## 🏢 Business Model

### **Freemium Pricing**
- **Free Tier**: Core notification features, basic dashboard
- **Premium Tier ($5/month)**: Advanced analytics, subscription optimization, anomaly detection

### **Premium Features**
- ✅ Advanced spending analytics
- ✅ Subscription management & optimization
- ✅ Anomaly detection & fraud alerts
- ✅ Data export capabilities
- ✅ Priority customer support

## 🔐 Security & Privacy

- **Wallet-based Authentication**: No passwords, just wallet signatures
- **Local Data Processing**: Sensitive calculations performed client-side
- **Encrypted Communications**: All API calls use HTTPS/TLS
- **No Private Key Storage**: PayNoti never stores or accesses private keys
- **Open Source**: Transparent, auditable codebase

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── AppShell.jsx    # Main layout wrapper
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Analytics.jsx   # Analytics dashboard
│   └── ...
├── services/           # API services
│   └── api.js         # API client and services
├── data/              # Mock data and constants
├── utils/             # Utility functions
└── styles/            # CSS and styling
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run type-check   # TypeScript type checking
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 API Documentation

Comprehensive API documentation is available at [docs/API.md](./docs/API.md).

### Quick API Example

```javascript
import { aggregationService } from './services/api';

// Get user's payment data
const paymentData = await aggregationService.aggregatePayments(walletAddress);

// Create a payment reminder
const reminder = await notificationService.sendPaymentReminder({
  walletAddress,
  reminder: {
    serviceName: 'Netflix',
    amount: 15.99,
    dueDate: '2024-09-15T00:00:00Z'
  }
});
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```bash
docker build -t paynoti .
docker run -p 3000:3000 paynoti
```

## 🤝 Community & Support

- **Discord**: [Join our community](https://discord.gg/paynoti)
- **Twitter**: [@PayNotiApp](https://twitter.com/PayNotiApp)
- **Email**: support@paynoti.app
- **Documentation**: [docs.paynoti.app](https://docs.paynoti.app)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Base** - For providing the blockchain infrastructure
- **Farcaster** - For Frame Actions integration
- **RainbowKit** - For excellent wallet connection UX
- **Tailwind CSS** - For the utility-first CSS framework

---

<div align="center">
  <p>Built with ❤️ for the Web3 community</p>
  <p>
    <a href="https://paynoti.app">Website</a> •
    <a href="https://docs.paynoti.app">Documentation</a> •
    <a href="https://discord.gg/paynoti">Discord</a> •
    <a href="https://twitter.com/PayNotiApp">Twitter</a>
  </p>
</div>

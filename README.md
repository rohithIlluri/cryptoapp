# CryptoPulse - Cryptocurrency Dashboard

A modern, responsive cryptocurrency dashboard built with React and Tailwind CSS, featuring real-time market data, charts, and news.

## 🚀 Features

- **Real-time Market Data** - Live cryptocurrency prices and market statistics
- **Interactive Charts** - Price history charts with multiple timeframes
- **Market Overview** - Global market cap, volume, and dominance breakdown
- **Coin Details** - Comprehensive information for individual cryptocurrencies
- **Latest News** - Crypto news from reliable sources
- **Responsive Design** - Mobile-first design with smooth animations
- **Dark Theme** - TradingView-inspired dark theme for better readability

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── ErrorDisplay.js
│   │   └── Skeletons.js
│   ├── layout/           # Layout components
│   │   ├── Sidebar.js
│   │   └── Header.js
│   ├── pages/            # Page components
│   │   ├── HomePage.js
│   │   ├── CryptocurrenciesPage.js
│   │   ├── NewsPage.js
│   │   └── CryptoDetailsPage.js
│   ├── ui/               # UI components
│   │   ├── StatCard.js
│   │   ├── CryptoCard.js
│   │   └── NewsCard.js
│   └── index.js          # Component exports
├── services/
│   └── api.js            # API service functions
├── utils/
│   └── formatters.js     # Utility functions
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── types/                 # TypeScript types (if using TS)
├── App.js                 # Main app component
└── index.js               # App entry point
```

## 🧩 Components Breakdown

### Common Components
- **ErrorDisplay** - Consistent error message display
- **Skeletons** - Loading state components for better UX

### UI Components
- **StatCard** - Statistics display with icons and change indicators
- **CryptoCard** - Cryptocurrency information cards
- **NewsCard** - News article display with images

### Layout Components
- **Sidebar** - Navigation sidebar with active states
- **Header** - Mobile header with menu toggle

### Page Components
- **HomePage** - Dashboard with market overview and trending coins
- **CryptocurrenciesPage** - Table view of all cryptocurrencies
- **NewsPage** - Latest crypto news display
- **CryptoDetailsPage** - Detailed coin information with charts

## 🛠️ Technologies Used

- **React 17** - UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Lucide React** - Icon library
- **CoinGecko API** - Cryptocurrency data
- **CryptoCompare API** - News data

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile**: Stacked layout with collapsible sidebar
- **Tablet**: Side-by-side layout with fixed sidebar
- **Desktop**: Full layout with enhanced spacing and features

## 🎨 Design System

- **Color Scheme**: Dark theme with teal accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using Tailwind's scale
- **Animations**: Smooth transitions and hover effects
- **Shadows**: Subtle shadows for depth and hierarchy

## 🔧 Customization

### Adding New Components
1. Create component in appropriate folder
2. Export from `src/components/index.js`
3. Import and use in your pages

### Styling
- Use Tailwind CSS classes for consistent styling
- Follow the established color scheme and spacing
- Maintain responsive design principles

### API Integration
- Add new API functions in `src/services/api.js`
- Use the established error handling patterns
- Follow the data transformation conventions

## 📈 Future Enhancements

- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Advanced charting tools
- [ ] Social features
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced filtering and sorting
- [ ] Export functionality

## 🤝 Contributing

1. Follow the established folder structure
2. Use consistent naming conventions
3. Maintain responsive design principles
4. Add proper error handling
5. Include loading states for better UX

## 📄 License

This project is licensed under the MIT License.

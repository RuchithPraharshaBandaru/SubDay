# 💳 SubDay Pro

A modern, feature-rich subscription management application built with React, Firebase, and AI-powered insights. Track, analyze, and optimize your recurring expenses with an elegant, mobile-responsive interface.

![SubDay Pro](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 📅 **Calendar View**
- Visual monthly calendar with subscription tiles
- Color-coded subscriptions by category
- Click any date to see subscriptions due
- Responsive 2/3/5 column layout for mobile/tablet/desktop

### 📊 **List View**
- Sortable table of all subscriptions
- Filter by name, price, category, frequency, and status
- Quick edit and delete actions
- Mobile-optimized with hidden columns on small screens

### 📈 **Analytics & Charts**
- **Pie Chart**: Category-wise spending breakdown
- **Line Chart**: 12-month cost forecast
- Total monthly spending in multiple currencies
- Visual insights into subscription patterns

### 💬 **AI Chat Assistant**
- Powered by Google Gemini 2.0 Flash
- Get personalized financial advice
- Ask questions about your subscriptions
- Context-aware responses based on your data

### 🌍 **Multi-Currency Support**
- USD, EUR, GBP, INR, JPY, CAD, AUD
- Real-time currency conversion
- Persistent currency selection

### 🎨 **Modern UI/UX**
- Dark theme with gradient accents
- Smooth animations and transitions
- Custom scrollbars and hover effects
- Touch-friendly mobile interface (44px minimum touch targets)
- iOS Safari zoom prevention

### 🔐 **Authentication**
- Secure Google OAuth login via Firebase
- User-specific data isolation
- Automatic session management

### 📤 **Data Export**
- Export subscriptions to CSV
- Download for offline analysis or backup

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern hooks-based components
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **React Calendar** - Interactive date picker
- **Recharts** - Responsive data visualization

### Backend & Services
- **Firebase Authentication** - Google OAuth
- **Firestore Database** - Real-time NoSQL database
- **Google Generative AI** - Gemini 2.0 Flash for chat

### Architecture
- Component-based structure with custom hooks
- Service layer abstraction for Firebase and AI
- Utility modules for calculations and currency
- Modular, maintainable codebase (16+ files)

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase Project** with Firestore enabled
- **Google AI API Key** (for Gemini chat)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd subscription
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase

Create a `firebase.json` in the root directory (or update existing):
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Update `src/firebase.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Configure Gemini AI

Update `src/services/gemini.js` with your API key:
```javascript
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
```

> **Note**: For production, use environment variables instead of hardcoding API keys.

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🏗️ Project Structure

```
subscription/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── AddSubscriptionModal.jsx
│   │   ├── CalendarView.jsx
│   │   ├── ChatView.jsx
│   │   ├── DayDetailPanel.jsx
│   │   ├── Header.jsx
│   │   ├── ListView.jsx
│   │   ├── LoginScreen.jsx
│   │   └── StatsCharts.jsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useCurrency.js
│   │   └── useSubscriptions.js
│   ├── services/        # External services
│   │   ├── firebase.js
│   │   └── gemini.js
│   ├── utils/           # Helper functions
│   │   ├── calculations.js
│   │   ├── constants.js
│   │   └── currency.js
│   ├── assets/          # Images, fonts, etc.
│   ├── App.jsx          # Main application
│   ├── App.css          # Component styles
│   ├── main.jsx         # Entry point
│   ├── index.css        # Global styles
│   └── firebase.js      # Firebase config
├── firebase.json        # Firebase hosting config
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## 📱 Usage

### Adding a Subscription
1. Click the **"+ Add Subscription"** button
2. Search for popular services (Netflix, Spotify, etc.) or enter custom name
3. Enter price (USD), billing day, frequency, and status
4. Select category and optional color
5. Click **"Add Subscription"**

### Managing Subscriptions
- **Edit**: Click the edit icon on any subscription card or row
- **Delete**: Click the trash icon to remove a subscription
- **Sort**: Click column headers in List View to sort
- **Filter**: Subscriptions appear on calendar dates when due

### Using AI Chat
1. Navigate to the **Chat** tab
2. Ask questions like:
   - "How can I reduce my monthly expenses?"
   - "What's my most expensive category?"
   - "Should I cancel any subscriptions?"
3. Get AI-powered insights based on your actual data

### Exporting Data
Click the **Export CSV** button in the header to download all subscription data.

## 🎨 Customization

### Adding New Categories
Edit `src/utils/constants.js`:
```javascript
export const CATEGORIES = [
  'Entertainment', 'Productivity', 'Fitness', 
  'Education', 'Shopping', 'Other', 'YourNewCategory'
];
```

### Adding Preset Subscriptions
Edit `src/utils/constants.js`:
```javascript
export const PRESET_SUBS = [
  { name: 'YourService', price: 9.99, cat: 'Entertainment', 
    color: '#FF0000', domain: 'yourservice.com' },
  // ... more presets
];
```

### Changing Currency Rates
Edit `src/utils/currency.js` and update the `convertPrice` function with current exchange rates.

## 🔧 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Other Platforms
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Currency conversion rates are hardcoded (consider using live API)
- AI responses require active internet connection
- Calendar may not display correctly in very narrow viewports (<320px)

## 🔮 Future Enhancements

- [ ] Recurring notification reminders
- [ ] Dark/light theme toggle
- [ ] Budget setting and alerts
- [ ] Subscription sharing with family
- [ ] Integration with banking APIs
- [ ] Bill payment tracking
- [ ] Expense reports and insights
- [ ] Multi-language support
- [ ] PWA capabilities for offline use



## 👨‍💻 Author

Built with ❤️ by Ruchith Praharsha

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Google AI](https://ai.google.dev/) - Gemini API
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Charts

---

**⭐ Star this repo if you find it helpful!**

# Rh Management Pro 🚀

A premium, comprehensive HR management solution built with **React Native Web**. This project provides a seamless experience across Web, iOS, and Android from a single codebase.

## 🌟 Key Features

### 🏢 Core HR Modules

- **Employee Management**: Complete lifecycle tracking with professional profiles and document management.
- **Leave & Absence**: Sophisticated request and approval workflows for vacations and authorizations.
- **Payroll System**: Month-by-month payroll generation, status tracking, and automated PDF payslip logic.
- **Illness Management**: Specialized tracking for sick leaves and medical certificate validation.
- **Remote Work**: Calendar-integrated planning for remote vs. office days.

### 🤖 Intelligent Features

- **AI ChatBot Assistant**: Integrated HR assistant to help employees find information, check balances, and navigate the app.
- **Analytics Dashboard**: Real-time visualization of HR metrics, adherence rates, and team trends.

### 🎨 Premium UI/UX

- **Dark Mode Support**: System-wide dark mode with carefully curated color palettes.
- **Premium Themes**: Inclusion of exclusive themes like the "Premium Gold" theme for high-end users.
- **Glassmorphism**: Modern, transparent UI elements including a sophisticated `GlassHeader` for web.
- **Responsive Navigation**: Adaptive sidebar and bottom navigation tailored for all screen sizes.

### 🌍 Global Readability

- **Multilingual**: Native support for English, French, Arabic (RTL), German, Spanish, Chinese, and Hindi.
- **i18n Integration**: Dynamic language switching without reload.

---

## Documentation

- [Pages and Roles](pages-and-roles.md): Detailed matrix of access control.
- [Use Cases](use-cases.md): Common user scenarios and workflows.
- [Commercial Overview](COMMERCIAL.md): Product features and value proposition.

## 🛠 Tech Stack

- **Framework**: [React Native Web](https://necolas.github.io/react-native-web/) for cross-platform excellence.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with persistent storage.
- **Navigation**: [React Navigation 7](https://reactnavigation.org/) with deep linking.
- **Service Layer**: [Firebase](https://firebase.google.com/) for notifications, analytics, and authentication.
- **Persistence**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) for high-performance localized storage.
- **Styling**: Vanilla CSS, NativeWind, and a dedicated `ThemeContext` system.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- React Native environment (for mobile builds)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bkmed/RhManagment.git
   cd RhManagment
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Development:

   ```bash
   # Web (Dev Server with Hot Reload)
   npm run start-web-dev-nossr

   # Mobile (Metro Bundler)
   npm start
   ```

---

## 🏗 Project Structure

- `src/components/`: Reusable UI components (Modals, Dropdowns, Fields).
- `src/screens/`: Feature-specific screens (Payroll, Leaves, Profile).
- `src/store/`: Redux slices and store configuration.
- `src/database/`: Local database services and persistence logic.
- `src/theme/`: Theme definitions (Light, Dark, Premium).
- `src/i18n/`: Translation files and localization setup.

---

## 🧪 Development & Testing

```bash
# Linting
npm run lint

# Formatting (Prettier)
npx prettier --write .

# Build for Production (Web)
npm run build-gh-pages
```

---

## 📄 License

This project is licensed under the MIT License.

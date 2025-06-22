# 📱 VTOP Chennai (Unofficial) – React Native + Node.js

> A lightweight React Native app built with Expo that fetches your VTOP data on demand using a refresh button. Powered by a backend scraper using Node.js + cheerio or Jsoup.

---

## 🚀 Features

- 📅 View timetable, attendance, grades, and more
- 🔐 Secure credential storage (locally on device)
- 🔄 One-tap refresh to sync with VTOP
- 🌐 Expo-friendly: No Mac required to publish to TestFlight!
- 🔧 Modular backend for scraping data from VTOP
- 🗃️ Offline-first: Uses cached data when offline

---

## 📦 Tech Stack

| Layer        | Stack                        |
|--------------|------------------------------|
| Frontend     | React Native (with Expo)     |
| Backend      | Node.js + Express + cheerio  |
| Local Storage| AsyncStorage / SecureStore   |
| Build        | EAS Build (for iOS)          |
| Hosting      | Vercel / Render (for backend)|

---

## 🧱 Folder Structure

```
vtop-app/
├── frontend/                # React Native (Expo) project
│   ├── App.js
│   ├── screens/
│   ├── components/
│   └── utils/
└── backend/                 # Express.js scraper server
    ├── index.js
    ├── scraper/
    │   └── vtopScraper.js
    └── routes/
        └── fetchData.js
```

---

## 🔐 Secure Credentials (Frontend)

Uses `expo-secure-store` to save and reuse VTOP login credentials. These are never sent or saved outside the device.

---

## 🧠 How It Works

1. User taps `Refresh`
2. Expo app sends credentials to backend
3. Backend logs into VTOP and scrapes data using cheerio or Jsoup
4. JSON is returned → app displays updated data
5. Data is saved locally for offline use

---

## 🛠️ Setup Instructions

### 🖥️ Backend

```bash
cd backend
npm install
node index.js
```

- Use `.env` to store backend secrets and configs
- Exposes `POST /api/fetch` endpoint for VTOP scraping

---

### 📱 Frontend (Expo)

```bash
cd frontend
npm install
npx expo start
```

- Install EAS CLI:
  ```bash
  npm install -g eas-cli
  eas login
  ```
- To build for iOS:
  ```bash
  eas build -p ios --profile preview
  ```

---

## ⚠️ Disclaimers

- This is an **unofficial** app. Use at your own risk.
- Login credentials are stored only on device; backend does **not store or log** any user data.
- Respect VTOP's usage policies.

---

## 🤝 Contributing

Feel free to fork and PR. Add scraping modules, calendar sync, notifications, or push updates.

---

## 📜 License

MIT © Atul + Contributors

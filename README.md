# CTOS - Coming to Our Senses
## 8-Week Mindfulness Meditation App

A full-stack mindfulness meditation app featuring 8 weeks of guided sessions, journaling, handy hacks, and iOS support.

---

## 🚀 **Features**

- **8 Weeks of Meditation Sessions** - Guided audio meditations with transcriptions
- **Handy Hacks** - Quick mindfulness practices you can do anywhere
- **Journaling** - Track your mindfulness journey
- **Progress Tracking** - Monitor your meditation practice
- **iOS Native App** - Fully functional iOS app via Capacitor
- **Week-based Color Themes** - Each week has its own visual identity

---

## 📋 **Prerequisites**

- Node.js 18+ 
- PostgreSQL database
- (For iOS) Xcode 14+ and CocoaPods

---

## 🛠️ **Setup**

### 1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/CTOS-mindfulness-app.git
cd CTOS-mindfulness-app
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ctos_db
SESSION_SECRET=your-random-secret-key-change-this
PORT=5000
NODE_ENV=development
```

### 4. **Setup database**
```bash
npm run db:push
```

### 5. **Run the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

---

## 📱 **iOS App Setup**

### 1. **Set API URL for iOS** (if deploying to a server)
```bash
export API_URL=https://your-server.com
```

### 2. **Build the frontend**
```bash
npm run build
```

### 3. **Sync to iOS**
```bash
npx cap sync ios
```

### 4. **Open in Xcode**
```bash
cd ios/App
pod install
open App.xcworkspace
```

### 5. **Run in Xcode**
- Select a simulator or device
- Press **Command + R** to build and run

---

## 🌐 **Deployment**

### **Deploy to any Node.js hosting**

This app can be deployed to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS
- Any VPS with Node.js support

**Steps:**
1. Set environment variables on your hosting platform
2. Run `npm run build`
3. Start with `node dist/index.js`

### **For iOS production:**
1. Deploy your backend to a server
2. Set `API_URL` environment variable to your server URL
3. Run `npm run build && npx cap sync ios`
4. Build and archive in Xcode for App Store submission

---

## 📂 **Project Structure**

```
ctos-mindfulness-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable components
│   │   └── lib/        # Utilities
├── server/              # Express backend
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data layer
│   └── db.ts           # Database connection
├── shared/              # Shared types
│   └── schema.ts       # Database schema
├── ios/                 # iOS app (Capacitor)
└── attached_assets/     # Meditation audio & images
```

---

## 🔧 **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Sync database schema
npx cap sync ios     # Sync web assets to iOS
```

---

## 🎨 **Week Color Themes**

- **Week 1** - Yellow/Orange
- **Week 2** - Blue/Indigo  
- **Week 3** - Purple/Pink
- **Week 4** - Red/Rose
- **Week 5** - Green/Emerald
- **Week 6** - Orange/Red
- **Week 7** - Cyan/Blue
- **Week 8** - Violet/Purple

---

## 📄 **License**

MIT License - feel free to use this for your own mindfulness projects!

---

## 🙏 **Acknowledgments**

Built with:
- React + TypeScript
- Express + Node.js
- PostgreSQL + Drizzle ORM
- Capacitor for iOS
- Tailwind CSS + shadcn/ui

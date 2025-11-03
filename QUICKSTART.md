# CTOS App - Quick Start Guide

Get your CTOS mindfulness app running in 5 minutes!

---

## 🚀 **Local Development (Web App)**

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/CTOS-mindfulness-app.git
cd CTOS-mindfulness-app
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env and add your DATABASE_URL and SESSION_SECRET

# 3. Initialize database
npm run db:push

# 4. Start the app
npm run dev
```

Open `http://localhost:5000` - you're ready! 🎉

---

## 📱 **iOS App (Quick)**

### **Prerequisites:**
- Mac with Xcode 14+
- Backend already deployed (see DEPLOYMENT.md)

### **Steps:**

```bash
# 1. Set your backend URL
export API_URL=https://your-backend-url.com

# 2. Build and sync
npm run build
npx cap sync ios

# 3. Open in Xcode
cd ios/App
pod install
open App.xcworkspace

# 4. In Xcode: Click Run ▶️
```

---

## 🔧 **Verify Everything Works**

### **Web App Checklist:**
- [ ] Home page loads with meditation sessions
- [ ] Can click on a week to expand sessions
- [ ] Audio player works
- [ ] Journal entries can be created
- [ ] Handy hacks display

### **iOS App Checklist:**
- [ ] App opens (not stuck on splash)
- [ ] CTOS emblem shows as app icon
- [ ] All meditation content loads
- [ ] Audio playback works
- [ ] No duplicate status bars
- [ ] Content doesn't overlap iOS status bar

---

## 🆘 **Common Issues**

### **Port 5000 already in use**
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9
# Then try npm run dev again
```

### **Database connection failed**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env
- Try: `npm run db:push` to initialize

### **iOS app stuck on splash screen**
- Make sure your backend is running
- Check the API_URL is correct
- Verify HTTPS is enabled (iOS requires secure connections)
- Check Xcode console for errors

### **Missing dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 **Next Steps**

1. **Customize content** - Edit meditation sessions in `server/storage.ts`
2. **Add your audio** - Replace files in `attached_assets/`
3. **Deploy to production** - See `DEPLOYMENT.md`
4. **Publish to App Store** - Follow `DEPLOYMENT.md` iOS section

---

## 💡 **Pro Tips**

- **Use environment variables** for different environments (dev, staging, prod)
- **Test on real iPhone** before App Store submission
- **Set up automatic backups** for your database
- **Enable error monitoring** (Sentry, LogRocket) in production

---

## 🔗 **Useful Commands**

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run db:push      # Update database schema
npx cap sync ios     # Sync changes to iOS
npx cap open ios     # Open Xcode directly
```

---

Need help? Check `README.md` for full documentation or `DEPLOYMENT.md` for production deployment guide!

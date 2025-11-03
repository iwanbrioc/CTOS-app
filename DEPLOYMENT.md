# CTOS App Deployment Guide

This guide covers deploying the CTOS mindfulness app to various platforms.

---

## 🌐 **Backend Deployment Options**

### **Option 1: Render (Recommended - Free Tier Available)**

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Environment:** Node
4. **Add Environment Variables:**
   ```
   DATABASE_URL=your-postgres-url
   SESSION_SECRET=random-secret-key-here
   NODE_ENV=production
   ```
5. **Add PostgreSQL database** (Free tier available)
6. **Deploy!** Your API URL will be `https://your-app.onrender.com`

---

### **Option 2: Railway**

1. **Create new project** on [Railway](https://railway.app)
2. **Connect GitHub repo**
3. **Add PostgreSQL database**
4. **Set environment variables:**
   ```
   DATABASE_URL=${DATABASE_URL}
   SESSION_SECRET=random-secret-key
   NODE_ENV=production
   ```
5. **Deploy automatically** on every git push

---

### **Option 3: Heroku**

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create ctos-mindfulness

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SESSION_SECRET=your-random-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run database migrations
heroku run npm run db:push
```

---

### **Option 4: DigitalOcean App Platform**

1. **Create new App** on DigitalOcean
2. **Connect GitHub repository**
3. **Add PostgreSQL database**
4. **Configure build:**
   - Build: `npm run build`
   - Run: `node dist/index.js`
5. **Set environment variables**
6. **Deploy**

---

### **Option 5: Self-Hosted VPS**

```bash
# On your server (Ubuntu example)
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Clone your repo
git clone https://github.com/YOUR_USERNAME/CTOS-mindfulness-app.git
cd CTOS-mindfulness-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with your values

# Build
npm run build

# Setup database
npm run db:push

# Run with PM2 (process manager)
sudo npm install -g pm2
pm2 start dist/index.js --name ctos-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ctos

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ctos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📱 **iOS App Deployment**

### **1. Update iOS Configuration**

After deploying your backend, update the iOS app to point to your production server:

```bash
# Set your production API URL
export API_URL=https://your-app.onrender.com

# Or add to .env file:
echo "API_URL=https://your-app.onrender.com" >> .env

# Rebuild and sync
npm run build
npx cap sync ios
```

### **2. Open in Xcode**

```bash
cd ios/App
pod install
open App.xcworkspace
```

### **3. Configure for Production**

In Xcode:
1. **Select your target** (CTOS)
2. **Signing & Capabilities:**
   - Select your Team
   - Update Bundle Identifier (e.g., `com.yourcompany.ctos`)
3. **Build Settings:**
   - Set `Release` configuration
4. **Info.plist:**
   - Update version and build number

### **4. Test on Device**

1. Connect your iPhone
2. Select your device in Xcode
3. Click **Run** (Command + R)
4. Test all features

### **5. Prepare for App Store**

1. **Create App Store Connect record**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Fill in metadata

2. **Archive the app:**
   - In Xcode: **Product** → **Archive**
   - Wait for archive to complete
   - Click **Distribute App**

3. **Upload to App Store:**
   - Select **App Store Connect**
   - Follow the wizard
   - Upload

4. **Submit for Review:**
   - Complete all App Store metadata
   - Add screenshots
   - Submit for review

---

## 🔄 **Continuous Deployment**

### **GitHub Actions (Example)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Render
      # Use render-deploy action or curl webhook
      run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 🗄️ **Database Migrations**

When you update your schema:

```bash
# Update schema.ts with your changes

# Push to database
npm run db:push

# Or force push if needed
npm run db:push --force
```

---

## 🔒 **Security Checklist**

- [ ] Use strong `SESSION_SECRET` (at least 32 random characters)
- [ ] Enable HTTPS/SSL on your domain
- [ ] Set `NODE_ENV=production`
- [ ] Don't commit `.env` file to GitHub
- [ ] Use environment variables for all secrets
- [ ] Enable database backups
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Use a secure PostgreSQL password
- [ ] Limit CORS origins in production

---

## 📊 **Monitoring & Maintenance**

### **Application Monitoring**

- Use PM2 for process management (self-hosted)
- Enable error tracking with Sentry
- Monitor uptime with UptimeRobot
- Track performance with New Relic or DataDog

### **Database Backups**

Most platforms provide automatic backups, but you can also:

```bash
# Manual PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 🆘 **Troubleshooting**

### **iOS App Won't Connect**

- Check `API_URL` in capacitor.config.ts
- Verify backend is running
- Check CORS settings in server
- Ensure HTTPS is enabled (iOS requires secure connections)

### **Database Connection Issues**

- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database allows external connections
- Check firewall rules

### **Build Failures**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Update dependencies: `npm update`

---

## 📚 **Additional Resources**

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [App Store Submission Guide](https://developer.apple.com/app-store/submissions/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

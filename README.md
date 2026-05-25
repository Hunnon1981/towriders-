# 🚗 Tow Riders - Backend API (Node.js + PostgreSQL)

**Official Business Contact Information:**
- **Email:** services@towriders.com ✅
- **Phone:** +1 925-546-9711 ✅

---

## 📦 What's Inside

This folder contains the **complete production-ready backend API** for Tow Riders:

- Node.js Express API server
- PostgreSQL database
- RESTful API endpoints for bookings, quotes, dispatch, partners, drivers
- Real-time WebSocket connections
- Stripe payment integration
- Twilio SMS notifications
- Email notifications (Resend)
- GPS tracking
- Authentication & authorization

---

## 🚀 Quick Deployment to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub
3. Create new project

### Step 2: Add PostgreSQL Database
1. In Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway will automatically create database and provide connection URL

### Step 3: Deploy Backend from GitHub

1. Create GitHub repository named `towriders-backend`
2. Open terminal in this folder (`towriders-backend`)
3. Run these commands:

```bash
git init
git add .
git commit -m "Tow Riders backend - production ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/towriders-backend.git
git push -u origin main
```

4. In Railway, click **+ New** → **GitHub Repo**
5. Select `towriders-backend`
6. Railway will auto-detect Node.js and deploy

### Step 4: Add Environment Variables

In Railway, go to your backend service → **Variables** tab and add these:

```bash
# Database (automatically provided by Railway)
DATABASE_URL=postgresql://...  # Railway provides this automatically

# Business Contact
BUSINESS_NAME=Tow Riders
BUSINESS_EMAIL=services@towriders.com
BUSINESS_PHONE=+19255469711
BUSINESS_PHONE_DISPLAY=+1 925-546-9711
BUSINESS_WEBSITE=https://towriders.com

# Server
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://towriders.com

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Email Service (Resend - REQUIRED)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=services@towriders.com
EMAIL_FROM_NAME=Tow Riders
EMAIL_REPLY_TO=services@towriders.com

# Stripe Payment (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Twilio SMS (REQUIRED for SMS notifications)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+19255469711

# Google Maps (REQUIRED for distance calculation)
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional Marketing Tracking
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_ADS_ID=AW-XXXXXXXXXX
META_PIXEL_ID=XXXXXXXXXXXXXXX
```

### Step 5: Get Your Backend URL
After deployment, Railway will provide your backend URL:
```
https://towriders-backend.up.railway.app
```

Copy this URL and use it in your frontend API calls.

---

## 🔧 Required Service Signups

### 1. Resend (Email Service) - REQUIRED
- **Signup:** https://resend.com/signup
- **Cost:** Free tier: 3,000 emails/month
- **Setup:**
  1. Sign up for account
  2. Verify your domain (towriders.com)
  3. Get API key from dashboard
  4. Add `RESEND_API_KEY` to Railway environment variables

### 2. Stripe (Payment Gateway) - REQUIRED
- **Signup:** https://dashboard.stripe.com/register
- **Cost:** 2.9% + $0.30 per transaction
- **Setup:**
  1. Sign up for account
  2. Activate your account
  3. Go to Developers → API keys
  4. Copy Secret key and Publishable key
  5. Add to Railway environment variables

### 3. Twilio (SMS Service) - REQUIRED
- **Signup:** https://www.twilio.com/try-twilio
- **Cost:** $1 per phone number/month + $0.0075 per SMS
- **Setup:**
  1. Sign up for account
  2. Get a phone number (+1 925-546-9711 if available)
  3. Get Account SID and Auth Token
  4. Add to Railway environment variables

### 4. Google Maps API - REQUIRED
- **Signup:** https://console.cloud.google.com/
- **Cost:** $0.005 per request (free $200/month credit)
- **Setup:**
  1. Create Google Cloud project
  2. Enable Maps JavaScript API and Distance Matrix API
  3. Create API key
  4. Add to Railway environment variables

---

## ✅ Pre-Deployment Checklist

- [ ] Created GitHub repository for backend
- [ ] Pushed backend code to GitHub
- [ ] Created Railway account
- [ ] Created PostgreSQL database in Railway
- [ ] Deployed backend from GitHub to Railway
- [ ] Added all environment variables in Railway
- [ ] Signed up for Resend (email service)
- [ ] Signed up for Stripe (payment gateway)
- [ ] Signed up for Twilio (SMS service)
- [ ] Created Google Maps API key
- [ ] Tested backend API endpoints
- [ ] Verified database connection
- [ ] Tested email notifications
- [ ] Tested SMS notifications
- [ ] Tested payment processing

---

## 🧪 Testing Your Backend

After deployment, test these endpoints:

### Health Check
```bash
curl https://your-backend-url.up.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Database Connection
```bash
curl https://your-backend-url.up.railway.app/api/test-db
# Should return database connection status
```

### Test Email (if Resend configured)
```bash
curl -X POST https://your-backend-url.up.railway.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"services@towriders.com"}'
```

---

## 📞 Backend Features

- ✅ RESTful API endpoints for all operations
- ✅ PostgreSQL database for data persistence
- ✅ User authentication (JWT tokens)
- ✅ Role-based access control (Admin, Dispatch, Partner, Driver)
- ✅ Real-time updates via WebSockets
- ✅ Stripe payment processing
- ✅ Twilio SMS notifications
- ✅ Email notifications via Resend
- ✅ GPS tracking for drivers
- ✅ Distance calculation via Google Maps API
- ✅ Audit logging for all actions
- ✅ CORS enabled for frontend access
- ✅ Rate limiting for API protection
- ✅ Error handling and logging

---

## 🔗 API Endpoints

All endpoints are relative to your Railway backend URL:

### Public Endpoints
- `POST /api/bookings` - Create new booking
- `POST /api/quotes` - Get instant quote
- `POST /api/contact` - Submit contact form
- `POST /api/partners/apply` - Partner application

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `PUT /api/admin/settings` - Update settings

### Dispatch Dashboard
- `GET /api/dispatch/bookings` - Active bookings
- `PUT /api/dispatch/assign/:id` - Assign driver
- `PUT /api/dispatch/status/:id` - Update status

### Partner Portal
- `GET /api/partners/dashboard` - Partner stats
- `GET /api/partners/bookings` - Partner's bookings
- `PUT /api/partners/profile` - Update profile

### Driver App
- `GET /api/drivers/bookings` - Assigned bookings
- `PUT /api/drivers/location` - Update GPS location
- `PUT /api/drivers/status/:id` - Update booking status

---

## 📞 Support

All backend notifications will use:
- **Email:** services@towriders.com
- **Phone:** +1 925-546-9711

---

## 🎯 Next Steps After Deployment

1. **Test all API endpoints** using Postman or curl
2. **Verify email notifications** are being sent
3. **Verify SMS notifications** are being sent
4. **Test payment processing** with Stripe test cards
5. **Connect frontend** to backend URL
6. **Monitor logs** in Railway dashboard
7. **Setup database backups** in Railway
8. **Monitor error tracking** (optional: setup Sentry)

---

**Status:** ✅ **PRODUCTION READY - DEPLOY TO RAILWAY NOW**

# 🚀 Deploy Smart Canteen to Render

## What you need
- A free [Render](https://render.com) account
- Your project pushed to GitHub (see Step 1 below)

---

## Step 1 — Push to GitHub

In your terminal, inside the `smart-canteen` folder:

```bash
git add .
git commit -m "upgraded UI with dark theme"
git push origin main
```

If you don't have a remote yet:
```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-canteen.git
git push -u origin main
```

---

## Step 2 — Deploy on Render

1. Go to [https://render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo (`smart-canteen`)
3. Fill in these settings:

| Field | Value |
|---|---|
| **Name** | smart-canteen |
| **Region** | Singapore (closest to India) |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free |

---

## Step 3 — Add Environment Variables

In Render dashboard → your service → **Environment** tab, add:

| Key | Value |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_ScxsW50Qr8KNYo` |
| `RAZORPAY_KEY_SECRET` | `XlTJAu3ACM5eqkaAeymbkQgF` |
| `NODE_ENV` | `production` |

> ⚠️ Never put your secret key in code or commit it to GitHub.

---

## Step 4 — Deploy!

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run `npm install`
3. Start your server

Your app will be live at: `https://smart-canteen.onrender.com`

---

## Your App URLs

| Page | URL |
|---|---|
| Customer Menu | `/` |
| Kitchen Dashboard | `/kitchen` |
| Admin Dashboard | `/admin` |
| Ready Orders Display | `/display` |

---

## ⚠️ Important Notes

### Free Plan Limitation
Render free tier **spins down after 15 minutes** of inactivity. The first request after inactivity takes ~30 seconds to wake up. To avoid this, upgrade to a paid plan (starts at $7/month).

### Data Resets
The in-memory store (`models/db.js`) **resets every time the server restarts**. For persistent data, connect MongoDB Atlas (free tier available):

1. Create a free cluster at [https://mongodb.com/atlas](https://mongodb.com/atlas)
2. Add `MONGODB_URI` to your environment variables
3. Update `models/db.js` to use Mongoose

### Going Live with Real Payments
When ready for real money, replace the test Razorpay keys with **live keys** from your Razorpay dashboard.

---

## Alternative: Railway (also free)

1. Go to [https://railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add environment variables
4. Done — Railway auto-detects Node.js

Railway is better for persistent deployments (no spin-down).

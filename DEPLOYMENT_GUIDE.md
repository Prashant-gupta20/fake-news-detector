# 🚀 Live Deployment Guide - TruthLens Fake News Detector

This guide explains how to deploy your **TruthLens Fake News Detector** application to the cloud for free, so you can share a live working URL (`https://your-app.onrender.com`) with your college professors, project evaluators, and friends.

---

## 🌟 Method 1: Deploy on Render.com (Recommended - 100% Free)

Render provides free hosting for Python web services and automatically handles SSL (HTTPS).

### Step 1: Push your code to GitHub

1. Open your terminal / PowerShell in the project directory:
   ```bash
   cd "C:\Users\Prashant Gupta\.gemini\antigravity-ide\scratch\fake-news-detector"
   ```

2. Initialize Git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of TruthLens Fake News Detector"
   ```

3. Create a **New Repository** on [GitHub.com](https://github.com) named `fake-news-detector` (Public or Private).

4. Link and push your local repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/fake-news-detector.git
   git push -u origin main
   ```

---

### Step 2: Deploy on Render

1. Visit [Render.com](https://render.com) and click **Sign Up** (or Log in with GitHub).
2. On your Render Dashboard, click the **New +** button in the top right and select **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select your `fake-news-detector` repository from the list (grant Render access to your GitHub repo if prompted).
5. Fill in the following settings:
   - **Name:** `truthlens-fake-news` (or any custom name)
   - **Region:** Choose the closest region (e.g., *Singapore*, *Frankfurt*, or *Ohio*)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python backend/model_trainer.py
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free` ($0/month)

6. *(Optional)* If you want live Gemini AI explanations:
   - Scroll down to **Environment Variables**
   - Click **Add Environment Variable**
   - Key: `GEMINI_API_KEY`
   - Value: *(your Google Gemini API key)*

7. Click **Deploy Web Service** at the bottom of the page.

### Step 3: Access your Live App!
Render will now build your application, train the ML model, and launch the server.
In about 2 to 3 minutes, you will receive your live URL:
👉 `https://truthlens-fake-news.onrender.com`

---

## ⚡ Method 2: Deploy on Railway (Alternative)

1. Sign in to [Railway.app](https://railway.app) using GitHub.
2. Click **New Project** ➜ **Deploy from GitHub repo**.
3. Select `fake-news-detector`.
4. Railway will automatically detect the `Procfile` and deploy your app.
5. In your project settings, click **Generate Domain** to get your public HTTPS URL.

---

## 🧪 Testing Your Deployed Application

Once deployed:
1. Open your live URL in any desktop or mobile browser.
2. Click on the 1-Click test preset chips:
   - **Real:** *NASA Webb Discovery* or *WHO Flu Guidelines*
   - **Fake:** *Miracle Himalayan Cure* or *5G Mind Frequencies*
3. Verify the circular Credibility Gauge and Linguistic Breakdown.
4. Open `/docs` on your live domain (e.g. `https://truthlens-fake-news.onrender.com/docs`) to showcase the interactive Swagger API documentation to your evaluator!

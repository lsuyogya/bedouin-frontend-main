# Bedouin AI Bot - Frontend

This package contains the frontend files for the "Conversations with a Bedouin" AI bot based on the film "Bedouins of the Wind".

## Deployment Instructions for Vercel

### Step 1: Prepare the Files
1. Make sure you have all the files in this package:
   - index.html
   - styles.css
   - app.js
   - (and any other assets)

2. Important: Before deploying, update the `app.js` file to point to your backend URL:
   - Open `app.js` in any text editor
   - Find this line near the top: `const BACKEND_URL = 'https://3000-i9n3vq555wdidqvs56dmr-aaf2da22.manus.computer';`
   - Change it to your backend URL (after you deploy the backend): `const BACKEND_URL = 'https://your-backend-url.vercel.app';`

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com/) and sign up with your email
2. Click "Add New" → "Project" → "Upload"
3. Upload all the files from this package
4. Name your project (e.g., "bedouin-bot-frontend")
5. Click "Deploy"
6. Vercel will provide you with a URL like `bedouin-bot-frontend.vercel.app`

### Step 3: Verify Deployment
1. Visit your new URL to make sure the frontend is working
2. You should see the "Conversations with a Bedouin" interface
3. Note that the conversation functionality will only work after you've:
   - Deployed the backend
   - Updated the BACKEND_URL in app.js
   - Redeployed the frontend

## Troubleshooting
- If you see the interface but get an error when trying to chat, check that your backend URL is correct
- If the page doesn't load at all, try redeploying
- For any issues, check the Vercel deployment logs in your project dashboard

## Features
- Desert-themed interface for conversations with a Bedouin AI
- Multiple AI model options (OpenAI, Google)
- Themed conversation topics (Camels & Racing, Traditions, Modern Life, Desert Wisdom)
- Responsive design for both desktop and mobile devices

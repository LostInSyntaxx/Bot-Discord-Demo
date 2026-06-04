# 🔧 Discord OAuth2 Setup Guide

##  Error You're Getting

```
{"message": "Invalid Form Body", "code": 50035, "errors": {"client_id": {"_errors": [{"code": "NUMBER_TYPE_COERCE", "message": "Value \"\" is not snowflake."}]}}}
```

This error means **`DISCORD_CLIENT_ID` is empty** in your `.env.local` file.

---

## ✅ How to Fix

### Step 1: Get Your Discord Application Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click on your application (or create a new one)
3. Go to **General Information** (left sidebar)
4. Copy the **APPLICATION ID** - this is your `DISCORD_CLIENT_ID`

### Step 2: Get Client Secret

1. Still in Discord Developer Portal
2. Go to **OAuth2** section (left sidebar)
3. You'll see **Client Secret**
4. Click **Reset Secret** (if you haven't set it yet)
5. Copy the secret - this is your `DISCORD_CLIENT_SECRET`

### Step 3: Add Redirect URL

1. In the **OAuth2** section
2. Find **Redirects** section
3. Click **Add Redirect**
4. Enter: `http://localhost:3001/api/auth/callback`
5. Click **Save Changes**

### Step 4: Update .env.local

Open `dashboard/.env.local` and fill in your credentials:

```env
# Discord OAuth2
DISCORD_CLIENT_ID=1234567890123456789  ← Replace with your Application ID
DISCORD_CLIENT_SECRET=your_secret_here  ← Replace with your Client Secret
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## 📝 Example .env.local

```env
# Discord OAuth2
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456
DISCORD_REDIRECT_URI=http://localhost:3001/api/auth/callback

# JWT
JWT_SECRET=Th1s1s4Sup3rS3cr3tK3yF0rJWT70k3ns!

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## 🔍 How to Find Your Credentials

### Finding Application ID (Client ID)

1. Go to: https://discord.com/developers/applications
2. Click your application
3. Look at the top of the page:

```
Application ID
1234567890123456789  ← This is your CLIENT_ID
```

### Finding Client Secret

1. Go to: https://discord.com/developers/applications
2. Click your application
3. Click **OAuth2** in left sidebar
4. You'll see:

```
Client ID
1234567890123456789

Client Secret
••••••••••••••••  ← Click "Reset Secret" to reveal
```

---

## ✅ Verification Checklist

Before running, make sure:

- [ ] `DISCORD_CLIENT_ID` is filled in `.env.local`
- [ ] `DISCORD_CLIENT_SECRET` is filled in `.env.local`
- [ ] Redirect URL is added in Discord Developer Portal
- [ ] Redirect URL matches: `http://localhost:3001/api/auth/callback`
- [ ] `JWT_SECRET` is at least 32 characters long

---

## 🚀 Testing

### 1. Restart the Dashboard Server

After updating `.env.local`, restart the server:

```bash
# Stop the current server (Ctrl+C)
# Then start again:
cd dashboard
npm run dev:all
```

### 2. Check Terminal Output

You should see:

```
✅ API Server running on port 3001
```

### 3. Try Login

1. Go to: http://localhost:3000
2. Click "Login with Discord"
3. You should be redirected to Discord login page

### 4. Check Terminal Logs

When you click login, you should see:

```
🔗 Redirecting to Discord OAuth2...
🔄 Exchanging code for token...
✅ Token received successfully
👤 User authenticated: YourName#1234
 User has access to 5 guilds
 JWT token created, redirecting to dashboard...
```

---

## 🐛 Common Issues

### Issue 1: Still getting "client_id is empty"

**Solution:**
1. Check that `.env.local` file exists in `dashboard/` folder
2. Make sure there are no spaces around `=` in `.env.local`
3. Restart the server after changing `.env.local`

```env
❌ WRONG
DISCORD_CLIENT_ID = 123456789
DISCORD_CLIENT_ID= 123456789
DISCORD_CLIENT_ID =123456789

✅ CORRECT
DISCORD_CLIENT_ID=123456789
```

### Issue 2: "Invalid redirect_uri"

**Solution:**
1. Go to Discord Developer Portal
2. OAuth2 section
3. Make sure redirect URL is exactly: `http://localhost:3001/api/auth/callback`
4. No trailing slash, no extra spaces

### Issue 3: "Unknown authorization code"

**Solution:**
1. The code expires after 10 minutes
2. Try logging in again
3. Don't reuse old URLs

### Issue 4: "Invalid client_secret"

**Solution:**
1. Make sure `DISCORD_CLIENT_SECRET` is correct
2. Try resetting the secret in Discord Developer Portal
3. Update `.env.local` with new secret
4. Restart server

---

## 📋 Quick Setup Summary

1. **Get Application ID** → Discord Developer Portal → General Information
2. **Get Client Secret** → Discord Developer Portal → OAuth2
3. **Add Redirect URL** → `http://localhost:3001/api/auth/callback`
4. **Update .env.local** → Fill in `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET`
5. **Restart server** → `npm run dev:all`
6. **Test login** → http://localhost:3000

---

## 🎯 Still Having Issues?

Check the server logs when you click "Login with Discord":

```bash

```

Then you know the environment variable is not loaded.

---

## ✅ Success Indicators

When everything is working, you'll see:

**In Browser:**
- Redirected to Discord login
- After login, redirected to dashboard
- Dashboard shows your username

**In Terminal:**
```
🔗 Redirecting to Discord OAuth2...
 Exchanging code for token...
✅ Token received successfully
👤 User authenticated: YourName#1234
📊 User has access to 5 guilds
🔑 JWT token created, redirecting to dashboard...
```

---

 **That's it! Your OAuth2 should work now!** 🚀

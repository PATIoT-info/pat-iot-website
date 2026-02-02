# Fix: "src refspec main does not match any" Error

This error means you haven't made any commits yet. Follow these steps:

## Step-by-Step Fix

### 1. Check Current Status
```powershell
cd d:\PAT_IOT\whitelion
git status
```

### 2. Add All Files
```powershell
git add .
```

### 3. Configure Git User (if not already done)
```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 4. Make Your First Commit
```powershell
git commit -m "first commit"
```

### 5. Create/Rename Branch to Main
```powershell
git branch -M main
```

### 6. Add Remote (if not already added)
```powershell
git remote add origin https://github.com/PATIoT-info/pat-iot-website.git
```

Or if remote already exists:
```powershell
git remote set-url origin https://github.com/PATIoT-info/pat-iot-website.git
```

### 7. Push to GitHub
```powershell
git push -u origin main
```

## Complete Command Sequence

Copy and paste all of these at once:

```powershell
cd d:\PAT_IOT\whitelion
git add .
git config user.name "PAT IoT Solutions"
git config user.email "marketing@patiot.in"
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/PATIoT-info/pat-iot-website.git
git push -u origin main
```

## If You Get Authentication Error

GitHub requires a Personal Access Token instead of password:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "PAT IoT Website"
4. Select scope: `repo` (full control)
5. Click "Generate token"
6. Copy the token
7. When prompted for password, paste the token

## After Successful Push

Enable GitHub Pages:
1. Go to: https://github.com/PATIoT-info/pat-iot-website/settings/pages
2. Source: Deploy from a branch
3. Branch: `main`, Folder: `/ (root)`
4. Click Save

Your site will be live at: `https://patiot-info.github.io/pat-iot-website/`

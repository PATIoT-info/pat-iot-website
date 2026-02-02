@echo off
echo ========================================
echo Complete Git Setup for PAT IoT Website
echo ========================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all files...
git add .
if errorlevel 1 (
    echo Error: Failed to add files.
    pause
    exit /b 1
)
echo Files added successfully!
echo.

echo Step 3: Checking if there are changes to commit...
git status --short
if errorlevel 1 (
    echo No changes detected.
) else (
    echo Changes detected, proceeding with commit...
)

echo.
echo Step 4: Making first commit...
git commit -m "first commit"
if errorlevel 1 (
    echo.
    echo Error: Commit failed. Possible reasons:
    echo 1. No changes to commit
    echo 2. Git user not configured
    echo.
    echo Configuring git user (if needed)...
    git config user.name "PAT IoT Solutions" 2>nul
    git config user.email "marketing@patiot.in" 2>nul
    echo.
    echo Trying commit again...
    git commit -m "first commit"
    if errorlevel 1 (
        echo Still failed. Please check git status manually.
        pause
        exit /b 1
    )
)
echo Commit successful!
echo.

echo Step 5: Setting branch to main...
git branch -M main
echo.

echo Step 6: Checking remote...
git remote -v
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin https://github.com/PATIoT-info/pat-iot-website.git
) else (
    echo Remote already exists. Updating URL...
    git remote set-url origin https://github.com/PATIoT-info/pat-iot-website.git
)
echo.

echo Step 7: Pushing to GitHub...
echo You may be prompted for GitHub credentials.
echo Use your GitHub username and Personal Access Token as password.
echo.
git push -u origin main
if errorlevel 1 (
    echo.
    echo Error: Push failed. Common issues:
    echo 1. Authentication - use Personal Access Token
    echo 2. Repository doesn't exist on GitHub
    echo 3. Network issues
    echo.
    echo Check the error message above for details.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub!
echo ========================================
echo.
echo Next: Enable GitHub Pages
echo 1. Go to: https://github.com/PATIoT-info/pat-iot-website/settings/pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main, Folder: / (root)
echo 4. Click Save
echo.
echo Your website will be live at:
echo https://patiot-info.github.io/pat-iot-website/
echo.
pause

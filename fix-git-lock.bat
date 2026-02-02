@echo off
echo ========================================
echo Fixing Git Lock File Issue
echo ========================================
echo.

echo Checking for lock files...
if exist .git\config.lock (
    echo Found config.lock - removing...
    del /f /q .git\config.lock
    echo Lock file removed!
) else (
    echo No config.lock file found.
)

if exist .git\index.lock (
    echo Found index.lock - removing...
    del /f /q .git\index.lock
    echo Lock file removed!
)

echo.
echo Attempting to initialize git...
git init

if errorlevel 1 (
    echo.
    echo Still having issues? Try removing .git folder completely:
    echo rmdir /s /q .git
    echo git init
    pause
) else (
    echo.
    echo Success! Git initialized.
    echo You can now run: git add .
    pause
)

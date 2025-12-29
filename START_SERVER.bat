@echo off
REM IT Management System - Startup Script for Windows

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   IT Management System - Server Startup                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env configuration...
    (
        echo PORT=4000
        echo NODE_ENV=development
        echo DB_HOST=127.0.0.1
        echo DB_PORT=3306
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=it_management_system
        echo CORS_ORIGIN=*
        echo ADMIN_SECRET=admin123
    ) > .env
    echo .env file created!
    echo.
)

REM Display important information
echo ╔════════════════════════════════════════════════════════════╗
echo ║   PRE-STARTUP CHECKLIST                                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║ 1. XAMPP MySQL must be running (green in Control Panel)   ║
echo ║ 2. Database setup: Run database-setup.sql in phpMyAdmin   ║
echo ║ 3. Database name should be: it_management_system          ║
echo ║ 4. Configuration will use port: 4000                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Starting IT Management System Server...
echo.
echo Server will be available at: http://localhost:4000
echo API endpoints available at:   http://localhost:4000/api
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm run start

if errorlevel 1 (
    echo.
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║   ERROR: Server Failed to Start                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo Please check:
    echo 1. Is XAMPP MySQL running? (Start it from XAMPP Control Panel^)
    echo 2. Is database 'it_management_system' created? (Run SQL in phpMyAdmin^)
    echo 3. Check .env file configuration
    echo 4. Check that port 4000 is not in use
    echo.
    pause
    exit /b 1
)

pause

echo Step 1: Start XAMPP MySQL
echo ──────────────────────────
echo   Option A - GUI (Recommended):
echo     1. Open XAMPP Control Panel
echo     2. Click "Start" next to "MySQL"
echo     3. Wait for it to turn GREEN
echo.
echo   Option B - Command Line:
echo     net start MySQL80
echo     (or MySQL57, MySQL56 depending on your version)
echo.

timeout /t 2 >nul

echo Step 2: Verify MySQL is Running
echo ────────────────────────────────
netstat -ano | findstr :3306
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL is running on port 3306
) else (
    echo ✗ MySQL is NOT running on port 3306
    echo   Please start MySQL in XAMPP Control Panel first
    pause
    exit /b 1
)

echo.
echo Step 3: Start Backend Server
echo ─────────────────────────────
echo npm start
echo.

pause

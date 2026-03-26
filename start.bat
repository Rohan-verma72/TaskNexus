@echo off
echo ==============================================
echo  Starting Antigravity Task Management App
echo ==============================================

echo [1/2] Starting ASP.NET Core Backend (Port 5129)...
start cmd /k "cd TaskBackend && title TaskBackend && dotnet run"

echo [2/2] Starting Next.js React Frontend (Port 3000)...
start cmd /k "cd frontend && title Task Web (React) && npm run dev"

echo.
echo Both servers have been started in separate windows!
echo Backend API is at:  http://localhost:5129/api/
echo React Next.js App is at: http://localhost:3000/
echo.
pause

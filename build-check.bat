@echo off
echo Verificando compilacion de Next.js...
node_modules\.bin\next build
echo.
echo Build completado con codigo de salida: %ERRORLEVEL%
pause

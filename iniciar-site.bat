@echo off
setlocal
cd /d "%~dp0"
echo ===============================================
echo    INCLUSAO 360 - EXPERIENCE LAB 4.0 - SIMPLES
echo ===============================================
echo.
echo Abra no navegador: http://localhost:8080
echo Para encerrar o servidor: Ctrl+C
echo.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -m http.server 8080
) else (
  python -m http.server 8080
)
echo.
echo O servidor foi encerrado ou nao foi possivel iniciar.
pause

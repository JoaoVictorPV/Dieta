@echo off
echo ==========================================
echo   Iniciando o Rastreador de Exercicios
echo ==========================================

:: Inicia o servidor em uma nova janela
start "Servidor Vite" cmd /k "npm run dev"

:: Aguarda 5 segundos para o servidor subir
echo Aguardando o servidor iniciar...
timeout /t 5 >nul

:: Tenta abrir no Chrome
start chrome http://localhost:5173

:: Se o comando acima falhar (chrome não encontrado), abre no navegador padrão
if %errorlevel% neq 0 (
    start http://localhost:5173
)

echo.
echo O programa esta rodando!
echo Mantenha a janela do servidor aberta.
echo.
pause

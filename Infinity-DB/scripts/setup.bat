@echo off
rem Script de configuração para Windows
rem Execute: setup.bat

echo 🚀 Configurando Sistema de Backup Automático NaRégua
echo ==================================================

rem Verificar se está no diretório correto
if not exist "config.js" (
    echo ❌ Execute este script dentro da pasta backup-system
    pause
    exit /b 1
)

rem Verificar Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node -v

rem Verificar se .env existe
if not exist "../.env" (
    echo ❌ Arquivo .env não encontrado no diretório pai
    pause
    exit /b 1
)

rem Verificar se DATABASE_URL_BACKUP está configurado
findstr /C:"DATABASE_URL_BACKUP" "../.env" >nul
if %errorlevel% neq 0 (
    echo ⚠️ DATABASE_URL_BACKUP não encontrado no .env
    echo 📋 Adicione a linha abaixo no seu .env:
    echo DATABASE_URL_BACKUP='postgresql://usuario:senha@host/database'
    echo.
    pause
)

rem Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

rem Executar testes
echo.
echo 🧪 Executando testes do sistema...
node test.js

echo.
echo 🔧 Deseja inicializar o banco secundário agora? (s/n)
set /p response=

if /i "%response%"=="s" (
    echo 🔧 Inicializando banco secundário...
    node initialize.js
)

echo.
echo ✅ Configuração concluída!
echo.
echo 📋 Próximos passos:
echo 1. Para testar: node test.js
echo 2. Para executar standalone: node standalone.js
echo 3. Para monitorar: npm run status
echo 4. Sua aplicação principal agora usa backup automático!
echo.
echo 🔍 Arquivos de monitoramento:
echo - Logs: backup-system.log
echo - Uso primário: usage-primary.json
echo - Uso secundário: usage-secondary.json
echo.
echo 💡 O sistema alternará automaticamente quando um banco atingir 90%% do limite mensal
echo.
pause

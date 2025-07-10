#!/bin/bash

# Script de configuração rápida do sistema de backup
# Execute: chmod +x setup.sh && ./setup.sh

echo "🚀 Configurando Sistema de Backup Automático NaRégua"
echo "=================================================="

# Verificar se está no diretório correto
if [ ! -f "config.js" ]; then
    echo "❌ Execute este script dentro da pasta backup-system"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"

# Verificar se .env existe
if [ ! -f "../.env" ]; then
    echo "❌ Arquivo .env não encontrado no diretório pai"
    exit 1
fi

# Verificar se DATABASE_URL_BACKUP está configurado
if ! grep -q "DATABASE_URL_BACKUP" "../.env"; then
    echo "⚠️ DATABASE_URL_BACKUP não encontrado no .env"
    echo "📋 Adicione a linha abaixo no seu .env:"
    echo "DATABASE_URL_BACKUP='postgresql://usuario:senha@host/database'"
    echo ""
    read -p "Pressione Enter após configurar o .env..."
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Executar testes
echo ""
echo "🧪 Executando testes do sistema..."
node test.js

echo ""
echo "🔧 Deseja inicializar o banco secundário agora? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "🔧 Inicializando banco secundário..."
    node initialize.js
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Para testar: node test.js"
echo "2. Para executar standalone: node standalone.js"
echo "3. Para monitorar: npm run status"
echo "4. Sua aplicação principal agora usa backup automático!"
echo ""
echo "🔍 Arquivos de monitoramento:"
echo "- Logs: backup-system.log"
echo "- Uso primário: usage-primary.json" 
echo "- Uso secundário: usage-secondary.json"
echo ""
echo "💡 O sistema alternará automaticamente quando um banco atingir 90% do limite mensal"

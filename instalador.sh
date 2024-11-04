#!/bin/bash

# Instalar git si no está instalado
apt -y install git

# Verificar si el directorio del repositorio ya existe
if [ -d "cryptography-final-project-2025" ]; then
    echo "El directorio 'cryptography-final-project-2025' ya existe. Borrando directorio..."
    rm -rf cryptography-final-project-2025
fi

# Clonar el repositorio
git clone https://github.com/aldonavarretefp/cryptography-final-project-2025
cd cryptography-final-project-2025/

# Instalar curl si no está instalado
apt -y install curl

# Instalar NVM y Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 22.8.0

# Detener cualquier proceso en el puerto 3001
if lsof -i:3001 -t >/dev/null; then
    echo "Deteniendo proceso en puerto 3001..."
    kill -9 $(lsof -i:3001 -t)
fi

# Iniciar backend en segundo plano usando nohup
cd backend/
npm install
echo "A punto de iniciar backend"
nohup npm start > ../backend.log 2>&1 &

# Esperar unos segundos para asegurarse de que el backend se inicie
sleep 5

# Iniciar frontend en segundo plano usando nohup
cd ../frontend/
npm install
echo "A punto de iniciar frontend"
nohup npm run dev > ../frontend.log 2>&1 &

# Mensaje final
echo "Backend y frontend iniciados en segundo plano. Revisa backend.log y frontend.log para más detalles."


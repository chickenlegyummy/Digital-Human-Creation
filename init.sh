# This script is intended to set up the environment for the application

echo "Starting initialization script..."
echo "開始初始化脚本..."

echo "==================================================="
echo ""
echo "1. Installing dependencies..."
echo "1. 正在安装依賴..."
npm install
echo "Successfully installed dependencies."
echo "成功安装依賴。"
echo ""
echo "==================================================="
echo "2. Setting up environment variables..."
echo "2. 正在設置環境變量..."
touch .env
echo "Environment variables file created."
echo "環境變量文件已創建。"
echo ""
echo "==================================================="
echo ""
echo "3. Writing environment variables..."
echo "3. 正在寫入環境變量..."
echo ""
echo "DeepSeek_R1=your-deepseek-r1-api-key" > .env
echo "DS_V3=your-deepseek-v3-api-key" >> .env
echo "" >> .env
echo "# JWT Secret for authentication" >> .env
echo "JWT_SECRET=digital-human-studio-super-secret-jwt-key-change-in-production-2024" >> .env
echo "" >> .env
echo "# Server Configuration" >> .env
echo "PORT=3001" >> .env
echo "CLIENT_URL=http://localhost:3000" >> .env
echo "" >> .env
echo "# Database Configuration (SQLite file path will be auto-created)" >> .env
echo "DATABASE_PATH=./database/digital_humans.db" >> .env
echo ""
echo "Environment variables written to .env file."
echo "環境變量已寫入 .env 文件。"
echo ""
echo "==================================================="
echo "Initialization complete."
echo "初始化完成。"
echo "You can now initial the application and database using 'npm run dev'."
echo "您現在可以使用 'npm run dev' 初始化應用程序和數據庫。"
echo "==================================================="
echo "Thank you for using our setup script!"
echo "感謝您使用我們的設置腳本！"
echo "Exiting initialization script..."
echo "退出初始化脚本..."
echo "==================================================="
echo ""



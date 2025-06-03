# Create project directory
mkdir celebrity-connect
cd celebrity-connect

# Initialize backend
mkdir backend
cd backend
npm init -y
npm install express pg pg-hstore sequelize dotenv bcrypt passport passport-local express-session cors

# Initialize frontend
cd ..
npx create-react-app frontend
cd frontend
npm install axios tailwindcss postcss autoprefixer react-router-dom
npx tailwindcss init -p
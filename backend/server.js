require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Kết nối MongoDB rồi mới khởi động server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

startServer();


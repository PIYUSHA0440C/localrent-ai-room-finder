import app from './src/app.js';
import connectDB from './src/config/db.js';
import config from './src/config/env.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(config.port, () => {
      console.log(`\n🏠 LocalRent API Server`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   URL: http://localhost:${config.port}`);
      console.log(`   Health: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

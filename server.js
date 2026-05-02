require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { connectRabbitMQ } = require("./broker/rabbit");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
  
    await connectDB();
    console.log("MongoDB Connected");

    
    await connectRabbitMQ();
    console.log("RabbitMQ Connected");

   
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
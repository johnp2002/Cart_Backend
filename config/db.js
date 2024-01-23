const mongoose = require('mongoose');

// Replace the following values with your MongoDB Atlas connection string and database name
const atlasConnectionString = 'mongodb+srv://webGallery:aW8y25TcqeI4B6Ao@cluster0.fz5g5rb.mongodb.net/';


// Configure mongoose to use the global promise library
mongoose.Promise = global.Promise;

// Create a connection to MongoDB Atlas
mongoose.connect(atlasConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Get the default connection
const db = mongoose.connection;

// Event handling for successful connection
db.once('open', () => {
  console.log(`Connected to MongoDB Atlas: ${atlasConnectionString}`);
});

// Event handling for connection errors
db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(1); // Exit the application on connection error
});

// Define a function to get the Mongoose database instance
const getDatabaseInstance = () => {
  return mongoose.connection.db;
};

// Export the function to get the Mongoose database instance
module.exports = { getDatabaseInstance };

const mongoose = require('mongoose');

async function dbConnection() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database Connected')
    } catch (error) {
        console.log('Error in database connection: ', error.message);
        process.exit(1);
    }
}

module.exports = dbConnection;
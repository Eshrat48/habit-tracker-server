// index.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

const getHabitController = require('./controllers/habitController');
const habitRoutes = require('./routes/habitRoutes');
const verifyToken = require('./middleware/verifyToken');

const getUserController = require('./controllers/userController');
const userRoutes = require('./routes/userRoutes');

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

const uri = "mongodb+srv://habitTrackerUser:tSi1QuLmXNQpfDtg@clusterhabittracker.seeef5c.mongodb.net/habitTracker?retryWrites=true&w=majority&appName=ClusterHabitTracker";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Habit Tracker Server is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

// Retry logic for MongoDB connection
let dbConnected = false;
let mongoDb = null;

async function connectToMongoDB(retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔄 Attempting MongoDB connection (attempt ${i + 1}/${retries})...`);
            await client.connect();
            console.log('✅ MongoDB connected successfully');
            dbConnected = true;
            return true;
        } catch (error) {
            console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s, 16s
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return false;
}

async function run() {
    try {
        // Try to connect with retry logic
        const connected = await connectToMongoDB(3); // Try 3 times
        
        if (!connected) {
            throw new Error('Failed to connect to MongoDB after 3 attempts');
        }

        const db = client.db("habitTracker");
        mongoDb = db;
        
        const usersCollection = db.collection("users");
        const userController = getUserController(usersCollection);
        userRoutes.post('/register-success', userController.createUserInDB);
        app.use('/api/v1/users', userRoutes);

        const habitsCollection = db.collection("habits");
        const habitController = getHabitController(habitsCollection);

        habitRoutes.get('/featured', habitController.getFeaturedHabits);
        habitRoutes.get('/public', habitController.getPublicHabits);
        habitRoutes.post('/', verifyToken, habitController.createHabit);
        habitRoutes.get('/my', verifyToken, habitController.getMyHabits);
        habitRoutes.patch('/:id/complete', verifyToken, habitController.completeHabit);
        habitRoutes.get('/:id', verifyToken, habitController.getHabitDetail);
        habitRoutes.patch('/:id', verifyToken, habitController.updateHabit);
        habitRoutes.delete('/:id', verifyToken, habitController.deleteHabit);

        app.use('/api/v1/habits', habitRoutes);
        
        await client.db("admin").command({ ping: 1 });
        console.log("✅ MongoDB connection verified!");
        
        app.listen(port, () => {
            console.log(`🚀 Server is running on port: ${port}`);
        });
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        app.listen(port, () => {
            console.log(`⚠️ Server started on port ${port} (MongoDB connection failed)`);
        });
    }
}

run().catch(console.error);

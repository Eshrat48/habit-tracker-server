// index.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Imports for Routing and Security (EXISTING)
const getHabitController = require('./controllers/habitController');
const habitRoutes = require('./routes/habitRoutes');
const verifyToken = require('./middleware/verifyToken'); 

// 👇 NEW IMPORTS FOR USER AUTH
const getUserController = require('./controllers/userController'); 
const userRoutes = require('./routes/userRoutes'); 
// 👆 NEW IMPORTS FOR USER AUTH

// --- Middlewares ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], 
    credentials: true,
}));
app.use(express.json());

// uri connection (using hardcoded URI)
const uri = "mongodb+srv://habitTrackerUser:tSi1QuLmXNQpfDtg@clusterhabittracker.seeef5c.mongodb.net/habitTracker?retryWrites=true&w=majority&appName=ClusterHabitTracker";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Habit Tracker Server is running');
})

async function run() {
    try {
        await client.connect()
        // Database and Collection Initialization
        const db = client.db("habitTracker"); 
        
        // ========================================================
        // 👇 NEW USER SETUP
        // ========================================================
        const usersCollection = db.collection("users"); 
        const userController = getUserController(usersCollection); 

        // Define the route to save user data after successful Firebase auth
        userRoutes.post('/register-success', userController.createUserInDB); 
        
        // Attach the user router middleware
        app.use('/api/v1/users', userRoutes); 
        // ========================================================


        // EXISTING HABIT SETUP
        const habitsCollection = db.collection("habits");

        // Instantiate the controller factory, passing the collection dependency
        const habitController = getHabitController(habitsCollection);

        // ----------------------------------------------------
        // Define API Routes (EXISTING)
        // ----------------------------------------------------
        
        // PUBLIC ROUTES 
        habitRoutes.get('/featured', habitController.getFeaturedHabits);
        habitRoutes.get('/public', habitController.getPublicHabits); 

        // PRIVATE ROUTES 
        habitRoutes.post('/', verifyToken, habitController.createHabit);
        habitRoutes.get('/my', verifyToken, habitController.getMyHabits);

        // Habit Detail, Update, Delete
        habitRoutes.route('/:id')
            .get(verifyToken, habitController.getHabitDetail)
            .patch(verifyToken, habitController.updateHabit)
            .delete(verifyToken, habitController.deleteHabit);

        // Complete Habit Action
        habitRoutes.patch('/:id/complete', 
            verifyToken, 
            habitController.completeHabit
        );

        // Attach the habit router middleware to the Express app
        app.use('/api/v1/habits', habitRoutes);

        await client.db("admin").command({ ping: 1 })
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // Keeps the database connection open for the server life cycle
    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
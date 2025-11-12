// index.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Imports for Routing and Security
const getHabitController = require('./controllers/habitController');
const habitRoutes = require('./routes/habitRoutes');
const verifyToken = require('./middleware/verifyToken'); 

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
        const habitsCollection = db.collection("habits");

        // Instantiate the controller factory, passing the collection dependency
        const habitController = getHabitController(habitsCollection);

        // ----------------------------------------------------
        // Define API Routes
        // ----------------------------------------------------
        
        // PUBLIC ROUTES (No verifyToken middleware)
        habitRoutes.get('/featured', habitController.getFeaturedHabits);
        habitRoutes.get('/public', habitController.getPublicHabits); 

        // PRIVATE ROUTES (Secured by verifyToken middleware)
        
        // Create Habit
        habitRoutes.post('/', verifyToken, habitController.createHabit);
        
        // My Habits
        habitRoutes.get('/my', verifyToken, habitController.getMyHabits);

        // Habit Detail, Update, Delete (Uses the /:id parameter)
        habitRoutes.route('/:id')
            .get(verifyToken, habitController.getHabitDetail)  // GET /api/v1/habits/:id
            .patch(verifyToken, habitController.updateHabit)  // PATCH /api/v1/habits/:id
            .delete(verifyToken, habitController.deleteHabit); // DELETE /api/v1/habits/:id

        // Complete Habit Action
        habitRoutes.patch('/:id/complete', 
            verifyToken, 
            habitController.completeHabit
        );


        // Attach the router middleware to the Express app
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
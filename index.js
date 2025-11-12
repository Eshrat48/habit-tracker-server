// index.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// 🚩 NEW IMPORTS: Import the controller factory and the router instance
const getHabitController = require('./controllers/habitController');
const habitRoutes = require('./routes/habitRoutes');

// --- Middlewares ---
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow your client app access
    credentials: true,
}));
app.use(express.json());

// uri connection
// habitTrackerUser:tSi1QuLmXNQpfDtg
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
    // 🚩 Database and Collection Initialization
        const db = client.db("habitTracker"); 
        const habitsCollection = db.collection("habits");

    // Instantiate the controller factory, passing the collection dependency
        const habitController = getHabitController(habitsCollection);

        // ----------------------------------------------------
        // 🚩 Define API Routes (inside the run function)
        // ----------------------------------------------------
      // PUBLIC ROUTES
        habitRoutes.get('/featured', habitController.getFeaturedHabits);

        // PRIVATE ROUTES (will need the verifyToken middleware later)
        habitRoutes.post('/', 
            // verifyToken, // Middleware to be added next
            habitController.createHabit
        );


        // Attach the router middleware to the Express app
        app.use('/api/v1/habits', habitRoutes);
        
    await client.db("admin").command({ ping: 1 })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {

  }
}
run().catch(console.dir)

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})
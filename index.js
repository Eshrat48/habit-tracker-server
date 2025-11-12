// index.js

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());
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
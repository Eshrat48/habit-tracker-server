// controllers/habitController.js

const { ObjectId } = require('mongodb');

/**
 * Factory function to create habit controller functions, 
 * receiving the habitsCollection dependency from index.js.
 */
const getHabitController = (habitsCollection) => {
    
    /**
     * @desc    Get 6 newest public habits (for Home Page Featured Section)
     * @route   GET /api/v1/habits/featured
     * @access  Public
     */
    const getFeaturedHabits = async (req, res) => {
        try {
            // Native MongoDB Driver query: find, sort, limit, toArray
            const featuredHabits = await habitsCollection.find({ isPublic: true })
                .sort({ createdAt: -1 })  // Sort by creation date (newest first)
                .limit(6)                
                .toArray();               

            res.status(200).json({
                success: true,
                count: featuredHabits.length,
                data: featuredHabits,
            });

        } catch (error) {
            console.error('Error fetching featured habits:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server Error: Failed to fetch featured habits.' 
            });
        }
    };

    // --- Other CRUD operations will be added here ---
    
    /**
     * @desc    Create a new habit
     * @route   POST /api/v1/habits
     * @access  Private (requires authentication)
     */
    const createHabit = async (req, res) => {
        try {
            // NOTE: req.body must contain all required fields (title, description, etc.)
            // The authentication middleware (to be added later) will inject req.userEmail
            const newHabit = req.body;
            
            // Add creation timestamp explicitly for native driver sorting
            if (!newHabit.createdAt) {
                newHabit.createdAt = new Date();
            }

            const result = await habitsCollection.insertOne(newHabit);
            
            res.status(201).json({
                success: true,
                message: 'Habit created successfully.',
                data: result.insertedId,
            });

        } catch (error) {
            console.error('Error creating habit:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to create habit.' 
            });
        }
    };
    
    // Return all controller methods wrapped in the factory
    return {
        getFeaturedHabits,
        createHabit,
    };
};

module.exports = getHabitController;
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

    /**
     * @desc    Get all public habits with optional search and category filters
     * @route   GET /api/v1/habits/public?search=keyword&category=cat
     * @access  Public
     */
    const getPublicHabits = async (req, res) => {
        try {
            const { search, category } = req.query; 
            
            // Base query: only fetch public habits
            const query = { isPublic: true };

            // 1. Add Search Filter (by title or description)
            if (search) {
                const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex search
                query.$or = [
                    { title: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } }
                ];
            }

            // 2. Add Category Filter
            if (category) {
                query.category = category;
            }

            const publicHabits = await habitsCollection.find(query)
                .sort({ createdAt: -1 }) 
                .toArray();

            res.status(200).json({
                success: true,
                count: publicHabits.length,
                data: publicHabits,
            });

        } catch (error) {
            console.error('Error fetching public habits:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server Error: Failed to fetch public habits.' 
            });
        }
    };
    
    /**
     * @desc    Get all habits belonging to the authenticated user
     * @route   GET /api/v1/habits/my
     * @access  Private
     */
    const getMyHabits = async (req, res) => {
        try {
            const userEmail = req.userEmail; // Injected by verifyToken middleware

            if (!userEmail) {
                return res.status(401).json({ success: false, message: 'Authentication required.' });
            }

            const myHabits = await habitsCollection.find({ userEmail: userEmail })
                .sort({ createdAt: -1 }) 
                .toArray();

            res.status(200).json({
                success: true,
                count: myHabits.length,
                data: myHabits,
            });

        } catch (error) {
            console.error('Error fetching user habits:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Server Error: Failed to fetch my habits.' 
            });
        }
    };

    /**
     * @desc    Create a new habit
     * @route   POST /api/v1/habits
     * @access  Private (requires authentication)
     */
    const createHabit = async (req, res) => {
        try {
            const newHabitData = req.body;
            
            // INJECT AUTHENTICATED USER DATA FROM MIDDLEWARE
            const userEmail = req.userEmail; 
            const userName = req.userName; 

            if (!userEmail) {
                return res.status(400).json({ success: false, message: 'Authentication data missing.' });
            }
            
            const habitToInsert = {
                ...newHabitData,
                userEmail, 
                userName,  
                createdAt: new Date(), 
                isPublic: newHabitData.isPublic !== undefined ? newHabitData.isPublic : true, 
                completionHistory: [],
            };

            const result = await habitsCollection.insertOne(habitToInsert);
            
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
        getPublicHabits,
        getMyHabits,
        createHabit,
    };
};

module.exports = getHabitController;
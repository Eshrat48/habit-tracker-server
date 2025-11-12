// controllers/habitController.js

const { ObjectId } = require('mongodb');

/**
 * Factory function to create habit controller functions, 
 * receiving the habitsCollection dependency from index.js.
 */
const getHabitController = (habitsCollection) => {
    
    // =======================================================
    // READ OPERATIONS (PUBLIC)
    // =======================================================
    
    /**
     * @desc    Get 6 newest public habits (for Home Page Featured Section)
     * @route   GET /api/v1/habits/featured
     * @access  Public
     */
    const getFeaturedHabits = async (req, res) => {
        try {
            const featuredHabits = await habitsCollection.find({ isPublic: true })
                .sort({ createdAt: -1 }) 
                .limit(6)                
                .toArray();               

            res.status(200).json({
                success: true,
                count: featuredHabits.length,
                data: featuredHabits,
            });

        } catch (error) {
            console.error('Error fetching featured habits:', error);
            res.status(500).json({ success: false, message: 'Server Error: Failed to fetch featured habits.' });
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
            const query = { isPublic: true };

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { title: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } }
                ];
            }

            if (category) {
                query.category = category;
            }

            const publicHabits = await habitsCollection.find(query)
                .sort({ createdAt: -1 }) 
                .toArray();

            res.status(200).json({ success: true, count: publicHabits.length, data: publicHabits });

        } catch (error) {
            console.error('Error fetching public habits:', error);
            res.status(500).json({ success: false, message: 'Server Error: Failed to fetch public habits.' });
        }
    };
    
    // =======================================================
    // READ OPERATIONS (PRIVATE)
    // =======================================================
    
    /**
     * @desc    Get all habits belonging to the authenticated user
     * @route   GET /api/v1/habits/my
     * @access  Private
     */
    const getMyHabits = async (req, res) => {
        try {
            const userEmail = req.userEmail; // Injected by verifyToken middleware

            if (!userEmail) return res.status(401).json({ success: false, message: 'Authentication required.' });

            const myHabits = await habitsCollection.find({ userEmail: userEmail })
                .sort({ createdAt: -1 }) 
                .toArray();

            res.status(200).json({ success: true, count: myHabits.length, data: myHabits });

        } catch (error) {
            console.error('Error fetching user habits:', error);
            res.status(500).json({ success: false, message: 'Server Error: Failed to fetch my habits.' });
        }
    };
    
    /**
     * @desc    Get a single habit by ID
     * @route   GET /api/v1/habits/:id
     * @access  Private (or Public if habit isPublic)
     */
    const getHabitDetail = async (req, res) => {
        try {
            const id = new ObjectId(req.params.id);
            const userEmail = req.userEmail;

            const habit = await habitsCollection.findOne({ _id: id });

            if (!habit) {
                return res.status(404).json({ success: false, message: 'Habit not found.' });
            }
            
            // If the habit is private AND the fetching user is NOT the owner, deny access.
            if (!habit.isPublic && habit.userEmail !== userEmail) {
                 return res.status(403).json({ success: false, message: 'Access denied. This habit is private.' });
            }

            res.status(200).json({ success: true, data: habit });

        } catch (error) {
            console.error('Error fetching habit detail:', error);
            if (error.name === 'BSONTypeError') return res.status(400).json({ success: false, message: 'Invalid habit ID format.' });
            res.status(500).json({ success: false, message: 'Server error fetching habit detail.' });
        }
    };
    
    // =======================================================
    // WRITE OPERATIONS (PRIVATE)
    // =======================================================

    /**
     * @desc    Create a new habit
     * @route   POST /api/v1/habits
     * @access  Private (requires authentication)
     */
    const createHabit = async (req, res) => {
        try {
            const newHabitData = req.body;
            
            // Inject authenticated user data from middleware
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
            res.status(500).json({ success: false, message: 'Failed to create habit.' });
        }
    };
    
    /**
     * @desc    Update a habit by ID
     * @route   PATCH /api/v1/habits/:id
     * @access  Private (Owner only)
     */
    const updateHabit = async (req, res) => {
        try {
            const id = new ObjectId(req.params.id);
            const userEmail = req.userEmail;
            const updateData = req.body;

            // Security Check 1: Find the original habit and verify ownership
            const habit = await habitsCollection.findOne({ _id: id });

            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });
            if (habit.userEmail !== userEmail) return res.status(403).json({ success: false, message: 'Forbidden. You do not own this habit.' });

            // Security Check 2: Prevent updating user-specific fields or creation date
            delete updateData.userEmail;
            delete updateData.userName;
            delete updateData.createdAt;

            const result = await habitsCollection.updateOne(
                { _id: id },
                { $set: updateData }
            );

            if (result.modifiedCount === 0 && result.matchedCount > 0) {
                return res.status(200).json({ success: true, message: 'Habit updated, or no changes detected.' });
            }

            res.status(200).json({ success: true, message: 'Habit updated successfully.' });

        } catch (error) {
            console.error('Error updating habit:', error);
            if (error.name === 'BSONTypeError') return res.status(400).json({ success: false, message: 'Invalid habit ID format.' });
            res.status(500).json({ success: false, message: 'Server error updating habit.' });
        }
    };
    
    /**
     * @desc    Delete a habit by ID
     * @route   DELETE /api/v1/habits/:id
     * @access  Private (Owner only)
     */
    const deleteHabit = async (req, res) => {
        try {
            const id = new ObjectId(req.params.id);
            const userEmail = req.userEmail;

            // Security Check: Find the original habit and verify ownership
            const habit = await habitsCollection.findOne({ _id: id });

            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });
            if (habit.userEmail !== userEmail) return res.status(403).json({ success: false, message: 'Forbidden. You do not own this habit.' });

            const result = await habitsCollection.deleteOne({ _id: id });

            if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Habit not found for deletion.' });

            res.status(200).json({ success: true, message: 'Habit deleted successfully.' });

        } catch (error) {
            console.error('Error deleting habit:', error);
            if (error.name === 'BSONTypeError') return res.status(400).json({ success: false, message: 'Invalid habit ID format.' });
            res.status(500).json({ success: false, message: 'Server error deleting habit.' });
        }
    };
    
    /**
     * @desc    Mark habit complete and update completionHistory
     * @route   PATCH /api/v1/habits/:id/complete
     * @access  Private (Owner only)
     */
    const completeHabit = async (req, res) => {
        try {
            const id = new ObjectId(req.params.id);
            const userEmail = req.userEmail;
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day for check

            // Security Check: Find the original habit and verify ownership
            const habit = await habitsCollection.findOne({ _id: id });
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });
            if (habit.userEmail !== userEmail) return res.status(403).json({ success: false, message: 'Forbidden. You do not own this habit.' });

            // Check if already completed today
            const alreadyCompleted = (habit.completionHistory || []).some(date => {
                const completionDate = new Date(date);
                completionDate.setHours(0, 0, 0, 0);
                return completionDate.getTime() === today.getTime();
            });
            
            if (alreadyCompleted) {
                return res.status(200).json({ success: true, message: 'Habit already marked complete for today.' });
            }

            // Use $push to add the current timestamp
            const result = await habitsCollection.updateOne(
                { _id: id },
                { $push: { completionHistory: new Date() } }
            );

            if (result.modifiedCount === 0) {
                 return res.status(500).json({ success: false, message: 'Habit completion failed to update database.' });
            }

            res.status(200).json({ success: true, message: 'Habit marked complete! Streak updated.' });

        } catch (error) {
            console.error('Error completing habit:', error);
            if (error.name === 'BSONTypeError') return res.status(400).json({ success: false, message: 'Invalid habit ID format.' });
            res.status(500).json({ success: false, message: 'Server error completing habit.' });
        }
    };
    
    // Return all controller methods
    return {
        getFeaturedHabits,
        getPublicHabits,
        getMyHabits,
        createHabit,
        getHabitDetail,
        updateHabit,
        deleteHabit,
        completeHabit,
    };
};

module.exports = getHabitController;
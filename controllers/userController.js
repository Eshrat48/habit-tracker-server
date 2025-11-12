// controllers/userController.js

/**
 * Factory function to create user controller functions, 
 * receiving the usersCollection dependency from index.js.
 */
const getUserController = (usersCollection) => {
    
    /**
     * @desc    Saves new user data to MongoDB after successful Firebase registration.
     * @route   POST /api/v1/users/register-success
     * @access  Public (Called by client after Firebase success)
     * @body    { email, fullName, photoURL, firebaseUID }
     */
    const createUserInDB = async (req, res) => {
        try {
            const { email, fullName, photoURL, firebaseUID } = req.body;

            // 1. Check if user already exists using the unique Firebase UID
            const existingUser = await usersCollection.findOne({ firebaseUID });
            if (existingUser) {
                // If they exist (e.g., from a previous Google sign-in), return success.
                return res.status(200).json({ 
                    success: true, 
                    message: 'User already exists in MongoDB.',
                    user: existingUser 
                });
            }

            // 2. Create the new user object
            const newUser = {
                email,
                fullName,
                photoURL: photoURL || null,
                firebaseUID, // The unique key linking to Firebase
                createdAt: new Date(),
            };

            // 3. Insert into MongoDB
            await usersCollection.insertOne(newUser);
            
            res.status(201).json({ 
                success: true, 
                message: 'User data saved to MongoDB successfully.',
                user: newUser 
            });

        } catch (error) {
            console.error('Error saving user data to MongoDB:', error);
            res.status(500).json({ success: false, message: 'Server error saving user data to MongoDB.' });
        }
    };
    
    return {
        createUserInDB,
    };
};

module.exports = getUserController;
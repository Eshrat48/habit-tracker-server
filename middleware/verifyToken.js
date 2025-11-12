// middleware/verifyToken.js

const admin = require('firebase-admin');
const path = require('path');

// 🚩 Initialize Firebase Admin SDK (using the local key file)
try {
    // Determine the path to your key file
    const serviceAccountPath = path.resolve(__dirname, '../config/firebase-key.json');
    
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔒 Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK. Check key file path/contents:', error.message);
    // Note: If this fails, the server will continue, but private routes will break.
}


const verifyToken = async (req, res, next) => {
    // 1. Check for token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided or invalid format.' 
        });
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify token
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // 4. Attach user data to the request
        req.userEmail = decodedToken.email;
        req.userName = decodedToken.name || decodedToken.email.split('@')[0]; // Fallback for name
        req.userId = decodedToken.uid; 

        // 5. Proceed to the next controller/middleware
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error.message);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

module.exports = verifyToken;
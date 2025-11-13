// middleware/verifyToken.js

const admin = require('firebase-admin');

// ⚠️ FIX: Initialize Firebase Admin SDK (using Vercel Environment Variable)
try {
    // 1. Read the JSON string from the Vercel environment variable
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountJson) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    
    // 2. Parse the JSON string into a JavaScript object
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔒 Firebase Admin SDK initialized successfully from Vercel ENV.');

} catch (error) {
    // This will catch the error if the key is missing or malformed JSON
    console.error('❌ CRITICAL ERROR: Failed to initialize Firebase Admin SDK. Check the Vercel Environment Variable "FIREBASE_SERVICE_ACCOUNT_KEY".', error.message);
    // Since the Admin SDK failed to initialize, no private routes will work.
}


const verifyToken = async (req, res, next) => {
// ... The rest of the verifyToken function remains UNCHANGED

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
        req.userName = decodedToken.name || decodedToken.email.split('@')[0];
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
const crypto = require('crypto');

// Generate a random string of specified length
const generateSecretKey = length => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // Convert to hexadecimal format
        .slice(0, length); // Trim to desired length
};

// Usage: Generate a secret key of length 64 characters
console.log(generateSecretKey(64));

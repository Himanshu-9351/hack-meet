// server.js

const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

// Initialize Express app
const app = express();

// Initialize Polygon RPC endpoint
const provider = new HDWalletProvider({
    mnemonic: 'beyond near obey busy churn wisdom size relief good today pledge barely',
    providerOrUrl: 'https://polygon-rpc.com'
});

const web3 = new Web3(provider);

// Connect to MongoDB
mongoose.connect('mongodb+srv://pradeep89:Pradeep@123soni@encryptomeet.83t8btq.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define User schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String }
});

// Define Meeting schema
const meetingSchema = new mongoose.Schema({
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meetingId: { type: String, required: true, unique: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date }
});

// User model
const User = mongoose.model('User', userSchema);

// Meeting model
const Meeting = mongoose.model('Meeting', meetingSchema);

// Define JWT options
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: '93187d359cb20cac160bcb6c8644c3038402e9c04ae1c6c2dbb358d8483b9783' // Change this to a secure secret key
};

// Configure JWT strategy
passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.sub);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

// JWT sign function
const signToken = userId => {
    return jwt.sign({ sub: userId }, jwtOptions.secretOrKey, { expiresIn: '1h' });
};

// Middleware for authentication
const requireAuth = passport.authenticate('jwt', { session: false });

// Authentication endpoint
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized. Invalid username or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = signToken(user._id);
            return res.json({ token });
        } else {
            return res.status(401).json({ error: 'Unauthorized. Invalid username or password.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// User registration endpoint with email verification
app.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create new user with verification token
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            verificationToken
        });

        // Save the user to the database
        await newUser.save();

        // Send verification email
        sendVerificationEmail(email, verificationToken);

        // Respond with success message
        res.json({ message: 'User registered successfully. Please verify your email address.' });
    } catch (error) {
        // Handle errors
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create meeting endpoint
app.post('/create-meeting', requireAuth, async (req, res) => {
    const { userId } = req.user;
    try {
        // Generate unique meeting ID
        const meetingId = generateMeetingId();

        // Create new meeting
        const newMeeting = new Meeting({
            host: userId,
            meetingId
        });

        // Save the meeting to the database
        await newMeeting.save();

        // Respond with success message
        res.json({ message: 'Meeting created successfully.', meetingId });
    } catch (error) {
        // Handle errors
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Join meeting endpoint
app.post('/join-meeting', requireAuth, async (req, res) => {
    const { meetingId } = req.body;
    try {
        // Find the meeting by meeting ID
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found.' });
        }

        // Add participant to the meeting
        meeting.participants.push(req.user.userId);
        await meeting.save();

        // Respond with success message
        res.json({ message: 'Joined meeting successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error joining meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start meeting endpoint
app.post('/start-meeting', requireAuth, async (req, res) => {
    const { meetingId } = req.body;
    try {
        // Find the meeting by meeting ID
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found.' });
        }

        // Update meeting start time
        meeting.startTime = Date.now();
        await meeting.save();

        // Respond with success message
        res.json({ message: 'Meeting started successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error starting meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// End meeting endpoint
app.post('/end-meeting', requireAuth, async (req, res) => {
    const { meetingId } = req.body;
    try {
        // Find the meeting by meeting ID
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found.' });
        }

        // Update meeting end time
        meeting.endTime = Date.now();
        await meeting.save();

        // Respond with success message
        res.json({ message: 'Meeting ended successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error ending meeting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Verify email endpoint
app.get('/verify-email', async (req, res) => {
    const { email, token } = req.query;

    try {
        // Find user by email and verification token
        const user = await User.findOne({ email, verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Invalid verification token.' });
        }

        // Update user status to indicate email is verified
        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect user to a page indicating successful email verification
        res.redirect('https://yourwebsite.com/email-verified');
    } catch (error) {
        // Handle errors
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to generate a random verification token
const generateVerificationToken = () => {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
};

// Function to generate a unique meeting ID
const generateMeetingId = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase(); // Example: Generates a 6-character alphanumeric meeting ID
};

// Function to send verification email
const sendVerificationEmail = (email, token) => {
    // Create a transporter using nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'pradeepkumarsoni2002@gmail.com', // Your Gmail email address
            pass: 'Pradeep@123soni' // Your Gmail password
        }
    });

    // Email content
    const mailOptions = {
        from: 'yuvraj344yadav@gmail.com', // Sender email address
        to: email, // Recipient email address
        subject: 'Email Verification for EncryptoMeet',
        html: `
            <p>Please click the following link to verify your email address:</p>
            <p><a href="http://localhost:3000/verify-email?email=${email}&token=${token}">Verify Email</a></p>
        `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


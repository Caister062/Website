const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Setup Multer for image upload handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Handle new connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle setting a profile
    socket.on('set profile', (profile) => {
        socket.profile = {
            username: profile.username || "Anonymous",
            handle: profile.handle || "@anon",
            profilePicture: profile.profilePicture || "default-avatar.png",
        };
        console.log(`${socket.profile.username} has joined as ${socket.profile.handle}`);
    });

    // Handle posting messages
    socket.on('post message', (data) => {
        const timestamp = new Date().toLocaleTimeString();
        const post = {
            user: socket.profile.username || "Anonymous",
            handle: socket.profile.handle || "@anon",
            profilePicture: socket.profile.profilePicture || "default-avatar.png",
            message: data.message,
            image: data.image || null,
            time: timestamp,
            likes: 0,
        };
        io.emit('new post', post); // Broadcast the post to all connected clients
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
});

// Endpoint for image uploads
app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
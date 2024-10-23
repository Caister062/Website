const socket = io();

// DOM elements
const usernameInput = document.getElementById('username-input');
const handleInput = document.getElementById('handle-input');
const profilePictureInput = document.getElementById('profile-picture-input');
const setProfileButton = document.getElementById('set-profile');
const postInput = document.getElementById('post-input');
const imageInput = document.getElementById('image-input');
const sendPostButton = document.getElementById('send-post');
const postsList = document.getElementById('posts');
const countdownElement = document.getElementById('countdown');
const realTimeElement = document.getElementById('real-time');
let currentProfile = { username: "Anonymous", handle: "@anon", profilePicture: "default-avatar.png" };

// Countdown logic
const eventDate = new Date("2024-11-01T16:00:00"); // Set the real-time event date and time

function updateCountdown() {
    const now = new Date();
    const timeLeft = eventDate - now;

    if (timeLeft <= 0) {
        countdownElement.textContent = "The event has started!";
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateRealTime() {
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    
    realTimeElement.textContent = `Current Time: ${hours}:${minutes}:${seconds} ${ampm}`;
}

setInterval(updateCountdown, 1000); // Update countdown every second
setInterval(updateRealTime, 1000);  // Update real-time clock every second

// Set profile
setProfileButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const handle = handleInput.value.trim();
    const profilePictureFile = profilePictureInput.files[0];

    if (username && handle && profilePictureFile) {
        const reader = new FileReader();
        reader.onload = () => {
            currentProfile = {
                username,
                handle,
                profilePicture: reader.result,
            };
            socket.emit('set profile', currentProfile);
            postInput.disabled = false;
            imageInput.disabled = false;
            sendPostButton.disabled = false;
        };
        reader.readAsDataURL(profilePictureFile);
    }
});

// Send post
sendPostButton.addEventListener('click', () => {
    const message = postInput.value.trim();
    if (message !== '') {
        socket.emit('post message', { message });
        postInput.value = ''; // Clear the input field
    }
});

// Listen for new posts
socket.on('new post', (post) => {
    const postElement = document.createElement('li');
    postElement.innerHTML = `
        <div class="post-header">${post.user} <span>${post.handle}</span></div>
        <img src="${post.profilePicture}" class="post-avatar">
        <div>${post.message}</div>
        <div class="post-timestamp">${post.time}</div>
    `;
    postsList.appendChild(postElement);
    postsList.scrollTop = postsList.scrollHeight; // Auto-scroll to latest post
});

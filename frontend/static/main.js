// ==========================
// JavaScript Blog Application
// ==========================
window.onload = function () {
    const savedBaseUrl = localStorage.getItem('apiBaseUrl');
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
    }
    updateAuthUI(); // Update auth UI immediately on load
    loadPosts();    // Load posts
};

// Save base URL to localStorage
function saveBaseUrl() {
    const baseUrl = document.getElementById('api-base-url').value;
    localStorage.setItem('apiBaseUrl', baseUrl);
    alert('API Base URL has been saved!');
}

// Update authentication UI based on login state (dynamically adds buttons or form)
function updateAuthUI() {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
    const baseUrl = document.getElementById('api-base-url').value;
    const authContainer = document.getElementById('auth-container'); // Auth container placeholder

    // Clear current auth container content
    authContainer.innerHTML = '';

    if (!baseUrl) {
        console.warn('Base URL is not set!');
        return;
    }

    if (token) {
        // Validate token by calling a protected backend endpoint
        fetch(`${baseUrl}/protected`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                if (response.ok) {
                    // Token is valid, show logout button
                    const logoutButton = document.createElement('button');
                    logoutButton.innerText = 'Logout';
                    logoutButton.onclick = logout;
                    authContainer.appendChild(logoutButton);
                } else {
                    // Token is invalid, clear it and show the login form
                    console.warn('Token invalid or expired. Logging out...');
                    localStorage.removeItem('token');
                    createLoginForm(authContainer);
                }
            })
            .catch((error) => {
                console.error('Error validating token:', error);
                localStorage.removeItem('token');
                createLoginForm(authContainer);
            });
    } else {
        // No token, show the login form
        createLoginForm(authContainer);
    }
}

// Helper function to create and add a Login form
function createLoginForm(container) {
    container.innerHTML = `
        <label for="username">Username:</label>
        <input type="text" id="username" placeholder="Enter your username" />

        <label for="password">Password:</label>
        <input type="password" id="password" placeholder="Enter your password" />

        <label>
            <input type="checkbox" id="show-password"> Show Password
        </label>

        <button onclick="handleLogin()">Login</button>
    `;
    setupShowPasswordToggle(); // Activate the "Show Password" feature
}

// Set up the "Show Password" toggle functionality
function setupShowPasswordToggle() {
    const checkbox = document.getElementById('show-password');
    if (checkbox) {
        checkbox.addEventListener('change', function () {
            const passwordField = document.getElementById('password');
            if (this.checked) {
                passwordField.type = 'text'; // Show password
            } else {
                passwordField.type = 'password'; // Hide password
            }
        });
    }
}

// Load all posts
function loadPosts() {
    const baseUrl = document.getElementById('api-base-url').value;

    fetch(`${baseUrl}/posts`)
        .then((response) => {
            if (!response.ok) throw new Error('Failed to fetch posts.');
            return response.json();
        })
        .then((data) => {
            const postContainer = document.getElementById('post-container') || createPostContainer();
            postContainer.innerHTML = ''; // Clear existing posts

            data.forEach((post) => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.setAttribute('data-post-id', post.id);
                postDiv.innerHTML = `
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-category">${post.category}</p>
                    <p class="post-content">${post.content}</p>
                    <button onclick="deletePost('${post.id}')">Delete</button>
                    <button onclick="updatePost('${post.id}')">Update</button>
                `;
                postContainer.appendChild(postDiv);
            });
        })
        .catch((error) => console.error('Error fetching posts:', error));
}

// Add a new post
function addPost() {
    const baseUrl = document.getElementById('api-base-url').value;

    const title = document.getElementById('post-title').value;
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value;

    if (!title || !category || !content) {
        alert('All fields are required to add a post!');
        return;
    }

    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, category, content })
    })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to add post.');
            return response.json();
        })
        .then(() => {
            alert('Post added successfully!');
            loadPosts(); // Refresh posts
        })
        .catch((error) => console.error('Error adding post:', error));
}

// Delete an existing post
function deletePost(postId) {
    const baseUrl = document.getElementById('api-base-url').value;

    fetch(`${baseUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(() => {
            alert('Post deleted successfully!');
            loadPosts(); // Refresh posts
        })
        .catch((error) => console.error('Error deleting post:', error));
}

// Update an existing post
function updatePost(postId) {
    const baseUrl = document.getElementById('api-base-url').value;

    const title = prompt('Enter new title for the post:');
    const category = prompt('Enter new category for the post:');
    const content = prompt('Enter new content for the post:');

    if (!title || !category || !content) {
        alert('All fields are required to update a post!');
        return;
    }

    fetch(`${baseUrl}/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, category, content })
    })
        .then(() => {
            alert('Post updated successfully!');
            loadPosts(); // Refresh posts
        })
        .catch((error) => console.error('Error updating post:', error));
}

// Login function
function handleLogin() {
    const baseUrl = document.getElementById('api-base-url').value;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password!');
        return;
    }

    fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then((response) => {
            if (!response.ok) throw new Error('Failed to log in.');
            return response.json();
        })
        .then((data) => {
            alert('Login successful!');
            localStorage.setItem('token', data.token); // Save token to localStorage
            updateAuthUI(); // Refresh UI after login
        })
        .catch((error) => console.error('Error logging in:', error));
}

// Logout function
function logout() {
    localStorage.removeItem('token'); // Remove token
    alert('Logout successful!');
    updateAuthUI(); // Refresh UI after logout
}

// Helper function to create post container
function createPostContainer() {
    const postContainer = document.createElement('div');
    postContainer.id = 'post-container';
    document.body.appendChild(postContainer);
    return postContainer;
}
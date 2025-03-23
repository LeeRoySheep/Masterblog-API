// ==========================
// JavaScript Blog Application
// ==========================
window.onload = function () {
    const savedBaseUrl = localStorage.getItem('apiBaseUrl');
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
    }
    createSearchField();// Create search field as header
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
    container.innerHTML =`
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

//create search field
function createSearchField() {
    const container = document.getElementById('search-bar');
    container.innerHTML = `
        <label for="author">Author:</label>
        <input type="text" id="author" placeholder="Enter author to search" />
        <label for="title">Title:</label>
        <input type="text" id="title" placeholder="Enter title to search" />
        <label for="category">Category:</label>
        <input type="text" id="category" placeholder="Enter category to search" />
        <label for="content">Content:</label>
        <input type="text" id="content" placeholder="Enter content to search" />
        <label for"date">Date:</label>
        <input type="date" id="date" placeholder="Enter date to search" />
        <button onclick="searchPosts()">Search</button>
    `;
}

// Handle search form submission
function searchPosts() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;
    const date = document.getElementById('date').value;
    const author = document.getElementById('author').value;
    const baseUrl = document.getElementById('api-base-url').value;

    fetch(`
        ${baseUrl}/posts/search?
        author=${author}&
        title=${title}&
        category=$
        date=${date}&
        category=${category}&
        content=${content}
        `, {
        method: 'GET'
    })
    .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch posts.');
        return response.json();
    })
    .then((data) => {
        const postContainer = document.getElementById('post-container')
        || createPostContainer();
        postContainer.innerHTML = ''; // Clear existing posts

        data.forEach((post) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.setAttribute("data-post-id", post.id );
            postDiv.innerHTML = `
                <h2 class="post-title">${post.title}</h2>
                <p class="post-author">${post.author}</p>
                <p class="post-category">${post.category}</p>
                <p class="post-date">${post.date}</p>
                <p class="post-content">${post.content}</p>
                <button onclick="deletePost(${post.id})">Delete</button>
                <button onclick="updatePost(${post.id})">Update</button>
            `;
            postContainer.appendChild(postDiv);
            postContainer.innerHTML += `
                <button onclick="loadPosts()">back</button>
            `;
        });

    })
    .catch((error) => {
        console.error('Error searching posts:', error);
    });
}

// create sort field for posts
function createSortField(container) {
    container.innerHTML += `
            <label for="sort-by">Sort by:</label>
                <select name="sort-by" id="sort-by">
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="category">Category</option>
                    <option value="content">Content</option>
                    <option value="date">Date</option>
                </select>
            <label>
                <input type="checkbox" id="direction">Descending:
            </label>
            <button onclick="loadSortedPosts(document.getElementById('sort-by').value,
             document.getElementById('direction').checked ? 'desc' : 'asc')">Sort</button>
    `
}

// Load all posts
function loadPosts() {
    const baseUrl = document.getElementById('api-base-url').value;
    fetch(`${baseUrl}/posts`, {
            method: 'GET'

    })
    .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch posts.');
        return response.json();
    })
    .then((data) => {
        const postContainer = document.getElementById('post-container') || createPostContainer();
        postContainer.innerHTML = ''; // Clear existing posts
        createSortField(postContainer); // Add search field
        data.forEach((post) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.setAttribute("data-post-id", post.id );
            postDiv.innerHTML = `
                <h2 class="post-title">${post.title}</h2>
                <p class="post-author">${post.author}</p>
                <p class="post-category">${post.category}</p>
                <p class="post-date">${post.date}</p>
                <p class="post-content">${post.content}</p>
                <button onclick="deletePost(${post.id})">Delete</button>
                <button onclick="updatePost(${post.id})">Update</button>
            `;
            postContainer.appendChild(postDiv);
        });
    })
    .catch((error) => console.error('Error fetching posts:', error));
}

// Load all posts sorted
function loadSortedPosts(sort, direction) {
    const baseUrl = document.getElementById('api-base-url').value;
    fetch(`${baseUrl}/posts?sort=${sort}&direction=${direction}`, {
            method: 'GET'

    })
    .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch posts.');
        return response.json();
    })
    .then((data) => {
        const postContainer = document.getElementById('post-container') || createPostContainer();
        postContainer.innerHTML = ''; // Clear existing posts
        createSortField(postContainer); // Add sort field
        data.forEach((post) => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.setAttribute("data-post-id", post.id );
            postDiv.innerHTML = `
                <h2 class="post-title">${post.title}</h2>
                <p class="post-author">${post.author}</p>
                <p class="post-category">${post.category}</p>
                <p class="post-date">${post.date}</p>
                <p class="post-content">${post.content}</p>
                <button onclick="deletePost(${post.id})">Delete</button>
                <button onclick="updatePost(${post.id})">Update</button>
            `;
            postContainer.appendChild(postDiv);
        });
    })
    .catch((error) => console.error('Error fetching posts:', error));
}

// Add a new post
function addPost() {
    const baseUrl = document.getElementById('api-base-url').value;

    fetch(`${baseUrl}/protected`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token', "")}` }
    })
    .then((response) => {
            if (!response.ok){
                alert('Need to be logged in to post!');
                return;
            }
            else {
                 //Now check user input
                const title = document.getElementById('post-title').value;
                const category = document.getElementById('post-category').value;
                const content = document.getElementById('post-content').value;

                if (!title || !category || !content) {
                    alert('All fields are required to add a post!');
                    return;
                };

                fetch(`${baseUrl}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token', "")}`
                    },
                    body: JSON.stringify({ title, category, content })
                })
                .then((response) => {
                    if (!response.ok){
                        alert(response.json());
                        return;
                    };
                })
                .then(() => {
                    alert('Post added successfully!');
                    location.reload(); // Refresh posts
                })
            }
    })
    .catch((error) => console.error('Error adding post:', error));
}


// Delete an existing post
function deletePost(postId) {
    const baseUrl = document.getElementById('api-base-url').value;

    fetch(`${baseUrl}/protected`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token', "")}` }
    })
    .then((response) => {
            if (response.status !== 200) {
                alert('Need to be logged in as admin to delete Post!');
                return;
            };
            fetch(`${baseUrl}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token', "")}` }
            })
            .then((response) => {
                if (!response.ok) {
                    alert('Need to be logged in as admin to delete Post!');
                    throw new Error('Failed to delete post.');
                };
            })
            .then(() => {
                alert('Post deleted successfully!');
                loadPosts();
            });
    })
    .catch((error) => console.error('Error deleting post:', error));
}

// Update an existing post
function updatePost(postId) {
    const baseUrl = document.getElementById('api-base-url').value;
    fetch(`${baseUrl}/protected?id=${postId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token', "")}` }
    })
    .then(response => {
        if(!response.ok) {
            alert('Please login as admin or author to update this Post!');
            return;
        };
        const title = prompt('Please enter new titel: ');
        const content = prompt('Please enter new content: ');
        const category = prompt('Please enter new category: ');
        fetch(`${baseUrl}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token', "")}`
            },
            body: JSON.stringify({ title, category, content })
        })
        .then(() => {
            alert('Post updated successfully!');
            loadPosts(); // Refresh posts
        });
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
        if (response.status === 401) {
            alert('Invalid username or password!');
            throw new Error('Login failed.');
        };
        if (response.status === 429) {
            alert('Too many login attempts. Please try again later.');
            throw new Error('Login failed.');
        };
        if (!response.ok && response !== 401 && response !== 429) throw new Error('Login failed.');
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
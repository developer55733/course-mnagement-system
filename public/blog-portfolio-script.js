// Blog and Portfolio Management JavaScript - MySQL API Version

// API Configuration
const API_BASE = window.location.origin + '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log(' Initializing blog and portfolio system...');
    
    // Check blog authentication status
    checkBlogAuthStatus();
    
    // Check portfolio authentication status
    checkPortfolioAuthStatus();
    
    // Load public blogs for everyone to see
    await loadPublicBlogs();
    
    // Load portfolio data for everyone to see
    await loadPublicPortfolioData();
    
    // Initialize tab switching
    initializeTabSwitching();
    
    // Initialize mobile navigation
    initializeMobileNavigation();
    
    // Test API connection
    await testAPIConnection();
    
    // Load data (only if authenticated)
    if (blogCurrentUser) {
        await loadBlogPosts();
        await loadPortfolioData();
        updateBlogStats();
        updatePortfolioStats();
        
        console.log('Blog and portfolio system initialized successfully');
    } else {
        console.log('Blog and portfolio system initialized (public mode)');
    }
});

// Test API connection
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) {
            throw new Error('API not responding');
        }
        console.log('API connection successful');
        return true;
    } catch (error) {
        console.error('API connection failed:', error);
        throw error;
    }
}

// Load public blogs for all users to see
async function loadPublicBlogs() {
    try {
        const publicBlogsGrid = document.getElementById('public-blogs-grid');
        if (!publicBlogsGrid) {
            console.error('Public blogs grid not found');
            return;
        }
        
        // Fetch only published blogs from API
        const response = await fetch(`${API_BASE}/blogs?status=published`);
        if (!response.ok) {
            throw new Error('Failed to fetch public blog posts');
        }
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            displayEmptyPublicBlogs();
            return;
        }
        
        publicBlogsGrid.innerHTML = posts.map(post => `
            <div class="blog-post-card public-blog-card">
                <div class="blog-post-header">
                    <h4>${post.title || 'Untitled'}</h4>
                    <div class="blog-post-meta">
                        <span class="blog-category">${post.category || 'Uncategorized'}</span>
                        <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                        <span class="blog-author">By ${post.created_by_name || 'Anonymous'}</span>
                    </div>
                </div>
                ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-post-image">` : ''}
                <div class="blog-post-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No excerpt available')}</div>
                <div class="blog-post-footer">
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> <span class="view-count-${post.id}">${post.views || 0}</span></span>
                        <span><i class="fas fa-heart"></i> <span class="like-count-${post.id}">${post.likes || 0}</span></span>
                    </div>
                    <div class="blog-post-actions">
                        <button class="btn btn-primary" onclick="viewFullBlogPost('${post.id}')">
                            <i class="fas fa-book-open"></i> Read More
                        </button>
                        <button class="btn btn-outline like-btn" id="like-btn-${post.id}" onclick="toggleLike('${post.id}')">
                            <i class="fas fa-heart"></i> <span class="like-text-${post.id}">Like</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Setup search and filter for public blogs
        setupPublicBlogFilters();
        
    } catch (error) {
        console.error('Error loading public blogs:', error);
        displayEmptyPublicBlogs();
    }
}

// Display empty state for public blogs
function displayEmptyPublicBlogs() {
    const publicBlogsGrid = document.getElementById('public-blogs-grid');
    if (publicBlogsGrid) {
        publicBlogsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-newspaper"></i>
                <h3>No Published Blogs Yet</h3>
                <p>Be the first to publish a blog post and share your knowledge!</p>
            </div>
        `;
    }
}

// View full blog post in modal
function viewFullBlogPost(blogId) {
    fetch(`${API_BASE}/blogs/${blogId}`)
        .then(response => response.json())
        .then(post => {
            createBlogModal(post);
            // Increment view count
            incrementBlogViews(blogId);
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            if (window.notifications) {
                window.notifications.error('Failed to load blog post');
            }
        });
}

// Create modal to display full blog post
function createBlogModal(post) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content blog-modal-content" style="max-width: 900px; max-height: 95vh; overflow-y: auto;">
            <div class="modal-header">
                <h3><i class="fas fa-blog"></i> ${post.title || 'Untitled'}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="blog-full-content">
                    <div class="blog-meta-info">
                        <span class="blog-category">${post.category || 'Uncategorized'}</span>
                        <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                        <span class="blog-author">By ${post.created_by_name || 'Anonymous'}</span>
                    </div>
                    ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-full-image" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin: 20px 0;">` : ''}
                    ${post.excerpt ? `<div class="blog-excerpt-full" style="color: #666; font-style: italic; margin-bottom: 20px;">${post.excerpt}</div>` : ''}
                    <div class="blog-content-full" style="line-height: 1.8; white-space: pre-wrap;">${post.content || 'No content available'}</div>
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="blog-tags" style="margin-top: 20px;">
                            <strong>Tags:</strong> ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <div class="blog-post-stats">
                    <span><i class="fas fa-eye"></i> ${post.views || 0} Views</span>
                    <span><i class="fas fa-heart"></i> ${post.likes || 0} Likes</span>
                </div>
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Increment blog view count
async function incrementBlogViews(blogId) {
    try {
        await fetch(`${API_BASE}/blogs/${blogId}/views`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// Refresh public blogs
function refreshPublicBlogs() {
    loadPublicBlogs();
    if (window.notifications) {
        window.notifications.info('Refreshing public blogs...');
    }
}

// Setup search and filter for public blogs
function setupPublicBlogFilters() {
    const searchInput = document.getElementById('public-blog-search');
    const categoryFilter = document.getElementById('public-blog-filter-category');
    const sortFilter = document.getElementById('public-blog-filter-sort');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPublicBlogs);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPublicBlogs);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterPublicBlogs);
    }
}

// Filter public blogs
async function filterPublicBlogs() {
    try {
        const searchTerm = document.getElementById('public-blog-search')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('public-blog-filter-category')?.value || '';
        const sortFilter = document.getElementById('public-blog-filter-sort')?.value || 'newest';
        
        // Fetch all published blogs
        const response = await fetch(`${API_BASE}/blogs?status=published`);
        const posts = await response.json();
        
        // Filter posts
        let filteredPosts = posts.filter(post => {
            const matchesSearch = !searchTerm || 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !categoryFilter || post.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        // Sort posts
        filteredPosts.sort((a, b) => {
            switch (sortFilter) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'most-viewed':
                    return (b.views || 0) - (a.views || 0);
                case 'most-liked':
                    return (b.likes || 0) - (a.likes || 0);
                default:
                    return 0;
            }
        });
        
        // Display filtered posts
        const publicBlogsGrid = document.getElementById('public-blogs-grid');
        if (filteredPosts.length === 0) {
            publicBlogsGrid.innerHTML = `
                <div class="no-posts-message">
                    <i class="fas fa-search"></i>
                    <h3>No Blogs Found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
        } else {
            publicBlogsGrid.innerHTML = filteredPosts.map(post => `
                <div class="blog-post-card public-blog-card">
                    <div class="blog-post-header">
                        <h4>${post.title || 'Untitled'}</h4>
                        <div class="blog-post-meta">
                            <span class="blog-category">${post.category || 'Uncategorized'}</span>
                            <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                            <span class="blog-author">By ${post.created_by_name || 'Anonymous'}</span>
                        </div>
                    </div>
                    ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-post-image">` : ''}
                    <div class="blog-post-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No excerpt available')}</div>
                    <div class="blog-post-footer">
                        <div class="blog-post-stats">
                            <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                            <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                        </div>
                        <div class="blog-post-actions">
                            <button class="btn btn-primary" onclick="viewFullBlogPost('${post.id}')">
                                <i class="fas fa-book-open"></i> Read More
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error filtering public blogs:', error);
    }
}

// Blog Authentication System
let blogCurrentUser = null;

// Check if user is logged in
function checkBlogAuthStatus() {
    const savedUser = localStorage.getItem('blogCurrentUser');
    if (savedUser) {
        blogCurrentUser = JSON.parse(savedUser);
        showBlogManagement();
        return true;
    }
    showBlogAuth();
    return false;
}

// Handle blog login
async function handleBlogLogin(event) {
    event.preventDefault();
    
    const emailOrUsername = document.getElementById('blog-login-email').value.trim();
    const password = document.getElementById('blog-login-password').value;
    
    if (!emailOrUsername || !password) {
        if (window.notifications) {
            window.notifications.warning('Please enter email/username and password');
        }
        return;
    }
    
    try {
        // Try to authenticate via API (fallback to demo mode)
        let user = null;
        
        // Check if it's a demo account
        if (emailOrUsername.toLowerCase() === 'demo' && password === 'demo') {
            user = {
                id: 'demo-user',
                name: 'Demo User',
                email: 'demo@example.com',
                username: 'demo'
            };
        } else {
            // Try API authentication
            const response = await fetch(`${API_BASE}/blog-auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emailOrUsername, password })
            });
            
            if (response.ok) {
                user = await response.json();
            }
        }
        
        if (user) {
            blogCurrentUser = user;
            localStorage.setItem('blogCurrentUser', JSON.stringify(user));
            
            if (window.notifications) {
                window.notifications.success(`Welcome back, ${user.name}!`);
            }
            
            showBlogManagement();
            loadBlogPosts(); // Load user's blogs
        } else {
            if (window.notifications) {
                window.notifications.error('Invalid email/username or password');
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback to demo mode on error
        if (window.notifications) {
            window.notifications.warning('Using demo mode. Try username: demo, password: demo');
        }
    }
}

// Handle blog registration
async function handleBlogRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('blog-register-name').value.trim();
    const email = document.getElementById('blog-register-email').value.trim();
    const username = document.getElementById('blog-register-username').value.trim();
    const password = document.getElementById('blog-register-password').value;
    const confirmPassword = document.getElementById('blog-register-confirm-password').value;
    
    console.log('🔍 Registration form data:', { name, email, username, passwordLength: password?.length });
    
    if (!name || !email || !username || !password || !confirmPassword) {
        if (window.notifications) {
            window.notifications.warning('Please fill in all fields');
        }
        return;
    }
    
    if (password !== confirmPassword) {
        if (window.notifications) {
            window.notifications.error('Passwords do not match');
        }
        return;
    }
    
    if (password.length < 6) {
        if (window.notifications) {
            window.notifications.warning('Password must be at least 6 characters long');
        }
        return;
    }
    
    try {
        console.log('🔍 Sending registration request...');
        
        // Try to register via API
        const response = await fetch(`${API_BASE}/blog-auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, username, password })
        });
        
        console.log('🔍 Registration response status:', response.status);
        console.log('🔍 Registration response ok:', response.ok);
        
        const responseData = await response.json();
        console.log('🔍 Registration response data:', responseData);
        
        if (response.ok) {
            const user = responseData.user;
            blogCurrentUser = user;
            localStorage.setItem('blogCurrentUser', JSON.stringify(user));
            
            if (window.notifications) {
                window.notifications.success(`Welcome to the blog system, ${user.name}!`);
            }
            
            showBlogManagement();
            loadBlogPosts(); // Load user's blogs
        } else {
            // Handle specific error types
            if (responseData.error === 'User already exists') {
                window.notifications.error('A user with this email or username already exists');
            } else if (responseData.error === 'Password too short') {
                window.notifications.warning('Password must be at least 6 characters long');
            } else if (responseData.error === 'All fields are required') {
                window.notifications.warning('Please fill in all fields');
            } else if (responseData.error === 'Database setup failed') {
                window.notifications.error('Database setup failed. Please try again later.');
            } else if (responseData.error === 'User creation failed') {
                window.notifications.error('Could not create user account. Please try again.');
            } else {
                window.notifications.error(responseData.message || 'Registration failed. Please try again.');
            }
            
            console.error('❌ Registration failed:', responseData);
        }
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Check for network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            window.notifications.error('Network error. Please check your connection and try again.');
        } else {
            window.notifications.warning('Registration server unavailable. Try demo login (username: demo, password: demo)');
        }
    }
}

// Handle blog logout
function handleBlogLogout() {
    blogCurrentUser = null;
    localStorage.removeItem('blogCurrentUser');
    
    if (window.notifications) {
        window.notifications.info('You have been logged out');
    }
    
    showBlogAuth();
}

// Show blog authentication section
function showBlogAuth() {
    document.getElementById('blog-auth-section').style.display = 'block';
    document.getElementById('blog-register-section').style.display = 'none';
    document.getElementById('blog-management-section').style.display = 'none';
    
    // Clear form
    document.getElementById('blog-login-form').reset();
}

// Show blog registration section
function showBlogRegister() {
    document.getElementById('blog-auth-section').style.display = 'none';
    document.getElementById('blog-register-section').style.display = 'block';
    document.getElementById('blog-management-section').style.display = 'none';
    
    // Clear form
    document.getElementById('blog-register-form').reset();
}

// Show blog login section
function showBlogLogin() {
    document.getElementById('blog-auth-section').style.display = 'block';
    document.getElementById('blog-register-section').style.display = 'none';
    document.getElementById('blog-management-section').style.display = 'none';
    
    // Clear form
    document.getElementById('blog-login-form').reset();
}

// Show blog management section
function showBlogManagement() {
    document.getElementById('blog-auth-section').style.display = 'none';
    document.getElementById('blog-register-section').style.display = 'none';
    document.getElementById('blog-management-section').style.display = 'block';
    
    // Update user info
    if (blogCurrentUser) {
        document.getElementById('blog-user-name').textContent = blogCurrentUser.name;
    }
    
    // Start real-time stats updates
    startRealTimeStatsUpdates();
    
    // Initial stats update
    updateBlogStats();
}

// Portfolio Authentication Variables
let portfolioCurrentUser = null;

// Portfolio Authentication Functions

// Show portfolio login form
function showPortfolioLogin() {
    const authSection = document.getElementById('portfolio-auth-section');
    const registerSection = document.getElementById('portfolio-register-section');
    const managementSection = document.getElementById('portfolio-management-section');
    const publicSection = document.querySelector('.public-portfolio-section');
    
    if (authSection) authSection.style.display = 'block';
    if (registerSection) registerSection.style.display = 'none';
    if (managementSection) managementSection.style.display = 'none';
    if (publicSection) publicSection.style.display = 'none';
}

// Show portfolio registration form
function showPortfolioRegister() {
    const authSection = document.getElementById('portfolio-auth-section');
    const registerSection = document.getElementById('portfolio-register-section');
    const managementSection = document.getElementById('portfolio-management-section');
    const publicSection = document.querySelector('.public-portfolio-section');
    
    if (authSection) authSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'block';
    if (managementSection) managementSection.style.display = 'none';
    if (publicSection) publicSection.style.display = 'none';
}

// Handle portfolio login
async function handlePortfolioLogin() {
    try {
        const username = document.getElementById('portfolio-username').value;
        const password = document.getElementById('portfolio-password').value;
        
        if (!username || !password) {
            if (window.notifications) {
                window.notifications.error('Please enter username and password');
            } else {
                alert('Please enter username and password');
            }
            return;
        }
        
        console.log('🔍 Portfolio login attempt:', username);
        
        // Use database API for login
        const response = await fetch(`${API_BASE}/portfolio-auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        console.log('🔍 Login response status:', response.status);
        console.log('🔍 Login response ok:', response.ok);
        
        const responseData = await response.json();
        console.log('🔍 Login response data:', responseData);
        
        if (response.ok && responseData.success) {
            const user = responseData.user;
            console.log('✅ Portfolio login successful:', user);
            
            // Store portfolio user session (minimal data for security)
            portfolioCurrentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                user_type: user.user_type,
                created_at: user.created_at
            };
            
            // Use sessionStorage instead of localStorage for better security
            sessionStorage.setItem('portfolioCurrentUser', JSON.stringify(portfolioCurrentUser));
            
            // Show management section
            showPortfolioManagement();
            
            // Load portfolio data
            await loadPortfolioData();
            
            if (window.notifications) {
                window.notifications.success('Portfolio login successful! Welcome back!');
            } else {
                alert('Portfolio login successful! Welcome back!');
            }
        } else {
            // Handle specific error types
            if (responseData.error === 'Invalid username or password') {
                window.notifications.error('Invalid username or password');
            } else if (responseData.error === 'Username and password are required') {
                window.notifications.warning('Please enter username and password');
            } else {
                window.notifications.error(responseData.error || 'Login failed. Please try again.');
            }
            
            console.error('❌ Login failed:', responseData);
        }
        
    } catch (error) {
        console.error('❌ Portfolio login error:', error);
        
        // Check for network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            window.notifications.error('Network error. Please check your connection and try again.');
        } else {
            window.notifications.error('Login failed: ' + error.message);
        }
    }
}

// Handle portfolio registration
async function handlePortfolioRegister(event) {
    event.preventDefault();
    try {
        console.log('🔍 Starting portfolio registration...');
        
        const name = document.getElementById('portfolio-register-name').value;
        const email = document.getElementById('portfolio-register-email').value;
        const username = document.getElementById('portfolio-register-username').value;
        const password = document.getElementById('portfolio-register-password').value;
        const confirmPassword = document.getElementById('portfolio-register-confirm-password').value;
        
        if (!name || !email || !username || !password) {
            if (window.notifications) {
                window.notifications.error('Please fill all required fields');
            } else {
                alert('Please fill all required fields');
            }
            return;
        }
        
        if (password !== confirmPassword) {
            if (window.notifications) {
                window.notifications.error('Passwords do not match');
            } else {
                alert('Passwords do not match');
            }
            return;
        }
        
        console.log('🔍 Portfolio registration attempt:', { name, email, username });
        
        // Use database API for registration
        const response = await fetch(`${API_BASE}/portfolio-auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                username: username,
                password: password,
                confirm_password: confirmPassword
            })
        });
        
        console.log('🔍 Registration response status:', response.status);
        console.log('🔍 Registration response ok:', response.ok);
        
        const responseData = await response.json();
        console.log('🔍 Registration response data:', responseData);
        
        if (response.ok && responseData.success) {
            const user = responseData.user;
            console.log('✅ Portfolio registration successful:', user);
            
            // Store portfolio user session (minimal data for security)
            portfolioCurrentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                user_type: user.user_type,
                created_at: user.created_at
            };
            
            // Use sessionStorage instead of localStorage for better security
            sessionStorage.setItem('portfolioCurrentUser', JSON.stringify(portfolioCurrentUser));
            
            // Show management section
            showPortfolioManagement();
            
            // Load portfolio data
            await loadPortfolioData();
            
            if (window.notifications) {
                window.notifications.success('Portfolio account created successfully! Welcome to your portfolio management!');
            } else {
                alert('Portfolio account created successfully! Welcome to your portfolio management!');
            }
        } else {
            // Handle specific error types
            if (responseData.error === 'Email or username already exists') {
                window.notifications.error('A user with this email or username already exists');
            } else if (responseData.error === 'Passwords do not match') {
                window.notifications.error('Passwords do not match');
            } else if (responseData.error === 'All fields are required') {
                window.notifications.warning('Please fill in all fields');
            } else {
                window.notifications.error(responseData.error || 'Registration failed. Please try again.');
            }
            
            console.error('❌ Registration failed:', responseData);
        }
        
    } catch (error) {
        console.error('❌ Portfolio registration error:', error);
        
        // Check for network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            window.notifications.error('Network error. Please check your connection and try again.');
        } else {
            window.notifications.error('Registration failed: ' + error.message);
        }
    }
}

// Handle portfolio logout
function handlePortfolioLogout() {
    console.log('🔍 Portfolio logout');
    
    // Clear portfolio user session from sessionStorage
    portfolioCurrentUser = null;
    sessionStorage.removeItem('portfolioCurrentUser');
    
    // Call logout API to clear server session
    fetch(`${API_BASE}/portfolio-auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(error => {
        console.log('Logout API call failed:', error);
    });
    
    // Show public portfolio view
    showPublicPortfolio();
    
    if (window.notifications) {
        window.notifications.success('Portfolio logout successful!');
    }
}

// Show portfolio management section
function showPortfolioManagement() {
    const authSection = document.getElementById('portfolio-auth-section');
    const registerSection = document.getElementById('portfolio-register-section');
    const managementSection = document.getElementById('portfolio-management-section');
    const publicSection = document.querySelector('.public-portfolio-section');
    
    if (authSection) authSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (managementSection) managementSection.style.display = 'block';
    if (publicSection) publicSection.style.display = 'none';
    
    // Update user info
    if (portfolioCurrentUser) {
        const userNameEl = document.getElementById('portfolio-user-name');
        if (userNameEl) userNameEl.textContent = portfolioCurrentUser.name;
    }
}

// Show public portfolio view
function showPublicPortfolio() {
    const authSection = document.getElementById('portfolio-auth-section');
    const registerSection = document.getElementById('portfolio-register-section');
    const managementSection = document.getElementById('portfolio-management-section');
    const publicSection = document.querySelector('.public-portfolio-section');
    
    if (authSection) authSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (managementSection) managementSection.style.display = 'none';
    if (publicSection) publicSection.style.display = 'block';
    
    // Load public portfolio data
    loadPublicPortfolioData();
}

// Check portfolio authentication status
function checkPortfolioAuthStatus() {
    const storedUser = sessionStorage.getItem('portfolioCurrentUser');
    if (storedUser) {
        try {
            portfolioCurrentUser = JSON.parse(storedUser);
            console.log('🔍 Portfolio user found in sessionStorage:', portfolioCurrentUser);
            showPortfolioManagement();
        } catch (error) {
            console.error('❌ Error parsing portfolio user:', error);
            sessionStorage.removeItem('portfolioCurrentUser');
            showPortfolioLogin(); // Show login/register form
        }
    } else {
        console.log('🔍 No portfolio user found, showing login/register form');
        showPortfolioLogin(); // Show login/register form instead of public portfolio
    }
}

// Load public portfolio data (for everyone to see)
async function loadPublicPortfolioData() {
    try {
        console.log('🔍 Loading public portfolio data...');
        
        // Load profile data for public view
        await loadPublicProfile();
        await loadPublicSkills();
        await loadPublicExperience();
        await loadPublicProjects();
        
    } catch (error) {
        console.error('❌ Error loading public portfolio data:', error);
    }
}

// Load public profile
async function loadPublicProfile() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch public profile');
        }
        
        const profile = await response.json();
        
        // Update public profile display
        const publicNameEl = document.getElementById('public-profile-name');
        const publicTitleEl = document.getElementById('public-profile-title');
        const publicBioEl = document.getElementById('public-profile-bio');
        const publicEmailEl = document.getElementById('public-profile-email');
        const publicPhoneEl = document.getElementById('public-profile-phone');
        const publicLocationEl = document.getElementById('public-profile-location');
        const publicWebsiteEl = document.getElementById('public-profile-website');
        const publicAvatarEl = document.getElementById('public-profile-avatar');
        
        if (publicNameEl) publicNameEl.textContent = profile.name || 'Professional Name';
        if (publicTitleEl) publicTitleEl.textContent = profile.title || 'Professional Title';
        if (publicBioEl) publicBioEl.textContent = profile.bio || 'Professional bio and description...';
        if (publicEmailEl) publicEmailEl.textContent = profile.email || 'email@example.com';
        if (publicPhoneEl) publicPhoneEl.textContent = profile.phone || '+1234567890';
        if (publicLocationEl) publicLocationEl.textContent = profile.location || 'City, Country';
        if (publicWebsiteEl) {
            publicWebsiteEl.textContent = profile.website || 'Website';
            publicWebsiteEl.href = profile.website || '#';
        }
        if (publicAvatarEl && profile.avatar) {
            publicAvatarEl.src = profile.avatar;
        }
        
    } catch (error) {
        console.error('❌ Error loading public profile:', error);
    }
}

// Load public skills
async function loadPublicSkills() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (!response.ok) {
            throw new Error('Failed to fetch public skills');
        }
        
        const skills = await response.json();
        const publicSkillsGrid = document.getElementById('public-skills-grid');
        
        if (!publicSkillsGrid) return;
        
        if (skills.length === 0) {
            publicSkillsGrid.innerHTML = `
                <div class="no-skills-message">
                    <i class="fas fa-cogs"></i>
                    <h3>No skills to display</h3>
                    <p>Skills will be shown here when added.</p>
                </div>
            `;
            return;
        }
        
        publicSkillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name || 'Unknown Skill'}</h4>
                    <span class="skill-level ${skill.level || 'beginner'}">${skill.level || 'Beginner'}</span>
                </div>
                <div class="skill-description">${skill.description || 'No description available'}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading public skills:', error);
    }
}

// Load public experience
async function loadPublicExperience() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (!response.ok) {
            throw new Error('Failed to fetch public experience');
        }
        
        const experience = await response.json();
        const publicExperienceTimeline = document.getElementById('public-experience-timeline');
        
        if (!publicExperienceTimeline) return;
        
        if (experience.length === 0) {
            publicExperienceTimeline.innerHTML = `
                <div class="no-experience-message">
                    <i class="fas fa-briefcase"></i>
                    <h3>No experience to display</h3>
                    <p>Work experience will be shown here when added.</p>
                </div>
            `;
            return;
        }
        
        publicExperienceTimeline.innerHTML = experience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position || 'Position'}</h4>
                    <div class="experience-dates">${exp.start_date || 'Start'} - ${exp.end_date || 'Present'}</div>
                </div>
                <div class="experience-company">${exp.company || 'Company'}</div>
                <div class="experience-description">${exp.description || 'No description available'}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading public experience:', error);
    }
}

// Load public projects
async function loadPublicProjects() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch public projects');
        }
        
        const projects = await response.json();
        const publicProjectsGrid = document.getElementById('public-projects-grid');
        
        if (!publicProjectsGrid) return;
        
        if (projects.length === 0) {
            publicProjectsGrid.innerHTML = `
                <div class="no-projects-message">
                    <i class="fas fa-project-diagram"></i>
                    <h3>No projects to display</h3>
                    <p>Projects will be shown here when added.</p>
                </div>
            `;
            return;
        }
        
        publicProjectsGrid.innerHTML = projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name || 'Project Name'}</h4>
                </div>
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <div class="project-description">${project.description || 'No description available'}</div>
                <div class="project-tech">${project.technologies || 'Technologies'}</div>
                ${project.link ? `<div class="project-link"><a href="${project.link}" target="_blank">View Project</a></div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Error loading public projects:', error);
    }
}

// Portfolio Management Functions

// Load portfolio data for authenticated user
async function loadPortfolioData() {
    try {
        console.log('🔍 Loading portfolio data for user:', portfolioCurrentUser);
        
        // Load profile data
        await loadProfile();
        
        // Load skills
        await loadSkills();
        
        // Load experience
        await loadExperience();
        
        // Load projects
        await loadProjects();
        
        // Update portfolio stats
        updatePortfolioStats();
        
    } catch (error) {
        console.error('❌ Error loading portfolio data:', error);
    }
}

// Load profile data for authenticated user
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const profile = await response.json();
        
        // Update profile display
        const nameEl = document.getElementById('profile-name-display');
        const titleEl = document.getElementById('profile-title-display');
        const bioEl = document.getElementById('profile-bio-display');
        const emailEl = document.getElementById('profile-email-display');
        const phoneEl = document.getElementById('profile-phone-display');
        const locationEl = document.getElementById('profile-location-display');
        const websiteEl = document.getElementById('profile-website-display');
        const avatarEl = document.getElementById('profile-avatar-img');
        
        if (nameEl) nameEl.textContent = profile.name || 'Your Name';
        if (titleEl) titleEl.textContent = profile.title || 'Professional Title';
        if (bioEl) bioEl.textContent = profile.bio || 'Your professional bio and description goes here...';
        if (emailEl) emailEl.textContent = profile.email || 'email@example.com';
        if (phoneEl) phoneEl.textContent = profile.phone || '+1234567890';
        if (locationEl) locationEl.textContent = profile.location || 'City, Country';
        if (websiteEl) {
            websiteEl.textContent = profile.website || 'Website';
            websiteEl.href = profile.website || '#';
        }
        if (avatarEl && profile.avatar) {
            avatarEl.src = profile.avatar;
        }
        
        // Update form fields
        const nameInput = document.getElementById('profile-name');
        const titleInput = document.getElementById('profile-title');
        const bioInput = document.getElementById('profile-bio');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const locationInput = document.getElementById('profile-location');
        const websiteInput = document.getElementById('profile-website');
        const categoryInput = document.getElementById('profile-category');
        
        if (nameInput) nameInput.value = profile.name || '';
        if (titleInput) titleInput.value = profile.title || '';
        if (bioInput) bioInput.value = profile.bio || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (phoneInput) phoneInput.value = profile.phone || '';
        if (locationInput) locationInput.value = profile.location || '';
        if (websiteInput) websiteInput.value = profile.website || '';
        if (categoryInput) categoryInput.value = profile.category || '';
        
    } catch (error) {
        console.error('❌ Error loading profile:', error);
    }
}

// Load skills for authenticated user
async function loadSkills() {
    try {
        console.log('🔍 Loading portfolio skills...');
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (!response.ok) {
            throw new Error('Failed to fetch skills');
        }
        
        const skills = await response.json();
        console.log('📊 Skills loaded:', skills);
        
        const skillsGrid = document.getElementById('skills-grid');
        if (!skillsGrid) {
            console.error('❌ Skills grid not found');
            return;
        }
        
        if (skills.length === 0) {
            skillsGrid.innerHTML = `
                <div class="no-skills-message">
                    <i class="fas fa-cogs"></i>
                    <h3>No skills added yet</h3>
                    <p>Add your skills to showcase your expertise!</p>
                    <button class="btn btn-primary" onclick="showAddSkillForm()">
                        <i class="fas fa-plus"></i> Add Your First Skill
                    </button>
                </div>
            `;
            return;
        }
        
        skillsGrid.innerHTML = skills.map(skill => {
            console.log('🔍 Rendering skill:', skill);
            return `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name || 'Unknown Skill'}</h4>
                    <span class="skill-level ${skill.level || 'beginner'}">${skill.level || 'Beginner'}</span>
                </div>
                <div class="skill-description">${skill.description || 'No description available'}</div>
                <div class="skill-actions">
                    <button class="btn btn-sm btn-outline" onclick="editSkill(${skill.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSkill(${skill.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
        console.log('✅ Skills rendered successfully');
        
    } catch (error) {
        console.error('❌ Error loading skills:', error);
    }
}

// Test function to add a sample skill for testing
async function addTestSkill() {
    try {
        console.log('🧪 Adding test skill...');
        const response = await fetch(`${API_BASE}/portfolio/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'JavaScript',
                level: 'advanced',
                category: 'technical',
                description: 'Advanced JavaScript programming skills'
            })
        });
        
        if (response.ok) {
            console.log('✅ Test skill added successfully');
            await loadSkills(); // Reload skills to show the new one
        } else {
            console.error('❌ Failed to add test skill');
        }
    } catch (error) {
        console.error('❌ Error adding test skill:', error);
    }
}

// Load experience for authenticated user
async function loadExperience() {
    try {
        console.log('🔍 Loading portfolio experience...');
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (!response.ok) {
            throw new Error('Failed to fetch experience');
        }
        
        const experience = await response.json();
        console.log('📊 Experience loaded:', experience);
        
        const experienceTimeline = document.getElementById('experience-timeline');
        if (!experienceTimeline) {
            console.error('❌ Experience timeline not found');
            return;
        }
        
        if (!experienceTimeline) return;
        
        if (experience.length === 0) {
            experienceTimeline.innerHTML = `
                <div class="no-experience-message">
                    <i class="fas fa-briefcase"></i>
                    <h3>No experience added yet</h3>
                    <p>Add your work experience to build your professional profile!</p>
                    <button class="btn btn-primary" onclick="showAddExperienceForm()">
                        <i class="fas fa-plus"></i> Add Your First Experience
                    </button>
                </div>
            `;
            return;
        }
        
        experienceTimeline.innerHTML = experience.map(exp => {
            console.log('🔍 Rendering experience:', exp);
            return `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position || 'Position'}</h4>
                    <div class="experience-dates">${exp.start_date || 'Start'} - ${exp.end_date || 'Present'}</div>
                </div>
                <div class="experience-company">${exp.company || 'Company'}</div>
                <div class="experience-description">${exp.description || 'No description available'}</div>
                <div class="experience-actions">
                    <button class="btn btn-sm btn-outline" onclick="editExperience(${exp.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteExperience(${exp.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error loading experience:', error);
    }
}

// Load projects for authenticated user
async function loadProjects() {
    try {
        console.log('🔍 Loading portfolio projects...');
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        const projects = await response.json();
        console.log('📊 Projects loaded:', projects);
        
        const projectsGrid = document.getElementById('projects-grid');
        if (!projectsGrid) {
            console.error('❌ Projects grid not found');
            return;
        }
        
        if (!projectsGrid) return;
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-projects-message">
                    <i class="fas fa-project-diagram"></i>
                    <h3>No projects added yet</h3>
                    <p>Add your projects to showcase your work!</p>
                    <button class="btn btn-primary" onclick="showAddProjectForm()">
                        <i class="fas fa-plus"></i> Add Your First Project
                    </button>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = projects.map(project => {
            console.log('🔍 Rendering project:', project);
            return `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name || 'Project Name'}</h4>
                </div>
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <div class="project-description">${project.description || 'No description available'}</div>
                <div class="project-tech">${project.technologies || 'Technologies'}</div>
                ${project.link ? `<div class="project-link"><a href="${project.link}" target="_blank">View Project</a></div>` : ''}
                <div class="project-actions">
                    <button class="btn btn-sm btn-outline" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        }).join('');
        
    } catch (error) {
        console.error('❌ Error loading projects:', error);
    }
}

// Update portfolio statistics
function updatePortfolioStats() {
    try {
        // This would typically fetch from API, but for now we'll update from current data
        const projectsGrid = document.getElementById('projects-grid');
        const skillsGrid = document.getElementById('skills-grid');
        
        const totalProjects = projectsGrid ? projectsGrid.querySelectorAll('.project-item').length : 0;
        const totalSkills = skillsGrid ? skillsGrid.querySelectorAll('.skill-item').length : 0;
        
        // Update UI
        const projectsEl = document.getElementById('total-projects');
        if (projectsEl) projectsEl.textContent = totalProjects;
        
        // Portfolio views would be tracked separately
        // For now, we'll use a placeholder
        const viewsEl = document.getElementById('portfolio-views');
        if (viewsEl) viewsEl.textContent = '0';
        
        const ratingEl = document.getElementById('portfolio-rating');
        if (ratingEl) ratingEl.textContent = '0';
        
    } catch (error) {
        console.error('❌ Error updating portfolio stats:', error);
    }
}

// Form management functions
function showAddSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        // Clear form
        document.getElementById('skill-name').value = '';
        document.getElementById('skill-level').value = '';
        document.getElementById('skill-category').value = '';
        document.getElementById('skill-description').value = '';
    }
}

function hideSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function showAddExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        // Clear form
        document.getElementById('exp-company').value = '';
        document.getElementById('exp-position').value = '';
        document.getElementById('exp-start-date').value = '';
        document.getElementById('exp-end-date').value = '';
        document.getElementById('exp-description').value = '';
    }
}

function hideExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function showAddProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        // Clear form
        document.getElementById('project-name').value = '';
        document.getElementById('project-description').value = '';
        document.getElementById('project-technologies').value = '';
        document.getElementById('project-link').value = '';
        document.getElementById('project-image').value = '';
    }
}

function hideProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

// CRUD operations for portfolio items
async function addSkill(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const skillData = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE}/portfolio/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(skillData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add skill');
        }
        
        hideSkillForm();
        await loadSkills();
        updatePortfolioStats();
        
        if (window.notifications) {
            window.notifications.success('Skill added successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error adding skill:', error);
        if (window.notifications) {
            window.notifications.error('Failed to add skill: ' + error.message);
        }
    }
}

async function addExperience(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const experienceData = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE}/portfolio/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(experienceData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add experience');
        }
        
        hideExperienceForm();
        await loadExperience();
        
        if (window.notifications) {
            window.notifications.success('Experience added successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error adding experience:', error);
        if (window.notifications) {
            window.notifications.error('Failed to add experience: ' + error.message);
        }
    }
}

async function addProject(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const projectData = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE}/portfolio/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        hideProjectForm();
        await loadProjects();
        updatePortfolioStats();
        
        if (window.notifications) {
            window.notifications.success('Project added successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error adding project:', error);
        if (window.notifications) {
            window.notifications.error('Failed to add project: ' + error.message);
        }
    }
}

async function updateProfile(event) {
    // Prevent double execution
    if (event) {
        event.preventDefault();
    }
    
    alert('Profile save button clicked!'); // Simple test alert
    console.log('🔍 Profile save button clicked!');
    
    try {
        // Get form data - handle both click and submit events
        let profileData;
        if (event && event.target) {
            // Form submission
            const formData = new FormData(event.target);
            profileData = Object.fromEntries(formData);
            console.log('📋 Form data from event:', event.target);
        } else {
            // Button click - get form manually
            const form = document.getElementById('edit-profile-form');
            if (form) {
                const formData = new FormData(form);
                profileData = Object.fromEntries(formData);
                console.log('📋 Form data from manual get:', profileData);
            }
        }
        
        console.log('📊 Profile data to save:', profileData);
        
        const response = await fetch(`${API_BASE}/portfolio/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        console.log('📡 Profile update response:', response);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Profile update failed:', errorData);
            throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const result = await response.json();
        console.log('✅ Profile update result:', result);
        
        // Hide form and reload profile
        const formContainer = document.getElementById('profile-form-container');
        if (formContainer) formContainer.style.display = 'none';
        
        await loadProfile();
        
        if (window.notifications) {
            window.notifications.success('Profile updated successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        if (window.notifications) {
            window.notifications.error('Failed to update profile: ' + error.message);
        }
    }
}

// Test function to verify profile save
async function testProfileSave() {
    console.log('🧪 Testing profile save...');
    
    const testProfileData = {
        name: 'Test User',
        title: 'Test Developer',
        bio: 'Test bio for profile',
        phone: '+1234567890',
        location: 'Test City',
        website: 'https://test.com',
        category: 'professional'
    };
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testProfileData)
        });
        
        console.log('📡 Test profile save response:', response);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Test profile save failed:', errorData);
            throw new Error(errorData.error || 'Failed to save test profile');
        }
        
        const result = await response.json();
        console.log('✅ Test profile save result:', result);
        
        if (window.notifications) {
            window.notifications.success('Test profile saved successfully!');
        }
        
        await loadProfile();
        
    } catch (error) {
        console.error('❌ Error testing profile save:', error);
        if (window.notifications) {
            window.notifications.error('Test profile save failed: ' + error.message);
        }
    }
}

// Test function to add a sample experience for testing
async function addTestExperience() {
    try {
        console.log('🧪 Adding test experience...');
        const response = await fetch(`${API_BASE}/portfolio/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                company: 'Test Company',
                position: 'Test Developer',
                start_date: '2023-01-01',
                end_date: '2023-12-31',
                description: 'Test experience description'
            })
        });
        
        if (response.ok) {
            console.log('✅ Test experience added successfully');
            await loadExperience(); // Reload experience to show new one
        } else {
            console.error('❌ Failed to add test experience');
        }
    } catch (error) {
        console.error('❌ Error adding test experience:', error);
    }
}

// Test function to add a sample project for testing
async function addTestProject() {
    try {
        console.log('🧪 Adding test project...');
        const response = await fetch(`${API_BASE}/portfolio/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Project',
                description: 'Test project description',
                technologies: 'JavaScript, React, Node.js',
                link: 'https://github.com/test/project',
                image: 'https://picsum.photos/seed/test-project/300/200.jpg'
            })
        });
        
        if (response.ok) {
            console.log('✅ Test project added successfully');
            await loadProjects(); // Reload projects to show new one
        } else {
            console.error('❌ Failed to add test project');
        }
    } catch (error) {
        console.error('❌ Error adding test project:', error);
    }
}

// Direct save function that uses the new minimal profile update system
async function saveProfileDirect(event) {
    // Prevent default form submission if called from onsubmit
    if (event) {
        event.preventDefault();
    }
    
    alert('Direct save button clicked!'); // Test alert
    console.log('🔍 Direct save button clicked!');
    
    try {
        // Get form data directly
        const form = document.getElementById('edit-profile-form');
        if (!form) {
            console.error('❌ Profile form not found');
            return;
        }
        
        console.log('🔍 Form element found:', form);
        
        // Get form values
        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData);
        console.log('📊 Form data from manual get:', profileData);
        console.log('📊 Form data details:', {
            name: profileData['profile-name'],
            title: profileData['profile-title'],
            bio: profileData['profile-bio'],
            email: profileData['profile-email'],
            phone: profileData['profile-phone'],
            location: profileData['profile-location'],
            website: profileData['profile-website'],
            category: profileData['profile-category']
        });
        
        // Validate required fields
        const requiredFields = ['profile-name', 'profile-title', 'profile-bio', 'profile-phone', 'profile-location', 'profile-website', 'profile-category'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
            console.error('❌ Missing required fields:', missingFields);
            alert('Missing required fields: ' + missingFields.join(', '));
            return;
        }
        
        // Transform form data to match minimal API expectations
        const apiData = {
            name: profileData['profile-name'],
            title: profileData['profile-title'],
            bio: profileData['profile-bio'],
            phone: profileData['profile-phone'],
            location: profileData['profile-location'],
            website: profileData['profile-website'],
            category: profileData['profile-category']
        };
        
        console.log('📊 API data to send:', apiData);
        console.log('🔍 Using NEW minimal profile update system');
        
        // Use the new minimal profile update system
        const response = await fetch(`${API_BASE}/portfolio/profile-minimal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiData)
        });
        
        console.log('📡 Profile update response (MINIMAL):', response);
        
        const responseText = await response.text();
        console.log('📡 Response text:', responseText);
        
        if (!response.ok) {
            const errorData = JSON.parse(responseText);
            console.error('❌ Profile update failed (MINIMAL):', errorData);
            throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const result = JSON.parse(responseText);
        console.log('✅ Profile update result (MINIMAL):', result);
        
        // Hide form and reload profile
        const formContainer = document.getElementById('profile-form-container');
        if (formContainer) formContainer.style.display = 'none';
        
        await loadProfile();
        
        if (window.notifications) {
            window.notifications.success('Profile updated successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error updating profile (MINIMAL):', error);
        if (window.notifications) {
            window.notifications.error('Failed to update profile: ' + error.message);
        }
    }
}

// Test function to verify profile API works with hardcoded data
async function testProfileAPI() {
    console.log('🧪 Testing profile API with hardcoded data...');
    
    const testData = {
        name: 'Test User',
        title: 'Test Developer',
        bio: 'Test bio for profile',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City',
        website: 'https://test.com',
        category: 'professional'
    };
    
    try {
        console.log('📊 Sending test data:', testData);
        
        const response = await fetch(`${API_BASE}/portfolio/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Test API response:', response);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        // Clone response to avoid stream conflicts
        const responseClone = response.clone();
        let errorData;
        let responseText;
        
        try {
            errorData = await responseClone.json();
            responseText = JSON.stringify(errorData);
        } catch (e) {
            responseText = await responseClone.text();
            try {
                errorData = JSON.parse(responseText);
            } catch (e2) {
                errorData = { error: responseText };
            }
        }
        
        if (!response.ok) {
            console.error('❌ Test API failed:', errorData);
            console.error('❌ Response text:', responseText);
            throw new Error(errorData.error || 'Test API failed');
        }
        
        const result = JSON.parse(responseText);
        console.log('✅ Test API result:', result);
        
        if (window.notifications) {
            window.notifications.success('Test API call successful!');
        }
        
    } catch (error) {
        console.error('❌ Error testing profile API:', error);
        if (window.notifications) {
            window.notifications.error('Test API failed: ' + error.message);
        }
    }
}

// MINIMAL PROFILE UPDATE TEST - COMPLETELY NEW APPROACH
async function testMinimalProfileUpdate() {
    console.log('🚀 TESTING MINIMAL PROFILE UPDATE');
    
    const minimalData = {
        name: 'Minimal Test User',
        title: 'Test Title',
        bio: 'Test Bio',
        phone: '+1234567890',
        location: 'Test Location',
        website: 'https://test.com',
        category: 'professional'
    };
    
    try {
        console.log('📊 Sending minimal data:', minimalData);
        
        const response = await fetch(`${API_BASE}/portfolio/profile-minimal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(minimalData)
        });
        
        console.log('📡 Minimal update response:', response);
        console.log('📡 Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📡 Response text:', responseText);
        
        if (!response.ok) {
            const errorData = JSON.parse(responseText);
            console.error('❌ Minimal update failed:', errorData);
            throw new Error(errorData.error || 'Minimal update failed');
        }
        
        const result = JSON.parse(responseText);
        console.log('✅ Minimal update result:', result);
        
        if (window.notifications) {
            window.notifications.success('Minimal profile update successful!');
        }
        
        // Reload profile to see changes
        await loadProfile();
        
    } catch (error) {
        console.error('❌ Error in minimal profile update:', error);
        if (window.notifications) {
            window.notifications.error('Minimal profile update failed: ' + error.message);
        }
    }
}

// Test function to check server health
async function testServerHealth() {
    console.log('🧪 Testing server health...');
    
    try {
        // Test both possible URLs
        const urls = [
            window.location.origin + '/health',
            'https://course-management-system.up.railway.app/health'
        ];
        
        for (const url of urls) {
            console.log('🔍 Testing URL:', url);
            try {
                const response = await fetch(url);
                console.log('📡 Health check response for', url, ':', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Health check successful for', url, ':', result);
                    if (window.notifications) {
                        window.notifications.success(`Server health check successful for: ${url}`);
                    }
                } else {
                    console.error('❌ Health check failed for', url, ':', response.status);
                }
            } catch (error) {
                console.error('❌ Health check error for', url, ':', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing server health:', error);
        if (window.notifications) {
            window.notifications.error('Server health test failed: ' + error.message);
        }
    }
}

// Test function to check API without database
async function testNoDatabase() {
    console.log('🧪 Testing API without database...');
    
    const testData = {
        name: 'Test User No DB',
        test: true
    };
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/test-no-db`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 No database test response:', response);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ No database test failed:', response.status);
            throw new Error('No database test failed');
        }
        
        const result = await response.json();
        console.log('✅ No database test result:', result);
        
        if (window.notifications) {
            window.notifications.success('No database test successful!');
        }
        
    } catch (error) {
        console.error('❌ Error testing no database API:', error);
        if (window.notifications) {
            window.notifications.error('No database test failed: ' + error.message);
        }
    }
}

// Basic test function to check if routing works
async function testBasicRouting() {
    console.log('🧪 Testing basic routing...');
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/test-basic`);
        console.log('📡 Basic test response:', response);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            console.error('❌ Basic test failed:', response.status);
            throw new Error('Basic test failed');
        }
        
        const result = await response.json();
        console.log('✅ Basic test result:', result);
        
        if (window.notifications) {
            window.notifications.success('Basic routing test successful!');
        }
        
    } catch (error) {
        console.error('❌ Error testing basic routing:', error);
        if (window.notifications) {
            window.notifications.error('Basic routing test failed: ' + error.message);
        }
    }
}

// Simple test function to use profile-simple endpoint
async function testProfileSimple() {
    console.log('🧪 Testing simple profile update...');
    
    const testData = {
        name: 'Simple Test User',
        title: 'Simple Test Developer',
        bio: 'Simple test bio for profile',
        phone: '+1234567890',
        location: 'Simple Test City',
        website: 'https://simple-test.com',
        category: 'professional'
    };
    
    try {
        console.log('📊 Sending simple test data:', testData);
        
        const response = await fetch(`${API_BASE}/portfolio/profile-simple`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Simple test API response:', response);
        console.log('📡 Response status:', response.status);
        
        const responseText = await response.text();
        
        if (!response.ok) {
            const errorData = JSON.parse(responseText);
            console.error('❌ Simple test API failed:', errorData);
            console.error('❌ Response text:', responseText);
            throw new Error(errorData.error || 'Simple test API failed');
        }
        
        const result = JSON.parse(responseText);
        console.log('✅ Simple test API result:', result);
        
        if (window.notifications) {
            window.notifications.success('Simple test API call successful!');
        }
        
    } catch (error) {
        console.error('❌ Error testing simple profile API:', error);
        if (window.notifications) {
            window.notifications.error('Simple test API failed: ' + error.message);
        }
    }
}

// Delete functions
async function deleteSkill(skillId) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills/${skillId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete skill');
        }
        
        await loadSkills();
        updatePortfolioStats();
        
        if (window.notifications) {
            window.notifications.success('Skill deleted successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error deleting skill:', error);
        if (window.notifications) {
            window.notifications.error('Failed to delete skill: ' + error.message);
        }
    }
}

async function deleteExperience(expId) {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience/${expId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete experience');
        }
        
        await loadExperience();
        
        if (window.notifications) {
            window.notifications.success('Experience deleted successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error deleting experience:', error);
        if (window.notifications) {
            window.notifications.error('Failed to delete experience: ' + error.message);
        }
    }
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete project');
        }
        
        await loadProjects();
        updatePortfolioStats();
        
        if (window.notifications) {
            window.notifications.success('Project deleted successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error deleting project:', error);
        if (window.notifications) {
            window.notifications.error('Failed to delete project: ' + error.message);
        }
    }
}

// Edit functions (placeholders for now)
function editSkill(skillId) {
    console.log('Edit skill:', skillId);
    // This would open an edit form with the skill data
    if (window.notifications) {
        window.notifications.info('Edit functionality coming soon!');
    }
}

function editExperience(expId) {
    console.log('Edit experience:', expId);
    // This would open an edit form with the experience data
    if (window.notifications) {
        window.notifications.info('Edit functionality coming soon!');
    }
}

function editProject(projectId) {
    console.log('Edit project:', projectId);
    // This would open an edit form with the project data
    if (window.notifications) {
        window.notifications.info('Edit functionality coming soon!');
    }
}

// Profile form management
function cancelProfileEdit() {
    const formContainer = document.getElementById('profile-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function uploadProfilePicture() {
    console.log('Upload profile picture');
    if (window.notifications) {
        window.notifications.info('Profile picture upload coming soon!');
    }
}

// CV Builder functions (placeholders)
function showCVBuilder() {
    console.log('Show CV builder');
    if (window.notifications) {
        window.notifications.info('CV Builder coming soon!');
    }
}

function hideCVBuilder() {
    console.log('Hide CV builder');
}

function generateCV() {
    console.log('Generate CV');
    if (window.notifications) {
        window.notifications.info('CV generation coming soon!');
    }
}

function downloadCV() {
    console.log('Download CV');
    if (window.notifications) {
        window.notifications.info('CV download coming soon!');
    }
}
const viewedBlogs = new Set();
const likedBlogs = new Set();

// Generate a simple session ID for anonymous users
function getSessionId() {
    if (!window.sessionStorage.getItem('blog_session_id')) {
        window.sessionStorage.setItem('blog_session_id', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    }
    return window.sessionStorage.getItem('blog_session_id');
}

// Toggle like on a blog post
async function toggleLike(blogId) {
    try {
        console.log('🔍 Toggling like for blog:', blogId);
        
        // Get current user info
        let userId = getSessionId(); // Use session ID for anonymous users
        let userName = 'Anonymous User';
        
        if (blogCurrentUser) {
            userId = blogCurrentUser.id;
            userName = blogCurrentUser.name;
        }
        
        console.log('🔍 User info for like:', { userId, userName });
        
        const response = await fetch(`${API_BASE}/blog-interactions/blogs/${blogId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                user_name: userName
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to toggle like');
        }
        
        const result = await response.json();
        console.log('✅ Like toggle result:', result);
        
        // Update UI
        updateLikeButton(blogId, result.liked, result.totalLikes);
        
        // Track liked blogs
        if (result.liked) {
            likedBlogs.add(blogId);
        } else {
            likedBlogs.delete(blogId);
        }
        
        // Update creator's stats in real-time
        await updateBlogStats();
        
        // Show notification
        if (window.notifications) {
            window.notifications.success(result.message);
        }
        
    } catch (error) {
        console.error('❌ Error toggling like:', error);
        if (window.notifications) {
            window.notifications.error('Failed to like blog post: ' + error.message);
        }
    }
}

// Update like button UI
function updateLikeButton(blogId, liked, totalLikes) {
    const likeBtn = document.getElementById(`like-btn-${blogId}`);
    const likeCount = document.querySelector(`.like-count-${blogId}`);
    const likeText = document.querySelector(`.like-text-${blogId}`);
    
    if (likeBtn) {
        if (liked) {
            likeBtn.classList.add('liked');
            likeBtn.classList.remove('btn-outline');
            likeBtn.classList.add('btn-primary');
        } else {
            likeBtn.classList.remove('liked');
            likeBtn.classList.add('btn-outline');
            likeBtn.classList.remove('btn-primary');
        }
    }
    
    if (likeCount) {
        likeCount.textContent = totalLikes;
    }
    
    if (likeText) {
        likeText.textContent = liked ? 'Liked' : 'Like';
    }
}

// Increment blog views (once per user per session)
async function incrementBlogViews(blogId) {
    try {
        // Check if this user has already viewed this blog in this session
        if (viewedBlogs.has(blogId)) {
            console.log('🔍 Blog already viewed in this session:', blogId);
            return;
        }
        
        console.log('🔍 Incrementing views for blog:', blogId);
        
        // Get user info
        let userId = getSessionId();
        let userName = 'Anonymous User';
        
        if (blogCurrentUser) {
            userId = blogCurrentUser.id;
            userName = blogCurrentUser.name;
        }
        
        const response = await fetch(`${API_BASE}/blog-interactions/blogs/${blogId}/views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                user_name: userName
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to increment views');
        }
        
        const result = await response.json();
        console.log('✅ Views incremented:', result);
        
        // Update view count in UI
        const viewCount = document.querySelector(`.view-count-${blogId}`);
        if (viewCount) {
            viewCount.textContent = result.views;
        }
        
        // Mark as viewed
        viewedBlogs.add(blogId);
        
        // Update creator's stats in real-time
        await updateBlogStats();
        
    } catch (error) {
        console.error('❌ Error incrementing views:', error);
        // Don't show error for views as it's not critical
    }
}

// Initialize like button states when blogs are loaded
function initializeLikeButtons() {
    // This would be called after loading blogs to set initial button states
    // For now, we'll rely on the server to tell us if a user has liked a blog
    console.log('🔍 Initializing like buttons...');
}

// Start real-time stats updates for authenticated users
function startRealTimeStatsUpdates() {
    if (!blogCurrentUser) {
        console.log('🔍 No authenticated user, skipping real-time stats');
        return;
    }
    
    console.log('🔍 Starting real-time stats updates for:', blogCurrentUser.username);
    
    // Update stats every 30 seconds
    setInterval(async () => {
        if (blogCurrentUser) {
            console.log('🔍 Updating real-time stats...');
            await updateBlogStats();
        }
    }, 30000); // 30 seconds
}

// Check if user has liked a blog (for UI initialization)
async function checkUserLikeStatus(blogId) {
    try {
        if (!blogCurrentUser) return false;
        
        // In a real implementation, you'd check against the database
        // For now, we'll use our local tracking
        return likedBlogs.has(blogId);
        
    } catch (error) {
        console.error('❌ Error checking like status:', error);
        return false;
    }
}

// Blog Management Functions
async function showCreateForm() {
    const formContainer = document.getElementById('blog-form-container');
    const toggleBtn = document.getElementById('toggle-blog-form');
    
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Form';
    } else {
        formContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Form';
    }
}

function toggleBlogForm() {
    showCreateForm();
}

function clearBlogForm() {
    document.getElementById('create-blog-form').reset();
}

// Fallback functions
function displayEmptyBlogPosts() {
    const postsGrid = document.getElementById('blog-posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-newspaper"></i>
                <h3>No blog posts yet</h3>
                <p>Start creating amazing content to share with the world!</p>
                <button class="btn btn-primary" onclick="showCreateForm()">
                    <i class="fas fa-plus"></i> Create Your First Post
                </button>
            </div>
        `;
    }
}

function displayEmptyPortfolio() {
    // Initialize portfolio sections with empty state
    const skillsGrid = document.getElementById('skills-grid');
    const experienceTimeline = document.getElementById('experience-timeline');
    const projectsGrid = document.getElementById('projects-grid');
    
    if (skillsGrid) {
        skillsGrid.innerHTML = `
            <div class="no-skills-message">
                <i class="fas fa-cogs"></i>
                <h3>No skills added yet</h3>
                <p>Add your skills to showcase your expertise!</p>
            </div>
        `;
    }
    
    if (experienceTimeline) {
        experienceTimeline.innerHTML = `
            <div class="no-experience-message">
                <i class="fas fa-briefcase"></i>
                <h3>No experience added yet</h3>
                <p>Add your work experience to build your professional profile!</p>
            </div>
        `;
    }
    
    if (projectsGrid) {
        projectsGrid.innerHTML = `
            <div class="no-projects-message">
                <i class="fas fa-project-diagram"></i>
                <h3>No projects added yet</h3>
                <p>Showcase your amazing work to potential employers!</p>
            </div>
        `;
    }
}

async function saveDraft() {
    try {
        const form = document.getElementById('create-blog-form');
        if (!form) {
            showMessage('blog-message', 'Form not found', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const draftData = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || '',
            status: 'draft'
        };
        
        if (!draftData.title || !draftData.content) {
            showMessage('blog-message', 'Please fill in at least title and content', 'error');
            return;
        }
        
        // Save to MySQL via API
        const response = await fetch(`${API_BASE}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(draftData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save draft');
        }
        
        showMessage('blog-message', 'Draft saved successfully!', 'success');
        await loadBlogPosts();
    } catch (error) {
        console.error('Error saving draft:', error);
        showMessage('blog-message', 'Failed to save draft. Please try again.', 'error');
    }
}

async function createBlogPost(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!blogCurrentUser) {
        if (window.notifications) {
            window.notifications.warning('Please login to create blog posts');
        }
        showBlogAuth();
        return;
    }
    
    console.log('🔍 createBlogPost function called');
    console.log('🔍 Current authenticated user:', blogCurrentUser);
    
    try {
        const formData = new FormData(e.target);
        const blogPost = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || '',
            status: 'published',
            created_by: blogCurrentUser.id,
            created_by_name: blogCurrentUser.name
        };
        
        console.log('🔍 Blog post data:', blogPost);
        
        if (!blogPost.title || !blogPost.content) {
            console.log('❌ Validation failed: missing title or content');
            if (window.notifications) {
                window.notifications.warning('Please fill in at least title and content');
            }
            return;
        }
        
        console.log('🔍 Sending API request to:', `${API_BASE}/blogs`);
        
        // Save to MySQL via API
        const response = await fetch(`${API_BASE}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogPost)
        });
        
        console.log('🔍 API response status:', response.status);
        console.log('🔍 API response ok:', response.ok);
        
        if (!response.ok) {
            // Clone response to avoid stream conflicts
            const responseClone = response.clone();
            const errorText = await responseClone.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`Failed to publish blog post: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('🔍 API Response data:', result);
        
        // Update stats
        updateBlogStats();
        
        // Clear form
        clearBlogForm();
        
        // Reload blogs
        await loadBlogPosts();
        await loadPublicBlogs();
        
        if (window.notifications) {
            window.notifications.success('Blog post published successfully!');
        }
        
        console.log('✅ Blog post created successfully');
        
    } catch (error) {
        console.error('❌ Error creating blog post:', error);
        if (window.notifications) {
            window.notifications.error('Failed to publish blog post: ' + error.message);
        }
    }
}

async function displayBlogPosts() {
    try {
        const postsGrid = document.getElementById('blog-posts-grid');
        if (!postsGrid) {
            console.error('Blog posts grid not found');
            return;
        }
        
        // Fetch blogs from MySQL API
        const response = await fetch(`${API_BASE}/blogs`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog posts');
        }
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            displayEmptyBlogPosts();
            return;
        }
        
        postsGrid.innerHTML = posts.map(post => {
            // Check if current user can manage this blog
            const canManage = canCurrentUserManageBlog(post);
            
            return `
            <div class="blog-post-card">
                <div class="blog-post-header">
                    <h4>${post.title || 'Untitled'}</h4>
                    <div class="blog-post-meta">
                        <span class="blog-category">${post.category || 'Uncategorized'}</span>
                        <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                        <span class="blog-status ${post.status}">${post.status || 'draft'}</span>
                        ${post.created_by_name ? `<span class="blog-author">By ${post.created_by_name}</span>` : ''}
                    </div>
                </div>
                ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-post-image">` : ''}
                <div class="blog-post-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No excerpt available')}</div>
                <div class="blog-post-footer">
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                    </div>
                    ${canManage ? `
                    <div class="blog-post-actions">
                        <button class="btn btn-primary" onclick="editBlogPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline" onclick="deleteBlogPost('${post.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error displaying blog posts:', error);
        displayEmptyBlogPosts();
    }
}

// Check if current user can manage a blog
function canCurrentUserManageBlog(blog) {
    // Get current user info
    let currentUser = null;
    if (window.sessionManager && window.sessionManager.isLoggedIn()) {
        currentUser = window.sessionManager.getCurrentUser();
    }
    
    // If no user is logged in (demo mode), allow all
    if (!currentUser) return true;
    
    // User can manage if they created the blog
    return blog.created_by === currentUser.id || blog.created_by === 'anonymous';
}

async function updateBlogStats() {
    try {
        // Only update stats if user is authenticated
        if (!blogCurrentUser) {
            console.log('🔍 No authenticated user, skipping blog stats update');
            return;
        }
        
        console.log('🔍 Updating blog stats for user:', blogCurrentUser.username);
        
        // Fetch user's blogs only
        const response = await fetch(`${API_BASE}/blogs?created_by=${blogCurrentUser.id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user blogs');
        }
        
        const userBlogs = await response.json();
        console.log('🔍 User blogs fetched:', userBlogs.length);
        
        // Calculate user-specific stats
        const totalPosts = userBlogs.length;
        const totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        const totalLikes = userBlogs.reduce((sum, blog) => sum + (blog.likes || 0), 0);
        
        console.log('🔍 User stats calculated:', { totalPosts, totalViews, totalLikes });
        
        // Update UI elements
        const totalPostsEl = document.getElementById('total-posts');
        const totalViewsEl = document.getElementById('total-views');
        const totalLikesEl = document.getElementById('total-likes');
        
        if (totalPostsEl) {
            totalPostsEl.textContent = totalPosts;
            console.log('✅ Updated total posts:', totalPosts);
        }
        
        if (totalViewsEl) {
            totalViewsEl.textContent = totalViews;
            console.log('✅ Updated total views:', totalViews);
        }
        
        if (totalLikesEl) {
            totalLikesEl.textContent = totalLikes;
            console.log('✅ Updated total likes:', totalLikes);
        }
        
    } catch (error) {
        console.error('❌ Error updating blog stats:', error);
        
        // Set default values on error
        const totalPostsEl = document.getElementById('total-posts');
        const totalViewsEl = document.getElementById('total-views');
        const totalLikesEl = document.getElementById('total-likes');
        
        if (totalPostsEl) totalPostsEl.textContent = '0';
        if (totalViewsEl) totalViewsEl.textContent = '0';
        if (totalLikesEl) totalLikesEl.textContent = '0';
    }
}

async function loadBlogPosts() {
    await displayBlogPosts();
}

// Message display function
function showMessage(elementId, message, type = 'info') {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) {
        console.error(`Message element ${elementId} not found`);
        return;
    }
    
    messageEl.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.innerHTML = '';
    }, 5000);
}

// Portfolio Functions
async function loadPortfolioData() {
    try {
        await loadProfile();
        await loadSkills();
        await loadExperience();
        await loadProjects();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        displayEmptyPortfolio();
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const profile = await response.json();
        
        // Update profile display
        const nameEl = document.getElementById('profile-name-display');
        const titleEl = document.getElementById('profile-title-display');
        const bioEl = document.getElementById('profile-bio-display');
        const emailEl = document.getElementById('profile-email-display');
        const phoneEl = document.getElementById('profile-phone-display');
        const locationEl = document.getElementById('profile-location-display');
        
        if (nameEl) nameEl.textContent = profile.name || 'Your Name';
        if (titleEl) titleEl.textContent = profile.title || 'Professional Title';
        if (bioEl) bioEl.textContent = profile.bio || 'Your professional bio and description goes here...';
        if (emailEl) emailEl.textContent = profile.email || 'email@example.com';
        if (phoneEl) phoneEl.textContent = profile.phone || '+1234567890';
        if (locationEl) locationEl.textContent = profile.location || 'City, Country';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadSkills() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (!response.ok) {
            throw new Error('Failed to fetch skills');
        }
        
        const skills = await response.json();
        const skillsGrid = document.getElementById('skills-grid');
        
        if (!skillsGrid) return;
        
        if (skills.length === 0) {
            skillsGrid.innerHTML = `
                <div class="no-skills-message">
                    <i class="fas fa-cogs"></i>
                    <h3>No skills added yet</h3>
                    <p>Add your skills to showcase your expertise!</p>
                </div>
            `;
            return;
        }
        
        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name || 'Unknown Skill'}</h4>
                    <span class="skill-level ${skill.level || 'beginner'}">${skill.level || 'Beginner'}</span>
                </div>
                <div class="skill-description">${skill.description || 'No description available'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

async function loadExperience() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (!response.ok) {
            throw new Error('Failed to fetch experience');
        }
        
        const experience = await response.json();
        const experienceTimeline = document.getElementById('experience-timeline');
        
        if (!experienceTimeline) return;
        
        if (experience.length === 0) {
            experienceTimeline.innerHTML = `
                <div class="no-experience-message">
                    <i class="fas fa-briefcase"></i>
                    <h3>No experience added yet</h3>
                    <p>Add your work experience to build your professional profile!</p>
                </div>
            `;
            return;
        }
        
        experienceTimeline.innerHTML = experience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position || 'Position'}</h4>
                    <div class="experience-dates">${exp.start_date || 'Start'} - ${exp.end_date || 'Present'}</div>
                </div>
                <div class="experience-company">${exp.company || 'Company'}</div>
                <div class="experience-description">${exp.description || 'No description available'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        const projects = await response.json();
        const projectsGrid = document.getElementById('projects-grid');
        
        if (!projectsGrid) return;
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-projects-message">
                    <i class="fas fa-project-diagram"></i>
                    <h3>No projects added yet</h3>
                    <p>Showcase your amazing work to potential employers!</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name || 'Project Name'}</h4>
                </div>
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <div class="project-description">${project.description || 'No description available'}</div>
                <div class="project-tech">${project.technologies || 'Technologies'}</div>
                ${project.link ? `<div class="project-link"><a href="${project.link}" target="_blank">View Project</a></div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function updatePortfolioStats() {
    // Update portfolio statistics if needed
    console.log('Portfolio stats updated');
}

// Edit and Delete functions
async function editBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        // Fetch blog post data
        const response = await fetch(`${API_BASE}/blogs/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to load blog post');
        }
        
        const post = await response.json();
        
        // Check if current user can manage this blog
        if (!canCurrentUserManageBlog(post)) {
            if (window.notifications) {
                window.notifications.error('You do not have permission to edit this blog');
            } else {
                alert('You do not have permission to edit this blog');
            }
            return;
        }
        
        // Populate form with post data
        const titleEl = document.getElementById('blog-title');
        const categoryEl = document.getElementById('blog-category');
        const excerptEl = document.getElementById('blog-excerpt');
        const contentEl = document.getElementById('blog-content');
        const tagsEl = document.getElementById('blog-tags');
        const imageEl = document.getElementById('blog-featured-image');
        
        if (titleEl) titleEl.value = post.title || '';
        if (categoryEl) categoryEl.value = post.category || '';
        if (excerptEl) excerptEl.value = post.excerpt || '';
        if (contentEl) contentEl.value = post.content || '';
        if (tagsEl) tagsEl.value = post.tags ? post.tags.join(', ') : '';
        if (imageEl) imageEl.value = post.featured_image || '';
        
        // Show form
        showCreateForm();
        
        // Change submit button to update
        const form = document.getElementById('create-blog-form');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                updateBlogPost(postId);
            };
        }
    } catch (error) {
        console.error('Error editing blog post:', error);
        showMessage('blog-message', 'Failed to load blog post for editing', 'error');
    }
}

async function updateBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        const form = document.getElementById('create-blog-form');
        const formData = new FormData(form);
        
        const updateData = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || ''
        };
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add user ID header if user is logged in
        if (currentUser) {
            headers['x-user-id'] = currentUser.id.toString();
        }
        
        const response = await fetch(`${API_BASE}/blogs/${postId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update blog post');
        }
        
        showMessage('blog-message', 'Blog post updated successfully!', 'success');
        await loadBlogPosts();
        
        // Reset form to original state
        form.onsubmit = createBlogPost;
        form.reset();
    } catch (error) {
        console.error('Error updating blog post:', error);
        showMessage('blog-message', 'Failed to update blog post', 'error');
    }
}

async function deleteBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        // First fetch the blog to check permissions
        const response = await fetch(`${API_BASE}/blogs/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to load blog post');
        }
        
        const post = await response.json();
        
        // Check if current user can manage this blog
        if (!canCurrentUserManageBlog(post)) {
            if (window.notifications) {
                window.notifications.error('You do not have permission to delete this blog');
            } else {
                alert('You do not have permission to delete this blog');
            }
            return;
        }
        
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            if (window.notifications) {
                window.notifications.confirm('Are you sure you want to delete this blog post?').then(resolve);
            } else {
                resolve(confirm('Are you sure you want to delete this blog post?'));
            }
        });
        
        if (!confirmed) return;
        
        // Prepare headers
        const headers = {};
        
        // Add user ID header if user is logged in
        if (currentUser) {
            headers['x-user-id'] = currentUser.id.toString();
        }
        
        // Proceed with deletion
        const deleteResponse = await fetch(`${API_BASE}/blogs/${postId}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (!deleteResponse.ok) {
            throw new Error('Failed to delete blog post');
        }
        
        if (window.notifications) {
            window.notifications.success('Blog post deleted successfully!');
        } else {
            showMessage('blog-message', 'Blog post deleted successfully!', 'success');
        }
        await loadBlogPosts();
    } catch (error) {
        console.error('Error deleting blog post:', error);
        if (window.notifications) {
            window.notifications.error('Failed to delete blog post');
        } else {
            showMessage('blog-message', 'Failed to delete blog post', 'error');
        }
    }
}

// Additional portfolio functions can be added here as needed

// Portfolio Form Functions
function showAddSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addSkill(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-skill-form');
        const formData = new FormData(form);
        
        const skillData = {
            name: formData.get('skill-name') || '',
            level: formData.get('skill-level') || 'beginner',
            category: formData.get('skill-category') || '',
            description: formData.get('skill-description') || ''
        };
        
        if (!skillData.name) {
            showMessage('portfolio-message', 'Please enter skill name', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(skillData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add skill');
        }
        
        showMessage('portfolio-message', 'Skill added successfully!', 'success');
        await loadSkills();
        form.reset();
        hideSkillForm();
    } catch (error) {
        console.error('Error adding skill:', error);
        showMessage('portfolio-message', 'Failed to add skill', 'error');
    }
}

function showAddExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addExperience(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-experience-form');
        const formData = new FormData(form);
        
        const experienceData = {
            company: formData.get('exp-company') || '',
            position: formData.get('exp-position') || '',
            start_date: formData.get('exp-start-date') || '',
            end_date: formData.get('exp-end-date') || '',
            description: formData.get('exp-description') || ''
        };
        
        if (!experienceData.company || !experienceData.position) {
            showMessage('portfolio-message', 'Please enter company and position', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(experienceData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add experience');
        }
        
        showMessage('portfolio-message', 'Experience added successfully!', 'success');
        await loadExperience();
        form.reset();
        hideExperienceForm();
    } catch (error) {
        console.error('Error adding experience:', error);
        showMessage('portfolio-message', 'Failed to add experience', 'error');
    }
}

function showAddProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addProject(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-project-form');
        const formData = new FormData(form);
        
        const projectData = {
            name: formData.get('project-name') || '',
            description: formData.get('project-description') || '',
            technologies: formData.get('project-tech') || '',
            link: formData.get('project-link') || '',
            image: formData.get('project-image') || ''
        };
        
        if (!projectData.name || !projectData.description) {
            showMessage('portfolio-message', 'Please enter project name and description', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        showMessage('portfolio-message', 'Project added successfully!', 'success');
        await loadProjects();
        form.reset();
        hideProjectForm();
    } catch (error) {
        console.error('Error adding project:', error);
        showMessage('portfolio-message', 'Failed to add project', 'error');
    }
}

function showCVBuilder() {
    const formContainer = document.getElementById('cv-builder-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Load existing CV data and profile data
        loadCVData();
        loadProfileDataForCV();
        updateCVPreview();
    }
}

async function loadCVData() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/cv`);
        if (response.ok) {
            const cvData = await response.json();
            
            // Populate form fields with existing data
            const summaryField = document.getElementById('cv-summary');
            const educationField = document.getElementById('cv-education');
            const certificationsField = document.getElementById('cv-certifications');
            const languagesField = document.getElementById('cv-languages');
            const referencesField = document.getElementById('cv-references');
            
            if (summaryField) summaryField.value = cvData.summary || '';
            if (educationField) educationField.value = cvData.education ? cvData.education.join('\n') : '';
            if (certificationsField) certificationsField.value = cvData.certifications ? cvData.certifications.join('\n') : '';
            if (languagesField) languagesField.value = cvData.languages ? cvData.languages.join('\n') : '';
            if (referencesField) referencesField.value = cvData.references ? cvData.references.join('\n') : '';
        }
    } catch (error) {
        console.error('Error loading CV data:', error);
    }
}

async function loadProfileDataForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (response.ok) {
            const profile = await response.json();
            
            // Update CV preview with profile data
            const namePreview = document.getElementById('cv-name-preview');
            const titlePreview = document.getElementById('cv-title-preview');
            const emailPreview = document.getElementById('cv-email-preview');
            const phonePreview = document.getElementById('cv-phone-preview');
            const locationPreview = document.getElementById('cv-location-preview');
            
            if (namePreview) namePreview.textContent = profile.name || 'Your Name';
            if (titlePreview) titlePreview.textContent = profile.title || 'Professional Title';
            if (emailPreview) emailPreview.textContent = profile.email || 'email@example.com';
            if (phonePreview) phonePreview.textContent = profile.phone || '+1234567890';
            if (locationPreview) locationPreview.textContent = profile.location || 'City, Country';
        }
    } catch (error) {
        console.error('Error loading profile data for CV:', error);
    }
}

function hideCVBuilder() {
    const formContainer = document.getElementById('cv-builder-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function updateCVPreview() {
    // Update CV preview with form data and existing portfolio data
    const summary = document.getElementById('cv-summary')?.value || '';
    const education = document.getElementById('cv-education')?.value || '';
    const certifications = document.getElementById('cv-certifications')?.value || '';
    const languages = document.getElementById('cv-languages')?.value || '';
    const references = document.getElementById('cv-references')?.value || '';
    
    // Update summary preview
    const summaryPreview = document.getElementById('cv-summary-preview');
    if (summaryPreview) summaryPreview.textContent = summary || 'Your professional summary will appear here...';
    
    // Update education preview
    const educationPreview = document.getElementById('cv-education-preview');
    if (educationPreview) {
        if (education) {
            const educationLines = education.split('\n').filter(line => line.trim());
            educationPreview.innerHTML = educationLines.map(line => `<p>${line}</p>`).join('');
        } else {
            educationPreview.textContent = 'Education details will appear here...';
        }
    }
    
    // Load and display skills from portfolio
    loadSkillsForCV();
    
    // Load and display experience from portfolio
    loadExperienceForCV();
}

async function loadSkillsForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (response.ok) {
            const skills = await response.json();
            const skillsPreview = document.getElementById('cv-skills-preview');
            if (skillsPreview) {
                if (skills.length > 0) {
                    skillsPreview.innerHTML = skills.map(skill => 
                        `<div class="cv-skill-item">
                            <strong>${skill.name}</strong> - ${skill.level}
                            ${skill.description ? `<br><small>${skill.description}</small>` : ''}
                        </div>`
                    ).join('');
                } else {
                    skillsPreview.textContent = 'Skills will be listed here...';
                }
            }
        }
    } catch (error) {
        console.error('Error loading skills for CV:', error);
    }
}

async function loadExperienceForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (response.ok) {
            const experience = await response.json();
            const experiencePreview = document.getElementById('cv-experience-preview');
            if (experiencePreview) {
                if (experience.length > 0) {
                    experiencePreview.innerHTML = experience.map(exp => 
                        `<div class="cv-experience-item">
                            <strong>${exp.position}</strong> at ${exp.company}<br>
                            <small>${exp.start_date} - ${exp.end_date || 'Present'}</small><br>
                            ${exp.description}
                        </div>`
                    ).join('');
                } else {
                    experiencePreview.textContent = 'Experience will be listed here...';
                }
            }
        }
    } catch (error) {
        console.error('Error loading experience for CV:', error);
    }
}

async function saveCV(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('cv-builder-form');
        const formData = new FormData(form);
        
        const cvData = {
            summary: formData.get('cv-summary') || '',
            education: formData.get('cv-education') ? formData.get('cv-education').split('\n').filter(line => line.trim()) : [],
            certifications: formData.get('cv-certifications') ? formData.get('cv-certifications').split('\n').filter(line => line.trim()) : [],
            languages: formData.get('cv-languages') ? formData.get('cv-languages').split('\n').filter(line => line.trim()) : [],
            references: formData.get('cv-references') ? formData.get('cv-references').split('\n').filter(line => line.trim()) : []
        };
        
        const response = await fetch(`${API_BASE}/portfolio/cv`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cvData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save CV');
        }
        
        showMessage('portfolio-message', 'CV saved successfully!', 'success');
        updateCVPreview();
    } catch (error) {
        console.error('Error saving CV:', error);
        showMessage('portfolio-message', 'Failed to save CV', 'error');
    }
}

function downloadCV() {
    // Generate and download CV as PDF
    const cvContent = generateCVContent();
    
    // Create a temporary blob and download
    const blob = new Blob([cvContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CV.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('portfolio-message', 'CV downloaded successfully!', 'success');
}

function printCV() {
    // Print CV with optimized styling
    const printContent = generateCVContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    showMessage('portfolio-message', 'CV print dialog opened!', 'success');
}

function generateCVContent() {
    const namePreview = document.getElementById('cv-name-preview')?.textContent || 'Your Name';
    const titlePreview = document.getElementById('cv-title-preview')?.textContent || 'Professional Title';
    const emailPreview = document.getElementById('cv-email-preview')?.textContent || 'email@example.com';
    const phonePreview = document.getElementById('cv-phone-preview')?.textContent || '+1234567890';
    const locationPreview = document.getElementById('cv-location-preview')?.textContent || 'City, Country';
    const summaryPreview = document.getElementById('cv-summary-preview')?.textContent || '';
    const educationPreview = document.getElementById('cv-education-preview')?.innerHTML || '';
    const skillsPreview = document.getElementById('cv-skills-preview')?.innerHTML || '';
    const experiencePreview = document.getElementById('cv-experience-preview')?.innerHTML || '';
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CV - ${namePreview}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .cv-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .cv-header h1 { margin: 0; font-size: 2.5em; }
                .cv-header p { margin: 5px 0; color: #666; }
                .cv-section { margin-bottom: 30px; }
                .cv-section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .cv-skill-item, .cv-experience-item { margin-bottom: 10px; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            <div class="cv-header">
                <h1>${namePreview}</h1>
                <p><strong>${titlePreview}</strong></p>
                <p>${emailPreview} | ${phonePreview} | ${locationPreview}</p>
            </div>
            
            <div class="cv-section">
                <h3>Professional Summary</h3>
                <p>${summaryPreview}</p>
            </div>
            
            <div class="cv-section">
                <h3>Skills</h3>
                ${skillsPreview}
            </div>
            
            <div class="cv-section">
                <h3>Experience</h3>
                ${experiencePreview}
            </div>
            
            <div class="cv-section">
                <h3>Education</h3>
                ${educationPreview}
            </div>
        </body>
        </html>
    `;
}

function uploadProfilePicture() {
    // Handle profile picture upload
    showMessage('portfolio-message', 'Profile picture upload feature coming soon!', 'info');
}

async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('edit-profile-form');
        const formData = new FormData(form);
        
        const profileData = {
            name: formData.get('profile-name') || '',
            title: formData.get('profile-title') || '',
            bio: formData.get('profile-bio') || '',
            email: formData.get('profile-email') || '',
            phone: formData.get('profile-phone') || '',
            location: formData.get('profile-location') || '',
            website: formData.get('profile-website') || ''
        };
        
        if (!profileData.name || !profileData.email) {
            showMessage('portfolio-message', 'Please enter name and email', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        showMessage('portfolio-message', 'Profile updated successfully!', 'success');
        await loadProfile();
        form.reset();
        hideProfileForm();
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('portfolio-message', 'Failed to update profile', 'error');
    }
}

function cancelProfileEdit() {
    const formContainer = document.getElementById('profile-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function generateCVContent() {
    const profile = portfolioData.profile;
    const skills = portfolioData.skills;
    const experience = portfolioData.experience;
    const projects = portfolioData.projects;
    const cv = portfolioData.cv || {};
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${profile.name} - Professional CV</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .name { font-size: 2.5em; font-weight: bold; margin: 0; }
                .title { font-size: 1.2em; color: #666; margin: 5px 0; }
                .contact { margin: 20px 0; }
                .section { margin: 30px 0; }
                .section h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .skills { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill { background: #f4f4f4; padding: 5px 10px; border-radius: 5px; }
                .experience { margin: 10px 0; }
                .job { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #333; }
                .projects { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .project { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="name">${profile.name}</div>
                <div class="title">${profile.title}</div>
                <div class="contact">
                    ${profile.email} | ${profile.phone} | ${profile.location}
                </div>
            </div>
            
            <div class="section">
                <h2>Professional Summary</h2>
                <p>${cv.summary || 'Experienced professional with a proven track record...'}</p>
            </div>
            
            <div class="section">
                <h2>Skills</h2>
                <div class="skills">
                    ${skills.map(skill => `<span class="skill">${skill.name} (${skill.level})</span>`).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>Experience</h2>
                <div class="experience">
                    ${experience.map(exp => `
                        <div class="job">
                            <strong>${exp.position}</strong> at ${exp.company}<br>
                            <small>${exp.startDate} - ${exp.endDate || 'Present'}</small><br><br>
                            ${exp.description}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>Projects</h2>
                <div class="projects">
                    ${projects.map(project => `
                        <div class="project">
                            <strong>${project.name}</strong><br>
                            <em>Technologies: ${project.tech}</em><br><br>
                            ${project.description}
                            ${project.link ? `<br><a href="${project.link}" target="_blank">View Project</a>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
}

function updatePortfolioDisplay() {
    // Update skills display
    const skillsGrid = document.getElementById('skills-grid');
    if (portfolioData.skills.length === 0) {
        skillsGrid.innerHTML = `
            <div class="no-skills-message">
                <i class="fas fa-cogs"></i>
                <h3>No skills added yet</h3>
                <p>Add your skills to showcase your expertise!</p>
                <button class="btn btn-primary" onclick="showAddSkillForm()">
                    <i class="fas fa-plus"></i> Add Your First Skill
                </button>
            </div>
        `;
    } else {
        skillsGrid.innerHTML = portfolioData.skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <span class="skill-level ${skill.level}">${skill.level}</span>
                </div>
                <button class="btn btn-outline" onclick="removeSkill(${skill.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update experience display
    const experienceTimeline = document.getElementById('experience-timeline');
    if (portfolioData.experience.length === 0) {
        experienceTimeline.innerHTML = `
            <div class="no-experience-message">
                <i class="fas fa-briefcase"></i>
                <h3>No experience added yet</h3>
                <p>Add your work experience to build your professional profile!</p>
                <button class="btn btn-primary" onclick="showAddExperienceForm()">
                    <i class="fas fa-plus"></i> Add Your First Experience
                </button>
            </div>
        `;
    } else {
        experienceTimeline.innerHTML = portfolioData.experience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position}</h4>
                    <span class="experience-company">${exp.company}</span>
                </div>
                <div class="experience-dates">
                    ${exp.startDate} - ${exp.endDate || 'Present'}
                </div>
                <div class="experience-description">
                    ${exp.description}
                </div>
                <button class="btn btn-outline" onclick="removeExperience(${exp.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update projects display
    const projectsGrid = document.getElementById('projects-grid');
    if (portfolioData.projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects-message">
                <i class="fas fa-project-diagram"></i>
                <h3>No projects added yet</h3>
                <p>Showcase your amazing work to potential employers!</p>
                <button class="btn btn-primary" onclick="showAddProjectForm()">
                    <i class="fas fa-plus"></i> Add Your First Project
                </button>
            </div>
        `;
    } else {
        projectsGrid.innerHTML = portfolioData.projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name}</h4>
                    <span class="project-tech">${project.tech}</span>
                </div>
                <div class="project-description">
                    ${project.description}
                </div>
                ${project.link ? `<div class="project-link">
                    <a href="${project.link}" target="_blank">
                        <i class="fas fa-external-link-alt"></i> View Project
                    </a>
                </div>` : ''}
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <button class="btn btn-outline" onclick="removeProject(${project.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update portfolio stats
    updatePortfolioStats();
}

function updatePortfolioStats() {
    portfolioData.stats.projects = portfolioData.projects.length;
    
    document.getElementById('portfolio-views').textContent = portfolioData.stats.views || 0;
    document.getElementById('total-projects').textContent = portfolioData.stats.projects;
    document.getElementById('portfolio-rating').textContent = portfolioData.stats.rating || 0;
}

function updateProfileDisplay() {
    const profile = portfolioData.profile;
    document.getElementById('profile-name-display').textContent = profile.name || 'Your Name';
    document.getElementById('profile-title-display').textContent = profile.title || 'Professional Title';
    document.getElementById('profile-bio-display').textContent = profile.bio || 'Your professional bio and description goes here...';
    document.getElementById('profile-email-display').textContent = profile.email || 'email@example.com';
    document.getElementById('profile-phone-display').textContent = profile.phone || '+1234567890';
    document.getElementById('profile-location-display').textContent = profile.location || 'City, Country';
    document.getElementById('profile-avatar-img').src = profile.avatar;
}

function cancelProfileEdit() {
    document.getElementById('profile-form-container').style.display = 'none';
    document.getElementById('profile-display').style.display = 'block';
}

function uploadProfilePicture() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                portfolioData.profile.avatar = e.target.result;
                updateProfileDisplay();
                
                // Save to localStorage
                localStorage.setItem('portfolioProfile', JSON.stringify(portfolioData.profile));
                
                showMessage('portfolio-message', 'Profile picture updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Initialize blog and portfolio functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for session manager to initialize
    if (window.sessionManager) {
        await window.sessionManager.init();
    }
    
    // Load saved data from secure session
    let savedBlogPosts = null;
    let savedPortfolioData = null;
    
    if (window.sessionManager) {
        savedBlogPosts = window.sessionManager.getBlogPosts();
        savedPortfolioData = window.sessionManager.getPortfolioData();
    }
    
    if (savedBlogPosts && savedBlogPosts.length > 0) {
        blogPosts = savedBlogPosts;
        displayBlogPosts();
        updateBlogStats();
    }
    
    if (savedPortfolioData && Object.keys(savedPortfolioData).length > 0) {
        portfolioData = savedPortfolioData;
        updatePortfolioDisplay();
        updateProfileDisplay();
    }
    
    // Add event listeners
    const blogForm = document.getElementById('create-blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', createBlogPost);
    }
    
    const toggleBlogBtn = document.getElementById('toggle-blog-form');
    if (toggleBlogBtn) {
        toggleBlogBtn.addEventListener('click', toggleBlogForm);
    }
    
    const skillForm = document.getElementById('add-skill-form');
    if (skillForm) {
        skillForm.addEventListener('submit', addSkill);
    }
    
    const experienceForm = document.getElementById('add-experience-form');
    if (experienceForm) {
        experienceForm.addEventListener('submit', addExperience);
    }
    
    const projectForm = document.getElementById('add-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', addProject);
    }
    
    const profileForm = document.getElementById('edit-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            portfolioData.profile = {
                ...portfolioData.profile,
                name: document.getElementById('profile-name').value,
                title: document.getElementById('profile-title').value,
                bio: document.getElementById('profile-bio').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                location: document.getElementById('profile-location').value,
                website: document.getElementById('profile-website').value,
                category: document.getElementById('profile-category').value
            };
            
            localStorage.setItem('portfolioProfile', JSON.stringify(portfolioData.profile));
            updateProfileDisplay();
            
            document.getElementById('profile-form-container').style.display = 'none';
            document.getElementById('profile-display').style.display = 'block';
            
            showMessage('portfolio-message', 'Profile updated successfully!', 'success');
        });
    }
    
    const toggleProfileBtn = document.getElementById('toggle-profile-form');
    if (toggleProfileBtn) {
        toggleProfileBtn.addEventListener('click', function() {
            const formContainer = document.getElementById('profile-form-container');
            const profileDisplay = document.getElementById('profile-display');
            
            if (formContainer.style.display === 'none' || formContainer.style.display === '') {
                formContainer.style.display = 'block';
                profileDisplay.style.display = 'none';
                toggleProfileBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Edit Profile';
            } else {
                formContainer.style.display = 'none';
                profileDisplay.style.display = 'block';
                toggleProfileBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Edit Profile';
            }
        });
    }
    
    // Blog search and filter
    const blogSearch = document.getElementById('blog-search');
    const blogCategoryFilter = document.getElementById('blog-filter-category');
    const blogStatusFilter = document.getElementById('blog-filter-status');
    
    if (blogSearch) {
        blogSearch.addEventListener('input', function() {
            filterBlogPosts();
        });
    }
    
    if (blogCategoryFilter) {
        blogCategoryFilter.addEventListener('change', filterBlogPosts);
    }
    
    if (blogStatusFilter) {
        blogStatusFilter.addEventListener('change', filterBlogPosts);
    }
});

function filterBlogPosts() {
    const searchTerm = document.getElementById('blog-search').value.toLowerCase();
    const categoryFilter = document.getElementById('blog-filter-category').value;
    const statusFilter = document.getElementById('blog-filter-status').value;
    
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || post.category === categoryFilter;
        const matchesStatus = !statusFilter || post.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Update display
    const postsGrid = document.getElementById('blog-posts-grid');
    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
    } else {
        postsGrid.innerHTML = filteredPosts.map(post => `
            <div class="blog-post-card">
                <div class="blog-post-header">
                    <h4>${post.title}</h4>
                    <div class="blog-post-meta">
                        <span class="blog-category">${post.category}</span>
                        <span class="blog-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                        <span class="blog-status ${post.status}">${post.status}</span>
                    </div>
                </div>
                ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="blog-post-image">` : ''}
                <div class="blog-post-excerpt">${post.excerpt || post.content.substring(0, 150) + '...'}</div>
                <div class="blog-post-footer">
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                    </div>
                    <div class="blog-post-actions">
                        <button class="btn btn-primary" onclick="editBlogPost(${post.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline" onclick="deleteBlogPost(${post.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// Text formatting functions for blog editor
function formatText(command) {
    const textarea = document.getElementById('blog-content');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch(command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        default:
            formattedText = selectedText;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        const textarea = document.getElementById('blog-content');
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const linkText = selectedText || prompt('Enter link text:') || url;
        
        const linkMarkdown = `[${linkText}](${url})`;
        textarea.value = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);
        textarea.focus();
    }
}

function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        const textarea = document.getElementById('blog-content');
        if (!textarea) return;
        
        const alt = prompt('Enter alt text:') || '';
        const imageMarkdown = `![${alt}](${url})`;
        
        const start = textarea.selectionStart;
        textarea.value = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(start);
        textarea.focus();
    }
}

function previewBlogPost() {
    const title = document.getElementById('blog-title')?.value || '';
    const content = document.getElementById('blog-content')?.value || '';
    const excerpt = document.getElementById('blog-excerpt')?.value || '';
    const featuredImage = document.getElementById('blog-featured-image')?.value || '';
    
    if (!title && !content) {
        if (window.notifications) {
            window.notifications.warning('Please add some content to preview');
        } else {
            alert('Please add some content to preview');
        }
        return;
    }
    
    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.className = 'modal';
    previewModal.style.display = 'block';
    previewModal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> Blog Post Preview</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="blog-preview">
                    ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="blog-preview-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
                    <h1 class="blog-preview-title">${title || 'Untitled'}</h1>
                    ${excerpt ? `<p class="blog-preview-excerpt" style="color: #666; font-style: italic; margin-bottom: 20px;">${excerpt}</p>` : ''}
                    <div class="blog-preview-content" style="line-height: 1.6; white-space: pre-wrap;">${content || 'No content'}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close Preview</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(previewModal);
    
    // Close on outside click
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            previewModal.remove();
        }
    });
}

// Make functions globally accessible for HTML onclick handlers
window.createBlogPost = createBlogPost;
window.saveDraft = saveDraft;
window.clearBlogForm = clearBlogForm;
window.editBlogPost = editBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.formatText = formatText;
window.insertLink = insertLink;
window.insertImage = insertImage;
window.toggleBlogForm = toggleBlogForm;
window.previewBlogPost = previewBlogPost;
window.viewFullBlogPost = viewFullBlogPost;
window.refreshPublicBlogs = refreshPublicBlogs;
window.handleBlogLogin = handleBlogLogin;
window.handleBlogRegister = handleBlogRegister;
window.handleBlogLogout = handleBlogLogout;
window.showBlogRegister = showBlogRegister;
window.showBlogLogin = showBlogLogin;
window.toggleLike = toggleLike;
window.incrementBlogViews = incrementBlogViews;
window.updateBlogStats = updateBlogStats;
window.startRealTimeStatsUpdates = startRealTimeStatsUpdates;

// Portfolio authentication functions
window.showPortfolioLogin = showPortfolioLogin;
window.showPortfolioRegister = showPortfolioRegister;
window.handlePortfolioLogin = handlePortfolioLogin;
window.handlePortfolioRegister = handlePortfolioRegister;
window.handlePortfolioLogout = handlePortfolioLogout;
window.showPortfolioManagement = showPortfolioManagement;
window.showPublicPortfolio = showPublicPortfolio;
window.checkPortfolioAuthStatus = checkPortfolioAuthStatus;
window.loadPublicPortfolioData = loadPublicPortfolioData;
window.loadPublicProfile = loadPublicProfile;
window.loadPublicSkills = loadPublicSkills;
window.loadPublicExperience = loadPublicExperience;
window.loadPublicProjects = loadPublicProjects;

// Portfolio management functions
window.loadPortfolioData = loadPortfolioData;
window.loadProfile = loadProfile;
window.loadSkills = loadSkills;
window.loadExperience = loadExperience;
window.loadProjects = loadProjects;
window.updatePortfolioStats = updatePortfolioStats;
window.showAddSkillForm = showAddSkillForm;
window.hideSkillForm = hideSkillForm;
window.showAddExperienceForm = showAddExperienceForm;
window.hideExperienceForm = hideExperienceForm;
window.showAddProjectForm = showAddProjectForm;
window.hideProjectForm = hideProjectForm;
window.addSkill = addSkill;
window.addExperience = addExperience;
window.addProject = addProject;
window.updateProfile = updateProfile;
window.deleteSkill = deleteSkill;
window.deleteExperience = deleteExperience;
window.deleteProject = deleteProject;
window.editSkill = editSkill;
window.editExperience = editExperience;
window.editProject = editProject;
window.cancelProfileEdit = cancelProfileEdit;
window.addTestSkill = addTestSkill;
window.testProfileSave = testProfileSave;
window.addTestExperience = addTestExperience;
window.addTestProject = addTestProject;
window.saveProfileDirect = saveProfileDirect;
window.testProfileAPI = testProfileAPI;
window.testProfileSimple = testProfileSimple;
window.testBasicRouting = testBasicRouting;
window.testNoDatabase = testNoDatabase;
window.testServerHealth = testServerHealth;
window.testMinimalProfileUpdate = testMinimalProfileUpdate;
window.uploadProfilePicture = uploadProfilePicture;
window.showCVBuilder = showCVBuilder;
window.hideCVBuilder = hideCVBuilder;
window.generateCV = generateCV;
window.downloadCV = downloadCV;

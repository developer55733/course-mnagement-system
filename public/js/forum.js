// Discussion Forum JavaScript
class ForumManager {
    constructor() {
        this.categories = [];
        this.posts = [];
        this.currentCategory = null;
        this.currentPost = null;
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadPosts();
        this.setupEventListeners();
        this.renderCategories();
        this.renderPosts();
    }

    // Load forum categories
    async loadCategories() {
        try {
            const response = await fetch('/api/forum/categories');
            const data = await response.json();
            if (data.success) {
                this.categories = data.categories;
            }
        } catch (error) {
            console.error('Error loading forum categories:', error);
        }
    }

    // Load forum posts
    async loadPosts(categoryId = null) {
        try {
            const url = categoryId ? 
                `/api/forum/categories/${categoryId}/posts` : 
                '/api/forum/posts';
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                this.posts = data.posts;
            }
        } catch (error) {
            console.error('Error loading forum posts:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // New post button
        document.getElementById('new-post-btn')?.addEventListener('click', () => {
            this.showNewPostModal();
        });

        // Search forum
        document.getElementById('search-forum-btn')?.addEventListener('click', () => {
            this.searchForum();
        });

        document.getElementById('forum-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchForum();
            }
        });

        // New post form
        document.getElementById('new-post-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPost();
        });

        // Submit reply form
        document.getElementById('submit-reply-btn')?.addEventListener('click', () => {
            this.submitReply();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.closest('.modal'));
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    // Render categories
    renderCategories() {
        const container = document.getElementById('forum-categories');
        if (!container) return;

        const html = `
            <div class="category-grid">
                <div class="category-card ${this.currentCategory === null ? 'active' : ''}" data-category="all">
                    <div class="category-icon">
                        <i class="fas fa-th"></i>
                    </div>
                    <div class="category-info">
                        <h4>All Posts</h4>
                        <p>View all forum posts</p>
                    </div>
                </div>
                ${this.categories.map(category => `
                    <div class="category-card ${this.currentCategory === category.id ? 'active' : ''}" 
                         data-category="${category.id}">
                        <div class="category-icon" style="color: ${category.color}">
                            <i class="fas ${category.icon}"></i>
                        </div>
                        <div class="category-info">
                            <h4>${category.name}</h4>
                            <p>${category.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;

        // Add click listeners to category cards
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.category === 'all' ? null : parseInt(card.dataset.category);
                this.selectCategory(categoryId);
            });
        });
    }

    // Render posts
    renderPosts() {
        const container = document.getElementById('forum-posts');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-comments"></i>
                    <h3>No Posts Yet</h3>
                    <p>Be the first to start a discussion!</p>
                    <button class="btn btn-primary" onclick="forumManager.showNewPostModal()">
                        <i class="fas fa-plus"></i> Create First Post
                    </button>
                </div>
            `;
            return;
        }

        const html = this.posts.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-category" style="background-color: ${post.category_color}20; color: ${post.category_color}">
                        <i class="fas fa-tag"></i> ${post.category_name}
                    </div>
                    <div class="post-meta">
                        <span class="post-author">
                            <i class="fas fa-user"></i> ${post.author_name}
                        </span>
                        <span class="post-date">
                            <i class="fas fa-clock"></i> ${new Date(post.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div class="post-content">
                    <h3 class="post-title">
                        ${post.is_pinned ? '<i class="fas fa-thumbtack"></i> ' : ''}
                        ${post.title}
                    </h3>
                    <p class="post-excerpt">${this.truncateText(post.content, 150)}</p>
                    ${post.module_code ? `
                        <div class="post-module">
                            <i class="fas fa-book"></i> ${post.module_code}
                        </div>
                    ` : ''}
                </div>
                <div class="post-footer">
                    <div class="post-stats">
                        <span class="post-views">
                            <i class="fas fa-eye"></i> ${post.views} views
                        </span>
                        <span class="post-replies">
                            <i class="fas fa-reply"></i> ${post.reply_count} replies
                        </span>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="forumManager.viewPost(${post.id})">
                        <i class="fas fa-arrow-right"></i> Read More
                    </button>
                </div>
                ${post.is_locked ? `
                    <div class="post-locked">
                        <i class="fas fa-lock"></i> Locked
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Select category
    async selectCategory(categoryId) {
        this.currentCategory = categoryId;
        await this.loadPosts(categoryId);
        this.renderCategories();
        this.renderPosts();
    }

    // Show new post modal
    showNewPostModal() {
        const modal = document.getElementById('new-post-modal');
        const categorySelect = document.getElementById('post-category');
        
        // Populate categories
        categorySelect.innerHTML = `
            <option value="">Select a category</option>
            ${this.categories.map(cat => `
                <option value="${cat.id}">${cat.name}</option>
            `).join('')}
        `;
        
        modal.style.display = 'block';
    }

    // Create new post
    async createPost() {
        const form = document.getElementById('new-post-form');
        const formData = new FormData(form);
        
        try {
            const postData = {
                categoryId: parseInt(formData.get('category')),
                title: formData.get('title'),
                content: formData.get('content'),
                moduleCode: formData.get('module') || null
            };

            const response = await fetch('/api/forum/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Post created successfully!', 'success');
                this.closeModal(document.getElementById('new-post-modal'));
                await this.loadPosts(this.currentCategory);
                this.renderPosts();
                form.reset();
            } else {
                this.showMessage(result.error || 'Failed to create post', 'error');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showMessage('Error creating post', 'error');
        }
    }

    // View post details
    async viewPost(postId) {
        try {
            const response = await fetch(`/api/forum/posts/${postId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentPost = data.post;
                this.renderPostDetail();
                document.getElementById('post-modal').style.display = 'block';
            } else {
                this.showMessage('Post not found', 'error');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            this.showMessage('Error loading post', 'error');
        }
    }

    // Render post detail
    renderPostDetail() {
        if (!this.currentPost) return;

        const container = document.getElementById('post-detail');
        const modalTitle = document.getElementById('modal-post-title');
        
        modalTitle.textContent = this.currentPost.title;
        
        container.innerHTML = `
            <div class="post-detail-header">
                <div class="post-detail-meta">
                    <span class="post-category" style="background-color: ${this.currentPost.category_color}20; color: ${this.currentPost.category_color}">
                        <i class="fas fa-tag"></i> ${this.currentPost.category_name}
                    </span>
                    <span class="post-author">
                        <i class="fas fa-user"></i> ${this.currentPost.author_name}
                    </span>
                    <span class="post-date">
                        <i class="fas fa-clock"></i> ${new Date(this.currentPost.created_at).toLocaleString()}
                    </span>
                    ${this.currentPost.is_pinned ? '<span class="post-pinned"><i class="fas fa-thumbtack"></i> Pinned</span>' : ''}
                    ${this.currentPost.is_locked ? '<span class="post-locked"><i class="fas fa-lock"></i> Locked</span>' : ''}
                </div>
                ${this.currentPost.module_code ? `
                    <div class="post-module">
                        <i class="fas fa-book"></i> ${this.currentPost.module_code}
                    </div>
                ` : ''}
            </div>
            <div class="post-detail-content">
                <div class="post-content-full">${this.formatContent(this.currentPost.content)}</div>
            </div>
            <div class="post-detail-stats">
                <span class="post-views">
                    <i class="fas fa-eye"></i> ${this.currentPost.views} views
                </span>
                <span class="post-replies">
                    <i class="fas fa-reply"></i> ${this.currentPost.replies.length} replies
                </span>
            </div>
            <div class="replies-section">
                <h4>Replies (${this.currentPost.replies.length})</h4>
                <div class="replies-list">
                    ${this.currentPost.replies.map(reply => `
                        <div class="reply-card" data-reply-id="${reply.id}">
                            <div class="reply-header">
                                <span class="reply-author">
                                    <i class="fas fa-user"></i> ${reply.author_name}
                                </span>
                                <span class="reply-date">
                                    <i class="fas fa-clock"></i> ${new Date(reply.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div class="reply-content">
                                ${this.formatContent(reply.content)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Hide reply section if post is locked
        const replySection = document.querySelector('.reply-section');
        if (this.currentPost.is_locked) {
            replySection.style.display = 'none';
        } else {
            replySection.style.display = 'block';
        }
    }

    // Submit reply
    async submitReply() {
        if (!this.currentPost) return;

        const content = document.getElementById('reply-content').value.trim();
        
        if (!content) {
            this.showMessage('Reply content is required', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/forum/posts/${this.currentPost.id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Reply added successfully!', 'success');
                document.getElementById('reply-content').value = '';
                // Reload post to show new reply
                await this.viewPost(this.currentPost.id);
            } else {
                this.showMessage(result.error || 'Failed to add reply', 'error');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            this.showMessage('Error adding reply', 'error');
        }
    }

    // Search forum
    async searchForum() {
        const query = document.getElementById('forum-search').value.trim();
        
        if (!query) {
            await this.loadPosts(this.currentCategory);
            this.renderPosts();
            return;
        }

        try {
            const response = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                this.posts = data.posts;
                this.renderPosts();
            } else {
                this.showMessage('Search failed', 'error');
            }
        } catch (error) {
            console.error('Error searching forum:', error);
            this.showMessage('Error searching forum', 'error');
        }
    }

    // Close modal
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // Utility functions
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatContent(content) {
        // Simple formatting - replace newlines with <br>
        return content.replace(/\n/g, '<br>');
    }
}

// Initialize forum manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.forumManager = new ForumManager();
});

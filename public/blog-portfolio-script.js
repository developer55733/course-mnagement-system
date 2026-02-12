// Blog and Portfolio Management JavaScript

// Blog Management Variables
let blogPosts = [];
let blogStats = {
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0
};

// Portfolio Management Variables
let portfolioData = {
    profile: {
        name: '',
        title: '',
        bio: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        category: '',
        avatar: 'https://picsum.photos/seed/portfolio-avatar/200/200.jpg'
    },
    skills: [],
    experience: [],
    projects: [],
    stats: {
        views: 0,
        projects: 0,
        rating: 0
    }
};

// Blog Management Functions
function showCreateForm() {
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

function saveDraft() {
    const formData = new FormData(document.getElementById('create-blog-form'));
    const draftData = {
        title: formData.get('blog-title'),
        category: formData.get('blog-category'),
        excerpt: formData.get('blog-excerpt'),
        content: formData.get('blog-content'),
        tags: formData.get('blog-tags'),
        featuredImage: formData.get('blog-featured-image'),
        status: 'draft',
        createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    let drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    drafts.push(draftData);
    localStorage.setItem('blogDrafts', JSON.stringify(drafts));
    
    showMessage('blog-message', 'Draft saved successfully!', 'success');
}

function createBlogPost(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const blogPost = {
        id: Date.now(),
        title: formData.get('blog-title'),
        category: formData.get('blog-category'),
        excerpt: formData.get('blog-excerpt'),
        content: formData.get('blog-content'),
        tags: formData.get('blog-tags').split(',').map(tag => tag.trim()),
        featuredImage: formData.get('blog-featured-image'),
        status: 'published',
        createdAt: new Date().toISOString(),
        views: 0,
        likes: 0
    };
    
    // Save to localStorage
    let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    posts.unshift(blogPost);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    
    // Update stats
    updateBlogStats();
    
    // Display posts
    displayBlogPosts();
    
    // Clear form
    e.target.reset();
    
    showMessage('blog-message', 'Blog post published successfully!', 'success');
}

function displayBlogPosts() {
    const postsGrid = document.getElementById('blog-posts-grid');
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    if (posts.length === 0) {
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
        return;
    }
    
    postsGrid.innerHTML = posts.map(post => `
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
                    <span><i class="fas fa-eye"></i> ${post.views}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
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

function updateBlogStats() {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    
    document.getElementById('total-posts').textContent = posts.length;
    document.getElementById('total-views').textContent = totalViews;
    document.getElementById('total-likes').textContent = totalLikes;
}

function editBlogPost(postId) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        // Populate form with post data
        document.getElementById('blog-title').value = post.title;
        document.getElementById('blog-category').value = post.category;
        document.getElementById('blog-excerpt').value = post.excerpt;
        document.getElementById('blog-content').value = post.content;
        document.getElementById('blog-tags').value = post.tags.join(', ');
        document.getElementById('blog-featured-image').value = post.featuredImage;
        
        // Show form
        showCreateForm();
        
        // Change submit button to update
        const form = document.getElementById('create-blog-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            updateBlogPost(postId);
        };
    }
}

function updateBlogPost(postId) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
        posts[postIndex] = {
            ...posts[postIndex],
            title: document.getElementById('blog-title').value,
            category: document.getElementById('blog-category').value,
            excerpt: document.getElementById('blog-excerpt').value,
            content: document.getElementById('blog-content').value,
            tags: document.getElementById('blog-tags').value.split(',').map(tag => tag.trim()),
            featuredImage: document.getElementById('blog-featured-image').value,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        displayBlogPosts();
        updateBlogStats();
        
        showMessage('blog-message', 'Blog post updated successfully!', 'success');
    }
}

function deleteBlogPost(postId) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const filteredPosts = posts.filter(p => p.id !== postId);
        
        localStorage.setItem('blogPosts', JSON.stringify(filteredPosts));
        displayBlogPosts();
        updateBlogStats();
        
        showMessage('blog-message', 'Blog post deleted successfully!', 'success');
    }
}

// Portfolio Management Functions
function showAddSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}

function hideSkillForm() {
    document.getElementById('skills-form-container').style.display = 'none';
    document.getElementById('add-skill-form').reset();
}

function addSkill(e) {
    e.preventDefault();
    
    const skill = {
        id: Date.now(),
        name: document.getElementById('skill-name').value,
        level: document.getElementById('skill-level').value,
        category: document.getElementById('skill-category').value
    };
    
    portfolioData.skills.push(skill);
    updatePortfolioDisplay();
    
    e.target.reset();
    hideSkillForm();
    
    showMessage('portfolio-message', 'Skill added successfully!', 'success');
}

function removeSkill(skillId) {
    if (confirm('Are you sure you want to remove this skill?')) {
        portfolioData.skills = portfolioData.skills.filter(skill => skill.id !== skillId);
        updatePortfolioDisplay();
        
        showMessage('portfolio-message', 'Skill removed successfully!', 'success');
    }
}

function showAddExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}

function hideExperienceForm() {
    document.getElementById('experience-form-container').style.display = 'none';
    document.getElementById('add-experience-form').reset();
}

function addExperience(e) {
    e.preventDefault();
    
    const experience = {
        id: Date.now(),
        company: document.getElementById('exp-company').value,
        position: document.getElementById('exp-position').value,
        startDate: document.getElementById('exp-start-date').value,
        endDate: document.getElementById('exp-end-date').value,
        description: document.getElementById('exp-description').value
    };
    
    portfolioData.experience.push(experience);
    updatePortfolioDisplay();
    
    e.target.reset();
    hideExperienceForm();
    
    showMessage('portfolio-message', 'Experience added successfully!', 'success');
}

function removeExperience(expId) {
    if (confirm('Are you sure you want to remove this experience?')) {
        portfolioData.experience = portfolioData.experience.filter(exp => exp.id !== expId);
        updatePortfolioDisplay();
        
        showMessage('portfolio-message', 'Experience removed successfully!', 'success');
    }
}

function showAddProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}

function hideProjectForm() {
    document.getElementById('project-form-container').style.display = 'none';
    document.getElementById('add-project-form').reset();
}

function addProject(e) {
    e.preventDefault();
    
    const project = {
        id: Date.now(),
        name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        tech: document.getElementById('project-tech').value,
        link: document.getElementById('project-link').value,
        image: document.getElementById('project-image').value
    };
    
    portfolioData.projects.push(project);
    updatePortfolioDisplay();
    
    e.target.reset();
    hideProjectForm();
    
    showMessage('portfolio-message', 'Project added successfully!', 'success');
}

function removeProject(projectId) {
    if (confirm('Are you sure you want to remove this project?')) {
        portfolioData.projects = portfolioData.projects.filter(project => project.id !== projectId);
        updatePortfolioDisplay();
        
        showMessage('portfolio-message', 'Project removed successfully!', 'success');
    }
}

function showCVBuilder() {
    const formContainer = document.getElementById('cv-builder-container');
    formContainer.style.display = formContainer.style.display === 'none' ? 'grid' : 'none';
}

function hideCVBuilder() {
    document.getElementById('cv-builder-container').style.display = 'none';
}

function updateCVPreview() {
    const summary = document.getElementById('cv-summary').value;
    const education = document.getElementById('cv-education').value;
    
    // Update preview
    document.getElementById('cv-summary-preview').textContent = summary || 'Your professional summary will appear here...';
    document.getElementById('cv-education-preview').textContent = education || 'Education details will appear here...';
    
    // Update CV data
    portfolioData.cv = { summary, education };
    
    showMessage('portfolio-message', 'CV preview updated!', 'success');
}

function downloadCV() {
    // Generate CV content
    const cvContent = generateCVContent();
    
    // Create download link
    const blob = new Blob([cvContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-cv.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('portfolio-message', 'CV downloaded successfully!', 'success');
}

function printCV() {
    const cvContent = generateCVContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(cvContent);
    printWindow.document.close();
    
    showMessage('portfolio-message', 'CV sent to printer!', 'success');
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
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    const savedBlogPosts = localStorage.getItem('blogPosts');
    if (savedBlogPosts) {
        blogPosts = JSON.parse(savedBlogPosts);
        displayBlogPosts();
        updateBlogStats();
    }
    
    const savedPortfolioData = localStorage.getItem('portfolioData');
    if (savedPortfolioData) {
        portfolioData = JSON.parse(savedPortfolioData);
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

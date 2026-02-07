// News and Ads Management System
class NewsAdsManager {
    constructor() {
        this.newsData = [];
        this.adsData = [];
        this.mutedAds = new Set();
        this.init();
    }

    init() {
        this.loadNews();
        this.loadAds();
        this.setupEventListeners();
        this.setupAdminControls();
    }

    // Load news from API
    async loadNews() {
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            
            if (data.success) {
                this.newsData = data.data;
                this.renderNews();
            } else {
                this.loadFallbackNews();
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.loadFallbackNews();
        }
    }

    // Load fallback news data
    loadFallbackNews() {
        this.newsData = [
            {
                id: 1,
                title: 'Welcome to IT Course Management System',
                summary: 'Welcome to our new course management platform with enhanced features for better learning experience.',
                content: 'We are excited to launch our new IT Course Management System. This platform provides comprehensive tools for students and lecturers to manage courses, assignments, and communication effectively.',
                category: 'general',
                priority: 'high',
                image_url: 'https://picsum.photos/seed/welcome-news/400/200.jpg',
                is_featured: true,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: 'New Academic Year 2024-2025',
                summary: 'Registration for 2024-2025 academic year is now open with new courses available.',
                content: 'Registration for the new academic year is now open. Students can register for courses and access study materials through the platform.',
                category: 'academic',
                priority: 'high',
                image_url: 'https://picsum.photos/seed/academic-news/400/200.jpg',
                is_featured: true,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                title: 'System Maintenance Notice',
                summary: 'System maintenance scheduled for this weekend with temporary downtime.',
                content: 'Scheduled maintenance will occur this weekend. The system may be temporarily unavailable from 2 AM to 6 AM on Sunday.',
                category: 'urgent',
                priority: 'urgent',
                image_url: 'https://picsum.photos/seed/maintenance-news/400/200.jpg',
                is_featured: false,
                created_at: new Date().toISOString()
            }
        ];
        this.renderNews();
    }

    // Render news items
    renderNews() {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        if (this.newsData.length === 0) {
            newsList.innerHTML = `
                <div class="no-news-message">
                    <i class="fas fa-newspaper"></i>
                    <p>No news available yet.</p>
                </div>
            `;
            return;
        }

        const newsHTML = this.newsData.map(news => this.createNewsItem(news)).join('');
        newsList.innerHTML = newsHTML;
    }

    // Create news item HTML
    createNewsItem(news) {
        const priorityClass = news.priority === 'urgent' ? 'urgent' : news.priority;
        const featuredClass = news.is_featured ? 'featured' : '';
        const categoryBadge = this.getCategoryBadge(news.category);
        const priorityBadge = this.getPriorityBadge(news.priority);
        const imageHTML = news.image_url ? `<img src="${news.image_url}" alt="${news.title}" class="news-image">` : '';
        const formattedDate = new Date(news.created_at).toLocaleDateString();

        return `
            <div class="news-item ${featuredClass} ${priorityClass}">
                <div class="news-header">
                    <h4 class="news-title">${news.title}</h4>
                    <div class="news-meta">
                        ${categoryBadge}
                        ${priorityBadge}
                    </div>
                </div>
                ${imageHTML}
                ${news.summary ? `<p class="news-summary">${news.summary}</p>` : ''}
                <div class="news-content">
                    <p>${news.content}</p>
                </div>
                <div class="news-meta">
                    <small><i class="fas fa-calendar"></i> ${formattedDate}</small>
                </div>
            </div>
        `;
    }

    // Get category badge HTML
    getCategoryBadge(category) {
        const badges = {
            general: '<span class="news-category">General</span>',
            academic: '<span class="news-category">Academic</span>',
            event: '<span class="news-category">Event</span>',
            announcement: '<span class="news-category">Announcement</span>',
            urgent: '<span class="news-category">Urgent</span>'
        };
        return badges[category] || badges.general;
    }

    // Get priority badge HTML
    getPriorityBadge(priority) {
        const badges = {
            low: '<span class="news-priority">Low</span>',
            medium: '<span class="news-priority">Medium</span>',
            high: '<span class="news-priority">High</span>',
            urgent: '<span class="news-priority urgent">Urgent</span>'
        };
        return badges[priority] || badges.medium;
    }

    // Load ads from API
    async loadAds() {
        try {
            const response = await fetch('/api/ads');
            const data = await response.json();
            
            if (data.success) {
                this.adsData = data.data;
                this.renderAds();
            } else {
                this.loadFallbackAds();
            }
        } catch (error) {
            console.error('Error loading ads:', error);
            this.loadFallbackAds();
        }
    }

    // Load fallback ads data
    loadFallbackAds() {
        this.adsData = [
            {
                id: 1,
                title: 'Learn Programming Online',
                description: 'Start your journey in programming with our comprehensive online courses. Expert instructors, flexible schedules.',
                video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
                thumbnail_url: 'https://picsum.photos/seed/programming-ad/300/200.jpg',
                redirect_url: 'https://www.w3schools.com',
                category: 'education',
                position: 'sidebar',
                click_count: 0,
                view_count: 0
            },
            {
                id: 2,
                title: 'Career Opportunities in IT',
                description: 'Discover exciting career opportunities in the IT industry. Connect with top employers and find your dream job.',
                video_url: 'https://www.w3schools.com/html/movie.mp4',
                thumbnail_url: 'https://picsum.photos/seed/career-ad/300/200.jpg',
                redirect_url: 'https://www.linkedin.com/jobs',
                category: 'career',
                position: 'header',
                click_count: 0,
                view_count: 0
            }
        ];
        this.renderAds();
    }

    // Render ads
    renderAds() {
        const adsContainer = document.getElementById('ads-container');
        if (!adsContainer) return;

        if (this.adsData.length === 0) {
            adsContainer.innerHTML = `
                <div class="no-ads-message">
                    <i class="fas fa-video"></i>
                    <p>No featured content available.</p>
                </div>
            `;
            return;
        }

        const adsHTML = this.adsData.map(ad => this.createAdItem(ad)).join('');
        adsContainer.innerHTML = adsHTML;
        this.setupAdEventListeners();
    }

    // Create ad item HTML
    createAdItem(ad) {
        const isMuted = this.mutedAds.has(ad.id);
        const thumbnailHTML = ad.thumbnail_url ? 
            `<img src="${ad.thumbnail_url}" alt="${ad.title}" class="ad-thumbnail">` : 
            `<div class="ad-placeholder"><i class="fas fa-play"></i></div>`;

        return `
            <div class="ad-item" data-ad-id="${ad.id}">
                <div class="ad-video-container">
                    ${thumbnailHTML}
                    <video class="ad-video" ${isMuted ? 'muted' : ''} loop data-min-duration="5" data-max-duration="30">
                        <source src="${ad.video_url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="ad-overlay">
                        <h4 class="ad-title">${ad.title}</h4>
                        <p class="ad-description">${ad.description}</p>
                        <div class="ad-controls">
                            <button class="ad-mute-btn ${isMuted ? 'muted' : ''}" data-ad-id="${ad.id}">
                                <i class="fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
                                ${isMuted ? 'Unmute' : 'Mute'}
                            </button>
                            <a href="${ad.redirect_url}" target="_blank" class="ad-visit-btn" data-ad-id="${ad.id}">
                                <i class="fas fa-external-link-alt"></i> Visit
                            </a>
                        </div>
                    </div>
                </div>
                <div class="ad-stats">
                    <div class="ad-stat">
                        <i class="fas fa-eye"></i>
                        <span>${ad.view_count || 0} views</span>
                    </div>
                    <div class="ad-stat">
                        <i class="fas fa-mouse-pointer"></i>
                        <span>${ad.click_count || 0} clicks</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup ad event listeners
    setupAdEventListeners() {
        // Mute/Unmute buttons
        document.querySelectorAll('.ad-mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const adId = parseInt(btn.dataset.adId);
                this.toggleMute(adId);
            });
        });

        // Visit buttons
        document.querySelectorAll('.ad-visit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const adId = parseInt(btn.dataset.adId);
                this.trackAdClick(adId);
                window.open(btn.href, '_blank');
            });
        });

        // Video event listeners for enhanced tracking
        document.querySelectorAll('.ad-video').forEach(video => {
            let hasTrackedView = false;
            let playStartTime = null;
            
            video.addEventListener('play', (e) => {
                const adItem = e.target.closest('.ad-item');
                const adId = parseInt(adItem.dataset.adId);
                
                // Set duration limits (5-30 seconds)
                const minDuration = parseInt(e.target.dataset.minDuration) || 5;
                const maxDuration = parseInt(e.target.dataset.maxDuration) || 30;
                
                // Track view only once per play session
                if (!hasTrackedView) {
                    this.trackAdView(adId);
                    hasTrackedView = true;
                }
                
                playStartTime = Date.now();
                
                // Set video duration limits
                e.target.addEventListener('loadedmetadata', () => {
                    if (e.target.duration < minDuration) {
                        e.target.duration = minDuration;
                    } else if (e.target.duration > maxDuration) {
                        e.target.duration = maxDuration;
                    }
                });
                
                // Auto-pause at max duration
                setTimeout(() => {
                    if (!e.target.paused) {
                        e.target.pause();
                    }
                }, maxDuration * 1000);
            });
            
            video.addEventListener('pause', (e) => {
                const adItem = e.target.closest('.ad-item');
                const adId = parseInt(adItem.dataset.adId);
                
                // Calculate watch time
                if (playStartTime) {
                    const watchTime = (Date.now() - playStartTime) / 1000;
                    this.updateWatchTime(adId, watchTime);
                }
            });
            
            video.addEventListener('ended', (e) => {
                const adItem = e.target.closest('.ad-item');
                const adId = parseInt(adItem.dataset.adId);
                
                // Calculate total watch time
                if (playStartTime) {
                    const watchTime = (Date.now() - playStartTime) / 1000;
                    this.updateWatchTime(adId, watchTime);
                }
                
                // Reset for next play
                hasTrackedView = false;
                playStartTime = null;
            });
            
            // Track when video comes into viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasTrackedView) {
                        const adId = parseInt(entry.target.dataset.adId);
                        this.trackAdView(adId);
                        hasTrackedView = true;
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(video);
        });
    }

    // Toggle mute for ad
    toggleMute(adId) {
        const adItem = document.querySelector(`[data-ad-id="${adId}"]`);
        const video = adItem.querySelector('.ad-video');
        const muteBtn = adItem.querySelector('.ad-mute-btn');
        const icon = muteBtn.querySelector('i');

        if (this.mutedAds.has(adId)) {
            // Unmute
            this.mutedAds.delete(adId);
            video.muted = false;
            muteBtn.classList.remove('muted');
            icon.className = 'fas fa-volume-up';
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i> Mute';
        } else {
            // Mute
            this.mutedAds.add(adId);
            video.muted = true;
            muteBtn.classList.add('muted');
            icon.className = 'fas fa-volume-mute';
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Unmute';
        }

        // Save preference to localStorage
        localStorage.setItem('mutedAds', JSON.stringify([...this.mutedAds]));
    }

    // Track ad click
    async trackAdClick(adId) {
        try {
            const response = await fetch('/api/ads/click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ad_id: adId,
                    user_agent: navigator.userAgent,
                    ip_address: await this.getClientIP(),
                    timestamp: new Date().toISOString()
                })
            });

            // Update local count
            const ad = this.adsData.find(a => a.id === adId);
            if (ad) {
                ad.click_count = (ad.click_count || 0) + 1;
                this.renderAds();
            }
        } catch (error) {
            console.error('Error tracking ad click:', error);
        }
    }

    // Track ad view with enhanced data
    async trackAdView(adId) {
        try {
            const response = await fetch('/api/ads/view', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ad_id: adId,
                    user_agent: navigator.userAgent,
                    ip_address: await this.getClientIP(),
                    timestamp: new Date().toISOString(),
                    viewport: `${window.innerWidth}x${window.innerHeight}`
                })
            });

            // Update local count
            const ad = this.adsData.find(a => a.id === adId);
            if (ad) {
                ad.view_count = (ad.view_count || 0) + 1;
                ad.total_watch_time = (ad.total_watch_time || 0) + 0; // Will be updated by watch time
                this.renderAds();
            }
        } catch (error) {
            console.error('Error tracking ad view:', error);
        }
    }

    // Update watch time for analytics
    async updateWatchTime(adId, watchTime) {
        try {
            const response = await fetch('/api/ads/watch-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ad_id: adId,
                    watch_time: Math.round(watchTime),
                    timestamp: new Date().toISOString()
                })
            });

            // Update local data
            const ad = this.adsData.find(a => a.id === adId);
            if (ad) {
                ad.total_watch_time = (ad.total_watch_time || 0) + Math.round(watchTime);
                this.renderAds();
            }
        } catch (error) {
            console.error('Error updating watch time:', error);
        }
    }

    // Get client IP (simplified)
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // News search
        const newsSearch = document.getElementById('search-news');
        if (newsSearch) {
            newsSearch.addEventListener('input', (e) => {
                this.filterNews(e.target.value);
            });
        }

        // News filter
        const newsFilter = document.getElementById('filter-news');
        if (newsFilter) {
            newsFilter.addEventListener('change', (e) => {
                this.filterNewsByCategory(e.target.value);
            });
        }

        // Load muted ads preference
        const savedMutedAds = localStorage.getItem('mutedAds');
        if (savedMutedAds) {
            this.mutedAds = new Set(JSON.parse(savedMutedAds));
        }
    }

    // Filter news by search term
    filterNews(searchTerm) {
        const filtered = this.newsData.filter(news => 
            news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            news.summary.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredNews(filtered);
    }

    // Filter news by category
    filterNewsByCategory(category) {
        const filtered = category ? 
            this.newsData.filter(news => news.category === category) : 
            this.newsData;
        this.renderFilteredNews(filtered);
    }

    // Render filtered news
    renderFilteredNews(filtered) {
        const newsList = document.getElementById('news-list');
        if (!newsList) return;

        if (filtered.length === 0) {
            newsList.innerHTML = `
                <div class="no-news-message">
                    <i class="fas fa-search"></i>
                    <p>No news found matching your criteria.</p>
                </div>
            `;
            return;
        }

        const newsHTML = filtered.map(news => this.createNewsItem(news)).join('');
        newsList.innerHTML = newsHTML;
    }

    // Setup admin controls
    setupAdminControls() {
        // News form
        const newsForm = document.getElementById('add-news-form');
        if (newsForm) {
            newsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNews(e);
            });
        }

        // Ads form
        const adForm = document.getElementById('add-ad-form');
        if (adForm) {
            adForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAd(e);
            });
        }
    }

    // Add news (admin)
    async addNews(e) {
        const formData = new FormData(e.target);
        const newsData = {
            title: formData.get('news-title'),
            summary: formData.get('news-summary'),
            content: formData.get('news-content'),
            category: formData.get('news-category'),
            priority: formData.get('news-priority'),
            image_url: formData.get('news-image'),
            is_featured: formData.has('news-featured')
        };

        try {
            const response = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newsData)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('news-message', 'News added successfully!', 'success');
                e.target.reset();
                this.loadNews();
            } else {
                this.showMessage('news-message', result.message || 'Failed to add news', 'error');
            }
        } catch (error) {
            console.error('Error adding news:', error);
            this.showMessage('news-message', 'Error adding news. Please try again.', 'error');
        }
    }

    // Add ad (admin)
    async addAd(e) {
        const formData = new FormData(e.target);
        const adData = {
            title: formData.get('ad-title'),
            description: formData.get('ad-description'),
            video_url: formData.get('ad-video-url'),
            thumbnail_url: formData.get('ad-thumbnail'),
            redirect_url: formData.get('ad-redirect'),
            category: formData.get('ad-category'),
            position: formData.get('ad-position'),
            start_date: formData.get('ad-start-date'),
            end_date: formData.get('ad-end-date')
        };

        try {
            const response = await fetch('/api/ads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adData)
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('ads-message', 'Ad added successfully!', 'success');
                e.target.reset();
                this.loadAds();
            } else {
                this.showMessage('ads-message', result.message || 'Failed to add ad', 'error');
            }
        } catch (error) {
            console.error('Error adding ad:', error);
            this.showMessage('ads-message', 'Error adding ad. Please try again.', 'error');
        }
    }

    // Show message
    showMessage(elementId, message, type) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsAdsManager = new NewsAdsManager();
});

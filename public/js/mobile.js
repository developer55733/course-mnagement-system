// Mobile Smartphone UI Enhancement
// Only applies to smartphones (max-width: 768px)

(() => {
    // Mobile detection
    const isMobile = () => {
        return window.innerWidth <= 768 && 
               'ontouchstart' in window && 
               navigator.maxTouchPoints > 0 &&
               /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Initialize mobile enhancements
    const initMobileUI = () => {
        if (!isMobile()) return;

        console.log('📱 Mobile Smartphone UI Activated');
        
        // Add mobile security badge
        addMobileSecurityBadge();
        
        // Enhance mobile navigation
        enhanceMobileNavigation();
        
        // Add mobile touch interactions
        addMobileTouchInteractions();
        
        // Optimize mobile forms
        optimizeMobileForms();
        
        // Add mobile animations
        addMobileAnimations();
        
        // Hide admin panel for security
        hideAdminPanel();
        
        // Add mobile-specific features
        addMobileFeatures();
    };

    // Add mobile security badge
    const addMobileSecurityBadge = () => {
        const loginTab = document.querySelector('#login .form-container');
        if (loginTab) {
            const securityBadge = document.createElement('div');
            securityBadge.className = 'mobile-security-badge';
            securityBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Secure Mobile Access';
            loginTab.appendChild(securityBadge);
        }
    };

    // Hide admin panel for security
    const hideAdminPanel = () => {
        // Hide admin tab completely
        const adminTab = document.querySelector('[data-tab="devadmin"]');
        if (adminTab) {
            adminTab.style.display = 'none';
            adminTab.setAttribute('aria-hidden', 'true');
        }

        // Hide admin-related elements
        const adminElements = document.querySelectorAll('.admin-only, #admin-actions, .admin-action-btn, .admin-status');
        adminElements.forEach(el => {
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
        });

        console.log('🔒 Admin panel hidden for mobile security');
    };

    // Enhance mobile navigation
    const enhanceMobileNavigation = () => {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            // Add mobile-specific touch feedback
            tab.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            tab.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    };

    // Add mobile touch interactions
    const addMobileTouchInteractions = () => {
        // Add swipe gestures for tab navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabContents.forEach(content => {
            content.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            content.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                const tabs = Array.from(document.querySelectorAll('.tab-btn:not(.hidden)'));
                const activeTab = document.querySelector('.tab-btn.active');
                const currentIndex = tabs.indexOf(activeTab);
                
                if (diff > 0 && currentIndex < tabs.length - 1) {
                    // Swipe left - next tab
                    tabs[currentIndex + 1].click();
                } else if (diff < 0 && currentIndex > 0) {
                    // Swipe right - previous tab
                    tabs[currentIndex - 1].click();
                }
            }
        }
    };

    // Optimize mobile forms
    const optimizeMobileForms = () => {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Add mobile-specific input types
            const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
            
            inputs.forEach(input => {
                // Add mobile keyboard optimization
                if (input.type === 'email') {
                    input.setAttribute('autocomplete', 'email');
                    input.setAttribute('autocorrect', 'off');
                    input.setAttribute('autocapitalize', 'off');
                }
                
                if (input.type === 'password') {
                    input.setAttribute('autocomplete', 'current-password');
                }
                
                // Add mobile focus effects
                input.addEventListener('focus', function() {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            });
        });
    };

    // Add mobile animations
    const addMobileAnimations = () => {
        // Add entrance animations to cards
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        });
        
        const cards = document.querySelectorAll('.mobile-card, .table-container');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    };

    // Add mobile-specific features
    const addMobileFeatures = () => {
        // Add mobile notification system
        addMobileNotifications();
        
        // Add mobile loading states
        addMobileLoadingStates();
        
        // Add mobile error handling
        addMobileErrorHandling();
        
        // Add mobile performance optimization
        addMobilePerformanceOptimization();
    };

    // Add mobile notifications
    const addMobileNotifications = () => {
        // Create mobile notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'mobile-notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
        
        // Override alert for mobile
        const originalAlert = window.alert;
        window.alert = (message) => {
            const notification = document.createElement('div');
            notification.className = 'mobile-notification';
            notification.innerHTML = `
                <div class="mobile-notification-content">
                    <i class="fas fa-info-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            notification.style.cssText = `
                background: rgba(102, 126, 234, 0.95);
                color: white;
                padding: 15px 20px;
                border-radius: 15px;
                margin-bottom: 10px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                animation: slideInRight 0.3s ease;
                max-width: 300px;
                pointer-events: auto;
            `;
            
            notificationContainer.appendChild(notification);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
            
            // Add tap to dismiss
            notification.addEventListener('click', () => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            });
        };
    };

    // Add mobile loading states
    const addMobileLoadingStates = () => {
        // Override button clicks to show mobile loading
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            const originalText = button.innerHTML;
            
            button.addEventListener('click', function() {
                if (!this.disabled) {
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    this.disabled = true;
                    
                    // Reset after 2 seconds (for demo)
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }, 2000);
                }
            });
        });
    };

    // Add mobile error handling
    const addMobileErrorHandling = () => {
        // Add mobile-friendly error messages
        window.addEventListener('error', (e) => {
            console.error('Mobile error:', e);
            // Show user-friendly error message
            if (window.alert) {
                alert('Something went wrong. Please try again.');
            }
        });
    };

    // Add mobile performance optimization
    const addMobilePerformanceOptimization = () => {
        // Optimize images for mobile
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
        
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
        }
    };

    // Add mobile CSS animations
    const mobileAnimations = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .mobile-notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
        }
        
        .mobile-notification-content i {
            font-size: 16px;
        }
    `;
    
    // Add mobile animations to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = mobileAnimations;
    document.head.appendChild(styleSheet);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileUI);
    } else {
        initMobileUI();
    }

    // Re-initialize on window resize (for responsive testing)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initMobileUI, 250);
    });

    // Export mobile utilities
    window.mobileUI = {
        isMobile,
        hideAdminPanel,
        addMobileSecurityBadge,
        showNotification: (message, type = 'info') => {
            if (window.alert) {
                alert(message);
            }
        }
    };
})();

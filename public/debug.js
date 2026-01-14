console.log('=== DEBUG SCRIPT LOADED ===');
console.log('Current URL:', window.location.href);
console.log('DOM ready state:', document.readyState);

// Override console.log to also show messages on page
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args);
    
    // Create debug div if it doesn't exist
    let debugDiv = document.getElementById('debug-output');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-output';
        debugDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: black; color: lime; padding: 10px; font-family: monospace; font-size: 12px; max-width: 300px; z-index: 9999; max-height: 200px; overflow-y: auto;';
        document.body.appendChild(debugDiv);
    }
    
    // Add message to debug div
    const message = args.join(' ');
    debugDiv.innerHTML += message + '<br>';
    debugDiv.scrollTop = debugDiv.scrollHeight;
};

// Check if elements exist when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        
        console.log('Elements check:');
        console.log('- login-form:', !!loginForm);
        console.log('- register-form:', !!registerForm);
        console.log('- login-email:', !!loginEmail);
        console.log('- login-password:', !!loginPassword);
        
        if (loginForm) {
            console.log('Adding manual login listener for testing');
            loginForm.addEventListener('submit', function(e) {
                console.log('MANUAL LOGIN LISTENER TRIGGERED!');
                e.preventDefault();
                alert('Login form submitted! Check console for details.');
            });
        }
        
        if (registerForm) {
            console.log('Adding manual register listener for testing');
            registerForm.addEventListener('submit', function(e) {
                console.log('MANUAL REGISTER LISTENER TRIGGERED!');
                e.preventDefault();
                alert('Register form submitted! Check console for details.');
            });
        }
    }, 1000);
});

console.log('=== DEBUG SCRIPT SETUP COMPLETE ===');

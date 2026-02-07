// Test file to verify new routes are working
const http = require('http');

// Test discussions endpoint
const testDiscussions = () => {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/discussions',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`Discussions endpoint status: ${res.statusCode}`);
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('Discussions response:', result);
            } catch (e) {
                console.log('Discussions raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Discussions error: ${e.message}`);
    });

    req.end();
};

// Test assignments endpoint
const testAssignments = () => {
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/assignments',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`Assignments endpoint status: ${res.statusCode}`);
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                console.log('Assignments response:', result);
            } catch (e) {
                console.log('Assignments raw response:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Assignments error: ${e.message}`);
    });

    req.end();
};

// Run tests
console.log('Testing new API endpoints...');
setTimeout(() => {
    testDiscussions();
    setTimeout(() => {
        testAssignments();
    }, 1000);
}, 2000);

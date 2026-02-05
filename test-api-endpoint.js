const express = require('express');
const request = require('http').request;

// Test the API endpoint directly
function testAPIEndpoint() {
    return new Promise((resolve, reject) => {
        console.log('🧪 Testing /api/notes/public endpoint...');
        
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/notes/public',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            }
        };

        const req = request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('🔍 Response status:', res.statusCode);
                console.log('🔍 Response headers:', res.headers);
                console.log('🔍 Response body:', data);
                
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });

        req.end();
    });
}

// Test the endpoint
testAPIEndpoint()
    .then((result) => {
        console.log('\n🎉 API Test Result:');
        console.log('Status Code:', result.statusCode);
        console.log('Data:', result.data);
        
        if (result.statusCode === 200 && result.data.success) {
            console.log('✅ API endpoint is working correctly!');
        } else if (result.statusCode === 404) {
            console.log('❌ Route not found - server routing issue');
        } else {
            console.log('❌ API endpoint returned error');
        }
    })
    .catch((error) => {
        console.error('❌ Test failed:', error.message);
        console.log('💡 Make sure the server is running on localhost:8080');
    });

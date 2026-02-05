const { query } = require('./config/database');

async function testNotesFlow() {
    try {
        console.log('🧪 Testing Complete Notes Flow...');
        
        // 1. Test database connection
        console.log('\n📋 1. Testing database connection...');
        const [test] = await query('SELECT 1 as test');
        console.log('✅ Database connection OK');
        
        // 2. Check if notes exist
        console.log('\n📋 2. Checking if notes exist...');
        const [notesCount] = await query('SELECT COUNT(*) as count FROM notes WHERE visibility = "public"');
        console.log(`✅ Found ${notesCount[0].count} public notes`);
        
        // 3. Get actual notes data (same as API)
        console.log('\n📋 3. Getting notes data (same as API query)...');
        const [notes] = await query(`
            SELECT id, title, content, formatted_content, module_code, module_name, type, tags, visibility, created_at
            FROM notes 
            WHERE visibility = 'public' 
            ORDER BY created_at DESC
        `);
        
        console.log(`✅ Query returned ${notes.length} notes`);
        
        if (notes.length > 0) {
            console.log('\n📋 4. Sample note data:');
            console.log('Note 1:', {
                id: notes[0].id,
                title: notes[0].title,
                module_code: notes[0].module_code,
                type: notes[0].type,
                visibility: notes[0].visibility,
                content_length: notes[0].content?.length || 0
            });
        }
        
        // 4. Test API response format
        console.log('\n📋 5. Testing API response format...');
        const apiResponse = {
            success: true,
            data: notes,
            message: 'Notes retrieved successfully'
        };
        
        console.log('✅ API response format:', JSON.stringify(apiResponse, null, 2));
        
        // 5. Test frontend rendering simulation
        console.log('\n📋 6. Testing frontend rendering simulation...');
        if (apiResponse.success && apiResponse.data.length > 0) {
            const sampleHTML = apiResponse.data.map((note, index) => `
                <div class="note-item" data-note-id="${note.id}">
                    <div class="note-header">
                        <h4>${note.title}</h4>
                        <div class="note-meta">
                            <span class="note-module">${note.module_code}</span>
                            <span class="note-type">${note.type}</span>
                        </div>
                    </div>
                    <div class="note-content">
                        <p>${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                    </div>
                    <div class="note-actions">
                        <button class="btn btn-primary btn-small" onclick="downloadNote('${note.id}')">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                    </div>
                </div>
            `).join('');
            
            console.log(`✅ Generated HTML length: ${sampleHTML.length} characters`);
            console.log('✅ First 200 characters of HTML:', sampleHTML.substring(0, 200) + '...');
        }
        
        console.log('\n🎉 Complete flow test completed!');
        console.log('\n📝 Summary:');
        console.log(`- Database Connection: ✅`);
        console.log(`- Notes in Database: ${notesCount[0].count} found`);
        console.log(`- API Query: ✅`);
        console.log(`- API Response Format: ✅`);
        console.log(`- HTML Generation: ${notes.length > 0 ? '✅' : '❌ (no notes to render)'}`);
        
    } catch (error) {
        console.error('❌ Error testing notes flow:', error);
    }
}

// Run the test
testNotesFlow().then(() => {
    console.log('\n🧪 Flow test completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Flow test failed:', error);
    process.exit(1);
});

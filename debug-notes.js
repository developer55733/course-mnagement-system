const { query } = require('./config/database');

async function debugNotesSystem() {
    try {
        console.log('🔍 Debugging Notes System...');
        
        // 1. Check if notes table exists
        console.log('\n📋 1. Checking notes table...');
        const [tableInfo] = await query('SHOW TABLES LIKE "notes"');
        if (tableInfo.length === 0) {
            console.log('❌ Notes table does not exist!');
            return;
        }
        console.log('✅ Notes table exists');
        
        // 2. Check table structure
        console.log('\n📋 2. Checking table structure...');
        const [structure] = await query('DESCRIBE notes');
        console.log('Table structure:', structure.map(col => col.Field));
        
        // 3. Count all notes
        console.log('\n📋 3. Counting all notes...');
        const [allNotes] = await query('SELECT COUNT(*) as total FROM notes');
        console.log(`✅ Total notes in database: ${allNotes[0].total}`);
        
        // 4. Count public notes
        console.log('\n📋 4. Counting public notes...');
        const [publicNotes] = await query('SELECT COUNT(*) as public_total FROM notes WHERE visibility = "public"');
        console.log(`✅ Public notes count: ${publicNotes[0].public_total}`);
        
        // 5. Get sample notes
        console.log('\n📋 5. Getting sample notes...');
        const [sampleNotes] = await query('SELECT id, title, module_code, type, visibility FROM notes LIMIT 5');
        console.log('Sample notes:', sampleNotes);
        
        // 6. Test API endpoint simulation
        console.log('\n📋 6. Testing API endpoint simulation...');
        const [apiNotes] = await query(`
            SELECT id, title, content, formatted_content, module_code, module_name, type, tags, visibility, created_at
            FROM notes 
            WHERE visibility = 'public' 
            ORDER BY created_at DESC
        `);
        console.log(`✅ API would return ${apiNotes.length} notes`);
        if (apiNotes.length > 0) {
            console.log('Sample note for API:', apiNotes[0]);
        }
        
        console.log('\n🎉 Notes system debug completed!');
        
    } catch (error) {
        console.error('❌ Error debugging notes system:', error);
    }
}

// Run the debug
debugNotesSystem().then(() => {
    console.log('🔍 Debug session completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug session failed:', error);
    process.exit(1);
});

const { query } = require('./config/database');

async function createTestNotes() {
    try {
        console.log('🔍 Creating test notes...');
        
        // Check if notes already exist
        const [existingNotes] = await query('SELECT COUNT(*) as count FROM notes');
        if (existingNotes[0].count > 0) {
            console.log('✅ Notes already exist in database');
            return;
        }
        
        // Create test notes
        const testNotes = [
            {
                title: 'Introduction to Programming - Lecture 1',
                content: 'This is the first lecture covering basic programming concepts including variables, data types, and control structures. Students will learn the fundamentals of writing simple programs.',
                formatted_content: '<h2>Introduction to Programming - Lecture 1</h2><p>This is the first lecture covering basic programming concepts including <strong>variables</strong>, <strong>data types</strong>, and <strong>control structures</strong>. Students will learn the fundamentals of writing simple programs.</p>',
                module_code: 'IT101',
                module_name: 'Introduction to Programming',
                type: 'lecture',
                tags: 'programming, basics, variables',
                visibility: 'public',
                created_by: 1
            },
            {
                title: 'Web Development Tutorial - HTML Basics',
                content: 'Tutorial covering HTML fundamentals including tags, attributes, and document structure. Learn how to create basic web pages.',
                formatted_content: '<h2>Web Development Tutorial - HTML Basics</h2><p>Tutorial covering HTML fundamentals including <strong>tags</strong>, <strong>attributes</strong>, and <strong>document structure</strong>. Learn how to create basic web pages.</p>',
                module_code: 'IT102',
                module_name: 'Web Development Fundamentals',
                type: 'tutorial',
                tags: 'html, web, tutorial',
                visibility: 'public',
                created_by: 1
            },
            {
                title: 'Database Assignment Guidelines',
                content: 'Guidelines for completing the database assignment including requirements, submission format, and grading criteria.',
                formatted_content: '<h2>Database Assignment Guidelines</h2><p>Guidelines for completing the database assignment including <strong>requirements</strong>, <strong>submission format</strong>, and <strong>grading criteria</strong>.</p>',
                module_code: 'IT103',
                module_name: 'Database Management Systems',
                type: 'assignment',
                tags: 'database, assignment, guidelines',
                visibility: 'public',
                created_by: 1
            }
        ];
        
        for (const note of testNotes) {
            const result = await query(`
                INSERT INTO notes (title, content, formatted_content, module_code, module_name, type, tags, visibility, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                note.title,
                note.content,
                note.formatted_content,
                note.module_code,
                note.module_name,
                note.type,
                note.tags,
                note.visibility,
                note.created_by
            ]);
            
            console.log(`✅ Created note: ${note.title} (ID: ${result[0]?.insertId})`);
        }
        
        console.log('✅ Test notes created successfully!');
        
    } catch (error) {
        console.error('❌ Error creating test notes:', error);
    }
}

// Run the function
createTestNotes().then(() => {
    console.log('🎉 Test notes creation completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test notes creation failed:', error);
    process.exit(1);
});

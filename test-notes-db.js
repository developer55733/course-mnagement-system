const { query } = require('./config/database');

async function testNotes() {
  try {
    console.log('Testing database connection...');
    
    // Check if notes table exists
    const [tableCheck] = await query('SHOW TABLES LIKE "notes"');
    console.log('Notes table exists:', tableCheck.length > 0);
    
    if (tableCheck.length > 0) {
      // Check public notes count
      const [publicNotes] = await query('SELECT COUNT(*) as count FROM notes WHERE visibility = "public"');
      console.log('Public notes count:', publicNotes[0].count);
      
      // Get sample notes
      const [sampleNotes] = await query('SELECT id, title, visibility, created_at FROM notes LIMIT 5');
      console.log('Sample notes:', sampleNotes);
      
      // Check if there are any notes at all
      const [allNotes] = await query('SELECT COUNT(*) as count FROM notes');
      console.log('Total notes count:', allNotes[0].count);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

testNotes();

const { query } = require('./config/database');

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...\n');
    
    // Check users table
    try {
      const [users] = await query('SELECT COUNT(*) as count, MIN(id) as min_id, MAX(id) as max_id FROM users');
      console.log('👥 Users Table:');
      console.log(`   Count: ${users[0].count}`);
      console.log(`   ID Range: ${users[0].min_id} - ${users[0].max_id}`);
      
      if (users[0].count > 0) {
        const [sampleUsers] = await query('SELECT id, name, email, role FROM users LIMIT 3');
        console.log('   Sample Users:');
        sampleUsers.forEach(user => {
          console.log(`     - ${user.name} (${user.email}) - ${user.role}`);
        });
      }
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    console.log('');
    
    // Check modules table
    try {
      const [modules] = await query('SELECT COUNT(*) as count FROM modules');
      console.log('📚 Modules Table:');
      console.log(`   Count: ${modules[0].count}`);
      
      if (modules[0].count > 0) {
        const [sampleModules] = await query('SELECT code, name FROM modules LIMIT 5');
        console.log('   Sample Modules:');
        sampleModules.forEach(module => {
          console.log(`     - ${module.code}: ${module.name}`);
        });
      }
    } catch (error) {
      console.log('❌ Modules table error:', error.message);
    }
    
    console.log('');
    
    // Check lecturers table
    try {
      const [lecturers] = await query('SELECT COUNT(*) as count FROM lecturers');
      console.log('👨‍🏫 Lecturers Table:');
      console.log(`   Count: ${lecturers[0].count}`);
      
      if (lecturers[0].count > 0) {
        const [sampleLecturers] = await query('SELECT name, module, phone FROM lecturers LIMIT 5');
        console.log('   Sample Lecturers:');
        sampleLecturers.forEach(lecturer => {
          console.log(`     - ${lecturer.name} (${lecturer.module}) - ${lecturer.phone || 'No phone'}`);
        });
      }
    } catch (error) {
      console.log('❌ Lecturers table error:', error.message);
    }
    
    console.log('');
    
    // Check timetable table
    try {
      const [timetable] = await query('SELECT COUNT(*) as count FROM timetable');
      console.log('📅 Timetable Table:');
      console.log(`   Count: ${timetable[0].count}`);
      
      if (timetable[0].count > 0) {
        const [sampleTimetable] = await query('SELECT test, module, date, time, venue FROM timetable LIMIT 5');
        console.log('   Sample Timetable:');
        sampleTimetable.forEach(entry => {
          console.log(`     - ${entry.test} (${entry.module}) on ${entry.date} at ${entry.time} - ${entry.venue}`);
        });
      }
    } catch (error) {
      console.log('❌ Timetable table error:', error.message);
    }
    
    console.log('');
    
    // Check notes table
    try {
      const [notes] = await query('SELECT COUNT(*) as count FROM notes');
      console.log('📝 Notes Table:');
      console.log(`   Count: ${notes[0].count}`);
      
      if (notes[0].count > 0) {
        const [sampleNotes] = await query('SELECT title, module_code, type, visibility FROM notes LIMIT 5');
        console.log('   Sample Notes:');
        sampleNotes.forEach(note => {
          console.log(`     - ${note.title} (${note.module_code}) - ${note.type} - ${note.visibility}`);
        });
      }
    } catch (error) {
      console.log('❌ Notes table error:', error.message);
    }
    
    console.log('');
    
    // Check class_timetable table
    try {
      const [classTimetable] = await query('SELECT COUNT(*) as count FROM class_timetable');
      console.log('🏫 Class Timetable Table:');
      console.log(`   Count: ${classTimetable[0].count}`);
      
      if (classTimetable[0].count > 0) {
        const [sampleClassTimetable] = await query('SELECT module_code, module_name, lecturer_name, venue, day_of_week, start_time, end_time FROM class_timetable LIMIT 5');
        console.log('   Sample Class Timetable:');
        sampleClassTimetable.forEach(entry => {
          console.log(`     - ${entry.module_code}: ${entry.module_name} by ${entry.lecturer_name} on ${entry.day_of_week} ${entry.start_time}-${entry.end_time} at ${entry.venue}`);
        });
      }
    } catch (error) {
      console.log('❌ Class Timetable table error:', error.message);
    }
    
    console.log('');
    
    // Check news and ads tables
    try {
      const [news] = await query('SELECT COUNT(*) as count FROM news');
      console.log('📰 News Table:');
      console.log(`   Count: ${news[0].count}`);
    } catch (error) {
      console.log('❌ News table error:', error.message);
    }
    
    try {
      const [ads] = await query('SELECT COUNT(*) as count FROM ads');
      console.log('📺 Ads Table:');
      console.log(`   Count: ${ads[0].count}`);
    } catch (error) {
      console.log('❌ Ads table error:', error.message);
    }
    
    console.log('\n✅ Database status check completed');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
  
  process.exit(0);
}

checkDatabaseStatus();

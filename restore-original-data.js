const { query } = require('./config/database');

async function restoreOriginalData() {
  try {
    console.log('🔄 Restoring original data...\n');
    
    // Restore modules
    console.log('📚 Restoring modules...');
    const modules = [
      ['IT101', 'Introduction to Programming'],
      ['IT102', 'Web Development Fundamentals'],
      ['IT103', 'Database Management Systems'],
      ['IT104', 'Data Structures & Algorithms'],
      ['IT105', 'Computer Networks']
    ];
    
    for (const [code, name] of modules) {
      try {
        await query('INSERT IGNORE INTO modules (code, name) VALUES (?, ?)', [code, name]);
        console.log(`   ✅ Module: ${code} - ${name}`);
      } catch (error) {
        console.log(`   ⚠️  Module ${code} already exists or failed: ${error.message}`);
      }
    }
    
    // Restore lecturers
    console.log('\n👨‍🏫 Restoring lecturers...');
    const lecturers = [
      ['Prof. James Davidson', 'IT101 - Introduction to Programming', '+1 (555) 123-4567'],
      ['Dr. Sarah Roberts', 'IT102 - Web Development Fundamentals', '+1 (555) 987-6543'],
      ['Dr. Michael Johnson', 'IT103 - Database Management Systems', '+1 (555) 456-7890'],
      ['Prof. Emily White', 'IT104 - Data Structures & Algorithms', '+1 (555) 321-0987'],
      ['Dr. Robert Brown', 'IT105 - Computer Networks', '+1 (555) 654-3210']
    ];
    
    for (const [name, module, phone] of lecturers) {
      try {
        await query('INSERT IGNORE INTO lecturers (name, module, phone) VALUES (?, ?, ?)', [name, module, phone]);
        console.log(`   ✅ Lecturer: ${name} - ${module}`);
      } catch (error) {
        console.log(`   ⚠️  Lecturer ${name} already exists or failed: ${error.message}`);
      }
    }
    
    // Restore timetable
    console.log('\n📅 Restoring timetable...');
    const timetable = [
      ['Test 01', 'IT101', '2024-01-15', '10:00:00', 'Room 101'],
      ['Test 01', 'IT102', '2024-01-18', '14:00:00', 'Lab 3'],
      ['Test 02', 'IT101', '2024-02-05', '09:00:00', 'Room 102'],
      ['Midterm', 'IT103', '2024-02-10', '10:30:00', 'Room 201'],
      ['Final', 'IT104', '2024-03-20', '13:00:00', 'Hall A']
    ];
    
    for (const [test, module, date, time, venue] of timetable) {
      try {
        await query('INSERT IGNORE INTO timetable (test, module, date, time, venue) VALUES (?, ?, ?, ?, ?)', [test, module, date, time, venue]);
        console.log(`   ✅ Timetable: ${test} - ${module} on ${date} at ${time} - ${venue}`);
      } catch (error) {
        console.log(`   ⚠️  Timetable entry ${test} already exists or failed: ${error.message}`);
      }
    }
    
    // Restore class timetable
    console.log('\n🏫 Restoring class timetable...');
    const classTimetable = [
      ['IT101', 'Introduction to Programming', 'Prof. James Davidson', 'Room 101', 'Monday', '09:00:00', '11:00:00'],
      ['IT101', 'Introduction to Programming', 'Prof. James Davidson', 'Room 101', 'Wednesday', '09:00:00', '11:00:00'],
      ['IT101', 'Introduction to Programming', 'Prof. James Davidson', 'Lab 1', 'Friday', '14:00:00', '16:00:00'],
      ['IT102', 'Web Development Fundamentals', 'Dr. Sarah Roberts', 'Lab 3', 'Tuesday', '10:00:00', '12:00:00'],
      ['IT102', 'Web Development Fundamentals', 'Dr. Sarah Roberts', 'Lab 3', 'Thursday', '10:00:00', '12:00:00'],
      ['IT103', 'Database Management Systems', 'Dr. Michael Johnson', 'Room 201', 'Monday', '14:00:00', '16:00:00'],
      ['IT103', 'Database Management Systems', 'Dr. Michael Johnson', 'Room 201', 'Wednesday', '14:00:00', '16:00:00'],
      ['IT104', 'Data Structures & Algorithms', 'Prof. Emily White', 'Room 102', 'Tuesday', '14:00:00', '16:00:00'],
      ['IT104', 'Data Structures & Algorithms', 'Prof. Emily White', 'Room 102', 'Thursday', '14:00:00', '16:00:00'],
      ['IT105', 'Computer Networks', 'Dr. Robert Brown', 'Lab 2', 'Monday', '10:00:00', '12:00:00'],
      ['IT105', 'Computer Networks', 'Dr. Robert Brown', 'Lab 2', 'Wednesday', '10:00:00', '12:00:00'],
      ['IT105', 'Computer Networks', 'Dr. Robert Brown', 'Lab 2', 'Friday', '10:00:00', '12:00:00']
    ];
    
    for (const [moduleCode, moduleName, lecturerName, venue, dayOfWeek, startTime, endTime] of classTimetable) {
      try {
        await query('INSERT IGNORE INTO class_timetable (module_code, module_name, lecturer_name, venue, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)', [moduleCode, moduleName, lecturerName, venue, dayOfWeek, startTime, endTime]);
        console.log(`   ✅ Class: ${moduleCode} - ${moduleName} by ${lecturerName} on ${dayOfWeek} ${startTime}-${endTime} at ${venue}`);
      } catch (error) {
        console.log(`   ⚠️  Class entry ${moduleCode} already exists or failed: ${error.message}`);
      }
    }
    
    // Restore settings
    console.log('\n⚙️ Restoring settings...');
    try {
      await query('INSERT IGNORE INTO settings (academic_year, semester, institution_name) VALUES (?, ?, ?)', ['2023-2024', 1, 'IT University']);
      console.log('   ✅ Settings restored');
    } catch (error) {
      console.log(`   ⚠️  Settings already exist or failed: ${error.message}`);
    }
    
    // Add some sample notes
    console.log('\n📝 Adding sample notes...');
    const notes = [
      ['Introduction to Programming Basics', 'This note covers the fundamental concepts of programming including variables, data types, and control structures.', 'IT101', 'Introduction to Programming', 'lecture', 'programming,basics,variables', 'public', 1],
      ['Web Development HTML & CSS', 'Comprehensive guide to HTML5 and CSS3 for modern web development.', 'IT102', 'Web Development Fundamentals', 'lecture', 'html,css,web', 'public', 1],
      ['Database Normalization', 'Understanding database normalization forms and their importance in database design.', 'IT103', 'Database Management Systems', 'tutorial', 'database,normalization,design', 'public', 1],
      ['Algorithm Complexity', 'Time and space complexity analysis for common algorithms.', 'IT104', 'Data Structures & Algorithms', 'lecture', 'algorithms,complexity,analysis', 'public', 1],
      ['Network Protocols', 'Overview of TCP/IP, HTTP, and other important network protocols.', 'IT105', 'Computer Networks', 'lecture', 'networks,protocols,tcpip', 'public', 1]
    ];
    
    for (const [title, content, moduleCode, moduleName, type, tags, visibility, createdBy] of notes) {
      try {
        await query('INSERT IGNORE INTO notes (title, content, module_code, module_name, type, tags, visibility, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, content, moduleCode, moduleName, type, tags, visibility, createdBy]);
        console.log(`   ✅ Note: ${title} - ${moduleCode}`);
      } catch (error) {
        console.log(`   ⚠️  Note ${title} already exists or failed: ${error.message}`);
      }
    }
    
    console.log('\n✅ Original data restoration completed!');
    
  } catch (error) {
    console.error('❌ Data restoration failed:', error);
  }
  
  process.exit(0);
}

restoreOriginalData();

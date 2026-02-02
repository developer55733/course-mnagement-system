const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

class SQLiteDatabase {
  constructor() {
    this.db = null;
  }

  async connect() {
    if (this.db) return this.db;
    
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON');
    
    // Initialize database
    await this.initializeDatabase();
    
    console.log('✓ SQLite connected successfully');
    return this.db;
  }

  async initializeDatabase() {
    // Create users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        student_id TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create lecturers table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS lecturers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        module TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create timetable table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test TEXT NOT NULL,
        module TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        venue TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create modules table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        academic_year TEXT,
        semester INTEGER,
        institution_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default data if tables are empty
    await this.insertDefaultData();
  }

  async insertDefaultData() {
    // Check if users table is empty
    const userCount = await this.db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      // Insert default users
      const hashedPassword1 = await bcrypt.hash('password123', 10);
      const hashedPassword2 = await bcrypt.hash('admin123', 10);
      
      await this.db.exec(`
        INSERT INTO users (name, email, student_id, password, role) VALUES
        ('John Smith', 'john@student.edu', 'IT2023001', '${hashedPassword1}', 'user'),
        ('Admin User', 'admin@system.edu', 'ADMIN001', '${hashedPassword2}', 'admin')
      `);
    }

    // Check if modules table is empty
    const moduleCount = await this.db.get('SELECT COUNT(*) as count FROM modules');
    if (moduleCount.count === 0) {
      await this.db.exec(`
        INSERT INTO modules (code, name) VALUES
        ('IT101', 'Introduction to Programming'),
        ('IT102', 'Web Development Fundamentals'),
        ('IT103', 'Database Management Systems'),
        ('IT104', 'Data Structures & Algorithms'),
        ('IT105', 'Computer Networks')
      `);
    }

    // Check if lecturers table is empty
    const lecturerCount = await this.db.get('SELECT COUNT(*) as count FROM lecturers');
    if (lecturerCount.count === 0) {
      await this.db.exec(`
        INSERT INTO lecturers (name, module, phone) VALUES
        ('Prof. James Davidson', 'IT101 - Introduction to Programming', '+1 (555) 123-4567'),
        ('Dr. Sarah Roberts', 'IT102 - Web Development Fundamentals', '+1 (555) 987-6543'),
        ('Dr. Michael Johnson', 'IT103 - Database Management Systems', '+1 (555) 456-7890'),
        ('Prof. Emily White', 'IT104 - Data Structures & Algorithms', '+1 (555) 321-0987'),
        ('Dr. Robert Brown', 'IT105 - Computer Networks', '+1 (555) 654-3210')
      `);
    }

    // Check if timetable table is empty
    const timetableCount = await this.db.get('SELECT COUNT(*) as count FROM timetable');
    if (timetableCount.count === 0) {
      await this.db.exec(`
        INSERT INTO timetable (test, module, date, time, venue) VALUES
        ('Test 01', 'IT101', '2024-01-15', '10:00:00', 'Room 101'),
        ('Test 01', 'IT102', '2024-01-18', '14:00:00', 'Lab 3'),
        ('Test 02', 'IT101', '2024-02-05', '09:00:00', 'Room 102'),
        ('Midterm', 'IT103', '2024-02-10', '10:30:00', 'Room 201'),
        ('Final', 'IT104', '2024-03-20', '13:00:00', 'Hall A')
      `);
    }

    // Check if settings table is empty
    const settingsCount = await this.db.get('SELECT COUNT(*) as count FROM settings');
    if (settingsCount.count === 0) {
      await this.db.exec(`
        INSERT INTO settings (academic_year, semester, institution_name) VALUES
        ('2023-2024', 1, 'IT University')
      `);
    }
  }

  // MySQL-compatible query method
  async query(sql, params = []) {
    const db = await this.connect();
    
    if (sql.trim().toLowerCase().startsWith('select')) {
      const rows = await db.all(sql, params);
      return [rows];
    } else {
      const result = await db.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  }

  // MySQL-compatible execute method
  async execute(sql, params = []) {
    const db = await this.connect();
    const result = await db.run(sql, params);
    return { insertId: result.lastID, affectedRows: result.changes };
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Create singleton instance
const sqliteDB = new SQLiteDatabase();

// Test connection
sqliteDB.connect().catch(err => {
  console.error('✗ SQLite connection failed:', err.message);
});

module.exports = sqliteDB;

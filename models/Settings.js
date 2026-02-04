const pool = require('../config/database');

class Settings {
  static async get() {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async update(academicYear, semester, institutionName) {
    const settings = await this.get();
    
    if (!settings) {
      // Create initial settings if they don't exist
      const result = await pool.query(
        'INSERT INTO settings (academic_year, semester, institution_name) VALUES (?, ?, ?)',
        [academicYear, semester, institutionName]
      );
      const [insertResult] = result;
      return { id: insertResult.insertId, academic_year: academicYear, semester, institution_name: institutionName };
    }
    
    // Update existing settings
    const result = await pool.query(
      'UPDATE settings SET academic_year = ?, semester = ?, institution_name = ? WHERE id = ?',
      [academicYear, semester, institutionName, settings.id]
    );
    const [updateResult] = result;
    
    if (updateResult.affectedRows > 0) {
      return { id: settings.id, academic_year: academicYear, semester, institution_name: institutionName };
    }
    
    return null;
  }
}

module.exports = Settings;

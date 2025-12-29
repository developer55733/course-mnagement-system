const pool = require('../config/database');

class Timetable {
  static async getAll() {
    const [rows] = await pool.query('SELECT id, test, module, date, time, venue, created_at FROM timetable ORDER BY date, time');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM timetable WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(test, module, date, time, venue) {
    const [result] = await pool.execute(
      'INSERT INTO timetable (test, module, date, time, venue) VALUES (?, ?, ?, ?, ?)',
      [test, module, date, time, venue]
    );
    return { id: result.insertId, test, module, date, time, venue };
  }

  static async update(id, test, module, date, time, venue) {
    const [result] = await pool.execute(
      'UPDATE timetable SET test = ?, module = ?, date = ?, time = ?, venue = ? WHERE id = ?',
      [test, module, date, time, venue, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM timetable WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getByModule(module) {
    const [rows] = await pool.query('SELECT * FROM timetable WHERE module = ? ORDER BY date, time', [module]);
    return rows || [];
  }
}

module.exports = Timetable;

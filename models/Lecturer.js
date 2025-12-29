const pool = require('../config/database');

class Lecturer {
  static async getAll() {
    const [rows] = await pool.query('SELECT id, name, module, phone, created_at FROM lecturers ORDER BY id');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM lecturers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(name, module, phone) {
    const [result] = await pool.execute(
      'INSERT INTO lecturers (name, module, phone) VALUES (?, ?, ?)',
      [name, module, phone]
    );
    return { id: result.insertId, name, module, phone };
  }

  static async update(id, name, module, phone) {
    const [result] = await pool.execute(
      'UPDATE lecturers SET name = ?, module = ?, phone = ? WHERE id = ?',
      [name, module, phone, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM lecturers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByModule(module) {
    const [rows] = await pool.query('SELECT * FROM lecturers WHERE module = ?', [module]);
    return rows || [];
  }
}

module.exports = Lecturer;

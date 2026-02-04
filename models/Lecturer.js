const pool = require('../config/database');

class Lecturer {
  static async getAll() {
    const result = await pool.query('SELECT id, name, module, phone, created_at FROM lecturers ORDER BY id');
    const [rows] = result;
    return rows || [];
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM lecturers WHERE id = ?', [id]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async create(name, module, phone) {
    const result = await pool.query(
      'INSERT INTO lecturers (name, module, phone) VALUES (?, ?, ?)',
      [name, module, phone]
    );
    const [insertResult] = result;
    return { id: insertResult.insertId, name, module, phone };
  }

  static async update(id, name, module, phone) {
    const result = await pool.query(
      'UPDATE lecturers SET name = ?, module = ?, phone = ? WHERE id = ?',
      [name, module, phone, id]
    );
    const [updateResult] = result;
    return updateResult.affectedRows > 0;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM lecturers WHERE id = ?', [id]);
    const [deleteResult] = result;
    return deleteResult.affectedRows > 0;
  }

  static async findByModule(module) {
    const result = await pool.query('SELECT * FROM lecturers WHERE module = ?', [module]);
    const [rows] = result;
    return rows || [];
  }
}

module.exports = Lecturer;

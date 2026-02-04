const pool = require('../config/database');

class Module {
  static async getAll() {
    const result = await pool.query('SELECT id, code, name, created_at FROM modules ORDER BY code');
    const [rows] = result;
    return rows || [];
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM modules WHERE id = ?', [id]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async getByCode(code) {
    const result = await pool.query('SELECT * FROM modules WHERE code = ?', [code]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async create(code, name) {
    const result = await pool.query(
      'INSERT INTO modules (code, name) VALUES (?, ?)',
      [code, name]
    );
    const [insertResult] = result;
    return { id: insertResult.insertId, code, name };
  }

  static async update(id, code, name) {
    const result = await pool.query(
      'UPDATE modules SET code = ?, name = ? WHERE id = ?',
      [code, name, id]
    );
    const [updateResult] = result;
    return updateResult.affectedRows > 0;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM modules WHERE id = ?', [id]);
    const [deleteResult] = result;
    return deleteResult.affectedRows > 0;
  }
}

module.exports = Module;

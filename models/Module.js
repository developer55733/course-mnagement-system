const pool = require('../config/database');

class Module {
  static async getAll() {
    const [rows] = await pool.query('SELECT id, code, name, created_at FROM modules ORDER BY code');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM modules WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async getByCode(code) {
    const [rows] = await pool.query('SELECT * FROM modules WHERE code = ?', [code]);
    return rows[0] || null;
  }

  static async create(code, name) {
    const [result] = await pool.execute(
      'INSERT INTO modules (code, name) VALUES (?, ?)',
      [code, name]
    );
    return { id: result.insertId, code, name };
  }

  static async update(id, code, name) {
    const [result] = await pool.execute(
      'UPDATE modules SET code = ?, name = ? WHERE id = ?',
      [code, name, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM modules WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Module;

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async getAll() {
    const result = await query('SELECT id, name, email, student_id, role, created_at FROM users');
    const [rows] = result;
    return rows || [];
  }

  static async getById(id) {
    const result = await query('SELECT id, name, email, student_id, role, created_at FROM users WHERE id = ?', [id]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async findByStudentId(studentId) {
    const result = await query('SELECT * FROM users WHERE student_id = ?', [studentId]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);
    const [rows] = result;
    return rows && rows[0] ? rows[0] : null;
  }

  static async create(name, email, password, studentId = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password, student_id, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, studentId, 'user']
    );
    const [insertResult] = result;
    return { id: insertResult?.insertId, name, email, student_id: studentId, role: 'user' };
  }

  static async createAdmin(name, email, password, studentId = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (name, email, password, student_id, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, studentId, 'admin']
    );
    const [insertResult] = result;
    return { id: insertResult?.insertId, name, email, student_id: studentId, role: 'admin' };
  }

  static async verifyPassword(storedPassword, inputPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }

  static async update(id, name, email) {
    const result = await query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    const [updateResult] = result;
    return updateResult?.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    const result = await query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    const [updateResult] = result;
    return updateResult?.affectedRows > 0;
  }

  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    const [deleteResult] = result;
    return deleteResult?.affectedRows > 0;
  }
}

module.exports = User;

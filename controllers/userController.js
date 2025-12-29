const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, studentId } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, and password required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Check if studentId is already used
    if (studentId) {
      const existingStudent = await User.findByStudentId(studentId);
      if (existingStudent) {
        return res.status(400).json({ success: false, error: 'Student ID already registered' });
      }
    }

    const user = await User.create(name, email, password, studentId);
    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, studentId, password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'password required' });
    }

    if (!email && !studentId) {
      return res.status(400).json({ success: false, error: 'email or studentId required' });
    }

    let user;
    if (email) {
      user = await User.findByEmail(email);
    } else if (studentId) {
      user = await User.findByStudentId(studentId);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const passwordMatch = await User.verifyPassword(user.password, password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      message: 'Login successful', 
      data: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        studentId: user.student_id,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, studentId, password, adminSecret } = req.body;
    
    // Verify admin secret first
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Invalid admin secret' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'password required' });
    }

    if (!email && !studentId) {
      return res.status(400).json({ success: false, error: 'email or studentId required' });
    }

    let user;
    if (email) {
      user = await User.findByEmail(email);
    } else if (studentId) {
      user = await User.findByStudentId(studentId);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'This account is not an admin account' });
    }

    const passwordMatch = await User.verifyPassword(user.password, password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      message: 'Admin login successful', 
      data: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        studentId: user.student_id,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, studentId, adminSecret } = req.body;
    
    // Simple admin verification (use environment variable for production)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Invalid admin credentials' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, and password required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const admin = await User.createAdmin(name, email, password, studentId);
    res.status(201).json({ success: true, message: 'Admin created successfully', data: admin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'name, email, and password required' });
    }
    const user = await User.create(name, email, password);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'name and email required' });
    }
    const updated = await User.update(id, name, email);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.healthCheck = async (req, res) => {
  try {
    const [rows] = await require('../config/database').query('SELECT 1 as ok');
    res.json({ success: true, status: 'healthy', db: 'connected' });
  } catch (error) {
    res.status(500).json({ success: false, status: 'unhealthy', db: 'disconnected', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'oldPassword and newPassword required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const match = await User.verifyPassword(user.password, oldPassword);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    const updated = await User.updatePassword(id, newPassword);
    if (!updated) {
      return res.status(500).json({ success: false, error: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

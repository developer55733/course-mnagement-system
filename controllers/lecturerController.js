const Lecturer = require('../models/Lecturer');

exports.getAllLecturers = async (req, res) => {
  try {
    const lecturers = await Lecturer.getAll();
    res.json({ success: true, data: lecturers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLecturerById = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturer = await Lecturer.getById(id);
    if (!lecturer) {
      return res.status(404).json({ success: false, error: 'Lecturer not found' });
    }
    res.json({ success: true, data: lecturer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createLecturer = async (req, res) => {
  try {
    const { name, module, phone } = req.body;
    
    if (!name || !module || !phone) {
      return res.status(400).json({ success: false, error: 'name, module, and phone are required' });
    }

    const lecturer = await Lecturer.create(name, module, phone);
    res.status(201).json({ success: true, message: 'Lecturer created successfully', data: lecturer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, module, phone } = req.body;
    
    if (!name || !module || !phone) {
      return res.status(400).json({ success: false, error: 'name, module, and phone are required' });
    }

    const success = await Lecturer.update(id, name, module, phone);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Lecturer not found' });
    }

    res.json({ success: true, message: 'Lecturer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Lecturer.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Lecturer not found' });
    }

    res.json({ success: true, message: 'Lecturer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLecturersByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const lecturers = await Lecturer.findByModule(module);
    res.json({ success: true, data: lecturers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.clearAllLecturers = async (req, res) => {
  try {
    const success = await Lecturer.clearAll();
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to clear lecturers' });
    }

    res.json({ success: true, message: 'All lecturers have been deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

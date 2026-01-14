const Module = require('../models/Module');
const Lecturer = require('../models/Lecturer');

exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.getAll();
    // attach lecturer name (first lecturer found for the module) if available
    const enriched = await Promise.all(modules.map(async (m) => {
      const lecturers = await Lecturer.findByModule(m.code);
      return { ...m, lecturer: (lecturers && lecturers[0]) ? lecturers[0].name : null };
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.getById(id);
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getModuleByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const module = await Module.getByCode(code);
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const { code, name, lecturer, phone } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, error: 'code and name are required' });
    }

    // Check if module already exists
    const existingModule = await Module.getByCode(code);
    if (existingModule) {
      return res.status(400).json({ success: false, error: 'Module with this code already exists' });
    }

    const module = await Module.create(code, name);

    // If lecturer provided, create a lecturer entry linked to this module code
    if (lecturer && lecturer.trim()) {
      try {
        await Lecturer.create(lecturer.trim(), code, phone || '');
      } catch (err) {
        // non-fatal: log but continue
        console.warn('Could not create lecturer while creating module:', err.message);
      }
    }

    res.status(201).json({ success: true, message: 'Module created successfully', data: module });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({ success: false, error: 'code and name are required' });
    }

    const success = await Module.update(id, code, name);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    res.json({ success: true, message: 'Module updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Module.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

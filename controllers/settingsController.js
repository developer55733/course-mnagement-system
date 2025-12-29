const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.get();
    if (!settings) {
      return res.status(404).json({ success: false, error: 'Settings not configured' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { academicYear, semester, institutionName } = req.body;
    
    if (!academicYear || !semester || !institutionName) {
      return res.status(400).json({ success: false, error: 'academicYear, semester, and institutionName are required' });
    }

    const settings = await Settings.update(academicYear, semester, institutionName);
    if (!settings) {
      return res.status(500).json({ success: false, error: 'Failed to update settings' });
    }

    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

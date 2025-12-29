const Timetable = require('../models/Timetable');

exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.getAll();
    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.getById(id);
    if (!timetable) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const { test, module, date, time, venue } = req.body;
    
    if (!test || !module || !date || !time || !venue) {
      return res.status(400).json({ success: false, error: 'test, module, date, time, and venue are required' });
    }

    const timetable = await Timetable.create(test, module, date, time, venue);
    res.status(201).json({ success: true, message: 'Test scheduled successfully', data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { test, module, date, time, venue } = req.body;
    
    if (!test || !module || !date || !time || !venue) {
      return res.status(400).json({ success: false, error: 'test, module, date, time, and venue are required' });
    }

    const success = await Timetable.update(id, test, module, date, time, venue);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, message: 'Timetable updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Timetable.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    res.json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTimetableByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const timetables = await Timetable.getByModule(module);
    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

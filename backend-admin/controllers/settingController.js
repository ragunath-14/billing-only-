const Setting = require('../models/Setting');

// In-memory cache (settings rarely change, avoids hitting DB on every page load)
let settingsCache = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

// GET settings (cached)
exports.getSettings = async (req, res) => {
  try {
    const now = Date.now();
    if (settingsCache && now - cacheTime < CACHE_TTL) {
      return res.json(settingsCache);
    }
    let setting = await Setting.findOne().lean();
    if (!setting) {
      setting = new Setting();
      await setting.save();
      setting = setting.toObject();
    }
    settingsCache = setting;
    cacheTime = Date.now();
    res.json(setting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST update settings (invalidates cache)
exports.updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting(req.body);
    } else {
      Object.assign(setting, req.body);
    }
    await setting.save();
    // Invalidate cache so next GET picks up new data
    settingsCache = setting.toObject();
    cacheTime = Date.now();
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

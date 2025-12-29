const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

module.exports = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.body?.adminSecret || req.query?.adminSecret;
  
  if (!secret || secret !== ADMIN_SECRET) {
    // If it's a page request (HTML), redirect to admin login page
    if (req.accepts('html')) {
      return res.status(403).render('admin', { 
        title: 'Admin Panel',
        error: 'Admin authentication required. Please enter your admin secret.'
      });
    }
    // If it's an API request, return JSON error
    return res.status(403).json({ success: false, error: 'Admin authorization required' });
  }
  next();
};

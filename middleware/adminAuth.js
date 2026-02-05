const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

module.exports = (req, res, next) => {
  const secret = req.headers['x-admin-secret'] || req.body?.adminSecret || req.query?.adminSecret;
  
  console.log('🔍 Admin auth check:', {
    path: req.path,
    method: req.method,
    secretProvided: !!secret,
    expectedSecret: ADMIN_SECRET,
    headerSecret: req.headers['x-admin-secret'],
    bodySecret: req.body?.adminSecret,
    querySecret: req.query?.adminSecret
  });
  
  if (!secret || secret !== ADMIN_SECRET) {
    console.log('❌ Admin auth failed');
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
  
  console.log('✅ Admin auth successful');
  next();
};

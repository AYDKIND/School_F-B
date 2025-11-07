// Lightweight optional CSRF header check middleware.
// For production, prefer robust solutions like `csurf` with same-site cookies.

const ENABLED = (process.env.ENABLE_CSRF || 'false').toLowerCase() === 'true';
const HEADER_NAME = process.env.CSRF_HEADER_NAME || 'x-csrf-token';

// Unsafe HTTP methods that should be protected
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function csrfCheck(req, res, next) {
  if (!ENABLED) return next();

  if (!UNSAFE_METHODS.has(req.method)) return next();

  const token = req.headers[HEADER_NAME];
  if (!token) {
    return res.status(403).json({ success: false, message: 'CSRF token missing' });
  }

  // In a real implementation, validate the token against a session or signed cookie.
  // This placeholder allows any non-empty token for demonstration/testing.
  return next();
}

module.exports = { csrfCheck };
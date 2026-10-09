import httpError from '../utils/httpError.js';

export default function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, `Only ${roles.join('/')} accounts can do this`));
    }
    next();
  };
}
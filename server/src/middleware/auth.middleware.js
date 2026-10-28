import { auth, db, isMock } from '../config/firebase.js';
import { AppError } from './error.middleware.js';

/**
 * Authentication middleware verifying Firebase Auth ID tokens
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split('Bearer ')[1].trim();

    if (!token) {
      throw new AppError('Authentication token is empty', 401, 'UNAUTHORIZED');
    }

    // Dev / Test mock tokens support
    if (isMock || process.env.NODE_ENV === 'test') {
      if (token.startsWith('mock_')) {
        const role = token.includes('admin') ? 'admin' : 'sales_rep';
        req.user = {
          uid: `user_${role}_123`,
          email: `${role}@ove.com`,
          name: role === 'admin' ? 'Admin User' : 'Sales Representative',
          role,
        };
        return next();
      }
    }

    // Live Firebase Admin ID Token Verification
    if (!auth) {
      throw new AppError('Authentication service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }

    const decoded = await auth.verifyIdToken(token);
    
    // Check user role from custom claims or Firestore profile
    let role = decoded.role || 'sales_rep';
    let name = decoded.name || decoded.email?.split('@')[0] || 'User';

    if (db && !decoded.role) {
      try {
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          role = userData.role || role;
          name = userData.name || name;
        }
      } catch (dbErr) {
        console.warn('[Auth Middleware] Failed to fetch user role from Firestore:', dbErr.message);
      }
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name,
      role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN', error.message));
  }
}

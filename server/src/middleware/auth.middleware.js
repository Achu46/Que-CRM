import { auth, db, isMock } from '../config/firebase.js';
import { AppError } from './error.middleware.js';

/**
 * Authentication and Multi-Tenant Context Middleware
 * Resolves Firebase Auth JWT and isolates requests to active tenant (x-tenant-id).
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

    const requestedTenantId = req.headers['x-tenant-id'] || 'org_ove_main';

    // Dev / Test mock tokens support
    if (isMock || process.env.NODE_ENV === 'test') {
      if (token.startsWith('mock_')) {
        const role = token.includes('admin') ? 'admin' : 'sales_rep';
        req.user = {
          uid: `user_${role}_123`,
          email: `${role}@ove.com`,
          name: role === 'admin' ? 'Admin User' : 'Sales Representative',
          role,
          tenantId: requestedTenantId,
          tenants: [
            { tenantId: 'org_ove_main', name: 'OVE Solutions HQ', role: 'admin' },
            { tenantId: 'org_que_corp', name: 'QUE Global Enterprises', role: 'admin' },
          ],
        };
        return next();
      }
    }

    // Live Firebase Admin ID Token Verification
    if (!auth) {
      throw new AppError('Authentication service unavailable', 503, 'SERVICE_UNAVAILABLE');
    }

    const decoded = await auth.verifyIdToken(token);
    
    // Check user role & tenant permissions from claims or Firestore
    let role = decoded.role || 'sales_rep';
    let name = decoded.name || decoded.email?.split('@')[0] || 'User';
    let tenantId = requestedTenantId;

    if (db && !decoded.role) {
      try {
        const userDoc = await db.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          role = userData.role || role;
          name = userData.name || name;
          tenantId = requestedTenantId || userData.tenantId || 'org_ove_main';
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
      tenantId,
      tenants: [
        { tenantId: 'org_ove_main', name: 'OVE Solutions HQ', role: 'admin' },
        { tenantId: 'org_que_corp', name: 'QUE Global Enterprises', role: 'admin' },
      ],
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN', error.message));
  }
}

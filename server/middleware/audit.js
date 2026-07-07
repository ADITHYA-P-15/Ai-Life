/**
 * audit.js — lightweight request/activity logging for safety and misuse monitoring.
 */

import { query } from '../config/db.js';

const MAX_DETAILS_LENGTH = 500;

function truncate(value, length = MAX_DETAILS_LENGTH) {
  const stringValue = String(value ?? '');
  return stringValue.length > length ? `${stringValue.slice(0, length - 1)}…` : stringValue;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket?.remoteAddress || null;
}

export async function logAuditEvent({ userId = null, action, details = '', ipAddress = null, method = null, path = null, success = true }) {
  try {
    await query(
      `INSERT INTO audit_events (user_id, action, details, ip_address, request_method, request_path, success)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, truncate(details), ipAddress, method, path, success]
    );
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
}

export function auditMiddleware(req, res, next) {
  res.on('finish', () => {
    if (!req.path.startsWith('/api') || req.path === '/api/health') return;

    const action = req.path.includes('/auth/login')
      ? 'auth.login'
      : req.path.includes('/auth/register')
        ? 'auth.register'
        : 'request';

    void logAuditEvent({
      userId: req.user?.id ?? null,
      action,
      details: `${req.method} ${req.path}`,
      ipAddress: getClientIp(req),
      method: req.method,
      path: req.path,
      success: res.statusCode < 400,
    });
  });

  next();
}

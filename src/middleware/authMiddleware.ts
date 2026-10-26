/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, AuditLogRecord } from '../db/authModel.ts';

// Clave secreta para firma y validación de tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'crocant-tour-buga-jwt-secret-key-2026-secure';
const TOKEN_EXPIRATION = '8h';

// Interfaz para extender Request de Express con la identidad autenticada
export interface AuthenticatedUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  sede: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Emisión de token JWT con claims firmados
export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      sede: user.sede,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

// Verificación y decodificación del token JWT
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Referencia a función de auditoría (inyectada por el servidor)
let auditLogHandler: ((entry: Omit<AuditLogRecord, 'id' | 'timestamp'>) => void) | null = null;

export function setAuditLogger(handler: (entry: Omit<AuditLogRecord, 'id' | 'timestamp'>) => void) {
  auditLogHandler = handler;
}

/**
 * Middleware: authenticateToken
 * Extrae y valida el token Bearer JWT desde el header 'Authorization'.
 * Si el token es inválido o no existe, retorna HTTP 401 Unauthorized.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      code: 'AUTH_TOKEN_MISSING',
      message: 'Cabecera de autenticación ausente. Debe incluir un Bearer Token válido para acceder.',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      code: 'AUTH_TOKEN_INVALID',
      message: 'Token de sesión expirado o firma criptográfica no válida.',
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: requireRole(allowedRoles)
 * Valida que el rol del usuario autenticado esté autorizado.
 * Si un usuario con rol 'asesor' intenta acceder a rutas restringidas
 * (edición, anulación o reportes financieros), retorna HTTP 403 Forbidden
 * y graba una infracción inmutable en logs_auditoria.
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'HTTP 401 Unauthorized',
        code: 'AUTH_REQUIRED',
        message: 'Sesión no identificada.',
      });
    }

    if (!allowedRoles.includes(user.rol)) {
      const endpoint = `${req.method} ${req.originalUrl || req.url}`;
      const violationDetail = {
        mensaje: `Violación RBAC: El rol '${user.rol}' intentó ejecutar una acción no autorizada.`,
        rolesPermitidos: allowedRoles,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      // Registrar en la bitácora de auditoría inmutable
      if (auditLogHandler) {
        auditLogHandler({
          usuario_id: user.id,
          email_usuario: user.email,
          rol_usuario: user.rol,
          accion: 'INTENTO_RBAC_BLOQUEADO',
          metodo_http: req.method,
          ruta_endpoint: req.originalUrl || req.url,
          codigo_respuesta: 403,
          ip_origen: req.ip,
          agente_usuario: req.headers['user-agent'],
          detalles: violationDetail,
          es_violacion_rbac: true,
        });
      }

      // Respuesta estricta HTTP 403 Forbidden
      return res.status(403).json({
        error: 'HTTP 403 Forbidden',
        code: 'RBAC_ACCESS_DENIED',
        message:
          user.rol === 'asesor'
            ? "Acceso denegado: Por política de seguridad estricta (RBAC), el rol 'asesor' tiene prohibido editar registros existentes, anular comandas o consultar reportes financieros (Regla de negocio Crocant Tour / Chopra & Meindl)."
            : "Acceso denegado: Su rol no posee las credenciales requeridas para esta operación.",
        usuario: {
          id: user.id,
          email: user.email,
          rol: user.rol,
        },
        accionIntentada: endpoint,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}

/**
 * Middleware: enforceAsesorRestrictions
 * Guardián general que intercepta automáticamente cualquier intento
 * de modificación (PUT, PATCH, DELETE o subrutas /void) cuando el
 * usuario tiene rol 'asesor', garantizando consistencia en todo el API.
 */
export function enforceAsesorRestrictions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const isModificationMethod = ['PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isVoidOrReportPath =
    req.path.includes('/void') ||
    req.path.includes('/reports/financial') ||
    (req.path.includes('/cash-register') && req.path.includes('/reopen'));

  if (user && user.rol === 'asesor' && (isModificationMethod || isVoidOrReportPath)) {
    return requireRole(['admin'])(req, res, next);
  }

  next();
}

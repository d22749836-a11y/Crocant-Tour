/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'asesor';

export interface DBUser {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: UserRole;
  documento_identidad: string;
  telefono: string;
  sede: string;
  activo: boolean;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  rol: UserRole;
  modulo: 'pos' | 'inventario' | 'pedidos' | 'caja' | 'reportes' | 'usuarios' | '5s';
  accion: 'crear' | 'leer' | 'actualizar' | 'anular' | 'autorizar' | 'cerrar' | 'administrar';
  permitido: boolean;
  descripcion: string;
}

export interface AuditLogRecord {
  id: string;
  usuario_id?: string;
  email_usuario: string;
  rol_usuario: UserRole;
  accion: string;
  metodo_http: string;
  ruta_endpoint: string;
  codigo_respuesta: number;
  ip_origen?: string;
  agente_usuario?: string;
  detalles?: Record<string, any>;
  es_violacion_rbac: boolean;
  timestamp: string;
}

// JSON Schema definition for runtime validations and data interchange
export const DATABASE_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'CrocantTourDatabaseSchema',
  type: 'object',
  definitions: {
    Usuario: {
      type: 'object',
      required: ['id', 'nombre', 'email', 'password_hash', 'rol', 'documento_identidad', 'activo'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombre: { type: 'string', minLength: 2, maxLength: 120 },
        email: { type: 'string', format: 'email' },
        password_hash: { type: 'string' },
        rol: { type: 'string', enum: ['admin', 'asesor'] },
        documento_identidad: { type: 'string' },
        telefono: { type: 'string' },
        sede: { type: 'string' },
        activo: { type: 'boolean', default: true },
        ultimo_acceso: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
    RolesPermisos: {
      type: 'object',
      required: ['id', 'rol', 'modulo', 'accion', 'permitido'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        rol: { type: 'string', enum: ['admin', 'asesor'] },
        modulo: { type: 'string', enum: ['pos', 'inventario', 'pedidos', 'caja', 'reportes', 'usuarios', '5s'] },
        accion: { type: 'string', enum: ['crear', 'leer', 'actualizar', 'anular', 'autorizar', 'cerrar', 'administrar'] },
        permitido: { type: 'boolean' },
        descripcion: { type: 'string' },
      },
    },
    LogsAuditoria: {
      type: 'object',
      required: ['id', 'email_usuario', 'rol_usuario', 'accion', 'metodo_http', 'ruta_endpoint', 'codigo_respuesta', 'es_violacion_rbac', 'timestamp'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        usuario_id: { type: ['string', 'null'], format: 'uuid' },
        email_usuario: { type: 'string', format: 'email' },
        rol_usuario: { type: 'string', enum: ['admin', 'asesor'] },
        accion: { type: 'string' },
        metodo_http: { type: 'string' },
        ruta_endpoint: { type: 'string' },
        codigo_respuesta: { type: 'integer' },
        ip_origen: { type: 'string' },
        detalles: { type: 'object' },
        es_violacion_rbac: { type: 'boolean' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  },
};

// Default seed users with pre-hashed passwords using bcrypt (work factor 10)
const SALT_ROUNDS = 10;
export const DEFAULT_PASSWORD_ADMIN = 'CrocantAdmin2026*';
export const DEFAULT_PASSWORD_ASESOR = 'CrocantAsesor2026*';

export const INITIAL_DB_USERS: DBUser[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nombre: 'Carlos Duque',
    email: 'admin@crocanttour.com',
    password_hash: bcrypt.hashSync(DEFAULT_PASSWORD_ADMIN, SALT_ROUNDS),
    rol: 'admin',
    documento_identidad: 'CC 1.115.890.124',
    telefono: '316 489 1234',
    sede: 'Sede Principal Buga - Carrera 14 # 5-32',
    activo: true,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-26T08:00:00Z',
  },
  {
    id: 'b1ffcd88-8b1a-3de7-aa5c-5aa8ac270b22',
    nombre: 'Valentina Ríos',
    email: 'asesor@crocanttour.com',
    password_hash: bcrypt.hashSync(DEFAULT_PASSWORD_ASESOR, SALT_ROUNDS),
    rol: 'asesor',
    documento_identidad: 'CC 1.116.402.819',
    telefono: '318 721 9081',
    sede: 'Sede Principal Buga - Carrera 14 # 5-32',
    activo: true,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-26T08:00:00Z',
  },
];

export const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  // Admin permissions
  { id: 'p-01', rol: 'admin', modulo: 'pos', accion: 'crear', permitido: true, descripcion: 'Crear ventas en mostrador o domicilios' },
  { id: 'p-02', rol: 'admin', modulo: 'pos', accion: 'leer', permitido: true, descripcion: 'Consultar productos y disponibilidad' },
  { id: 'p-03', rol: 'admin', modulo: 'pedidos', accion: 'actualizar', permitido: true, descripcion: 'Editar comandas y pedidos existentes' },
  { id: 'p-04', rol: 'admin', modulo: 'pedidos', accion: 'anular', permitido: true, descripcion: 'Anular pedidos y devolver materias primas al stock' },
  { id: 'p-05', rol: 'admin', modulo: 'inventario', accion: 'leer', permitido: true, descripcion: 'Consultar inventario en tiempo real' },
  { id: 'p-06', rol: 'admin', modulo: 'inventario', accion: 'actualizar', permitido: true, descripcion: 'Modificar stock de seguridad (SS) y punto de reorden (ROP)' },
  { id: 'p-07', rol: 'admin', modulo: 'inventario', accion: 'crear', permitido: true, descripcion: 'Registrar recepción e ingreso de materias primas' },
  { id: 'p-08', rol: 'admin', modulo: 'caja', accion: 'cerrar', permitido: true, descripcion: 'Cerrar y asentar cuadres de caja' },
  { id: 'p-09', rol: 'admin', modulo: 'caja', accion: 'actualizar', permitido: true, descripcion: 'Reabrir o modificar arqueos de caja' },
  { id: 'p-10', rol: 'admin', modulo: 'reportes', accion: 'leer', permitido: true, descripcion: 'Ver reportes financieros, márgenes y P&L' },
  { id: 'p-11', rol: 'admin', modulo: 'usuarios', accion: 'crear', permitido: true, descripcion: 'Administrar usuarios y permisos' },
  { id: 'p-12', rol: 'admin', modulo: '5s', accion: 'autorizar', permitido: true, descripcion: 'Autorizar baja definitiva de Tarjetas Rojas (1S Seiri)' },

  // Asesor permissions (Strict RBAC business rules)
  { id: 'p-20', rol: 'asesor', modulo: 'pos', accion: 'crear', permitido: true, descripcion: 'Crear ventas operativas' },
  { id: 'p-21', rol: 'asesor', modulo: 'pos', accion: 'leer', permitido: true, descripcion: 'Consultar menú y precios' },
  { id: 'p-22', rol: 'asesor', modulo: 'pedidos', accion: 'actualizar', permitido: false, descripcion: 'PROHIBIDO: No puede editar pedidos guardados' },
  { id: 'p-23', rol: 'asesor', modulo: 'pedidos', accion: 'anular', permitido: false, descripcion: 'PROHIBIDO: No puede anular pedidos' },
  { id: 'p-24', rol: 'asesor', modulo: 'inventario', accion: 'leer', permitido: true, descripcion: 'Consultar existencias y ubicación 5S' },
  { id: 'p-25', rol: 'asesor', modulo: 'inventario', accion: 'actualizar', permitido: false, descripcion: 'PROHIBIDO: No puede alterar costos ni parámetros' },
  { id: 'p-26', rol: 'asesor', modulo: 'inventario', accion: 'crear', permitido: true, descripcion: 'Registrar ingreso de materias primas con remisión' },
  { id: 'p-27', rol: 'asesor', modulo: 'caja', accion: 'cerrar', permitido: true, descripcion: 'Registrar arqueo de turno' },
  { id: 'p-28', rol: 'asesor', modulo: 'caja', accion: 'actualizar', permitido: false, descripcion: 'PROHIBIDO: No puede reabrir ni modificar el cuadre guardado' },
  { id: 'p-29', rol: 'asesor', modulo: 'reportes', accion: 'leer', permitido: false, descripcion: 'PROHIBIDO: Sin acceso a balances financieros' },
  { id: 'p-30', rol: 'asesor', modulo: 'usuarios', accion: 'crear', permitido: false, descripcion: 'PROHIBIDO: Sin privilegios de gestión de usuarios' },
  { id: 'p-31', rol: 'asesor', modulo: '5s', accion: 'autorizar', permitido: false, descripcion: 'PROHIBIDO: Solo emite tarjeta roja preliminar' },
];

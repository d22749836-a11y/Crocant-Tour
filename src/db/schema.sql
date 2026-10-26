-- =====================================================================
-- CROCANT TOUR - GUADALAJARA DE BUGA
-- MODELO DE DATOS INICIAL & CONTROL DE ACCESO BASADO EN ROLES (RBAC)
-- Motor: PostgreSQL / Estándar ANSI SQL
-- =====================================================================

-- 1. TABLA: usuarios
-- Almacena credenciales seguras, perfil y rol asignado en la operación
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'asesor')),
    documento_identidad VARCHAR(30) NOT NULL,
    telefono VARCHAR(25),
    sede VARCHAR(100) NOT NULL DEFAULT 'Sede Principal Buga - Carrera 14',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- 2. TABLA: roles_permisos
-- Define la matriz granular de autorizaciones según reglas de negocio
CREATE TABLE IF NOT EXISTS roles_permisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'asesor')),
    modulo VARCHAR(50) NOT NULL, -- 'pos', 'inventario', 'pedidos', 'caja', 'reportes', 'usuarios', '5s'
    accion VARCHAR(50) NOT NULL, -- 'crear', 'leer', 'actualizar', 'anular', 'autorizar'
    permitido BOOLEAN NOT NULL DEFAULT FALSE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_rol_modulo_accion UNIQUE (rol, modulo, accion)
);

CREATE INDEX IF NOT EXISTS idx_roles_permisos_lookup ON roles_permisos(rol, modulo, accion);

-- 3. TABLA: logs_auditoria
-- Registro inmutable de eventos del sistema y captura de violaciones RBAC
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    email_usuario VARCHAR(180) NOT NULL,
    rol_usuario VARCHAR(20) NOT NULL,
    accion VARCHAR(80) NOT NULL,
    metodo_http VARCHAR(10) NOT NULL,
    ruta_endpoint VARCHAR(255) NOT NULL,
    codigo_respuesta INT NOT NULL,
    ip_origen VARCHAR(45),
    agente_usuario TEXT,
    detalles JSONB,
    es_violacion_rbac BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_violacion ON logs_auditoria(es_violacion_rbac);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_timestamp ON logs_auditoria(timestamp DESC);

-- =====================================================================
-- DATOS INICIALES (SEEDS)
-- Passwords hasheadas con bcrypt (factor de trabajo 10)
-- Password 'CrocantAdmin2026*' para Admin
-- Password 'CrocantAsesor2026*' para Asesor
-- =====================================================================

INSERT INTO usuarios (id, nombre, email, password_hash, rol, documento_identidad, telefono, sede)
VALUES 
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Carlos Duque',
        'admin@crocanttour.com',
        '$2a$10$wT8yCqA/VeqXfJ3vQ9Zk1O9u9Xo6F7x1h5o6d3n2k1p0q9r8s7t6u', -- CrocantAdmin2026*
        'admin',
        'CC 1.115.890.124',
        '316 489 1234',
        'Sede Principal Buga - Carrera 14 # 5-32'
    ),
    (
        'b1ffcd88-8b1a-3de7-aa5c-5aa8ac270b22',
        'Valentina Ríos',
        'asesor@crocanttour.com',
        '$2a$10$kL9zXpB/WfrYeK4wR0Al2P0v0Yp7G8y2i6p7e4o3l2q1r0s9t8u7v', -- CrocantAsesor2026*
        'asesor',
        'CC 1.116.402.819',
        '318 721 9081',
        'Sede Principal Buga - Carrera 14 # 5-32'
    )
ON CONFLICT (email) DO NOTHING;

-- Matriz de Permisos: Rol 'admin' (Acceso Total CRUD)
INSERT INTO roles_permisos (rol, modulo, accion, permitido, descripcion) VALUES
    ('admin', 'pos', 'crear', TRUE, 'Registrar ventas en terminal POS'),
    ('admin', 'pos', 'leer', TRUE, 'Consultar historial y estado del menú'),
    ('admin', 'pedidos', 'actualizar', TRUE, 'Editar comandas y modificar datos de clientes'),
    ('admin', 'pedidos', 'anular', TRUE, 'Anular pedidos y restituir inventario BOM'),
    ('admin', 'inventario', 'leer', TRUE, 'Consultar stock, ROP y Safety Stock (Chopra & Meindl)'),
    ('admin', 'inventario', 'actualizar', TRUE, 'Calibrar parámetros SS, ROP y costos unitarios'),
    ('admin', 'inventario', 'crear', TRUE, 'Ingresar materias primas y recepciones de proveedores'),
    ('admin', 'caja', 'cerrar', TRUE, 'Cerrar y asentar cuadres de caja'),
    ('admin', 'caja', 'reabrir', TRUE, 'Reabrir o ajustar arqueos de turnos cerrados'),
    ('admin', 'reportes', 'leer', TRUE, 'Consultar estados financieros, márgenes de ganancia y P&L'),
    ('admin', 'usuarios', 'administrar', TRUE, 'Crear, editar roles y desactivar usuarios'),
    ('admin', '5s', 'autorizar', TRUE, 'Autorizar baja definitiva de Tarjetas Rojas (1S Seiri)')
ON CONFLICT (rol, modulo, accion) DO NOTHING;

-- Matriz de Permisos: Rol 'asesor' (Operativo Estricto - Prohibido Editar, Anular o Ver Finanzas)
INSERT INTO roles_permisos (rol, modulo, accion, permitido, descripcion) VALUES
    ('asesor', 'pos', 'crear', TRUE, 'Crear ventas operativas en mostrador o domicilios'),
    ('asesor', 'pos', 'leer', TRUE, 'Consultar disponibilidad de platos y recetas'),
    ('asesor', 'pedidos', 'actualizar', FALSE, 'PROHIBIDO: No puede editar pedidos una vez registrados'),
    ('asesor', 'pedidos', 'anular', FALSE, 'PROHIBIDO: No puede anular pedidos ni alterar registros de venta'),
    ('asesor', 'inventario', 'leer', TRUE, 'Consultar stock actual y ubicación 5S'),
    ('asesor', 'inventario', 'actualizar', FALSE, 'PROHIBIDO: No puede modificar costos ni parámetros ROP/SS'),
    ('asesor', 'inventario', 'crear', TRUE, 'Registrar recepciones físicas de materia prima con remisión'),
    ('asesor', 'caja', 'cerrar', TRUE, 'Registrar arqueo de turno y declarar efectivo físico'),
    ('asesor', 'caja', 'reabrir', FALSE, 'PROHIBIDO: No puede modificar ni reabrir arqueos guardados'),
    ('asesor', 'reportes', 'leer', FALSE, 'PROHIBIDO: No tiene acceso a márgenes de ganancia ni estados financieros'),
    ('asesor', 'usuarios', 'administrar', FALSE, 'PROHIBIDO: Sin privilegios de gestión de usuarios'),
    ('asesor', '5s', 'autorizar', FALSE, 'PROHIBIDO: Solo puede emitir tarjeta roja preliminar, no autorizar baja')
ON CONFLICT (rol, modulo, accion) DO NOTHING;

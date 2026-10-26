/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  MenuItem,
  InventoryItem,
  Order,
  DeliveryZone,
  DeliveryDriver,
  StorageBin5S,
  RedTagItem,
  SeisoChecklog,
  FiveSAudit,
  CashShift,
  AuditLogEntry,
} from '../types';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  menu: MenuItem[];
  inventory: (InventoryItem & { inventoryStatus: string; stockValueCOP: number; daysOfSupply: number })[];
  orders: Order[];
  deliveryZones: DeliveryZone[];
  drivers: DeliveryDriver[];
  bins5S: StorageBin5S[];
  redTags: RedTagItem[];
  seisoLogs: SeisoChecklog[];
  audit5S: FiveSAudit | null;
  cashShift: CashShift | null;
  auditLogs: AuditLogEntry[];
  financials: any | null;
  isLoading: boolean;
  authToken: string | null;
  permissions: any[];
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string; title?: string } | null;
  setNotification: (notif: { type: 'success' | 'error' | 'warning' | 'info'; message: string; title?: string } | null) => void;
  switchUserRole: (role: UserRole) => Promise<void>;
  createOrder: (orderData: any) => Promise<boolean>;
  editOrder: (orderId: string, orderData: any) => Promise<boolean>;
  voidOrder: (orderId: string, voidReason: string) => Promise<boolean>;
  updateDispatchStatus: (orderId: string, status: string, driver?: string) => Promise<boolean>;
  receiveGoods: (receiptData: any) => Promise<boolean>;
  updateInventoryParams: (itemId: string, params: Partial<InventoryItem>) => Promise<boolean>;
  createRedTag: (tagData: any) => Promise<boolean>;
  authorizeRedTag: (tagId: string, actionText: string) => Promise<boolean>;
  submitSeisoLog: (logData: any) => Promise<boolean>;
  submit5SAudit: (auditData: any) => Promise<boolean>;
  closeCashShift: (closingData: any) => Promise<boolean>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-asesor-1',
    name: 'Valentina Ríos',
    email: 'caja.servicio@crocanttour.com',
    role: 'ASESOR',
    documentNumber: 'CC 1.116.402.819',
    branch: 'Sede Principal Buga - Carrera 14 # 5-32',
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('crocant_jwt_token'));
  const [permissions, setPermissions] = useState<any[]>([]);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [bins5S, setBins5S] = useState<StorageBin5S[]>([]);
  const [redTags, setRedTags] = useState<RedTagItem[]>([]);
  const [seisoLogs, setSeisoLogs] = useState<SeisoChecklog[]>([]);
  const [audit5S, setAudit5S] = useState<FiveSAudit | null>(null);
  const [cashShift, setCashShift] = useState<CashShift | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [financials, setFinancials] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    title?: string;
  } | null>(null);

  const getAuthHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Error al autenticar' };
      }

      setAuthToken(data.token);
      localStorage.setItem('crocant_jwt_token', data.token);
      setCurrentUser(data.user);
      setPermissions(data.permissions || []);
      notify(
        'success',
        `Bienvenido, ${data.user.name}. Ha iniciado sesión con rol ${data.user.role}. Token JWT verificado.`,
        'Autenticación Exitosa'
      );
      await refreshAllData();
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Fallo de conexión al servidor de autenticación' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('crocant_jwt_token');
    notify('info', 'Sesión cerrada correctamente.', 'Cierre de Sesión');
    setShowLoginModal(true);
  };

  const notify = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
    setNotification({ type, message, title });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  const fetchAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAllUsers(data.availableUsers || []);
      }
    } catch (e) {
      console.error('Error fetching auth:', e);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
      }
    } catch (e) {
      console.error('Error fetching menu:', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  const fetchLogistics = async () => {
    try {
      const res = await fetch('/api/logistics/dispatch');
      if (res.ok) {
        const data = await res.json();
        setDeliveryZones(data.zones);
        setDrivers(data.drivers);
      }
    } catch (e) {
      console.error('Error fetching logistics:', e);
    }
  };

  const fetch5S = async () => {
    try {
      const res = await fetch('/api/5s');
      if (res.ok) {
        const data = await res.json();
        setBins5S(data.bins);
        setRedTags(data.redTags);
        setSeisoLogs(data.seisoLogs);
        setAudit5S(data.audit);
      }
    } catch (e) {
      console.error('Error fetching 5S:', e);
    }
  };

  const fetchCashShift = async () => {
    try {
      const res = await fetch('/api/cash-register');
      if (res.ok) {
        const data = await res.json();
        setCashShift(data);
      }
    } catch (e) {
      console.error('Error fetching cash shift:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
  };

  const fetchFinancials = async () => {
    if (currentUser.role !== 'ADMIN') {
      setFinancials(null);
      return;
    }
    try {
      const res = await fetch('/api/reports/financial');
      if (res.ok) {
        const data = await res.json();
        setFinancials(data);
      }
    } catch (e) {
      console.error('Error fetching financials:', e);
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchAuth(),
      fetchInventory(),
      fetchMenu(),
      fetchOrders(),
      fetchLogistics(),
      fetch5S(),
      fetchCashShift(),
      fetchAuditLogs(),
      fetchFinancials(),
    ]);
  };

  useEffect(() => {
    setIsLoading(true);
    refreshAllData().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchFinancials();
  }, [currentUser.role]);

  const switchUserRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        notify(
          'info',
          `Sesión activa cambiada a: ${data.user.name} (${data.user.role === 'ADMIN' ? 'Administrador - Control Total' : 'Asesor - Operativo Estricto'})`,
          'Cambio de Rol RBAC'
        );
        refreshAllData();
      }
    } catch (e) {
      notify('error', 'No se pudo cambiar de rol');
    }
  };

  const createOrder = async (orderData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || data.error || 'Error al procesar pedido');
        return false;
      }
      notify(
        'success',
        `Pedido ${data.order.consecutiveNumber} creado con éxito ($${data.order.total.toLocaleString('es-CO')} COP). Descuento de materias primas ejecutado en tiempo real.`,
        'Venta Registrada'
      );
      await Promise.all([fetchOrders(), fetchInventory(), fetchCashShift(), fetchAuditLogs(), fetchLogistics()]);
      return true;
    } catch (e) {
      notify('error', 'Fallo de conexión al crear pedido');
      return false;
    }
  };

  const editOrder = async (orderId: string, orderData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle RBAC violation
        notify(
          'error',
          data.message || 'El rol Asesor tiene estrictamente prohibido editar un pedido registrado.',
          'Violación de Regla RBAC (Chopra & Meindl)'
        );
        fetchAuditLogs();
        return false;
      }
      notify('success', 'Pedido actualizado correctamente por el Administrador', 'Actualización Exitosa');
      refreshAllData();
      return true;
    } catch (e) {
      notify('error', 'Error al intentar editar el pedido');
      return false;
    }
  };

  const voidOrder = async (orderId: string, voidReason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voidReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify(
          'error',
          data.message || 'El rol Asesor tiene estrictamente prohibido anular ventas registradas.',
          'Violación de Regla RBAC'
        );
        fetchAuditLogs();
        return false;
      }
      notify(
        'warning',
        `Pedido ${data.order.consecutiveNumber} anulado por Administrador. Materias primas reintegradas al stock.`,
        'Anulación Autorizada'
      );
      refreshAllData();
      return true;
    } catch (e) {
      notify('error', 'Error al anular pedido');
      return false;
    }
  };

  const updateDispatchStatus = async (orderId: string, status: string, driver?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedDriver: driver }),
      });
      if (res.ok) {
        notify('info', `Estado de despacho actualizado: ${status}`, 'Logística Ballou');
        fetchOrders();
        fetchLogistics();
        return true;
      }
      return false;
    } catch (e) {
      notify('error', 'Error al actualizar despacho');
      return false;
    }
  };

  const receiveGoods = async (receiptData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/reception', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptData),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Error en recepción de mercancía');
        return false;
      }
      notify(
        'success',
        `Recepción ${data.receipt.receptionNumber} registrada correctamente. Stock y lote FEFO actualizados.`,
        'Ingreso de Materia Prima'
      );
      refreshAllData();
      return true;
    } catch (e) {
      notify('error', 'Error al procesar ingreso de inventario');
      return false;
    }
  };

  const updateInventoryParams = async (itemId: string, params: Partial<InventoryItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Solo el Administrador puede modificar parámetros de inventario', 'RBAC');
        fetchAuditLogs();
        return false;
      }
      notify('success', 'Parámetros Chopra & Meindl actualizados correctamente', 'Inventario');
      fetchInventory();
      fetchAuditLogs();
      return true;
    } catch (e) {
      notify('error', 'Error al actualizar inventario');
      return false;
    }
  };

  const createRedTag = async (tagData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/5s/red-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagData),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Error al emitir Tarjeta Roja');
        return false;
      }
      notify('warning', `Tarjeta Roja ${data.tagNumber} emitida para ${data.itemName}`, '1S Seiri - Clasificar');
      fetch5S();
      fetchAuditLogs();
      return true;
    } catch (e) {
      notify('error', 'Error al emitir tarjeta roja');
      return false;
    }
  };

  const authorizeRedTag = async (tagId: string, actionText: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/5s/red-tags/${tagId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositionAction: actionText }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Solo el Administrador puede autorizar la baja de mermas', 'RBAC');
        fetchAuditLogs();
        return false;
      }
      notify('success', `Baja definitiva autorizada para ${data.itemName}`, '1S Seiri Autorizado');
      fetch5S();
      fetchAuditLogs();
      return true;
    } catch (e) {
      notify('error', 'Error al autorizar baja');
      return false;
    }
  };

  const submitSeisoLog = async (logData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/5s/seiso-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (res.ok) {
        notify('success', 'Control de higiene y temperaturas 3S Seiso guardado', '3S Seiso');
        fetch5S();
        fetchAuditLogs();
        return true;
      }
      return false;
    } catch (e) {
      notify('error', 'Error al guardar inspección Seiso');
      return false;
    }
  };

  const submit5SAudit = async (auditData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/5s/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Solo el Administrador puede registrar auditorías 5S formales', 'RBAC');
        fetchAuditLogs();
        return false;
      }
      notify('success', `Auditoría 5S guardada con puntaje de ${data.overallScore}%`, '5S Shitsuke');
      fetch5S();
      fetchAuditLogs();
      return true;
    } catch (e) {
      notify('error', 'Error al guardar auditoría 5S');
      return false;
    }
  };

  const closeCashShift = async (closingData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(closingData),
      });
      const data = await res.json();
      if (!res.ok) {
        notify('error', data.message || 'Error al cerrar turno de caja', 'Caja');
        fetchAuditLogs();
        return false;
      }
      notify(
        'success',
        `Cuadre de turno cerrado exitosamente por ${currentUser.name}. Diferencia: $${data.cashShift.difference.toLocaleString('es-CO')} COP. Registro bloqueado contra ediciones posteriores.`,
        'Arqueo de Caja'
      );
      fetchCashShift();
      fetchAuditLogs();
      return true;
    } catch (e) {
      notify('error', 'Error al cerrar caja');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        menu,
        inventory,
        orders,
        deliveryZones,
        drivers,
        bins5S,
        redTags,
        seisoLogs,
        audit5S,
        cashShift,
        auditLogs,
        financials,
        isLoading,
        authToken,
        permissions,
        showLoginModal,
        setShowLoginModal,
        login,
        logout,
        notification,
        setNotification,
        switchUserRole,
        createOrder,
        editOrder,
        voidOrder,
        updateDispatchStatus,
        receiveGoods,
        updateInventoryParams,
        createRedTag,
        authorizeRedTag,
        submitSeisoLog,
        submit5SAudit,
        closeCashShift,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

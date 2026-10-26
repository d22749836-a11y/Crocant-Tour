/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderChannel, OrderStatus } from '../types';
import {
  ListFilter,
  Lock,
  Unlock,
  AlertTriangle,
  XCircle,
  Edit3,
  CheckCircle,
  Eye,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Printer,
} from 'lucide-react';

export const OrdersListView: React.FC = () => {
  const { orders, currentUser, voidOrder, editOrder } = useApp();

  const [channelFilter, setChannelFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Void Modal State
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [orderToVoid, setOrderToVoid] = useState<Order | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Edit Modal State (Admin only)
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesChannel = channelFilter === 'TODOS' || o.channel === channelFilter;
    const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter;
    return matchesChannel && matchesStatus;
  });

  const handleOpenVoidModal = (order: Order) => {
    if (currentUser.role !== 'ADMIN') {
      alert(
        'REGLA RBAC ESTRICTA: El rol Asesor tiene prohibido anular ventas ya registradas. Esta operación es exclusiva del Administrador.'
      );
      return;
    }
    setOrderToVoid(order);
    setVoidReason('');
    setShowVoidModal(true);
  };

  const handleConfirmVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToVoid) return;
    await voidOrder(orderToVoid.id, voidReason || 'Anulación autorizada por Administrador');
    setShowVoidModal(false);
  };

  const handleOpenEditModal = (order: Order) => {
    if (currentUser.role !== 'ADMIN') {
      alert(
        'REGLA RBAC ESTRICTA: El rol Asesor tiene prohibido editar pedidos una vez creados en el sistema.'
      );
      return;
    }
    setOrderToEdit(order);
    setEditCustomerName(order.customerName);
    setEditNotes('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToEdit) return;
    await editOrder(orderToEdit.id, {
      customerName: editCustomerName,
    });
    setShowEditModal(false);
  };

  // Test illegal attempt by Asesor to verify backend RBAC enforcement
  const handleTestIllegalVoid = async (orderId: string) => {
    await voidOrder(orderId, 'Intento de anulación sin autorización');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & RBAC Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Control de Comandas & Auditoría de Ventas</span>
            <span className="text-xs font-mono font-normal text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
              Crocant Tour Buga
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Cumplimiento riguroso de RBAC: Los asesores registran ventas operativas pero no pueden alterar ni
            anular registros una vez guardados. Solo el Administrador tiene permiso para editar o anular.
          </p>
        </div>

        {/* RBAC Active Role Banner */}
        <div
          className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2.5 ${
            currentUser.role === 'ADMIN'
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
          }`}
        >
          {currentUser.role === 'ADMIN' ? (
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="font-semibold block leading-tight">
              {currentUser.role === 'ADMIN'
                ? 'Modo Administrador (CRUD Total)'
                : 'Modo Asesor (Operativo Estricto)'}
            </span>
            <span className="text-[10px] text-stone-400">
              {currentUser.role === 'ADMIN'
                ? 'Habilitado: Modificar, Anular y Ajustar'
                : 'Restringido: Bloqueo de edición y anulación'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3 rounded-xl border border-stone-800">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-stone-500" />
          <span className="text-xs text-stone-400 font-medium">Filtrar Canal:</span>
          <div className="flex items-center gap-1">
            {['TODOS', 'DOMICILIO', 'MESA', 'LLEVAR'].map((c) => (
              <button
                key={c}
                onClick={() => setChannelFilter(c)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  channelFilter === c
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-stone-400 mr-1">Estado:</span>
          {['TODOS', 'EN_PREPARACION', 'LISTO', 'EN_RUTA', 'ENTREGADO', 'ANULADO'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                statusFilter === s
                  ? 'bg-stone-800 text-amber-400 font-semibold border border-stone-700'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">Comanda #</th>
                <th className="px-4 py-3">Canal & Destino</th>
                <th className="px-4 py-3">Cliente / Teléfono</th>
                <th className="px-4 py-3">Ítems Seleccionados</th>
                <th className="px-4 py-3 text-right">Total COP</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Registrado Por</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones RBAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredOrders.map((order) => {
                const isVoided = order.status === 'ANULADO';

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-stone-800/40 transition-colors ${
                      isVoided ? 'opacity-50 bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {order.consecutiveNumber}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-200 block">{order.channel}</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {order.channel === 'MESA'
                          ? order.tableNumber
                          : order.channel === 'DOMICILIO'
                          ? order.customerAddress?.substring(0, 22) + '...'
                          : 'Mostrador'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-200">{order.customerName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{order.customerPhone}</div>
                    </td>

                    <td className="px-4 py-3 max-w-[200px] truncate text-stone-300">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold text-stone-100 tabular-nums">
                      ${order.total.toLocaleString('es-CO')}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-stone-400">
                      {order.paymentMethod}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-stone-300 font-medium">{order.createdByName}</div>
                      <div className="text-[10px] font-mono text-stone-500 uppercase">
                        {order.createdByRole}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {isVoided ? (
                        <span className="text-[10px] font-mono uppercase bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800/50">
                          Anulado
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                          {order.status}
                        </span>
                      )}
                    </td>

                    {/* RBAC Action Buttons */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(order)}
                          disabled={currentUser.role !== 'ADMIN' || isVoided}
                          className={`p-1.5 rounded transition-colors ${
                            currentUser.role === 'ADMIN' && !isVoided
                              ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'
                              : 'text-stone-600 cursor-not-allowed opacity-40'
                          }`}
                          title={
                            currentUser.role === 'ADMIN'
                              ? 'Editar comanda (Privilegio Administrador)'
                              : 'RBAC: El rol Asesor tiene prohibido editar comanda guardada'
                          }
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Void Button */}
                        <button
                          onClick={() => handleOpenVoidModal(order)}
                          disabled={currentUser.role !== 'ADMIN' || isVoided}
                          className={`p-1.5 rounded transition-colors ${
                            currentUser.role === 'ADMIN' && !isVoided
                              ? 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
                              : 'text-stone-600 cursor-not-allowed opacity-40'
                          }`}
                          title={
                            currentUser.role === 'ADMIN'
                              ? 'Anular venta y reintegrar stock (Administrador)'
                              : 'RBAC: El rol Asesor tiene estrictamente prohibido anular ventas'
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </button>

                        {/* If Asesor, allow explicitly testing illegal attempt to verify security */}
                        {currentUser.role === 'ASESOR' && !isVoided && (
                          <button
                            onClick={() => handleTestIllegalVoid(order.id)}
                            className="text-[10px] font-mono text-rose-400/80 hover:text-rose-300 underline ml-1"
                            title="Prueba de intento denegado por backend con registro en bitácora de auditoría"
                          >
                            Probar Bloqueo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Anular Pedido (ADMIN ONLY) */}
      {showVoidModal && orderToVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Autorizar Anulación de Pedido (Admin)</span>
              </h3>
              <button
                onClick={() => setShowVoidModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300">
              Se anulará el pedido <strong className="text-amber-400">{orderToVoid.consecutiveNumber}</strong> por un valor de{' '}
              <strong className="text-white">${orderToVoid.total.toLocaleString('es-CO')} COP</strong>.
              <br />
              <span className="text-stone-400 mt-1 block">
                • Las materias primas descontadas se reintegrarán automáticamente al stock (Chopra & Meindl).
                <br />
                • Se registrará un evento inmutable en la bitácora de auditoría.
              </span>
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">
                  Motivo de Anulación (Requerido por Auditoría)
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Ej. Error de mesa por parte del cliente, duplicación de ticket..."
                  required
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Pedido (ADMIN ONLY) */}
      {showEditModal && orderToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Modificar Comanda (Privilegio Admin)</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

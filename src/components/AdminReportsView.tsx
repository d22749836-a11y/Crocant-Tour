/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldAlert,
  ShieldCheck,
  Users,
  AlertOctagon,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const { currentUser, financials, allUsers, switchUserRole } = useApp();

  // Strict RBAC Enforcement
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Módulo Financiero Reservado para Gerencia</h2>
        <p className="text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
          Por política estricta de seguridad y control de costos (RBAC), el rol{' '}
          <strong className="text-amber-400">{currentUser.role}</strong> no tiene autorización para visualizar
          márgenes de rentabilidad bruta, costos unitarios de materia prima ni estados de pérdidas y ganancias.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchUserRole('ADMIN')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cambiar a Sesión Administrador (Carlos Duque)</span>
          </button>
        </div>
      </div>
    );
  }

  if (!financials) {
    return <div className="p-8 text-center text-stone-500 text-xs">Calculando balances financieros...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Reportes Financieros & Matriz de Rentabilidad</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Acceso Exclusivo Administrador
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Consolidado de ventas brutas, deducción de costo de materias primas (COGS según receta BOM),
            impacto de mermas registradas por el sistema 5S y desglose por canal de distribución.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span>Auditor Responsable:</span>
          <span className="font-semibold text-stone-200">{currentUser.name}</span>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ingresos Brutos por Ventas</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            ${financials.grossRevenue.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>{financials.ordersCount} pedidos completados</span>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Costo Materia Prima (COGS)</span>
            <Layers className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            ${financials.totalCOGS.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Costo calculado por recetas BOM</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Margen Bruto de Alimentos</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {financials.grossMarginPercent}%
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Ganancia bruta: ${(financials.grossProfit).toLocaleString('es-CO')} COP
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Mermas 5S & Descarte</span>
            <AlertOctagon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 tabular-nums">
            -${financials.totalRedTagLoss.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Tarjetas rojas autorizadas</div>
        </div>
      </div>

      {/* Grid: Channel & Payment breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Ventas por Canal de Distribución (Ballou)</span>
            <span className="text-xs font-mono text-stone-400">Total 100%</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-stone-300 mb-1">
                <span>Domicilios (Última Milla Buga)</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  ${(financials.channelBreakdown?.domicilio || 0).toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${
                      financials.grossRevenue > 0
                        ? ((financials.channelBreakdown?.domicilio || 0) / financials.grossRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-300 mb-1">
                <span>Mesas & Servicio en Sala</span>
                <span className="font-mono font-bold text-sky-400 tabular-nums">
                  ${(financials.channelBreakdown?.mesa || 0).toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full"
                  style={{
                    width: `${
                      financials.grossRevenue > 0
                        ? ((financials.channelBreakdown?.mesa || 0) / financials.grossRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-stone-300 mb-1">
                <span>Para Llevar / Takeout</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  ${(financials.channelBreakdown?.llevar || 0).toLocaleString('es-CO')} COP
                </span>
              </div>
              <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${
                      financials.grossRevenue > 0
                        ? ((financials.channelBreakdown?.llevar || 0) / financials.grossRevenue) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Desglose por Medios de Pago</span>
            <span className="text-xs font-mono text-stone-400">Flujo de Efectivo</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Efectivo en Caja', val: financials.paymentBreakdown?.efectivo || 0, color: 'text-amber-400' },
              { label: 'Nequi', val: financials.paymentBreakdown?.nequi || 0, color: 'text-purple-400' },
              { label: 'Daviplata', val: financials.paymentBreakdown?.daviplata || 0, color: 'text-rose-400' },
              { label: 'Bancolombia QR', val: financials.paymentBreakdown?.bancolombiaQr || 0, color: 'text-yellow-400' },
              { label: 'Datáfono Tarjeta', val: financials.paymentBreakdown?.datafono || 0, color: 'text-sky-400' },
            ].map((pm, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-stone-950 rounded-lg border border-stone-800/80">
                <span className="text-stone-300">{pm.label}</span>
                <span className={`font-mono font-bold tabular-nums ${pm.color}`}>
                  ${pm.val.toLocaleString('es-CO')} COP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & RBAC Management Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-500" />
          <span>Gestión de Personal & Roles Asignados (RBAC)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 text-stone-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Colaborador</th>
                <th className="px-4 py-2.5">Identificación</th>
                <th className="px-4 py-2.5">Rol en Sistema</th>
                <th className="px-4 py-2.5">Permisos Operativos</th>
                <th className="px-4 py-2.5">Sede</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-800/30">
                  <td className="px-4 py-2.5 font-semibold text-stone-100">{user.name}</td>
                  <td className="px-4 py-2.5 font-mono text-stone-400">{user.documentNumber}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-stone-300 text-[11px]">
                    {user.role === 'ADMIN'
                      ? 'CRUD Total, Anulación, Ajustes de Costos y Reportes Financieros'
                      : 'Operativo: Crear ventas, consultar stock, registrar cuadres e ingresos. (Prohibido anular/editar)'}
                  </td>
                  <td className="px-4 py-2.5 text-stone-400 text-[11px]">{user.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

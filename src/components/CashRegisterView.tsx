/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  DollarSign,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  Smartphone,
  Shield,
  FileText,
} from 'lucide-react';

export const CashRegisterView: React.FC = () => {
  const { cashShift, currentUser, closeCashShift } = useApp();

  const [declaredCash, setDeclaredCash] = useState<number>(
    cashShift?.declaredCash || (cashShift ? cashShift.initialCashBase + cashShift.systemCashSales : 0)
  );
  const [declaredElectronic, setDeclaredElectronic] = useState<number>(
    cashShift?.declaredElectronic || (cashShift ? cashShift.systemElectronicSales : 0)
  );
  const [notes, setNotes] = useState<string>(cashShift?.notes || '');
  const [isClosing, setIsClosing] = useState(false);

  if (!cashShift) {
    return <div className="p-8 text-center text-stone-500">Cargando estado de caja...</div>;
  }

  const isClosed = cashShift.status === 'CERRADO';
  const totalSystemSales = cashShift.systemCashSales + cashShift.systemElectronicSales;
  const totalExpectedCash = cashShift.initialCashBase + cashShift.systemCashSales;
  const totalSystemGrand = totalExpectedCash + cashShift.systemElectronicSales;
  const totalDeclared = declaredCash + declaredElectronic;
  const difference = totalDeclared - totalSystemGrand;

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClosed && currentUser.role !== 'ADMIN') {
      alert(
        'Regla RBAC Estricta: El arqueo de caja ya fue cerrado. El rol Asesor tiene estrictamente prohibido modificar o reabrir el cuadre una vez guardado.'
      );
      return;
    }

    setIsClosing(true);
    await closeCashShift({
      declaredCash,
      declaredElectronic,
      notes: notes || 'Cuadre de turno cerrado en caja Crocant Tour Buga',
    });
    setIsClosing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Arqueo & Cuadre de Caja</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Control de Turno
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Consolidación de ingresos por ventas en efectivo y canales electrónicos (Nequi, Daviplata, Bancolombia QR).
            El asesor puede registrar el cuadre, pero queda bloqueado para modificaciones post-cierre por regla RBAC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isClosed ? (
            <span className="px-3 py-1.5 bg-rose-950/80 text-rose-300 border border-rose-800/60 text-xs font-semibold rounded-lg flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Turno Cerrado (Bloqueado)</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold rounded-lg flex items-center gap-1.5 font-mono">
              <Unlock className="w-3.5 h-3.5" />
              <span>Turno Activo / Abierto</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Base Inicial en Efectivo</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            ${cashShift.initialCashBase.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Apertura de turno en mostrador</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ventas Efectivo (Sistema)</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            ${cashShift.systemCashSales.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Efectivo total esperado: ${(cashShift.initialCashBase + cashShift.systemCashSales).toLocaleString('es-CO')}
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Ventas Digitales (Sistema)</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">
            ${cashShift.systemElectronicSales.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Nequi, Daviplata, QR y Datáfono</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Total Ventas Turno</span>
            <CheckCircle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 tabular-nums">
            ${totalSystemSales.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Acumulado bruto de pedidos activos</div>
        </div>
      </div>

      {/* Main Closing / Cuadre Form */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
        <div className="max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Conteo Físico & Declaración de Cierre</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Ingrese el total de billetes/monedas contados físicamente en la gaveta y el valor total
              de comprobantes digitales recibidos en el datáfono y apps bancarias.
            </p>
          </div>

          <form onSubmit={handleCloseShift} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-stone-300 block mb-1 font-semibold">
                  Efectivo Físico en Caja (Base + Ventas) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-500 font-mono">$</span>
                  <input
                    type="number"
                    step="100"
                    disabled={isClosed && currentUser.role !== 'ADMIN'}
                    value={declaredCash}
                    onChange={(e) => setDeclaredCash(Number(e.target.value))}
                    required
                    className={`w-full bg-stone-950 border border-stone-800 rounded-lg pl-7 pr-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500 ${
                      isClosed && currentUser.role !== 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Esperado por sistema: ${totalExpectedCash.toLocaleString('es-CO')} COP
                </span>
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-semibold">
                  Total Transferencias & Datáfono Declarado *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-500 font-mono">$</span>
                  <input
                    type="number"
                    step="100"
                    disabled={isClosed && currentUser.role !== 'ADMIN'}
                    value={declaredElectronic}
                    onChange={(e) => setDeclaredElectronic(Number(e.target.value))}
                    required
                    className={`w-full bg-stone-950 border border-stone-800 rounded-lg pl-7 pr-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500 ${
                      isClosed && currentUser.role !== 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Esperado por sistema: ${cashShift.systemElectronicSales.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            <div>
              <label className="text-stone-300 block mb-1 font-semibold">
                Observaciones del Arqueo / Novedades
              </label>
              <textarea
                value={notes}
                disabled={isClosed && currentUser.role !== 'ADMIN'}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Billetes de alta denominación guardados en caja fuerte, cliente dejó propina en efectivo..."
                rows={3}
                className={`w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-100 focus:outline-none focus:border-amber-500 ${
                  isClosed && currentUser.role !== 'ADMIN' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* Difference Calculation Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                difference === 0
                  ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                  : difference > 0
                  ? 'bg-sky-950/30 border-sky-800/40 text-sky-300'
                  : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
              }`}
            >
              <div>
                <span className="font-semibold block text-sm">
                  {difference === 0
                    ? 'Cuadre Perfecto (Sin Diferencia)'
                    : difference > 0
                    ? 'Sobrante de Caja Detectado'
                    : 'Faltante de Caja Detectado'}
                </span>
                <span className="text-xs text-stone-400">
                  Total Declarado: ${totalDeclared.toLocaleString('es-CO')} · Total Esperado Sistema: $
                  {totalSystemGrand.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Diferencia Neta</span>
                <span className="text-xl font-bold font-mono tabular-nums">
                  {difference > 0 ? `+$${difference.toLocaleString('es-CO')}` : `$${difference.toLocaleString('es-CO')}`} COP
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-[11px] text-stone-500">
                {isClosed && (
                  <span>
                    Cerrado el {cashShift.closedAt} por {cashShift.closedByRole}.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={(isClosed && currentUser.role !== 'ADMIN') || isClosing}
                className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 ${
                  isClosed && currentUser.role !== 'ADMIN'
                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isClosed
                    ? currentUser.role === 'ADMIN'
                      ? 'Reajustar Cuadre (Admin)'
                      : 'Cuadre Cerrado e Irrevocable'
                    : isClosing
                    ? 'Cerrando Turno...'
                    : 'Cerrar Turno & Registrar Cuadre'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

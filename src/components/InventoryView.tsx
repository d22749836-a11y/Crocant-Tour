/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  TrendingUp,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  Truck,
  Calendar,
  Layers,
  Thermometer,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    currentUser,
    receiveGoods,
    updateInventoryParams,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [showEditParamsModal, setShowEditParamsModal] = useState(false);
  const [selectedItemToEdit, setSelectedItemToEdit] = useState<InventoryItem | null>(null);

  // Reception Form State
  const [supplierName, setSupplierName] = useState('Avícola Santa Rita & Bucanero Buga');
  const [supplierInvoice, setSupplierInvoice] = useState('');
  const [receptionItemId, setReceptionItemId] = useState(inventory[0]?.id || '');
  const [receptionQuantity, setReceptionQuantity] = useState<number>(10);
  const [receptionLot, setReceptionLot] = useState('');
  const [receptionExpDate, setReceptionExpDate] = useState('2026-11-15');
  const [receptionTemp, setReceptionTemp] = useState<number>(2.5);

  // Edit Parameters Form State (Admin Only)
  const [paramSS, setParamSS] = useState<number>(0);
  const [paramROP, setParamROP] = useState<number>(0);
  const [paramLeadTime, setParamLeadTime] = useState<number>(1);
  const [paramAvgDemand, setParamAvgDemand] = useState<number>(10);

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'TODOS' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const criticalItems = inventory.filter((i) => i.inventoryStatus === 'CRITICO');
  const reorderItems = inventory.filter((i) => i.inventoryStatus === 'REORDEN_REQUERIDA');
  const totalValueCOP = inventory.reduce((sum, i) => sum + i.stockValueCOP, 0);

  const handleOpenEditParams = (item: InventoryItem) => {
    if (currentUser.role !== 'ADMIN') {
      alert(
        'Regla RBAC Estricta: El rol Asesor tiene prohibido modificar los parámetros de inventario (SS, ROP y costos). Esta acción está reservada al Administrador.'
      );
      return;
    }
    setSelectedItemToEdit(item);
    setParamSS(item.safetyStock);
    setParamROP(item.reorderPoint);
    setParamLeadTime(item.leadTimeDays);
    setParamAvgDemand(item.avgDailyDemand);
    setShowEditParamsModal(true);
  };

  const handleSaveParams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemToEdit) return;

    await updateInventoryParams(selectedItemToEdit.id, {
      safetyStock: Number(paramSS),
      reorderPoint: Number(paramROP),
      leadTimeDays: Number(paramLeadTime),
      avgDailyDemand: Number(paramAvgDemand),
    });
    setShowEditParamsModal(false);
  };

  const handleReceptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receptionItemId || receptionQuantity <= 0) return;

    const payload = {
      supplierName,
      supplierInvoice: supplierInvoice || `FAC-BUG-${Date.now().toString().slice(-4)}`,
      items: [
        {
          inventoryItemId: receptionItemId,
          quantityReceived: receptionQuantity,
          batchLot: receptionLot || `LOT-${new Date().toISOString().substring(0, 10)}`,
          expirationDate: receptionExpDate,
          temperatureChecked: receptionTemp,
        },
      ],
      notes: 'Ingreso registrado en muelle de recepción Crocant Tour',
    };

    const ok = await receiveGoods(payload);
    if (ok) {
      setShowReceptionModal(false);
      setSupplierInvoice('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Theoretical Foundation Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Coordinación de Inventarios & Abastecimiento</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Chopra & Meindl (2016)
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Sincronización en tiempo real de flujos de materias primas para evitar el efecto látigo (Bullwhip Effect).
            Cálculo dinámico de Stock de Seguridad (SS) y Punto de Reorden (ROP = d × L + SS).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowReceptionModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Ingreso de Materia Prima</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Chopra & Meindl Drivers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Valorización de Bodega</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            ${totalValueCOP.toLocaleString('es-CO')} COP
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {inventory.length} materias primas activas
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Stock Crítico (≤ SS)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {criticalItems.length} insumos
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Riesgo inminente de rotura de cocina</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Reorden Requerida (≤ ROP)</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {reorderItems.length} insumos
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Emitir orden de compra a proveedor</div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Frontera Push / Pull</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-sm font-semibold text-sky-400">
            Push en Insumos · Pull en Cocción
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Desacoplamiento MTO bajo receta</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 p-3 rounded-xl border border-stone-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o proveedor..."
            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PROTEINAS', label: 'Proteínas' },
            { id: 'SALSAS_CONDIMENTOS', label: 'Salsas' },
            { id: 'VERDURAS_FRESCOS', label: 'Frescos' },
            { id: 'EMPAQUES', label: 'Empaques' },
            { id: 'BEBIDAS_INSUMOS', label: 'Bebidas' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Master Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Materia Prima / Insumo</th>
                <th className="px-4 py-3">Ubicación 5S</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-right">SS (Seguridad)</th>
                <th className="px-4 py-3 text-right">ROP (Reorden)</th>
                <th className="px-4 py-3 text-right">Lead Time (L)</th>
                <th className="px-4 py-3">Vence (FEFO)</th>
                <th className="px-4 py-3">Estado Chopra</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredItems.map((item) => {
                const isCrit = item.inventoryStatus === 'CRITICO';
                const isReorder = item.inventoryStatus === 'REORDEN_REQUERIDA';

                return (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-stone-400 text-[11px] whitespace-nowrap">
                      {item.code}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-100">{item.name}</div>
                      <div className="text-[11px] text-stone-500">{item.supplier}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono text-stone-300 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                        {item.zone5S.split(':')[0]}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      <span
                        className={
                          isCrit
                            ? 'text-rose-400 font-bold'
                            : isReorder
                            ? 'text-amber-400 font-bold'
                            : 'text-stone-200'
                        }
                      >
                        {item.currentStock.toFixed(1)} {item.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-stone-400 tabular-nums">
                      {item.safetyStock} {item.unit}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-stone-400 tabular-nums">
                      {item.reorderPoint} {item.unit}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-stone-400 tabular-nums">
                      {item.leadTimeDays}d
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>{item.expirationDate}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {isCrit ? (
                        <span className="text-[10px] font-mono font-semibold uppercase text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
                          Crítico (≤ SS)
                        </span>
                      ) : isReorder ? (
                        <span className="text-[10px] font-mono font-semibold uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                          Reorden (≤ ROP)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                          Abastecido
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditParams(item)}
                        className={`p-1.5 rounded transition-colors ${
                          currentUser.role === 'ADMIN'
                            ? 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'
                            : 'text-stone-600 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          currentUser.role === 'ADMIN'
                            ? 'Ajustar parámetros Chopra & Meindl (SS, ROP, Lead Time)'
                            : 'Bloqueado por RBAC: Solo Administrador puede editar'
                        }
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Recepción de Mercancía (Goods Receipt) - Allowed for Both Asesor & Admin */}
      {showReceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Recepción de Materia Prima (Ingreso)</span>
              </h3>
              <button
                onClick={() => setShowReceptionModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Registro de abastecimiento autorizado para Asesor y Administrador. Actualiza stock, lote
              y fecha de caducidad para el control FEFO en el almacén.
            </p>

            <form onSubmit={handleReceptionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Materia Prima a Ingresar</label>
                <select
                  value={receptionItemId}
                  onChange={(e) => setReceptionItemId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name} (Stock: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Cantidad a Ingresar</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={receptionQuantity}
                    onChange={(e) => setReceptionQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Proveedor Local</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Factura / Remisión</label>
                  <input
                    type="text"
                    value={supplierInvoice}
                    onChange={(e) => setSupplierInvoice(e.target.value)}
                    placeholder="Ej. FAC-0982"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Número de Lote</label>
                  <input
                    type="text"
                    value={receptionLot}
                    onChange={(e) => setReceptionLot(e.target.value)}
                    placeholder="LOT-2026-X"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Fecha de Vencimiento (FEFO)</label>
                  <input
                    type="date"
                    value={receptionExpDate}
                    onChange={(e) => setReceptionExpDate(e.target.value)}
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                    <span>Temp. Recepción (°C)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={receptionTemp}
                    onChange={(e) => setReceptionTemp(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowReceptionModal(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Registrar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste de Parámetros Chopra & Meindl (ADMIN ONLY) */}
      {showEditParamsModal && selectedItemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Calibrar Parámetros Chopra & Meindl</span>
              </h3>
              <button
                onClick={() => setShowEditParamsModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Modificando umbrales para: <strong className="text-stone-200">{selectedItemToEdit.name}</strong>
            </p>

            <form onSubmit={handleSaveParams} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">
                  Demanda Diaria Promedio (d) en {selectedItemToEdit.unit}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={paramAvgDemand}
                  onChange={(e) => setParamAvgDemand(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Lead Time de Proveedor (L en días)</label>
                <input
                  type="number"
                  min="1"
                  value={paramLeadTime}
                  onChange={(e) => setParamLeadTime(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">
                  Stock de Seguridad (SS = Z × σL × √L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={paramSS}
                  onChange={(e) => setParamSS(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">
                  Punto de Reorden (ROP = d × L + SS)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={paramROP}
                  onChange={(e) => setParamROP(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowEditParamsModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg"
                >
                  Guardar Parámetros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

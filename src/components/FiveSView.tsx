/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tag,
  Grid,
  Sparkles,
  ClipboardCheck,
  CheckSquare,
  Thermometer,
  AlertOctagon,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle,
  Plus,
} from 'lucide-react';

export const FiveSView: React.FC = () => {
  const {
    bins5S,
    redTags,
    seisoLogs,
    audit5S,
    currentUser,
    createRedTag,
    authorizeRedTag,
    submitSeisoLog,
    submit5SAudit,
  } = useApp();

  const [activeTab5S, setActiveTab5S] = useState<'seiri' | 'seiton' | 'seiso' | 'seiketsu' | 'shitsuke'>('seiton');

  // Red Tag Modal State
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [tagItemName, setTagItemName] = useState('');
  const [tagLocation, setTagLocation] = useState('CF-01: Cuarto Frío Aves');
  const [tagReason, setTagReason] = useState<'CADUCADO' | 'DETERIORADO' | 'SOBRANTE_EXCESIVO' | 'ROTURA_CADENA_FRIO' | 'OTRO'>('DETERIORADO');
  const [tagQuantity, setTagQuantity] = useState(1);
  const [tagUnit, setTagUnit] = useState('kg');
  const [tagLoss, setTagLoss] = useState(15000);

  // Seiso Inspection State
  const [showSeisoModal, setShowSeisoModal] = useState(false);
  const [seisoShift, setSeisoShift] = useState<'MANANA' | 'TARDE' | 'CIERRE'>('TARDE');
  const [tempCuartoFrio, setTempCuartoFrio] = useState(2.8);
  const [tempFreidora, setTempFreidora] = useState(175);
  const [oilQualityOk, setOilQualityOk] = useState(true);
  const [sanitizationDone, setSanitizationDone] = useState(true);
  const [seisoObs, setSeisoObs] = useState('');

  // 5S Audit State (Admin only)
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditScores, setAuditScores] = useState({
    seiri: 90,
    seiton: 95,
    seiso: 92,
    seiketsu: 94,
    shitsuke: 88,
    notes: 'Auditoría interna de rutina',
  });

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagItemName) return;

    await createRedTag({
      itemName: tagItemName,
      locationArea: tagLocation,
      reason: tagReason,
      quantity: tagQuantity,
      unit: tagUnit,
      estimatedLossCOP: tagLoss,
    });
    setShowNewTagModal(false);
    setTagItemName('');
  };

  const handleAuthorizeTag = async (tagId: string) => {
    if (currentUser.role !== 'ADMIN') {
      alert('Solo el Administrador tiene permiso para autorizar la baja contable de una merma.');
      return;
    }
    const action = prompt('Ingrese la acción de disposición (ej. Descarte y compostaje, Devolución a proveedor):', 'Descarte autorizado y registro en mermas');
    if (action) {
      await authorizeRedTag(tagId, action);
    }
  };

  const handleSaveSeiso = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitSeisoLog({
      shift: seisoShift,
      cuartoFrioTempObs: tempCuartoFrio,
      freidoraTempObs: tempFreidora,
      freidoraOilQualityOk: oilQualityOk,
      sanitizationCompleted: sanitizationDone,
      observations: seisoObs,
    });
    setShowSeisoModal(false);
  };

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'ADMIN') {
      alert('Acceso restringido: Solo el Administrador puede asentar auditorías 5S.');
      return;
    }
    await submit5SAudit({
      scoreSeiri: auditScores.seiri,
      scoreSeiton: auditScores.seiton,
      scoreSeiso: auditScores.seiso,
      scoreSeiketsu: auditScores.seiketsu,
      scoreShitsuke: auditScores.shitsuke,
      notes: auditScores.notes,
    });
    setShowAuditModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Gestión de Almacenamiento 5S</span>
            <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Hirano (1995)
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Metodología visual para la excelencia operativa en cocina y despensa: Seiri (Clasificar),
            Seiton (Ordenar por zonas FEFO), Seiso (Limpiar y controlar temperaturas), Seiketsu (Estandarizar) y Shitsuke (Sostener).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setShowAuditModal(true)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg border border-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
              <span>Auditar 5S</span>
            </button>
          )}

          <button
            onClick={() => setShowNewTagModal(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Tag className="w-4 h-4" />
            <span>Emitir Tarjeta Roja (1S)</span>
          </button>
        </div>
      </div>

      {/* 5S Stage Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-2">
        {[
          { id: 'seiton', label: '2S - Seiton (Zonas & FEFO)', icon: Grid },
          { id: 'seiri', label: '1S - Seiri (Tarjetas Rojas / Mermas)', icon: Tag },
          { id: 'seiso', label: '3S - Seiso (Sanitización & Temp)', icon: Sparkles },
          { id: 'seiketsu', label: '4S - Seiketsu (Fichas Estándar)', icon: CheckSquare },
          { id: 'shitsuke', label: '5S - Shitsuke (Auditoría & Disciplina)', icon: ClipboardCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab5S === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab5S(tab.id as any)}
              className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 2S: SEITON (ZONAS Y BINS VISUALES) ================= */}
      {activeTab5S === 'seiton' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Mapeo Visual de Almacenamiento & Rotación FEFO (First-Expired, First-Out)
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Cada insumo tiene una ubicación fija, delimitación cromática y control riguroso de temperatura según Hirano (1995).
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-stone-400 block uppercase">Cumplimiento Orden</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">96.8%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bins5S.map((bin) => (
              <div
                key={bin.zoneCode}
                className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between hover:border-stone-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-amber-500/30">
                      {bin.zoneCode}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {bin.compliancePercentage}% 5S
                    </span>
                  </div>

                  <h3 className="font-semibold text-stone-100 text-sm mt-2">{bin.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                    <span>{bin.temperatureReq}</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-mono text-stone-500 block mb-1">
                      Insumos Asignados
                    </span>
                    <ul className="text-xs text-stone-300 space-y-1">
                      {bin.assignedItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex justify-between items-center text-[11px] text-stone-500">
                  <span>Capacidad: {bin.maxCapacity}</span>
                  <span className="font-mono text-emerald-400">FEFO Activo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 1S: SEIRI (TARJETAS ROJAS / RED TAGS) ================= */}
      {activeTab5S === 'seiri' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Sistema de Tarjetas Rojas (Red Tag) para Mermas e Insumos Inadecuados</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Cualquier colaborador puede identificar y separar mermas. Únicamente el Administrador puede autorizar la baja contable definitiva.
              </p>
            </div>
            <button
              onClick={() => setShowNewTagModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Nueva Tarjeta Roja</span>
            </button>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Tag #</th>
                  <th className="px-4 py-3">Fecha & Emisor</th>
                  <th className="px-4 py-3">Ítem / Merma</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Causa</th>
                  <th className="px-4 py-3 text-right">Pérdida Est.</th>
                  <th className="px-4 py-3">Estado RBAC</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {redTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-stone-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">{tag.tagNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-stone-300 font-mono text-[11px]">{tag.dateCreated}</div>
                      <div className="text-stone-500 text-[11px]">{tag.responsibleName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-100">{tag.itemName}</div>
                      <div className="text-stone-400 text-[11px]">
                        {tag.quantity} {tag.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{tag.locationArea}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] uppercase bg-rose-950/70 text-rose-300 px-2 py-0.5 rounded border border-rose-800/40">
                        {tag.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-stone-200 tabular-nums">
                      ${tag.estimatedLossCOP.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">
                      {tag.status === 'AUTORIZADO_ADMIN' ? (
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                            Baja Autorizada
                          </span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">{tag.authorizedBy}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          Pendiente Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tag.status !== 'AUTORIZADO_ADMIN' && (
                        <button
                          onClick={() => handleAuthorizeTag(tag.id)}
                          className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                            currentUser.role === 'ADMIN'
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold'
                              : 'bg-stone-800 text-stone-600 cursor-not-allowed opacity-50'
                          }`}
                          title={
                            currentUser.role === 'ADMIN'
                              ? 'Autorizar baja definitiva'
                              : 'Bloqueado por RBAC: Solo Administrador puede autorizar baja'
                          }
                        >
                          Autorizar Baja
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3S: SEISO (LIMPIEZA & TEMPERATURAS) ================= */}
      {activeTab5S === 'seiso' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>3S Seiso: Bitácora de Sanitización y Monitoreo de Cadena de Frío</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Registro obligatorio por turno: Temperatura de cámara (0-4°C), freidoras (175°C) y calidad del aceite.
              </p>
            </div>
            <button
              onClick={() => setShowSeisoModal(true)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Inspección de Turno</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seisoLogs.map((log) => (
              <div key={log.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/40">
                      Turno {log.shift}
                    </span>
                    <span className="text-xs text-stone-300">{log.date}</span>
                  </div>
                  <span className="text-xs text-stone-400">Resp: {log.inspectorName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800">
                    <span className="text-[11px] text-stone-400 block">Cuarto Frío Aves/Carnes</span>
                    <span className="text-sm font-bold font-mono text-sky-400 tabular-nums">
                      {log.cuartoFrioTempObs}°C
                    </span>
                    <span className="block text-[10px] text-emerald-400">Dentro de norma (≤ 4°C)</span>
                  </div>

                  <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800">
                    <span className="text-[11px] text-stone-400 block">Freidora Automática</span>
                    <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                      {log.freidoraTempObs}°C
                    </span>
                    <span className="block text-[10px] text-emerald-400">Temperatura óptima alitas</span>
                  </div>
                </div>

                <div className="text-xs text-stone-400 pt-1">
                  <strong>Observaciones:</strong> {log.observations}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4S: SEIKETSU (ESTANDARIZAR) ================= */}
      {activeTab5S === 'seiketsu' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>4S Seiketsu: Fichas Técnicas & Protocolos de Preparación Estandarizados</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Garantiza consistencia sensorial en Crocant Tour: Gramaje exacto, tiempos de freído y control de temperatura de servicio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
              <span className="font-mono text-xs text-amber-400 uppercase font-semibold">FT-01: Alitas Crocant BBQ</span>
              <ul className="text-xs text-stone-300 space-y-1.5 pt-2">
                <li>• <strong>Porción:</strong> 350g alitas marinadas con corte estilo Buga.</li>
                <li>• <strong>Freído:</strong> 11 minutos a 175°C en aceite vegetal de alta pureza.</li>
                <li>• <strong>Glaseado:</strong> 80ml salsa BBQ ahumada reducida a fuego lento.</li>
                <li>• <strong>Guarnición:</strong> 150g papas rústicas con paprika artesanal.</li>
              </ul>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
              <span className="font-mono text-xs text-amber-400 uppercase font-semibold">FT-02: Tostadas Vallunas</span>
              <ul className="text-xs text-stone-300 space-y-1.5 pt-2">
                <li>• <strong>Plátano:</strong> Dominico-Hartón verde seleccionado en Plaza Buga.</li>
                <li>• <strong>Doble Cocción:</strong> 4 min precocido a 160°C, aplastado y 2 min a 180°C.</li>
                <li>• <strong>Hogao:</strong> 180g tomate chonto maduro y cebolla larga sofrito con achiote.</li>
                <li>• <strong>Chicharrón:</strong> 200g tocino crocante cortado en dados pequeños.</li>
              </ul>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-2">
              <span className="font-mono text-xs text-amber-400 uppercase font-semibold">FT-03: Tenders Crocantes</span>
              <ul className="text-xs text-stone-300 space-y-1.5 pt-2">
                <li>• <strong>Pechuga:</strong> 250g tiras marinadas en suero costeño y especias.</li>
                <li>• <strong>Apanado:</strong> Mezcla especial de harina de maíz y hojuelas crocantes.</li>
                <li>• <strong>Freído:</strong> 6 minutos a 175°C garantizando jugosidad interna.</li>
                <li>• <strong>Empaque:</strong> Caja kraft ventilada para preservar textura crocante.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5S: SHITSUKE (DISCIPLINA Y AUDITORÍA) ================= */}
      {activeTab5S === 'shitsuke' && (
        <div className="space-y-4">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-400" />
                <span>5S Shitsuke: Auditoría Formal & Hábitos de Disciplina Operativa</span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Evaluación integral de cumplimiento de los 5 pilares de Hirano.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-stone-400 uppercase">Puntaje Global</span>
              <span className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
                {audit5S?.overallScore || 92}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {[
              { name: '1S Seiri (Clasificar)', score: audit5S?.scoreSeiri || 92 },
              { name: '2S Seiton (Ordenar)', score: audit5S?.scoreSeiton || 96 },
              { name: '3S Seiso (Limpiar)', score: audit5S?.scoreSeiso || 94 },
              { name: '4S Seiketsu (Estandarizar)', score: audit5S?.scoreSeiketsu || 90 },
              { name: '5S Shitsuke (Disciplina)', score: audit5S?.scoreShitsuke || 88 },
            ].map((pillar, i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 p-3 rounded-xl">
                <span className="text-xs text-stone-400 block mb-1">{pillar.name}</span>
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {pillar.score}%
                </span>
                <div className="w-full bg-stone-950 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {audit5S?.notes && (
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl text-xs text-stone-300">
              <strong className="text-purple-400">Observaciones del Auditor ({audit5S.auditorName}):</strong>{' '}
              {audit5S.notes}
            </div>
          )}
        </div>
      )}

      {/* Modal: Nueva Tarjeta Roja */}
      {showNewTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-500" />
                <span>Emitir Tarjeta Roja (1S Seiri)</span>
              </h3>
              <button
                onClick={() => setShowNewTagModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Nombre del Ítem / Insumo Inadecuado</label>
                <input
                  type="text"
                  value={tagItemName}
                  onChange={(e) => setTagItemName(e.target.value)}
                  placeholder="Ej. Tomate chonto golpeado"
                  required
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Ubicación en Cocina / Bodega</label>
                <select
                  value={tagLocation}
                  onChange={(e) => setTagLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                >
                  <option value="CF-01: Cuarto Frío Aves">CF-01: Cuarto Frío Aves</option>
                  <option value="CF-02: Cuarto Frío Carnes">CF-02: Cuarto Frío Carnes</option>
                  <option value="CF-03: Refrigerador Salsas">CF-03: Refrigerador Salsas</option>
                  <option value="BS-01: Bodega Plátanos">BS-01: Bodega Plátanos</option>
                  <option value="BS-02: Bodega Secos">BS-02: Bodega Secos</option>
                  <option value="LC-01: Línea Caliente">LC-01: Línea Caliente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Motivo</label>
                  <select
                    value={tagReason}
                    onChange={(e) => setTagReason(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                  >
                    <option value="DETERIORADO">Deteriorado</option>
                    <option value="CADUCADO">Caducado</option>
                    <option value="ROTURA_CADENA_FRIO">Rotura Cadena Frío</option>
                    <option value="SOBRANTE_EXCESIVO">Sobrante Excesivo</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Pérdida Est. (COP)</label>
                  <input
                    type="number"
                    step="1000"
                    value={tagLoss}
                    onChange={(e) => setTagLoss(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Cantidad</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tagQuantity}
                    onChange={(e) => setTagQuantity(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Unidad</label>
                  <select
                    value={tagUnit}
                    onChange={(e) => setTagUnit(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                  >
                    <option value="kg">kg</option>
                    <option value="litros">litros</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNewTagModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
                >
                  Emitir Tarjeta Roja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registro 3S Seiso */}
      {showSeisoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <span>Control 3S Seiso (Higiene y Frío)</span>
              </h3>
              <button
                onClick={() => setShowSeisoModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSeiso} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Turno</label>
                <select
                  value={seisoShift}
                  onChange={(e) => setSeisoShift(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                >
                  <option value="MANANA">Mañana (Apertura)</option>
                  <option value="TARDE">Tarde (Pico Servicio)</option>
                  <option value="CIERRE">Cierre (Sanitización Total)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Temp. Cuarto Frío (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempCuartoFrio}
                    onChange={(e) => setTempCuartoFrio(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Temp. Freidoras (°C)</label>
                  <input
                    type="number"
                    step="1"
                    value={tempFreidora}
                    onChange={(e) => setTempFreidora(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Observaciones</label>
                <textarea
                  value={seisoObs}
                  onChange={(e) => setSeisoObs(e.target.value)}
                  placeholder="Sanitización completada, aceite en parámetros..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowSeisoModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg"
                >
                  Guardar Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Formulario Auditoría 5S (Admin Only) */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-purple-400" />
                <span>Auditoría Interna 5S (Admin)</span>
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAudit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">1S Seiri (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={auditScores.seiri}
                    onChange={(e) => setAuditScores({ ...auditScores, seiri: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">2S Seiton (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={auditScores.seiton}
                    onChange={(e) => setAuditScores({ ...auditScores, seiton: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">3S Seiso (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={auditScores.seiso}
                    onChange={(e) => setAuditScores({ ...auditScores, seiso: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">4S Seiketsu (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={auditScores.seiketsu}
                    onChange={(e) => setAuditScores({ ...auditScores, seiketsu: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">5S Shitsuke (0-100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={auditScores.shitsuke}
                  onChange={(e) => setAuditScores({ ...auditScores, shitsuke: Number(e.target.value) })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Dictamen del Auditor</label>
                <textarea
                  value={auditScores.notes}
                  onChange={(e) => setAuditScores({ ...auditScores, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Publicar Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

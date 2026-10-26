/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrollText, ShieldAlert, ShieldCheck, Filter, X } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useApp();
  const [filterViolations, setFilterViolations] = useState(false);

  if (!isOpen) return null;

  const displayedLogs = filterViolations
    ? auditLogs.filter((l) => l.isViolationAttempt)
    : auditLogs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white">
              Bitácora de Auditoría Inmutable & Control RBAC
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white text-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400 shrink-0">
          <p>
            Registro secuencial e inviolable de todas las transacciones operativas y bloqueos de seguridad.
          </p>

          <button
            onClick={() => setFilterViolations(!filterViolations)}
            className={`px-3 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
              filterViolations
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{filterViolations ? 'Mostrando Violaciones' : 'Filtrar Violaciones RBAC'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {displayedLogs.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              No hay eventos en este criterio de auditoría.
            </div>
          ) : (
            displayedLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border space-y-1 transition-colors ${
                  log.isViolationAttempt
                    ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                    : 'bg-stone-950/70 border-stone-800/80 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.isViolationAttempt ? (
                      <span className="text-[10px] font-mono uppercase bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800 font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Bloqueo RBAC
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase bg-stone-800 text-stone-300 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    )}

                    <span className="font-semibold text-stone-100">{log.userName}</span>
                    <span className="text-[10px] font-mono text-stone-500">({log.role})</span>
                  </div>

                  <span className="font-mono text-[11px] text-stone-500">{log.timestamp}</span>
                </div>

                <p className="text-xs leading-relaxed text-stone-300">{log.description}</p>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-stone-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs rounded-lg"
          >
            Cerrar Bitácora
          </button>
        </div>
      </div>
    </div>
  );
};

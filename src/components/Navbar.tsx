/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ShieldAlert, Shield, ScrollText, RefreshCw, ChefHat, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuditModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuditModal }) => {
  const { currentUser, switchUserRole, isLoading, refreshAllData, auditLogs, setShowLoginModal } = useApp();

  const navItems = [
    { id: 'pos', label: 'Punto de Venta (POS)' },
    { id: 'orders', label: 'Pedidos & Control' },
    { id: 'inventory', label: 'Flujos & Inventario (Chopra)' },
    { id: 'fives', label: 'Almacén 5S (Hirano)' },
    { id: 'logistics', label: 'Distribución (Ballou)' },
    { id: 'cash', label: 'Caja & Cuadre' },
    { id: 'reports', label: 'Finanzas & Costos', adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark (Single text element, strict 3-zone contract) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            Crocant Tour <span className="text-amber-500 font-medium text-xs ml-1 font-mono">Buga</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single line, text with active state) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const isForbiddenForAsesor = item.adminOnly && currentUser.role !== 'ADMIN';
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                } ${isForbiddenForAsesor ? 'opacity-60' : ''}`}
              >
                <span>{item.label}</span>
                {item.adminOnly && (
                  <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-400 px-1.5 py-0.2 rounded border border-amber-800/40">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: RBAC Interactive Role Switcher & Audit Tool */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openAuditModal}
            title="Ver Bitácora de Auditoría Inmutable"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors relative"
          >
            <ScrollText className="w-4 h-4" />
            {auditLogs.some((l) => l.isViolationAttempt) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => refreshAllData()}
            disabled={isLoading}
            title="Sincronizar flujos"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Quick RBAC Role Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800">
            <button
              onClick={() => switchUserRole('ASESOR')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentUser.role === 'ASESOR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Rol Asesor: Operativo (Crea ventas, consulta stock, registra cuadres e ingresos. PROHIBIDO editar/anular)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Asesor</span>
            </button>

            <button
              onClick={() => switchUserRole('ADMIN')}
              className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all whitespace-nowrap ${
                currentUser.role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Rol Administrador: Acceso total CRUD, reportes financieros y autorizaciones"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Active User Chip */}
          <div className="hidden sm:flex flex-col items-end pl-1 border-l border-stone-800">
            <span className="text-xs font-semibold text-stone-200 truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-mono text-stone-500">
              {currentUser.role === 'ADMIN' ? 'Control Total' : 'Operativo Estricto'}
            </span>
          </div>

          {/* Login / Auth Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            title="Abrir Módulo de Login & Autenticación"
            className="px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Iniciar Sesión</span>
          </button>
        </div>

      </div>

      {/* Mobile/Tablet Secondary Nav Bar */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-stone-800/80 bg-stone-950/80 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{item.label}</span>
              {item.adminOnly && (
                <span className="text-[9px] font-mono uppercase bg-amber-950 text-amber-400 px-1 rounded">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

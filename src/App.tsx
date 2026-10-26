/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PosView } from './components/PosView';
import { OrdersListView } from './components/OrdersListView';
import { InventoryView } from './components/InventoryView';
import { FiveSView } from './components/FiveSView';
import { LogisticsDeliveryView } from './components/LogisticsDeliveryView';
import { CashRegisterView } from './components/CashRegisterView';
import { AdminReportsView } from './components/AdminReportsView';
import { AuditLogModal } from './components/AuditLogModal';
import { LoginView } from './components/LoginView';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('pos');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const { notification, setNotification, showLoginModal, setShowLoginModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 ${
              notification.type === 'error'
                ? 'bg-rose-950/95 border-rose-800 text-rose-200'
                : notification.type === 'warning'
                ? 'bg-amber-950/95 border-amber-800 text-amber-200'
                : notification.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
                : 'bg-stone-900/95 border-stone-800 text-stone-200'
            }`}
          >
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              {notification.title && (
                <div className="font-bold text-sm mb-0.5 text-white">{notification.title}</div>
              )}
              <p className="leading-relaxed">{notification.message}</p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Viewport Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'pos' && <PosView />}
        {currentTab === 'orders' && <OrdersListView />}
        {currentTab === 'inventory' && <InventoryView />}
        {currentTab === 'fives' && <FiveSView />}
        {currentTab === 'logistics' && <LogisticsDeliveryView />}
        {currentTab === 'cash' && <CashRegisterView />}
        {currentTab === 'reports' && <AdminReportsView />}
      </main>

      {/* Audit Modal */}
      <AuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 z-10 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 p-1.5 rounded-full transition-colors"
              title="Cerrar modal de login"
            >
              <X className="w-4 h-4" />
            </button>
            <LoginView isModal={true} onSuccess={() => setShowLoginModal(false)} />
          </div>
        </div>
      )}

      {/* Quiet, Human Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-400">Crocant Tour</span>
            <span aria-hidden="true">·</span>
            <span>Especialistas en Alitas BBQ, Bowls, Tostadas Vallunas y Tenders</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-stone-500">
            <span>Guadalajara de Buga, Valle del Cauca</span>
            <span aria-hidden="true">·</span>
            <span>Chopra & Meindl (2016) / Hirano (1995) / Ballou (2004)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

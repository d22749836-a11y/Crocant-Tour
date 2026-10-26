/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, OrderChannel, PaymentMethod } from '../types';
import {
  Utensils,
  ShoppingBag,
  Bike,
  Plus,
  Minus,
  Trash2,
  Clock,
  Layers,
  CheckCircle,
  MapPin,
  AlertCircle,
} from 'lucide-react';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSauce: string;
  notes: string;
}

export const PosView: React.FC = () => {
  const { menu, deliveryZones, createOrder, currentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [channel, setChannel] = useState<OrderChannel>('DOMICILIO');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('Mesa 1');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-buga-centro');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'TODOS', label: 'Todo el Menú' },
    { id: 'ALITAS', label: 'Alitas BBQ' },
    { id: 'BOWLS', label: 'Bowls' },
    { id: 'TOSTADAS', label: 'Tostadas Vallunas' },
    { id: 'TENDERS', label: 'Tenders Crocantes' },
    { id: 'ACOMPANANTES', label: 'Acompañantes' },
    { id: 'BEBIDAS', label: 'Bebidas' },
  ];

  const sauces = [
    'BBQ Ahumada Tradicional',
    'Búfalo Spicy Picante',
    'Honey Mustard / Miel Mostaza',
    'Maracuyá BBQ Valle',
    'Tártara de la Casa',
    'Sriracha Mayo Artesanal',
  ];

  const filteredMenu =
    selectedCategory === 'TODOS' ? menu : menu.filter((m) => m.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menuItem: item,
          quantity: 1,
          selectedSauce: 'BBQ Ahumada Tradicional',
          notes: '',
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.menuItem.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateSauce = (itemId: string, sauce: string) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === itemId ? { ...c, selectedSauce: sauce } : c))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, c) => acc + c.menuItem.price * c.quantity, 0);
  const activeZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = channel === 'DOMICILIO' && activeZone ? activeZone.baseDeliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }
    if (channel === 'DOMICILIO' && !customerAddress.trim()) {
      alert('Por favor ingrese la dirección de entrega en Buga');
      return;
    }

    setIsSubmitting(true);
    const orderPayload = {
      channel,
      tableNumber: channel === 'MESA' ? tableNumber : undefined,
      customerName,
      customerPhone: customerPhone || 'Sin registrar',
      customerAddress: channel === 'DOMICILIO' ? customerAddress : undefined,
      deliveryZoneId: channel === 'DOMICILIO' ? selectedZoneId : undefined,
      items: cart.map((c) => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        quantity: c.quantity,
        unitPrice: c.menuItem.price,
        selectedSauce: c.selectedSauce,
        notes: c.notes,
      })),
      paymentMethod,
    };

    const success = await createOrder(orderPayload);
    setIsSubmitting(false);

    if (success) {
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner: Context & Operational Guide */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Terminal Punto de Venta (POS)</span>
            <span className="text-xs font-mono font-normal text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
              Crocant Tour Guadalajara de Buga
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Coordinación de demanda en tiempo real (Chopra & Meindl, 2016): Cada pedido genera deducción
            automática de recetas e impacta el stock de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400">Operador activo:</span>
          <span className="font-semibold text-stone-200">{currentUser.name}</span>
          <span className="text-stone-500 font-mono">({currentUser.role})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Categories and Products Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 font-mono text-[10px] bg-stone-950/80 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                    {item.code}
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs font-mono text-stone-300 flex items-center gap-1 bg-stone-950/70 px-1.5 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{item.prepTimeMinutes} min</span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-100 text-sm leading-tight group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-mono">Precio COP</span>
                      <span className="font-bold text-base text-amber-400 tabular-nums">
                        ${item.price.toLocaleString('es-CO')}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(item)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Checkout & Dispatch Details (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Comanda Actual</span>
            </h2>
            <span className="text-xs font-mono text-stone-400">
              {cart.reduce((s, c) => s + c.quantity, 0)} ítems
            </span>
          </div>

          {/* Channel Selector: Mesa, Para Llevar, Domicilio */}
          <div>
            <label className="text-[11px] font-mono uppercase text-stone-400 block mb-1.5">
              Canal de Distribución (Ballou, 2004)
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-950 rounded-lg border border-stone-800">
              <button
                type="button"
                onClick={() => setChannel('DOMICILIO')}
                className={`py-1.5 px-2 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                  channel === 'DOMICILIO'
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Domicilio</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('MESA')}
                className={`py-1.5 px-2 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                  channel === 'MESA'
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Mesa</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('LLEVAR')}
                className={`py-1.5 px-2 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors ${
                  channel === 'LLEVAR'
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Llevar</span>
              </button>
            </div>
          </div>

          {/* Customer & Location Details Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-300 block mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Andrés Restrepo"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-stone-300 block mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej. 316 489 1020"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {channel === 'MESA' && (
                <div>
                  <label className="text-xs text-stone-300 block mb-1">Número de Mesa</label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mesa 1">Mesa 1 (Interior)</option>
                    <option value="Mesa 2">Mesa 2 (Interior)</option>
                    <option value="Mesa 3">Mesa 3 (Ventanal)</option>
                    <option value="Mesa 4">Mesa 4 (Terraza)</option>
                    <option value="Mesa 5">Mesa 5 (Terraza)</option>
                    <option value="Barra 1">Barra de Servicio</option>
                  </select>
                </div>
              )}
            </div>

            {channel === 'DOMICILIO' && (
              <>
                <div>
                  <label className="text-xs text-stone-300 block mb-1">Dirección en Buga *</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Ej. Carrera 12 # 5-40, Barrio El Albergue"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">
                    Zona Logística Buga (Ballou, 2004)
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {deliveryZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} (${z.baseDeliveryFee.toLocaleString('es-CO')} · {z.estimatedTransitMin} min)
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Cart Items List */}
          <div className="border-t border-b border-stone-800 py-3 space-y-3 max-h-60 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-stone-500 text-xs">
                No hay productos seleccionados en la comanda.
              </div>
            ) : (
              cart.map((c) => (
                <div key={c.menuItem.id} className="text-xs space-y-1.5 pb-2 border-b border-stone-800/60 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-stone-100">{c.menuItem.name}</span>
                      <span className="text-[11px] text-amber-500 block font-mono">
                        ${(c.menuItem.price * c.quantity).toLocaleString('es-CO')} COP
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(c.menuItem.id, -1)}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-semibold px-1 text-stone-200">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(c.menuItem.id, 1)}
                        className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(c.menuItem.id)}
                        className="p-1 rounded hover:bg-rose-950/60 text-stone-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Sauce selector for wings / tenders */}
                  {(c.menuItem.category === 'ALITAS' || c.menuItem.category === 'TENDERS') && (
                    <div className="pt-1">
                      <select
                        value={c.selectedSauce}
                        onChange={(e) => updateSauce(c.menuItem.id, e.target.value)}
                        className="w-full text-[11px] bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-300"
                      >
                        {sauces.map((s) => (
                          <option key={s} value={s}>
                            Salsa: {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-mono uppercase text-stone-400 block mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'EFECTIVO', label: 'Efectivo' },
                { id: 'NEQUI', label: 'Nequi' },
                { id: 'DAVIPLATA', label: 'Daviplata' },
                { id: 'BANCOLOMBIA_QR', label: 'Bancolombia QR' },
                { id: 'DATAFONO', label: 'Datáfono' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id as PaymentMethod)}
                  className={`py-1.5 px-2 rounded border text-left flex items-center justify-between transition-colors ${
                    paymentMethod === p.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>{p.label}</span>
                  {paymentMethod === p.id && <CheckCircle className="w-3 h-3 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal Productos</span>
              <span className="font-mono tabular-nums">${subtotal.toLocaleString('es-CO')}</span>
            </div>

            {channel === 'DOMICILIO' && (
              <div className="flex justify-between text-stone-400">
                <span>Flete Domicilio ({activeZone?.name.split(':')[0]})</span>
                <span className="font-mono tabular-nums">${deliveryFee.toLocaleString('es-CO')}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
              <span>Total a Cobrar</span>
              <span className="font-mono text-amber-400 text-base tabular-nums">
                ${grandTotal.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              cart.length === 0 || isSubmitting
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {isSubmitting ? 'Procesando Flujo...' : `Cobrar $${grandTotal.toLocaleString('es-CO')}`}
            </span>
          </button>

          {/* RBAC Notice */}
          <div className="text-[11px] text-stone-400 flex items-start gap-1.5 bg-stone-950 p-2.5 rounded-lg border border-stone-800/80">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-300">Aviso RBAC:</strong> Una vez guardada la comanda, el rol{' '}
              <span className="text-amber-400 font-semibold">{currentUser.role}</span> no podrá anularla ni
              modificarla si no tiene privilegios de Administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

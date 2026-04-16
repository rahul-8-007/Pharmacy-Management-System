import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Delete, Pill, ShoppingCart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  dosage: string;
  quantityAvailable: number;
  expiryDate: string;
}

interface CartItem extends Medicine {
  cartQuantity: number;
  mockPrice: number;
}

export default function SellTablets() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Terminal state
  const [activeMedicine, setActiveMedicine] = useState<Medicine | null>(null);
  const [inputQuantity, setInputQuantity] = useState('1');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
      if (res.data.length > 0) setActiveMedicine(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Deterministic fake price for visual match
  const getSimulatedPrice = (id: string, basePrice = 12) => {
    const sumChars = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((sumChars % 30) + basePrice + 0.5).toFixed(2);
  };

  const handleNumpad = (val: string) => {
    if (val === 'DEL') {
      setInputQuantity(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (val === '.') {
      if (!inputQuantity.includes('.')) setInputQuantity(prev => prev + '.');
    } else {
      setInputQuantity(prev => prev === '0' ? val : prev + val);
    }
  };

  const addToCart = () => {
    if (!activeMedicine) return;
    const qty = parseInt(inputQuantity);
    if (isNaN(qty) || qty <= 0) return;

    if (qty > activeMedicine.quantityAvailable) {
       setMessage({ type: 'error', text: 'Insufficient stock for this quantity.' });
       setTimeout(() => setMessage(null), 3000);
       return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.id === activeMedicine.id);
      if (exists) {
        return prev.map(item => 
          item.id === activeMedicine.id 
            ? { ...item, cartQuantity: item.cartQuantity + qty } 
            : item
        );
      }
      return [...prev, {
        ...activeMedicine, 
        cartQuantity: qty, 
        mockPrice: parseFloat(getSimulatedPrice(activeMedicine.id))
      }];
    });
    
    setInputQuantity('1'); // Reset
    setMessage(null);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setMessage(null);

    let hasErrors = false;
    for (const item of cart) {
      try {
        await api.post('/sales/sell', {
          batchNo: item.batchNo,
          quantitySold: item.cartQuantity,
        });
      } catch (err) {
        console.error('Failed to checkout item', item.name, err);
        hasErrors = true;
      }
    }

    setCheckoutLoading(false);
    if (hasErrors) {
      setMessage({ type: 'error', text: 'Checkout completed with some errors. Please verify inventory.'});
    } else {
      setMessage({ type: 'success', text: `Successfully processed ${cart.length} items.` });
      setCart([]);
      fetchMedicines(); // Refresh stock
    }
    
    setTimeout(() => setMessage(null), 4000);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.mockPrice * item.cartQuantity), 0);
  const tax = subtotal * 0.045; // 4.5% mock tax
  const total = subtotal + tax;

  return (
    <div className="fade-in max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-0.5">TRANSACTION TERMINAL</p>
          <h1 className="text-3xl font-bold text-slate-900">Sales Interface</h1>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wider shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Inventory Sync
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-semibold text-sm border shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
           {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
           {message.text}
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
         
         {/* Left: Inventory Grid */}
         <div className="flex-1 bg-transparent overflow-y-auto pr-2 scrollbar-thin">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-64 opacity-50">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  Loading terminal data...
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicines.map((med) => {
                     const isSelected = activeMedicine?.id === med.id;
                     const isLowStock = med.quantityAvailable < 20;
                     return (
                        <div 
                           key={med.id}
                           onClick={() => { setActiveMedicine(med); setInputQuantity('1'); }}
                           className={`bg-white rounded-2xl p-5 border cursor-pointer hover:shadow-md transition-all relative overflow-hidden ${isSelected ? 'border-primary shadow-md ring-1 ring-primary' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}
                        >
                           {/* Stock tag */}
                           <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {med.quantityAvailable} in stock
                           </div>

                           <h3 className="font-bold text-lg text-blue-900 mt-2 mb-1">{med.name}</h3>
                           <p className="text-xs text-slate-500 mb-6 line-clamp-1">{med.dosage} • {med.batchNo}</p>
                           
                           <div className="flex items-center justify-between mt-auto">
                              <span className="text-xl font-bold text-slate-900">${getSimulatedPrice(med.id)}</span>
                              <button 
                                 className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                              >
                                 <Plus size={16} />
                              </button>
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
         </div>

         {/* Right: Checkout Sidebar */}
         <div className="w-[320px] shrink-0 flex flex-col gap-4">
            
            {/* Numpad Widget */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-4 shrink-0 transition-opacity">
               {activeMedicine ? (
                  <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                     <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Pill size={20} />
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-sm text-slate-800 truncate">{activeMedicine.name}</h4>
                        <p className="text-[10px] text-slate-500">Enter Quantity to Add</p>
                     </div>
                  </div>
               ) : (
                  <div className="opacity-50 text-sm font-bold text-center py-2">Select medicine</div>
               )}

               <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 tracking-wider">QUANTITY</span>
                  <span className="text-3xl font-bold text-blue-900">{inputQuantity.padStart(2, '0')}</span>
               </div>

               <div className="grid grid-cols-3 gap-2">
                  {['1','2','3','4','5','6','7','8','9','.', '0'].map(num => (
                     <button 
                        key={num} 
                        onClick={() => handleNumpad(num)}
                        className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-lg rounded-xl py-3 transition-colors"
                     >
                        {num}
                     </button>
                  ))}
                  <button onClick={() => handleNumpad('DEL')} className="bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold text-lg rounded-xl py-3 flex items-center justify-center transition-colors">
                     <Delete size={20} />
                  </button>
               </div>

               <button 
                  onClick={addToCart}
                  disabled={!activeMedicine}
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl mt-1 transition-colors shadow-sm"
               >
                  Add to Cart
               </button>
            </div>

            {/* Current Order Context */}
            <div className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col flex-1 min-h-0">
               <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
                  <ShoppingCart size={18} /> Current Order
               </div>

               <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 mb-4 space-y-3">
                  {cart.length === 0 && <p className="text-xs text-slate-400 italic">Cart is empty</p>}
                  {cart.map((item, id) => (
                     <div key={id} className="flex items-start justify-between">
                        <div>
                           <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                           <p className="text-[10px] text-slate-500">{item.cartQuantity} Units x ${item.mockPrice.toFixed(2)}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-900">${(item.cartQuantity * item.mockPrice).toFixed(2)}</span>
                     </div>
                  ))}
               </div>

               <div className="border-t border-slate-200 pt-3 space-y-1.5 shrink-0">
                  <div className="flex justify-between text-xs text-slate-500">
                     <span>Subtotal</span>
                     <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                     <span>Tax (4.5%)</span>
                     <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-200">
                     <span className="text-slate-900">Total</span>
                     <span className="text-blue-700">${total.toFixed(2)}</span>
                  </div>
               </div>

               <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkoutLoading}
                  className="w-full py-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold rounded-xl mt-5 transition-colors shadow flex items-center justify-center gap-2"
               >
                  {checkoutLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                  DISPENSE & PAY
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}

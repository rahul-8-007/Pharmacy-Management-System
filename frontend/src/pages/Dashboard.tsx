import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PackagePlus, HandCoins, ClipboardList, LineChart, AlertTriangle } from 'lucide-react';
import api from '../lib/api';

interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  quantityAvailable: number;
  expiryDate: string;
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch inventory to check rules (low stock, expiry)
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/medicines');
        const inventory: Medicine[] = res.data;
        const newAlerts: string[] = [];
        
        inventory.forEach(med => {
          if (med.quantityAvailable < 20) {
            newAlerts.push(`Low Stock Alert: ${med.name} (Batch: ${med.batchNo}) has ${med.quantityAvailable} units left.`);
          }
          
          const daysToExpiry = (new Date(med.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
          if (daysToExpiry > 0 && daysToExpiry < 30) {
            newAlerts.push(`Expiry Alert: ${med.name} (Batch: ${med.batchNo}) expires in ${Math.ceil(daysToExpiry)} days.`);
          }
        });
        
        setAlerts(newAlerts);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };
    
    fetchAlerts();
  }, []);

  const modules = [
    { name: 'Add New Stock', path: '/add-stock', icon: <PackagePlus size={40} className="text-blue-500" />, desc: 'Receive and log new medicine batches' },
    { name: 'Sell Tablets', path: '/sell', icon: <HandCoins size={40} className="text-green-500" />, desc: 'Process sales and automatically deduct stock' },
    { name: 'View Inventory', path: '/inventory', icon: <ClipboardList size={40} className="text-purple-500" />, desc: 'Search and filter active medicine stock' },
    { name: 'View Predictions', path: '/predictions', icon: <LineChart size={40} className="text-orange-500" />, desc: 'Analyze sales trends and reorder estimates' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Operational Dashboard</h1>
        <p className="text-gray-500">Select an action below to proceed.</p>
      </header>

      {alerts.length > 0 && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <h3 className="font-bold text-red-700">Action Required</h3>
          </div>
          <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
            {alerts.slice(0, 5).map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
            {alerts.length > 5 && <li>...and {alerts.length - 5} more alerts. Please check Inventory.</li>}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map(mod => (
          <Link 
            key={mod.name} 
            to={mod.path}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
                {mod.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">{mod.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{mod.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

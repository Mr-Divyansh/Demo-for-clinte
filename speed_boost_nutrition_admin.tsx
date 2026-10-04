import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- MOCK DATA ---
const salesData = [
  { name: 'Mon', sales: 3200 },
  { name: 'Tue', sales: 4100 },
  { name: 'Wed', sales: 3800 },
  { name: 'Thu', sales: 5400 },
  { name: 'Fri', sales: 4800 },
  { name: 'Sat', sales: 6100 },
  { name: 'Sun', sales: 5900 },
];

const recentOrders = [
  { id: '#ORD-7392', customer: 'Sarah Jenkins', products: 'Whey Isolate 5lbs, Creatine', amount: '$114.98', payment: 'Paid', date: 'Oct 24, 2023', status: 'Delivered' },
  { id: '#ORD-7393', customer: 'Michael Chen', products: 'Pre-Workout Energy x2', amount: '$79.98', payment: 'Paid', date: 'Oct 24, 2023', status: 'Processing' },
  { id: '#ORD-7394', customer: 'David Rodriguez', products: 'BCAA Powder, Shaker', amount: '$45.50', payment: 'Pending', date: 'Oct 24, 2023', status: 'Pending' },
  { id: '#ORD-7395', customer: 'Emma Wilson', products: 'Mass Gainer 10lbs', amount: '$89.99', payment: 'Paid', date: 'Oct 23, 2023', status: 'Shipped' },
  { id: '#ORD-7396', customer: 'James Thompson', products: 'Multivitamin, Omega 3', amount: '$54.00', payment: 'Failed', date: 'Oct 23, 2023', status: 'Cancelled' },
];

const topProducts = [
  { name: 'Whey Protein Isolate - Vanilla (5lbs)', category: 'Protein', sold: 412, revenue: '$32,918', image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Explosive Pre-Workout - Blue Raspberry', category: 'Energy', sold: 385, revenue: '$15,361', image: 'https://images.unsplash.com/photo-1594912952875-10499d4239e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  { name: 'Micronized Creatine Monohydrate', category: 'Recovery', sold: 350, revenue: '$8,750', image: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
];

const orderStatusCounts = [
  { label: 'Pending', count: 18, color: 'text-amber-500', bg: 'bg-amber-100', icon: Clock },
  { label: 'Processing', count: 22, color: 'text-blue-500', bg: 'bg-blue-100', icon: Activity },
  { label: 'Shipped', count: 150, color: 'text-indigo-500', bg: 'bg-indigo-100', icon: Truck },
  { label: 'Delivered', count: 800, color: 'text-emerald-500', bg: 'bg-emerald-100', icon: CheckCircle2 },
];

// --- HELPER COMPONENTS & FUNCTIONS ---
const StatusBadge = ({ status }) => {
  const styles = {
    Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Processing: 'bg-blue-100 text-blue-800 border-blue-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-white text-lg font-bold tracking-tight">Speed Boost<span className="text-blue-500">.</span></span>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          
          <a href="#" className="flex items-center px-3 py-2.5 bg-blue-600 text-white rounded-lg group">
            <LayoutDashboard size={20} className="mr-3" />
            <span className="font-medium">Dashboard</span>
          </a>
          
          <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <ShoppingCart size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-medium">Orders</span>
            <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">18</span>
          </a>
          
          <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <Package size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-medium">Products</span>
          </a>
          
          <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <Users size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-medium">Customers</span>
          </a>
          
          <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
            <BarChart3 size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-medium">Sales</span>
          </a>
          
          <div className="pt-6 pb-2">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
            <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group relative">
              <Bell size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Notifications</span>
              <span className="absolute top-3 left-7 w-2 h-2 bg-blue-500 rounded-full"></span>
            </a>
            
            <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group">
              <Settings size={20} className="mr-3 text-slate-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Settings</span>
            </a>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <a href="#" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors group">
            <LogOut size={20} className="mr-3 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">Logout</span>
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4 lg:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1 hidden sm:block">Overview of your store performance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, customers..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-64 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="relative text-slate-500 hover:text-slate-700">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</span>
            </button>

            {/* Profile */}
            <div className="flex items-center pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                AM
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-slate-700 leading-none">Alex Mercer</p>
                <p className="text-slate-500 text-xs mt-1">Store Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {}
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Sales</p>
                  <h3 className="text-2xl font-bold text-slate-900">$24,590</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="mt-auto flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp size={14} className="mr-1" /> +12%
                </span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                  <h3 className="text-2xl font-bold text-slate-900">342</h3>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div className="mt-auto flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp size={14} className="mr-1" /> +5%
                </span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </div>

            {/* Card 3: Pending */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Pending Orders</p>
                  <h3 className="text-2xl font-bold text-slate-900">18</h3>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Package size={20} />
                </div>
              </div>
              <div className="mt-auto flex items-center text-sm">
                <span className="flex items-center text-amber-600 font-medium">
                  <AlertCircle size={14} className="mr-1" /> Action needed
                </span>
              </div>
            </div>

            {/* Card 4: Customers */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Customers</p>
                  <h3 className="text-2xl font-bold text-slate-900">1,204</h3>
                </div>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users size={20} />
                </div>
              </div>
              <div className="mt-auto flex items-center text-sm">
                <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp size={14} className="mr-1" /> +8%
                </span>
                <span className="text-slate-400 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {}
          {/* Middle Row: Charts & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Sales Overview Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2 p-5 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sales Overview</h2>
                  <p className="text-sm text-slate-500">Revenue tracking over time</p>
                </div>
                
                {/* Time Filters */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-900 transition-colors">Today</button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-slate-900 shadow-sm">7 Days</button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-900 transition-colors">30 Days</button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">This Month</button>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                      formatter={(value) => [`$${value}`, 'Sales']}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:p-6 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Order Status</h2>
              <p className="text-sm text-slate-500 mb-6">Current active orders</p>
              
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {orderStatusCounts.map((status, index) => {
                  const Icon = status.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${status.bg} ${status.color}`}>
                          <Icon size={20} />
                        </div>
                        <span className="font-medium text-slate-700">{status.label}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">{status.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {}
          {/* Bottom Row: Recent Orders & Side Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col">
              <div className="p-5 lg:p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                  <p className="text-sm text-slate-500">Latest transactions</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
                  View All <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold border-b border-slate-200">Order ID</th>
                      <th className="px-6 py-4 font-semibold border-b border-slate-200">Customer</th>
                      <th className="px-6 py-4 font-semibold border-b border-slate-200">Products</th>
                      <th className="px-6 py-4 font-semibold border-b border-slate-200">Amount</th>
                      <th className="px-6 py-4 font-semibold border-b border-slate-200">Status</th>
                      <th className="px-6 py-4 font-semibold border-b border-slate-200 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{order.customer}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate" title={order.products}>{order.products}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">{order.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Top Products & Attention */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Attention / Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:p-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center mb-4">
                  <AlertCircle size={20} className="text-rose-500 mr-2" /> Attention Required
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start">
                    <div className="mt-0.5 mr-3 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">3 New pending orders</p>
                      <p className="text-xs text-slate-500 mt-1">Review and process before 2 PM</p>
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 flex items-start">
                    <div className="mt-0.5 mr-3 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Low Stock Alert</p>
                      <p className="text-xs text-slate-500 mt-1">Creatine Monohydrate (5 left)</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                    <div className="mt-0.5 mr-3 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">System Notification</p>
                      <p className="text-xs text-slate-500 mt-1">Automated backup completed at 3:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Report</button>
                </div>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate" title={product.name}>{product.name}</p>
                        <p className="text-xs text-slate-500">{product.category}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-bold text-slate-900">{product.revenue}</p>
                        <p className="text-xs text-slate-500">{product.sold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          <footer className="mt-8 text-center text-sm text-slate-400 pb-4">
            &copy; {new Date().getFullYear()} Speed Boost Nutrition. Admin Portal. Demo Data.
          </footer>
        </main>
      </div>
    </div>
  );
}
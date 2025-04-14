import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Car, 
  Route, 
  ShoppingCart 
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/routes', icon: Route, label: 'Routes' },
    { path: '/admin/tourist-spots', icon: Compass, label: 'Tourist Spots' },
    { path: '/admin/transport-hotels', icon: Car, label: 'Transport & Hotels' },
    { path: '/admin/explore', icon: Map, label: 'Explore' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
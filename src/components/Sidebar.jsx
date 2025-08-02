import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, CreditCard, Mail, Clock } from 'lucide-react';
import Tooltip from './Tooltip.jsx';

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: Home, active: true },
    { path: '/documents', label: 'My Documents', icon: FileText, active: true },
  ];

  const futureServices = [
    { label: 'W-2 Generator', icon: CreditCard, comingSoon: true },
    { label: 'Income Letters', icon: Mail, comingSoon: true },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          
          <div className="pt-6">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Future Services
            </h3>
            
            {futureServices.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                  <Tooltip content="Coming Soon">
                    <Clock className="w-4 h-4 ml-auto" />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
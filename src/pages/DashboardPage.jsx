import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Sidebar from '../components/Sidebar.jsx';
import PaystubForm from '../components/PaystubForm.jsx';

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.fullName?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to generate your next professional paystub?
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Generated</p>
                    <p className="text-sm text-gray-900">Never</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Generate New Paystub</h2>
                    <p className="text-gray-600 mt-1">
                      Create a professional paystub with intelligent calculations
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <PaystubForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calculator, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/Button.jsx';

export default function HomePage() {
  const features = [
    {
      icon: Calculator,
      title: 'Intelligent Calculations',
      description: 'Calculate pay from hourly rates or work backward from target salaries with precision.'
    },
    {
      icon: Shield,
      title: 'Professional Quality',
      description: 'Generate professional-grade paystubs that look and feel authentic.'
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      description: 'Create your documents in seconds with our streamlined workflow.'
    }
  ];

  const benefits = [
    'Automatic tax calculations (Federal, State, Social Security, Medicare)',
    'Customizable pre-tax and post-tax deductions',
    'Year-to-date tracking and calculations',
    'Multiple pay frequency options',
    'Professional document formatting',
    'Secure cloud storage of your documents'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Intelligent Paystub Generation 
            <span className="block text-blue-600">for the Modern Workforce</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create professional, accurate paystubs in minutes. Whether you're calculating from hourly wages 
            or working backward from target salaries, BuellDocs makes payroll documentation simple and reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="xl" className="flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose BuellDocs?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for accuracy, designed for simplicity. Our platform handles the complex calculations 
            so you can focus on what matters most.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-8 bg-white rounded-xl shadow-sm border">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Everything You Need for Professional Payroll Documentation
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
                <FileText className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h4 className="text-xl font-semibold mb-4">Ready to Get Started?</h4>
                <p className="mb-6 opacity-90">
                  Join thousands of professionals who trust BuellDocs for their payroll documentation needs.
                </p>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    className="bg-white text-blue-600 border-white hover:bg-blue-50"
                  >
                    Create Your First Paystub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Your Payroll Documentation?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get started with BuellDocs today and experience the future of professional document generation.
          </p>
          <Link to="/register">
            <Button size="xl" className="bg-blue-600 hover:bg-blue-700">
              Start Creating Documents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
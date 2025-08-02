import React, { useState, useEffect } from 'react';
import { Calculator, Download, Eye, EyeOff } from 'lucide-react';

interface EmployeeInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  employeeId: string;
  socialSecurity: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface PayPeriod {
  startDate: string;
  endDate: string;
  payDate: string;
}

interface Earnings {
  regularHours: number;
  regularRate: number;
  overtimeHours: number;
  overtimeRate: number;
  bonus: number;
  commission: number;
  other: number;
}

interface Deductions {
  federal: number;
  state: number;
  fica: number;
  medicare: number;
  insurance: number;
  retirement: number;
  other: number;
}

interface YTDTotals {
  grossPay: number;
  federal: number;
  state: number;
  fica: number;
  medicare: number;
  netPay: number;
}

const PaystubGenerator: React.FC = () => {
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    employeeId: '',
    socialSecurity: ''
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const [payPeriod, setPayPeriod] = useState<PayPeriod>({
    startDate: '',
    endDate: '',
    payDate: ''
  });

  const [earnings, setEarnings] = useState<Earnings>({
    regularHours: 80,
    regularRate: 25,
    overtimeHours: 0,
    overtimeRate: 37.5,
    bonus: 0,
    commission: 0,
    other: 0
  });

  const [customDeductions, setCustomDeductions] = useState({
    insurance: 150,
    retirement: 200,
    other: 0
  });

  const [ytdTotals, setYtdTotals] = useState<YTDTotals>({
    grossPay: 26000,
    federal: 3900,
    state: 1300,
    fica: 1612,
    medicare: 377,
    netPay: 18811
  });

  const [showSSN, setShowSSN] = useState(false);

  // Calculate gross pay
  const regularPay = earnings.regularHours * earnings.regularRate;
  const overtimePay = earnings.overtimeHours * earnings.overtimeRate;
  const grossPay = regularPay + overtimePay + earnings.bonus + earnings.commission + earnings.other;

  // Calculate taxes (simplified calculations)
  const federalTax = grossPay * 0.15; // 15% federal tax rate
  const stateTax = grossPay * 0.05; // 5% state tax rate
  const ficaTax = grossPay * 0.062; // 6.2% Social Security
  const medicareTax = grossPay * 0.0145; // 1.45% Medicare

  const totalTaxes = federalTax + stateTax + ficaTax + medicareTax;
  const totalDeductions = totalTaxes + customDeductions.insurance + customDeductions.retirement + customDeductions.other;
  const netPay = grossPay - totalDeductions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatSSN = (ssn: string) => {
    if (!showSSN && ssn.length >= 4) {
      return `***-**-${ssn.slice(-4)}`;
    }
    return ssn.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Paystub Generator</h1>
          <p className="text-gray-600">Create accurate, professional paystubs with detailed calculations</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="mr-2" size={20} />
              Paystub Information
            </h2>

            {/* Company Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Company Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={companyInfo.city}
                  onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="State"
                    value={companyInfo.state}
                    onChange={(e) => setCompanyInfo({...companyInfo, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={companyInfo.zip}
                    onChange={(e) => setCompanyInfo({...companyInfo, zip: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Employee Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={employeeInfo.name}
                  onChange={(e) => setEmployeeInfo({...employeeInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeInfo.employeeId}
                  onChange={(e) => setEmployeeInfo({...employeeInfo, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={employeeInfo.address}
                  onChange={(e) => setEmployeeInfo({...employeeInfo, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Social Security Number"
                  value={employeeInfo.socialSecurity}
                  onChange={(e) => setEmployeeInfo({...employeeInfo, socialSecurity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={employeeInfo.city}
                  onChange={(e) => setEmployeeInfo({...employeeInfo, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="State"
                    value={employeeInfo.state}
                    onChange={(e) => setEmployeeInfo({...employeeInfo, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={employeeInfo.zip}
                    onChange={(e) => setEmployeeInfo({...employeeInfo, zip: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pay Period */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Pay Period</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={payPeriod.startDate}
                    onChange={(e) => setPayPeriod({...payPeriod, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={payPeriod.endDate}
                    onChange={(e) => setPayPeriod({...payPeriod, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pay Date</label>
                  <input
                    type="date"
                    value={payPeriod.payDate}
                    onChange={(e) => setPayPeriod({...payPeriod, payDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Earnings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regular Hours</label>
                  <input
                    type="number"
                    value={earnings.regularHours}
                    onChange={(e) => setEarnings({...earnings, regularHours: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    value={earnings.regularRate}
                    onChange={(e) => setEarnings({...earnings, regularRate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Hours</label>
                  <input
                    type="number"
                    value={earnings.overtimeHours}
                    onChange={(e) => setEarnings({...earnings, overtimeHours: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Rate</label>
                  <input
                    type="number"
                    value={earnings.overtimeRate}
                    onChange={(e) => setEarnings({...earnings, overtimeRate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                  <input
                    type="number"
                    value={earnings.bonus}
                    onChange={(e) => setEarnings({...earnings, bonus: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
                  <input
                    type="number"
                    value={earnings.commission}
                    onChange={(e) => setEarnings({...earnings, commission: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Deductions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Health Insurance</label>
                  <input
                    type="number"
                    value={customDeductions.insurance}
                    onChange={(e) => setCustomDeductions({...customDeductions, insurance: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">401(k) Contribution</label>
                  <input
                    type="number"
                    value={customDeductions.retirement}
                    onChange={(e) => setCustomDeductions({...customDeductions, retirement: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* YTD Totals */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Year-to-Date Totals</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YTD Gross Pay</label>
                  <input
                    type="number"
                    value={ytdTotals.grossPay}
                    onChange={(e) => setYtdTotals({...ytdTotals, grossPay: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YTD Net Pay</label>
                  <input
                    type="number"
                    value={ytdTotals.netPay}
                    onChange={(e) => setYtdTotals({...ytdTotals, netPay: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Paystub Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Paystub Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSSN(!showSSN)}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {showSSN ? <EyeOff size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                  {showSSN ? 'Hide' : 'Show'} SSN
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} className="mr-1" />
                  Print
                </button>
              </div>
            </div>

            {/* Paystub Content */}
            <div id="paystub" className="border-2 border-gray-300 p-6 bg-white print:border-black print:shadow-none">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-6 print:border-black">
                <h1 className="text-2xl font-bold text-gray-900">{companyInfo.name || 'Company Name'}</h1>
                <p className="text-sm text-gray-600">
                  {companyInfo.address && `${companyInfo.address}, `}
                  {companyInfo.city && `${companyInfo.city}, `}
                  {companyInfo.state} {companyInfo.zip}
                </p>
                <h2 className="text-lg font-semibold text-gray-800 mt-2">EARNINGS STATEMENT</h2>
              </div>

              {/* Employee Info and Pay Period */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">EMPLOYEE</h3>
                  <p className="text-sm">{employeeInfo.name || 'Employee Name'}</p>
                  <p className="text-sm">{employeeInfo.address}</p>
                  <p className="text-sm">
                    {employeeInfo.city && `${employeeInfo.city}, `}
                    {employeeInfo.state} {employeeInfo.zip}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm"><span className="font-medium">Employee ID:</span> {employeeInfo.employeeId}</p>
                    <p className="text-sm"><span className="font-medium">SSN:</span> {formatSSN(employeeInfo.socialSecurity)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">PAY PERIOD</h3>
                  <p className="text-sm"><span className="font-medium">Period:</span> {payPeriod.startDate} to {payPeriod.endDate}</p>
                  <p className="text-sm"><span className="font-medium">Pay Date:</span> {payPeriod.payDate}</p>
                </div>
              </div>

              {/* Earnings and Deductions Table */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm print:border-black">
                  <thead>
                    <tr className="bg-gray-100 print:bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left print:border-black">EARNINGS</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">HOURS</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">RATE</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">CURRENT</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 print:border-black">Regular</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{earnings.regularHours}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(earnings.regularRate)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(regularPay)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                    </tr>
                    {earnings.overtimeHours > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2 print:border-black">Overtime</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{earnings.overtimeHours}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(earnings.overtimeRate)}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(overtimePay)}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                      </tr>
                    )}
                    {earnings.bonus > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2 print:border-black">Bonus</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(earnings.bonus)}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 font-semibold print:bg-gray-50">
                      <td className="border border-gray-300 p-2 print:border-black">GROSS PAY</td>
                      <td className="border border-gray-300 p-2 print:border-black"></td>
                      <td className="border border-gray-300 p-2 print:border-black"></td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(grossPay)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ytdTotals.grossPay + grossPay)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm print:border-black">
                  <thead>
                    <tr className="bg-gray-100 print:bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left print:border-black">DEDUCTIONS</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">CURRENT</th>
                      <th className="border border-gray-300 p-2 text-right print:border-black">YTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 print:border-black">Federal Tax</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(federalTax)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ytdTotals.federal + federalTax)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 print:border-black">State Tax</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(stateTax)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ytdTotals.state + stateTax)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 print:border-black">Social Security</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ficaTax)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ytdTotals.fica + ficaTax)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 print:border-black">Medicare</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(medicareTax)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(ytdTotals.medicare + medicareTax)}</td>
                    </tr>
                    {customDeductions.insurance > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2 print:border-black">Health Insurance</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(customDeductions.insurance)}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                      </tr>
                    )}
                    {customDeductions.retirement > 0 && (
                      <tr>
                        <td className="border border-gray-300 p-2 print:border-black">401(k)</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(customDeductions.retirement)}</td>
                        <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 font-semibold print:bg-gray-50">
                      <td className="border border-gray-300 p-2 print:border-black">TOTAL DEDUCTIONS</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">{formatCurrency(totalDeductions)}</td>
                      <td className="border border-gray-300 p-2 text-right print:border-black">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Net Pay */}
              <div className="border-t-2 border-gray-300 pt-4 print:border-black">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">NET PAY</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(netPay)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Year-to-Date Net Pay</span>
                  <span className="text-lg font-semibold text-gray-800">{formatCurrency(ytdTotals.netPay + netPay)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubGenerator;
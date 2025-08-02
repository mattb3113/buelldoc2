import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calculator, Download } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../utils/firebase.js';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Tooltip from './Tooltip.jsx';
import toast from 'react-hot-toast';
import {
  PAY_FREQUENCIES,
  SALARY_FREQUENCIES,
  PRE_TAX_DEDUCTIONS,
  POST_TAX_DEDUCTIONS,
  calculateGrossFromHourly,
  calculateGrossFromSalary,
  calculateTaxes,
  calculateNetPay,
  calculatePayPeriodDates,
  calculateYTDTotals
} from '../utils/calculations.js';

export default function PaystubForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Pay Setup
  const [payFrequency, setPayFrequency] = useState('BI_WEEKLY');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculationMethod, setCalculationMethod] = useState('hourly');
  
  // Step 2: Income & Deductions
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [targetSalary, setTargetSalary] = useState('');
  const [salaryFrequency, setSalaryFrequency] = useState('ANNUAL');
  const [preTaxDeductions, setPreTaxDeductions] = useState([]);
  const [postTaxDeductions, setPostTaxDeductions] = useState([]);
  const [previousYTD, setPreviousYTD] = useState({});
  
  // Calculated values
  const [grossPay, setGrossPay] = useState(0);
  const [taxes, setTaxes] = useState({});
  const [netPay, setNetPay] = useState(0);
  const [payPeriodDates, setPayPeriodDates] = useState({ start: '', end: '' });

  // Calculate gross pay when inputs change
  useEffect(() => {
    let calculated = 0;
    
    if (calculationMethod === 'hourly' && hourlyRate && hoursWorked) {
      calculated = calculateGrossFromHourly(parseFloat(hourlyRate), parseFloat(hoursWorked));
    } else if (calculationMethod === 'salary' && targetSalary) {
      calculated = calculateGrossFromSalary(
        parseFloat(targetSalary), 
        salaryFrequency, 
        payFrequency
      );
    }
    
    setGrossPay(calculated);
    
    if (calculated > 0) {
      const calculatedTaxes = calculateTaxes(calculated);
      setTaxes(calculatedTaxes);
      
      const calculatedNetPay = calculateNetPay(
        calculated, 
        calculatedTaxes, 
        preTaxDeductions, 
        postTaxDeductions
      );
      setNetPay(calculatedNetPay);
    }
  }, [hourlyRate, hoursWorked, targetSalary, salaryFrequency, payFrequency, calculationMethod, preTaxDeductions, postTaxDeductions]);

  // Calculate pay period dates when pay date or frequency changes
  useEffect(() => {
    if (payDate && payFrequency) {
      const dates = calculatePayPeriodDates(payDate, payFrequency);
      setPayPeriodDates(dates);
    }
  }, [payDate, payFrequency]);

  const addDeduction = (type, deductionType) => {
    const newDeduction = {
      id: Date.now(),
      type: deductionType,
      amount: 0
    };
    
    if (type === 'preTax') {
      setPreTaxDeductions([...preTaxDeductions, newDeduction]);
    } else {
      setPostTaxDeductions([...postTaxDeductions, newDeduction]);
    }
  };

  const updateDeduction = (type, id, amount) => {
    const updateFn = (deductions) =>
      deductions.map(d => d.id === id ? { ...d, amount: parseFloat(amount) || 0 } : d);
    
    if (type === 'preTax') {
      setPreTaxDeductions(updateFn);
    } else {
      setPostTaxDeductions(updateFn);
    }
  };

  const removeDeduction = (type, id) => {
    if (type === 'preTax') {
      setPreTaxDeductions(preTaxDeductions.filter(d => d.id !== id));
    } else {
      setPostTaxDeductions(postTaxDeductions.filter(d => d.id !== id));
    }
  };

  const generateDocument = async () => {
    setLoading(true);
    
    try {
      // Calculate YTD totals
      const currentPeriod = { grossPay, netPay, taxes };
      const ytdTotals = calculateYTDTotals(currentPeriod, previousYTD);
      
      // Save to Firestore
      const docData = {
        userId: currentUser.uid,
        type: 'paystub',
        createdAt: new Date().toISOString(),
        payDate,
        payFrequency,
        calculationMethod,
        grossPay,
        netPay,
        taxes,
        preTaxDeductions,
        postTaxDeductions,
        ytdTotals,
        payPeriodDates
      };
      
      await addDoc(collection(db, 'documents'), docData);
      
      // Simulate document generation
      const htmlContent = generateHTMLDocument(docData, ytdTotals);
      downloadDocument(htmlContent, `paystub_${payDate}.html`);
      
      toast.success('Paystub generated successfully!');
      navigate('/documents');
      
    } catch (error) {
      toast.error('Failed to generate paystub');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateHTMLDocument = (data, ytd) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Paystub - ${data.payDate}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
        .currency { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PAYSTUB</h1>
        <p>Pay Date: ${data.payDate}</p>
        <p>Pay Period: ${data.payPeriodDates.start} to ${data.payPeriodDates.end}</p>
    </div>
    
    <div class="grid">
        <div>
            <h3>Earnings</h3>
            <div class="item">
                <span>Gross Pay</span>
                <span class="currency">$${data.grossPay.toFixed(2)}</span>
            </div>
            
            <h3>Taxes</h3>
            <div class="item">
                <span>Federal Tax (12%)</span>
                <span class="currency">$${data.taxes.federal.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>State Tax (5%)</span>
                <span class="currency">$${data.taxes.state.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>Social Security (6.2%)</span>
                <span class="currency">$${data.taxes.socialSecurity.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>Medicare (1.45%)</span>
                <span class="currency">$${data.taxes.medicare.toFixed(2)}</span>
            </div>
            
            <div class="item total">
                <span>Net Pay</span>
                <span class="currency">$${data.netPay.toFixed(2)}</span>
            </div>
        </div>
        
        <div>
            <h3>Year-to-Date</h3>
            <div class="item">
                <span>YTD Gross</span>
                <span class="currency">$${ytd.grossPay.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>YTD Net</span>
                <span class="currency">$${ytd.netPay.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>YTD Federal Tax</span>
                <span class="currency">$${ytd.taxes.federal.toFixed(2)}</span>
            </div>
            <div class="item">
                <span>YTD State Tax</span>
                <span class="currency">$${ytd.taxes.state.toFixed(2)}</span>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        Generated by BuellDocs - For novelty and educational purposes only
    </div>
</body>
</html>`;
  };

  const downloadDocument = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Setup</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pay Frequency
          </label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(PAY_FREQUENCIES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        
        <Input
          label="Pay Date"
          type="date"
          value={payDate}
          onChange={(e) => setPayDate(e.target.value)}
        />
      </div>
      
      {payPeriodDates.start && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Pay Period: {payPeriodDates.start} to {payPeriodDates.end}
          </p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Calculation Method
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => setCalculationMethod('hourly')}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-colors ${
              calculationMethod === 'hourly'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Hourly Rate</h3>
            <p className="text-sm text-gray-600 text-center">
              Calculate from your hourly rate and hours worked
            </p>
          </div>
          
          <div
            onClick={() => setCalculationMethod('salary')}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-colors relative ${
              calculationMethod === 'salary'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="absolute top-2 right-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Pro Feature
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Target Salary</h3>
            <p className="text-sm text-gray-600 text-center">
              Work backward from your desired salary
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Income & Deductions</h2>
      
      {/* Income Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Income Details</h3>
        
        {calculationMethod === 'hourly' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Hourly Rate ($)"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="25.00"
            />
            <Input
              label="Hours Worked"
              type="number"
              step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              placeholder="80"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Target Salary ($)"
              type="number"
              step="1"
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              placeholder="75000"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Frequency
              </label>
              <select
                value={salaryFrequency}
                onChange={(e) => setSalaryFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SALARY_FREQUENCIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {grossPay > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold text-green-900">
              Calculated Gross Pay for this Period: ${grossPay.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      
      {/* Taxes Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Automatic Tax Calculations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Federal Tax (12%)</span>
              <span>${taxes.federal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>State Tax (5%)</span>
              <span>${taxes.state?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Social Security (6.2%)</span>
              <span>${taxes.socialSecurity?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Medicare (1.45%)</span>
              <span>${taxes.medicare?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deductions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Pre-Tax Deductions
            <Tooltip content="Deductions taken before taxes are calculated">
              <span className="ml-2" />
            </Tooltip>
          </h3>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDeduction('preTax', e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">Add Deduction</option>
              {PRE_TAX_DEDUCTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        {preTaxDeductions.map(deduction => (
          <div key={deduction.id} className="flex items-center space-x-4 mb-2">
            <span className="flex-1">{deduction.type}</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-32"
              onChange={(e) => updateDeduction('preTax', deduction.id, e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeDeduction('preTax', deduction.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex items-center justify-between mb-4 mt-6">
          <h3 className="text-lg font-semibold">
            Post-Tax Deductions
            <Tooltip content="Deductions taken after taxes are calculated">
              <span className="ml-2" />
            </Tooltip>
          </h3>
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addDeduction('postTax', e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="">Add Deduction</option>
              {POST_TAX_DEDUCTIONS.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        {postTaxDeductions.map(deduction => (
          <div key={deduction.id} className="flex items-center space-x-4 mb-2">
            <span className="flex-1">{deduction.type}</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-32"
              onChange={(e) => updateDeduction('postTax', deduction.id, e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeDeduction('postTax', deduction.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const ytdTotals = calculateYTDTotals({ grossPay, netPay, taxes }, previousYTD);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview & Finalize</h2>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Period</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gross Pay</span>
                  <span className="font-medium">${grossPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Federal Tax</span>
                  <span>-${taxes.federal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>State Tax</span>
                  <span>-${taxes.state?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Social Security</span>
                  <span>-${taxes.socialSecurity?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Medicare</span>
                  <span>-${taxes.medicare?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Net Pay</span>
                    <span>${netPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Year-to-Date</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>YTD Gross</span>
                  <span className="font-medium">${ytdTotals.grossPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>YTD Federal Tax</span>
                  <span>${ytdTotals.taxes.federal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>YTD State Tax</span>
                  <span>${ytdTotals.taxes.state.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>YTD Social Security</span>
                  <span>${ytdTotals.taxes.socialSecurity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>YTD Medicare</span>
                  <span>${ytdTotals.taxes.medicare.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>YTD Net Pay</span>
                    <span>${ytdTotals.netPay.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={generateDocument}
                loading={loading}
                className="flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Generate Document</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <div className="text-sm text-gray-600">
            Step {step} of 3: {
              step === 1 ? 'Pay Setup' :
              step === 2 ? 'Income & Deductions' :
              'Preview & Finalize'
            }
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="bg-white rounded-lg shadow-sm border p-8">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 3 && (
            <Button
              onClick={() => setStep(Math.min(3, step + 1))}
              disabled={
                (step === 1 && (!payFrequency || !payDate || !calculationMethod)) ||
                (step === 2 && grossPay <= 0)
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
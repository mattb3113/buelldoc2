import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface PaystubGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToBankStatement?: (paystubData?: any) => void;
}

interface PaystubData {
  // Employee Information
  employeeName: string;
  employeeAddress: string;
  employeeCity: string;
  employeeState: string;
  employeeZip: string;
  employeeSSN: string;
  employeeId: string;
  
  // Employer Information
  employerName: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerEIN: string;
  
  // Banking Information
  checkNumber: string;
  routingNumber: string;
  accountNumber: string;
  
  // Pay Information
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  numberOfStubs: number;
  taxYear: number;
  
  // Income Calculation Method
  calculationMethod: 'manual' | 'target';
  
  // Manual Method
  payRate: number;
  hoursWorked: number;
  
  // Target Method
  targetSalaryType: 'annual' | 'monthly';
  targetSalary: number;
  
  // YTD Information
  initialYTDGrossPay: number;
  
  // Custom Earnings and Deductions
  customEarnings: Array<{ name: string; amount: number; taxable: boolean }>;
  customDeductions: Array<{ name: string; amount: number; pretax: boolean }>;
  
  // Generated stub dates
  stubDates: string[];
}

interface GeneratedPaystub {
  id: string;
  payDate: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  netPay: number;
  ytdGross: number;
  ytdNet: number;
  ytdFederalTax: number;
  ytdStateTax: number;
  ytdSocialSecurity: number;
  ytdMedicare: number;
  checkNumber: string;
  html: string;
}

const PaystubGenerator: React.FC<PaystubGeneratorProps> = ({ 
  user, 
  onBack, 
  onLogout, 
  onNavigateToBankStatement 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PaystubData>({
    employeeName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeeSSN: '',
    employeeId: '',
    employerName: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employerEIN: '',
    checkNumber: '',
    routingNumber: '',
    accountNumber: '',
    payFrequency: 'biweekly',
    numberOfStubs: 1,
    taxYear: new Date().getFullYear(),
    calculationMethod: 'manual',
    payRate: 0,
    hoursWorked: 0,
    targetSalaryType: 'annual',
    targetSalary: 0,
    initialYTDGrossPay: 0,
    customEarnings: [],
    customDeductions: [],
    stubDates: []
  });
  
  const [generatedPaystubs, setGeneratedPaystubs] = useState<GeneratedPaystub[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field: keyof PaystubData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate stub dates when relevant fields change
      if (field === 'numberOfStubs' || field === 'payFrequency') {
        updated.stubDates = generateStubDates(updated.numberOfStubs, updated.payFrequency);
      }
      
      return updated;
    });
  };

  const generateStubDates = (numberOfStubs: number, payFrequency: string): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    let daysBetween = 14; // Default biweekly
    switch (payFrequency) {
      case 'weekly': daysBetween = 7; break;
      case 'biweekly': daysBetween = 14; break;
      case 'semimonthly': daysBetween = 15; break;
      case 'monthly': daysBetween = 30; break;
    }
    
    for (let i = 0; i < numberOfStubs; i++) {
      const payDate = new Date(today);
      payDate.setDate(today.getDate() - (i * daysBetween));
      dates.push(payDate.toISOString().split('T')[0]);
    }
    
    return dates.reverse(); // Oldest first
  };

  const addCustomEarning = () => {
    setFormData(prev => ({
      ...prev,
      customEarnings: [...prev.customEarnings, { name: '', amount: 0, taxable: true }]
    }));
  };

  const removeCustomEarning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customEarnings: prev.customEarnings.filter((_, i) => i !== index)
    }));
  };

  const updateCustomEarning = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customEarnings: prev.customEarnings.map((earning, i) => 
        i === index ? { ...earning, [field]: value } : earning
      )
    }));
  };

  const addCustomDeduction = () => {
    setFormData(prev => ({
      ...prev,
      customDeductions: [...prev.customDeductions, { name: '', amount: 0, pretax: false }]
    }));
  };

  const removeCustomDeduction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customDeductions: prev.customDeductions.filter((_, i) => i !== index)
    }));
  };

  const updateCustomDeduction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customDeductions: prev.customDeductions.map((deduction, i) => 
        i === index ? { ...deduction, [field]: value } : deduction
      )
    }));
  };

  const calculatePayFromTarget = () => {
    if (formData.calculationMethod !== 'target' || formData.targetSalary <= 0) return { rate: 0, hours: 0 };
    
    let annualSalary = formData.targetSalary;
    if (formData.targetSalaryType === 'monthly') {
      annualSalary = formData.targetSalary * 12;
    }
    
    let periodsPerYear = 26; // Default biweekly
    switch (formData.payFrequency) {
      case 'weekly': periodsPerYear = 52; break;
      case 'biweekly': periodsPerYear = 26; break;
      case 'semimonthly': periodsPerYear = 24; break;
      case 'monthly': periodsPerYear = 12; break;
    }
    
    const grossPerPeriod = annualSalary / periodsPerYear;
    const assumedHours = 40; // Standard full-time hours
    const calculatedRate = grossPerPeriod / assumedHours;
    
    return { rate: calculatedRate, hours: assumedHours };
  };

  const calculateTaxes = (grossPay: number, ytdGross: number, state: string = 'CA') => {
    // Federal tax brackets for 2024 (single filer)
    const federalBrackets = [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 }
    ];
    
    // Calculate federal tax
    let federalTax = 0;
    const annualizedGross = ytdGross + grossPay;
    
    for (const bracket of federalBrackets) {
      if (annualizedGross > bracket.min) {
        const taxableInBracket = Math.min(annualizedGross, bracket.max) - bracket.min;
        federalTax += taxableInBracket * bracket.rate;
      }
    }
    
    // Prorate federal tax for this pay period
    const periodsPerYear = formData.payFrequency === 'weekly' ? 52 : 
                          formData.payFrequency === 'biweekly' ? 26 :
                          formData.payFrequency === 'semimonthly' ? 24 : 12;
    
    federalTax = federalTax / periodsPerYear;
    
    // State tax (simplified - using CA as example)
    const stateTaxRate = state === 'CA' ? 0.05 : 
                        state === 'NY' ? 0.06 :
                        state === 'TX' ? 0 : 0.04;
    const stateTax = grossPay * stateTaxRate;
    
    // Social Security (6.2% up to wage base)
    const ssWageBase = 160200; // 2024 limit
    const socialSecurityTax = Math.min(grossPay * 0.062, Math.max(0, (ssWageBase - ytdGross) * 0.062));
    
    // Medicare (1.45% + 0.9% additional on high earners)
    const medicareTax = grossPay * 0.0145;
    const additionalMedicareTax = (ytdGross + grossPay > 200000) ? grossPay * 0.009 : 0;
    
    return {
      federalTax: Math.max(0, federalTax),
      stateTax: Math.max(0, stateTax),
      socialSecurityTax: Math.max(0, socialSecurityTax),
      medicareTax: medicareTax + additionalMedicareTax
    };
  };

  const generatePaystubs = async () => {
    setIsGenerating(true);
    
    try {
      const paystubs: GeneratedPaystub[] = [];
      let runningYTDGross = formData.initialYTDGrossPay;
      let runningYTDNet = 0;
      let runningYTDFederal = 0;
      let runningYTDState = 0;
      let runningYTDSS = 0;
      let runningYTDMedicare = 0;
      
      const { rate, hours } = formData.calculationMethod === 'target' 
        ? calculatePayFromTarget() 
        : { rate: formData.payRate, hours: formData.hoursWorked };
      
      for (let i = 0; i < formData.numberOfStubs; i++) {
        const payDate = new Date(formData.stubDates[i]);
        const payPeriodEnd = new Date(payDate);
        const payPeriodStart = new Date(payDate);
        
        // Calculate pay period dates
        const daysBetween = formData.payFrequency === 'weekly' ? 7 :
                           formData.payFrequency === 'biweekly' ? 14 :
                           formData.payFrequency === 'semimonthly' ? 15 : 30;
        
        payPeriodStart.setDate(payPeriodEnd.getDate() - daysBetween + 1);
        
        // Calculate gross pay
        let grossPay = rate * hours;
        
        // Add custom earnings
        formData.customEarnings.forEach(earning => {
          if (earning.taxable) {
            grossPay += earning.amount;
          }
        });
        
        // Calculate taxes
        const taxes = calculateTaxes(grossPay, runningYTDGross, formData.employeeState);
        
        // Calculate deductions
        let totalDeductions = taxes.federalTax + taxes.stateTax + taxes.socialSecurityTax + taxes.medicareTax;
        
        formData.customDeductions.forEach(deduction => {
          totalDeductions += deduction.amount;
        });
        
        const netPay = grossPay - totalDeductions;
        
        // Update YTD totals
        runningYTDGross += grossPay;
        runningYTDNet += netPay;
        runningYTDFederal += taxes.federalTax;
        runningYTDState += taxes.stateTax;
        runningYTDSS += taxes.socialSecurityTax;
        runningYTDMedicare += taxes.medicareTax;
        
        const checkNumber = (parseInt(formData.checkNumber) + i).toString();
        
        // Generate HTML
        const html = generatePaystubHTML({
          ...formData,
          payDate: payDate.toLocaleDateString(),
          payPeriodStart: payPeriodStart.toLocaleDateString(),
          payPeriodEnd: payPeriodEnd.toLocaleDateString(),
          grossPay,
          netPay,
          taxes,
          ytdGross: runningYTDGross,
          ytdNet: runningYTDNet,
          ytdFederalTax: runningYTDFederal,
          ytdStateTax: runningYTDState,
          ytdSocialSecurity: runningYTDSS,
          ytdMedicare: runningYTDMedicare,
          checkNumber,
          rate,
          hours
        });
        
        paystubs.push({
          id: `paystub-${Date.now()}-${i}`,
          payDate: formData.stubDates[i],
          payPeriodStart: payPeriodStart.toISOString().split('T')[0],
          payPeriodEnd: payPeriodEnd.toISOString().split('T')[0],
          grossPay,
          netPay,
          ytdGross: runningYTDGross,
          ytdNet: runningYTDNet,
          ytdFederalTax: runningYTDFederal,
          ytdStateTax: runningYTDState,
          ytdSocialSecurity: runningYTDSS,
          ytdMedicare: runningYTDMedicare,
          checkNumber,
          html
        });
      }
      
      setGeneratedPaystubs(paystubs);
      setCurrentPreviewIndex(0);
      
      // Save to localStorage for dashboard
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      paystubs.forEach(paystub => {
        documents.unshift({
          id: paystub.id,
          type: 'paystub',
          name: `Paystub - ${formData.employeeName} (${new Date(paystub.payDate).toLocaleDateString()})`,
          createdAt: new Date().toISOString(),
          status: 'completed',
          data: paystub
        });
      });
      
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating paystubs:', error);
      alert('An error occurred while generating paystubs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePaystubHTML = (data: any) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 2px solid #000; background: white;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">${data.employerName}</h1>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">${data.employerAddress}</p>
          <p style="margin: 0; font-size: 14px; color: #666;">${data.employerCity}, ${data.employerState} ${data.employerZip}</p>
          <p style="margin: 5px 0; font-size: 14px; color: #666;">EIN: ${data.employerEIN}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Employee Information</h3>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Name:</strong> ${data.employeeName}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Address:</strong> ${data.employeeAddress}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>City, State ZIP:</strong> ${data.employeeCity}, ${data.employeeState} ${data.employeeZip}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>SSN:</strong> ***-**-${data.employeeSSN.slice(-4)}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Employee ID:</strong> ${data.employeeId}</p>
          </div>
          <div style="flex: 1; margin-left: 20px;">
            <h3 style="color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Pay Period & Banking</h3>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Pay Period:</strong> ${data.payPeriodStart} - ${data.payPeriodEnd}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Pay Date:</strong> ${data.payDate}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Check #:</strong> ${data.checkNumber}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Routing:</strong> ${data.routingNumber}</p>
            <p style="margin: 3px 0; font-size: 14px;"><strong>Account:</strong> ***${data.accountNumber.slice(-4)}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px;">Earnings</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">Rate</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">Hours</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">Current</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">YTD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">Regular Pay</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.rate.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">${data.hours}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${(data.rate * data.hours).toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdGross.toFixed(2)}</td>
            </tr>
            ${data.customEarnings?.map((earning: any) => `
              <tr>
                <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">${earning.name}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">-</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">-</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${earning.amount.toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">-</td>
              </tr>
            `).join('') || ''}
            <tr style="background-color: #f9f9f9; font-weight: bold;">
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;" colspan="3">Gross Pay</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.grossPay.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdGross.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px;">Deductions</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">Current</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">YTD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">Federal Tax</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.taxes.federalTax.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdFederalTax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">State Tax</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.taxes.stateTax.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdStateTax.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">Social Security</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.taxes.socialSecurityTax.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdSocialSecurity.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">Medicare</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.taxes.medicareTax.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${data.ytdMedicare.toFixed(2)}</td>
            </tr>
            ${data.customDeductions?.map((deduction: any) => `
              <tr>
                <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">${deduction.name}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">$${deduction.amount.toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right; font-size: 12px;">-</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div style="text-align: right; font-size: 20px; font-weight: bold; color: #333; border-top: 3px solid #000; padding-top: 15px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>NET PAY:</span>
            <span style="font-size: 24px; color: #2563eb;">$${data.netPay.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 12px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation. Tax Year: ${data.taxYear}
          </p>
        </div>
      </div>
    `;
  };

  const downloadCurrentPaystub = () => {
    if (generatedPaystubs.length === 0) return;
    
    const currentPaystub = generatedPaystubs[currentPreviewIndex];
    const blob = new Blob([currentPaystub.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystub-${formData.employeeName.replace(/\s+/g, '-').toLowerCase()}-${currentPaystub.payDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllPaystubs = () => {
    generatedPaystubs.forEach((paystub, index) => {
      setTimeout(() => {
        const blob = new Blob([paystub.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paystub-${formData.employeeName.replace(/\s+/g, '-').toLowerCase()}-${paystub.payDate}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 500);
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.employeeName && formData.employeeAddress && 
                 formData.employeeCity && formData.employeeState && 
                 formData.employeeZip && formData.employeeSSN);
      case 2:
        return !!(formData.employerName && formData.employerAddress && 
                 formData.employerCity && formData.employerState && 
                 formData.employerZip && formData.employerEIN);
      case 3:
        if (formData.calculationMethod === 'manual') {
          return formData.payRate > 0 && formData.hoursWorked > 0;
        } else {
          return formData.targetSalary > 0;
        }
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generatePaystubs();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }
    } else {
      alert('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleBankStatementUpsell = () => {
    if (onNavigateToBankStatement && generatedPaystubs.length > 0) {
      onNavigateToBankStatement({
        employeeName: formData.employeeName,
        employeeAddress: formData.employeeAddress,
        employeeCity: formData.employeeCity,
        employeeState: formData.employeeState,
        employeeZip: formData.employeeZip,
        paystubs: generatedPaystubs
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Enhanced Paystub Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.avatar}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-900">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Generate Enhanced Paystubs</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Employee Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Employee Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => handleInputChange('employeeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="EMP001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Social Security Number *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeSSN}
                        onChange={(e) => handleInputChange('employeeSSN', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123-45-6789"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeAddress}
                        onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeCity}
                        onChange={(e) => handleInputChange('employeeCity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Chicago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={formData.employeeState}
                        onChange={(e) => handleInputChange('employeeState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="IL">Illinois</option>
                        <option value="NJ">New Jersey</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.employeeZip}
                        onChange={(e) => handleInputChange('employeeZip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="60601"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Employer Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Employer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={formData.employerName}
                        onChange={(e) => handleInputChange('employerName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employer ID Number (EIN) *
                      </label>
                      <input
                        type="text"
                        value={formData.employerEIN}
                        onChange={(e) => handleInputChange('employerEIN', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="12-3456789"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Address *
                      </label>
                      <input
                        type="text"
                        value={formData.employerAddress}
                        onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="456 Business Ave"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.employerCity}
                        onChange={(e) => handleInputChange('employerCity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Chicago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={formData.employerState}
                        onChange={(e) => handleInputChange('employerState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                        <option value="IL">Illinois</option>
                        <option value="NJ">New Jersey</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={formData.employerZip}
                        onChange={(e) => handleInputChange('employerZip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="60601"
                      />
                    </div>
                    
                    {/* Banking Information */}
                    <div className="md:col-span-2 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Banking Information</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check Number
                      </label>
                      <input
                        type="text"
                        value={formData.checkNumber}
                        onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        value={formData.routingNumber}
                        onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pay Information */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Pay Information & Configuration</h2>
                  
                  {/* Multi-Stub Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Paystubs (1-8) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={formData.numberOfStubs}
                        onChange={(e) => handleInputChange('numberOfStubs', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay Frequency *
                      </label>
                      <select
                        value={formData.payFrequency}
                        onChange={(e) => handleInputChange('payFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="semimonthly">Semi-monthly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Year
                      </label>
                      <input
                        type="number"
                        value={formData.taxYear}
                        onChange={(e) => handleInputChange('taxYear', parseInt(e.target.value) || new Date().getFullYear())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Income Calculation Method */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Income Calculation Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          value="manual"
                          checked={formData.calculationMethod === 'manual'}
                          onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Manual Entry</div>
                          <div className="text-sm text-gray-600">Enter hourly rate and hours directly</div>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="calculationMethod"
                          value="target"
                          checked={formData.calculationMethod === 'target'}
                          onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Target Salary</div>
                          <div className="text-sm text-gray-600">Calculate from desired annual/monthly salary</div>
                        </div>
                      </label>
                    </div>

                    {formData.calculationMethod === 'manual' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.payRate}
                            onChange={(e) => handleInputChange('payRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="25.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hours Worked *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={formData.hoursWorked}
                            onChange={(e) => handleInputChange('hoursWorked', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="40"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary Type *
                          </label>
                          <select
                            value={formData.targetSalaryType}
                            onChange={(e) => handleInputChange('targetSalaryType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="annual">Annual Salary</option>
                            <option value="monthly">Monthly Salary</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target {formData.targetSalaryType === 'annual' ? 'Annual' : 'Monthly'} Salary *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.targetSalary}
                            onChange={(e) => handleInputChange('targetSalary', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={formData.targetSalaryType === 'annual' ? '60000' : '5000'}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YTD Configuration */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Year-to-Date Configuration</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial YTD Gross Pay (optional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.initialYTDGrossPay}
                        onChange={(e) => handleInputChange('initialYTDGrossPay', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Leave blank to start YTD calculations from $0.00
                      </p>
                    </div>
                  </div>

                  {/* Custom Earnings */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Custom Earnings</h3>
                      <button
                        type="button"
                        onClick={addCustomEarning}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Earning</span>
                      </button>
                    </div>
                    {formData.customEarnings.map((earning, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <input
                            type="text"
                            placeholder="Earning name"
                            value={earning.name}
                            onChange={(e) => updateCustomEarning(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={earning.amount}
                            onChange={(e) => updateCustomEarning(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={earning.taxable}
                              onChange={(e) => updateCustomEarning(index, 'taxable', e.target.checked)}
                              className="mr-2"
                            />
                            Taxable
                          </label>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => removeCustomEarning(index)}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Deductions */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Custom Deductions</h3>
                      <button
                        type="button"
                        onClick={addCustomDeduction}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Deduction</span>
                      </button>
                    </div>
                    {formData.customDeductions.map((deduction, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                        <div>
                          <input
                            type="text"
                            placeholder="Deduction name"
                            value={deduction.name}
                            onChange={(e) => updateCustomDeduction(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={deduction.amount}
                            onChange={(e) => updateCustomDeduction(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={deduction.pretax}
                              onChange={(e) => updateCustomDeduction(index, 'pretax', e.target.checked)}
                              className="mr-2"
                            />
                            Pre-tax
                          </label>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => removeCustomDeduction(index)}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Preview and Generate */}
              {currentStep === 4 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Generated Paystubs</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={downloadCurrentPaystub}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Current</span>
                      </button>
                      {generatedPaystubs.length > 1 && (
                        <button
                          onClick={downloadAllPaystubs}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {generatedPaystubs.length > 1 && (
                    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                        disabled={currentPreviewIndex === 0}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      
                      <span className="text-sm font-medium text-gray-700">
                        Paystub {currentPreviewIndex + 1} of {generatedPaystubs.length}
                        {generatedPaystubs[currentPreviewIndex] && (
                          <span className="ml-2 text-gray-500">
                            ({new Date(generatedPaystubs[currentPreviewIndex].payDate).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPreviewIndex(Math.min(generatedPaystubs.length - 1, currentPreviewIndex + 1))}
                        disabled={currentPreviewIndex === generatedPaystubs.length - 1}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {generatedPaystubs.length > 0 && (
                    <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: generatedPaystubs[currentPreviewIndex]?.html || '' }} />
                    </div>
                  )}

                  {/* Bank Statement Upsell */}
                  {generatedPaystubs.length > 0 && onNavigateToBankStatement && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">Generate Matching Bank Statement</h3>
                      <p className="text-blue-700 mb-4">
                        Create a professional bank statement that includes deposits from your generated paystubs.
                      </p>
                      <button
                        onClick={handleBankStatementUpsell}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Generate Bank Statement
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                {currentStep < 4 && (
                  <button
                    onClick={nextStep}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{currentStep === 3 ? (isGenerating ? 'Generating...' : 'Generate Paystubs') : 'Next'}</span>
                    {currentStep !== 3 && <ArrowLeft className="h-4 w-4 rotate-180" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Features</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Generate up to 8 paystubs in a single batch</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Automatic date calculation based on pay frequency</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Target salary calculation with automatic rate/hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Comprehensive YTD tracking across all stubs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Custom earnings and deductions support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Banking details integration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Interactive preview with navigation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>High-quality PDF download</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  <strong>Legal Notice:</strong> All generated documents are for novelty and educational purposes only. Not intended for fraudulent use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystubGenerator;
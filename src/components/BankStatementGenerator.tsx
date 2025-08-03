import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, Building2, CreditCard, Calendar, DollarSign, Plus, Minus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface BankStatementGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  prefilledData?: {
    employeeName: string;
    employeeAddress: string;
    employeeCity: string;
    employeeState: string;
    employeeZip: string;
    paystubs: any[];
  };
}

interface BankStatementData {
  // Account Holder Details
  accountHolderName: string;
  accountHolderAddress: string;
  accountHolderCity: string;
  accountHolderState: string;
  accountHolderZip: string;
  
  // Bank Details
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  
  // Statement Period
  statementStartDate: string;
  statementEndDate: string;
  
  // Financials
  openingBalance: number;
  
  // Transaction Options
  includePaystubDeposits: boolean;
  numberOfRandomTransactions: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  balance: number;
  category: string;
}

interface GeneratedStatement {
  id: string;
  html: string;
  transactions: Transaction[];
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

const BANK_LOGOS = {
  'Chase': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DSEFTRTU8L3RleHQ+PC9zdmc+',
  'Wells Fargo': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNEMzI1MjYiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XRUxMUyBGQVJHTzwvdGV4dD48L3N2Zz4=',
  'Bank of America': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFMzEyMzciLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CQU5LIG9mIEFNRVJJQ0E8L3RleHQ+PC9zdmc+',
  'Citi': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDY2Q0MiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5jaXRpPC90ZXh0Pjwvc3ZnPg==',
  'US Bank': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDQ0ODgiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VUyBCQU5LPC90ZXh0Pjwvc3ZnPg==',
  'PNC': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkI2MDAiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9ImJsYWNrIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QTkM8L3RleHQ+PC9zdmc+',
  'Capital One': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDQ0ODgiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DQVBJVEFMIE9ORTwvdGV4dD48L3N2Zz4=',
  'Chime': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMEQ0QUEiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DaGltZTwvdGV4dD48L3N2Zz4=',
  'Green Dot': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiM2NkNDMDAiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HUkVFTiBET1Q8L3RleHQ+PC9zdmc+',
  'PayPal': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDMwODciLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QYXlQYWw8L3RleHQ+PC9zdmc+',
  'Other': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiM2NjY2NjYiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CQU5LPC90ZXh0Pjwvc3ZnPg=='
};

const TRANSACTION_TYPES = [
  { type: 'withdrawal', category: 'Grocery Store', descriptions: ['WHOLE FOODS', 'SAFEWAY', 'KROGER', 'WALMART GROCERY'], amountRange: [25, 150] },
  { type: 'withdrawal', category: 'Restaurant', descriptions: ['STARBUCKS', 'MCDONALDS', 'CHIPOTLE', 'SUBWAY'], amountRange: [8, 45] },
  { type: 'withdrawal', category: 'Gas Station', descriptions: ['SHELL', 'CHEVRON', 'EXXON', 'BP'], amountRange: [30, 80] },
  { type: 'withdrawal', category: 'Online Purchase', descriptions: ['AMAZON.COM', 'PAYPAL', 'APPLE.COM', 'NETFLIX'], amountRange: [15, 200] },
  { type: 'withdrawal', category: 'ATM Withdrawal', descriptions: ['ATM WITHDRAWAL', 'CASH WITHDRAWAL'], amountRange: [20, 300] },
  { type: 'withdrawal', category: 'Utility Bill', descriptions: ['ELECTRIC COMPANY', 'WATER DEPT', 'INTERNET SERVICE'], amountRange: [50, 200] },
  { type: 'deposit', category: 'Transfer', descriptions: ['ONLINE TRANSFER', 'MOBILE DEPOSIT', 'WIRE TRANSFER'], amountRange: [100, 1000] },
  { type: 'deposit', category: 'Interest', descriptions: ['INTEREST PAYMENT', 'SAVINGS INTEREST'], amountRange: [1, 25] },
  { type: 'deposit', category: 'Refund', descriptions: ['REFUND', 'CASHBACK', 'RETURN'], amountRange: [10, 150] }
];

const BankStatementGenerator: React.FC<BankStatementGeneratorProps> = ({ 
  user, 
  onBack, 
  onLogout, 
  prefilledData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BankStatementData>({
    accountHolderName: prefilledData?.employeeName || '',
    accountHolderAddress: prefilledData?.employeeAddress || '',
    accountHolderCity: prefilledData?.employeeCity || '',
    accountHolderState: prefilledData?.employeeState || '',
    accountHolderZip: prefilledData?.employeeZip || '',
    bankName: 'Chase',
    accountNumber: '',
    routingNumber: '',
    statementStartDate: '',
    statementEndDate: '',
    openingBalance: 0,
    includePaystubDeposits: !!prefilledData?.paystubs?.length,
    numberOfRandomTransactions: 10
  });
  
  const [generatedStatement, setGeneratedStatement] = useState<GeneratedStatement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Set default statement period if prefilled data exists
    if (prefilledData?.paystubs?.length) {
      const paystubs = prefilledData.paystubs;
      const earliestDate = new Date(Math.min(...paystubs.map(p => new Date(p.payPeriodStart).getTime())));
      const latestDate = new Date(Math.max(...paystubs.map(p => new Date(p.payDate).getTime())));
      
      // Extend the period by a few days on each side
      earliestDate.setDate(earliestDate.getDate() - 5);
      latestDate.setDate(latestDate.getDate() + 5);
      
      setFormData(prev => ({
        ...prev,
        statementStartDate: earliestDate.toISOString().split('T')[0],
        statementEndDate: latestDate.toISOString().split('T')[0]
      }));
    }
  }, [prefilledData]);

  const handleInputChange = (field: keyof BankStatementData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRandomTransactions = (startDate: Date, endDate: Date, count: number): Transaction[] => {
    const transactions: Transaction[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < count; i++) {
      const randomDays = Math.floor(Math.random() * daysDiff);
      const transactionDate = new Date(startDate);
      transactionDate.setDate(startDate.getDate() + randomDays);
      
      const transactionType = TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)];
      const description = transactionType.descriptions[Math.floor(Math.random() * transactionType.descriptions.length)];
      const amount = Math.random() * (transactionType.amountRange[1] - transactionType.amountRange[0]) + transactionType.amountRange[0];
      
      transactions.push({
        id: `random-${i}`,
        date: transactionDate.toISOString().split('T')[0],
        description,
        amount: parseFloat(amount.toFixed(2)),
        type: transactionType.type as 'deposit' | 'withdrawal',
        balance: 0, // Will be calculated later
        category: transactionType.category
      });
    }
    
    return transactions;
  };

  const generatePaystubTransactions = (): Transaction[] => {
    if (!formData.includePaystubDeposits || !prefilledData?.paystubs) return [];
    
    const startDate = new Date(formData.statementStartDate);
    const endDate = new Date(formData.statementEndDate);
    
    return prefilledData.paystubs
      .filter(paystub => {
        const payDate = new Date(paystub.payDate);
        return payDate >= startDate && payDate <= endDate;
      })
      .map((paystub, index) => ({
        id: `paystub-${index}`,
        date: paystub.payDate,
        description: `Payroll Deposit from ${formData.accountHolderName.split(' ')[0]} Employer`,
        amount: paystub.netPay,
        type: 'deposit' as const,
        balance: 0, // Will be calculated later
        category: 'Payroll'
      }));
  };

  const calculateBalances = (transactions: Transaction[], openingBalance: number): Transaction[] => {
    let runningBalance = openingBalance;
    
    return transactions.map(transaction => {
      if (transaction.type === 'deposit') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      return {
        ...transaction,
        balance: parseFloat(runningBalance.toFixed(2))
      };
    });
  };

  const generateStatement = async () => {
    setIsGenerating(true);
    
    try {
      const startDate = new Date(formData.statementStartDate);
      const endDate = new Date(formData.statementEndDate);
      
      // Generate transactions
      const paystubTransactions = generatePaystubTransactions();
      const randomTransactions = generateRandomTransactions(startDate, endDate, formData.numberOfRandomTransactions);
      
      // Combine and sort transactions by date
      const allTransactions = [...paystubTransactions, ...randomTransactions]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate running balances
      const transactionsWithBalances = calculateBalances(allTransactions, formData.openingBalance);
      
      // Calculate totals
      const totalDeposits = transactionsWithBalances
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = transactionsWithBalances
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const closingBalance = transactionsWithBalances.length > 0 
        ? transactionsWithBalances[transactionsWithBalances.length - 1].balance
        : formData.openingBalance;
      
      // Generate HTML
      const html = generateStatementHTML({
        ...formData,
        transactions: transactionsWithBalances,
        openingBalance: formData.openingBalance,
        closingBalance,
        totalDeposits,
        totalWithdrawals,
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString()
      });
      
      const statement: GeneratedStatement = {
        id: `statement-${Date.now()}`,
        html,
        transactions: transactionsWithBalances,
        openingBalance: formData.openingBalance,
        closingBalance,
        totalDeposits,
        totalWithdrawals
      };
      
      setGeneratedStatement(statement);
      
      // Save to localStorage for dashboard
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      documents.unshift({
        id: statement.id,
        type: 'bankStatement',
        name: `Bank Statement - ${formData.accountHolderName} (${formData.bankName})`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        data: statement
      });
      
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating bank statement:', error);
      alert('An error occurred while generating the bank statement. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStatementHTML = (data: any) => {
    const bankLogo = BANK_LOGOS[data.bankName as keyof typeof BANK_LOGOS] || BANK_LOGOS.Other;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white; border: 1px solid #ddd;">
        <!-- Bank Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 3px solid #003366; padding-bottom: 20px; background: linear-gradient(to right, #f8f9fa, #ffffff);">
          <img src="${bankLogo}" alt="${data.bankName}" style="height: 40px;" />
          <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 28px; color: #003366; font-weight: bold;">Account Statement</h1>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Statement Period: ${data.startDate} - ${data.endDate}</p>
          </div>
        </div>
        
        <!-- Account Information Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
          <div style="flex: 1;">
            <h3 style="color: #003366; margin-bottom: 15px; border-bottom: 2px solid #003366; padding-bottom: 8px; font-size: 16px; font-weight: bold; text-transform: uppercase;">Account Holder</h3>
            <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${data.accountHolderName}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #555;">${data.accountHolderAddress}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #555;">${data.accountHolderCity}, ${data.accountHolderState} ${data.accountHolderZip}</p>
          </div>
          <div style="flex: 1; margin-left: 20px;">
            <h3 style="color: #003366; margin-bottom: 15px; border-bottom: 2px solid #003366; padding-bottom: 8px; font-size: 16px; font-weight: bold; text-transform: uppercase;">Account Information</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Account Number:</strong> ****${data.accountNumber.slice(-4)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Routing Number:</strong> ${data.routingNumber}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Account Type:</strong> Checking Account</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Statement Date:</strong> ${data.endDate}</p>
          </div>
        </div>
        
        <!-- Account Summary -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background: linear-gradient(135deg, #e3f2fd, #f8f9fa); padding: 25px; border-radius: 10px; border: 2px solid #2196f3; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Opening Balance</div>
            <div style="font-size: 20px; font-weight: bold; color: #1976d2;">$${data.openingBalance.toFixed(2)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Total Deposits</div>
            <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">+$${data.totalDeposits.toFixed(2)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Total Withdrawals</div>
            <div style="font-size: 20px; font-weight: bold; color: #d32f2f;">-$${data.totalWithdrawals.toFixed(2)}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">Closing Balance</div>
            <div style="font-size: 22px; font-weight: bold; color: #1565c0;">$${data.closingBalance.toFixed(2)}</div>
          </div>
        </div>
        
        <!-- Transaction History -->
        <h3 style="color: #003366; margin-bottom: 20px; border-bottom: 3px solid #003366; padding-bottom: 10px; font-size: 18px; font-weight: bold; text-transform: uppercase;">Transaction History</h3>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 2px solid #003366; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #003366, #004080);">
              <th style="border: 1px solid #003366; padding: 15px; text-align: left; font-size: 13px; font-weight: bold; color: white; text-transform: uppercase;">Date</th>
              <th style="border: 1px solid #003366; padding: 15px; text-align: left; font-size: 13px; font-weight: bold; color: white; text-transform: uppercase;">Description</th>
              <th style="border: 1px solid #003366; padding: 15px; text-align: right; font-size: 13px; font-weight: bold; color: white; text-transform: uppercase;">Amount</th>
              <th style="border: 1px solid #003366; padding: 15px; text-align: right; font-size: 13px; font-weight: bold; color: white; text-transform: uppercase;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${data.transactions.map((transaction: Transaction) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px; font-weight: 500;">${new Date(transaction.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${transaction.description}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 12px; font-weight: bold; color: ${transaction.type === 'deposit' ? '#2e7d32' : '#d32f2f'};">
                  ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 12px; font-weight: bold; color: #1565c0;">$${transaction.balance.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Bank Footer -->
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-top: 2px solid #003366; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <p style="margin: 2px 0; font-size: 11px; color: #666;"><strong>${data.bankName}</strong> • Member FDIC</p>
              <p style="margin: 2px 0; font-size: 11px; color: #666;">Customer Service: 1-800-BANKING</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 2px 0; font-size: 11px; color: #666;">Online Banking: www.${data.bankName.toLowerCase().replace(/\s+/g, '')}.com</p>
              <p style="margin: 2px 0; font-size: 11px; color: #666;">Equal Housing Lender</p>
            </div>
          </div>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 20px; padding: 20px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 8px;">
          <p style="margin: 0; font-size: 12px; color: #856404; text-align: center;">
            <strong>IMPORTANT NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation. Generated on ${new Date().toLocaleDateString()}.
          </p>
        </div>
        
        <!-- Statement Footer -->
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #ddd; padding-top: 15px;">
          <p>This statement covers the period from ${data.startDate} to ${data.endDate}</p>
          <p>Please review your account statement carefully and report any discrepancies immediately</p>
        </div>
      </div>
    `;
  };

  const downloadStatement = () => {
    if (!generatedStatement) return;
    
    const blob = new Blob([generatedStatement.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-statement-${formData.accountHolderName.replace(/\s+/g, '-').toLowerCase()}-${formData.bankName.toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.accountHolderName && formData.accountHolderAddress && 
                 formData.accountHolderCity && formData.accountHolderState && 
                 formData.accountHolderZip);
      case 2:
        return !!(formData.bankName && formData.accountNumber && formData.routingNumber);
      case 3:
        return !!(formData.statementStartDate && formData.statementEndDate && 
                 new Date(formData.statementStartDate) < new Date(formData.statementEndDate));
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        generateStatement();
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
                <Building2 className="h-6 w-6 text-green-600" />
                <span className="text-lg font-semibold text-gray-900">Bank Statement Generator</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Generate Bank Statement</h1>
            <div className="text-sm text-gray-600">Step {currentStep} of 4</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Account Holder Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Holder Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderAddress}
                        onChange={(e) => handleInputChange('accountHolderAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderCity}
                        onChange={(e) => handleInputChange('accountHolderCity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Chicago"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={formData.accountHolderState}
                        onChange={(e) => handleInputChange('accountHolderState', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        value={formData.accountHolderZip}
                        onChange={(e) => handleInputChange('accountHolderZip', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="60601"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Bank Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Bank Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name *
                      </label>
                      <select
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="Chase">Chase</option>
                        <option value="Wells Fargo">Wells Fargo</option>
                        <option value="Bank of America">Bank of America</option>
                        <option value="Citi">Citi</option>
                        <option value="US Bank">US Bank</option>
                        <option value="PNC">PNC</option>
                        <option value="Capital One">Capital One</option>
                        <option value="Chime">Chime</option>
                        <option value="Green Dot">Green Dot</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number *
                      </label>
                      <input
                        type="text"
                        value={formData.routingNumber}
                        onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Statement Configuration */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Statement Configuration</h2>
                  
                  {/* Statement Period */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statement Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.statementStartDate}
                        onChange={(e) => handleInputChange('statementStartDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statement End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.statementEndDate}
                        onChange={(e) => handleInputChange('statementEndDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opening Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.openingBalance}
                        onChange={(e) => handleInputChange('openingBalance', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="1000.00"
                      />
                    </div>
                  </div>

                  {/* Transaction Options */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Options</h3>
                    
                    {/* Paystub Deposits Option */}
                    <div className="mb-6">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.includePaystubDeposits}
                          onChange={(e) => handleInputChange('includePaystubDeposits', e.target.checked)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">Include Deposits from My Paystubs</div>
                          <div className="text-sm text-gray-600">
                            {prefilledData?.paystubs?.length 
                              ? `Automatically include ${prefilledData.paystubs.length} paystub deposit(s) in the statement period`
                              : 'No paystubs available from recent generations'
                            }
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Random Transactions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Random Transactions
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.numberOfRandomTransactions}
                        onChange={(e) => handleInputChange('numberOfRandomTransactions', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Generate realistic transactions like grocery purchases, ATM withdrawals, etc.
                      </p>
                    </div>
                  </div>

                  {/* Preview Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Statement Preview</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Bank:</strong> {formData.bankName}</p>
                      <p><strong>Account Holder:</strong> {formData.accountHolderName}</p>
                      <p><strong>Period:</strong> {formData.statementStartDate} to {formData.statementEndDate}</p>
                      <p><strong>Opening Balance:</strong> ${formData.openingBalance.toFixed(2)}</p>
                      <p><strong>Paystub Deposits:</strong> {formData.includePaystubDeposits ? (prefilledData?.paystubs?.length || 0) : 0}</p>
                      <p><strong>Random Transactions:</strong> {formData.numberOfRandomTransactions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preview and Generate */}
              {currentStep === 4 && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Generated Bank Statement</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={downloadStatement}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Statement</span>
                      </button>
                    </div>
                  </div>

                  {generatedStatement && (
                    <div>
                      {/* Statement Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-blue-600 mb-1">Opening Balance</div>
                          <div className="text-lg font-bold text-blue-900">${generatedStatement.openingBalance.toFixed(2)}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-green-600 mb-1">Total Deposits</div>
                          <div className="text-lg font-bold text-green-900">+${generatedStatement.totalDeposits.toFixed(2)}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-red-600 mb-1">Total Withdrawals</div>
                          <div className="text-lg font-bold text-red-900">-${generatedStatement.totalWithdrawals.toFixed(2)}</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-sm text-purple-600 mb-1">Closing Balance</div>
                          <div className="text-lg font-bold text-purple-900">${generatedStatement.closingBalance.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Statement Preview */}
                      <div className="border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: generatedStatement.html }} />
                      </div>
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
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{currentStep === 3 ? (isGenerating ? 'Generating...' : 'Generate Statement') : 'Next'}</span>
                    {currentStep !== 3 && <ArrowLeft className="h-4 w-4 rotate-180" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Statement Features</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Professional bank-specific templates and logos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Automatic integration with generated paystubs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Realistic random transaction generation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Accurate balance calculations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Customizable statement periods</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>High-quality PDF download</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Multiple major bank templates</span>
                </li>
              </ul>

              {prefilledData?.paystubs?.length && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Linked Paystubs</h4>
                  <p className="text-sm text-blue-700">
                    {prefilledData.paystubs.length} paystub(s) available for automatic deposit integration.
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700">
                  <strong>Legal Notice:</strong> All generated statements are for novelty and educational purposes only. Not intended for fraudulent use.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatementGenerator;
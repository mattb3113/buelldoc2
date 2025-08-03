import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, LogOut, Award, GraduationCap, Truck, Heart, Utensils, Wine } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface CertificatesGeneratorProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

interface CertificateType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const certificateTypes: CertificateType[] = [
  {
    id: 'high-school-diploma',
    name: 'High School Diploma',
    description: 'Standard high school graduation diploma',
    icon: <GraduationCap className="h-8 w-8" />,
    category: 'Education'
  },
  {
    id: 'college-degree',
    name: 'College Degree',
    description: 'University bachelor\'s or master\'s degree',
    icon: <GraduationCap className="h-8 w-8" />,
    category: 'Education'
  },
  {
    id: 'forklift-certification',
    name: 'Forklift Training Certificate',
    description: 'OSHA-compliant forklift operator certification',
    icon: <Truck className="h-8 w-8" />,
    category: 'Professional'
  },
  {
    id: 'esa-certificate',
    name: 'Emotional Support Animal Certificate',
    description: 'ESA registration certificate for dogs and cats',
    icon: <Heart className="h-8 w-8" />,
    category: 'Medical'
  },
  {
    id: 'food-handler-certificate',
    name: 'Food Handler Certificate',
    description: 'Food safety and handling certification',
    icon: <Utensils className="h-8 w-8" />,
    category: 'Professional'
  },
  {
    id: 'bartender-certificate',
    name: 'Bartender Training Certificate',
    description: 'Responsible alcohol service certification',
    icon: <Wine className="h-8 w-8" />,
    category: 'Professional'
  }
];

const universities = [
  { name: 'Harvard University', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM4QzE1MTUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IQVJWQVJEPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Stanford University', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM4QzE5MTkiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TVEFOUE9SRDwvdGV4dD48L3N2Zz4=' },
  { name: 'MIT', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM4QjAwMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NSVQ8L3RleHQ+PC9zdmc+' },
  { name: 'New York University', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM1NzAwOEIiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OWVU8L3RleHQ+PC9zdmc+' },
  { name: 'UCLA', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiMyRDc0RkYiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VQ0xBPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'University of Texas', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiNCRjUwMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5VVCBBVVNUSU48L3RleHQ+PC9zdmc+' },
  { name: 'University of Michigan', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiMwMDI3NEMiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IiNGRkNGMDAiIGZvbnQtZmFtaWx5PSJUaW1lcyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlVOSVYgTUlDSElHQU48L3RleHQ+PC9zdmc+' },
  { name: 'Ohio State University', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiNCQjAwMDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iVGltZXMiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5PSElPIFNUQVRFPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Florida State University', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM3ODJGNDAiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IiNDRkI1M0IiIGZvbnQtZmFtaWx5PSJUaW1lcyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZMT1JJREEgU1Q8L3RleHQ+PC9zdmc+' },
  { name: 'University of Washington', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9IiM0QjJFODMiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IiNGRkNGMDAiIGZvbnQtZmFtaWx5PSJUaW1lcyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlVOSVYgV0FTSC48L3RleHQ+PC9zdmc+' }
];

const CertificatesGenerator: React.FC<CertificatesGeneratorProps> = ({ user, onBack, onLogout }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTypeSelection = (typeId: string) => {
    setSelectedType(typeId);
    setCurrentStep(1);
    setFormData({});
    setGeneratedDocument(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const generateCertificateId = () => {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    
    try {
      let html = '';
      
      switch (selectedType) {
        case 'high-school-diploma':
          html = generateHighSchoolDiploma();
          break;
        case 'college-degree':
          html = generateCollegeDegree();
          break;
        case 'forklift-certification':
          html = generateForkliftCertification();
          break;
        case 'esa-certificate':
          html = generateESACertificate();
          break;
        case 'food-handler-certificate':
          html = generateFoodHandlerCertificate();
          break;
        case 'bartender-certificate':
          html = generateBartenderCertificate();
          break;
        default:
          html = '<p>Certificate type not found</p>';
      }
      
      setGeneratedDocument(html);
      
      // Save to document history
      const savedDocuments = localStorage.getItem('buelldocs_documents');
      const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
      
      const certificateType = certificateTypes.find(type => type.id === selectedType);
      const newDocument = {
        id: Date.now().toString(),
        type: 'certificate',
        name: `${certificateType?.name} - ${formData.studentName || formData.operatorName || formData.ownerName || formData.employeeName || formData.bartenderName}`,
        createdAt: new Date().toISOString(),
        status: 'completed'
      };
      
      documents.unshift(newDocument);
      localStorage.setItem('buelldocs_documents', JSON.stringify(documents));
      
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('An error occurred while generating the certificate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHighSchoolDiploma = () => {
    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #f8f9fa, #ffffff); border: 8px solid #8B4513; position: relative;">
        <!-- Decorative Border -->
        <div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; border: 2px solid #DAA520; border-radius: 10px;"></div>
        
        <!-- School Seal -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; margin: 0 auto; background: #8B4513; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #DAA520;">
            <div style="color: white; font-size: 24px; font-weight: bold;">🎓</div>
          </div>
        </div>
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 36px; color: #8B4513; margin: 0; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${formData.schoolName}</h1>
          <p style="font-size: 18px; color: #666; margin: 10px 0; font-style: italic;">High School</p>
          <div style="width: 200px; height: 2px; background: #DAA520; margin: 20px auto;"></div>
        </div>
        
        <!-- Diploma Text -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-size: 28px; color: #8B4513; margin-bottom: 30px; font-weight: normal;">Diploma</h2>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6;">This certifies that</p>
          <h3 style="font-size: 32px; color: #8B4513; margin: 20px 0; font-weight: bold; text-decoration: underline; text-decoration-color: #DAA520;">${formData.studentName}</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6;">has successfully completed the prescribed course of study and satisfied all requirements for graduation from this institution and is therefore awarded this</p>
          <h4 style="font-size: 24px; color: #8B4513; margin: 20px 0; font-weight: bold;">High School Diploma</h4>
          <p style="font-size: 16px; color: #333; margin-bottom: 30px; line-height: 1.6;">with all the rights, privileges, and responsibilities thereunto appertaining.</p>
        </div>
        
        <!-- Date and Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="text-align: center; flex: 1;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; color: #666;">Date of Graduation</p>
            <p style="font-size: 16px; color: #333; font-weight: bold;">${formData.graduationDate}</p>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; color: #666;">Principal</p>
          </div>
        </div>
        
        <!-- School Seal Footer -->
        <div style="text-align: center; margin-top: 40px;">
          <div style="width: 60px; height: 60px; margin: 0 auto; background: #8B4513; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #DAA520;">
            <div style="color: white; font-size: 12px; font-weight: bold;">SEAL</div>
          </div>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 40px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const generateCollegeDegree = () => {
    const selectedUniversity = universities.find(uni => uni.name === formData.universityName);
    
    return `
      <div style="font-family: 'Times New Roman', serif; max-width: 900px; margin: 0 auto; padding: 50px; background: linear-gradient(135deg, #f8f9fa, #ffffff); border: 10px solid #003366; position: relative;">
        <!-- Decorative Border -->
        <div style="position: absolute; top: 25px; left: 25px; right: 25px; bottom: 25px; border: 3px solid #DAA520; border-radius: 15px;"></div>
        
        <!-- University Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          ${selectedUniversity ? `<img src="${selectedUniversity.logo}" alt="${formData.universityName}" style="width: 100px; height: 100px; margin-bottom: 20px;" />` : ''}
          <h1 style="font-size: 42px; color: #003366; margin: 0; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${formData.universityName}</h1>
          <div style="width: 300px; height: 3px; background: #DAA520; margin: 20px auto;"></div>
        </div>
        
        <!-- Degree Text -->
        <div style="text-align: center; margin-bottom: 50px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 30px; font-style: italic;">The Trustees of the University, upon recommendation of the Faculty, have conferred upon</p>
          <h2 style="font-size: 36px; color: #003366; margin: 30px 0; font-weight: bold; text-decoration: underline; text-decoration-color: #DAA520;">${formData.studentName}</h2>
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">the degree of</p>
          <h3 style="font-size: 32px; color: #003366; margin: 30px 0; font-weight: bold;">${formData.degreeType}</h3>
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">in</p>
          <h4 style="font-size: 28px; color: #003366; margin: 20px 0; font-weight: bold; font-style: italic;">${formData.major}</h4>
          <p style="font-size: 16px; color: #333; margin-top: 30px; font-style: italic;">with all the rights, privileges, and honors thereunto appertaining</p>
        </div>
        
        <!-- Latin Phrase -->
        <div style="text-align: center; margin: 40px 0;">
          <p style="font-size: 16px; color: #666; font-style: italic;">"Veritas et Utilitas"</p>
          <p style="font-size: 14px; color: #888;">(Truth and Service)</p>
        </div>
        
        <!-- Date and Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div style="text-align: center; flex: 1;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; color: #666;">Date</p>
            <p style="font-size: 16px; color: #333; font-weight: bold;">${formData.graduationDate}</p>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; color: #666;">President of the University</p>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
            <p style="font-size: 14px; color: #666;">Dean of the Faculty</p>
          </div>
        </div>
        
        <!-- University Seal -->
        <div style="text-align: center; margin-top: 50px;">
          <div style="width: 80px; height: 80px; margin: 0 auto; background: #003366; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #DAA520;">
            <div style="color: white; font-size: 14px; font-weight: bold;">SEAL</div>
          </div>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 40px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const generateForkliftCertification = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: white; border: 3px solid #FF6B00; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: #FF6B00; color: white; padding: 20px; border-radius: 5px;">
          <h1 style="font-size: 28px; margin: 0; font-weight: bold;">FORKLIFT OPERATOR</h1>
          <h2 style="font-size: 24px; margin: 5px 0 0 0; font-weight: bold;">TRAINING CERTIFICATE</h2>
        </div>
        
        <!-- Certificate Body -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 60px; margin: 20px 0;">🚛</div>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">This certifies that</p>
          <h3 style="font-size: 24px; color: #FF6B00; margin: 20px 0; font-weight: bold; text-decoration: underline;">${formData.operatorName}</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">has successfully completed forklift operator training in accordance with OSHA standards 29 CFR 1910.178 and is authorized to operate powered industrial trucks.</p>
        </div>
        
        <!-- Training Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Training Company:</strong> ${formData.trainingCompany}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Certificate ID:</strong> ${formData.certificateId || generateCertificateId()}</p>
            </div>
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Issue Date:</strong> ${formData.certificationDate}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Expiration Date:</strong> ${formData.expirationDate}</p>
            </div>
          </div>
        </div>
        
        <!-- Safety Warning -->
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #856404; text-align: center; font-weight: bold;">
            ⚠️ SAFETY FIRST: Operator must follow all safety protocols and company-specific training requirements
          </p>
        </div>
        
        <!-- Signature Line -->
        <div style="text-align: center; margin-top: 30px;">
          <div style="border-bottom: 2px solid #333; width: 250px; margin: 0 auto 10px;"></div>
          <p style="font-size: 14px; color: #666;">Authorized Instructor Signature</p>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const generateESACertificate = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: white; border: 3px solid #4CAF50; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: #4CAF50; color: white; padding: 20px; border-radius: 5px;">
          <h1 style="font-size: 24px; margin: 0; font-weight: bold;">EMOTIONAL SUPPORT ANIMAL</h1>
          <h2 style="font-size: 20px; margin: 5px 0 0 0; font-weight: bold;">REGISTRATION CERTIFICATE</h2>
        </div>
        
        <!-- Certificate Body -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 60px; margin: 20px 0;">${formData.animalType === 'Dog' ? '🐕' : '🐱'}</div>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">This certifies that</p>
          <h3 style="font-size: 24px; color: #4CAF50; margin: 20px 0; font-weight: bold; text-decoration: underline;">${formData.animalName}</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 10px;">is an Emotional Support Animal for</p>
          <h4 style="font-size: 20px; color: #4CAF50; margin: 15px 0; font-weight: bold;">${formData.ownerName}</h4>
          <p style="font-size: 14px; color: #666; margin-top: 20px; font-style: italic;">This animal provides emotional support that alleviates one or more identified symptoms or effects of a person's disability.</p>
        </div>
        
        <!-- Animal Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Animal Type:</strong> ${formData.animalType}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Breed:</strong> ${formData.breed}</p>
            </div>
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Issue Date:</strong> ${formData.issueDate}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Certificate ID:</strong> ${formData.certificateId || generateCertificateId()}</p>
            </div>
          </div>
        </div>
        
        <!-- Official Seal -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="width: 80px; height: 80px; margin: 0 auto; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #2E7D32;">
            <div style="color: white; font-size: 12px; font-weight: bold; text-align: center;">OFFICIAL<br/>SEAL</div>
          </div>
        </div>
        
        <!-- Important Notice -->
        <div style="background: #e3f2fd; border: 2px solid #2196f3; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #1976d2; text-align: center;">
            <strong>IMPORTANT:</strong> This certificate does not grant public access rights. ESAs are not service animals under the ADA.
          </p>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const generateFoodHandlerCertificate = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: white; border: 3px solid #2196F3; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: #2196F3; color: white; padding: 20px; border-radius: 5px;">
          <h1 style="font-size: 24px; margin: 0; font-weight: bold;">FOOD HANDLER</h1>
          <h2 style="font-size: 20px; margin: 5px 0 0 0; font-weight: bold;">SAFETY CERTIFICATE</h2>
        </div>
        
        <!-- Certificate Body -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 60px; margin: 20px 0;">🍽️</div>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">This certifies that</p>
          <h3 style="font-size: 24px; color: #2196F3; margin: 20px 0; font-weight: bold; text-decoration: underline;">${formData.employeeName}</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">has successfully completed food safety training and demonstrated knowledge of safe food handling practices in accordance with local health department regulations.</p>
        </div>
        
        <!-- Training Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Issuing Authority:</strong> ${formData.issuingAuthority}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Certificate ID:</strong> ${formData.certificateId || generateCertificateId()}</p>
            </div>
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Issue Date:</strong> ${formData.issueDate}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Expiration Date:</strong> ${formData.expirationDate}</p>
            </div>
          </div>
        </div>
        
        <!-- Training Topics -->
        <div style="background: #e8f5e8; border: 2px solid #4CAF50; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #2E7D32; font-size: 14px; font-weight: bold;">Training Topics Covered:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #333;">
            <li>Personal Hygiene and Health</li>
            <li>Cross-Contamination Prevention</li>
            <li>Time and Temperature Control</li>
            <li>Cleaning and Sanitizing</li>
            <li>Allergen Awareness</li>
          </ul>
        </div>
        
        <!-- Health Department Seal -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
          <p style="font-size: 14px; color: #666;">Health Department Official</p>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const generateBartenderCertificate = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: white; border: 3px solid #9C27B0; border-radius: 10px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; background: #9C27B0; color: white; padding: 20px; border-radius: 5px;">
          <h1 style="font-size: 24px; margin: 0; font-weight: bold;">BARTENDER TRAINING</h1>
          <h2 style="font-size: 20px; margin: 5px 0 0 0; font-weight: bold;">CERTIFICATE</h2>
        </div>
        
        <!-- Certificate Body -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 60px; margin: 20px 0;">🍸</div>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">This certifies that</p>
          <h3 style="font-size: 24px; color: #9C27B0; margin: 20px 0; font-weight: bold; text-decoration: underline;">${formData.bartenderName}</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">has successfully completed comprehensive bartender training and is certified in responsible alcohol service.</p>
        </div>
        
        <!-- Training Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Training Program:</strong> ${formData.trainingProgram}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Certificate ID:</strong> ${formData.certificateId || generateCertificateId()}</p>
            </div>
            <div>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Completion Date:</strong> ${formData.completionDate}</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Valid Until:</strong> ${new Date(new Date(formData.completionDate).getTime() + 2*365*24*60*60*1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <!-- Skills Covered -->
        <div style="background: #f3e5f5; border: 2px solid #9C27B0; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #7B1FA2; font-size: 14px; font-weight: bold;">Certified Skills:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #333;">
            <li>Responsible Alcohol Service</li>
            <li>Mixology and Cocktail Preparation</li>
            <li>Customer Service Excellence</li>
            <li>Legal Compliance and ID Verification</li>
            <li>Bar Management and Inventory</li>
          </ul>
        </div>
        
        <!-- Training Academy Logo -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="width: 80px; height: 80px; margin: 0 auto; background: #9C27B0; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #7B1FA2;">
            <div style="color: white; font-size: 10px; font-weight: bold; text-align: center;">TRAINING<br/>ACADEMY</div>
          </div>
        </div>
        
        <!-- Signature Line -->
        <div style="text-align: center; margin-top: 30px;">
          <div style="border-bottom: 2px solid #333; width: 200px; margin: 0 auto 10px;"></div>
          <p style="font-size: 14px; color: #666;">Certified Instructor</p>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 2px solid #ffeaa7; border-radius: 5px;">
          <p style="margin: 0; font-size: 10px; color: #856404; text-align: center;">
            <strong>NOTICE:</strong> This document is for novelty and educational purposes only. 
            Not intended for fraudulent use or misrepresentation.
          </p>
        </div>
      </div>
    `;
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;
    
    const certificateType = certificateTypes.find(type => type.id === selectedType);
    const blob = new Blob([generatedDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificateType?.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderForm = () => {
    if (!selectedType) return null;

    const certificateType = certificateTypes.find(type => type.id === selectedType);

    switch (selectedType) {
      case 'high-school-diploma':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Full Name *
              </label>
              <input
                type="text"
                value={formData.studentName || ''}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                High School Name *
              </label>
              <input
                type="text"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lincoln High School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Graduation *
              </label>
              <input
                type="date"
                value={formData.graduationDate || ''}
                onChange={(e) => handleInputChange('graduationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'college-degree':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Full Name *
              </label>
              <input
                type="text"
                value={formData.studentName || ''}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Name *
              </label>
              <select
                value={formData.universityName || ''}
                onChange={(e) => handleInputChange('universityName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select University</option>
                {universities.map((uni) => (
                  <option key={uni.name} value={uni.name}>{uni.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Major *
              </label>
              <input
                type="text"
                value={formData.major || ''}
                onChange={(e) => handleInputChange('major', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Type *
              </label>
              <select
                value={formData.degreeType || ''}
                onChange={(e) => handleInputChange('degreeType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Degree Type</option>
                <option value="Bachelor of Arts">Bachelor of Arts</option>
                <option value="Bachelor of Science">Bachelor of Science</option>
                <option value="Master of Arts">Master of Arts</option>
                <option value="Master of Science">Master of Science</option>
                <option value="Master of Business Administration">Master of Business Administration</option>
                <option value="Doctor of Philosophy">Doctor of Philosophy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Graduation *
              </label>
              <input
                type="date"
                value={formData.graduationDate || ''}
                onChange={(e) => handleInputChange('graduationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'forklift-certification':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operator Name *
              </label>
              <input
                type="text"
                value={formData.operatorName || ''}
                onChange={(e) => handleInputChange('operatorName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Company Name *
              </label>
              <input
                type="text"
                value={formData.trainingCompany || ''}
                onChange={(e) => handleInputChange('trainingCompany', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Safety Training Solutions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Certification *
              </label>
              <input
                type="date"
                value={formData.certificationDate || ''}
                onChange={(e) => handleInputChange('certificationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date *
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'esa-certificate':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name *
              </label>
              <input
                type="text"
                value={formData.ownerName || ''}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Name *
              </label>
              <input
                type="text"
                value={formData.animalName || ''}
                onChange={(e) => handleInputChange('animalName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buddy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Type *
              </label>
              <select
                value={formData.animalType || ''}
                onChange={(e) => handleInputChange('animalType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Animal Type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed *
              </label>
              <input
                type="text"
                value={formData.breed || ''}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Golden Retriever"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Issue *
              </label>
              <input
                type="date"
                value={formData.issueDate || ''}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'food-handler-certificate':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee Name *
              </label>
              <input
                type="text"
                value={formData.employeeName || ''}
                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuing Authority *
              </label>
              <input
                type="text"
                value={formData.issuingAuthority || ''}
                onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="County Health Department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Issue *
              </label>
              <input
                type="date"
                value={formData.issueDate || ''}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date *
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'bartender-certificate':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bartender Name *
              </label>
              <input
                type="text"
                value={formData.bartenderName || ''}
                onChange={(e) => handleInputChange('bartenderName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Program Name *
              </label>
              <input
                type="text"
                value={formData.trainingProgram || ''}
                onChange={(e) => handleInputChange('trainingProgram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Professional Bartender Academy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Completion *
              </label>
              <input
                type="date"
                value={formData.completionDate || ''}
                onChange={(e) => handleInputChange('completionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!selectedType) {
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
                  <Award className="h-6 w-6 text-purple-600" />
                  <span className="text-lg font-semibold text-gray-900">Certificates & Diplomas</span>
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
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Certificates & Diplomas Generator</h1>
            <p className="text-xl text-gray-600">Create professional certificates and diplomas for novelty and educational purposes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificateTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleTypeSelection(type.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
                  {type.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{type.category}</span>
                  <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {/* Legal Notice */}
          <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">!</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Legal Notice</h3>
                <p className="text-yellow-700">
                  All certificates and diplomas generated by this service are intended for <strong>novelty and educational purposes only</strong>. 
                  These documents should not be used for any fraudulent activities, misrepresentation, or illegal purposes. 
                  Users are solely responsible for ensuring their use complies with all applicable laws and regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const certificateType = certificateTypes.find(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedType(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Certificates</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                {certificateType?.icon}
                <span className="text-lg font-semibold text-gray-900">{certificateType?.name}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificate Information</h2>
            
            {renderForm()}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={generateDocument}
                disabled={isGenerating}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>{isGenerating ? 'Generating...' : 'Generate Certificate'}</span>
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
              {generatedDocument && (
                <button
                  onClick={downloadDocument}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
            
            <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-96">
              {generatedDocument ? (
                <div dangerouslySetInnerHTML={{ __html: generatedDocument }} />
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Fill out the form to generate your certificate preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesGenerator;
import React, { useState, useEffect } from 'react';
import { KidReferral } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Users, Camera, Star, CheckCircle, Upload, AlertTriangle, Info, Shield } from 'lucide-react';
import { UploadFile } from '@/api/integrations';

export default function ReferKid() {
  const [formData, setFormData] = useState({
    child_name: '',
    child_age: '',
    guardian_name: '',
    guardian_email: '',
    guardian_phone: '',
    wish_description: '',
    referral_source: '',
    urgency_level: 'medium'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasConsented, setHasConsented] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Form persistence - save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('kidReferralForm');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Auto-save form data
  useEffect(() => {
    if (formData.child_name || formData.guardian_name || formData.wish_description) {
      localStorage.setItem('kidReferralForm', JSON.stringify(formData));
    }
  }, [formData]);

  const validateForm = () => {
    const errors = {};
    
    // Required field validation
    if (!formData.child_name.trim()) errors.child_name = 'Child\'s name is required';
    if (!formData.child_age) errors.child_age = 'Child\'s age is required';
    else if (parseInt(formData.child_age) < 3 || parseInt(formData.child_age) > 18) {
      errors.child_age = 'Child must be between 3 and 18 years old';
    }
    
    if (!formData.guardian_name.trim()) errors.guardian_name = 'Guardian\'s name is required';
    if (!formData.guardian_email.trim()) errors.guardian_email = 'Guardian\'s email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardian_email)) {
      errors.guardian_email = 'Please enter a valid email address';
    }
    
    if (!formData.wish_description.trim()) {
      errors.wish_description = 'Please describe the child\'s creative wish';
    } else if (formData.wish_description.trim().length < 20) {
      errors.wish_description = 'Please provide more detail about the child\'s wish (at least 20 characters)';
    }
    
    // Phone validation (optional but if provided, must be valid)
    if (formData.guardian_phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.guardian_phone)) {
      errors.guardian_phone = 'Please enter a valid phone number';
    }
    
    // Consent validation
    if (!hasConsented) {
      errors.consent = 'Please confirm you have permission to share this information';
    }
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange('guardian_phone', formatted);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // File size validation (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        const { file_url } = await UploadFile({ file });
        setUploadedFiles((prev) => [...prev, {
          name: file.name,
          url: file_url,
          size: file.size
        }]);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        alert(`Error uploading ${file.name}. Please try again.`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowValidation(true);
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                    document.querySelector(`#${firstErrorField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await KidReferral.create({
        ...formData,
        child_age: parseInt(formData.child_age),
        uploaded_files: uploadedFiles // Store file info for reference
      });

      // Clear saved form data on successful submission
      localStorage.removeItem('kidReferralForm');
      setSubmitted(true);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Referral submission error:', error);
      alert('There was an error submitting the referral. Please try again or contact us directly at teamup4smi@gmail.com');
    }

    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Thank You for Your Referral!
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We've received {formData.child_name}'s information and our team will review it carefully. 
              We'll be in touch with {formData.guardian_name} within 48 hours to discuss next steps.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
                <Info className="w-5 h-5" />
                What Happens Next?
              </h3>
              <div className="space-y-2 text-sm text-blue-800 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 text-xs font-bold">1</span>
                  </div>
                  <p>Our team reviews the referral and any uploaded materials</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 text-xs font-bold">2</span>
                  </div>
                  <p>We contact the family within 48 hours to discuss the child's vision</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 text-xs font-bold">3</span>
                  </div>
                  <p>If approved, we begin planning the filmmaking experience</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-800 text-xs font-bold">4</span>
                  </div>
                  <p>Professional mentors are matched with the child's interests and needs</p>
                </div>
              </div>
            </div>
            
            <Alert className="mb-8">
              <Shield className="w-4 h-4" />
              <AlertDescription>
                <strong>Your Privacy Matters:</strong> All information shared will be kept strictly confidential. 
                We only use this information to help assess how we can best serve {formData.child_name}.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-blue-600 to-blue-700 w-full sm:w-auto">
                Return to Homepage
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Questions? Contact us at{' '}
                  <a href="mailto:teamup4smi@gmail.com" className="text-blue-600 hover:underline">
                    teamup4smi@gmail.com
                  </a>{' '}
                  or{' '}
                  <a href="tel:5862448492" className="text-blue-600 hover:underline">
                    (586) 244-8492
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800">Make a Referral</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Unlock a Child's Creative Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Know a disadvantaged youth whose voice deserves to be heard? Help us provide professional 
            filmmaking tools and expert mentorship to divert them from trauma and empower them to share their story.
          </p>
        </div>

        {/* Auto-save notice */}
        {(formData.child_name || formData.guardian_name || formData.wish_description) && (
          <Alert className="mb-8">
            <Info className="w-4 h-4" />
            <AlertDescription>
              Your form progress is being automatically saved as you type.
            </AlertDescription>
          </Alert>
        )}

        {/* Process Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Users,
              title: "Submit Referral",
              description: "Provide child and guardian information along with their creative wish",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: Heart,
              title: "Review & Approve", 
              description: "Our team carefully reviews each referral and contacts the family within 48 hours",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: Camera,
              title: "Create Magic",
              description: "Approved children receive equipment, mentorship, and support to create their film",
              color: "from-yellow-500 to-yellow-600"
            }
          ].map((step, index) => (
            <div key={step.title} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Referral Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Star className="w-6 h-6" />
              Child Referral Form
            </CardTitle>
            <p className="text-blue-100">
              All information is kept strictly confidential and secure. Required fields are marked with *
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Child Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Child Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="child-name">Child's Full Name *</Label>
                    <Input
                      id="child-name"
                      name="child_name"
                      required
                      value={formData.child_name}
                      onChange={(e) => handleInputChange('child_name', e.target.value)}
                      placeholder="Enter child's full name"
                      className={formErrors.child_name ? 'border-red-500' : ''}
                    />
                    {formErrors.child_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.child_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="child-age">Child's Age *</Label>
                    <Input
                      id="child-age"
                      name="child_age"
                      type="number"
                      min="3"
                      max="18"
                      required
                      value={formData.child_age}
                      onChange={(e) => handleInputChange('child_age', e.target.value)}
                      placeholder="Age (3-18 years)"
                      className={formErrors.child_age ? 'border-red-500' : ''}
                    />
                    {formErrors.child_age && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.child_age}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Guardian/Parent Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="guardian-name">Guardian's Full Name *</Label>
                    <Input
                      id="guardian-name"
                      name="guardian_name"
                      required
                      value={formData.guardian_name}
                      onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                      placeholder="Enter guardian's full name"
                      className={formErrors.guardian_name ? 'border-red-500' : ''}
                    />
                    {formErrors.guardian_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.guardian_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="guardian-email">Guardian's Email *</Label>
                    <Input
                      id="guardian-email"
                      name="guardian_email"
                      type="email"
                      required
                      value={formData.guardian_email}
                      onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                      placeholder="guardian@email.com"
                      className={formErrors.guardian_email ? 'border-red-500' : ''}
                    />
                    {formErrors.guardian_email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.guardian_email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="guardian-phone">Guardian's Phone Number</Label>
                    <Input
                      id="guardian-phone"
                      name="guardian_phone"
                      type="tel"
                      value={formData.guardian_phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      className={formErrors.guardian_phone ? 'border-red-500' : ''}
                    />
                    {formErrors.guardian_phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.guardian_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="referral-source">How did you hear about UP4S?</Label>
                    <Input
                      id="referral-source"
                      value={formData.referral_source}
                      onChange={(e) => handleInputChange('referral_source', e.target.value)}
                      placeholder="Hospital, school, friend, social media, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Creative Wish Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-500" />
                  Creative Wish Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="wish-description">Describe the Child's Creative Wish *</Label>
                    <Textarea
                      id="wish-description"
                      name="wish_description"
                      required
                      value={formData.wish_description}
                      onChange={(e) => handleInputChange('wish_description', e.target.value)}
                      placeholder="What kind of film or art project does the child want to create? What's their vision or story they want to tell? Please be as detailed as possible."
                      rows={5}
                      className={formErrors.wish_description ? 'border-red-500' : ''}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {formErrors.wish_description ? (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {formErrors.wish_description}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          {formData.wish_description.length < 20 ? 
                            `Please provide at least ${20 - formData.wish_description.length} more characters` :
                            'Great! You\'ve provided enough detail.'
                          }
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {formData.wish_description.length}/500
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="urgency-level">Urgency Level</Label>
                    <Select
                      value={formData.urgency_level}
                      onValueChange={(value) => handleInputChange('urgency_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Seeking new opportunities</SelectItem>
                        <SelectItem value="medium">Medium - Facing some challenges</SelectItem>
                        <SelectItem value="high">High - At-risk situation</SelectItem>
                        <SelectItem value="critical">Critical - Immediate intervention needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-500" />
                  Additional Information (Optional)
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      {isUploading ? 'Uploading files...' : 'Upload photos, videos, or documents'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Optional: Photos of the child, artwork samples, medical documents, etc. (Max 10MB per file)
                    </p>
                  </label>
                  {isUploading && (
                    <div className="mt-4">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-600 mt-2">{Math.round(uploadProgress)}% uploaded</p>
                    </div>
                  )}
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 mb-3">Uploaded Files:</p>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Consent and Privacy */}
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Consent and Privacy
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      name="consent"
                      checked={hasConsented}
                      onCheckedChange={setHasConsented}
                      className={formErrors.consent ? 'border-red-500' : ''}
                    />
                    <div>
                      <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                        I confirm that I have permission to share this information about the child mentioned above. 
                        I understand that all details provided will be kept strictly confidential and used only for 
                        the purpose of assessing how Team UP4S can best serve this child. I also understand that 
                        Team UP4S reserves the right to decline referrals that don't meet program criteria.
                      </label>
                      {formErrors.consent && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {formErrors.consent}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Privacy Notice:</strong> Your information is protected and will never be shared with 
                      third parties without your explicit consent. We comply with all applicable privacy laws and 
                      maintain strict confidentiality standards.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting Referral...
                      </>
                    ) : (
                      'Submit Referral'
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Questions? Contact us at{' '}
                    <a href="mailto:teamup4smi@gmail.com" className="text-blue-600 hover:underline">
                      teamup4smi@gmail.com
                    </a>{' '}
                    or{' '}
                    <a href="tel:5862448492" className="text-blue-600 hover:underline">
                      (586) 244-8492
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { KidReferral } from '@/api/entities';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, Users, Camera, CheckCircle, Upload, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { Container, PageHeader, Surface, ctaClass } from '@/components/site/ui';
import { UploadReferralFile } from '@/api/integrations';

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
        toast.error(`${file.name} is too large`, { description: 'Files can be up to 10 MB.' });
        continue;
      }

      try {
        const { path } = await UploadReferralFile({ file });
        setUploadedFiles((prev) => [...prev, {
          name: file.name,
          path,
          size: file.size
        }]);
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        toast.error(`Couldn’t upload ${file.name}`, { description: 'Please try again.' });
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
      toast.error('We couldn’t submit the referral', { description: 'Please try again, or email teamup4smi@gmail.com.' });
    }

    setIsSubmitting(false);
  };

  const contactLine = (
    <p className="text-sm text-gray-500">
      Questions? Email{' '}
      <a href="mailto:teamup4smi@gmail.com" className="font-medium text-blue-700 hover:underline">teamup4smi@gmail.com</a>{' '}
      or call{' '}
      <a href="tel:5862448492" className="font-medium text-blue-700 hover:underline">(586) 244-8492</a>
    </p>
  );

  if (submitted) {
    const nextSteps = [
      'Our team reviews the referral and any uploaded materials',
      "We contact the family within 48 hours to discuss the child's vision",
      'If approved, we begin planning the filmmaking experience',
      "Professional mentors are matched with the child's interests and needs",
    ];
    return (
      <div className="relative isolate min-h-[80vh] bg-gray-50 px-4 py-16 sm:py-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(37,99,235,0.12),transparent_70%)]" />
        <Surface className="mx-auto max-w-2xl p-8 text-center shadow-xl shadow-gray-900/[0.04] sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
            <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
          </span>
          <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Thank you for your referral
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-gray-600">
            We&apos;ve received {formData.child_name}&apos;s information. Our team will review it carefully and
            reach out to {formData.guardian_name} within 48 hours.
          </p>

          <div className="mt-10 rounded-2xl border border-gray-200/80 bg-gray-50 p-6 text-left">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">What happens next</h2>
            <ol className="mt-4 space-y-3">
              {nextSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-700 ring-1 ring-gray-200">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 flex items-start gap-2 text-left text-sm text-gray-500">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            Everything you shared is kept strictly confidential and used only to assess how we can best serve {formData.child_name}.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link to="/" className={ctaClass('primary', 'lg')}>Return to homepage</Link>
            {contactLine}
          </div>
        </Surface>
      </div>
    );
  }

  const steps = [
    { icon: Users, title: 'Submit a referral', description: 'Share the child and guardian details along with their creative wish.' },
    { icon: Heart, title: 'We review & reach out', description: 'Our team reviews each referral and contacts the family within 48 hours.' },
    { icon: Camera, title: 'Create something amazing', description: 'Approved children receive equipment, mentorship and support to make their film.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Refer a kid"
        title="Unlock a child’s creative potential"
        lede="Know a young person whose voice deserves to be heard? Refer them for professional filmmaking tools and mentorship that help them share their story."
      />

      <Container className="max-w-5xl py-12 sm:py-16">
        {/* How it works */}
        <ol className="mb-12 grid grid-cols-1 gap-4 sm:mb-16 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-gray-200/80 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Step {index + 1}</span>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </li>
          ))}
        </ol>

        {/* Referral form */}
        <Surface className="overflow-hidden shadow-xl shadow-gray-900/[0.04]">
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900">Child referral form</h2>
              <p className="mt-0.5 text-sm text-gray-500">Confidential and secure. Required fields are marked <span className="text-red-600">*</span></p>
            </div>
            {(formData.child_name || formData.guardian_name || formData.wish_description) && (
              <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200 sm:self-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                Progress saved automatically
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
            {/* Child */}
            <FormSection number={1} title="About the child" description="Who are we making this possible for?">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Child&apos;s full name <Req /></Label>
                  <Input
                    id="child-name"
                    name="child_name"
                    required
                    value={formData.child_name}
                    onChange={(e) => handleInputChange('child_name', e.target.value)}
                    placeholder="First and last name"
                    aria-invalid={!!formErrors.child_name}
                    className={inputClass(formErrors.child_name)}
                  />
                  <FieldError message={formErrors.child_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child-age">Child&apos;s age <Req /></Label>
                  <Input
                    id="child-age"
                    name="child_age"
                    type="number"
                    min="3"
                    max="18"
                    required
                    value={formData.child_age}
                    onChange={(e) => handleInputChange('child_age', e.target.value)}
                    placeholder="3–18"
                    aria-invalid={!!formErrors.child_age}
                    className={inputClass(formErrors.child_age)}
                  />
                  <FieldError message={formErrors.child_age} />
                </div>
              </div>
            </FormSection>

            {/* Guardian */}
            <FormSection number={2} title="Parent or guardian" description="We'll contact this person about next steps.">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardian-name">Guardian&apos;s full name <Req /></Label>
                  <Input
                    id="guardian-name"
                    name="guardian_name"
                    required
                    autoComplete="name"
                    value={formData.guardian_name}
                    onChange={(e) => handleInputChange('guardian_name', e.target.value)}
                    placeholder="First and last name"
                    aria-invalid={!!formErrors.guardian_name}
                    className={inputClass(formErrors.guardian_name)}
                  />
                  <FieldError message={formErrors.guardian_name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian-email">Guardian&apos;s email <Req /></Label>
                  <Input
                    id="guardian-email"
                    name="guardian_email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.guardian_email}
                    onChange={(e) => handleInputChange('guardian_email', e.target.value)}
                    placeholder="name@example.com"
                    aria-invalid={!!formErrors.guardian_email}
                    className={inputClass(formErrors.guardian_email)}
                  />
                  <FieldError message={formErrors.guardian_email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian-phone">Phone number</Label>
                  <Input
                    id="guardian-phone"
                    name="guardian_phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.guardian_phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    aria-invalid={!!formErrors.guardian_phone}
                    className={inputClass(formErrors.guardian_phone)}
                  />
                  <FieldError message={formErrors.guardian_phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral-source">How did you hear about UP4S?</Label>
                  <Input
                    id="referral-source"
                    value={formData.referral_source}
                    onChange={(e) => handleInputChange('referral_source', e.target.value)}
                    placeholder="School, hospital, friend, social media…"
                    className={inputClass()}
                  />
                </div>
              </div>
            </FormSection>

            {/* Wish */}
            <FormSection number={3} title="The creative wish" description="Tell us the story they want to tell.">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="wish-description">Describe the child&apos;s creative wish <Req /></Label>
                  <Textarea
                    id="wish-description"
                    name="wish_description"
                    required
                    value={formData.wish_description}
                    onChange={(e) => handleInputChange('wish_description', e.target.value)}
                    placeholder="What kind of film or art project does the child want to create? What story do they want to tell? The more detail, the better."
                    rows={5}
                    aria-invalid={!!formErrors.wish_description}
                    className={formErrors.wish_description ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  <div className="flex items-center justify-between gap-4">
                    {formErrors.wish_description ? (
                      <FieldError message={formErrors.wish_description} />
                    ) : (
                      <p className={`text-sm ${formData.wish_description.length < 20 ? 'text-gray-500' : 'text-green-700'}`}>
                        {formData.wish_description.length < 20
                          ? `At least ${20 - formData.wish_description.length} more characters`
                          : 'Great, that’s enough detail.'}
                      </p>
                    )}
                    <p className="shrink-0 text-sm tabular-nums text-gray-400">{formData.wish_description.length}/500</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency-level">Urgency</Label>
                  <Select
                    value={formData.urgency_level}
                    onValueChange={(value) => handleInputChange('urgency_level', value)}
                  >
                    <SelectTrigger id="urgency-level" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low: seeking new opportunities</SelectItem>
                      <SelectItem value="medium">Medium: facing some challenges</SelectItem>
                      <SelectItem value="high">High: at-risk situation</SelectItem>
                      <SelectItem value="critical">Critical: immediate intervention needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            {/* Files */}
            <FormSection number={4} title="Supporting files" description="Optional. Photos, artwork samples or documents.">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="peer sr-only"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-600 ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                  <Upload className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </span>
                <span className="mt-3 text-sm font-medium text-gray-900">
                  {isUploading ? 'Uploading files…' : <><span className="text-blue-700">Choose files</span> to upload</>}
                </span>
                <span className="mt-1 text-xs text-gray-500">Images, video, PDF or Word · up to 10 MB each</span>
              </label>
              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2 w-full" />
                  <p className="mt-2 text-sm text-gray-600">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <ul className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-200/80">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center gap-3 px-4 py-3">
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{file.name}</span>
                      <span className="shrink-0 text-xs tabular-nums text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </FormSection>

            {/* Consent */}
            <div className="bg-gray-50/70 px-6 py-8 sm:px-10">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent"
                  name="consent"
                  checked={hasConsented}
                  onCheckedChange={setHasConsented}
                  className={`mt-0.5 ${formErrors.consent ? 'border-red-500' : ''}`}
                />
                <div>
                  <label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed text-gray-700">
                    I confirm that I have permission to share this information about the child above. I understand it
                    will be kept strictly confidential and used only to assess how Team UP4S can best serve this child,
                    and that Team UP4S may decline referrals that don&apos;t meet program criteria.
                  </label>
                  <FieldError message={formErrors.consent} />
                </div>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                Your information is never shared with third parties without your explicit consent. We comply with
                applicable privacy laws and maintain strict confidentiality.
              </p>

              <button type="submit" disabled={isSubmitting} className={ctaClass('primary', 'lg', 'mt-8 w-full')}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Submitting referral…
                  </>
                ) : (
                  'Submit referral'
                )}
              </button>
              <div className="mt-4 text-center">{contactLine}</div>
            </div>
          </form>
        </Surface>
      </Container>
    </div>
  );
}

function Req() {
  return <span className="text-red-600" aria-hidden="true">*</span>;
}

function inputClass(error) {
  return `h-11 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-sm text-red-600">
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function FormSection({ number, title, description, children }) {
  return (
    <fieldset className="grid grid-cols-1 gap-6 px-6 py-8 sm:px-10 lg:grid-cols-3 lg:gap-10">
      <div>
        <legend className="flex items-center gap-2.5 font-semibold text-gray-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{number}</span>
          {title}
        </legend>
        {description && <p className="mt-1.5 text-sm text-gray-500 lg:pl-8">{description}</p>}
      </div>
      <div className="lg:col-span-2">{children}</div>
    </fieldset>
  );
}

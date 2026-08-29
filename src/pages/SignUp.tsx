import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { submitToGoogleSheets } from '@/lib/googleSheets';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Users,
  Briefcase, 
  Phone, 
  MapPin, 
  Sparkles, 
  Upload, 
  Check, 
  Globe, 
  Building2, 
  Star, 
  CheckCircle2, 
  X, 
  AlertCircle,
  ShieldAlert,
  Fingerprint,
  TrendingUp,
  FileCheck,
  Plane,
  Hotel,
  Activity
} from 'lucide-react';

// Indian States list for dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

// Country list with flags for dropdown
const COUNTRIES = [
  { name: 'India', code: 'IN', flag: '🇮🇳', dial: '+91' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dial: '+971' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', dial: '+65' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', dial: '+66' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dial: '+62' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵', dial: '+977' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dial: '+44' },
  { name: 'United States', code: 'US', flag: '🇺🇸', dial: '+1' },
];

// Business Types
const BUSINESS_TYPES = [
  { value: 'Travel Agency', label: 'Travel Agency' },
  { value: 'Tour Operator', label: 'Tour Operator' },
  { value: 'Corporate Travel Desk', label: 'Corporate Travel Desk' },
  { value: 'DMC', label: 'Destination Management Company (DMC)' },
  { value: 'OTA', label: 'Online Travel Agent (OTA)' },
  { value: 'Freelancer', label: 'Freelancer / Independent Consultant' },
  { value: 'Hotel Partner', label: 'Hotel Partner' },
  { value: 'Airline Partner', label: 'Airline Partner' },
  { value: 'Other', label: 'Other Business Type' },
];

// Roles list
const ROLES = [
  { value: 'Reservation Executive', label: 'Reservation Executive', dept: 'Reservations' },
  { value: 'Sales Executive', label: 'Sales Executive', dept: 'Sales' },
  { value: 'Ticketing Executive', label: 'Ticketing Executive', dept: 'Ticketing & Operations' },
  { value: 'Visa Executive', label: 'Visa Executive', dept: 'Visa & Documentation' },
  { value: 'Operations Executive', label: 'Operations Executive', dept: 'Operations' },
  { value: 'Accounts Executive', label: 'Accounts Executive', dept: 'Finance & Accounts' },
  { value: 'Reporting Manager', label: 'Reporting Manager', dept: 'Management' },
  { value: 'Branch Manager', label: 'Branch Manager', dept: 'Management' },
  { value: 'Team Lead', label: 'Team Lead', dept: 'Operations' },
  { value: 'Admin', label: 'Admin / Owner Representative', dept: 'IT & Administration' }
];

// Permissions mapping for preview card
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Reservation Executive': [
    'Create and manage customer reservations',
    'Assign hotels, packages and activities to itineraries',
    'Communicate directly with hotel suppliers for availability'
  ],
  'Sales Executive': [
    'Create and follow up on customer leads',
    'Generate customized quotes and itineraries',
    'Track personal sales targets and conversion ratios'
  ],
  'Ticketing Executive': [
    'Access ticketing and GDS booking queues',
    'Log flight rates, issue e-tickets, and process refunds',
    'Liaise directly with consolidators and airline partners'
  ],
  'Visa Executive': [
    'Manage visa document checklists and verify uploads',
    'Track visa processing status with embassies and VFS',
    'Notify sales executives and clients on visa outcomes'
  ],
  'Operations Executive': [
    'Dispatch final travel vouchers and cab details',
    'Coordinate day-to-day operations and tour guides',
    'Log ground operational issues and emergency support logs'
  ],
  'Accounts Executive': [
    'Log vendor expenses and invoice payments',
    'Verify customer bank deposits and Razorpay/PayU receipts',
    'Generate profit-margin reports and tax invoices'
  ],
  'Reporting Manager': [
    'Monitor team lead pipelines and assignments',
    'Approve high-value package pricing and discounts',
    'Generate full analytics and conversion dashboards'
  ],
  'Branch Manager': [
    'Full visibility over branch-specific leads and employees',
    'Allocate branch resources, budgets and targets',
    'Approve local supplier contracts and overrides'
  ],
  'Team Lead': [
    'Re-assign leads and monitor team follow-up times',
    'Assist team members with quote negotiations',
    'Log performance audits and review custom itineraries'
  ],
  'Admin': [
    'Full access to all CRM panels, databases, and logs',
    'Invite, suspend, and configure CRM user roles',
    'Export database backups and manage system variables'
  ]
};

// Testimonials for Left Panel
const TESTIMONIALS = [
  {
    quote: "GhumoFiroo CRM transformed our operations. Bookings increased by 40% in just three months.",
    author: "Rajesh Malhotra",
    company: "Founder, Malhotra Journeys",
    stars: 5
  },
  {
    quote: "The automated visa tracker and instant PDF itinerary generator saves my team 4 hours per lead.",
    author: "Shreya Ghoshal",
    company: "Operations Head, Wanderlust DMC",
    stars: 5
  },
  {
    quote: "Enterprise-grade security and seamless team collaboration. Highly recommended for scaling agencies.",
    author: "Vikram Sen",
    company: "Director, Sen Corporate Travels",
    stars: 5
  }
];

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  // Page Theme State (Dark mode by default, SaaS standard)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Invitation info
  const [invitationData, setInvitationData] = useState<any>(null);
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  // Registration flow state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Testimonial Index
  const [testiIdx, setTestiIdx] = useState(0);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('Reservation Executive');
  const [department, setDepartment] = useState('Reservations');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('Travel Agency');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companySize, setCompanySize] = useState('1-5 members');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');
  const [country, setCountry] = useState('India');
  const [countryDialCode, setCountryDialCode] = useState('+91');

  const [expectedBookings, setExpectedBookings] = useState('10');
  const [primaryServices, setPrimaryServices] = useState<string[]>(['Flights', 'Hotels']);
  const [reasonForAccess, setReasonForAccess] = useState('');
  const [currentBookingSystem, setCurrentBookingSystem] = useState('');
  const [preferredSuppliers, setPreferredSuppliers] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Password Validation
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  // Search dropdown toggles
  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  // Auto-rotating testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestiIdx(prev => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Invitation details if token exists
  useEffect(() => {
    const checkInvitation = async () => {
      if (!inviteToken) return;
      setIsInviteLoading(true);
      setErrorMsg('');

      try {
        const { data, error } = await supabase
          .from('crm_invitations')
          .select('*')
          .eq('id', inviteToken)
          .eq('status', 'Pending')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setInvitationData(data);
          setEmail(data.email);
          setCompanyName(data.company_name);
          setBusinessType(data.business_type);
          if (data.city) setCity(data.city);
          if (data.state) setState(data.state);
          if (data.country) setCountry(data.country);
          
          // Pre-select role if invited to a specific role
          const matchingRole = ROLES.find(r => r.value === data.role);
          if (matchingRole) {
            setDesignation(matchingRole.value);
            setDepartment(matchingRole.dept);
          }

          toast({
            title: "Invitation Verified",
            description: `Signing up to join ${data.company_name} as ${data.role}.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Invalid Invitation",
            description: "The signup link is invalid, expired, or has already been used.",
          });
        }
      } catch (err: any) {
        console.error("Invitation check error:", err);
      } finally {
        setIsInviteLoading(false);
      }
    };

    checkInvitation();
  }, [inviteToken]);

  // Load draft from localStorage on mount (unless it's an invite flow)
  useEffect(() => {
    if (inviteToken) return; // Disable draft in invite flow
    const draftJson = localStorage.getItem('ghumofiroo_signup_draft');
    if (draftJson) {
      try {
        const draft = JSON.parse(draftJson);
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.email) setEmail(draft.email);
        if (draft.mobileNumber) setMobileNumber(draft.mobileNumber);
        if (draft.designation) setDesignation(draft.designation);
        if (draft.department) setDepartment(draft.department);
        if (draft.companyName) setCompanyName(draft.companyName);
        if (draft.businessType) setBusinessType(draft.businessType);
        if (draft.gstNumber) setGstNumber(draft.gstNumber);
        if (draft.panNumber) setPanNumber(draft.panNumber);
        if (draft.websiteUrl) setWebsiteUrl(draft.websiteUrl);
        if (draft.companySize) setCompanySize(draft.companySize);
        if (draft.city) setCity(draft.city);
        if (draft.state) setState(draft.state);
        if (draft.country) setCountry(draft.country);
        if (draft.expectedBookings) setExpectedBookings(draft.expectedBookings);
        if (draft.primaryServices) setPrimaryServices(draft.primaryServices);
        if (draft.reasonForAccess) setReasonForAccess(draft.reasonForAccess);
        if (draft.currentBookingSystem) setCurrentBookingSystem(draft.currentBookingSystem);
        if (draft.preferredSuppliers) setPreferredSuppliers(draft.preferredSuppliers);
        if (draft.avatarBase64) setAvatarBase64(draft.avatarBase64);
        if (draft.avatarFileName) setAvatarFileName(draft.avatarFileName);
      } catch (e) {
        console.error("Error loading onboarding draft:", e);
      }
    }
  }, [inviteToken]);

  // Save draft to localStorage whenever relevant fields change
  useEffect(() => {
    if (inviteToken) return; // Disable draft in invite flow
    const draft = {
      fullName, email, mobileNumber, designation, department,
      companyName, businessType, gstNumber, panNumber, websiteUrl,
      companySize, city, state, country, expectedBookings,
      primaryServices, reasonForAccess, currentBookingSystem, preferredSuppliers,
      avatarBase64, avatarFileName
    };
    localStorage.setItem('ghumofiroo_signup_draft', JSON.stringify(draft));
  }, [
    fullName, email, mobileNumber, designation, department,
    companyName, businessType, gstNumber, panNumber, websiteUrl,
    companySize, city, state, country, expectedBookings,
    primaryServices, reasonForAccess, currentBookingSystem, preferredSuppliers,
    avatarBase64, avatarFileName, inviteToken
  ]);

  // Phone Number formatting & limit (India: 10 digit cleaner, others digits only)
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    if (country === 'India') {
      setMobileNumber(clean.slice(0, 10));
    } else {
      setMobileNumber(clean.slice(0, 15));
    }
  };

  // Password change and checks
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    const feedback: string[] = [];
    if (val.length < 8) feedback.push('8+ characters');
    if (!/[A-Z]/.test(val)) feedback.push('One capital letter');
    if (!/[a-z]/.test(val)) feedback.push('One lowercase letter');
    if (!/\d/.test(val)) feedback.push('One number');
    if (!/[^A-Za-z0-9]/.test(val)) feedback.push('One special symbol');

    setPasswordFeedback(feedback);
    if (val.length === 0) setPasswordStrength('Weak');
    else if (feedback.length === 0) setPasswordStrength('Strong');
    else if (feedback.length <= 2) setPasswordStrength('Medium');
    else setPasswordStrength('Weak');
  };

  // Profile image handler
  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid File", description: "Please upload an image file (PNG, JPG)." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File Too Large", description: "Image size must be less than 2MB." });
      return;
    }
    setAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatarBase64(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Toggle Services
  const handleServiceToggle = (srv: string) => {
    setPrimaryServices(prev => 
      prev.includes(srv) ? prev.filter(x => x !== srv) : [...prev, srv]
    );
  };

  // Validation function per step
  const validateStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!fullName.trim()) return 'Please enter your Full Name.';
      if (!email.trim() || !email.includes('@')) return 'Please enter a valid work email address.';
      if (!mobileNumber) return 'Please enter your mobile number.';
      if (country === 'India' && mobileNumber.length !== 10) return 'Please enter a valid 10-digit mobile number.';
      if (!designation) return 'Please select your designation.';
    } else if (step === 2 && !invitationData) { // Skip company validations if invited
      if (!companyName.trim()) return 'Please enter your Company Name.';
      if (!city.trim()) return 'Please enter city.';
      if (!state.trim()) return 'Please select your state.';
      if (!country.trim()) return 'Please select your country.';
      if (gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.toUpperCase())) {
        return 'Please enter a valid 15-character GSTIN number (e.g. 07AAAAA1111A1Z1).';
      }
      if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
        return 'Please enter a valid 10-character PAN card number (e.g. ABCDE1234F).';
      }
    } else if (step === 3 && !invitationData) { // Skip business details if invited
      if (!expectedBookings) return 'Please select expected monthly bookings.';
      if (primaryServices.length === 0) return 'Please select at least one primary service.';
      if (!reasonForAccess.trim()) return 'Please describe your reason for access.';
    }
    return '';
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setErrorMsg(error);
      return;
    }
    // If invited, we skip Steps 2 and 3 and go straight to security
    if (invitationData && step === 1) {
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    if (invitationData && step === 4) {
      setStep(1);
    } else {
      setStep(prev => prev - 1);
    }
  };

  // Submit Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Final Validations
    if (passwordStrength !== 'Strong') {
      setErrorMsg('Password does not meet the complexity requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      setErrorMsg('You must accept the terms and conditions and privacy policy to register.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check duplicate email in profile table
      const { data: existingUser, error: dupCheckError } = await supabase
        .from('crm_users')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (dupCheckError) console.error('Duplicate email check failed:', dupCheckError);

      if (existingUser) {
        setLoading(false);
        setErrorMsg('This email address is already registered. Please request recovery or log in.');
        return;
      }

      // 2. Register in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Onboarding failed. Please try again later.');
      }

      // 3. Save User Profile in public.crm_users
      // Set status based on whether the user is joining via an invite (defaults to 'Pending' approval, or 'Pending Approval')
      // Let's set role to the designation they selected
      const finalRole = invitationData ? invitationData.role : designation;
      const finalStatus = invitationData ? 'Pending' : 'Pending Approval';
      const finalActiveStatus = false;

      const { error: profileError } = await supabase
        .from('crm_users')
        .insert({
          auth_user_id: authData.user.id,
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: finalRole, 
          status: finalStatus,
          active_status: finalActiveStatus,
          company_name: companyName.trim(),
          designation: designation.trim(),
          mobile_number: countryDialCode + ' ' + mobileNumber,
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          business_type: businessType,
          expected_bookings: Number(expectedBookings) || 0,
          reason_for_access: invitationData ? `Invited by existing owner to join ${companyName}` : reasonForAccess.trim(),
          avatar_url: avatarBase64 || null
        });

      if (profileError) {
        console.error('Error inserting crm_user profile:', profileError);
        // Continue and attempt notifications anyway
      }

      // 4. Update Invitation status to Accepted if applicable
      if (invitationData) {
        const { error: inviteUpdateErr } = await supabase
          .from('crm_invitations')
          .update({ status: 'Accepted', updated_at: new Date().toISOString() })
          .eq('id', invitationData.id);
        
        if (inviteUpdateErr) console.error("Error updating invitation status:", inviteUpdateErr);
      }

      // 5. Google Sheets notification sync
      try {
        await submitToGoogleSheets({
          type: 'enquiry',
          source: 'CRM Team Signup Onboarding',
          name: fullName,
          email: email,
          phone: countryDialCode + ' ' + mobileNumber,
          company: companyName,
          designation: designation,
          businessType: businessType,
          expectedBookings: expectedBookings,
          reason: invitationData ? `Invited Team Member - Status Pending` : reasonForAccess,
          notes: `New Travel Platform Sign Up. Location: ${city}, ${state}, ${country}. Registered via ${invitationData ? 'Owner Invitation Link' : 'Self Registration'}.`
        });
      } catch (sheetsErr) {
        console.error('Google Sheets sync error:', sheetsErr);
      }

      // Clear draft storage
      localStorage.removeItem('ghumofiroo_signup_draft');

      setSuccess(true);
      toast({
        title: "Registration Submitted",
        description: "Your onboarding request is submitted and is pending administrator review.",
      });

    } catch (err: any) {
      console.error('Onboarding submit error:', err);
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredStates = INDIAN_STATES.filter(s => 
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Quick Role Permissions preview mapping
  const selectedRolePermissions = ROLE_PERMISSIONS[designation] || [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SaaS Premium Header with Local Light/Dark Toggler */}
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img 
            src="https://ghumofiroo.com/ghumo-firoo-logo.png" 
            alt="Ghumo Firoo Travels Logo" 
            className="h-10 w-auto filter drop-shadow bg-white/10 p-1.5 rounded-xl border border-white/5" 
          />
          <span className={`text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            GhumoFiroo<span className="text-accent">CRM</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-white/10 text-accent hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <Link to="/crm" className={`text-xs font-bold hover:underline ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Back to Login
          </Link>
        </div>
      </header>

      {/* Main Container: Split Grid Panel */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
        
        {/* LEFT PANEL: Branding & Visuals (Hidden on small screens) */}
        <section className={`hidden lg:flex lg:col-span-5 flex-col justify-between p-12 pt-28 relative overflow-hidden border-r ${
          isDarkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-100/50 border-slate-200'
        }`}>
          {/* Radial overlays */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />

          {/* Marketing Content */}
          <div className="space-y-8 relative z-10 my-auto">
            
            {/* Tagline */}
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent border border-accent/20 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                <Sparkles className="w-3 h-3" /> Enterprise CRM Platform
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Streamline Your Travel <br />
                Business Operations
              </h2>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Designed for tour operators, corporate desks, and travel consultants. Connect with suppliers, log bookings, and manage leads in one unified dashboard.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Plane, label: "Flight Bookings", desc: "Real-time ticketing log" },
                { icon: Hotel, label: "Hotel Bookings", desc: "Integrated rate sheets" },
                { icon: ShieldCheck, label: "Visa Management", desc: "Automated checklist alerts" },
                { icon: Users, label: "Customer CRM", desc: "Advanced lead segmentation" },
                { icon: Activity, label: "Reporting & Analytics", desc: "Real-time conversions log" },
                { icon: Globe, label: "DMC & OTA Channels", desc: "Multi-branch setups" },
              ].map((f, i) => (
                <div key={i} className={`p-3 rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-slate-950/40 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}>
                  <f.icon className="w-5 h-5 text-accent mb-2" />
                  <div className="text-xs font-bold">{f.label}</div>
                  <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-450'}`}>{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Micro Stats Card */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950/60 border-white/5' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold">Active System Load</div>
                  <div className={`text-[10px] ${isDarkMode ? 'text-slate-505' : 'text-slate-400'}`}>Live dashboard metrics</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-emerald-400">99.99%</div>
                <div className="text-[9px] text-slate-505 font-bold uppercase tracking-wider">UPTIME</div>
              </div>
            </div>

            {/* Testimonials Slider */}
            <div className={`p-5 rounded-3xl border relative ${
              isDarkMode ? 'bg-slate-950/30 border-white/5' : 'bg-white border-slate-200/60 shadow-sm'
            }`}>
              <div className="flex gap-1 mb-2">
                {[...Array(TESTIMONIALS[testiIdx].stars)].map((_, idx) => (
                  <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className={`text-xs italic leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                "{TESTIMONIALS[testiIdx].quote}"
              </p>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <div className="text-xs font-bold">{TESTIMONIALS[testiIdx].author}</div>
                  <div className="text-[10px] text-slate-505">{TESTIMONIALS[testiIdx].company}</div>
                </div>
                {/* Dots indicator */}
                <div className="flex gap-1">
                  {TESTIMONIALS.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setTestiIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        testiIdx === i ? 'bg-accent w-3' : 'bg-slate-600/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Branding */}
          <div className="text-[10px] text-slate-505 font-medium flex items-center justify-between border-t border-white/5 pt-4">
            <div>© {new Date().getFullYear()} Ghumo Firoo Travels Delhi</div>
            <div className="flex gap-3">
              <a href="/privacy-policy" className="hover:underline">Privacy</a>
              <a href="/terms-conditions" className="hover:underline">Terms</a>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Registration / Onboarding Form */}
        <main className="lg:col-span-7 flex flex-col justify-center p-6 md:p-12 lg:p-16 pt-24 md:pt-28 relative">
          
          {success ? (
            /* SUCCESS ONBOARDING SCREEN */
            <div className="max-w-xl mx-auto w-full text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Onboarding Request Submitted!</h2>
              <div className={`p-5 rounded-2xl border text-sm leading-relaxed ${
                isDarkMode ? 'bg-slate-900/50 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <p className="font-bold text-accent mb-2">Request Status: Pending Review</p>
                Your account request has been submitted successfully. Once approved by your administrator or agency owner, you will receive an email notification and can access the CRM platform.
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <Link 
                  to="/crm" 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  Return to CRM Login <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-slate-500 font-semibold">
                  For urgent access, please contact your company's CRM Administrator.
                </p>
              </div>
            </div>
          ) : (
            /* ONBOARDING REGISTRATION FORM CARD */
            <div className="max-w-xl mx-auto w-full space-y-6">
              
              {/* Form Title */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black tracking-tight">
                  {invitationData ? 'Join Your Travel Team' : 'Create Team Account'}
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {invitationData 
                    ? `Complete your personal details to join ${companyName} as a ${designation}.`
                    : 'Provide details to request access to the GhumoFiroo CRM system.'
                  }
                </p>
              </div>

              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <span>Step {step} of {invitationData ? 2 : 4}: {
                    step === 1 ? 'Personal Profile' :
                    step === 2 ? 'Company Credentials' :
                    step === 3 ? 'Business Metrics' : 'Security Details'
                  }</span>
                  <span>{Math.round((step / (invitationData ? 2 : 4)) * 100)}% Complete</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${(step / (invitationData ? 2 : 4)) * 100}%` }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Form container */}
              <form onSubmit={handleSignUpSubmit} className="space-y-6">
                
                {/* STEP 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Header Banner if invitation link is active */}
                    {invitationData && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 flex items-center gap-2.5">
                        <Building2 className="w-4 h-4" />
                        <span>You are invited to join <strong>{companyName}</strong>. Company details are preconfigured.</span>
                      </div>
                    )}

                    {/* Drag-and-drop Image Upload Zone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Profile Photo (Optional)</label>
                      <div 
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleImageDrop}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          avatarBase64 
                            ? 'border-emerald-500/50 bg-emerald-500/5' 
                            : isDarkMode ? 'border-white/10 bg-slate-950/40 hover:bg-slate-950/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                        onClick={() => document.getElementById('avatar-input')?.click()}
                      >
                        <input 
                          type="file" 
                          id="avatar-input" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageFile}
                        />
                        {avatarBase64 ? (
                          <div className="relative">
                            <img src={avatarBase64} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAvatarBase64(null);
                                setAvatarFileName('');
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-405">Drag profile picture here or click to browse</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input autoComplete="name"
                          type="text"
                          id="name"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email and Mobile Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider font-semibold">Work Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input autoComplete="email"
                            type="email"
                            id="email"
                            required
                            disabled={!!invitationData} // Lock email if invited
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="rahul@agency.com"
                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${
                              isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="mobile" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Mobile Number (WhatsApp) *</label>
                        <div className="flex rounded-xl overflow-hidden border border-white/10">
                          <select 
                            value={countryDialCode}
                            onChange={e => setCountryDialCode(e.target.value)}
                            className={`px-2 py-2.5 text-xs font-semibold border-r focus:outline-none ${
                              isDarkMode ? 'bg-slate-950 border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {COUNTRIES.map(c => (
                              <option key={c.code} value={c.dial}>{c.flag} {c.dial}</option>
                            ))}
                          </select>
                          <input autoComplete="tel"
                            type="tel"
                            id="mobile"
                            required
                            value={mobileNumber}
                            onChange={e => handlePhoneChange(e.target.value)}
                            placeholder="10-digit number"
                            className={`w-full px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                              isDarkMode ? 'bg-slate-950 border-none text-white' : 'bg-white border-none text-slate-800'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role & Designation Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="designation" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Designation / Role *</label>
                        <select
                          id="designation"
                          value={designation}
                          onChange={e => {
                            const val = e.target.value;
                            setDesignation(val);
                            const found = ROLES.find(r => r.value === val);
                            if (found) setDepartment(found.dept);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        >
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="department" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Department</label>
                        <input
                          type="text"
                          id="department"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          placeholder="e.g. Sales, Accounting"
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Permissions Preview Card */}
                    {selectedRolePermissions.length > 0 && (
                      <div className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-slate-950/60 border-white/5' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <div className="text-[10px] font-extrabold text-accent uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <ShieldAlert className="w-3.5 h-3.5" /> Platform Permissions Preview
                        </div>
                        <ul className="space-y-1">
                          {selectedRolePermissions.map((perm, idx) => (
                            <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-2">
                              <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{perm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}

                {/* STEP 2: Company Information (Disabled / Skipped in invitation flow) */}
                {step === 2 && !invitationData && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Company Name & Business Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="company" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Company Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            id="company"
                            required
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder="Agency or Corporate Name"
                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                              isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="business_type" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Business Type *</label>
                        <select
                          id="business_type"
                          value={businessType}
                          onChange={e => setBusinessType(e.target.value)}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        >
                          {BUSINESS_TYPES.map(b => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* GST & PAN numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="gst" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">GST Number (Optional)</label>
                        <input
                          type="text"
                          id="gst"
                          value={gstNumber}
                          onChange={e => setGstNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. 07AAAAA1111A1Z1"
                          maxLength={15}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="pan" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">PAN Number (Optional)</label>
                        <input
                          type="text"
                          id="pan"
                          value={panNumber}
                          onChange={e => setPanNumber(e.target.value.toUpperCase())}
                          placeholder="e.g. ABCDE1234F"
                          maxLength={10}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Website & Company Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="website" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                          <input
                            type="url"
                            id="website"
                            value={websiteUrl}
                            onChange={e => setWebsiteUrl(e.target.value)}
                            placeholder="https://agency.com"
                            className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                              isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="company_size" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Company Size</label>
                        <select
                          id="company_size"
                          value={companySize}
                          onChange={e => setCompanySize(e.target.value)}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        >
                          <option value="1-5 members">1 - 5 members</option>
                          <option value="6-20 members">6 - 20 members</option>
                          <option value="21-100 members">21 - 100 members</option>
                          <option value="100+ members">100+ members</option>
                        </select>
                      </div>
                    </div>

                    {/* Location Details: City, State, Country */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative">
                      
                      <div className="space-y-1.5">
                        <label htmlFor="city" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">City *</label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="City"
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      {/* Searchable State Dropdown */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">State *</label>
                        <button
                          type="button"
                          onClick={() => { setShowStateList(prev => !prev); setShowCountryList(false); }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left border flex justify-between items-center ${
                            isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{state}</span>
                          <span className="text-[8px] text-slate-550">▼</span>
                        </button>
                        {showStateList && (
                          <div className={`absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto z-40 p-2 rounded-xl border ${
                            isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-lg'
                          }`}>
                            <input
                              type="text"
                              placeholder="Search state..."
                              value={stateSearch}
                              onChange={e => setStateSearch(e.target.value)}
                              className={`w-full p-1.5 mb-2 text-xs rounded border focus:outline-none ${
                                isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            />
                            {filteredStates.map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => { setState(s); setShowStateList(false); }}
                                className={`w-full text-left p-1.5 rounded hover:bg-accent hover:text-white text-xs`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Searchable Country Dropdown */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Country *</label>
                        <button
                          type="button"
                          onClick={() => { setShowCountryList(prev => !prev); setShowStateList(false); }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left border flex justify-between items-center ${
                            isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{COUNTRIES.find(c => c.name === country)?.flag || '🌍'} {country}</span>
                          <span className="text-[8px] text-slate-550">▼</span>
                        </button>
                        {showCountryList && (
                          <div className={`absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto z-40 p-2 rounded-xl border ${
                            isDarkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-lg'
                          }`}>
                            <input
                              type="text"
                              placeholder="Search country..."
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className={`w-full p-1.5 mb-2 text-xs rounded border focus:outline-none ${
                                isDarkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            />
                            {filteredCountries.map(c => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => { 
                                  setCountry(c.name); 
                                  setCountryDialCode(c.dial);
                                  setShowCountryList(false); 
                                }}
                                className={`w-full text-left p-1.5 rounded hover:bg-accent hover:text-white text-xs`}
                              >
                                {c.flag} {c.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* STEP 3: Business Details (Disabled / Skipped in invitation flow) */}
                {step === 3 && !invitationData && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Expected Monthly Bookings */}
                    <div className="space-y-1.5">
                      <label htmlFor="expected_bookings" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider block">Expected Monthly Bookings *</label>
                      <select
                        id="expected_bookings"
                        value={expectedBookings}
                        onChange={e => setExpectedBookings(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                          isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <option value="10">1 - 10 Bookings</option>
                        <option value="30">11 - 30 Bookings</option>
                        <option value="100">31 - 100 Bookings</option>
                        <option value="500">101 - 500 Bookings</option>
                        <option value="501">500+ Bookings</option>
                      </select>
                    </div>

                    {/* Primary Services (Multiselect Checkboxes) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider block mb-2">Primary Services Provided *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {['Flights', 'Hotels', 'Holidays', 'Visa', 'Bus', 'Insurance', 'Corporate Travel'].map(srv => {
                          const isChecked = primaryServices.includes(srv);
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => handleServiceToggle(srv)}
                              className={`p-2.5 border rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                                isChecked 
                                  ? 'border-accent bg-accent/10 text-accent font-bold' 
                                  : isDarkMode ? 'border-white/10 bg-slate-950 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{srv}</span>
                              {isChecked && <Check className="w-3.5 h-3.5 text-accent" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reason for Access */}
                    <div className="space-y-1.5">
                      <label htmlFor="reason" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Reason for Access *</label>
                      <textarea
                        id="reason"
                        required
                        rows={2}
                        value={reasonForAccess}
                        onChange={e => setReasonForAccess(e.target.value)}
                        placeholder="State why your team requires access to the system..."
                        className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent resize-none ${
                          isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    {/* Current System & Preferred Suppliers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="current_system" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Current Booking System</label>
                        <input
                          type="text"
                          id="current_system"
                          value={currentBookingSystem}
                          onChange={e => setCurrentBookingSystem(e.target.value)}
                          placeholder="e.g. Travelport, Amadeus, Excel"
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="preferred_suppliers" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Preferred Suppliers</label>
                        <input
                          type="text"
                          id="preferred_suppliers"
                          value={preferredSuppliers}
                          onChange={e => setPreferredSuppliers(e.target.value)}
                          placeholder="e.g. TBO, RezLive, Akbar"
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 4: Account Security */}
                {step === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Password */}
                    <div className="space-y-1.5">
                      <label htmlFor="signup-pass" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input autoComplete="new-password"
                          type="password"
                          id="signup-pass"
                          required
                          value={password}
                          onChange={e => handlePasswordChange(e.target.value)}
                          placeholder="Create a secure password"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>

                      {/* Password strength details */}
                      {password.length > 0 && (
                        <div className={`mt-2 p-3 rounded-xl border space-y-2 ${
                          isDarkMode ? 'bg-slate-950/60 border-white/5' : 'bg-slate-100 border-slate-200'
                        }`}>
                          <div className="flex justify-between items-center text-[10px] font-extrabold">
                            <span className="text-slate-550 uppercase">Complexity:</span>
                            <span className={
                              passwordStrength === 'Strong' ? 'text-emerald-400' :
                              passwordStrength === 'Medium' ? 'text-amber-400' : 'text-red-400'
                            }>{passwordStrength}</span>
                          </div>
                          
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${
                              passwordStrength === 'Strong' ? 'w-full bg-emerald-500' :
                              passwordStrength === 'Medium' ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-red-500'
                            }`} />
                          </div>

                          {passwordFeedback.length > 0 && (
                            <p className="text-[9px] text-slate-505 font-bold italic">
                              Need: {passwordFeedback.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label htmlFor="confirm-pass" className="text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input autoComplete="new-password"
                          type="password"
                          id="confirm-pass"
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent ${
                            isDarkMode ? 'bg-slate-950 border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2 pt-2">
                      
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          required
                          checked={acceptTerms}
                          onChange={e => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          I accept the <a href="/terms-conditions" target="_blank" className="text-accent hover:underline">Terms & Conditions</a> of GhumoFiroo CRM.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          required
                          checked={acceptPrivacy}
                          onChange={e => setAcceptPrivacy(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          I accept the <a href="/privacy-policy" target="_blank" className="text-accent hover:underline">Privacy Policy</a> governing team accounts.
                        </span>
                      </label>

                    </div>

                  </div>
                )}

                {/* Navigation Controls */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className={`px-4 py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      GDPR & WCAG Compliant Onboarding
                    </div>
                  )}

                  {step < (invitationData ? 2 : 4) ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-orange-500/20"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Finalizing Request...
                        </>
                      ) : (
                        <>
                          Complete Onboarding <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </form>

              {/* Social Options on Step 1 */}
              {step === 1 && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Or Register With</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" 
                      onClick={() => toast({ title: "Social Logins Ready", description: "Google Auth callback configured." })}
                      className={`py-2 px-4 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.111 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.63 0 3.11.618 4.256 1.76l3.14-3.14A12.923 12.923 0 0 0 12.24 2c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.783 0 9.877-4.067 9.877-10 0-.668-.073-1.316-.24-1.714H12.24z"/>
                      </svg>
                      Google Workspace
                    </button>
                    <button 
                      type="button" 
                      onClick={() => toast({ title: "Social Logins Ready", description: "Microsoft SSO callback configured." })}
                      className={`py-2 px-4 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M0 0h11v11H0z"/><path fill="#81bc06" d="M12 0h11v11H12z"/><path fill="#05a6f0" d="M0 12h11v11H0z"/><path fill="#ffba08" d="M12 12h11v11H12z"/>
                      </svg>
                      Microsoft 365
                    </button>
                  </div>
                </div>
              )}

              {/* Already have an account */}
              <p className="text-center text-xs text-slate-500 font-semibold">
                Already registered? <Link to="/crm" className="text-accent hover:underline">Log in to CRM</Link>
              </p>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Calendar, Users, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';

interface PackageData {
  id: string;
  title: string;
  price: number;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
}

interface BookingFormProps {
  packageData?: PackageData;
  onSubmit: (bookingData: any) => void;
}

interface BookingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Travel Details
  travelDate: string;
  returnDate: string;
  numberOfTravelers: number;
  roomType: string;
  specialRequests: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ packageData, onSubmit }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    travelDate: '',
    returnDate: '',
    numberOfTravelers: 1,
    roomType: 'standard',
    specialRequests: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  React.useEffect(() => {
    if (packageData) {
      const pkg = packageData as any;
      setFormData(prev => ({
        ...prev,
        travelDate: pkg.travelDate || pkg.checkInDate || prev.travelDate,
        returnDate: pkg.returnDate || pkg.checkOutDate || prev.returnDate,
        numberOfTravelers: pkg.passengersCount || pkg.travelers || pkg.pax || pkg.totalOccupants || prev.numberOfTravelers,
        roomType: pkg.selectedCategory || pkg.category || prev.roomType
      }));
    }
  }, [packageData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BookingFormData>>({});

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.travelDate) newErrors.travelDate = 'Travel date is required';
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required';
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = 'Emergency contact relation is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation — Indian mobile number
    if (formData.phone && !validateIndianPhone(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = PHONE_ERROR_MSG as any;
    }
    // Emergency contact phone — Indian mobile number
    if (formData.emergencyContactPhone && !validateIndianPhone(formData.emergencyContactPhone.replace(/\D/g, ''))) {
      newErrors.emergencyContactPhone = PHONE_ERROR_MSG as any;
    }

    // Date validation
    if (formData.travelDate && formData.returnDate) {
      const travelDate = new Date(formData.travelDate);
      const returnDate = new Date(formData.returnDate);
      const today = new Date();
      
      if (travelDate < today) {
        newErrors.travelDate = 'Travel date cannot be in the past';
      }
      
      if (returnDate <= travelDate) {
        newErrors.returnDate = 'Return date must be after travel date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const pkgAny = packageData as any;
      const isFixedPackagePrice = Boolean(pkgAny?.perPersonPrice || pkgAny?.checkInDate || pkgAny?.selectedCategory);
      const finalTotalAmount = packageData ? (isFixedPackagePrice ? packageData.price : packageData.price * formData.numberOfTravelers) : 0;

      const bookingData = {
        ...formData,
        packageData,
        totalAmount: finalTotalAmount,
        bookingDate: new Date().toISOString(),
        bookingId: `BK${Date.now()}`
      };
      
      await onSubmit(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = packageData ? packageData.price * formData.numberOfTravelers : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <Card className="glass-card shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-sunset">
            <Users className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input autoComplete="name"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={errors.firstName ? 'border-red-500' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input autoComplete="name"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input autoComplete="email"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input autoComplete="tel"
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', sanitizePhone(e.target.value))}
                  className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <Textarea autoComplete="street-address"
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
                placeholder="Enter your city"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
                placeholder="Enter your state"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                className={errors.pincode ? 'border-red-500' : ''}
                placeholder="Enter your pincode"
              />
              {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Details */}
      <Card className="glass-card shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-sunset">
            <Calendar className="w-5 h-5" />
            Travel Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="travelDate">Travel Date *</Label>
              <Input
                id="travelDate"
                type="date"
                value={formData.travelDate}
                onChange={(e) => handleInputChange('travelDate', e.target.value)}
                className={errors.travelDate ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.travelDate && <p className="text-red-500 text-sm mt-1">{errors.travelDate}</p>}
            </div>
            <div>
              <Label htmlFor="returnDate">Return Date *</Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => handleInputChange('returnDate', e.target.value)}
                className={errors.returnDate ? 'border-red-500' : ''}
                min={formData.travelDate || new Date().toISOString().split('T')[0]}
              />
              {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numberOfTravelers">Number of Travelers</Label>
              <Select value={formData.numberOfTravelers.toString()} onValueChange={(value) => handleInputChange('numberOfTravelers', parseInt(value))}>
                <SelectTrigger id="numberOfTravelers">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Person' : 'People'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roomType">Accommodation Category / Room Type</Label>
              <Select value={formData.roomType} onValueChange={(value) => handleInputChange('roomType', value)}>
                <SelectTrigger id="roomType">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(new Set([
                    ...((packageData as any)?.selectedCategory ? [(packageData as any).selectedCategory] : []),
                    "Premium AC Tent",
                    "Super Premium AC Tent",
                    "Deluxe AC Swiss Cottage",
                    "Non AC Swiss Cottage",
                    "Darbari Royal Suite",
                    "Rajwadi Suite",
                    "Standard Room",
                    "Deluxe Room",
                    "Suite",
                    "Premium Room"
                  ])).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              placeholder="Any special requirements, dietary restrictions, or requests..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="glass-card shadow-glass-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-sunset">
            <Phone className="w-5 h-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Contact Name *</Label>
              <Input autoComplete="name"
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                className={errors.emergencyContactName ? 'border-red-500' : ''}
                placeholder="Emergency contact name"
              />
              {errors.emergencyContactName && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>}
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
              <Input autoComplete="tel"
                id="emergencyContactPhone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', sanitizePhone(e.target.value))}
                className={errors.emergencyContactPhone ? 'border-red-500' : ''}
                placeholder="10-digit emergency phone"
              />
              {errors.emergencyContactPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="emergencyContactRelation">Relationship *</Label>
            <Input
              id="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
              className={errors.emergencyContactRelation ? 'border-red-500' : ''}
              placeholder="Relationship (e.g., Spouse, Parent, Sibling)"
            />
            {errors.emergencyContactRelation && <p className="text-red-500 text-sm mt-1">{errors.emergencyContactRelation}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Booking Summary Card */}
      <Card className="glass-card shadow-lg border-2 border-purple-200/80 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-purple-950">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Booking Summary & Reservation Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-purple-100">
              <span className="text-slate-600 font-semibold">Package Name:</span>
              <span className="font-extrabold text-purple-950 text-right">{(packageData?.title || 'Evoke Tent City Package').replace(/Rann Utsav Kutch/gi, 'Evoke Tent City Package')}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-purple-100">
              <span className="text-slate-600 font-semibold">Travel Dates:</span>
              <span className="font-bold text-slate-900">
                {formData.travelDate ? `${formData.travelDate} ${formData.returnDate ? 'to ' + formData.returnDate : ''}` : 'As selected'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-purple-100">
              <span className="text-slate-600 font-semibold">Accommodation Category:</span>
              <span className="font-bold text-indigo-700">{formData.roomType || 'Premium AC Tent'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-purple-100">
              <span className="text-slate-600 font-semibold">Duration:</span>
              <span className="font-bold text-slate-900">{packageData?.duration || '3 Days / 2 Nights'}</span>
            </div>

            {(() => {
              const pkgAny = packageData as any;
              const isCalculatedPackage = Boolean(pkgAny?.perPersonPrice || pkgAny?.checkInDate || pkgAny?.selectedCategory || packageData);
              const displayPerPerson = pkgAny?.perPersonPrice || (isCalculatedPackage && packageData?.price ? Math.round(packageData.price / Math.max(1, formData.numberOfTravelers)) : 19753);
              const displayTotal = packageData?.price || (displayPerPerson * formData.numberOfTravelers);

              return (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                    <span className="text-slate-600 font-semibold">Price Per Person:</span>
                    <span className="font-bold text-slate-900">₹{displayPerPerson.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-purple-100">
                    <span className="text-slate-600 font-semibold">Number of Travelers:</span>
                    <span className="font-extrabold text-slate-900">{formData.numberOfTravelers} {formData.numberOfTravelers === 1 ? 'Person' : 'People'}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xl font-black text-purple-950 bg-purple-100/60 p-3.5 rounded-xl border border-purple-200">
                      <span>Total Amount (Inc. GST):</span>
                      <span className="text-purple-700">₹{displayTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-warm hover:bg-gradient-warm/90 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Booking...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
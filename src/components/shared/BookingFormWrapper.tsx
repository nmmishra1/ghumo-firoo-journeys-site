import * as React from "react"
import { useState, useEffect } from "react"
import BookingForm from "../BookingForm"
import { SectionHeading } from "../ui/SectionHeading"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PackageData {
  id: string
  title: string
  price: number
  duration: string
  image: string
  description: string
  highlights: string[]
}

interface BookingFormWrapperProps {
  packageData?: PackageData
  onSubmit?: (bookingData: any) => void
  title?: string
  subtitle?: string
}

type CheckoutStatus = 'idle' | 'creating_lead' | 'opening_payment' | 'redirecting_payu' | 'error'

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend'

export function BookingFormWrapper({
  packageData,
  onSubmit,
  title = "Secure Your Bespoke Journey",
  subtitle = "Complete the details below to request a booking slot. Our dedicated travel expert will coordinate your bespoke itinerary."
}: BookingFormWrapperProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<CheckoutStatus>('idle')
  const [resolvedPackageData, setResolvedPackageData] = useState<PackageData | undefined>(packageData)

  // Dynamically resolve package details from database if not passed explicitly as a prop
  useEffect(() => {
    if (packageData) {
      setResolvedPackageData(packageData)
      return
    }

    const path = window.location.pathname
    const slug = path.split('/').pop() || ''
    if (!slug || slug === 'packages') return

    fetch(`${API_BASE}/packages.php`)
      .then((r) => r.json())
      .then((pkgs) => {
        if (Array.isArray(pkgs)) {
          const pkg = pkgs.find((p: any) => p.slug === slug)
          if (pkg) {
            setResolvedPackageData({
              id: pkg.id || slug,
              title: pkg.package_name || pkg.title || 'Tour Package',
              price: Number(pkg.price) || Number(pkg.package_price) || 30000,
              duration: pkg.duration || '5 Days / 4 Nights',
              image: pkg.image_url || '',
              description: pkg.description || '',
              highlights: Array.isArray(pkg.highlights) ? pkg.highlights : []
            })
            return
          }
        }
        fallbackPkg(slug)
      })
      .catch((err) => {
        console.error('Error fetching package details:', err)
        fallbackPkg(slug)
      })
  }, [packageData])

  const fallbackPkg = (slug: string) => {
    const prettyTitle = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    setResolvedPackageData({
      id: slug,
      title: prettyTitle,
      price: 30000,
      duration: '5 Days / 4 Nights',
      image: '',
      description: '',
      highlights: []
    })
  }

  const handleBookingSubmit = async (formData: any) => {
    try {
      const activePkg = resolvedPackageData
      const totalAmount = activePkg ? activePkg.price * (formData.numberOfTravelers || 1) : 0

      // Stage 1: Create lead (public endpoint, no auth needed)
      setStatus('creating_lead')
      const leadRes = await fetch(`${API_BASE}/leads_create_public.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          package_name: activePkg?.title || '',
          package_price: activePkg?.price || 0,
          adult_count: formData.numberOfTravelers || 1,
          child_count: 0,
          travel_date: formData.travelDate,
          notes: formData.specialRequests || '',
          source: 'Website - Enquire Now Modal',
          touchpoint: 'Enquire Now Modal',
          page_url: window.location.href,
          referrer: document.referrer,
          website_hp: '',
          utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'website',
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'organic',
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || null
        })
      })

      if (!leadRes.ok) {
        throw new Error('Failed to submit booking inquiry')
      }

      const leadData = await leadRes.json()
      if (!leadData.lead_id) throw new Error('Could not create booking')
      const leadId = leadData.lead_id

      // Stage 2: Try Razorpay
      try {
        setStatus('opening_payment')
        const orderRes = await fetch(`${API_BASE}/razorpay_create_order.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount * 100, // paise
            currency: 'INR',
            receipt: `GF-${leadId}-${Date.now()}`,
            notes: {
              lead_id: leadId,
              package: activePkg?.title,
              email: formData.email
            }
          })
        })

        if (!orderRes.ok) {
          throw new Error('Razorpay order creation failed')
        }

        const order = await orderRes.json()

        // Open Razorpay modal
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'GhumoFiroo Travels',
          description: activePkg?.title || 'Tour Package',
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#C9A25A' }, // luxury gold
          handler: async (response: any) => {
            // Verify payment
            await fetch(`${API_BASE}/razorpay_verify.php`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                lead_id: leadId,
                amount: totalAmount,
                remarks: activePkg?.title || 'Tour Package',
                email: formData.email,
                phone: formData.phone,
                name: `${formData.firstName} ${formData.lastName}`
              })
            })
            // Redirect to thank you
            window.location.href =
              `/thank-you?ref=GF-${order.id}&pkg=` +
              encodeURIComponent(activePkg?.title || '') +
              `&gateway=razorpay`
          },
          modal: {
            ondismiss: () => {
              setStatus('idle')
              toast({
                title: 'Payment Cancelled',
                description: 'Your booking was not completed.',
                variant: 'destructive'
              })
            }
          }
        })
        rzp.open()

      } catch (razorpayError) {
        // Stage 3: PayU fallback
        console.warn('Razorpay failed, falling back to PayU:', razorpayError)
        setStatus('redirecting_payu')

        const hashRes = await fetch(`${API_BASE}/payu_generate_hash.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            productinfo: activePkg?.title || 'Tour Package',
            firstname: formData.firstName,
            email: formData.email,
            phone: formData.phone,
            lead_id: leadId,
            purpose: 'Tour Package Booking'
          })
        })

        if (!hashRes.ok) {
          throw new Error('PayU hash generation failed')
        }

        const hashData = await hashRes.json()

        // PayU requires form POST (not fetch)
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = 'https://secure.payu.in/_payment'
        
        // Add all required PayU fields as hidden inputs
        const fields = {
          key: hashData.key,
          txnid: hashData.txnid,
          amount: hashData.amount,
          productinfo: hashData.productinfo,
          firstname: hashData.firstname,
          email: hashData.email,
          phone: hashData.phone,
          surl: hashData.surl,
          furl: hashData.furl,
          hash: hashData.hash,
          udf1: leadId,
          udf2: activePkg?.title || ''
        }

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(value)
          form.appendChild(input)
        })

        document.body.appendChild(form)
        form.submit()
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setStatus('idle')
      toast({
        title: 'Booking Failed',
        description: err.message || 'An error occurred during booking. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 relative">
      <SectionHeading
        kicker="Reservations"
        title={title}
        subtitle={subtitle}
        align="center"
        className="mx-auto"
      />

      {status !== 'idle' && (
        <div className="absolute inset-0 bg-[#0B1026]/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-luxury-xl border border-[#C9A25A]/25">
          <Loader2 className="w-12 h-12 text-[#C9A25A] animate-spin mb-4" />
          <p className="text-[#C9A25A] font-semibold text-lg animate-pulse">
            {status === 'creating_lead' && 'Setting up your booking...'}
            {status === 'opening_payment' && 'Opening payment window...'}
            {status === 'redirecting_payu' && 'Redirecting to payment page...'}
          </p>
        </div>
      )}
      
      <div className="bg-[#0B1026] text-white p-1 sm:p-2 rounded-luxury-xl border border-[#C9A25A]/25 shadow-luxury-lg overflow-hidden">
        <div className="bg-[#1A2342]/40 backdrop-blur-md rounded-luxury-lg p-3 sm:p-6">
          <BookingForm packageData={resolvedPackageData} onSubmit={handleBookingSubmit} />
        </div>
      </div>
    </div>
  )
}

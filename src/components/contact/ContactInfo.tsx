
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const ContactInfo = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Office Address</h3>
              <p className="text-gray-600 leading-relaxed">
                Ghumo Firoo Travels<br />
                Shop No. 210, 2nd Floor, Pratap Complex<br />
                Metro Gate Number 3, near Munirka<br />
                Baba Gangnath Market, Munirka<br />
                New Delhi, Delhi 110067
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <div className="space-y-1">
                <a href="tel:+919910987264" className="text-gray-600 hover:text-orange-600 transition-colors block">
                  +91 9910987264
                </a>
                <a href="tel:+919870229792" className="text-gray-600 hover:text-orange-600 transition-colors block">
                  +91 9870229792
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <a href="mailto:info@ghumofiroo.com" className="text-gray-600 hover:text-orange-600 transition-colors">
                info@ghumofiroo.com
              </a>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600">
                Monday - Saturday: 9:00 AM - 6:00 PM<br />
                Sunday: 10:00 AM - 4:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/ghumofirootravels" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" rel="noopener noreferrer" className="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.334-1.297C3.334 14.24 2.29 11.494 2.29 8.449s1.044-5.791 2.825-7.242c.886-.807 2.037-1.297 3.334-1.297s2.448.49 3.334 1.297c1.781 1.451 2.825 4.197 2.825 7.242s-1.044 5.791-2.825 7.242c-.886.807-2.037 1.297-3.334 1.297z"/>
              </svg>
            </a>
            <a href="https://x.com/GhumoFiroo" target="_blank" rel="noopener noreferrer" className="bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@ghumofirootravels" target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Google Map */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Find Us Here</h3>
        </div>
        <div className="w-full h-64">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.4000000000005!2d77.1877!3d28.5562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1d6e7e7e7e7e%3A0x0!2sMunirka%2C%20New%20Delhi%2C%20Delhi%20110067%2C%20India!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;

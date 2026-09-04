import { Mail, MapPin, Phone } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
      <p className="mt-2 text-gray-600">Get in touch with Sahid Hospital</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card title="Hospital Address">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <p className="font-medium">Sahid Hospital</p>
              <p className="text-sm text-gray-500">Baneshwor, Kathmandu</p>
              <p className="text-sm text-gray-500">Bagmati Province, Nepal</p>
            </div>
          </div>
        </Card>
        <Card title="Phone">
          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <p className="font-medium">+977-1-4221111</p>
              <p className="text-sm text-gray-500">Emergency: +977-1-4221199</p>
            </div>
          </div>
        </Card>
        <Card title="Email">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <p className="font-medium">info@sahidhospital.gov.np</p>
              <p className="text-sm text-gray-500">appointments@sahidhospital.gov.np</p>
            </div>
          </div>
        </Card>
        <Card title="Operating Hours">
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">OPD:</span> 8:00 AM – 5:00 PM (Sun–Fri)</p>
            <p><span className="font-medium">Emergency:</span> 24/7</p>
            <p><span className="font-medium">Online Booking:</span> 24/7</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

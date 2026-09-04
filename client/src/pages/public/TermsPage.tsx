export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <div className="prose prose-gray mt-8 max-w-none text-gray-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
        <p>By using the Sahid Hospital Appointment System, you agree to these terms of service.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">2. Use of Service</h2>
        <p>This system is provided for booking medical appointments at Sahid Hospital. Users must provide accurate information when registering and booking.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">3. Appointments</h2>
        <p>Booked appointments are subject to doctor availability. The hospital reserves the right to cancel or reschedule appointments when necessary.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">4. Cancellation Policy</h2>
        <p>Patients may cancel or reschedule appointments up to 2 hours before the scheduled time through the online portal.</p>
      </div>
    </div>
  );
}

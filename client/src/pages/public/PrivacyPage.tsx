export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <div className="prose prose-gray mt-8 max-w-none text-gray-600">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Information We Collect</h2>
        <p>We collect personal information including name, email, phone number, and health-related appointment data when you register and use our services.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">How We Use Your Information</h2>
        <p>Your information is used solely for appointment management, communication about your appointments, and improving our healthcare services.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Data Security</h2>
        <p>We implement industry-standard security measures including encrypted connections, secure password hashing, and access controls to protect your data.</p>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Contact</h2>
        <p>For privacy concerns, contact us at privacy@sahidhospital.gov.np</p>
      </div>
    </div>
  );
}

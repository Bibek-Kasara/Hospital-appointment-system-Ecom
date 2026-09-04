export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">About Sahid Hospital</h1>
      <div className="prose prose-gray mt-8 max-w-none">
        <p className="text-lg text-gray-600">
          Sahid Hospital is a premier government healthcare institution dedicated to providing accessible, affordable, and quality medical services to citizens of Nepal.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Our Mission</h2>
        <p className="text-gray-600">
          To deliver comprehensive healthcare services through modern facilities, skilled medical professionals, and patient-centered care, ensuring every citizen has access to quality treatment.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Our Vision</h2>
        <p className="text-gray-600">
          To be the leading government hospital in Nepal, recognized for excellence in patient care, medical education, and community health initiatives.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Why Choose Us</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-600">
          <li>Experienced doctors across 6+ departments</li>
          <li>Modern diagnostic and treatment facilities</li>
          <li>Affordable healthcare for all citizens</li>
          <li>Online appointment system for convenience</li>
          <li>24/7 emergency services</li>
        </ul>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I book an appointment?',
    a: 'Register as a patient, log in, and use the "Book Appointment" feature. Select a department, doctor, available time slot, and confirm your booking.',
  },
  {
    q: 'Can I cancel or reschedule my appointment?',
    a: 'Yes. Go to "My Appointments" and use the reschedule or cancel options. Changes must be made at least 2 hours before the scheduled time.',
  },
  {
    q: 'Is there a fee for online booking?',
    a: 'No, online booking is free. Standard consultation fees apply at the hospital as per government rates.',
  },
  {
    q: 'What if I miss my appointment?',
    a: 'Missed appointments may be marked as "no-show". Please cancel in advance if you cannot attend so the slot can be offered to others.',
  },
  {
    q: 'How do doctors manage their schedule?',
    a: 'Doctors log in to the Doctor Portal to create availability slots, view appointments, and update appointment statuses.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Yes. We use encrypted connections and secure authentication. Your data is stored securely and never shared with third parties.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
      <p className="mt-2 text-gray-600">Find answers to common questions about our appointment system.</p>

      <div className="mt-8 space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white">
            <button
              className="flex w-full items-center justify-between px-4 py-4 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium text-gray-900">{faq.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

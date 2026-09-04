import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Shield, Users, ArrowRight, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';
import { departmentApi } from '../../services';
import type { Department } from '../../types';

export default function HomePage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    departmentApi.list({ limit: '50' }).then(({ data }) => {
      if (data.success && data.data) setDepartments(data.data.items);
    });
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-linear-to-br from-primary-900 via-primary-800 to-teal-600 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className=" flex justify-around relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl mt-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Quality Healthcare, One Click Away
            </h1>
            <p className="mt-6 text-lg text-primary-100">
              Book appointments at Sahid Hospital online. Skip the queue, choose your doctor, and manage your healthcare from anywhere.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/patient/book">
                <Button size="lg" className=" hover:bg-blue-1000 text-black">
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Button>
              </Link>
              <Link to="/doctors">
                <Button size="lg" variant="outline" className="border-white bg-white">
                  Find a Doctor
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <div>
            <img className="w-120 rounded-2xl shadow-2xl" src="https://cdn.prod.website-files.com/689a445c4e3d16df02592b60/689a445c4e3d16df02592d61_alpha-gaenetic-counseling.webp" alt="" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, title: 'Easy Booking', desc: 'Book in 4 simple steps online' },
            { icon: Clock, title: 'Real-time Slots', desc: 'See available times instantly' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected' },
            { icon: Users, title: 'Expert Doctors', desc: 'Experienced specialists' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Our Departments</h2>
          <p className="mt-2 text-gray-600">Comprehensive healthcare across multiple specialties</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Link
                key={dept._id}
                to={`/doctors?department=${dept._id}`}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="font-medium text-gray-900">{dept.name}</h3>
                <p className="mt-1 text-sm text-primary-600">View details →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <Bell className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Hospital Notice</h3>
              <p className="mt-1 text-sm text-amber-800">
                Online appointment booking is now available 24/7. Walk-in patients are also welcome during operating hours (8 AM – 5 PM, Sunday–Friday).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

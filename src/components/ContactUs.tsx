import { Header } from './Header';
import { Footer } from './Footer';
import { Mail, Phone } from 'lucide-react';

export function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-blue-200 mb-8">We’re here to help. Reach out using the channels below.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <Mail className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Email</p>
            <a href="mailto:harsh.ramchandani122003@gmail.com" className="text-blue-200 hover:text-white">harsh.ramchandani122003@gmail.com</a>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <Phone className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Support Hours</p>
            <p className="text-blue-200">Mon–Fri, 9:00–18:00 IST</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
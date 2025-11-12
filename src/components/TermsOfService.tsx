import { Header } from './Header';
import { Footer } from './Footer';
import { FileText } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-blue-200 mb-6">Please read these terms carefully before using the IT Support Portal.</p>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2"><FileText className="w-5 h-5" /> Acceptance</h2>
          <p className="text-blue-200">By accessing or using the portal, you agree to these terms and all applicable policies.</p>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2">Use of Service</h2>
          <p className="text-blue-200">You agree not to misuse the service, attempt unauthorized access, or submit unlawful content.</p>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2">Limitation of Liability</h2>
          <p className="text-blue-200">The service is provided “as is”. We are not liable for indirect damages arising from use.</p>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2">Changes</h2>
          <p className="text-blue-200">We may update these terms. Continued use constitutes acceptance of changes.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
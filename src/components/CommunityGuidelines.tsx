import { Header } from './Header';
import { Footer } from './Footer';
import { } from 'lucide-react';

export function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-3">Community Guidelines</h1>
        <p className="text-blue-200 mb-8">Help us keep the portal respectful, secure, and effective.</p>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Guiding Principles</h2>
          <ul className="space-y-3 text-blue-200 list-disc list-inside">
            <li>Be respectful and professional in all submissions.</li>
            <li>Do not share sensitive credentials or personal data in requests.</li>
            <li>Report suspicious activity to administrators immediately.</li>
            <li>Use clear, concise language describing your issue.</li>
          </ul>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Enforcement</h2>
          <p className="text-blue-200">Violations may result in restricted access. Severe cases may be escalated to security teams.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
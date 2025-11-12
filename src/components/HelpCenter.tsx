import { Header } from './Header';
import { Footer } from './Footer';
import { Headphones, Search, MessageCircle } from 'lucide-react';

export function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-3">Help Center</h1>
        <p className="text-blue-200 mb-8">Find answers to common questions or submit a support request.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <Search className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Getting Started</p>
            <p className="text-sm text-blue-200">How to create an account and submit your first request.</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <Headphones className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Request Types</p>
            <p className="text-sm text-blue-200">Password resets, access requests, and software installations.</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <MessageCircle className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Contact Support</p>
            <p className="text-sm text-blue-200">Reach out if you need help beyond the portal.</p>
          </div>
        </div>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">FAQs</h2>
          <ul className="space-y-3 text-blue-200">
            <li><span className="font-semibold text-white">How long do requests take?</span> Most requests are reviewed within one business day. Automated actions may resolve faster.</li>
            <li><span className="font-semibold text-white">How do I track my request?</span> Sign in to view your tickets and status updates.</li>
            <li><span className="font-semibold text-white">What if my request is escalated?</span> An administrator will review and follow up with resolution notes.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
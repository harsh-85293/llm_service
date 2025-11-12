import { Header } from './Header';
import { Footer } from './Footer';
import { Shield, Lock, CheckCircle } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-blue-200 mb-6">Your privacy is important to us. Learn how we collect, use, and protect your information.</p>
        <p className="text-xs text-blue-300 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <Lock className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Your Data</p>
            <p className="text-sm text-blue-200">We only collect what's necessary for platform functionality.</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <Shield className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Your Control</p>
            <p className="text-sm text-blue-200">You can view, edit, or delete your data anytime.</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-5">
            <CheckCircle className="w-5 h-5 text-cyan-300 mb-2" />
            <p className="font-semibold">Our Promise</p>
            <p className="text-sm text-blue-200">We never sell your personal information to third parties.</p>
          </div>
        </div>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <p className="text-blue-200">Account details such as name, email, and login timestamps; request content submitted to the support portal; technical logs for security and reliability.</p>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <p className="text-blue-200">To operate the portal, analyze and route support requests, provide audit trails, and improve service quality.</p>
        </section>

        <section className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
          <p className="text-blue-200">You may request access, correction, or deletion of your data by contacting support. Authentication is required to fulfill requests securely.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
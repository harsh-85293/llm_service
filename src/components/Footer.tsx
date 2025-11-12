import { Headphones, Mail, FileText, Shield, User, MessageCircle, Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">IT Support Portal</h3>
            </div>
            <p className="text-blue-200 mb-6 leading-relaxed">
              The premier AI-powered platform for IT teams to automate support requests, streamline workflows, and deliver exceptional service.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-blue-200 mb-3 font-medium">Stay Connected</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                <button className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <FileText className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <MessageCircle className="w-4 h-4" />
                  <span>Support Requests</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <span>Community Guidelines</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors group">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all"></div>
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-blue-200 text-sm">
              © 2025 IT Support Portal. All rights reserved. Made with <span className="text-red-400">♥</span> for IT teams everywhere.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-blue-200 text-sm">Connect with us:</span>
              <div className="flex gap-3">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all hover:scale-110"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all hover:scale-110"
                >
                  <Github className="w-5 h-5 text-white" />
                </a>
                <a
                  href="mailto:support@example.com"
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-all hover:scale-110"
                >
                  <Mail className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

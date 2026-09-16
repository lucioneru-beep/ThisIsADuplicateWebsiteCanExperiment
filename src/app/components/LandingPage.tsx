import { Button } from './ui/button';
import { Users, Shield, Package } from 'lucide-react';
import logo from 'figma:asset/3aeb9913c81471bc07d44be8f9b378f03ef97e23.png';

interface LandingPageProps {
  onSelectUserMode: () => void;
  onSelectAdminMode: () => void;
}

export function LandingPage({ onSelectUserMode, onSelectAdminMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src={logo} alt="Wonderzyme" className="h-16 sm:h-20" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Wonderzyme Inventory System
          </h1>
          <p className="text-gray-400 text-lg">
            Sample Management & Request Platform
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client/User Card */}
          <button
            onClick={onSelectUserMode}
            className="bg-[#2d2d2d] border-2 border-gray-700 hover:border-[#2d8659] rounded-xl p-8 text-center transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#2d8659]/20 p-6 rounded-full group-hover:bg-[#2d8659]/30 transition-colors">
                <Users className="w-16 h-16 text-[#2d8659]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Client Portal</h2>
            <p className="text-gray-400 mb-6">
              Submit sample requests instantly - no login required
            </p>
            <div className="flex items-center justify-center gap-2 text-[#2d8659] font-semibold">
              <Package className="w-5 h-5" />
              <span>Quick Access</span>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={onSelectAdminMode}
            className="bg-[#2d2d2d] border-2 border-gray-700 hover:border-[#2d8659] rounded-xl p-8 text-center transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#2d8659]/20 p-6 rounded-full group-hover:bg-[#2d8659]/30 transition-colors">
                <Shield className="w-16 h-16 text-[#2d8659]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Admin Dashboard</h2>
            <p className="text-gray-400 mb-6">
              Manage inventory, requests, and system settings
            </p>
            <div className="flex items-center justify-center gap-2 text-[#2d8659] font-semibold">
              <Shield className="w-5 h-5" />
              <span>Secure Login</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            © 2026 Wonderzyme. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Developed by Dale Catibog
          </p>
        </div>
      </div>
    </div>
  );
}
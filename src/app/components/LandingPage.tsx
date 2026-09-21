import { Users, Shield, Package, Zap } from 'lucide-react';
import { NexaBoxLogo } from './NexaBoxLogo';

interface LandingPageProps {
  onSelectUserMode: () => void;
  onSelectAdminMode: () => void;
}

export function LandingPage({ onSelectUserMode, onSelectAdminMode }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#08090e] flex flex-col">
      {/* Demo Banner */}
      <div className="bg-violet-600 text-white text-center text-sm font-medium py-2 px-4" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
        PORTFOLIO DEMO — fully interactive, no data is saved
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Logo + Title */}
        <div className="mb-14 text-center">
          <div className="flex justify-center mb-8">
            <NexaBoxLogo size="xl" />
          </div>
          <p className="text-[#475569] text-sm tracking-[0.25em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Electronics &amp; Smart Home Distribution
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
          {/* Client Portal */}
          <button
            onClick={onSelectUserMode}
            className="group relative bg-[#141824] border border-[#1e2433] hover:border-[#f97316]/60 rounded-lg p-8 text-left transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-[#f97316]/10 border border-[#f97316]/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#f97316]/20 transition-colors">
                <Users className="w-6 h-6 text-[#f97316]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                CLIENT PORTAL
              </h2>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                Browse the product catalog and submit purchase orders — no login required.
              </p>
              <div className="flex items-center gap-2 text-[#f97316] text-sm font-medium">
                <Package className="w-4 h-4" />
                <span>Quick access</span>
                <span className="ml-auto text-[#1e2433] group-hover:text-[#f97316] transition-colors">→</span>
              </div>
            </div>
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={onSelectAdminMode}
            className="group relative bg-[#141824] border border-[#1e2433] hover:border-[#f97316]/60 rounded-lg p-8 text-left transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 bg-[#f97316]/10 border border-[#f97316]/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#f97316]/20 transition-colors">
                <Shield className="w-6 h-6 text-[#f97316]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.05em' }}>
                ADMIN DASHBOARD
              </h2>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                Manage inventory, review purchase orders, and configure system settings.
              </p>
              <div className="flex items-center gap-2 text-[#f97316] text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Open dashboard</span>
                <span className="ml-auto text-[#1e2433] group-hover:text-[#f97316] transition-colors">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-y-2">
          <p className="text-[#334155] text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
            © 2026 NEXABOX · Developed by Dale Catibog
          </p>
          <p className="text-[#2a3040] text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em' }}>
            This layout is based on a real inventory system built for{' '}
            <span className="text-[#3d4f6a]">Wonderzyme</span>
            {' '}— rebranded here as a portfolio demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}

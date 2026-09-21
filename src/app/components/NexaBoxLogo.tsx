interface NexaBoxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function NexaBoxLogo({ size = 'md', className = '' }: NexaBoxLogoProps) {
  const configs = {
    sm:  { mark: 'w-7 h-7 text-sm',   name: 'text-base', sub: 'text-[9px]',  gap: 'gap-2' },
    md:  { mark: 'w-9 h-9 text-sm',   name: 'text-lg',   sub: 'text-[10px]', gap: 'gap-2.5' },
    lg:  { mark: 'w-12 h-12 text-base', name: 'text-2xl', sub: 'text-[11px]', gap: 'gap-3' },
    xl:  { mark: 'w-16 h-16 text-xl', name: 'text-4xl',  sub: 'text-xs',     gap: 'gap-4' },
  };
  const c = configs[size];

  return (
    <div className={`flex items-center ${c.gap} ${className}`}>
      {/* Mark */}
      <div
        className={`${c.mark} bg-[#f97316] flex items-center justify-center flex-shrink-0`}
        style={{ borderRadius: '3px', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}
      >
        <span className="text-[#08090e] leading-none" style={{ letterSpacing: '-0.02em' }}>NX</span>
      </div>
      {/* Wordmark */}
      <div className="flex flex-col leading-none gap-0.5">
        <span
          className={`${c.name} font-extrabold text-white leading-none`}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.12em' }}
        >
          NEXABOX
        </span>
        <span
          className={`${c.sub} text-[#475569] leading-none uppercase`}
          style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}
        >
          Distribution
        </span>
      </div>
    </div>
  );
}

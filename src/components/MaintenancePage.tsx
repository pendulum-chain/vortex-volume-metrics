import { useState, useEffect } from 'react';

export function MaintenancePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [gearRotation, setGearRotation] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate gear rotation
    const interval = setInterval(() => {
      setGearRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 md:p-12 shadow-xl border border-blue-100 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Decorative floating shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Animated icon */}
        <div className="relative mb-8">
          {/* Outer glow ring */}
          <div className="absolute inset-0 animate-ping bg-blue-400/20 rounded-full" style={{ animationDuration: '3s' }} />
          
          {/* Main icon container */}
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-300/50">
            {/* Rotating gear */}
            <svg 
              className="w-16 h-16 text-white/90" 
              style={{ transform: `rotate(${gearRotation}deg)` }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
            </svg>
            
            {/* Small wrench accent */}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Main heading */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent mb-4">
          We're Crunching The Numbers!
        </h2>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
          Our metrics dashboard is getting a fresh makeover. <br className="hidden md:block" />
          We're upgrading our charts to bring you even better insights.
        </p>
        
        {/* Animated progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Work in progress
          </span>
        </div>
        
        {/* Sparkle decoration */}
        <div className="absolute top-8 right-8 text-blue-300 animate-pulse" style={{ animationDuration: '2s' }}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L9,9L1,12L9,15L12,23L15,15L23,12L15,9L12,1Z" />
          </svg>
        </div>
        <div className="absolute bottom-16 left-8 text-indigo-300 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L9,9L1,12L9,15L12,23L15,15L23,12L15,9L12,1Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

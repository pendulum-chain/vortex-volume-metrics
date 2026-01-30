import logo from '../assets/blue.svg';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100">
      <div className="container mx-auto p-4">
        <div className="gap-2 mb-4">
          <img src={logo} alt="Vortex Logo" />
          <h1 className="ml-0.5 font-bold text-blue-800 uppercase">Ramp Volume</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

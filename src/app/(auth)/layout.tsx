export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-brand-gradient bg-clip-text text-transparent">
            Smake
          </h1>
          <p className="text-white/40 text-sm mt-1">Bergen mat, delt.</p>
        </div>
        {children}
      </div>
    </div>
  );
}

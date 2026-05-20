export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-600 tracking-tight">Smake</h1>
          <p className="text-gray-500 text-sm mt-1">Bergen mat, delt.</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-[#fafafa]">
            TG FUN HUB
          </h1>
          <p className="text-sm text-[#a3a3a3] dark:text-[#525252] mt-1">
            Connect, share, and discover
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

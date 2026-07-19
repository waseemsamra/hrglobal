import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Portal Login | CareerHub",
};

export default function AdminLoginPage() {
  return (
    <div className="mesh-gradient min-h-screen flex flex-col items-center justify-between">
      {/* Header / Brand Anchor */}
      <header className="w-full flex justify-center pt-margin-desktop px-margin-mobile">
        <div className="flex items-center gap-stack-unit">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-secondary-fixed">
            <span className="material-symbols-outlined text-headline-md" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <span className="text-title-md font-title-md font-black text-on-surface tracking-tight">HR Management</span>
        </div>
      </header>

      <AdminLoginForm />

      {/* Footer / Legal Section */}
      <footer className="w-full py-margin-mobile px-margin-mobile border-t border-outline-variant bg-surface">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-gutter">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">
              Terms of Service
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors" href="#">
              Security Disclosure
            </a>
          </div>
          <div className="text-right">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              © 2024 Kinetic Enterprise Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Background Decoration */}
      <div className="fixed top-0 right-0 w-1/2 h-screen -z-10 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-secondary-fixed opacity-10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}


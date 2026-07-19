import Header from "@/components/Header";
import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  return (
    <>
      <Header />

      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-stack-lg pb-24 md:pb-32 px-container-padding-mobile md:px-container-padding-desktop">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            {/* Content Left */}
            <div className="lg:col-span-7 space-y-stack-lg z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded-full">
                <span className="material-symbols-outlined text-[18px]">public</span>
                <span className="text-label-md">Trusted by 2,500+ global enterprises</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                Empower Careers. <br />
                <span className="text-secondary">Sync Your World.</span>
              </h1>
              <p className="text-body-md text-on-surface-variant max-w-xl leading-relaxed">
                Unified HR management designed for the modern era. From local payroll compliance to
                international talent mobility, manage your entire workforce on a single, secure
                infrastructure.
              </p>
              <div className="flex flex-wrap gap-stack-md pt-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full text-secondary">
                    <span className="material-symbols-outlined">verified_user</span>
                  </span>
                  <div>
                    <p className="text-label-md font-bold">ISO 27001 Certified</p>
                    <p className="text-body-sm text-on-surface-variant">Global Security Standards</p>
                  </div>
                </div>
                <div className="w-px h-12 bg-outline-variant hidden sm:block"></div>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full text-secondary">
                    <span className="material-symbols-outlined">language</span>
                  </span>
                  <div>
                    <p className="text-label-md font-bold">140+ Countries</p>
                    <p className="text-body-sm text-on-surface-variant">Native Compliance Support</p>
                  </div>
                </div>
              </div>
              {/* Trust Badges */}
              <div className="pt-8 opacity-60 flex flex-wrap gap-8 items-center">
                <span className="text-label-md font-black tracking-widest uppercase">Acme Corp</span>
                <span className="text-label-md font-black tracking-widest uppercase">Globex</span>
                <span className="text-label-md font-black tracking-widest uppercase">Soylent</span>
                <span className="text-label-md font-black tracking-widest uppercase">Initech</span>
              </div>
            </div>

            {/* Registration Form Card */}
            <RegistrationForm />
          </div>

          {/* Background Decorative Element */}
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-secondary-fixed/30 rounded-full blur-[120px] -z-10"></div>
          <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] bg-surface-container-high/40 rounded-full blur-[100px] -z-10"></div>
        </section>

        {/* Dynamic Bento Grid Section */}
        <section className="py-stack-lg px-container-padding-mobile md:px-container-padding-desktop bg-surface">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-headline-lg font-headline-lg">Systematic Excellence</h2>
              <p className="text-body-md text-on-surface-variant">
                Built for precision-driven HR departments worldwide.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
              {/* Bento Item 1 */}
              <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col md:flex-row items-center gap-gutter overflow-hidden relative group">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-secondary-fixed text-secondary flex items-center justify-center rounded-lg">
                    <span className="material-symbols-outlined">account_balance</span>
                  </div>
                  <h3 className="text-title-md font-title-md">Global Payroll Engine</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    Automated tax withholding and native currency disbursements in 140+ countries.
                    Compliance is built into the code.
                  </p>
                </div>
                <div className="flex-1 w-full h-full min-h-[160px] relative rounded-lg border border-outline-variant overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    alt="Global payroll dashboard on a world map"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxyvAQRWvYFxGatACh6V7rNV0SxAxgCCDdhWUTnVdgnfNa-agWPpXq8D6fG4auiwWdcsPuTMkg6gJRChwkQpyx66Uid6LhFMA_R4DdKC68QleFsknlbfbEmVcK8HQf1CWrbqnZaG4oCF11ymkRyXAjPOZ7qysTRNBt_hzyhzDuaGAOeH2XuxfR58-dd0lm9cYSERZAxYZa8JZ7mOvH8U37rCxBGFhzf1k6toDby5IF7iB_oKXJTRyD6q0xaHVqn3XzgT8boK24R1Bv"
                  />
                </div>
              </div>

              {/* Bento Item 2 */}
              <div className="md:col-span-4 bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-between overflow-hidden relative">
                <div className="space-y-4">
                  <h3 className="text-title-md font-title-md">Smart Compliance</h3>
                  <p className="text-body-sm text-on-primary-container">
                    Real-time alerts for local labor law changes and regulatory updates.
                  </p>
                </div>
                <div className="flex justify-end">
                  <span className="material-symbols-outlined text-[120px] opacity-10 absolute -bottom-4 -right-4">
                    gavel
                  </span>
                  <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-md hover:brightness-110 transition-all">
                    View Docs
                  </button>
                </div>
              </div>

              {/* Bento Item 3 */}
              <div className="md:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-8 space-y-4">
                <div className="w-12 h-12 bg-secondary/10 text-secondary flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <h3 className="text-title-md font-title-md">Talent Lifecycle</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Manage from hire to retire with a seamless employee record system.
                </p>
              </div>

              {/* Bento Item 4 */}
              <div className="md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-4">
                <div className="w-12 h-12 bg-on-primary-fixed-variant/10 text-primary flex items-center justify-center rounded-lg">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <h3 className="text-title-md font-title-md">People Analytics</h3>
                <p className="text-body-sm text-on-surface-variant">
                  Turn workforce data into strategic insights with AI-driven reporting.
                </p>
              </div>

              {/* Bento Item 5 */}
              <div className="md:col-span-4 bg-surface-container-high border border-outline-variant rounded-xl p-8 flex flex-col justify-center gap-4 relative overflow-hidden group">
                <div
                  className="absolute inset-0 opacity-10 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvDh1sDBDfMpZ7-OfRC4EtdOVZkqSfhbPxndxgrmmmG5r4PxDEk8WusB2MTt3G95Mn1xttVqROWjHR8ifFLoUSWPxuexjVSEQ0L1LmuYbFi8dD_ek2mHqqFSXVNzbtQ4HFfWx48J0t7D7EGfCEeW_8wd0y7emNMZ8TTZulxwzGGkqlOSwH3-5V6is4U8_QGz88psWxsf3csLr2yBkreq5TdijheAA_i1CEbJ8R8VTvU2f4cbP3kd8xfEG_VkP8_s1MTGjCyTLuMgCn')",
                  }}
                ></div>
                <h3 className="text-title-md font-title-md z-10">Enterprise Security</h3>
                <p className="text-body-sm text-on-surface-variant z-10">
                  SOC2 Type II, GDPR, and HIPAA compliant infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-container-padding-desktop">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter text-center">
              <div className="space-y-2">
                <p className="text-[40px] font-bold text-secondary">99.99%</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest">
                  Uptime SLA
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[40px] font-bold text-secondary">$24B+</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest">
                  Payroll Managed
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[40px] font-bold text-secondary">2M+</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest">
                  Employees Synced
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[40px] font-bold text-secondary">15min</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest">
                  Avg Support Time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-on-primary py-16 px-container-padding-desktop border-t border-outline">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <span className="text-title-md font-title-md font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">corporate_fare</span>
                CareerHub
              </span>
              <p className="text-body-sm text-on-tertiary-container">
                The modern operating system for global workforce management. Built for reliability,
                transparency, and growth.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-label-md font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-body-sm text-on-tertiary-container">
                <li><a className="hover:text-secondary transition-colors" href="#">Global Payroll</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Recruiting</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Onboarding</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Performance</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-label-md font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-body-sm text-on-tertiary-container">
                <li><a className="hover:text-secondary transition-colors" href="#">Documentation</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">API Reference</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Compliance Guide</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Security Center</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-label-md font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-body-sm text-on-tertiary-container">
                <li><a className="hover:text-secondary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Contact</a></li>
                <li><a className="hover:text-secondary transition-colors" href="#">Legal</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-on-tertiary-fixed-variant flex flex-col md:flex-row justify-between items-center gap-4 text-on-tertiary-container text-body-sm">
            <p>© 2024 Kinetic Enterprise HR Solutions. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-white" href="#">Privacy</a>
              <a className="hover:text-white" href="#">Terms</a>
              <a className="hover:text-white" href="#">Cookies</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Contextual FAB for Support */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </>
  );
}

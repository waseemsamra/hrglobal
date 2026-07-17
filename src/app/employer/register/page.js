import EmployerRegisterForm from "@/components/EmployerRegisterForm";
import { getOrgName } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const org = await getOrgName();
  return { title: `${org} — Employer Registration` };
}

export default async function EmployerRegisterPage() {
  const orgName = await getOrgName();

  return (
    <main className="min-h-screen w-full flex bg-background text-on-surface">
      {/* Left: Branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(19, 27, 46, 0.82) 0%, rgba(0, 0, 0, 0.45) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXlyKBdCfmA11MU2c0c2BZKbth0AARxzxU4g_mAzvAw77Q0z1aub9d_yCARe0EtoERnGc4TcdjHOVrtnNgAy5TXdgm6ZSVGBhZT1bj-EEGOeyUAH6t33cJeaDgd2TP5_lU5cvZ-gZ7XYGWYgjrS9yg7sosZCJr_0_MS1mvpllRwvyNncEpXQ1ny9k82BfiwYMlDcW6Bg5QF82fc3RwE4jPXqYX8oL6lj_EF0JIizMl1Pylsb2BI02nDV5n-xTaCnie6e513Gse729a')",
          }}
        />
        <div className="relative z-20 flex flex-col justify-between p-margin-desktop w-full text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-fixed rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-fixed text-[24px]">
                  dine_in
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl tracking-tighter">{orgName}</h1>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="font-headline-xl text-headline-xl mb-4">
              Hire the Best Talent, Faster.
            </h2>
            <p className="font-body-lg text-body-lg text-surface-variant opacity-90">
              Join hundreds of companies posting jobs and managing candidates through one powerful
              platform. Register your company to get started.
            </p>
            <div className="mt-12 flex gap-8">
              <div>
                <div className="text-secondary-fixed font-headline-lg text-headline-lg">500+</div>
                <div className="text-label-sm uppercase tracking-widest opacity-70">Enterprises</div>
              </div>
              <div>
                <div className="text-secondary-fixed font-headline-lg text-headline-lg">10k+</div>
                <div className="text-label-sm uppercase tracking-widest opacity-70">Candidates</div>
              </div>
              <div>
                <div className="text-secondary-fixed font-headline-lg text-headline-lg">24/7</div>
                <div className="text-label-sm uppercase tracking-widest opacity-70">Support</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-label-sm opacity-50">
            <span>
              © {new Date().getFullYear()} {orgName} Solutions. All rights reserved.
            </span>
          </div>
        </div>
      </div>

      {/* Right: Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface overflow-y-auto">
        <EmployerRegisterForm orgName={orgName} />
      </div>
    </main>
  );
}

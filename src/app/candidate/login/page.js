import { Suspense } from "react";
import CandidateLoginForm from "@/components/CandidateLoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CareerHub | Candidate Login",
};

export default function CandidateLoginPage() {
  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row">
      {/* Left Side: Visual / Branding */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary-container">
        <div
          className="absolute inset-0 z-0 opacity-80 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACZ5xVTMoFpcJl3BhKDeKgDWhIojnQL6zLdjiZdrUe8mmfBd5zTegpy_7oN7oSDYtWqy5TVaex-QK_aitV46gM0u7ZQmZbY4JwGyecb9g94fCeWesFbdU9pjQp7pHWNY_qnGpiqRNRaqnH1qRX66GQ6pPAvml3lxYkXc7Sf3gJ0K78bAELiu6BpsjoWIIDI4T7J8ETsB-E-vf3RHU-h64mNVe9pPN2zeezmsErocOSWvoG4KQ1gSmXFgNwuC0br_XRuBEpiB87vPPU')",
          }}
        />
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-margin-desktop bg-gradient-to-b from-primary-container/20 to-primary-container/80 text-white">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-white tracking-tight">CareerHub</h1>
            <p className="mt-4 font-body-lg text-body-lg text-primary-fixed opacity-90 max-w-md">
              Empowering your professional journey with precision-engineered tools and
              institutional-grade opportunities.
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p className="font-headline-md text-headline-md">Track Your Progress</p>
                <p className="font-body-md text-body-md text-primary-fixed/80">
                  Real-time application status and analytics.
                </p>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10">
              <blockquote className="italic font-body-md text-body-md text-white/70">
                &quot;The most seamless application experience I&apos;ve had in my decade-long career in
                engineering.&quot;
              </blockquote>
              <p className="mt-2 font-label-md text-label-md text-secondary-fixed">
                — Sarah Jenkins, Senior UI Lead
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center bg-surface p-margin-mobile md:p-margin-desktop">
        <Suspense fallback={<div className="text-on-surface-variant">Loading…</div>}>
          <CandidateLoginForm />
        </Suspense>
      </section>
    </main>
  );
}

export default function TopNav({ title = "Dashboard" }) {
  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-container-padding-desktop">
      <div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-full border border-outline-variant focus:ring-2 focus:ring-secondary focus:border-transparent text-body-sm"
            placeholder="Search applications..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant">
            search
          </span>
        </div>
        <div className="flex items-center gap-4 border-l border-outline-variant pl-6">
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <div className="flex items-center gap-3 ml-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full h-full object-cover"
                alt="HR executive avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmJ5iCUmSuE-ZOvbiOsjb1FuvB12oD7qhadQ98FtRCYIVl8qpPy-82bvO8rXyOgp79ugji6LdJx2A_eGsHG3rYMGjU3VP-Mx-EJ57uw9dBSPHOV2sp8uQw3XjP-TNRe3sei77UV0JZ3QnL666Zgp62cLeAgl5PM7ng2CZJ8Si3L6ti9Oyv50iV0IDixPctfVuRVxkERP2SD_VKP_SInypypqqGYPJN0x8UVDWP3l3E5C2q2OQHog2TEWp8yr7efpWUD1gmRjVgxaer"
              />
            </div>
            <span className="text-label-md font-label-md font-bold text-on-surface">Alex Rivera</span>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';

const Testimonials = () => {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Trusted by Professionals and Patients</h2>
          <p className="mt-6 text-lg text-text-muted-light dark:text-text-muted-dark sm:text-xl">See what our users have to say about OralVis.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-border-light bg-white p-8 dark:border-border-dark dark:bg-gray-800/20">
            <p className="flex-grow text-text-muted-light dark:text-text-muted-dark">"OralVis has transformed how I manage my patient records. It's secure, intuitive, and saves me hours every week. A must-have for any modern dental practice."</p>
            <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border-light dark:border-border-dark">
              <img className="h-12 w-12 rounded-full" data-alt="User photo of Dr. Sarah Chen" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4QL89X6cKvNT2pphd9s0a-OVPhxXm5u7G418coS6YFMJWCmMKgGUclgDQxhG0TkhoTJpGDo87F2b77fsk8OIt3wx1U13LNbT6vdZbuynsuTEHvIXJDR0YNNu79Hv_AxorjS68KO7dt0g1uK7Pz2W9bEBqAyKkmI-8iZ1Ql_BAw2KjNM8Y8wYvcgCo2ltLwSTSTXfv24cRAL11RaZeuKGJtqf5JIIDNtmExfGyyfX9_yekaLVv5OjqfWYqLw-FMCDCyDlNpMRuLZA" alt="Dr. Sarah Chen" />
              <div>
                <p className="font-bold">Dr. Sarah Chen</p>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Dental Surgeon</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-xl border border-border-light bg-white p-8 dark:border-border-dark dark:bg-gray-800/20">
            <p className="flex-grow text-text-muted-light dark:text-text-muted-dark">"As a patient, having all my dental history in one place is incredibly empowering. I can easily share my records with specialists without any hassle. Highly recommended!"</p>
            <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border-light dark:border-border-dark">
              <img className="h-12 w-12 rounded-full" data-alt="User photo of Mark Robinson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6bTgdBKPrwg3RIPfxcTvv47gL_Iv9PsccGjlHyB4BL3BHpi5yRjfOi5d2PpjPk_Ko-OnfiO3lASQGF77a8AYAYoC1wDUJXZC9xGMcKzsfjpw5N1Xu1kk5elclS-tI6FS1uRGq4WyKEKLZAVa0rkdnKNg3LZ9pyNhOIU5VaKXb5zLp8ChL_uCyyj3p5RO3gmWXOsgSSX471ipPKtB8EgX-hTkU9kchUtbfjXOcQ2gE3c_MYlINnPLNlgSm0Mhlw7mCoz1cIZlUvaQ" alt="Mark Robinson" />
              <div>
                <p className="font-bold">Mark Robinson</p>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Patient</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-xl border border-border-light bg-white p-8 dark:border-border-dark dark:bg-gray-800/20 md:col-span-2 lg:col-span-1">
            <p className="flex-grow text-text-muted-light dark:text-text-muted-dark">"The visual analysis tools are a game-changer for patient education. Showing them their progress visually builds trust and improves treatment adherence."</p>
            <div className="mt-6 flex items-center gap-4 pt-6 border-t border-border-light dark:border-border-dark">
              <img className="h-12 w-12 rounded-full" data-alt="User photo of Dr. Emily Rodriguez" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX09Sv17se314_LDbl4Tb_cEeFVeB2eeHQORhVa7XpscZQTH32EoM4xm71-M_i4EUQDS07Qy6nrhkBii5y7_MLCJN1fR4W0aPwRoYIN3btpsMPRWmGaiPICb6YCpciP6PC9jrGAziN8M9QaQi46SW1qiiWAz8l4M0hb0VWv_L8NtyDUHf-PqjHiBny73o-JHQTyD5raI80VIjnt4zfLwJZTMzfF9vcmu_Nfwu_9Q5i3JxHrieffMx0dAagwSa8cDM9WAchADE_w9k" alt="Dr. Emily Rodriguez" />
              <div>
                <p className="font-bold">Dr. Emily Rodriguez</p>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Orthodontist</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-base text-text-muted-light dark:text-text-muted-dark">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">shield_lock</span>
            <span>Data Encrypted</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">health_and_safety</span>
            <span>HIPAA-Aligned</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-accent">cloud_done</span>
            <span>Secure Cloud</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

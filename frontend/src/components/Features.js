import React from 'react';

const Features = () => {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Unlock the Power of OralVis</h2>
          <p className="mt-6 text-lg text-text-muted-light dark:text-text-muted-dark sm:text-xl">Our platform is designed to provide you with secure, intuitive, and powerful tools for managing your oral health records.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-border-dark dark:bg-gray-800/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">photo_camera</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Multi-View Imaging</h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Capture a complete picture of your oral health with our guided 3-angle submission system (Upper, Lower, Frontal).</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-border-dark dark:bg-gray-800/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">draw</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Precision Annotation</h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Expert analysis that pinpoints issues with sub-millimeter accuracy using our advanced visual annotation engine.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-border-dark dark:bg-gray-800/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">description</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Instant Reports</h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Transform complex visual data into easy-to-understand, professional PDF clinical reports instantly.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-border-dark dark:bg-gray-800/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Secure Portal</h3>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Track your case status in real-time and access your complete dental history in a secure, private dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

import React from 'react';

const HowItWorks = () => {
  return (
    <section className="bg-white py-24 dark:bg-gray-900/50 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Get Started in 3 Simple Steps</h2>
          <p className="mt-6 text-lg text-text-muted-light dark:text-text-muted-dark sm:text-xl">A streamlined workflow to manage your oral health with ease and confidence.</p>
        </div>
        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="absolute left-1/2 top-8 hidden h-0.5 w-3/4 -translate-x-1/2 bg-border-light dark:bg-border-dark md:block"></div>
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-background-light text-2xl font-bold text-primary shadow-lg dark:bg-background-dark">1</div>
            <h3 className="text-xl font-bold">Upload</h3>
            <p className="text-base text-text-muted-light dark:text-text-muted-dark">Submit your dental images (Upper, Lower, Frontal) using our guided wizard.</p>
          </div>
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-background-light text-2xl font-bold text-primary shadow-lg dark:bg-background-dark">2</div>
            <h3 className="text-xl font-bold">Analyze</h3>
            <p className="text-base text-text-muted-light dark:text-text-muted-dark">Our system and specialists annotate your images for clinical insights.</p>
          </div>
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary bg-background-light text-2xl font-bold text-primary shadow-lg dark:bg-background-dark">3</div>
            <h3 className="text-xl font-bold">Results</h3>
            <p className="text-base text-text-muted-light dark:text-text-muted-dark">Download your detailed clinical report and treatment recommendations.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

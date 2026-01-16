import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 via-white to-sky-100 dark:from-cyan-900/10 dark:via-background-dark dark:to-sky-900/10"></div>
      <div className="container mx-auto flex flex-col items-center gap-12 px-4 text-center lg:flex-row lg:gap-16 lg:text-left">
        <div className="flex flex-col items-center gap-8 lg:w-1/2 lg:items-start">
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl lg:text-7xl">See Your<br />Oral Health<br />in a New Light</h1>
          <p className="max-w-xl text-lg text-text-muted-light dark:text-text-muted-dark sm:text-xl">Advanced dental imaging analysis at your fingertips. Upload your scans, receive precision clinical annotations, and track your health journey with professional-grade reports.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30">
              <span className="truncate">Get Started</span>
            </Link>
            <a href="#features" className="group flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg px-6 text-base font-bold text-primary transition-colors hover:bg-primary/5">
              <span className="truncate">Learn More</span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </a>
          </div>
        </div>
        <div className="relative lg:w-1/2">
          <div className="absolute -left-12 -top-12 z-0 h-32 w-32 rounded-full bg-accent/20 blur-3xl"></div>
          <div className="absolute -right-12 -bottom-12 z-0 h-32 w-32 rounded-full bg-sky-300/20 blur-3xl"></div>
          <img className="relative z-10 w-full max-w-lg rounded-xl shadow-2xl shadow-primary/20 dark:shadow-black/50" data-alt="A clean, modern user interface of the OralVis application dashboard shown on a computer screen." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2N_wGpu56XRo7Z33GKuH1sRKez9QAqK_yvTByS_Pvu1HHhoPwhNzhBR1IvsV7RCzgnA2Umq43cf2K_1uKWidr_py5z2efNnFsKqyajuTKNIAa4xDoqDy1BA68YBgW3YPKUI8P_iyokvs7SOinUsyBxgoTFNHE8ZYE79bQ4D1DI38J0-pM-QY5xDZYwTzSu9kATdn7JGJAARZ381h92MouZ1V6ANyMlP2-E6srVinC5yGJxC4tkOFRqcV6GOFq6w2CTlToWXqgYH4" alt="Dashboard Preview" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

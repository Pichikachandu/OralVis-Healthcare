import React from 'react';

const CTA = () => {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-cyan-600 px-8 py-20 text-center text-white shadow-xl">
          <div className="absolute inset-0 -z-0 opacity-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMyrS2Hfots_wRu0kMHts8fr9N9dqnH7vKtO2_6zbMpMhPCN5xO9Qpv_Y56Pk9rsOSj-aFqHY7ILZCh1YQj3uHgHeEcVAjTwzxeM2KxfOVKEryFm0DY5Ta7KhaWFkAfs_02JKrgCXuaBLZVyDVjmDWbcsZaqjKo8qUl6KEpAOtJspvhaaKw7TF0SMO2XGqK_VyanMM5wklWWL8TXxVf2MtUxDiig6pCxEGKL3WGtVcIS93sDX5HAyym1hJJXah6TwZ3MbI_3bz-HI')", backgroundSize: "cover" }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Start managing your oral health today.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100 sm:text-xl">Join thousands of professionals and patients who trust OralVis for secure and efficient dental record management.</p>
            <button className="mx-auto mt-10 flex h-14 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white px-8 text-lg font-bold text-primary shadow-lg transition-transform hover:scale-105">
              <span className="truncate">Create Free Account</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

import React from 'react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-slate-900 dark:bg-black text-slate-400">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 text-white">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
              </svg>
              <h2 className="text-xl font-bold">OralVis</h2>
            </div>
            <p className="mt-4 text-sm">Secure Oral Health Management.</p>
          </div>
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h4 className="font-bold text-white">Quick Links</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition-colors hover:text-white" href="#home">Home</a></li>
                  <li><a className="transition-colors hover:text-white" href="#features">Features</a></li>
                  <li><a className="transition-colors hover:text-white" href="#about">About Us</a></li>
                  <li><a className="transition-colors hover:text-white" href="#contact">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white">Legal</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition-colors hover:text-white" href="/">Privacy Policy</a></li>
                  <li><a className="transition-colors hover:text-white" href="/">Terms of Service</a></li>
                  <li><a className="transition-colors hover:text-white" href="/">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white">Contact</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition-colors hover:text-white" href="mailto:contact@oralvis.com">contact@oralvis.com</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm">
          <p>© 2025 OralVis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

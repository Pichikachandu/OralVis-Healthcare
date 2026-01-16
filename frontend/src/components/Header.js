import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light/80 dark:border-border-dark/80 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-3 text-primary dark:text-white">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
          </svg>
          <h2 className="text-xl font-bold tracking-tight">OralVis</h2>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <a className="text-sm font-medium text-text-muted-light transition-colors hover:text-primary dark:text-text-muted-dark dark:hover:text-white" href="#home">Home</a>
          <a className="text-sm font-medium text-text-muted-light transition-colors hover:text-primary dark:text-text-muted-dark dark:hover:text-white" href="#features">Features</a>
          <a className="text-sm font-medium text-text-muted-light transition-colors hover:text-primary dark:text-text-muted-dark dark:hover:text-white" href="#about">About</a>
          <a className="text-sm font-medium text-text-muted-light transition-colors hover:text-primary dark:text-text-muted-dark dark:hover:text-white" href="#contact">Contact</a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login" className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/5 dark:text-white dark:hover:bg-white/10">
            <span className="truncate">Login</span>
          </Link>
          <Link to="/register" className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
            <span className="truncate">Sign Up</span>
          </Link>
        </div>
        <button className="md:hidden">
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

import { Outlet, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

type PublicOutletContext = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export function PublicLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Outlet context={{ searchQuery, setSearchQuery } satisfies PublicOutletContext} />
      </main>
      <Footer />
    </div>
  );
}

export function usePublicSearch() {
  return useOutletContext<PublicOutletContext>();
}

import { lazy, Suspense } from 'react';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Gallery from './sections/Gallery.jsx';
import Archive from './sections/Archive.jsx';
import Events from './sections/Events.jsx';
import Activity from './sections/Activity.jsx';
import Booking from './sections/Booking.jsx';
import Footer from './sections/Footer.jsx';

const Admin = lazy(() => import('./sections/Admin.jsx'));
const SetupPassword = lazy(() => import('./sections/SetupPassword.jsx'));

function isAdminRoute() {
  return window.location.pathname.replace(/\/+$/, '') === '/admin';
}

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/auth/setup-password') {
    return <Suspense fallback={<main className="m4rq-admin-shell"><p role="status">A abrir a ativação…</p></main>}><SetupPassword /></Suspense>;
  }
  if (isAdminRoute()) {
    return (
      <Suspense fallback={<main className="m4rq-admin-shell"><p role="status">A abrir o editor…</p></main>}>
        <Admin />
      </Suspense>
    );
  }

  return (
    <>
      <Hero />
      {/* Everything below the hero. Scoped .m4rqx-* styles only — hero untouched. */}
      <main
        style={{
          position: 'relative',
          zIndex: 3,
          marginTop: '-52vh',
          fontFamily: "'Inter', sans-serif",
          color: '#f5f0e8',
          background:
            'linear-gradient(180deg, rgba(11,10,9,0) 0%, rgba(11,10,9,0.75) 14%, #0b0a09 30%, #0b0a09 100%)',
        }}
      >
        <About />
        <Gallery />
        <Archive />
        <Events />
        <Activity />
        <Booking />
        <Footer />
      </main>
    </>
  );
}

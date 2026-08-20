import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Gallery from './sections/Gallery.jsx';
import Archive from './sections/Archive.jsx';
import Events from './sections/Events.jsx';
import Booking from './sections/Booking.jsx';
import Footer from './sections/Footer.jsx';

export default function App() {
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
        <Booking />
        <Footer />
      </main>
    </>
  );
}

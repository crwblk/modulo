import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { PackageDetail } from './pages/PackageDetail';
import { Box, Activity, Globe } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/package/:name" element={<PackageDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="glass">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%' }}>
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Box size={24} />
              </div>
              <span>
                <span style={{ opacity: 0.5, fontWeight: 500 }}>crwblk / </span>
                modulo
              </span>
            </Link>
            
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <Link to="/" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={18} />
                Status
              </Link>
              <a href="https://github.com/crwblk/modulo" target="_blank" rel="noreferrer" className="text-muted" style={{ textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={18} />
                Github
              </a>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: 'calc(100vh - 80px - 200px)' }}>
          <AnimatedRoutes />
        </main>

        <footer>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="logo-icon" style={{ padding: '4px', opacity: 0.5 }}>
                <Box size={16} />
              </div>
            </div>
            <p className="text-muted" style={{ fontWeight: 600 }}>Modulo Registry</p>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} Open Source Registry Solution
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

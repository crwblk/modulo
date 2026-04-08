import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Calendar, ChevronRight, Search, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PackageSummary {
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
}

export function Home() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('/-/ui/packages')
      .then(res => {
        setPackages(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch packages:', err);
        setLoading(false);
      });
  }, []);

  const filteredPackages = useMemo(() => {
    if (!searchQuery) return packages;
    const lowerQuery = searchQuery.toLowerCase();
    return packages.filter(pkg => 
      pkg.name.toLowerCase().includes(lowerQuery) || 
      pkg.description.toLowerCase().includes(lowerQuery)
    );
  }, [packages, searchQuery]);

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <section className="hero">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Modulo Registry
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A lightweight, high-performance private npm registry for your modern development workflow.
        </motion.p>
        
        <motion.div 
          className="search-bar glass"
          initial={{ width: 320, opacity: 0 }}
          animate={{ width: 440, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          style={{ margin: '0 auto 3rem' }}
        >
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search your private packages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <motion.div 
          className="install-command glass"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'inline-flex', padding: '0.75rem 1.25rem', gap: '0.75rem' }}
        >
          <Terminal size={18} className="text-primary" />
          <code style={{ color: 'var(--text-main)' }}>npm config set registry http://localhost:4000</code>
        </motion.div>
      </section>

      <section className="package-list">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
            <Box size={28} className="text-primary" />
            Registry Packages
          </h2>
          <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {filteredPackages.length} {filteredPackages.length === 1 ? 'package' : 'packages'} found
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <Box size={40} className="text-muted" />
            </motion.div>
            <p className="text-muted">Fetching your registry data...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <motion.div 
            className="glass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '5rem', borderRadius: 'var(--radius)' }}
          >
            <p className="text-muted">No packages match your search or none have been published yet.</p>
            <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Run <code>npm publish</code> to see your modules here.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className="package-grid"
            layout
          >
            <AnimatePresence>
              {filteredPackages.map((pkg) => (
                <motion.div
                  key={pkg.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/package/${pkg.name}`} className="package-card glass">
                    <h3>{pkg.name}</h3>
                    <p>{pkg.description}</p>
                    <div className="package-meta">
                      <span className="badge">v{pkg.version}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} className="text-primary" />
                          {new Date(pkg.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <ChevronRight size={18} className="text-muted" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}

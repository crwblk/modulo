import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Box, Download, FileText, Globe, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { CopyButton } from '../components/CopyButton';

interface PackageVersion {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
  dist: {
    shasum: string;
    tarball: string;
  };
  engines?: Record<string, string>;
}

interface PackageMetadata {
  name: string;
  'dist-tags'?: Record<string, string>;
  versions?: Record<string, PackageVersion>;
  description?: string;
  readme?: string;
  homepage?: string;
  license?: string;
}

export function PackageDetail() {
  const { name } = useParams();
  const [metadata, setMetadata] = useState<PackageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/-/ui/package/${name}`)
      .then(res => {
        setMetadata(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch package detail:', err);
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Box size={40} className="text-muted" />
        </motion.div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>Package not found</h2>
        <Link to="/" className="text-primary">Back to Registry</Link>
      </div>
    );
  }

  const latestVersion = metadata['dist-tags']?.latest || Object.keys(metadata.versions || {}).pop();
  const versionData = latestVersion ? metadata.versions?.[latestVersion] : undefined;
  const readme = metadata.readme || 'No README provided for this package.';

  return (
    <motion.div 
      className="container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <header style={{ border: 'none', background: 'transparent', height: 'auto', padding: '2rem 0' }}>
        <Link to="/" className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} />
          Back to Packages
        </Link>
      </header>

      <section className="glass" style={{ borderRadius: 'var(--radius)', padding: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{metadata.name}</h1>
              <span className="badge">v{latestVersion}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px' }}>{metadata.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {metadata.homepage && (
              <a href={metadata.homepage} target="_blank" rel="noreferrer" className="btn-copy">
                <Globe size={18} />
                Website
              </a>
            )}
            <CopyButton text={`npm install ${metadata.name}`} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '4rem' }}>
          <div className="readme-container p-transition">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} className="text-primary" />
              README.md
            </h3>
            <div className="glass" style={{ padding: '2rem', borderRadius: '12px', background: 'var(--code-bg)', border: '1px solid var(--surface-border)' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                {readme}
              </pre>
            </div>
          </div>

          <aside>
            <div className="sidebar-item">
              <h4>Install Package</h4>
              <div className="install-command glass" style={{ padding: '1rem' }}>
                <code>npm i {metadata.name}</code>
                <CopyButton text={`npm install ${metadata.name}`} />
              </div>
            </div>

            <div className="sidebar-item">
              <h4>Statistics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <Download size={18} className="text-primary" />
                  <span className="text-muted">Direct Downloads</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>Local only</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <Clock size={18} className="text-primary" />
                  <span className="text-muted">Last Publish</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>Recently</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <ShieldCheck size={18} className="text-primary" />
                  <span className="text-muted">License</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{metadata.license || 'ISC'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <Cpu size={18} className="text-primary" />
                  <span className="text-muted">Node Version</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{versionData?.engines?.node || '>=18.0.0'}</span>
                </div>
              </div>
            </div>

            {versionData?.dependencies && (
              <div className="sidebar-item">
                <h4>Dependencies ({Object.keys(versionData.dependencies).length})</h4>
                <div className="glass" style={{ padding: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                  {Object.entries(versionData.dependencies).map(([dep, ver]) => (
                    <div key={dep} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--surface-border)' }}>
                      <span style={{ fontWeight: 600 }}>{dep}</span>
                      <span className="text-muted">{ver}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </motion.div>
  );
}

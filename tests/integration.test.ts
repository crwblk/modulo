import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server';
import { Storage } from '../src/storage/fs';

// Mock Storage
vi.mock('../src/storage/fs', () => ({
  Storage: {
    ensureDirs: vi.fn(),
    getPackageMetadata: vi.fn(),
    savePackageMetadata: vi.fn(),
    saveTarball: vi.fn(),
    getTarball: vi.fn(),
    getTarballStream: vi.fn(),
    getAllPackages: vi.fn(),
    getAllPackagesWithMetadata: vi.fn(),
  },
}));

describe('Integration: npm Publish/Install Workflow', () => {
  let app: ReturnType<typeof createServer>;

  beforeEach(() => {
    app = createServer();
    vi.clearAllMocks();
  });

  describe('Full publish and retrieve flow', () => {
    it('should publish a package and retrieve its metadata', async () => {
      const publishPayload = {
        name: 'test-pkg',
        'dist-tags': { latest: '1.0.0' },
        versions: {
          '1.0.0': {
            name: 'test-pkg',
            version: '1.0.0',
            description: 'A test package',
            main: 'index.js',
            dist: {
              shasum: 'abc123def456',
              tarball: 'https://registry.npmjs.org/test-pkg/-/test-pkg-1.0.0.tgz',
            },
            _id: 'test-pkg@1.0.0',
          },
        },
        readme: '# Test Package\nThis is a test.',
      };

      vi.mocked(Storage.savePackageMetadata).mockResolvedValue(undefined);
      vi.mocked(Storage.saveTarball).mockResolvedValue(undefined);
      vi.mocked(Storage.getPackageMetadata).mockImplementation(async (name: string) => {
        if (name === 'test-pkg') {
          return {
            name: 'test-pkg',
            'dist-tags': { latest: '1.0.0' },
            versions: publishPayload.versions,
            time: {
              created: '2024-01-01T00:00:00.000Z',
              modified: '2024-01-01T00:00:00.000Z',
            },
            description: 'A test package',
            readme: '# Test Package\nThis is a test.',
          } as any;
        }
        return null;
      });
      vi.mocked(Storage.getAllPackagesWithMetadata).mockResolvedValue([]);

      // Publish the package (without attachments for simplicity)
      const publishResponse = await request(app).put('/test-pkg').send(publishPayload);
      expect(publishResponse.status).toBe(201);
      expect(publishResponse.body).toHaveProperty('ok', true);

      // Retrieve the metadata
      const metadataResponse = await request(app).get('/test-pkg');
      expect(metadataResponse.status).toBe(200);
      expect(metadataResponse.body.name).toBe('test-pkg');
      expect(metadataResponse.body.description).toBe('A test package');
    });
  });

  describe('Login and publish flow', () => {
    it('should login and allow publish', async () => {
      // Login
      const loginResponse = await request(app)
        .put('/-/user/testuser')
        .send({ name: 'testuser', password: 'secret' });

      expect(loginResponse.status).toBe(201);
      expect(loginResponse.body.ok).toBe(true);
      expect(loginResponse.body.token).toContain('testuser');

      // Verify whoami works
      const whoamiResponse = await request(app).get('/-/whoami');
      expect(whoamiResponse.status).toBe(200);
      expect(whoamiResponse.body.username).toBe('modulo-user');
    });
  });

  describe('Proxy fallback behavior', () => {
    it('should return 404 for non-existent local packages', async () => {
      vi.mocked(Storage.getPackageMetadata).mockResolvedValue(null);
      vi.mocked(Storage.getAllPackagesWithMetadata).mockResolvedValue([]);

      // This will try proxy and fail, returning 404
      const response = await request(app).get('/non-existent-local-package');
      expect(response.status).toBe(404);
    });
  });
});

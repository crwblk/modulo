// Core types for npm package metadata

export interface PackageVersion {
  name: string;
  version: string;
  description?: string;
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  dist: DistMetadata;
  scripts?: Record<string, string>;
  engines?: Record<string, string>;
  gitHead?: string;
  _id: string;
  _nodeVersion?: string;
  _npmVersion?: string;
  readme?: string;
  readmeFilename?: string;
}

export interface DistMetadata {
  integrity?: string;
  shasum: string;
  tarball: string;
  fileCount?: number;
  unpackedSize?: number;
}

export interface PackageMetadata {
  _id?: string;
  _rev?: string;
  name: string;
  "dist-tags": DistTags;
  versions: Record<string, PackageVersion>;
  time: TimeMetadata;
  description?: string;
  keywords?: string[];
  homepage?: string;
  repository?: RepositoryMetadata;
  author?: AuthorMetadata | string;
  contributors?: (AuthorMetadata | string)[];
  license?: string;
  bugs?: BugsMetadata;
  readme?: string;
  readmeFilename?: string;
  maintainers?: AuthorMetadata[];
}

export interface DistTags {
  latest?: string;
  [key: string]: string | undefined;
}

export interface TimeMetadata {
  created: string;
  modified: string;
  [version: string]: string;
}

export interface RepositoryMetadata {
  type: string;
  url: string;
  directory?: string;
}

export interface AuthorMetadata {
  name: string;
  email?: string;
  url?: string;
}

export interface BugsMetadata {
  url?: string;
  email?: string;
}

// Request/Response types for publish payloads

export interface PublishAttachment {
  content_type: string;
  data: string; // base64 encoded
  length: number;
}

export interface PublishPayload {
  _id?: string;
  _rev?: string;
  name: string;
  "dist-tags"?: DistTags;
  versions: Record<string, PackageVersion>;
  _attachments?: Record<string, PublishAttachment>;
  description?: string;
  readme?: string;
  readmeFilename?: string;
  author?: AuthorMetadata | string;
  license?: string;
}

// UI response types

export interface PackageSummary {
  name: string;
  description: string;
  version: string;
  lastUpdated: string;
}

// Auth types

export interface AuthToken {
  token: string;
  ok: boolean;
}

export interface UserCredentials {
  name: string;
  password: string;
}

// TODO: Replace all mock data with real API calls

export type DeployStatus = 'live' | 'building' | 'failed' | 'sleeping';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: DeployStatus;
  region: string;
  framework: string;
  lastDeploy: string;
  deployments: number;
  branch: string;
  url: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  status: DeployStatus;
  branch: string;
  commit: string;
  commitMessage: string;
  duration: string;
  createdAt: string;
  triggeredBy: string;
}

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'api-gateway',
    description: 'Core API gateway service for microservices',
    status: 'live',
    region: 'US East',
    framework: 'Node.js',
    lastDeploy: '2 minutes ago',
    deployments: 147,
    branch: 'main',
    url: 'api-gateway.hostifer.io',
  },
  {
    id: 'proj-2',
    name: 'frontend-dashboard',
    description: 'React-based admin dashboard',
    status: 'building',
    region: 'EU West',
    framework: 'React',
    lastDeploy: '5 minutes ago',
    deployments: 89,
    branch: 'develop',
    url: 'dashboard.hostifer.io',
  },
  {
    id: 'proj-3',
    name: 'auth-service',
    description: 'Authentication and authorization microservice',
    status: 'live',
    region: 'US West',
    framework: 'Python',
    lastDeploy: '1 hour ago',
    deployments: 34,
    branch: 'main',
    url: 'auth.hostifer.io',
  },
  {
    id: 'proj-4',
    name: 'ml-pipeline',
    description: 'Machine learning data pipeline',
    status: 'failed',
    region: 'Asia Pacific',
    framework: 'Python',
    lastDeploy: '3 hours ago',
    deployments: 12,
    branch: 'feature/ml-v2',
    url: 'ml.hostifer.io',
  },
  {
    id: 'proj-5',
    name: 'static-website',
    description: 'Marketing landing page',
    status: 'sleeping',
    region: 'US East',
    framework: 'Next.js',
    lastDeploy: '2 days ago',
    deployments: 203,
    branch: 'main',
    url: 'www.hostifer.io',
  },
  {
    id: 'proj-6',
    name: 'postgres-db',
    description: 'Managed PostgreSQL database cluster',
    status: 'live',
    region: 'EU West',
    framework: 'PostgreSQL',
    lastDeploy: '5 days ago',
    deployments: 8,
    branch: 'main',
    url: 'db.hostifer.io',
  },
];

export const mockDeployments: Deployment[] = [
  {
    id: 'dep-1',
    projectId: 'proj-1',
    projectName: 'api-gateway',
    status: 'live',
    branch: 'main',
    commit: 'a3f2e1b',
    commitMessage: 'feat: add rate limiting middleware',
    duration: '1m 23s',
    createdAt: '2 minutes ago',
    triggeredBy: 'John Doe',
  },
  {
    id: 'dep-2',
    projectId: 'proj-2',
    projectName: 'frontend-dashboard',
    status: 'building',
    branch: 'develop',
    commit: 'c8d4e9f',
    commitMessage: 'chore: update dependencies',
    duration: '—',
    createdAt: '5 minutes ago',
    triggeredBy: 'CI/CD',
  },
  {
    id: 'dep-3',
    projectId: 'proj-3',
    projectName: 'auth-service',
    status: 'live',
    branch: 'main',
    commit: 'b5a1c2d',
    commitMessage: 'fix: OAuth token refresh bug',
    duration: '2m 05s',
    createdAt: '1 hour ago',
    triggeredBy: 'Jane Smith',
  },
  {
    id: 'dep-4',
    projectId: 'proj-4',
    projectName: 'ml-pipeline',
    status: 'failed',
    branch: 'feature/ml-v2',
    commit: 'f7e3g2h',
    commitMessage: 'feat: integrate new model training',
    duration: '8m 47s',
    createdAt: '3 hours ago',
    triggeredBy: 'CI/CD',
  },
  {
    id: 'dep-5',
    projectId: 'proj-1',
    projectName: 'api-gateway',
    status: 'live',
    branch: 'main',
    commit: 'e9b3c7d',
    commitMessage: 'perf: optimize database queries',
    duration: '1m 12s',
    createdAt: '6 hours ago',
    triggeredBy: 'John Doe',
  },
];

export const mockDeploymentLogs = [
  { time: '12:00:01', level: 'info', message: 'Starting deployment pipeline...' },
  { time: '12:00:02', level: 'info', message: 'Cloning repository: github.com/user/api-gateway' },
  { time: '12:00:05', level: 'info', message: 'Installing dependencies with npm install...' },
  { time: '12:00:18', level: 'info', message: 'Dependencies installed successfully (124 packages)' },
  { time: '12:00:19', level: 'info', message: 'Running build command: npm run build' },
  { time: '12:00:32', level: 'warn', message: 'Deprecation warning: crypto.hash is experimental' },
  { time: '12:00:45', level: 'info', message: 'Build completed successfully' },
  { time: '12:00:46', level: 'info', message: 'Creating Docker image...' },
  { time: '12:00:58', level: 'info', message: 'Docker image built: sha256:a3f2e1b...' },
  { time: '12:00:59', level: 'info', message: 'Pushing image to registry...' },
  { time: '12:01:08', level: 'info', message: 'Image pushed successfully' },
  { time: '12:01:09', level: 'info', message: 'Deploying to US-East-1...' },
  { time: '12:01:14', level: 'info', message: 'Health checks passing ✓' },
  { time: '12:01:15', level: 'info', message: 'Swapping traffic to new deployment...' },
  { time: '12:01:23', level: 'success', message: '🚀 Deployment successful! Live at api-gateway.hostifer.io' },
];

export const usageChartData = [
  { time: '10am', requests: 4200, bandwidth: 31 },
  { time: '11am', requests: 5800, bandwidth: 42 },
  { time: '12pm', requests: 7200, bandwidth: 58 },
  { time: '1pm', requests: 6100, bandwidth: 48 },
  { time: '2pm', requests: 8900, bandwidth: 72 },
  { time: '3pm', requests: 11200, bandwidth: 88 },
  { time: '4pm', requests: 9400, bandwidth: 76 },
  { time: '5pm', requests: 7800, bandwidth: 63 },
  { time: '6pm', requests: 6200, bandwidth: 51 },
  { time: '7pm', requests: 5100, bandwidth: 44 },
];

export const deploymentChartData = [
  { date: 'Mon', success: 12, failed: 1 },
  { date: 'Tue', success: 18, failed: 2 },
  { date: 'Wed', success: 9, failed: 0 },
  { date: 'Thu', success: 24, failed: 3 },
  { date: 'Fri', success: 16, failed: 1 },
  { date: 'Sat', success: 7, failed: 0 },
  { date: 'Sun', success: 5, failed: 1 },
];

export const resourcePieData = [
  { name: 'Compute', value: 45, color: '#0A4D9E' },
  { name: 'Storage', value: 25, color: '#22C55E' },
  { name: 'Bandwidth', value: 20, color: '#7C3AED' },
  { name: 'Database', value: 10, color: '#EAB308' },
];

#!/usr/bin/env node

const { execSync } = require('child_process');

const testSuites = {
  'all': 'npx playwright test',
  'minimal': 'npx playwright test minimal-ui-complete.spec.ts',
  'toast': 'npx playwright test toast-notifications.spec.ts',
  'performance': 'npx playwright test performance-integration.spec.ts',
  'complete': 'npx playwright test forecast-page-complete.spec.ts',
  'ui': 'npx playwright test minimal-ui-complete.spec.ts toast-notifications.spec.ts',
  'integration': 'npx playwright test performance-integration.spec.ts',
};

const suite = process.argv[2] || 'all';

if (!testSuites[suite]) {
  console.log('Available test suites:');
  Object.keys(testSuites).forEach(key => {
    console.log(`  - ${key}`);
  });
  process.exit(1);
}

console.log(`Running ${suite} tests...`);
console.log('Command:', testSuites[suite]);

try {
  execSync(testSuites[suite], { stdio: 'inherit' });
} catch (error) {
  console.error('Tests failed');
  process.exit(1);
}
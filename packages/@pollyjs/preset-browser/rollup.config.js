import createBrowserConfig from '../../../build-scripts/rollup.browser.config';
import createNodeConfig from '../../../build-scripts/rollup.node.config';

export default [
  createBrowserConfig({
    external: ['@pollyjs/core'],
    output: {
      globals: {
        '@pollyjs/core': '@pollyjs/core'
      }
    }
  }),
  createNodeConfig()
];

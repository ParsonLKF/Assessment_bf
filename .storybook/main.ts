import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  framework: '@storybook/nextjs-vite',
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  core: { disableTelemetry: true },
  async viteFinal(viteConfig) {
    viteConfig.build ??= {};
    viteConfig.build.rollupOptions ??= {};
    viteConfig.build.rollupOptions.onwarn = (warning, warn) => {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
      if (warning.code === 'SOURCEMAP_ERROR') return;
      warn(warning);
    };
    return viteConfig;
  },
};

export default config;

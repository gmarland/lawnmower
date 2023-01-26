import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';

export const config: Config = {
  namespace: 'lawnmower',
  plugins: [
    sass()
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: '**/*.{jpg,png}',
          dest: 'dist/components/assets',
          warn: true,
        }
      ]
    },
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: '**/*.{jpg,png}',
          dest: 'www/build/assets',
          warn: true,
        }
      ]
    },
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: 'styles/*.css',
          dest: 'dist/components',
          warn: true,
        }
      ]
    },
    {
      type: 'dist-custom-elements',
      copy: [
        {
          src: 'styles/*.css',
          dest: 'www/build',
          warn: true,
        }
      ]
    }
  ]
};

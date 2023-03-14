# miqa-vue

## Table of Contents
- Introduction
- Current Status
- Customize configuration
- Project Setup
    - Install
    - Development
    - Production
    - Unit Tests
    - E2E Tests
    - Lint
- Recommended IDE Setup
- Resources & Notes
    - VTK.js
    - ITK-wasm

## Introduction
MIQA Vue is an attempt to rewrite the Vue 2.x UI provided with MIQA in Vue 3.x.

## Current Status
Currently:
1. VTK and ITK have been successfully added to and configured for the project.
2. A slightly modified version of the code found in the [official VTK/Vue tutorial](https://kitware.github.io/vtk-js/docs/vtk_vue.html) has been implemented.
3. A slightly modified version of the [Vite ITK-wasm example](https://github.com/InsightSoftwareConsortium/itk-wasm/tree/main/examples/vite) has been implemented in Vue.

This means the basic code/setup for Vue/ITK is operational.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

### Install

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Recommended IDE Setup
- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Resources & Notes
This section can be a bit convoluted it traces a simplified path through the process I used and the problems I encountered. You don't need to read this section unless you are running into problems.

### VTK.js
- Adding VTK.js to a Vue 3.x project is pretty straightforward but the example code doesn't work out of the box (due to conflict with Vue's default styling). These modifications have already been made in this project, but if attempting to use VTK.js with another project see this [StackOverflow post](https://stackoverflow.com/questions/75724232/when-using-vue-3-with-vtk-js-why-doesnt-the-render-display-on-the-screen) for instructions on how to get VTK.js to work in a Vue 3.x project.

#### Resources
- [Official VTK/Vue Tutorial](https://kitware.github.io/vtk-js/docs/vtk_vue.html)
- [When using Vue 3 with VTK.js why doesn't the render display on the screen?](https://stackoverflow.com/questions/75724232/when-using-vue-3-with-vtk-js-why-doesnt-the-render-display-on-the-screen)

### ITK-wasm
- Adding ITK-wasm to a Vue 3.x project, on the other hand, is a bit more complicated.

#### Where Are the Instructions?
The [documentation on the official ITK-wasm site](https://wasm.itk.org/docs/) focuses on using the power C/C++ to JS WASM acapabilities but this can leave one confused on how to configure ITK-wasm for simpler use cases.

I recommend skipping all of the documentation until [Examples](https://wasm.itk.org/examples/). Note that the sub-sections listed in the main section are not links but can be accessed in the left-hand menu.

Under Recipes there is a [Vue recipe that utilizes VolView](https://wasm.itk.org/examples/volview). This is a fairly full-fledged example but may be overkill for your needs.

Jump down to the [Node.js Distribution documentation](https://wasm.itk.org/examples/node) you can find a list of the packages you'll  need to install `npm i --save itk-wasm itk-image-io itk-mesh-io`.

Once you've installed the requisite dependencies you can jump down to the [Vite Distribution Documentation](https://wasm.itk.org/examples/vite). The steps are as follows:
1. Install the `vite-plugin-static-copy` plugin.
2. Update the `vite.config.js` file to include a configuration for the `vite-plugin-static-copy` plugin:
```js
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    // put lazy loaded JavaScript and Wasm bundles in dist directory
    viteStaticCopy({
      targets: [
        { src: 'node_modules/itk-wasm/dist/web-workers/*',
          dest: 'dist/itk/web-workers'
        },
        {
          src: 'node_modules/itk-image-io/*',
          dest: 'dist/itk/image-io',
        },
        {
          src: 'node_modules/itk-mesh-io/*',
          dest: 'dist/itk/mesh-io',
          rename: 'mesh-io'
        }
      ],
    })
  ],
  // ...
})
```
This copies the ITK modules from `node_modules` into the `dist` directory.

> IMPORTANT: Do not add `ITKConfig.js` until after you've run `npm run build` after updating this configuration otherwise you may run into errors about the itk modules not existing. 

3. Next we'll update `vite.config.js` again, this time to add aliases to our (soon to be) itkConfig.js file:
```js
resolve: {
    alias: {
        '../itkConfig.js': itkConfig,
        '../../itkConfig.js': itkConfig
    }
}
```

4. Once this is done we can create our `itkConfig.js` file which tells us where our ITK modules are:
```js
const itkConfig = {
  pipelineWorkerUrl: '/itk/web-workers/min-bundles/pipeline.worker.js',
  imageIOUrl: '/itk/image-io',
  meshIOUrl: '/itk/mesh-io',
  pipelinesUrl: '/itk/pipelines'
}

export default itkConfig
```

5. Finally, we can find a [basic ITK-wasm/Vite project](https://github.com/InsightSoftwareConsortium/itk-wasm/tree/main/examples/vite) we can use to setup our ITK-wasm implementation with Vue.

In this project I've combined the code in `main.js` and `outputFileInformation.js` into a Vue SFC (`src/components/simpleITK.vue`).

### ITK-wasm Resources
- [Official ITK.js to ITK-wasm Migration Guide](https://wasm.itk.org/docs/itk_js_to_itk_wasm_migration_guide)
- [Official ITK-wasm Vite Example](https://github.com/InsightSoftwareConsortium/itk-wasm/tree/main/examples/vite)
- [Official ITK-wasm API Documentation](https://wasm.itk.org/api/)
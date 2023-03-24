# miqa-vue

## Table of Contents
- Introduction
- Current Status
- Next Steps
- Customize configuration
- Project Setup
    - Install
    - Development
    - Production
    - Lint
- Testing
    - Unit Tests
    - E2E Tests
- Recommended IDE Setup
- Learning Branches
- Resources & Notes
    - VTK.js
    - ITK-wasm

## Introduction
MIQA Vue is an attempt to rewrite the Vue 2.x UI provided with MIQA in Vue 3.x.

NOTE: This means significant portions of the code base are pulled from the [official MIQA repository](https://github.com/OpenImaging/miqa/web_client).

## Current Status
Currently:
1. VTK and ITK have been successfully added to and configured for the project.
2. A slightly modified version of the code found in the [official VTK/Vue tutorial](https://kitware.github.io/vtk-js/docs/vtk_vue.html) has been implemented.
3. A slightly modified version of the [Vite ITK-wasm example](https://github.com/InsightSoftwareConsortium/itk-wasm/tree/main/examples/vite) has been implemented in Vue.
4. A modified version of the [VTK.js Proxy Manager example](https://kitware.github.io/vtk-js/examples/ProxyManager.html) is now wired up to display the images that are loaded by ITK-wasm and converted by VTK.js.
5. Significant changes to the code have been made to bring it closer to the main MIQA project and instead of a 3D image now a 2D slice is displayed.

This means the basic code/setup for Vue/ITK is operational and is converging with the core MIQA code in many ways.

## Next Steps
Taking a slight detour for the upcoming branch `miqa-refactor` which will focus on cleaning up some of the code and looking for differences between this code and the core code that should be converged.

Once this step is complete we'll return to our "regularly scheduled programming" with an upcoming `miqa-crosshairs` branch which will work on implementing the crosshairs functionality.

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

### Lint with [ESLint](https://eslint.org/)
```sh
npm run lint
```

## Testing

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


## Recommended IDE Setup
- [VSCode](https://code.visualstudio.com/)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Learning Branches
I'm attempting to implement one feature at a time so you can look at various branches to learn various aspects of how this app works as well as how the technologies it utilizes work - especially ITK-wasm and VTK.js.

- `add-itk` - Covers the integration of ITM-wasm into the project, which can be a challenge. See the README in that branch for additional details on the issues and how to work around them.
- `add-nii-gz` - Adds a basic implementation of ITK within the Vue app.
- `load-image` - Wired a modified version of the VTK.js ProxyManager example up to the ITK loader/VTK converter, now renders an image.
- `add-pinia` - Refactors project to make use of Pinia, basic implementation.
- `miqa-vtk` - This ended up being Part 1 as the challenges were more significant than expected.
  - Important: This was the last branch that includes earlier in-process components. If you are looking for simple integrations this is the last branch in which they exist.
  - Important: This was the last branch to provide a 3D visualization, this branch now includes a slice view. If you are looking for 3D visualization the previous branch above.
  - Renamed files from `.js` to `.ts`
  - Removed some aspects of default Vue project.
  - Added `SimpleMIQAViewer.vue` component.
  - Moved significant portions of code utilizing VTK.js/ITK-wasm into the Pinia store.
  - Removed ColorMaps files, they weren't utilized.
- `miqa-vtk-2` - Changes from 3D visualization to 2D slice visualization, work towards converging code with MIQA core.

## Resources & Notes
- The README varies based on the branch one is currently on. Please see the Learning Branches section to learn more about the various branches and what they cover.

### Pinia
- [How to Handle State Management in Vue using Pinia](https://coderpad.io/blog/development/how-to-handle-state-management-in-vue-using-pinia/)
  - There seems to be a number of articles covering using Pinia with the options style but very few covering using it with the composition style. This article starts with the options style but then addresses the composition style with some detail.

### VTK.js
- [Official VTK/Vue Tutorial](https://kitware.github.io/vtk-js/docs/vtk_vue.html)
- [When using Vue 3 with VTK.js why doesn't the render display on the screen?](https://stackoverflow.com/questions/75724232/when-using-vue-3-with-vtk-js-why-doesnt-the-render-display-on-the-screen)
- [VTK.js ItkWasmVolume Example](https://kitware.github.io/vtk-js/examples/ItkWasmVolume.html)

### ITK-wasm
- [Official ITK.js to ITK-wasm Migration Guide](https://wasm.itk.org/docs/itk_js_to_itk_wasm_migration_guide)
- [Official ITK-wasm Vite Example](https://github.com/InsightSoftwareConsortium/itk-wasm/tree/main/examples/vite)
- [Official ITK-wasm API Documentation](https://wasm.itk.org/api/)

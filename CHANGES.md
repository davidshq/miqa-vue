# Changes from MIQA Canonical

## Folders
- The `vtk` folder is now a sub-folder of `utils`.

## VTK.js Related
### configUtils.js
- `activateOnCreate`'s `def` parameter is now `proxyDefinition`.

### ColorMaps.js
- Calls to `createGroup` have been moved out of `export default` and into `const {nameOfGroup}`, with the `nameOfGroup` taking their place in the export.

### viewManager.js
- Remove conditional in `getView` inside `for` loop as it is never actually called.

### proxy.js
- Moved the links out of `createDefaultView` and into `const defaultLinks`, now `createDefaultView` has a simple reference to `displayLinks`.
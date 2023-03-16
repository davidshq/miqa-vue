# Changes from MIQA Canonical

## Folders
- The `vtk` folder is now a sub-folder of `utils`.

## VTK.js Related
### configUtils.js
- `activateOnCreate`'s `def` parameter is now `proxyDefinition`.

### ColorMaps.js, ColorMaps.json
- It doesn't seem this code is ever actually used. While in canonical MIQA it is imported into `main.ts` commenting it out doesn't seem to cause any issues and the import functionality never appears to be utilized.
- Thus these files have been deleted.

### viewManager.js
- Remove conditional in `getView` inside `for` loop as it is never actually called.

### proxy.js
- Moved the links out of `createDefaultView` and into `const defaultLinks`, now `createDefaultView` has a simple reference to `displayLinks`.
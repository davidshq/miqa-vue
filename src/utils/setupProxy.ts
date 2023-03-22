import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import macro from '@kitware/vtk.js/macros';
import { InterpolationType } from '@kitware/vtk.js/Rendering/Core/ImageProperty/Constants';

import proxyConfig from './vtk/proxy';
import { getView } from './vtk/viewManager.js';

export async function setupProxyManager( state ) {
    console.group('setupProxyManager: Running');
    state.proxyManager = await vtkProxyManager.newInstance({
        proxyConfiguration: proxyConfig,
    });
    console.debug('state.proxyManager', state.proxyManager);
    console.groupEnd();
}

export async function setupSourceProxy( state ) {
    console.group('setupSourceProxy: Running');
    console.debug('proxyManager', state.proxyManager);
    const sourceProxy = state.proxyManager.createProxy(
            'Sources',
            'TrivialProducer'
    );
    console.debug('sourceProxy', sourceProxy);

    console.debug('state.file', state.file);
    sourceProxy.setInputData(state.file);

    state.vtkViews = await state.proxyManager.getViews();
    console.debug('state.vtkViews', state.vtkViews);
    console.debug('state.vtkViews[0]', state.vtkViews[0]);
    console.groupEnd();
}

export async function prepareProxyManager( state ) {
    console.group('prepareProxyManager: Running');
      ['View2D_Z:z', 'View2D_X:x', 'View2D_Y:y'].forEach((type) => {
        const view = getView(state.proxyManager, type);
        console.debug('View:', view);
        // @ts-ignore
        view.setOrientationAxesVisibility(false);
        // @ts-ignore
        view.getRepresentations().forEach((representation) => {
          representation.setInterpolationType(InterpolationType.NEAREST);
          representation.onModified(macro.debounce(() => {
            // @ts-ignore
            if (view.getRepresentations()) {
              // @ts-ignore
              view.render(true);
            }
          }, 0));
          // debounce timer doesn't need a wait time because
          // the many onModified changes that it needs to collapse to a single rerender
          // all happen simultaneously when the input data is changed.
        });
      });
    console.groupEnd();
  }

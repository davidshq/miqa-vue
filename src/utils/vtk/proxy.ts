import vtk2DView from '@kitware/vtk.js/Proxy/Core/View2DProxy';
import vtkLookupTableProxy from '@kitware/vtk.js/Proxy/Core/LookupTableProxy';
import vtkPiecewiseFunctionProxy from '@kitware/vtk.js/Proxy/Core/PiecewiseFunctionProxy';
import vtkProxySource from '@kitware/vtk.js/Proxy/Core/SourceProxy';
import vtkSliceRepresentationProxy from '@kitware/vtk.js/Proxy/Representations/SliceRepresentationProxy';
import vtkView from '@kitware/vtk.js/Proxy/Core/ViewProxy';
import vtkVolumeRepresentationProxy from '@kitware/vtk.js/Proxy/Representations/VolumeRepresentationProxy';
import vtkGeometryRepresentationProxy from '@kitware/vtk.js/Proxy/Representations/GeometryRepresentationProxy';
import '@kitware/vtk.js/Rendering/Profiles/All';

import ConfigUtils from './configUtils';

import proxyUI from './proxyUI';
import proxyLinks from './proxyLinks';
import proxyFilter from './proxyFilter';
import proxyViewRepresentationMapping from './proxyViewRepresentationMapping';

const { createProxyDefinition, activateOnCreate } = ConfigUtils;

const defaultLinks = [
    {
      type: 'application',
      link: 'AnnotationOpacity',
      property: 'annotationOpacity',
      updateOnBind: true,
    },
    {
      type: 'application',
      link: 'OrientationAxesVisibility',
      property: 'orientationAxesVisibility',
      updateOnBind: true,
    },
    {
      type: 'application',
      link: 'OrientationAxesPreset',
      property: 'presetToOrientationAxes',
      updateOnBind: true,
    },
    {
      type: 'application',
      link: 'OrientationAxesType',
      property: 'orientationAxesType',
      updateOnBind: true,
    },
];

function createDefaultView(classFactory, ui?, options?, props?) {
  console.log('vtk/proxy.js - createDefaultView: Running');
  return activateOnCreate(
    createProxyDefinition(
      classFactory,
      ui,
      defaultLinks,
      options,
      props,
    ),
  );
}

export default {
  definitions: {
    Proxy: {
      /*LookupTable: createProxyDefinition(vtkLookupTableProxy, [], [], {
        presetName: 'Default (Cool to Warm)',
      }),*/
      LookupTable: { class: vtkLookupTableProxy },
      // Controls the appearance of the volume.
      PiecewiseFunction: createProxyDefinition(vtkPiecewiseFunctionProxy),
    },
    Sources: {
      // For stand-alone data objects
      TrivialProducer: activateOnCreate(createProxyDefinition(vtkProxySource)),
      /*Contour: proxyFilter.Contour,*/
    },
    Representations: {
      Geometry: createProxyDefinition(
        vtkGeometryRepresentationProxy,
        proxyUI.Geometry,
        proxyLinks.Geometry,
      ),
      Slice: createProxyDefinition(
        vtkSliceRepresentationProxy,
        proxyUI.Slice,
        proxyLinks.Slice,
      ),
      SliceX: createProxyDefinition(
        vtkSliceRepresentationProxy,
        proxyUI.Slice,
        [{ link: 'SliceX', property: 'slice', updateOnBind: true }].concat(
          proxyLinks.Slice,
        ),
      ),
      SliceY: createProxyDefinition(
        vtkSliceRepresentationProxy,
        proxyUI.Slice,
        [{ link: 'SliceY', property: 'slice', updateOnBind: true }].concat(
          proxyLinks.Slice,
        ),
      ),
      SliceZ: createProxyDefinition(
        vtkSliceRepresentationProxy,
        proxyUI.Slice,
        [{ link: 'SliceZ', property: 'slice', updateOnBind: true }].concat(
          proxyLinks.Slice,
        ),
      ),
      Volume: createProxyDefinition(
        vtkVolumeRepresentationProxy,
        proxyUI.Volume,
        proxyLinks.Volume,
      ),
    },
    Views: {
      View3D: createDefaultView(vtkView, proxyUI.View3D),
      View2D: createDefaultView(vtk2DView, proxyUI.View2D),
      View2D_X: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 0 }),
      View2D_Y: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 1 }),
      View2D_Z: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 2 }),
      ScreenshotView2D_x: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 0 }),
      ScreenshotView2D_y: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 1 }),
      ScreenshotView2D_z: createDefaultView(vtk2DView, proxyUI.View2D, { axis: 2 }),
    },
  },
  representations: {
    View3D: proxyViewRepresentationMapping.View3D,
    View2D: proxyViewRepresentationMapping.View2D,
    View2D_X: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceX' },
    },
    View2D_Y: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceY' },
    },
    View2D_Z: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceZ' },
    },
    ScreenshotView2D_x: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceX' },
    },
    ScreenshotView2D_y: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceY' },
    },
    ScreenshotView2D_z: {
      ...proxyViewRepresentationMapping.View2D,
      vtkImageData: { name: 'SliceZ' },
    },
  },
  filters: {
    vtkImageData: ['Contour'],
  },
};

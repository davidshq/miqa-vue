import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readFile } from 'itk-wasm';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import proxyConfiguration from '../utils/vtk/proxy';
import macro from '@kitware/vtk.js/macros';
import { InterpolationType } from '@kitware/vtk.js/Rendering/Core/ImageProperty/Constants';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import { vec3 } from 'gl-matrix';

const { convertItkToVtkImage } = ITKHelper;

export const useMiqaStore = defineStore('miqaStore', () => {
  const file = ref(null);
  const proxyManager = ref(null);
  const vtkViews = ref([]);
  const slice = ref(null);
  const sourceProxy = ref(null);
  const VIEW_ORIENTATIONS = {
    default: {
    axis: 1,
    viewUp: [0, 0, 1],
    },
    x: {
      axis: 0,
      viewUp: [0, 0, 1],
      directionOfProjection: [1, 0, 0],
    },
    y: {
      axis: 1,
      viewUp: [0, 0, 1],
      directionOfProjection: [0, -1, 0],
    },
    z: {
      axis: 2,
      viewUp: [0, -1, 0],
      directionOfProjection: [0, 0, -1],
    },
  };

  function $reset() {
    file.value = null;
    proxyManager.value = null;
    vtkViews.value = [];
  }

  // @ts-ignore
  async function loadImage (event) {
    console.group('Running loadImage');

    const dataTransfer = event.dataTransfer;
    console.debug('dataTransfer', dataTransfer);
    const files = event.target.files || dataTransfer.files

    // Use ITK to read the file
    const loadedFile = await readFile(null, files[0]);
    const { image, mesh, webWorker } = loadedFile;

    webWorker.terminate()
    const imageOrMesh = image || mesh

    // Convert file into a format VTK can understand
    file.value = convertItkToVtkImage(imageOrMesh)

    displayImage();
    console.groupEnd();
  }

  const displayImage = () => {
    console.group('Running displayImage');
    // Create proxy manager
    setupProxyManager();

    // Create view proxy
    const view = proxyManager.value.createProxy('Views', 'View2D');
    view.getOpenGLRenderWindow();

    // Create source proxy
    setupSourceProxy();


    // Begin VtkViewer
    // Create representation proxy
    const representation = proxyManager.value.getRepresentation(
      null,
      view
    );
    console.log('representation', representation);
    // Set DOM element
    const viewer = document.getElementById('viewer');
    // initializeView
    view.setContainer(viewer);
    fill2DView(view);
    // initializeSlice
    slice.value = representation.getSlice();

    // initializeCamera
    initializeCamera(view, representation);

    console.groupEnd();
  }

  const setupProxyManager = () => {
    console.group('Running setupProxyManager');
    proxyManager.value = vtkProxyManager.newInstance({
        proxyConfiguration
   });
    console.debug('proxyManager', proxyManager);
    console.groupEnd();
  }

  const prepareProxyManager = () => {
    console.group('Running prepareProxyManager');
    if (!proxyManager.value.getViews().length) {
      ['View2D_Z:z', 'View2D_X:x', 'View2D_Y:y'].forEach((type) => {
        const view = getView(proxyManager, type);
        view.setOrientationAxesVisibility(false);
        view.getRepresentations().forEach((representation) => {
          representation.setInterpolationType(InterpolationType.NEAREST);
          representation.onModified(macro.debounce(() => {
            if (view.getRepresentations()) {
              view.render(true);
            }
          }, 0));
        });
      });
    }
    console.groupEnd();
  }

  const setupSourceProxy = () => {
    console.group('Running setupSourceProxy');
    sourceProxy.value = proxyManager.value.createProxy('Sources', 'TrivialProducer');
    sourceProxy.value.setInputData(file.value);
    prepareProxyManager();
    vtkViews.value = proxyManager.value.getViews();
    console.groupEnd()
  }

  const getView = (proxyManager, viewType) => {
    const [type, name] = viewType.split(':');
    let view = null;
    const views = proxyManager.value.getViews();
    for (let i = 0; i < views.length; i +=1) {
      view = views[i];
    }

    if (!view) {
      view = proxyManager.value.createProxy('Views', type, { name });
      proxyManager.value.getSources().forEach((source) => proxyManager.getRepresentation(source, view));
      const { axis, directionOfProjection, viewUp } = VIEW_ORIENTATIONS;
      view.updateOrientation(axis, directionOfProjection, viewUp);
      view.setBackground(0, 0, 0, 0);
      view.setPresetToOrientationAxes('default');
    }
  }

  const initializeCamera = (view, representation) => {
    const camera = view.getCamera();
    const orientation = representation.getInputDataSet().getDirection();
    console.log('orientation', orientation);
    const name = 'x';
    console.log('name', name);
    console.log(VIEW_ORIENTATIONS);
    console.log(VIEW_ORIENTATIONS[name].viewUp);
    let newViewUp = VIEW_ORIENTATIONS[name].viewUp.slice()
    console.log('newViewUp', newViewUp);
    let newDirectionOfProjection = VIEW_ORIENTATIONS[name].directionOfProjection;
    console.log('newDirectionOfProjection', newDirectionOfProjection);
    newViewUp = findClosestColumnToVector(newViewUp, orientation);
    newDirectionOfProjection = findClosestColumnToVector(newDirectionOfProjection, orientation);
    camera.setDirectionOfProjection(...newDirectionOfProjection);
    camera.setViewUp(...newViewUp);
    view.resetCamera();
    fill2DView(view);
    return view;
  }

  const findClosestColumnToVector = (inputVector, matrix) => {
    let currClosest = null;
    let currMax = 0;
    const inputVectorAxis = inputVector.findIndex((value) => value !== 0);
    for (let i = 0; i < 3; i += 1) {
      const currColumn = matrix.slice(i * 3, i * 3 + 3);
      const currValue = Math.abs(currColumn[inputVectorAxis]);
        if (currValue > currMax) {
          currClosest = currColumn;
          currMax = currValue;
        }
      }
      const flipCurrClosest = vec3.dot(
        inputVector,
        currClosest,
      );
      if (flipCurrClosest < 0) {
        currClosest = currClosest.map((value) => value * -1);
      }
      return currClosest;
    }

  const fill2DView = (view, w?, h?, resize = true) => {
    console.log('fill2DView.js - fill2DView: Running');
    if (!view) return undefined;
    if (resize) view.resize();
    const viewName = view.getName();
    if (viewName === 'default') return 0;

    const bounds = view.getRenderer().computeVisiblePropBounds();
    const dim = [
      (bounds[1] - bounds[0]) / 2,
      (bounds[3] - bounds[2]) / 2,
      (bounds[5] - bounds[4]) / 2,
    ];
    console.debug('fill2DView - dim', dim);
    w = w || view.getContainer().clientWidth;
    h = h || view.getContainer().clientHeight;
    const r = w / h;

    let x;
    let y;
    if (viewName === 'x') {
      [, x, y] = dim;
    } else if (viewName === 'y') {
      [x, , y] = dim;
    } else if (viewName === 'z') {
      [x, y] = dim;
    }
    let scale;
    if (r >= x / y) {
      scale = y + 1;
    } else {
      scale = x / r + 1;
    }
    if (resize) {
      view.resize();
      view.getCamera().setParallelScale(scale);
    }
      return scale;
  }

  return {
    file,
    proxyManager,
    vtkViews,
    $reset,
    loadImage,
    displayImage,
  };
});

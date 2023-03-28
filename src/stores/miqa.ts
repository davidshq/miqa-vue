import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readFile } from 'itk-wasm';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import type vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import proxyConfiguration from '../utils/vtk/proxy';
import macro from '@kitware/vtk.js/macros';
import { InterpolationType } from '@kitware/vtk.js/Rendering/Core/ImageProperty/Constants';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import { vec3 } from 'gl-matrix';
import type vtkView from '@kitware/vtk.js/Proxy/Core/ViewProxy';
import CrosshairSet from '../utils/crosshairs';
import type vtkSourceProxy from "@kitware/vtk.js/Proxy/Core/SourceProxy";
import type vtkSliceRepresentationProxy from "@kitware/vtk.js/Proxy/Representations/SliceRepresentationProxy";

const { convertItkToVtkImage } = ITKHelper;

interface ViewOrientation {
  axis: number;
  viewUp: number[];
  directionOfProjection?: number[];
}

interface ViewOrientationMap {
  [key: string]: ViewOrientation;
}

export const useMiqaStore = defineStore('miqaStore', () => {
  const file = ref<vtkImageData>();
  const iIndexSlice = ref(0);
  const jIndexSlice = ref(0);
  const kIndexSlice = ref(0);
  const proxyManager = ref<vtkProxyManager>();
  const slice = ref(null);
  const sourceProxy = ref(null);
  const vtkViews = ref<vtkView[]>();
  const VIEW_ORIENTATIONS: ViewOrientationMap = {
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
    file.value = {} as vtkImageData;
    proxyManager.value = {} as vtkProxyManager;
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

  // prepareViewer mainly
  const displayImage = () => {
    console.group('Running displayImage');

    setupProxyManager(proxyManager, vtkViews);
    setupSourceProxy(proxyManager, vtkViews);

    // Create view proxy
    const view = vtkViews.value[0];
    // view.getOpenGLRenderWindow();

    const representation: vtkSliceRepresentationProxy = getRepresentation(proxyManager, view);

    initializeView(view, representation);
    initializeSlice(representation, slice);
    initializeCamera(view, representation);
    // Need to test
    const renderSubscription = view.getInteractor().onRenderEvent(() => {
      updateCrosshairs(view, representation);
    })



    console.groupEnd();
  }

  const setupProxyManager = (proxyManager: ref<vtkProxyManager>, vtkViews: ref<vtkView[]>) => {
    console.group('Running setupProxyManager');
    proxyManager.value = vtkProxyManager.newInstance({
        proxyConfiguration
   });
    vtkViews.value = [];
    console.debug('proxyManager', proxyManager);
    console.groupEnd();
  }

  const prepareProxyManager = (proxyManager: ref<vtkProxyManager>) => {
    console.group('Running prepareProxyManager');
    if (!proxyManager.value.getViews().length) {
      ['View2D_Z:z', 'View2D_X:x', 'View2D_Y:y'].forEach((type) => {
        const view = getView(proxyManager, type);
        console.debug('view', view)
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

  const setupSourceProxy = (proxyManager: ref<vtkProxyManager>, vtkViews: ref<vtkView[]>) => {
    console.group('Running setupSourceProxy');
    sourceProxy.value = proxyManager.value.createProxy('Sources', 'TrivialProducer');
    sourceProxy.value.setInputData(file.value);
    prepareProxyManager(proxyManager);
    vtkViews.value = proxyManager.value.getViews();
    console.groupEnd()
  }

  const getView = (proxyManager: ref<vtkProxyManager>, viewType: string) => {
    console.group('Running getView');
    const [type, name] = viewType.split(':');
    let view: vtkView;
    const views = proxyManager.value.getViews();
    for (let i = 0; i < views.length; i +=1) {
      view = views[i];
    }

    if (!view) {
      view = proxyManager.value.createProxy('Views', type, { name });
      proxyManager.value.getSources().forEach((source: vtkSourceProxy<any>) => {
        proxyManager.value.getRepresentation(source, view)
      });
      const { axis, directionOfProjection, viewUp } = VIEW_ORIENTATIONS;
      view.updateOrientation(axis, directionOfProjection, viewUp, 0);
      view.setBackground(0, 0, 0, 0);
      view.setPresetToOrientationAxes('default');
    }
    console.groupEnd();
    return view;
  }

  const initializeCamera = (view: vtkView, representation) => {
    console.group('Running initializeCamera');
    const camera = view.getCamera();
    const orientation = representation.getInputDataSet().getDirection();
    console.log('orientation', orientation);
    const name: string = view.getName(); // x, y, z
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
    sliceDomain(representation); // Just for testing, not actual usage
    fill2DView(view);
    console.groupEnd();
    return view;
  }

  const initializeSlice = (representation, slice) => {
    console.group('Running initializeSlice');
    slice.value = representation.getSlice();
    console.debug('slice', slice);
    console.groupEnd();
  }

  const initializeView = (view: vtkView, representation) => {
    console.group('Running initializeView');
    // Set DOM element
    const viewer = document.getElementById('viewer');
    view.setContainer(viewer);
    fill2DView(view);
    console.debug('view.getName()', view.getName());
    if (view.getName() !== 'default') {
      // Need to test
      const modifiedSubscription = representation.onModified(() => {
        slice.value = representation.getSlice();
      })
    }

    console.groupEnd();
  }

  const getRepresentation = (proxyManager: ref<vtkProxyManager>, view: vtkView) => {
    console.group('Running getRepresentation');
    const representation = proxyManager.value.getRepresentation(
        null,
        view
    );
    console.debug('representation', representation);
    console.groupEnd();
    return representation;
  }

  const findClosestColumnToVector = (inputVector, matrix) => {
    console.group('Running findClosestColumnToVector');
    let currClosest = null;
    let currMax = 0;
    const inputVectorAxis = inputVector.findIndex((value) => value !== 0);
    console.debug('inputVectorAxis', inputVectorAxis);
    for (let i = 0; i < 3; i += 1) {
      const currColumn = matrix.slice(i * 3, i * 3 + 3);
      console.debug('currColumn', currColumn)
      const currValue = Math.abs(currColumn[inputVectorAxis]);
        if (currValue > currMax) {
          currClosest = currColumn;
          currMax = currValue;
        }
      }
    console.debug('currMax', currMax);
      const flipCurrClosest = vec3.dot(
        inputVector,
        currClosest,
      );
      console.debug('flipCurrClosest', flipCurrClosest);
      if (flipCurrClosest < 0) {
        currClosest = currClosest.map((value) => value * -1);
      }
      console.debug('currClosest', currClosest)
      console.groupEnd();
      return currClosest;
    }

  const fill2DView = (view: vtkView, w?: number, h?: number, resize = true) => {
    console.group('fill2DView: Running');
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
    console.debug('dim', dim);
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
    console.groupEnd();
    return scale;
  }

  const sliceDomain = (representation) => {
    console.group('Running sliceDomain');
    if (!representation) return null;
    const sliceDomain = representation.getPropertyDomainByName('slice');
    console.debug('sliceDomain', sliceDomain);
    console.groupEnd();
    return representation;
  }

  const updateCrosshairs = (view: vtkView, representation: vtkSliceRepresentationProxy) => {
    console.group('Running updateCrosshairs');
    const myCanvas: HTMLCanvasElement = document.getElementById('crosshairs-x') as HTMLCanvasElement;
    if (myCanvas && myCanvas.getContext('2d')) {
      const ctx = myCanvas.getContext('2d');
      console.debug('myCanvas.width', myCanvas.width)
      console.debug('myCanvas.height', myCanvas.height);
      ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
      const viewName = 'x';
      const ijkName = 'i';
      const crosshairSet = new CrosshairSet(
          viewName,
          ijkName,
          representation,
          view,
          myCanvas,
          iIndexSlice.value,
          jIndexSlice.value,
          kIndexSlice.value,
      );
      console.debug(`crosshairSet`, crosshairSet)
      const originalColors =  {
        x: '#fdd835',
        y: '#4caf50',
        z: '#b71c1c',
      };
      console.debug('originalColors', originalColors);
      const trueColors = Object.fromEntries(
          Object.entries(originalColors).map(([axisName, hex]) => [trueAxis(axisName, representation), hex]),
      );
      console.debug('trueColors', trueColors);
      const [displayLine1, displayLine2] = crosshairSet.getCrosshairsForAxis(
          trueAxis(viewName, representation),
          trueColors,
      );
      console.debug('displayLine1, displayLine2', displayLine1, displayLine2);
      drawLine(ctx, displayLine1);
      drawLine(ctx, displayLine2);
      console.groupEnd();
    }
    console.groupEnd();
  }

  const drawLine = (ctx, displayLine) => {
    console.group('drawLine: Running');
    if (!displayLine) return;
    ctx.strokeStyle = displayLine.color;
    ctx.beginPath();
    ctx.moveTo(...displayLine.start);
    console.log('displayLine.start', displayLine.start);
    ctx.lineTo(...displayLine.end);
    console.log('displayLine.end', displayLine.end);
    ctx.stroke();
    console.groupEnd();
  }

  const trueAxis = (axisName: string, representation) => {
    console.group('Running trueAxis');
    if (!representation.getInputDataSet()) return undefined;
    const orientation = representation.getInputDataSet().getDirection();
    const axisNumber = VIEW_ORIENTATIONS[axisName].axis;
    const axisOrientation = [
      orientation[axisNumber],
      orientation[3 + axisNumber],
      orientation[6 + axisNumber],
    ].map(
        (val) => Math.abs(val),
    );
    const axisOrdering = ['x', 'y', 'z'];
    const trueAxis = axisOrdering[
        axisOrientation.indexOf(Math.max(...axisOrientation))
        ];
    console.groupEnd();
    return trueAxis;
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

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { readFile } from 'itk-wasm';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import proxyConfiguration from '../utils/vtk/proxy';
import macro from '@kitware/vtk.js/macros';
import { getView } from '../utils/vtk/viewManager';
import { InterpolationType } from '@kitware/vtk.js/Rendering/Core/ImageProperty/Constants';
import '@kitware/vtk.js/Rendering/Profiles/Volume';

const { convertItkToVtkImage } = ITKHelper;

export const useMiqaStore = defineStore('miqaStore', () => {
    const file = ref(null);
    const proxyManager = ref(null);
    const vtkViews = ref([]);

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
      const proxyManager = setupProxyManager();
      console.debug('proxyManager', proxyManager);

      prepareProxyManager(proxyManager);

      // Set DOM element
      const viewer = document.getElementById('viewer');

      // Create view proxy for 3D
      const view3DProxy = proxyManager.createProxy('Views', 'View3D');
      view3DProxy.setContainer(viewer);
      view3DProxy.getOpenGLRenderWindow();

      // Create source proxy
      const sourceProxy = proxyManager.createProxy('Sources', 'TrivialProducer');
      sourceProxy.setInputData(file.value);

      // Create representation proxy for 3D view
      const representation = proxyManager.getRepresentation(
          sourceProxy,
          view3DProxy
      );
      view3DProxy.resetCamera();
      console.groupEnd();
    }

    const setupProxyManager = () => {
        console.group('Running setupProxyManager');
        const proxyManager = vtkProxyManager.newInstance({
            proxyConfiguration: proxyConfiguration,
        });
        console.groupEnd();
        // Do we need to return?
        return proxyManager;
    }

    const prepareProxyManager = (proxyManager) => {
        console.group('Running prepareProxyManager');
        console.debug('proxyManager', proxyManager);
        ['View2D_Z:z', 'View2D_X:x', 'View2D_Y:y'].forEach((type) => {
            const view = getView(proxyManager, type);
            console.debug('view', view);
            view.setOrientationAxesVisibility(false);
            view.getRepresentations().forEach((representation) => {
                representation.setInterpolationType(InterpolationType.NEAREST);
                representation.onModified(macro.debounce(() => {
                    if (view.getRepresentations()) {
                        view.render(true);
                    }
                }, 0));
            });
            console.debug('Completed prepareProxyManager');
            console.groupEnd();
        });
    }

    async function setupSourceProxy(proxyManager) {
        console.group('setupSourceProxy: Running');
        console.debug('proxyManager', proxyManager);
        const sourceProxy = proxyManager.createProxy(
                'Sources',
                'TrivialProducer'
        );
        console.debug('sourceProxy', sourceProxy);

        console.debug('state.file', file);
        sourceProxy.setInputData(file);

        vtkViews.value = await proxyManager.getViews();
        console.debug('state.vtkViews[0]', vtkViews.value[0]);
        console.groupEnd();
    }

    return {
        file,
        proxyManager,
        vtkViews,
        $reset,
        loadImage,
        displayImage,
        setupProxyManager,
        prepareProxyManager,
        setupSourceProxy,
    };
});

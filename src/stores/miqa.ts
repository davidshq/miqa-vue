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
        const vtkImage = convertItkToVtkImage(imageOrMesh)
        file.value = vtkImage;
    
        displayImage(vtkImage);
        console.groupEnd();
    }
    
    const displayImage = (vtkImage) => {
        console.group('Running displayImage');
      // Create proxy manager
      const proxyManager = setupProxyManager();
      console.debug('proxyManager', proxyManager);
      
      prepareProxyManager(proxyManager);
    
      // Set DOM element
      const view3DContainer = document.getElementById('view3DContainer');
    
      // Create view proxy for 3D
      const view3DProxy = proxyManager.createProxy('Views', 'View3D');
      view3DProxy.setContainer(view3DContainer);
      view3DProxy.getOpenGLRenderWindow();
    
      // Create source proxy
      let representation3DProxy;
      const sourceProxy = proxyManager.createProxy('Sources', 'TrivialProducer');
      sourceProxy.setInputData(vtkImage);
    
      // Create representation proxy for 3D view
      representation3DProxy = proxyManager.getRepresentation(
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
        return proxyManager;
    }

    const prepareProxyManager = async (proxyManager) => {
        console.group('Running prepareProxyManager');
        console.debug('proxyManager', proxyManager);
        const view = await getView(proxyManager, 'View2D_Z:z');
        console.debug(await view);
        view.setOrientationAxesVisibility(false)
        view.getRepresentations().forEach((representation) => {
            representation.setInterpolationType(InterpolationType.NEAREST);
            representation.onModified(macro.debounce(() => {
                if (view.getRepresentations()) {
                    view.render(true);
                }
            }, 0));
        });
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
        prepareProxyManager
    };
});
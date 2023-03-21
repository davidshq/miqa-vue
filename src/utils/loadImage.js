import { readFile } from 'itk-wasm';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import { useMiqaStore } from '../stores/miqa';
import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import proxyConfiguration from '../utils/vtk/proxy';
import App from '../App.vue';

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)


const store = useMiqaStore();
const { convertItkToVtkImage } = ITKHelper;

export async function loadImage (event) {
    console.log('Running loadImage');

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
    store.file = vtkImage;

    displayImage(vtkImage);
}

const displayImage = (vtkImage) => {
  // Create proxy manager
  const proxyManager = vtkProxyManager.newInstance({ proxyConfiguration });

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
}
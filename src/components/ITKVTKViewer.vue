<template>
    <div>
      <div>
        <label>Select image or mesh:</label><br />
        <input name="inputFile" type="file" />
      </div>
      <br />
  
      <textarea readonly name="fileInformation" rows="20" cols="40">File information...</textarea>

      <div id="mainContainer" style="min-width:100px;min-height:100px;border:10px;color:white;">
        <div id="view3DContainer"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { readFile } from 'itk-wasm';
  import curry from 'curry';
  import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
  import { useMiqaStore } from '../stores/miqa';
  import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
  import '@kitware/vtk.js/Rendering/Profiles/Volume';
  import proxyConfiguration from '../utils/vtk/proxy';

  const store = useMiqaStore();
  const { convertItkToVtkImage } = ITKHelper;

  const outputFileInformation = curry(function outputFileInformation (
    outputTextArea,
    event
  ) {
    console.log('Running outputFileInformation');
    outputTextArea.textContent = 'Loading...'
  
    const dataTransfer = event.dataTransfer
    console.debug('dataTransfer', dataTransfer);
    const files = event.target.files || dataTransfer.files

    // Use ITK to read the file
    readFile(null, files[0])
    .then(({ image, mesh, webWorker }) => {
      webWorker.terminate()
      const imageOrMesh = image || mesh

      const vtkImage = convertItkToVtkImage(imageOrMesh)
      store.file = vtkImage;

      // Create proxy manager
      const proxyManager = vtkProxyManager.newInstance({ proxyConfiguration });

      // Set DOM element
      const view3DContainer = document.getElementById('view3DContainer');

      // Create view proxy for 3D
      const view3DProxy = proxyManager.createProxy('Views', 'View3D');
      view3DProxy.setContainer(view3DContainer);
      view3DProxy
        .getOpenGLRenderWindow();

      // Create source eproxy
      let representation3DProxy;
      const sourceProxy = proxyManager.createProxy('Sources', 'TrivialProducer');
      sourceProxy.setInputData(vtkImage);

      // Create representation proxy for 3D view
      representation3DProxy = proxyManager.getRepresentation(
        sourceProxy,
        view3DProxy
      );
      view3DProxy.resetCamera();

  
      function replacer (key, value) {
        if (!!value && value.byteLength !== undefined) {
          return String(value.slice(0, 6)) + '...'
        }
        return value
      }
      outputTextArea.textContent = JSON.stringify(imageOrMesh, replacer, 4)
    })
  })
  
  onMounted(() => {
    console.group('Running onMounted');
    const outputTextArea = document.querySelector('textarea')
    const handleFile = outputFileInformation(outputTextArea)
    const fileInput = document.querySelector('input')
    fileInput.addEventListener('change', handleFile)
    console.groupEnd();
  });
  </script>
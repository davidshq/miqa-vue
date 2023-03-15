<template>
      <div id="mainContainer" style="min-width:100px;min-height:100px;border:10px;color:white;">
        <div id="view3DContainer"></div>
      </div>
</template>
  
<script setup>
  import { onMounted } from 'vue';
  import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
  import { useMiqaStore } from '../stores/miqa';
  import vtkProxyManager from '@kitware/vtk.js/Proxy/Core/ProxyManager';
  import '@kitware/vtk.js/Rendering/Profiles/Volume';
  import proxyConfiguration from '../utils/vtk/proxy';

  const store = useMiqaStore();
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
      sourceProxy.setInputData(store.vtkImage);

  // Create representation proxy for 3D view
  representation3DProxy = proxyManager.getRepresentation(
        sourceProxy,
        view3DProxy
      );
  view3DProxy.resetCamera();

  
  onMounted(() => {
    console.group('Running onMounted');
    console.groupEnd();
  });
</script>
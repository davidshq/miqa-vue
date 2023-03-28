<template>
  <div>
    <div>
      <label>Select image or mesh:</label><br />
      <input name="inputFile" type="file" @change="loadImage($event)" />
    </div>
    <br />

    <div class="vtk-viewer">
      <div id="viewer"></div>
      <canvas id="crosshairs-x"
           ref="crosshairsCanvas"
           class="crosshairs"
           ></canvas>
    </div>
  </div>
</template>

<script setup>
  import { useMiqaStore } from '@/stores/miqa';
  const { loadImage } = useMiqaStore();
</script>

<style scoped>
.vtk-viewer {
  min-width:100px;
  min-height:100px;
  max-width:1000px;
  max-height:1000px;
  border:10px;
  color:white;
  z-index: 0;
}
#viewer {
  display: flex;
  position: relative;
}

#viewer > div {
  cursor: crosshair !important;
}

.crosshairs {
  z-index: 3;
  position: absolute;
  width: 500px; /* temporary */
  height: 500px; /* temporary */
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>

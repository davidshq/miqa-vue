<template>
  <div>
    <div>
      <label>Select image or mesh:</label><br />
      <input name="inputFile" type="file" @change="loadImage($event)" />
    </div>
    <br />

    <div class="vtk-viewer">
      <div id="viewer"></div>
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
}
#viewer {
  display: flex;
  position: relative;
}
</style>

<template>
  <div>
    <div>
      <label>Select image or mesh:</label><br />
      <input name="inputFile" type="file" @change="$event => loadImage($event)" />
    </div>
    <br />

    <div id="mainContainer">
      <div id="view3DContainer"></div>
    </div>
  </div>
</template>

<script setup>
  import { useMiqaStore } from '@/stores/miqa';
  const { loadImage } = useMiqaStore();
</script>

<style scoped>
.mainContainer {
  min-width:100px;
  min-height:100px;
  max-width:1000px;
  max-height:1000px;
  border:10px;color:white;
}
.view3DContainer {
  display: flex;
  position: relative;
}
</style>
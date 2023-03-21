<template>
    <div>
      <div>
        <label>Select image or mesh:</label><br />
        <input name="inputFile" type="file" @change="loadImage" />
      </div>
      <br />

      <div id="mainContainer">
        <div id="view3DContainer" style="display:flex; position: relative;"></div>
      </div>
    </div>
  </template>

  <script setup>
  import { loadImage } from '../utils/loadImage.js';
  </script>

<style scoped>
.mainContainer {
  min-width:100px;
  min-height:100px;
  max-width:1000px;
  max-height:1000px;
  border:10px;color:white;
}
</style>
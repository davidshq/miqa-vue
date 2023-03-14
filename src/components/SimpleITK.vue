<template>
  <div>
    <!-- Input selector -->
    <div>
      <label>Select image or mesh:</label><br />
      <input name="inputFile" type="file" />
    </div>

    <!-- File information -->
    <textarea readonly name="fileInformation">File information...</textarea>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { readFile } from 'itk-wasm'
import curry from 'curry'

const outputFileInformation = curry(function outputFileInformation (
  outputTextArea,
  event
) {
  console.log('Running outputFileInformation');
  outputTextArea.textContent = 'Loading...'

  const dataTransfer = event.dataTransfer
  console.debug('dataTransfer', dataTransfer);
  const files = event.target.files || dataTransfer.files

  return readFile(null, files[0])
  .then(function ({ image, mesh, webWorker }) {
    webWorker.terminate()
    const imageOrMesh = image || mesh

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
  console.log('Running onMounted');
  const outputTextArea = document.querySelector('textarea')
  const handleFile = outputFileInformation(outputTextArea)
  const fileInput = document.querySelector('input')
  fileInput.addEventListener('change', handleFile)
})
</script>
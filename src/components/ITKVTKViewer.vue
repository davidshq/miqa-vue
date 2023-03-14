<template>
    <div>
      <div>
        <label>Select image or mesh:</label><br />
        <input name="inputFile" type="file" />
      </div>
      <br />
  
      <textarea readonly name="fileInformation" rows="20" cols="40">File information...</textarea>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { readFile } from 'itk-wasm'
  import curry from 'curry'
  import ITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper'

  const { convertItkToVtkImage } = ITKHelper
  
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

      // Get range of point data in image
      const dataRange = vtkImage
        .getPointData()
        .getArray(0)
        .getRange()

      console.debug(dataRange);
  
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
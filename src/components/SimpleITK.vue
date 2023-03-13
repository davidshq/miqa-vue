<script>
import vtkITKImageReader from "@kitware/vtk.js/IO/Misc/ITKImageReader";
import { readImageArrayBuffer } from "itk-wasm";


vtkITKImageReader.setReadImageArrayBufferFromITK(readImageArrayBuffer);

</script>

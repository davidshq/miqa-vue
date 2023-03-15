import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMiqaStore = defineStore('miqaStore', () => {
    const file = ref(null);
    const proxyManager = ref(null);
    const vtkViews = ref([]);

    function $reset() {
        file.value = null;
        proxyManager.value = null;
        vtkViews.value = [];
    }

    return { file, proxyManager, vtkViews, $reset };
});
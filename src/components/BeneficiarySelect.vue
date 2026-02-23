<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const options = ref([])
const model = defineModel()
const filterOptions = ref([])

async function fetchCandidates() {
  try {
    loading.value = true
    options.value = (await api.get('beneficiaries/?type=search')).data.data
    filterOptions.value = [...options.value, { value: null, label: 'Seleccione una opcion' }]
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

function filterFn(val, update) {
  update(() => {
    if (val === '' || val === null) {
      filterOptions.value = [...options.value]
    } else {
      const needle = val.toLowerCase()
      filterOptions.value = options.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
    }
  })
}

onMounted(() => {
  fetchCandidates()
})
</script>

<template>
  <q-select outlined v-model="model" use-input fill-input hide-selected :options="filterOptions" input-debounce="300"
    :loading="loading" @filter="filterFn" label="Beneficiario" emit-value map-options clearable />
</template>

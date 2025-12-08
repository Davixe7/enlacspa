<script setup>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { api } from 'src/boot/axios'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const loading = ref(false)
const form = ref({
  id: props.entry.id,
  name: props.entry.name,
  programId: props.entry.programId,
  entryDate: new Date().toISOString().slice(0, 10),
  observations: ''
})

const programOptions = ref([])

async function fetchPrograms() {
  try {
    const { data } = await api.get('/programs')
    const programs = Array.isArray(data.data) ? data.data : data
    programOptions.value = programs.map((p) => ({
      label: p.name,
      value: Number(p.id)
    }))
  } catch (e) {
    console.error('Error cargando programas', e)
  }
}

onMounted(async () => {
  await fetchPrograms()

  if (form.value.programId) {
    const exists = programOptions.value.some((opt) => opt.value === form.value.programId)
    if (!exists) {
      console.log('Program does not exist')
      form.value.programId = null
    }
  }
})

async function onSave() {
  try {
    loading.value = true
    await api.post(`candidatestatuses/${form.value.id}`, {
      program_id: form.value.programId,
      entry_date: form.value.entryDate,
      candidate_status_id: 5,
      _method: 'PUT'
    })
    onDialogOK({
      id: form.value.id,
      programId: form.value.programId,
      entryDate: form.value.entryDate,
      observations: form.value.observations
    })
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

function onCancel() {
  onDialogCancel()
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="q-pa-md">
        <div class="text-h6">Programar ingreso</div>
      </q-card-section>

      <q-card-section class="q-pa-md q-gutter-md">
        <q-input
          outlined
          v-model="form.name"
          label="Nombre"
          readonly
        />
        <q-select
          outlined
          v-model="form.programId"
          :options="programOptions"
          label="Programa"
          emit-value
          map-options
        />
        <q-input
          outlined
          v-model="form.entryDate"
          type="date"
          label="Fecha de ingreso"
        />
        <q-input
          outlined
          v-model="form.observations"
          type="textarea"
          label="Observaciones"
        />
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="primary"
          @click="onCancel"
        />
        <q-btn
          unelevated
          label="Guardar"
          color="primary"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

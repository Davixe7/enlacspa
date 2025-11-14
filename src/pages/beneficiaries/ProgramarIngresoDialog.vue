<script setup>
import { ref, onMounted } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { api } from 'src/boot/axios'

defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  row: Object,
  candidate: Object
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const form = ref({
  name: props.row
    ? props.row.name
    : `${props.candidate?.first_name ?? ''} ${props.candidate?.last_name ?? ''}`.trim(),
  programId: props.row ? props.row.program_id : (props.candidate?.program_id ?? null),
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
      value: p.id
    }))
  } catch (e) {
    console.error('Error cargando programas', e)
  }
}

onMounted(async () => {
  console.log(props.candidate)
  fetchPrograms()
})

function onSave() {
  onDialogOK({
    programId: form.value.programId,
    entryDate: form.value.entryDate,
    observations: form.value.observations
  })
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

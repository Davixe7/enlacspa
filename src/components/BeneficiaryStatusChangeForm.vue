<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import notify from 'src/utils/notify'

const model = defineModel()
const emits = defineEmits(['close'])
const loading = ref(false)

const entryStatuses = {
  pendiente_ingresar: 'Pendiente de ingresar',
  ingreso_programado: 'Ingreso programado',
  listo_ingresar: 'Listo para ingresar',
  activo: 'Activo',
  permiso_temporal: 'Permiso temporal',
  prueba_vida: 'Prueba de vida',
  inactivo: 'Inactivo',
  exenlac: 'Ex-ENLAC',
  graduado: 'Graduado',
  fallecido: 'Fallecido'
}

async function update() {
  try {
    loading.value = true
    let data = {
      status: model.value.newStatus,
      comment: model.value.comment
    }
    await api.post(`beneficiaries/${model.value.id}/status`, data)
    notify.positive('Estado actualizado exitosamente.')
    model.value.status = model.value.newStatus
    emits('close')
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo actualizar el estado')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-card style="width: 360px">
    <q-card-section>
      <div class="flex items-center">
        <div class="page-subtitle">Actualizar estado</div>
        <q-btn
          flat
          round
          dense
          icon="close"
          class="q-ml-auto"
          @click="emits('close')"
        />
      </div>
      <div>
        {{ model.name }}
      </div>
      <div>
        <q-badge
          color="positive"
          :label="entryStatuses[model.newStatus]"
        />
      </div>
    </q-card-section>
    <q-card-section>
      <q-input
        class="q-mb-md"
        type="textarea"
        outlined
        stack-label
        label="Comentario"
        v-model="model.comment"
      />

      <q-file
        outlined
        stack-label
        label="Archivo adjunto"
        v-if="model.newStatus == 'inactivo'"
        v-model="model.statusChangeFile"
      >
        <template v-slot:append>
          <q-icon name="sym_o_attach_file" />
        </template>
      </q-file>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        flat
        label="Cancelar"
        @click="emits('close')"
        class="q-mr-md"
      />
      <q-btn
        color="primary"
        label="Guardar"
        :loading="loading"
        @click="update"
      />
    </q-card-section>
  </q-card>
</template>

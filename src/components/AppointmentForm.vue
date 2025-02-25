<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

defineProps(['candidates'])
const emits = defineEmits(['close'])
const loading = ref(false)
const evaluators = ref([])
const appointment = ref({})

onMounted(async () => {
  evaluators.value = (await api.get('evaluators')).data.data
})

async function storeAppointment() {
  loading.value = true
  try {
    await api.post('appointments', { ...appointment.value })
    emits('close')
  } catch (error) {
    console.log(error);
  }
  loading.value = false
}
</script>

<template>
  <q-card style="width: 500px;">
    <q-card-section>
      <div class="page-title flex items-center">
        <q-icon
          name="calendar_today"
          class="q-mr-sm"
        ></q-icon>
        Programar cita
      </div>
    </q-card-section>
    <q-card-section class="q-gutter-y-md">
      <q-select
        outlined
        stack-label
        label="Candidatos"
        :options="candidates"
        v-model="appointment.candidate_id"
        emit-value
        option-label="full_name"
        option-value="id"
        map-options
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Tipo de cita"
        :options="[{ name: 'Unico tipo de cita', id: 1 }]"
        v-model="appointment.type_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Atendera"
        :options="evaluators"
        v-model="appointment.evaluator_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <q-input
        outlined
        stack-label
        label="Fecha y hora"
        v-model="appointment.date"
        mask="####-##-## ##:##"
        icon-prepend="calendar_today"
      ></q-input>

      <q-input
        outlined
        stack-label
        label="Observaciones"
        v-model="appointment.comments"
        type="textarea"
      ></q-input>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        @click="emits('close')"
        class="q-mr-sm"
        unelevated
        outline
        color="primary"
      >Cerrar</q-btn>
      <q-btn
        @click="storeAppointment"
        unelevated
        color="primary"
      >Guardar</q-btn>
    </q-card-section>
  </q-card>
</template>

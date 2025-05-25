<script setup>
import { DateTime } from 'luxon';
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
import Notify from 'src/utils/notify';

defineProps(['candidates'])
const emits = defineEmits(['close'])
const loading = ref(false)
const errors = ref({})
const areas = ref([])
const personal = ref([])
const appointment = ref({})

onMounted(async () => {
  areas.value = (await api.get('work_areas')).data.data
})

async function fetchPersonal() {
  personal.value = (await api.get('personal', { params: { area: appointment.value.type_id } })).data.data
}

const fulldatetime = computed(() => {
  let newDate = DateTime.fromFormat(date.value + ' ' + time.value, 'dd/MM/yyyy hh:mm')
  return newDate.toISO()
})
const date = ref(DateTime.now().toFormat('dd/MM/yyyy'))
const time = ref(DateTime.now().toFormat('hh:mm'))

async function storeAppointment() {
  loading.value = true
  errors.value = {}
  try {
    await api.post('appointments', { ...appointment.value, date: fulldatetime.value })
    Notify.positive('Guardado con exito')
    emits('close')
  } catch (error) {
    console.log(error);
    errors.value = error.formatted ? error.formatted : {}
    Notify.negative('Por favor, valide la informacion')
  }
  loading.value = false
}
</script>

<template>
  <q-card style="width: 500px;">
    <q-card-section>
      <div class="page-title page-title--no-margin flex items-center">
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
        class="q-field--required"
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
        class="q-field--required"
        :options="areas"
        v-model="appointment.type_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
        @update:modelValue="fetchPersonal"
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Atendera"
        class="q-field--required"
        :options="personal"
        v-model="appointment.evaluator_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <q-input
        outlined
        stack-label
        v-model="date"
        class="q-field--required"
        label="Seleccione fecha"
      >
        <template v-slot:append>
          <q-icon
            name="event"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="date"
                mask="DD/MM/YYYY"
              >
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Cerrar"
                    color="primary"
                    flat
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        outlined
        stack-label
        v-model="time"
        class="q-field--required"
        label="Horario"
      >
        <template v-slot:append>
          <q-icon
            name="access_time"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="time">
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Cerrar"
                    color="primary"
                    flat
                  />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

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

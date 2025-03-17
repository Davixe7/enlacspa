<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const props = defineProps({
  candidateId: {
    type: String,
    required: true
  }
})

const candidate = ref({})

onMounted(async () => {
  candidate.value = (await (api.get(`candidates/${props.candidateId}`))).data.data
})
</script>
<template>
  <div
    class="flex"
    style="margin-bottom: 65px;"
  >
    <q-img
      width="174px"
      height="169px"
      color="grey"
      class="bg-grey-4"
      style="margin-right: 20px;"
      :src="candidate.picture"
    ></q-img>

    <div class="flex column justify-between q-px-md">
      <div>
        <label class="text-weight-bold">Nombre:</label>
        {{ candidate.full_name }}
      </div>
      <div>
        <label class="text-weight-bold">Fecha:</label>
        {{ candidate.created_at }}
      </div>
      <div>
        <label class="text-weight-bold">Folio:</label>
        {{ candidate.sheet }}
      </div>
    </div>

    <div class="flex column justify-between q-px-md">
      <div>
        <label class="text-weight-bold">Edad cronologica</label>
        {{ candidate.chronological_age }} meses
      </div>
      <div>
        <label for="">text</label>
        {{ candidate.created_at }}
      </div>
      <div>
        <label for="">text</label>
        {{ candidate.sheet }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const props = defineProps({
  medications: {
    type: Array,
    default: () => [],
  },
});

const medication = reactive({
  name: "",
  dose: "",
  frequency: "",
  duration: "",
});

function addMedication() {
  medication.name = "";
  medication.dose = "";
  medication.frequency = "";
  medication.duration = "";
  medication.observaciones = "";
  localMedications.value.push({ ...medication });
}

const localMedications = ref([...props.medications]);
const columns = ref([
  {
    name: "name",
    field: "name",
    label: "Nombre del medication",
    align: "left",
  },
  { name: "dosis", field: "dose", label: "Dosis", align: "left" },
  {
    name: "frecuencia",
    field: "frequency",
    label: "Frecuencia",
    align: "left",
  },
  {
    name: "tiempo",
    field: "duration",
    label: "Tiempo de tomarlo",
    align: "left",
  },
  {
    name: "observaciones",
    field: () =>
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
    label: "Observaciones",
    align: "left",
  },
  {
    name: "actions",
    label: "Acciones",
    align: "right",
  },
]);
</script>

<template>
  <q-table
    hide-bottom
    wrap-cells
    flat
    bordered
    :columns="columns"
    :rows="localMedications"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td>
          <q-input
            outlined
            placeholder="Ej: Paracetamol"
            v-model="props.row.name"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 500 mg"
            v-model="props.row.dose"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 2 Veces al dia"
            v-model="props.row.frequency"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 1 Semana"
            v-model="props.row.duration"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            type="textarea"
            outlined
            value="Lorem ipsum dolor sit amet"
          ></q-input>
        </q-td>
        <q-td>
          <q-btn
            flat
            round
            icon="delete"
            @click="
              localMedications.splice(localMedications.indexOf(props.row, 1))
              "
          ></q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div class="flex justify-end q-py-lg">
    <q-btn
      color="primary"
      icon="add"
      @click="addMedication"
    >
      Agregar Medicamento
    </q-btn>
  </div>
</template>

<style>
.q-table td {
  vertical-align: middle;
}

.q-table td:nth-child(5) {
  font-size: 14px;
  width: 185px;
  padding: 10px;
  box-sizing: border-box;
}

.q-table tr:nth-child(even) {
  background-color: #f3f4f6;
  /* Color de fondo para filas pares */
}
</style>

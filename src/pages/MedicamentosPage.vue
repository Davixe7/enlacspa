<script setup>
import { reactive, ref } from "vue";

const props = defineProps({
  medicamentos: {
    type: Array,
    default: () => [],
  },
});
const medicamento = reactive({
  nombre: "",
  dosis: "",
  frecuencia: "",
  tiempo: "",
  observaciones: "",
});

function addMedicamento() {
  medicamento.nombre = "";
  medicamento.dosis = "";
  medicamento.frecuencia = "";
  medicamento.tiempo = "";
  medicamento.observaciones = "";
  localMedicamentos.value.push({ ...medicamento });
}

const localMedicamentos = ref([...props.medicamentos]);
const columns = ref([
  {
    name: "nombre",
    field: "nombre",
    label: "Nombre del medicamento",
    align: "left",
  },
  { name: "dosis", field: "dosis", label: "Dosis", align: "left" },
  {
    name: "frecuencia",
    field: "frecuencia",
    label: "Frecuencia",
    align: "left",
  },
  {
    name: "tiempo",
    field: "tiempo",
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
    :rows="localMedicamentos"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td>
          <q-input
            outlined
            placeholder="Ej: Paracetamol"
            v-model="props.row.nombre"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 500 mg"
            v-model="props.row.dosis"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 2 Veces al dia"
            v-model="props.row.frecuencia"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            outlined
            placeholder="Ej: 1 Semana"
            v-model="props.row.tiempo"
          ></q-input>
        </q-td>
        <q-td>
          <q-input
            type="textarea"
            outlined
            v-model="props.row.observaciones"
          ></q-input>
        </q-td>
        <q-td>
          <q-btn
            flat
            round
            icon="delete"
            @click="
              localMedicamentos.splice(localMedicamentos.indexOf(props.row, 1))
            "
          ></q-btn>
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div class="flex justify-end q-py-lg">
    <q-btn color="primary" icon="add" @click="addMedicamento">
      Agregar medicamento
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
  background-color: #f3f4f6; /* Color de fondo para filas pares */
}
</style>

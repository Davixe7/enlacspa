<script setup>
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { formatDate } from "src/utils/formatDate";

const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  rows.value = (await api.get("beneficiaries")).data.data;
  loading.value = false;
});

const rows = ref([]);
const columns = ref([
  {
    name: "name",
    label: "Nombre del Beneficiario",
    field: "name",
    align: "left",
    sortable: true,
  },
  {
    name: "sheet",
    label: "Folio",
    field: "sheet",
    align: "left",
    sortable: true,
  },
  {
    name: "status",
    label: "Estatus",
    field: "status",
    align: "left",
    sortable: true,
  },
  {
    name: "onboard_at",
    label: "Fecha de ingreso",
    field: (row) => (row.onboard_at ? formatDate(row.onboard_at) : "Pendiente"),
    align: "left",
    sortable: true,
  },
  {
    name: "program_name",
    label: "Programa",
    field: "program_name",
    align: "left",
    sortable: true,
  },
  {
    name: "actions",
    label: "Acciones",
    field: "actions",
    align: "right",
  },
]);
</script>

<template>
  <h1 class="page-title">Admisiones y Beneficiarios</h1>
  <q-table
    bordered
    flat
    hide-bottom
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    :loading="loading"
  >
    <template v-slot:loading>
      <div class="flex q-my-lg justify-center">
        <div>
          <q-spinner
            size="30px"
            color="primary"
            class="q-mr-md"
          ></q-spinner>
          Cargando...
        </div>
      </div>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-table__actions q-py-xs">
        <q-btn
          round
          unelevated
          dense
          icon="sym_o_visibility"
          :to="`beneficiarios/${props.row.id}/perfil`"
        />

        <q-btn
          round
          unelevated
          dense
          icon="sym_o_folder"
          :to="`beneficiarios/${props.row.id}/kardex`"
        />

        <q-btn
          round
          unelevated
          dense
          icon="sym_o_calendar_month"
          :to="`beneficiarios/${props.row.id}/citas`"
        />

        <q-btn
          round
          unelevated
          dense
          icon="sym_o_attach_money"
          :to="`beneficiarios/${props.row.id}/cuotas`"
        />
      </q-td>
    </template>
  </q-table>
</template>

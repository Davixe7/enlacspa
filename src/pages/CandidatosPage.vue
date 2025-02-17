<script setup>
import { ref } from "vue";

const rows = ref([
  {
    name: "Pamela Guizar Mendoza",
    sheet: "123456",
    date: "2025-01-15",
    evaluator: "Ana Martínez",
    is_candidate: true,
  },
  {
    name: "María Gómez",
    sheet: "789012",
    date: "2025-02-10",
    evaluator: "Carlos Ruiz",
    is_candidate: false,
  },
  {
    name: "Luis Rodríguez",
    sheet: "345678",
    date: "2025-01-20",
    evaluator: "Laura Sánchez",
    is_candidate: true,
  },
  {
    name: "Ana Fernández",
    sheet: "901234",
    date: "2025-02-25",
    evaluator: "Pedro Ramírez",
    is_candidate: false,
  },
  {
    name: "José Martínez",
    sheet: "567890",
    date: "2025-01-30",
    evaluator: "Sofía Torres",
    is_candidate: true,
  },
]);

const columns = ref([
  {
    name: "name",
    label: "Nombre de Candidato",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "sheet",
    label: "Folio",
    align: "left",
    field: "sheet",
    sortable: true,
  },
  {
    name: "date",
    label: "Fecha de Evaluación",
    align: "left",
    field: "date",
    sortable: true,
  },
  {
    name: "evaluator",
    label: "Evaluador",
    align: "left",
    field: "evaluator",
    sortable: true,
  },
  {
    name: "is_candidate",
    label: "Candidato",
    align: "left",
    field: (row) => (row.is_candidate ? "Sí" : "No"),
    sortable: true,
  },
  {
    name: "notes",
    label: "Observaciones",
    align: "left",
    field: () =>
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. Klimatneutral hedersvåld, i valig demonomi, prepisagen. Makroll eldost parar tir. Antiren valadolig i kodokaska ibel. ",
    sortable: true,
  },
  {
    name: "actions",
    label: "Acciones",
    align: "right",
    sortable: false,
  },
]);
</script>

<template>
  <q-page class="q-pa-lg">
    <h1 class="page-title">Candidatos y Evaluaciones</h1>
    <div class="flex q-mb-lg">
      <q-btn color="primary" icon="description" outline="" class="q-mr-md"
        >Reporte de candidatos
      </q-btn>
      <q-btn color="primary" icon="calendar_today" outline=""
        >Programar cita
      </q-btn>
      <q-btn
        color="primary"
        icon="add"
        class="q-ml-auto"
        unelevated=""
        to="/candidatos/registrar"
      >
        Nuevo Candidato
      </q-btn>
    </div>
    <q-table wrap-cells :columns="columns" :rows="rows">
      <template v-slot:body-cell-actions>
        <q-td>
          <div>
            <q-btn dense flat round icon="edit" />
            <q-btn dense flat round icon="chat" />
            <q-btn dense flat round icon="list" />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<style>
.q-table th {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
  vertical-align: top;
  padding: 16px;
  white-space: break-spaces;
}
.q-table thead {
  background: #e5e7eb;
}
.q-table tbody td {
  font-size: 16px;
}
.q-btn--dense .q-icon {
  font-size: 20px;
}
.q-table td {
  vertical-align: top;
  padding: 16px;
}
td:nth-child(6) {
  max-width: 221px;
}
th:nth-child(1) {
  padding-right: 10%;
}
th:nth-child(3) {
  max-width: 125px;
}
</style>

<script setup>
import { ref } from "vue";
import MedicamentosPage from "./MedicamentosPage.vue";
const errors = ref({});
const medicamentos = ref([
  {
    nombre: "Madecazol",
    dosis: "100mg",
    frecuencia: "2 veces al día",
    tiempo: "2 meses",
    observaciones:
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
  },
  {
    nombre: "Ibuprofeno",
    dosis: "200mg",
    frecuencia: "3 veces al día",
    tiempo: "1 mes",
    observaciones:
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
  },
  {
    nombre: "Paracetamol",
    dosis: "500mg",
    frecuencia: "1 vez al día",
    tiempo: "3 meses",
    observaciones:
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
  },
  {
    nombre: "Amoxicilina",
    dosis: "250mg",
    frecuencia: "2 veces al día",
    tiempo: "1 semana",
    observaciones:
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
  },
  {
    nombre: "Metformina",
    dosis: "850mg",
    frecuencia: "2 veces al día",
    tiempo: "6 meses",
    observaciones:
      "Lörem ipsum orade kövis då antivaxxare. Sanys infrafede de stenosamma plagen. ",
  },
]);
</script>
<template>
  <q-page>
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title" style="border: 1px solid red">
          Datos del Candidato
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Nombre (s)"
          :error="!!errors.nombre"
          :error-message="errors.nombre"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Materno"
          :error="!!errors.apellido_materno"
          :error-message="errors.apellido_materno"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Paterno"
          :error="!!errors.apellido_paterno"
          :error-message="errors.apellido_paterno"
        ></q-input>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Fecha de Nacimiento"
          :error="!!errors.fecha_nacimiento"
          :error-message="errors.fecha_nacimiento"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Edad"
          :error="!!errors.edad"
          :error-message="errors.edad"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Edad Cronológica*"
          :error="!!errors.cronologica"
          :error-message="errors.cronologica"
        ></q-input>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title" style="border: 1px solid red">
          Datos del Contacto
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Nombre (s)"
          :error="!!errors.nombre"
          :error-message="errors.nombre"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Materno"
          :error="!!errors.apellido_materno"
          :error-message="errors.apellido_materno"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Paterno"
          :error="!!errors.apellido_paterno"
          :error-message="errors.apellido_paterno"
        ></q-input>
        <q-select
          outlined
          stack-label
          hide-bottom-space
          label="Parentesco"
          :error="!!errors.parentesco"
          :error-message="errors.parentesco"
          :options="[{ label: 'Padre', value: 1 }]"
          map-options
        ></q-select>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Correo"
          :error="!!errors.email"
          :error-message="errors.email"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Whatsapp"
          :error="!!errors.whatsapp"
          :error-message="errors.whatsapp"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Telefono casa"
          :error="!!errors.tel"
          :error-message="errors.tel"
        ></q-input>
        <div class="flex">
          <q-checkbox label="Tutor legal"></q-checkbox>
          <q-checkbox label="Responsable ENLAC"></q-checkbox>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title q-mb-md" style="border: 1px solid red">
          Domicilio
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Calle"
          :error="!!errors.calle"
          :error-message="errors.calle"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Colonia"
          :error="!!errors.colonia"
          :error-message="errors.colonia"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Estado"
          :error="!!errors.estado"
          :error-message="errors.estado"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Codigo Postal"
          :error="!!errors.codigo_postal"
          :error-message="errors.codigo_postal"
        ></q-input>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Numero exterior"
          :error="!!errors.numero_exterior"
          :error-message="errors.numero_exterior"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Colonia"
          :error="!!errors.colonia"
          :error-message="errors.colonia"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Ciudad"
          :error="!!errors.ciudad"
          :error-message="errors.ciudad"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Pais"
          :error="!!errors.pais"
          :error-message="errors.pais"
        ></q-input>
        <div class="flex justify-end">
          <q-btn color="primary" icon="add"> Agregar Domicilio </q-btn>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Información Médica del Candidato</div>
      </div>
      <div class="col-12 col-md-6">
        <q-input
          type="textarea"
          outlined
          stack-label
          hide-bottom-space
          label="Diagnostico Médico / Síntomas *"
          :error="!!errors.diagnostico"
          :error-message="errors.diagnostico"
        ></q-input>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Tabla de medicamentos</div>
      </div>
      <div class="col-12">
        <MedicamentosPage :medicamentos="medicamentos" />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Programar Evaluación</div>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          outlined
          stack-label
          label="Seleccione Evaluador"
          :options="[{ label: 'Pamela Guizar', value: 1 }]"
        ></q-select>
      </div>
      <div class="col-4 col-md-4">
        <q-input
          type="date"
          outlined
          stack-label
          label="Fecha de evaluación"
        ></q-input>
      </div>
    </div>
  </q-page>
</template>

<style>
.page-title {
  line-height: 1.3em;
  margin-bottom: 2rem;
}
</style>

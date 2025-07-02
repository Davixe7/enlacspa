<script setup>
const model = defineModel()

// Opciones de ejemplo
const fiscalRegimeOptions = [
  { label: '601 - General de Ley Personas Morales', value: '601' },
  { label: '612 - Personas Físicas con Actividades Empresariales', value: '612' }
  // Agrega más según SAT
]

const cfdiOptions = [
  { label: 'G03 - Gastos en general', value: 'G03' },
  { label: 'P01 - Por definir', value: 'P01' }
  // Agrega más opciones necesarias
]
</script>

<template>
  <div class="q-gutter-y-md">
    <!-- QInputs -->
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <q-input
          outlined
          stack-label
          label="RFC"
          v-model="model.rfc"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-8">
        <q-input
          outlined
          stack-label
          label="Nombre o Razón Social"
          v-model="model.company_name"
          hide-bottom-space
        />
      </div>
    </div>
    <!-- QSelects -->
    <div class="row q-col-gutter-x-md">
      <q-select
        outlined
        stack-label
        label="Régimen Fiscal"
        v-model="model.fiscalRegime"
        :options="fiscalRegimeOptions"
        hide-bottom-space
        emit-value
        map-options
        class="col-12 col-md-4"
      />
      <q-select
        outlined
        stack-label
        label="Uso de CFDI"
        v-model="model.cfdi"
        :options="cfdiOptions"
        hide-bottom-space
        emit-value
        map-options
        class="col-12 col-md-4"
      />
      <q-input
        outlined
        stack-label
        label="Correo"
        v-model="model.email"
        hide-bottom-space
        class="col-12 col-md-4"
      />
    </div>

    <div class="form-section-label">Domicilio</div>
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-2">
        <q-input
          outlined
          stack-label
          label="Calle"
          v-model="model.street"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          outlined
          stack-label
          label="Número exterior"
          v-model="model.external_number"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          outlined
          stack-label
          label="Código Postal"
          v-model="model.zip_code"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-4">
        <q-input
          outlined
          stack-label
          label="Colonia"
          v-model="model.neighborhood"
          hide-bottom-space
        />
      </div>
    </div>
    <div class="address-form">
      <q-input
        outlined
        stack-label
        label="Ciudad"
        v-model="model.city"
        hide-bottom-space
      />
      <q-input
        outlined
        stack-label
        label="Estado"
        v-model="model.state"
        hide-bottom-space
      />
      <q-input
        outlined
        stack-label
        label="País"
        v-model="model.country"
        hide-bottom-space
      />
    </div>

    <div class="form-section-label">Otros</div>
    <q-input
      outlined
      stack-label
      label="Observaciones"
      v-model="model.observations"
      hide-bottom-space
    />
    <q-input
      outlined
      stack-label
      label="Constancia de situación fiscal"
      v-model="model.fiscalStatus"
      hide-bottom-space
    />
  </div>
</template>

<style lang="scss">
.form-section-label {
  color: var(--q-primary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.address-form {
  display: flex;
  flex-wrap: wrap;
  > .q-field {
    width: 30%;
    margin-right: 24px;
    margin-bottom: 16px;
    &::nth-child(3) {
      margin-right: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}
.address-form .q-field:nth-child(3),
.address-form .q-field:nth-child(6) {
  margin-right: 0 !important;
}
</style>

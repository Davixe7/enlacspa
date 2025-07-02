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
  <div class="receipt-form">
    <!-- QInputs -->
    <div class="row q-col-gutter-x-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-input
          outlined
          stack-label
          label="RFC"
          v-model="model.rfc"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-sm-8">
        <q-input
          outlined
          stack-label
          label="Nombre o Razón Social"
          v-model="model.company_name"
          hide-bottom-space
        />
        <q-input
          outlined
          stack-label
          label="Correo"
          v-model="model.email"
          hide-bottom-space
        />
        <q-select
          outlined
          stack-label
          label="Régimen Fiscal"
          v-model="model.fiscalRegime"
          :options="fiscalRegimeOptions"
          hide-bottom-space
          emit-value
          map-options
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
        />
      </div>
    </div>

    <div class="form-section-label q-mb-none">Domicilio</div>
    <div class="row q-col-gutter-x-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-input
          outlined
          stack-label
          label="Calle"
          v-model="model.street"
          hide-bottom-space
        />

        <q-input
          outlined
          stack-label
          label="Número exterior"
          v-model="model.external_number"
          hide-bottom-space
        />

        <q-input
          outlined
          stack-label
          label="Código Postal"
          v-model="model.zip_code"
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-sm-8">
        <q-input
          outlined
          stack-label
          label="Colonia"
          v-model="model.neighborhood"
          hide-bottom-space
        />
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
    </div>

    <div class="form-section-label q-mb-none">Otros</div>
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
.receipt-form .q-field--labeled {
  .q-field__label {
    font-size: 13px;
    top: -8px !important;
    left: -6px;
    z-index: 1000;
    padding: 0 4px;
    background: #fff;
  }
  .q-field--auto-height .q-field__native {
    padding-top: 8px !important;
  }
  .q-field__native {
    color: rgba(0, 0, 0, 0.6);
  }
}

.form-section-label {
  color: var(--q-primary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.address-form {
  display: flex;
  flex-wrap: wrap;
  > .q-field {
    width: 31%;
    margin-right: 16px;
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

<script setup>
const model = defineModel()
const props = defineProps(['errors'])

const fiscalRegimeOptions = [
  { value: 601, label: 'General de Ley Personas Morales' },
  { value: 603, label: 'Personas Morales con Fines no Lucrativos' },
  { value: 605, label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: 606, label: 'Arrendamiento' },
  { value: 607, label: 'Régimen de Enajenación o Adquisición de Bienes' },
  { value: 608, label: 'Demás ingresos' },
  { value: 610, label: 'Residentes en el Extranjero sin Establecimiento Permanente en México' },
  { value: 611, label: 'Ingresos por Dividendos (socios y accionistas)' },
  { value: 612, label: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: 614, label: 'Ingresos por intereses' },
  { value: 615, label: 'Régimen de los ingresos por obtención de premios' },
  { value: 616, label: 'Sin obligaciones fiscales' },
  { value: 620, label: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
  { value: 621, label: 'Incorporación Fiscal' },
  { value: 622, label: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: 623, label: 'Opcional para Grupos de Sociedades' },
  { value: 624, label: 'Coordinados' },
  {
    value: 625,
    label:
      'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas'
  },
  { value: 626, label: 'Régimen Simplificado de Confianza' }
]

const cfdiOptions = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina para inversiones' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'I04', label: 'I04 - Equipo de cómputo y accesorios' },
  { value: 'I05', label: 'I05 - Dados, troqueles, moldes, matrices y herramental' },
  { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
  { value: 'I07', label: 'I07 - Comunicaciones satelitales' },
  { value: 'I08', label: 'I08 - Otra maquinaria y equipo' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y hospitalarios' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { value: 'D03', label: 'D03 - Gastos funerales' },
  { value: 'D04', label: 'D04 - Donativos' },
  { value: 'D05', label: 'D05 - Intereses reales pagados por créditos hipotecarios' },
  { value: 'D06', label: 'D06 - Aportaciones voluntarias al SAR' },
  { value: 'D07', label: 'D07 - Primas de seguros de gastos médicos' },
  { value: 'D08', label: 'D08 - Gastos de transportación escolar obligatoria' },
  { value: 'D09', label: 'D09 - Depósitos en cuentas para el ahorro, primas de pensiones' },
  { value: 'D10', label: 'D10 - Pagos por servicios educativos (colegiaturas)' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
  { value: 'CP01', label: 'CP01 - Pagos' },
  { value: 'CN01', label: 'CN01 - Nómina' }
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
          :error="!!props.errors['receipt.rfc']"
          :error-message="props.errors['receipt.rfc']"
        />
      </div>
      <div class="col-12 col-sm-8">
        <q-input
          outlined
          stack-label
          label="Nombre o Razón Social"
          v-model="model.company_name"
          hide-bottom-space
          :error="!!props.errors['receipt.company_name']"
          :error-message="props.errors['receipt.company_name']"
        />
        <q-input
          outlined
          stack-label
          label="Correo"
          v-model="model.email"
          hide-bottom-space
          :error="!!props.errors['receipt.email']"
          :error-message="props.errors['receipt.email']"
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
          :error="!!props.errors['receipt.fiscalRegime']"
          :error-message="props.errors['receipt.fiscalRegime']"
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
          :error="!!props.errors['receipt.cfdi']"
          :error-message="props.errors['receipt.cfdi']"
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
          :error="!!props.errors['receipt.street']"
          :error-message="props.errors['receipt.street']"
        />

        <q-input
          outlined
          stack-label
          label="Número exterior"
          v-model="model.external_number"
          hide-bottom-space
          :error="!!props.errors['receipt.external_number']"
          :error-message="props.errors['receipt.external_number']"
        />

        <q-input
          outlined
          stack-label
          label="Código Postal"
          v-model="model.zip_code"
          hide-bottom-space
          :error="!!props.errors['receipt.zip_code']"
          :error-message="props.errors['receipt.zip_code']"
        />
      </div>
      <div class="col-12 col-sm-8">
        <q-input
          outlined
          stack-label
          label="Colonia"
          v-model="model.neighborhood"
          hide-bottom-space
          :error="!!props.errors['receipt.neighborhood']"
          :error-message="props.errors['receipt.neighborhood']"
        />
        <q-input
          outlined
          stack-label
          label="Ciudad"
          v-model="model.city"
          hide-bottom-space
          :error="!!props.errors['receipt.city']"
          :error-message="props.errors['receipt.city']"
        />
        <q-input
          outlined
          stack-label
          label="Estado"
          v-model="model.state"
          hide-bottom-space
          :error="!!props.errors['receipt.state']"
          :error-message="props.errors['receipt.state']"
        />
        <q-input
          outlined
          stack-label
          label="País"
          v-model="model.country"
          hide-bottom-space
          :error="!!props.errors['receipt.country']"
          :error-message="props.errors['receipt.country']"
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
      :error="!!props.errors['receipt.observations']"
      :error-message="props.errors['receipt.observations']"
    />
    <q-input
      outlined
      stack-label
      label="Constancia de situación fiscal"
      v-model="model.fiscalStatus"
      hide-bottom-space
      :error="!!props.errors['receipt.fiscalStatus']"
      :error-message="props.errors['receipt.fiscalStatus']"
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

<template>
  <q-card
    flat
    outlined
    class="q-pa-md"
  >
    <div class="text-h6 q-mb-md">Datos del Candidato</div>

    <div class="row q-col-gutter-md">
      <!-- 1. Recorrido -->
      <div class="col-12">
        <q-input
          v-model="form.facility_tour_notes"
          label="1. ¿Se le dio recorrido por las instalaciones?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 2. Escuela Regular Actual -->
      <div class="col-12 col-md-4">
        <q-field
          label="2. ¿Asiste actualmente a una escuela regular?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.attends_regular_school"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.attends_regular_school"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 3. Escuela Regular Anterior -->
      <div class="col-12 col-md-4">
        <q-field
          label="3. ¿Asistió anteriormente?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.previously_attended_regular_school"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.previously_attended_regular_school"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 4. Grado -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="form.regular_school_grade"
          label="4. ¿A qué grado?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 5. Escuela Especializada Actual -->
      <div class="col-12 col-md-4">
        <q-field
          label="5. ¿Asiste actualmente a otra institución o escuela especializada?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.attends_specialized_school"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.attends_specialized_school"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 6. Escuela Especializada Anterior -->
      <div class="col-12 col-md-4">
        <q-field
          label="6. ¿Asistió anteriormente?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.previously_attended_specialized_school"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.previously_attended_specialized_school"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 7. Costo -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="form.specialized_school_cost"
          type="number"
          prefix="$"
          label="7. ¿Cuál es o era el costo de esa institución?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 8. Encargado Sostenimiento -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="form.financial_provider_name"
          label="8. ¿Quién es la persona encargada del sostenimiento del Candidato?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 9. Empleo Formal -->
      <div class="col-12 col-md-4">
        <q-field
          label="9. ¿Tiene un empleo formal?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.has_formal_employment"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.has_formal_employment"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 10. Dónde labora -->
      <div class="col-12 col-md-4">
        <q-input
          v-model="form.workplace"
          label="10. ¿Dónde labora?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 11. Cuidado de hijos (Texto Amplio) -->
      <div class="col-12">
        <q-input
          v-model="form.childcare_provider"
          type="textarea"
          label="11. ¿Quién se encarga de cuidar a sus hijos cuando usted no está disponible?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 12. Más hijos -->
      <div class="col-12">
        <q-field
          label="12. ¿Tiene más hijos?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.has_more_children"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.has_more_children"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 13. Cuántos y edades (Texto Amplio) -->
      <div
        class="col-12 col-md-4"
        v-show="form.has_more_children"
      >
        <q-input
          v-model="form.other_children_details"
          type="textarea"
          label="13. ¿Cuántos y de qué edades?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 14. Escuelas hijos (Texto Amplio) -->
      <div
        class="col-12 col-md-4"
        v-show="form.has_more_children"
      >
        <q-input
          v-model="form.other_children_schools"
          type="textarea"
          label="14. ¿A qué escuela(s) asiste(n)?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 15. Dedicación hijos (Texto Amplio) -->
      <div
        class="col-12 col-md-4"
        v-show="form.has_more_children"
      >
        <q-input
          v-model="form.other_children_occupations"
          type="textarea"
          label="15. O, ¿a qué se dedican?"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
    </div>
  </q-card>

  <q-card
    flat
    outlined
    class="q-pa-md q-mt-md"
  >
    <div class="text-h6 q-mb-md">Datos Generales del Solicitante del Estudio Socio-Económico</div>

    <div class="row q-col-gutter-md">
      <!-- 1. Nombre de quien solicita -->
      <div class="col-12 col-md-8">
        <q-input
          v-model="form.requester_name"
          label="1. Nombre de quien solicita"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 2. Parentesco -->
      <div class="col-12 col-md-4">
        <q-select
          v-model="form.requester_relationship"
          :options="relationshipOptions"
          label="2. Parentesco"
          stack-label
          outlined
          hide-bottom-space
          emit-value
          map-options
        />
      </div>

      <!-- 3. Edad -->
      <div class="col-12 col-md">
        <q-input
          v-model.number="form.requester_age"
          type="number"
          label="3. Edad"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 4. Fecha de Nacimiento -->
      <div class="col-12 col-md">
        <q-input
          v-model="form.requester_birth_date"
          type="date"
          label="4. Fecha de Nacimiento"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 5. Sexo -->
      <div class="col-12 col-md">
        <q-input
          v-model="form.requester_gender"
          label="5. Sexo"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 6. Estado Civil -->
      <div class="col-12 col-md">
        <q-select
          v-model="form.requester_marital_status"
          :options="maritalStatusOptions"
          label="6. Estado Civil"
          stack-label
          outlined
          hide-bottom-space
          emit-value
          map-options
        />
      </div>

      <!-- 7. Teléfono -->
      <div class="col-12 col-md">
        <q-input
          v-model="form.requester_phone"
          label="7. Teléfono"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- Originario de -->
      <div class="col-12">
        <q-input
          v-model="form.requester_origin"
          label="Originario de"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 8. Domicilio (Desglosado según el documento) -->
      <div class="col-12"><div class="text-subtitle2">8. Domicilio</div></div>

      <div class="col-12 col-md-6">
        <q-input
          v-model="form.address_street"
          label="Calle"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-2">
        <q-input
          v-model="form.address_ext_num"
          label="Núm. Exterior"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-4">
        <q-input
          v-model="form.address_colony"
          label="Colonia"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.address_zip_code"
          label="Código Postal"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.address_country"
          label="País"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.address_state"
          label="Estado"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.address_city"
          label="Ciudad"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 9. Servicio Médico -->
      <div class="col-12 col-md-6">
        <q-field
          label="9. ¿Cuenta con servicio médico?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.has_medical_service"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.has_medical_service"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 10. Institución -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.medical_institution"
          label="10. ¿Con qué institución?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.has_medical_service"
        />
      </div>

      <!-- 11. Atención Médica Especializada -->
      <div class="col-12 col-md-6">
        <q-field
          label="11. ¿Tiene acceso a atención médica especializada?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.has_specialized_medical_access"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.has_specialized_medical_access"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 12. De qué tipo -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.specialized_medical_type"
          label="12. ¿De qué tipo?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.has_specialized_medical_access"
        />
      </div>
    </div>
  </q-card>

  <q-card
    flat
    outlined
    class="q-pa-md q-mt-md"
  >
    <div class="text-h6 q-mb-md">Datos de Vivienda</div>

    <div class="row q-col-gutter-md">
      <!-- 1. Casa construida de -->
      <div class="col-12 col-md-6">
        <q-field
          label="1. Casa construida de:"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.wall_material"
              val="Ladrillo"
              label="Ladrillo"
            />
            <q-radio
              v-model="form.wall_material"
              val="Block"
              label="Block"
            />
            <q-radio
              v-model="form.wall_material"
              :val="customWall"
              label="Otro:"
            />
            <q-input
              v-if="
                !['Ladrillo', 'Block'].includes(form.wall_material) ||
                form.wall_material === customWall
              "
              v-model="customWall"
              dense
              placeholder="Especifique material"
              @update:model-value="form.wall_material = customWall"
              stack-label
              outlined
              hide-bottom-space
            />
          </template>
        </q-field>
      </div>

      <!-- 2. Techo de -->
      <div class="col-12 col-md-6">
        <q-field
          label="2. Techo de:"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.roof_material"
              val="Losa"
              label="Losa"
            />
            <q-radio
              v-model="form.roof_material"
              val="Lámina"
              label="Lámina"
            />
            <q-radio
              v-model="form.roof_material"
              val="Cartón"
              label="Cartón"
            />
            <q-radio
              v-model="form.roof_material"
              :val="customRoof"
              label="Otro:"
            />
            <q-input
              v-if="
                !['Losa', 'Lámina', 'Cartón'].includes(form.roof_material) ||
                form.roof_material === customRoof
              "
              v-model="customRoof"
              dense
              placeholder="Especifique material de techo"
              @update:model-value="form.roof_material = customRoof"
              stack-label
              outlined
              hide-bottom-space
            />
          </template>
        </q-field>
      </div>

      <!-- 3. Casa (Situación Legal) -->
      <div class="col-12 col-md-6">
        <q-field
          label="3. Casa:"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.housing_status"
              val="Propia"
              label="Propia"
            />
            <q-radio
              v-model="form.housing_status"
              val="Renta"
              label="Renta"
            />
            <q-radio
              v-model="form.housing_status"
              val="Prestada"
              label="Prestada"
            />
            <q-radio
              v-model="form.housing_status"
              :val="customHousing"
              label="Otro:"
            />
            <q-input
              v-if="
                !['Propia', 'Renta', 'Prestada'].includes(form.housing_status) ||
                form.housing_status === customHousing
              "
              v-model="customHousing"
              dense
              placeholder="Especifique situación"
              @update:model-value="form.housing_status = customHousing"
              stack-label
              outlined
              hide-bottom-space
            />
          </template>
        </q-field>
      </div>

      <!-- 4. Número de baños y 5. Recámaras -->
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.bathroom_count"
          label="4. Número de baños"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.bedroom_count"
          label="5. Número de recámaras"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- 6. Servicios con los que cuenta (Scroll Vertical) -->
      <div class="col-12 col-md-6">
        <q-field
          label="6. Servicios con los que cuenta:"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-checkbox
              v-model="form.service_water"
              label="Agua"
              class="q-mr-sm"
              :true-value="1"
            />
            <q-checkbox
              v-model="form.service_drainage"
              label="Drenaje"
              class="q-mr-sm"
              :true-value="1"
            />
            <q-checkbox
              v-model="form.service_electricity"
              label="Luz"
              class="q-mr-sm"
              :true-value="1"
            />
            <q-checkbox
              v-model="form.service_phone"
              label="Teléfono"
              class="q-mr-sm"
              :true-value="1"
            />
            <q-checkbox
              v-model="form.service_internet"
              label="Internet"
              :true-value="1"
            />
          </template>
        </q-field>
      </div>

      <!-- 7. Vehículo propio -->
      <div class="col-12 col-md-6">
        <q-field
          label="7. ¿Tiene vehículo propio?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.has_vehicle"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.has_vehicle"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 8. Medio de transporte -->
      <div class="col-12">
        <q-input
          v-model="form.transport_method"
          label="8. Si no cuenta con vehículo propio, ¿cuál es su medio de transporte?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.has_vehicle"
        />
      </div>
    </div>
  </q-card>

  <q-card
    flat
    outlined
    class="q-pa-md q-mt-md"
  >
    <div class="text-h6 q-mb-md">Personas que Habitan en el Hogar e Ingresos Mensuales</div>

    <FamilyMembers
      :candidateId="props.candidateId"
      v-model="familyData"
    />

    <div class="row q-col-gutter-md">
      <!-- 1. Número de personas -->
      <div class="col-12 col-md-4">
        <q-input
          v-model.number="form.household_members_count"
          type="number"
          label="1. Número de personas que habitan en el hogar"
          stack-label
          outlined
          hide-bottom-space
        />
      </div>

      <!-- Espaciador para alinear con el diseño -->
      <div class="col-md-8"></div>

      <!-- 7. Otras personas con discapacidad -->
      <div class="col-12 col-md-6">
        <q-field
          label="7. ¿Viven en casa otras personas con discapacidad?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.other_disabled_members"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.other_disabled_members"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 8. Tipo de discapacidad -->
      <div class="col-12 col-md-6">
        <q-input
          v-model="form.disabled_members_type"
          label="8. Tipo de discapacidad"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.other_disabled_members"
        />
      </div>

      <!-- 9. Cuántas y 10. Edades -->
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.disabled_members_count"
          label="9. ¿Cuántas?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.other_disabled_members"
        />
      </div>
      <div class="col-12 col-md-9">
        <q-input
          v-model="form.disabled_members_ages"
          label="10. ¿De qué edades?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.other_disabled_members"
        />
      </div>

      <!-- 2. Apoyo gubernamental -->
      <div class="col-12 col-md-6">
        <q-field
          label="2. ¿Recibe algún tipo de apoyo gubernamental o institucional?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.receives_govt_support"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.receives_govt_support"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 3. Institución y 4. Monto -->
      <div class="col-12 col-md-3">
        <q-input
          v-model="form.govt_support_institution"
          label="3. ¿De qué institución?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.receives_govt_support"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model.number="form.govt_support_amount"
          type="number"
          prefix="$"
          label="4. ¿Cuál es el monto?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.receives_govt_support"
        />
      </div>

      <!-- 5. Ingreso adicional -->
      <div class="col-12 col-md-6">
        <q-field
          label="5. ¿Recibe algún ingreso adicional?"
          stack-label
          outlined
        >
          <template v-slot:control>
            <q-radio
              v-model="form.receives_additional_income"
              :val="1"
              label="Sí"
            />
            <q-radio
              v-model="form.receives_additional_income"
              :val="0"
              label="No"
            />
          </template>
        </q-field>
      </div>

      <!-- 6. Monto adicional -->
      <div class="col-12 col-md-6">
        <q-input
          v-model.number="form.additional_income_amount"
          type="number"
          prefix="$"
          label="6. ¿Cuál es el monto?"
          stack-label
          outlined
          hide-bottom-space
          :disable="!form.receives_additional_income"
        />
      </div>
    </div>
  </q-card>

  <q-card flat>
    <q-card-section
      class="flex items-center"
      style="flex-flow: column"
    >
      <div class="text-h6 q-mb-md text-center">Gastos Mensuales</div>
      <q-markup-table
        flat
        bordered
        style="width: 800px; margin: 0 auto"
      >
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="field in expensesFormFields"
            :key="field"
          >
            <td>{{ field.label }}:</td>
            <td>
              <q-input
                v-model.number="form[field.field]"
                type="number"
                prefix="$"
                outlined
                hide-bottom-space
              />
            </td>
          </tr>

          <tr>
            <td>Total de gastos:</td>
            <td>$ {{ totalExpenses }}</td>
          </tr>
          <tr>
            <td>Total de ingresos:</td>
            <td>$ {{ familyData.income }}</td>
          </tr>
          <tr>
            <td>Diferencia:</td>
            <td>$ {{ familyData.income - totalExpenses }}</td>
          </tr>
          <tr>
            <td>Solvencia económica:</td>
            <td>
              <q-input
                v-model.number="form.solvency_notes"
                outlined
                hide-bottom-space
              />
            </td>
          </tr>
          <tr>
            <td>Nivel:</td>
            <td>
              <q-input
                v-model.number="form.economic_level"
                outlined
                hide-bottom-space
              />
            </td>
          </tr>
          <tr>
            <td>Cantidad que podría aportar/mes:</td>
            <td>
              <q-input
                v-model.number="form.monthly_contribution_amount"
                type="number"
                prefix="$"
                outlined
                hide-bottom-space
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>

  <div class="flex justify-end">
    <q-btn
      label="Guardar"
      :loading="loading"
      @click="storeProfile"
      color="primary"
    />
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
import FamilyMembers from 'src/components/FamilyMembers.vue'
import notify from 'src/utils/notify'
import { computed, onMounted, ref } from 'vue'

// Fecha de hoy por defecto como indica el documento [1]
const today = new Date().toISOString().substr(0, 10)

const form = ref({
  date: today,
  facility_tour_notes: '',
  attends_regular_school: 0,
  previously_attended_regular_school: 0,
  regular_school_grade: '',
  attends_specialized_school: 0,
  previously_attended_specialized_school: 0,
  specialized_school_cost: 0,
  financial_provider_name: '',
  has_formal_employment: 0,
  workplace: '',
  childcare_provider: '',
  has_more_children: 0,
  other_children_details: '',
  other_children_schools: '',
  other_children_occupations: '',

  //Requester
  requester_name: '',
  requester_relationship: null,
  requester_age: null,
  requester_birth_date: '',
  requester_gender: '',
  requester_marital_status: null,
  requester_phone: '',
  requester_origin: '',
  address_street: '',
  address_ext_num: '',
  address_colony: '',
  address_zip_code: '',
  address_country: '',
  address_state: '',
  address_city: '',
  has_medical_service: 0,
  medical_institution: '',
  has_specialized_medical_access: 0,
  specialized_medical_type: '',

  //Vivienda
  wall_material: 'Ladrillo',
  roof_material: 'Losa',
  housing_status: 'Propia',
  bathroom_count: '',
  bedroom_count: '',
  service_water: 0,
  service_drainage: 0,
  service_electricity: 0,
  service_phone: 0,
  service_internet: 0,
  has_vehicle: 0,
  transport_method: '',

  expense_rent: 0,
  expense_electricity: 0,
  expense_water: 0,
  expense_food: 0,
  expense_special_supplies: 0,
  expense_phone: 0,
  expense_school: 0,
  expense_gas: 0,
  expense_gasoline: 0,
  expense_medical: 0,
  expense_debts: 0,
  expense_others: 0,

  total_expenses: 0,
  total_income: 0,
  income_expense_difference: 0,
  monthly_contribution_amount: 0,

  solvency_notes: '',
  economic_level: ''
})

const expensesFormFields = [
  { field: 'expense_rent', label: 'Renta' },
  { field: 'expense_electricity', label: 'Luz' },
  { field: 'expense_water', label: 'Agua' },
  { field: 'expense_food', label: 'Alimentos' },
  { field: 'expense_special_supplies', label: 'Alimento especial y pañales' },
  { field: 'expense_phone', label: 'Teléfono' },
  { field: 'expense_school', label: 'Escuela' },
  { field: 'expense_gas', label: 'Gas' },
  { field: 'expense_gasoline', label: 'Gasolina' },
  { field: 'expense_medical', label: 'Medicamentos y servicios médicos' },
  { field: 'expense_debts', label: 'Deudas' },
  { field: 'expense_others', label: 'Otros' }
]

const totalExpenses = computed(() => {
  return expensesFormFields.reduce(
    (accumulator, field) => Number(form.value[field.field]) + accumulator,
    0
  )
})

const familyData = ref({ income: 0, contribution: 0 })

// Opciones extraídas de los catálogos del documento [3-5]
const relationshipOptions = [
  'Madre/Padre',
  'Hijo / Hija',
  'Hermano(a)',
  'Abuelo(a)',
  'Padrastro/Madrastra',
  'Hermanastro/Hermanastra',
  'Primo(a)',
  'Tío(a)'
]

const maritalStatusOptions = [
  'Soltero(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viudo(a)',
  'Unión Libre',
  'Desconocido'
]

// Variables auxiliares para la lógica de "Otro"
const customWall = ref('')
const customRoof = ref('')
const customHousing = ref('')

const props = defineProps(['candidateId'])

const loading = ref(false)
async function storeProfile() {
  try {
    loading.value = true
    let data = form.value.id ? { ...form.value, _method: 'PUT' } : { ...form.value }
    let route = form.value.id ? `socioeconomic_profiles/${form.value.id}` : 'socioeconomic_profiles'
    await api.post(route, data)
    notify.positive('Guardado con éxito')
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo guardar el perfil')
  } finally {
    loading.value = false
  }
}

async function fetchProfile() {
  try {
    loading.value = true
    let route = `socioeconomic_profiles/?candidate_id=${props.candidateId}`
    let response = (await api.get(route)).data.data
    form.value = response?.id ? response : form.value
    console.log(form.value)
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo cargar el perfil')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

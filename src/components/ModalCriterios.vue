<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)">
    <q-card style="width: 700px; max-width: 90vw;" class="q-pa-md shadow-2">

      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold text-primary flex items-center">
          <q-icon name="traffic" size="md" class="q-mr-sm" color="warning" />
          Criterios de Semáforo
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="text-subtitle2 q-mb-md text-grey-7">
          Consulta cómo se calculan los colores de cumplimiento para cada tipo de meta.
        </div>

        <q-list bordered separator class="rounded-borders">
          <q-expansion-item group="metas" icon="trending_up" label="1. Meta Normal" caption="Porcentaje de cumplimiento"
            header-class="text-bold text-primary">
            <q-card class="bg-grey-1">
              <q-card-section>
                <p><strong>Descripción:</strong> Se evalúa qué tanto se acercó el Dato Real a la Meta Diaria fija.</p>
                <div class="row q-gutter-sm q-mb-md">
                  <q-badge color="positive" class="q-pa-xs">Verde: 66.67% - 100%</q-badge>
                  <q-badge color="warning" text-color="black" class="q-pa-xs">Amarillo: 33.34% - 66.66%</q-badge>
                  <q-badge color="negative" class="q-pa-xs">Rojo: 0% - 33.33%</q-badge>
                </div>
                <q-banner dense class="bg-blue-1 text-caption rounded-borders border-blue">
                  <q-icon name="calculate" color="blue" />
                  <strong>Cálculo:</strong> (Dato Real / Meta Diaria)
                </q-banner>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item group="metas" icon="leaderboard" label="2. Meta Incremental"
            caption="Superar el desempeño anterior" header-class="text-bold text-teal">
            <q-card class="bg-grey-1">
              <q-card-section>
                <p><strong>Lógica:</strong> El objetivo es mejorar el resultado del día previo. La meta diaria es (Ayer
                  + 1).</p>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar><q-icon name="check_circle" color="positive" /></q-item-section>
                    <q-item-section><strong>Verde:</strong> Dato Real mayor que ayer.</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="remove_circle" color="warning" /></q-item-section>
                    <q-item-section><strong>Amarillo:</strong> Dato Real igual a ayer.</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                    <q-item-section><strong>Rojo:</strong> Dato Real menor que ayer.</q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item group="metas" icon="functions" label="3. Meta Acumulada" caption="Suma total del progreso"
            header-class="text-bold text-orange-9">
            <q-card class="bg-grey-1">
              <q-card-section>
                <p>El <strong>Acumulado Real</strong> es la suma de todo lo logrado hasta hoy.</p>
                <div class="text-subtitle2 q-mb-sm italic text-grey-8">Tendencia de hoy vs ayer:</div>
                <div class="row q-gutter-xs">
                  <q-chip outline color="positive" icon="north" size="sm">Más que ayer</q-chip>
                  <q-chip outline color="warning" icon="remove" size="sm">Igual que ayer</q-chip>
                  <q-chip outline color="negative" icon="south" size="sm">Menos que ayer</q-chip>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item group="metas" icon="stars" label="4. Meta Dominio" caption="Escala de calidad"
            header-class="text-bold text-purple">
            <q-card class="bg-grey-1">
              <q-card-section>
                <p>Se basa en el nivel de habilidad o estado alcanzado.</p>
                <q-markup-table dense flat bordered class="bg-white">
                  <thead class="bg-grey-2">
                    <tr>
                      <th class="text-left">Estado (Dato Real)</th>
                      <th class="text-center">Color Indicador</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="text-weight-bold">Dominada</td>
                      <td class="bg-positive text-white text-center text-bold">Verde</td>
                    </tr>
                    <tr>
                      <td>En Proceso</td>
                      <td class="bg-warning text-center text-bold">Amarillo</td>
                    </tr>
                    <tr>
                      <td>Presentada / Ninguna</td>
                      <td class="bg-negative text-white text-center text-bold">Rojo</td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn unelevated label="Entendido" color="primary" v-close-popup class="q-px-lg" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
// Props para el v-model
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// Emits para actualizar el v-model en el padre
defineEmits(['update:modelValue']);
</script>

<style scoped>
.border-blue {
  border: 1px solid #2196f3;
}

.rounded-borders {
  border-radius: 8px;
}
</style>

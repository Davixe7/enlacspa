<script setup>
import { useAuthStore } from 'src/stores/user-store'
import notify from 'src/utils/notify'
import { onMounted, ref } from 'vue'

const authStore = useAuthStore()
const employee_number = ref(null)

onMounted(() => authStore.csrfCookie())

async function attemptLogin() {
  try {
    await authStore.attemptLogin({ employee_number: employee_number.value })
  } catch (error) {
    if (!error.formatted) {
      notify.negative('Error al intentar ingresar')
    }
  }
}
</script>

<template>
  <div class="row login-row">
    <div class="col-12 col-md-6 login-brand-column">
      <img
        src="../assets/logo_white.png"
        alt="Logo"
      />
    </div>

    <div class="col-12 col-md-6 flex items-center q-pa-md login-form-column">
      <div>
        <h1 class="title">ENLAC</h1>
        <div class="subtitle q-pb-lg">Ingresa tu Número de Empleado:</div>

        <q-form
          @submit.prevent="attemptLogin"
          class="q-gutter-y-lg"
        >
          <q-input
            outlined
            stack-label
            label="Número"
            v-model="employee_number"
            hide-bottom-space
            class="employee-number-input"
            :error="!!authStore.errors.email"
            :error-message="'Código de empleado inválido'"
            clearable
            type="number"
          />

          <q-btn
            unelevated
            color="primary"
            label="Ingresar"
            type="submit"
            :loading="authStore.loading"
          />
        </q-form>
        <div class="flex q-pa-md">
          <router-link
            to="/login"
            class="back-link"
          >
            <q-icon
              name="arrow_back"
              size="sm"
              class="q-mr-sm"
            />
            Regresar
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.login-form-column > div {
  flex: 1 1 auto;
}

.login-brand-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(30vh) !important;
  background: radial-gradient(rgb(1, 119, 193), rgba(0, 43, 106));
}

.login-brand-column img {
  height: 75%;
}

.title {
  color: #001f6d;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.3rem;
  letter-spacing: 0;
}

.subtitle {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3rem;
  color: #111827;
}

a {
  font-size: 14px;
  text-decoration: none;
  color: rgba(0, 31, 109, 1);
}

.employee-number-input .q-field__control,
.employee-number-input .q-field__native {
  height: 70px !important;
  font-size: 2rem;
}

.access-captura-link {
  display: flex;
  justify-content: center;
  margin-top: 80px;
  margin-bottom: 40px;
}

@media (min-width: 1024px) {
  .login-row {
    height: 100vh;
  }

  .login-form-column {
    order: 1;
    padding-left: 100px;

    > div {
      max-width: 370px;
    }
  }

  .row .login-brand-column {
    order: 2;
    height: 100% !important;
  }

  .row .login-brand-column img {
    height: auto;
  }
}
</style>

<script setup>
import { onMounted, ref } from "vue";
import { useAuthStore } from "./../stores/user-store"

onMounted(() => authStore.csrfCookie())

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const remeberme = ref(false);
const showPassword = ref(false)

</script>

<template>
  <div class="row login-row">
    <div class="col-12 col-md-6 login-brand-column">
      <img
        src="./../assets/logo_white.png"
        alt=""
      />
    </div>
    <div class="col-12 col-md-6 flex items-center q-pa-md login-form-column">
      <div>
        <h1 class="title">ENLAC</h1>
        <div class="subtitle">Portal web para la administración y gestión</div>
        <div>
          <q-form
            class="q-gutter-y-lg"
            @submit.prevent="authStore.attemptLogin({ email, password })"
          >
            <q-input
              outlined
              stack-label
              label="Correo electrónico"
              type="email"
              v-model="email"
              hide-bottom-space
              :error="!!authStore.errors.email"
              :error-message="authStore.errors.email"
            ></q-input>
            <q-input
              outlined
              stack-label
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              hide-bottom-space
              :error="!!authStore.errors.email"
              :error-message="authStore.errors.email"
            >
              <template v-slot:append="">
                <q-btn
                  @click="showPassword = !showPassword"
                  flat
                  round
                  :icon="!showPassword ? 'visibility' : 'visibility_off'"
                  dense
                />
              </template>
            </q-input>
            <div class="flex justify-between items-center q-py-sm">
              <q-checkbox
                label="Recuérdame"
                v-model="remeberme"
                style="margin-left: -10px"
              ></q-checkbox>
              <a href="#">¿Olvidó su contraseña?</a>
            </div>
            <q-btn
              unelevated
              :loading="authStore.loading"
              color="primary"
              type="submit"
            >Iniciar sesión</q-btn>
          </q-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.login-form-column>div {
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
  padding-bottom: 24px;
}

a {
  font-size: 14px;
  text-decoration: none;
  color: rgba(0, 31, 109, 1);
}

.q-checkbox__inner {
  width: 32px !important;
  min-width: 32px;
  height: 32px !important;
}

@media (min-width: 1024px) {
  .login-row {
    height: 100vh;
  }

  .login-form-column {
    order: 1;
    padding-left: 100px;

    >div {
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

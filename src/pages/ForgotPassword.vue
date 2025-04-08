<script setup>
import { ref } from "vue";
import { Notify } from "quasar";
import { api } from "src/boot/axios";

const email = ref("");
const baseUrl = new URL(api.defaults.baseURL).origin;

const submitForm = async () => {
  if (!email.value) return;

  try {
    await api.post(`${baseUrl}/forgot-password`, { email: email.value })
    Notify.create({
      type: "positive",
      message: "Enlace de recuperación enviado",
    });
  }
  catch (error) {
    console.log(error)
  }
};
</script>

<template>
  <div class="row login-row">
    <div class="col-12 col-md-6 login-brand-column">
      <img
        src="./../assets/logo_white.png"
        alt=""
      />
    </div>
    <div class="col-12 col-md-6 flex items-center login-form-column">
      <q-card
        unelevated
        flat
      >
        <q-card-section>
          <router-link to="/login">
            <q-icon
              name="arrow_back"
              size="32px"
            ></q-icon>
          </router-link>
          <h1 class="title">ENLAC</h1>
          <div class="subtitle">
            Olvidé mi contraseña
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitForm">
            <q-input
              stack-label
              clearable
              bordered
              outlined
              v-model="email"
              label="Correo Electrónico"
              type="email"
              :rules="[val => !!val || 'El correo es obligatorio']"
            />

            <div class="flex q-pt-md">
              <q-btn
                label="Enviar Enlace"
                color="primary"
                type="submit"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.title {
  color: #001f6d;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.3rem;
  letter-spacing: 0;
}

.full-width {
  width: 100%;
}

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

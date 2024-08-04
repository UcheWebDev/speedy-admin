<template>
  <v-app>
    <v-main>
      <v-container fluid class="d-flex align-center justify-center fill-height">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="12" md="6" lg="4">
            <v-sheet>
              <v-card-title class="text-h5 text-center mb-2"
                >Admin Login
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="valid" @submit.prevent="login">
                  <v-text-field
                    label="Admin Id"
                    v-model="adminId"
                    type="email"
                    :rules="adminIdRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    :type="showPassword ? 'text' : 'password'"
                    label="Password"
                    v-model="password"
                    :rules="passwordRules"
                    required
                  ></v-text-field>
                  <v-checkbox
                    v-model="showPassword"
                    color="red"
                    label="Show Password"
                  ></v-checkbox>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  class="custom-button"
                  @click="login"
                  color="primary"
                  variant="tonal"
                  block
                  :disabled="!valid || loading"
                >
                  <v-progress-circular
                    v-if="loading"
                    indeterminate
                    color="white"
                    size="20"
                  ></v-progress-circular>
                  <span v-else>Login</span>
                </v-btn>
              </v-card-actions>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
        {{ snackbar.message }}
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<script setup>
/*eslint-disable*/
import { ref, reactive } from "vue";
import axios from "@/utils/axiosConfig";
import { useRouter } from "vue-router";

const router = useRouter();

const adminId = ref(null);
const password = ref(null);
const showPassword = ref(false);
const valid = ref(false);
const loading = ref(false);

const adminIdRules = [(v) => !!v || "Admin ID is required"];
const passwordRules = [
  (v) => !!v || "Password is required",
  (v) => (v && v.length >= 6) || "Password must be at least 6 characters",
];

const form = ref(null);

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const login = async () => {
  if (form.value.validate()) {
    loading.value = true;
    try {
      const response = await axios.post("/auth/loginAdmin", {
        admin_id: adminId.value,
        password: password.value,
      });

      snackbar.message = "Login success !.";
      snackbar.show = true;
      const token = response.data.token;
      localStorage.setItem("token", token);
      router.push({ name: "Dashboard" });
    } catch (error) {
      if (error.response && error.response.data) {
        snackbar.message =
          error.response.data.invalid || "An error occurred. Please try again.";
      }
      snackbar.show = true;
    } finally {
      loading.value = false;
    }
  }
};
</script>

<style scoped>
.custom-button {
  background-color: #c33d1b;
  color: white !important; /* Text color */
  font-weight: bold !important; /* Bold text */
}

.custom-button:hover {
  background-color: #c33d1b;
}
</style>
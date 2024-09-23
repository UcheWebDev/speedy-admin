<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer">
      <v-list>
        <v-row align="center" no-gutters class="justify-center">
          <v-col class="d-flex" cols="auto">
            <v-list-item-avatar>
              <img src="../assets/logo-speedy (1).svg" alt="Speedy Logo" />
            </v-list-item-avatar>
          </v-col>
          <v-col class="d-flex ml-2" cols="auto">
            <v-list-item-title class="title text-uppercase speedy-theme">
              Speedy
            </v-list-item-title>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/dashboard"
          exact
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-home-city-outline"
          to="/hotels"
          title="Hotels"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-silverware"
          title="Restuarants"
          to="/restuarants"
          value="shared"
          exact
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-pill"
          title="Pharmacy"
          value="starred"
          to="/pharmacy"
          exact
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-shopping-outline"
          title="Super Markets"
          to="/markets"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-ticket-percent-outline"
          to="/events"
          title="Tickets & Events"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-car"
          to="/cars"
          title="Cars"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-bike"
          to="/riders"
          title="Riders"
        ></v-list-item>
        <v-list-item
          to="/orders"
          prepend-icon="mdi-order-bool-descending-variant"
          title="Orders"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cellphone-link"
          to="/items"
          title="Items"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="red-darken-4">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="logOutRequest" color="white">
        <v-icon left>mdi-logout</v-icon> Logout</v-btn
      >
      <v-btn @click="logOutRequest" color="white">
        <v-icon left>mdi-search-web</v-icon> Search</v-btn
      >
    </v-app-bar>

    <v-main class="app">
      <v-container fluid class="app">
        <router-view></router-view>
        <!--snackbar -->
        <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
          {{ snackbar.message }}
        </v-snackbar>

        <!--prompt-->
        <v-dialog v-model="RequestDialog" persistent max-width="290">
          <v-card>
            <v-card-title class="text-button">
              {{ prompt }}
            </v-card-title>
            <v-card-text class="text-button"
              >Do You Want To Log Out</v-card-text
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" text @click="RequestDialog = false">
                No
              </v-btn>
              <v-btn color="green darken-1" text @click="logOut">
                Yes
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>mdi-cached</v-icon>
                  </span>
                </template>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>
  
  <script setup>
/* eslint-disable */
import { ref, reactive } from "vue";
import axios from "@/utils/axiosConfig";
import { useRouter } from "vue-router";

const RequestDialog = ref(false);
const drawer = ref(null);
const router = useRouter();

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const logOutRequest = () => {
  RequestDialog.value = true;
};

const logOut = async () => {
  try {
    const response = await axios.post("/admin/logout");
    snackbar.message = "Successfully logged out !";
    snackbar.show = true;
    router.push({ name: "Login" });
  } catch (error) {
    snackbar.message = "Failed to log out!";
    snackbar.show = true;
  }
};
</script>
  
  <style scoped>
.title {
  font-size: 24px;
  font-weight: bold;
  padding: 16px 0;
  text-align: center;
}

.v-list-item--nav .v-list-item-title {
  font-size: 1rem;
}

/* .MuiTypography-body1 {
  font-size: 1rem;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.00938em;
} */
.speedy-theme{
  color: #d13520;
  font-weight: 900;
}
</style>
  
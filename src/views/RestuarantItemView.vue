<template>
  <v-container class="pa-md-12 pa-6" fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="mb-1 text-grey">Restaurant Items Page</div>
        <h3 class="text-h5">
          {{ restaurant ? restaurant.restaurant_name : "" }}
        </h3>
      </div>
    </div>

    <v-card
      v-for="item in paginatedItems"
      :key="item.id"
      class="mb-4 mt-4"
      flat
    >
      <v-container fluid>
        <v-row>
          <v-col cols="12" lg="2" md="3">
            <v-img
              :src="item.food_img_url"
              cover
              height="160"
              rounded="lg"
              width="100%"
            />
          </v-col>

          <v-col cols="12" lg="6" md="9">
            <p class="text-subtitle-1 font-weight-medium text-capitalize">
              {{ item.food_name }}
            </p>

            <p class="text-subtitle-2 font-weight-medium">
              &#8358; {{ item.food_price }}
            </p>

            <p class="mt-2 text-body-2 text-capitalize">
              {{
                item.extra_information
                  ? item.extra_information
                  : "no description for this item"
              }}
            </p>

            <div class="d-flex justify-space-between mt-10">
              <p class="mt-2 text-body-2">
                Time Added : {{ formattedTime(item.created_at) }}
              </p>
              <p class="mt-2 text-body-2">
                Last Updated : {{ formattedTime(item.updated_at) }}
              </p>
            </div>
          </v-col>

          <v-col cols="12" lg="2" md="6">
            <p class="text-subtitle-2 font-weight-medium text-capitalize">
              Sale Details
            </p>

            <!-- <p class="mt-2 text-body-2">
              <span class="">Qty</span> :
              {{ item.stock_quantity }}
            </p> -->
            <p class="mt-2 text-body-2">
              <span class="">Price</span> :
              <span class="">&#8358;</span>
              {{ item.food_price }}
            </p>
          </v-col>

          <v-col cols="12" lg="2" md="6">
            <p class="text-subtitle-2 font-weight-medium">Extra Details</p>

            <p class="mt-2 text-body-2">
              <span class="">Category</span> :
              {{ item.food_type }}
            </p>

            <!-- <p class="mt-2 text-body-2">
              <span class="">Weight</span> :
              {{ item.weight ? item.weight : "-" }}
            </p>

            <p class="mt-2 text-body-2">
              <span class="">Volume</span> :
              {{ item.volume ? item.volume : "-" }}
            </p> -->

            <v-btn
              class="mt-2 text-none"
              color="primary"
              prepend-icon="mdi-pen"
              :ripple="false"
              size="x-small"
              slim
              @click="openDialog(item)"
              text="Edit"
            />
            <v-btn
              class="mt-2 text-none ml-2"
              color="red"
              prepend-icon="mdi-delete"
              :ripple="false"
              size="x-small"
              @click="deleteitemData(item.id)"
              text="remove"
            />
          </v-col>
        </v-row>
      </v-container>

      <v-divider />
    </v-card>

    <v-pagination
      v-model="currentPage"
      :active-color="'primary'"
      :length="pageCount"
      :total-visible="7"
      v-if="isLoadingRequest == false && items.length"
    ></v-pagination>

    <div
      class="centered-content"
      v-if="isLoadingRequest == false && !items.length"
    >
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data...</h1>
        <p>Items data cannot be found at the moment</p>
      </div>
    </div>

    <!--add data-->
    <AddDataDialogue v-model="dialog" :title="dialogTitle" @close="handleClose">
      <v-container>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-file-input
            v-model="food.restuarant_image"
            label="Food Image"
            accept="image/jpeg, image/jpg, image/png"
            prepend-icon="mdi-camera"
            outlined
            @change="onFilePicked"
            required
          ></v-file-input>
          <v-select
            v-model="food.food_type"
            :items="foodTypes"
            label="Food Type"
            required
          ></v-select>

          <v-text-field
            v-model="food.food_name"
            :rules="[
              (v) => !!v || 'Food Name is required',
              (v) =>
                v.length <= 255 || 'Food Name must be less than 255 characters',
            ]"
            label="Food Name"
            required
          ></v-text-field>

          <v-text-field
            v-model="food.food_price"
            :rules="[
              (v) => !!v || 'Food Price is required',
              (v) =>
                (!isNaN(parseFloat(v)) && v >= 0) ||
                'Food Price must be a positive number',
            ]"
            label="Food Price"
            required
          ></v-text-field>

          <v-textarea
            v-model="food.extra_information"
            :rules="[
              (v) =>
                v === null ||
                v === '' ||
                v.length <= 255 ||
                'Extra Information must be less than 255 characters',
            ]"
            label="Extra Information"
          ></v-textarea>

          <v-btn :disabled="!valid" color="success" @click="submitForm">
            Update Food Details
          </v-btn>
        </v-form>
      </v-container>
    </AddDataDialogue>

    <!--snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
    </v-snackbar>

    <!--loading request overlay-->
    <v-overlay
      :model-value="isLoadingRequest"
      class="align-center justify-center full-screen-overlay"
    >
      <v-progress-circular
        color="primary"
        size="30"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!--prompt-->
    <v-dialog v-model="RequestDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-button">
          {{ prompt }}
        </v-card-title>
        <v-card-text class="text-button">Confirm to delete ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeRequestDialogue">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="confirmEvent">
            Confirm
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
</template>
      
      <script setup>
/* eslint-disable */

import { ref, reactive, onMounted, computed } from "vue";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import axios from "@/utils/axiosConfig";
import { formatDistanceToNow } from "date-fns";

import { useRouter, useRoute } from "vue-router";
import { ErrorHandler } from "@/utils/ErrorHandler";
import {
  fetchRestuarantHttpRequest,
  deleteItemHttpRequest,
} from "@/utils/httpRequests";
import { foodTypes } from "@/utils/globals";

const dialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const loading = ref(true);
const isLoadingRequest = ref(true);
const selectedDataId = ref(null);

const toDeleteItemId = ref(null);

const isEditMode = ref(false);
const dialogTitle = ref(null);
const dialogButton = ref("Save");

const route = useRoute();
const currentPath = computed(() => route.path);
const currentId = computed(() => route.params.id);

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const restaurant = ref(null);
const foods = ref([]);

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);

const formattedTime = (dt) => {
  return formatDistanceToNow(new Date(dt), { addSuffix: true });
};

const food = ref({
  id: null,
  restaurant_id: "",
  food_type: "",
  food_name: "",
  food_price: "",
  extra_information: "",
  food_img_name: null,
  food_img_file: null,
});

const items = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(4);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = currentPage.value * itemsPerPage.value;
  return items.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(items.value.length / itemsPerPage.value);
});

const submitForm = async () => {
  isLoadingRequest.value = true;
  try {
    const fd = new FormData();
    for (const key in food.value) {
      if (food.value[key] !== undefined) {
        fd.append(key, food.value[key]);
      } else {
        console.log("invalid keys");
      }
    }

    await axios.post(
      `/admin/restaurants/${food.value.restaurant_id}/foods/${food.value.id}`,
      fd
    );
    snackbar.message = "Updated successfully!";
    snackbar.show = true;
    fetchItems();
    handleClose();
  } catch (error) {
    console.error("Failed to save item", error);
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const fetchItems = async () => {
  try {
    // items.value = await fetchRestuarantHttpRequest(currentPath.value);
    const response = await fetchRestuarantHttpRequest(currentPath.value);
    items.value = response.foods;
    restaurant.value = response;
    isLoadingRequest.value = false;
  } catch (error) {
    isLoadingRequest.value = false;
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const handleClose = () => {
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  food.value = {
    id: null,
    restaurant_id: "",
    food_type: "",
    food_name: "",
    food_price: "",
    extra_information: "",
    food_img_name: null,
    food_img_file: null,
  };
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const deleteitemData = (itemId) => {
  toDeleteItemId.value = itemId;
  RequestDialog.value = true;
};

const confirmEvent = async () => {
  isLoadingRequest.value = true;
  try {
    await axios.delete(
      `/admin/restaurants/${currentId.value}/foods/${toDeleteItemId.value}`
    );
    snackbar.message = "Updated successfully!";
    snackbar.show = true;
    fetchItems();
    isLoadingRequest.value = false;
    closeRequestDialogue();
  } catch (error) {
    closeRequestDialogue();
    isLoadingRequest.value = false;
    snackbar.message = "Error deleting data!";
    snackbar.show = true;
  }
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    food.value.food_img_name = files[0].name;
    if (food.value.food_img_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      food.value.food_img_file = files[0];
      console.log(food.value.food_img_file);
    });
  } else {
    food.value.food_img_name = "";
    food.value.food_img_file = "";
  }
};

const openDialog = (item = null) => {
  if (item) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Item";
    dialogButton.value = "Update";
    food.value = { ...item };
    console.log(food.value);
  }
  dialog.value = true;
};

onMounted(() => {
  fetchItems();
});
</script>
      
    <style scoped>
.full-screen-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ); /* Optional: semi-transparent background */
  z-index: 9999; /* Ensure it's on top of other elements */
}

.centered-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh; /* Full viewport height */
  text-align: center;
}
</style>
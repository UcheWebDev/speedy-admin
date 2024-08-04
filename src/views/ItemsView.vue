<template>
  <v-container class="pa-md-12 pa-6" fluid>
    <div class="d-flex align-center justify-space-between mb-3">
      <div>
        <div class="text-grey">Add New Items Page</div>
        <h3 class="text-h5 font-weight-bold">Manage items</h3>
      </div>
      <v-btn color="primary" @click="openDialog" class="font-weight-bold">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-card v-for="item in paginatedItems" :key="item.id" class="mb-4" flat>
      <v-container fluid>
        <v-row>
          <v-col cols="12" lg="2" md="3">
            <v-img
              :src="item.image_url"
              cover
              height="160"
              rounded="lg"
              width="100%"
            />
          </v-col>

          <v-col cols="12" lg="6" md="9">
            <p class="text-subtitle-1 font-weight-medium text-uppercase">
              {{ item.name }}
            </p>

            <p class="text-subtitle-2 font-weight-medium">
              &#8358; {{ item.price }}
            </p>

            <p class="mt-2 text-body-2 text-capitalize">
              {{ item.description }}
            </p>

            <p class="mt-2 text-body-2">
              Time Added : {{ formattedTime(item.created_at) }}
            </p>
          </v-col>

          <v-col cols="12" lg="2" md="6">
            <p class="text-subtitle-2 font-weight-medium text-capitalize">
              Sale Details
            </p>

            <p class="mt-2 text-body-2">Qty : {{ item.stock_quantity }}</p>
            <p class="mt-2 text-body-2">Price : &#8358; {{ item.price }}</p>
          </v-col>

          <v-col cols="12" lg="2" md="6">
            <p class="text-subtitle-2 font-weight-medium">Extra Details</p>

            <p class="mt-2 text-body-2">Category : {{ item.category }}</p>

            <p class="mt-2 text-body-2">
              Weight : {{ item.weight ? item.weight : "-" }}
            </p>

            <p class="mt-2 text-body-2">
              Volume : {{ item.volume ? item.volume : "-" }}
            </p>

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
              slim
              @click="deleteitemData(item.id)"
              text="Delete"
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
    ></v-pagination>

    <!--add data-->
    <AddDataDialogue v-model="dialog" :title="dialogTitle" @close="handleClose">
      <v-container>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">
          <v-text-field
            v-model="formData.name"
            label="Name"
            :rules="nameRules"
            required
          ></v-text-field>
          <!-- <v-text-field
            v-model="formData.category"
            label="Category"
            :rules="categoryRules"
            required
          ></v-text-field> -->
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-title="category"
            label="Category"
            @update:modelValue="updateSubcategories"
            required
          ></v-select>
          <v-select
            v-model="formData.category"
            :items="subcategories"
            label="Subcategory"
            required
          ></v-select>
          <v-textarea
            v-model="formData.description"
            label="Description"
          ></v-textarea>
          <v-text-field
            v-model="formData.price"
            label="Price"
            type="number"
            required
          ></v-text-field>
          <v-text-field
            v-model="formData.stock_quantity"
            label="Stock Quantity"
            type="number"
            required
          ></v-text-field>
          <v-file-input
            v-model="formData.image_url"
            label="Item Image"
            accept="image/jpeg, image/jpg, image/png"
            prepend-icon="mdi-camera"
            @change="onFilePicked"
          ></v-file-input>
          <v-text-field
            v-model="formData.weight"
            label="Weight"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="formData.volume"
            label="Volume"
            type="number"
          ></v-text-field>

          <v-select
            v-model="pharmacy_id"
            :items="pharmacies"
            item-title="name"
            item-value="id"
            @update:modelValue="getPharmacyItemId"
            label="Pharmacy"
          ></v-select>
          <v-select
            v-model="market_id"
            :items="supermarkets"
            item-title="name"
            item-value="id"
            @update:modelValue="getSuperMarketItemId"
            label="Supermarket"
          ></v-select>
          <v-btn :disabled="!isFormValid" type="submit" color="primary"
            >Save Item</v-btn
          >
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
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!--prompt-->
    <v-dialog v-model="RequestDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-button">
          {{ prompt }}
        </v-card-title>
        <v-card-text class="text-button">Confirm to delete</v-card-text>
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

import { ref, reactive, onMounted , computed} from "vue";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import axios from "@/utils/axiosConfig";
import { useRouter } from "vue-router";
import { ErrorHandler } from "@/utils/ErrorHandler";
import {
  fetchItemsHttpRequest,
  deleteItemHttpRequest,
} from "@/utils/httpRequests";
import { formatDistanceToNow } from "date-fns";

import { categories } from "@/utils/globals";

const dialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const loading = ref(true);
const isLoadingRequest = ref(false);
const selectedDataId = ref(null);

const isEditMode = ref(false);
const dialogTitle = ref(null);
const dialogButton = ref("Save");

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const market_id = ref(null);
const pharmacy_id = ref(null);

const isFormValid = ref(false);

const pharmacies = ref([]);
const supermarkets = ref([]);

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);
const formattedTime = (dt) => {
  return formatDistanceToNow(new Date(dt), { addSuffix: true });
};

const subcategories = ref([]);
const selectedCategory = ref(null);

const currentPage = ref(1);
const itemsPerPage = ref(3);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = currentPage.value * itemsPerPage.value;
  return items.value.slice(start, end);
});

const pageCount = computed(() => {
  return Math.ceil(items.value.length / itemsPerPage.value);
});

const formData = ref({
  id: null,
  name: "",
  category: "",
  description: "",
  price: null,
  stock_quantity: null,
  image_url: null,
  weight: 0,
  volume: 0,
  pharmacy_id: 0,
  market_id: 0,
  image_name: null,
  image_File: null,
});

// Validation rules
const nameRules = [(v) => !!v || "Name is required"];
const categoryRules = [(v) => !!v || "Category is required"];
const subcategoryRules = [(v) => !!v || "Subcategory is required"];
const priceRules = [
  (v) => !!v || "Price is required",
  (v) => v > 0 || "Price must be greater than zero",
];
const stockQuantityRules = [
  (v) => !!v || "Stock Quantity is required",
  (v) => v >= 0 || "Stock Quantity must be non-negative",
];

const weightRules = [(v) => !v || v > 0 || "Weight must be greater than zero"];
const volumeRules = [(v) => !v || v > 0 || "Volume must be greater than zero"];

const items = ref([]);

// Fetch pharmacies and supermarkets for the select inputs
const fetchSelectData = async () => {
  try {
    const [pharmacyResponse, supermarketResponse] = await Promise.all([
      axios.get("/admin/pharmacies"),
      axios.get("/admin/supermarkets"),
    ]);
    pharmacies.value = pharmacyResponse.data.data;
    supermarkets.value = supermarketResponse.data.data;
  } catch (error) {
    errorHandler.handle(error);
  }
};

// const submitForm = async () => {
//   isLoadingRequest.value = true;
//   try {
//     const fd = new FormData();
//     for (const key in formData.value) {
//       fd.append(key, formData.value[key]);
//     }
//     const response = await axios.post("/admin/items", fd);
//     snackbar.message = "Added successfully!";
//     snackbar.show = true;
//   } catch (error) {
//     isLoadingRequest.value = false;
//     console.error("Failed to create item", error);
//     errorHandler.handle(error);
//   } finally {
//     isLoadingRequest.value = false;
//   }
// };
const updateSubcategories = () => {
  const selected = categories.value.find(
    (cat) => cat.category === selectedCategory.value
  );
  subcategories.value = selected ? selected.subcategories : [];
};

const submitForm = async () => {
  isLoadingRequest.value = true;
  try {
    const fd = new FormData();
    for (const key in formData.value) {
      if (formData.value[key] !== undefined) {
        fd.append(key, formData.value[key]);
      } else {
        console.log("invalid keys");
      }
    }

    if (formData.value.id) {
      await axios.post(`/admin/items/${formData.value.id}`, fd);
      snackbar.message = "Updated successfully!";
    } else {
      await axios.post("/admin/items", fd);
      snackbar.message = "Added successfully!";
    }

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
    items.value = await fetchItemsHttpRequest();
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
  formData.value = {
    id: null,
    name: "",
    category: "",
    description: "",
    price: null,
    stock_quantity: null,
    image_url: null,
    weight: 0,
    volume: 0,
    pharmacy_id: 0,
    market_id: 0,
    image_name: null,
    image_File: null,
  };
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const deleteitemData = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const confirmEvent = async () => {
  isLoadingRequest.value = true;
  try {
    await deleteItemHttpRequest(selectedDataId.value);
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
    formData.value.image_name = files[0].name;
    if (formData.value.image_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.image_File = files[0];
      console.log(formData.value.image_File);
    });
  } else {
    formData.value.image_name = "";
    formData.value.image_File = "";
  }
};

// const openDialog = () => {
//   dialog.value = true;
// };

const openDialog = (item = null) => {
  if (item) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Item";
    dialogButton.value = "Update";
    formData.value = { ...item };
    console.log(formData.value);
  } else {
    isEditMode.value = false;
    dialogTitle.value = "Add Item";
    dialogButton.value = "Save";
    formData.value = {
      id: null,
      name: "",
      category: "",
      description: "",
      price: null,
      stock_quantity: null,
      image_url: null,
      weight: 0,
      volume: 0,
      pharmacy_id: 0,
      market_id: 0,
      image_name: null,
      image_File: null,
    };
  }
  dialog.value = true;
};

const getSuperMarketItemId = (e) => {
  market_id.value = e;
  formData.value.market_id = e;
  console.log(formData.value.market_id);
};
const getPharmacyItemId = (e) => {
  pharmacy_id.value = e;
  formData.value.pharmacy_id = e;
  console.log(formData.value.pharmacy_id);
};

onMounted(() => {
  fetchItems();
  fetchSelectData();
});
</script>

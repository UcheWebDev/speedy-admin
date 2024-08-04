<template>
  <v-dialog v-model="isVisible" persistent max-width="600px">
    <v-card>
      <!-- <v-card-title class="my-2">
        <span class="text-capitalize">{{ title }}</span>
      </v-card-title> -->

      <v-card-text> <slot /> </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" @click="$emit('close')">Cancel</v-btn>
      </v-card-actions>

      <!-- <v-card-title v-if="title">
        <span v-text="title"></span>
      </v-card-title> -->
      <!-- <v-card-text>
        <slot />
      </v-card-text> -->
    </v-card>
  </v-dialog>
</template>

<script setup>
/*eslint-disable*/
import { ref, defineEmits, defineProps } from "vue";

const props = defineProps({
  title: String,
  actionText: String,
});

const isVisible = ref(props.isVisible); // Use likes as reviews for demo

const emit = defineEmits(["close", "action"]);
</script>

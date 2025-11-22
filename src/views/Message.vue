<!-- components/MessageComponent.vue -->
<template>
  <div :class="['message', type]">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  type: String,
  text: String
});
</script>
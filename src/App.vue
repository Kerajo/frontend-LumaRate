<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen bg-bg-body text-text-light relative flex flex-col">
    <TheHeader v-if="!isAdminPage" />

    <!-- Main Content -->
    <div :class="{ 'flex-grow': true, 'bg-bg-body': isAdminPage }">
      <RouterView />
    </div>

    <TheFooter v-if="!isAdminPage" />
  </div>
</template>

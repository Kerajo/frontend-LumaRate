<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '/Comedy.png',
  }
});
</script>

<template>
  <div class="relative flex-shrink-0 w-[424px] h-[312px] bg-bg-content rounded-[24px] border border-border-tertiary overflow-hidden group cursor-pointer transition-colors duration-300 hover:border-border-secondary">
    <!-- Title -->
    <div class="absolute inset-x-0 top-0 p-[24px] z-10">
      <h3 class="heading-m text-text-light group-hover:text-primary transition-colors duration-300">{{ title }}</h3>
    </div>
    
    <!-- Background Content / Image -->
    <img 
      :src="imageUrl" 
      alt="Genre" 
      class="absolute bottom-0 left-0 w-full h-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2"
    />

    <!-- Subtle gradient to ensure text readability -->
    <div class="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-bg-content to-transparent pointer-events-none opacity-80 z-0"></div>
  </div>
</template>

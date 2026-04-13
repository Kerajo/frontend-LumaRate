<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default', 'rating', 'translucent'
  },
  size: {
    type: String,
    default: 'm', // 'm' or 's'
  },
  rating: {
    type: Number,
    default: 0,
  },
})

const backgroundClass = computed(() => {
  if (props.variant === 'rating') {
    if (props.rating >= 7) return 'bg-primary-dark'
    if (props.rating >= 5) return 'bg-warning-dark'
    return 'bg-error-dark'
  }
  if (props.variant === 'translucent') return 'bg-bg-dark-50'
  return 'bg-bg-content' // Default
})

const sizeClass = computed(() => {
  if (props.size === 's') return 'p-[8px]'
  return 'px-[16px] py-[8px]'
})

const textStyle = computed(() => {
  if (props.size === 's') return 'label-normal'
  if (props.variant === 'rating') return 'body-normal-medium'
  return 'body-normal-regular'
})
</script>

<template>
  <div
    :class="[
      'rounded-[8px] flex items-center justify-center text-text-light whitespace-nowrap',
      sizeClass,
      backgroundClass,
      textStyle,
    ]"
  >
    <slot></slot>
  </div>
</template>

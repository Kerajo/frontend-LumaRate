<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'tertiary', 'error'].includes(val),
  },
  size: {
    type: String,
    default: 'm',
    validator: (val) => ['s', 'm', 'l'].includes(val.toLowerCase()),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const sizeClasses = computed(() => {
  const s = props.size.toLowerCase();
  if (s === 's') return 'py-[12px] px-[16px] rounded-[4px]';
  if (s === 'm') return 'py-[16px] px-[24px] rounded-[8px]';
  if (s === 'l') return 'py-[20px] px-[24px] rounded-[8px]';
  return '';
});

const variantClasses = computed(() => {
  if (props.variant === 'primary') {
    return 'bg-btn-primary hover:bg-btn-primary-hover active:bg-btn-primary-press disabled:bg-btn-primary-disabled text-text-dark fill-text-dark disabled:text-text-light-disabled disabled:fill-text-light-disabled';
  }
  if (props.variant === 'secondary') {
    return 'bg-btn-secondary hover:bg-btn-secondary-hover active:bg-btn-secondary-press disabled:bg-btn-secondary-disabled text-text-light fill-text-light disabled:text-text-light-disabled disabled:fill-text-light-disabled';
  }
  if (props.variant === 'tertiary') {
    return 'bg-btn-tertiary hover:bg-btn-tertiary-hover active:bg-btn-tertiary-press disabled:bg-btn-tertiary-disabled text-text-light fill-text-light disabled:text-text-light-disabled disabled:fill-text-light-disabled';
  }
  if (props.variant === 'error') {
    return 'bg-btn-error hover:bg-btn-error-hover active:bg-btn-error-press disabled:bg-btn-error-disabled text-text-light fill-text-light disabled:text-text-light-disabled disabled:fill-text-light-disabled';
  }
  return '';
});
</script>

<template>
  <button
    :class="[
      'flex items-center justify-center gap-[4px] transition-colors duration-200 focus:outline-none',
      sizeClasses,
      variantClasses
    ]"
    :disabled="disabled"
  >
    <slot name="left-icon"></slot>
    <span class="px-[4px] body-normal-medium whitespace-nowrap">
      <slot></slot>
    </span>
    <slot name="right-icon"></slot>
  </button>
</template>

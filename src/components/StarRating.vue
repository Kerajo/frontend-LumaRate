<script setup>
import IconLogo from './icons/IconLogo.vue';
import IconLogoPrimary from './icons/IconLogoPrimary.vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 5,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 20,
  },
});

const emit = defineEmits(['update:modelValue']);

const setRating = (val) => {
  if (props.readonly) return;
  emit('update:modelValue', val);
};
</script>

<template>
  <div class="flex gap-[4px]">
    <template v-for="i in max" :key="i">
      <IconLogoPrimary
        v-if="i <= modelValue"
        :style="{ width: size + 'px', height: size + 'px' }"
        :class="[
          'transition-transform duration-200',
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        ]"
        @click="setRating(i)"
      />
      <IconLogo
        v-else
        :style="{ width: size + 'px', height: size + 'px' }"
        :class="[
          'transition-transform duration-200 opacity-50 text-text-light',
          readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
        ]"
        @click="setRating(i)"
      />
    </template>
  </div>
</template>

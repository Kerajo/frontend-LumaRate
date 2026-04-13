<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const options = ['Новые', 'Реки ИИ', 'Высокий рейтинг']
</script>

<template>
  <div class="p-[4px] rounded-[10px] bg-bg-content flex gap-1 lg:gap-[8px] overflow-x-auto hide-scrollbar w-full lg:w-fit">
    <button 
      v-for="opt in options" 
      :key="opt"
      @click="emit('update:modelValue', opt)"
      :class="[
        'px-[16px] lg:px-[24px] py-[10px] lg:py-[12px] rounded-[8px] body-m whitespace-nowrap transition-colors duration-200 flex-shrink-0',
        modelValue === opt 
          ? 'bg-bg-body text-text-light shadow-sm' 
          : 'text-text-light opacity-60 hover:opacity-100 hover:bg-bg-body/30'
      ]"
    >
      {{ opt }}
    </button>
  </div>
</template>

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
  <div class="p-[4px] rounded-[8px] bg-bg-content flex gap-[16px]">
    <button 
      v-for="opt in options" 
      :key="opt"
      @click="emit('update:modelValue', opt)"
      :class="[
        'px-[24px] py-[12px] rounded-[8px] body-m whitespace-nowrap transition-colors duration-200',
        modelValue === opt 
          ? 'bg-bg-body text-text-light' 
          : 'text-text-light opacity-70 hover:opacity-100 hover:bg-bg-body/50'
      ]"
    >
      {{ opt }}
    </button>
  </div>
</template>

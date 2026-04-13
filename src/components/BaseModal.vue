<script setup>
import { onMounted, onUnmounted } from 'vue';
import IconButton from './IconButton.vue';
import IconClose from './icons/IconClose.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  overflowVisible: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-[24px]">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="close"></div>
        
        <!-- Modal Content -->
        <div 
          class="relative bg-bg-body w-full max-w-[800px] rounded-[24px] border border-border-tertiary shadow-2xl flex flex-col"
          :class="!overflowVisible ? 'overflow-hidden' : ''"
        >
          <!-- Header -->
          <div class="p-[32px] pb-[16px] flex justify-between items-center bg-bg-body">
            <h3 class="heading-xl text-text-light">{{ title }}</h3>
            <IconButton variant="secondary" size="m" @click="close">
              <IconClose class="w-6 h-6" />
            </IconButton>
          </div>

          <!-- Body -->
          <div 
            class="p-[32px] pt-0 max-h-[70vh]"
            :class="!overflowVisible ? 'overflow-y-auto' : ''"
          >
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>

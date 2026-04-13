<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import IconButton from './IconButton.vue';
import IconRightLine from './icons/IconRightLine.vue';
import IconLeftLine from './icons/IconLeftLine.vue';

const scrollContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

const checkScroll = () => {
  if (!scrollContainer.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollLeft.value = scrollLeft > 5;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 5;
};

let resizeObserver = null;

onMounted(() => {
  checkScroll();
  window.addEventListener('resize', checkScroll);
  
  // Watch for content changes (especially useful for slots)
  if (scrollContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(scrollContainer.value);
    // Also observe the children to catch size changes inside them
    Array.from(scrollContainer.value.children).forEach(child => {
      resizeObserver.observe(child);
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const scrollRight = () => {
  if (scrollContainer.value) {
    const scrollAmount = scrollContainer.value.clientWidth * 0.7;
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  }
};

const scrollLeftAction = () => {
  if (scrollContainer.value) {
    const scrollAmount = scrollContainer.value.clientWidth * 0.7;
    scrollContainer.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  }
};
</script>

<template>
  <div class="relative w-full group/carousel">
    <!-- Fog Shadow Gradient overlay -->
    <div 
      class="absolute inset-0 pointer-events-none z-20"
      style="background: linear-gradient(90deg, #111 0%, rgba(17, 17, 17, 0.00) 10%, rgba(17, 17, 17, 0.00) 90%, #111 100%);"
    ></div>

    <!-- Left Scroll Button (Hidden on mobile) -->
    <transition name="fade">
      <div v-show="canScrollLeft" class="hidden lg:block absolute left-[40px] top-1/2 -translate-y-1/2 z-30">
        <IconButton variant="secondary" size="m" @click="scrollLeftAction">
          <IconLeftLine class="w-6 h-6" />
        </IconButton>
      </div>
    </transition>

    <!-- Right Scroll Button (Hidden on mobile) -->
    <transition name="fade">
      <div v-show="canScrollRight" class="hidden lg:block absolute right-[40px] top-1/2 -translate-y-1/2 z-30">
        <IconButton variant="secondary" size="m" @click="scrollRight">
          <IconRightLine class="w-6 h-6" />
        </IconButton>
      </div>
    </transition>

    <!-- Horizontal Scroll Track -->
    <div 
      ref="scrollContainer"
      @scroll="checkScroll"
      class="flex lg:gap-[32px] gap-[16px] overflow-x-auto hide-scrollbar relative z-10"
      :style="{
        paddingLeft: 'max(20px, calc(50vw - 660px + 20px))',
        paddingRight: 'max(20px, calc(50vw - 660px + 20px))'
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 1320px) {
  .hide-scrollbar {
    padding-left: calc(50vw - 660px + 40px) !important;
    padding-right: calc(50vw - 660px + 40px) !important;
  }
}
</style>

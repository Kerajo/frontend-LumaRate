<script setup>
import Container from './Container.vue';
import MovieCard from './MovieCard.vue';
import HorizontalScroll from './HorizontalScroll.vue';
import IconRightLine from './icons/IconRightLine.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  isFirst: {
    type: Boolean,
    default: false,
  },
  movies: {
    type: Array,
    default: () => [],
  }
});
</script>

<template>
  <section :class="['w-full', isFirst ? 'pt-[120px] pb-[64px]' : 'py-[64px]']">
    <Container class="mb-[32px]">
      <a href="#" class="inline-flex items-center gap-[8px] group text-text-light hover:text-primary transition-colors cursor-pointer">
        <h2 class="heading-xl">{{ title }}</h2>
        <IconRightLine class="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity fill-current" />
      </a>
    </Container>

    <HorizontalScroll>
      <MovieCard 
        v-for="(movie, index) in movies" 
        :key="index"
        size="m"
        :posterUrl="movie.posterUrl"
        :rating="movie.rating"
        :statusText="movie.statusText"
        :year="movie.year"
        :ageLimit="movie.ageLimit"
        :genres="movie.genres"
        :slug="movie.slug"
      />
      <slot />
    </HorizontalScroll>
  </section>
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

/* Fallback padding for smaller screens where the calc(1320px/2) logic gets negative */
@media (max-width: 1320px) {
  .hide-scrollbar {
    padding-left: 40px !important;
    padding-right: 40px !important;
  }
}
</style>

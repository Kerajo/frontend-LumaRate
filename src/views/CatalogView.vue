<script setup>
import { ref } from 'vue'
import Container from '../components/Container.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import SortToggle from '../components/SortToggle.vue'
import MovieCard from '../components/MovieCard.vue'
import BaseButton from '../components/BaseButton.vue'

const generateMovies = (count, baseRating) => Array.from({ length: count }, (_, i) => ({
  posterUrl: '/poster.png',
  rating: baseRating - (i * 0.1),
  year: '202' + (5 - (i % 4)),
  statusText: i % 3 === 0 ? 'Идет в кино' : '',
  ageLimit: i % 2 === 0 ? '16+' : '18+',
  genres: i % 2 === 0 ? ['Триллер', 'Драма'] : ['Фантастика'],
}))

const selectedGenre = ref(null)
const selectedCountry = ref(null)
const selectedYear = ref(null)

const genreOptions = ['Комедия', 'Драма', 'Фантастика', 'Триллер', 'Ужасы', 'Боевик']
const countryOptions = ['Россия', 'США', 'Корея', 'Казахстан', 'Франция']
const yearOptions = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']

// Simulated load list
const allMovies = generateMovies(24, 8.5)
const displayCount = ref(8)

const loadMore = () => {
  displayCount.value += 8
}
</script>

<template>
  <main class="w-full pt-[160px] pb-[64px]">
    <Container>
      
      <!-- Head -->
      <div class="flex flex-col gap-[24px]">
        
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-[8px] body-m">
          <router-link to="/" class="text-text-light opacity-60 hover:opacity-100 transition-opacity">Главная</router-link>
          <span class="text-text-light opacity-60">/</span>
          <span class="text-text-light">Фильмы</span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold text-text-light">Фильмы</h1>

        <!-- Controls (Filters & Sort) -->
        <div class="flex justify-between w-full mt-[8px]">
          
          <!-- Filters -->
          <div class="flex gap-[16px]">
            <BaseDropdown label="Жанры" :options="genreOptions" v-model="selectedGenre" />
            <BaseDropdown label="Страны" :options="countryOptions" v-model="selectedCountry" />
            <BaseDropdown label="Годы" :options="yearOptions" v-model="selectedYear" />
          </div>

          <!-- Sorting -->
          <SortToggle />

        </div>
      </div>

      <!-- Grid -->
      <div class="mt-[64px]">
        <div class="grid grid-cols-4 gap-[32px]">
          <MovieCard 
            v-for="(movie, index) in allMovies.slice(0, displayCount)" 
            :key="index"
            size="m"
            :posterUrl="movie.posterUrl"
            :rating="movie.rating"
            :statusText="movie.statusText"
            :year="movie.year"
            :ageLimit="movie.ageLimit"
            :genres="movie.genres"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="displayCount < allMovies.length" class="flex justify-center mt-[64px]">
          <BaseButton variant="secondary" size="l" @click="loadMore">
            Показать еще
          </BaseButton>
        </div>
      </div>

    </Container>
  </main>
</template>

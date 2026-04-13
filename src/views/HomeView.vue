<script setup>
import { ref, onMounted } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import MovieCategoryBlock from '../components/MovieCategoryBlock.vue'
import GenreCard from '../components/GenreCard.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const homeData = ref({
  heroBanner: null,
  newReleases: [],
  top10: [],
  inCinema: [],
  movies: [],
  series: [],
  cartoons: [],
  genres: []
})

const isLoading = ref(true)

const mapMovie = (movie) => {
  if (!movie) return null
  return {
    ...movie,
    // ПРЯМОЙ МАППИНГ: постер в постер, баннер в баннер. Без перепутываний.
    posterUrl: movie.posterUrl, 
    bannerUrl: movie.bannerUrl,
    rating: movie.siteRating ? movie.siteRating * 2 : 0,
    genres: movie.genres?.map(g => g.name) || [],
    ageLimit: movie.ageLimit || '16+',
    statusText: movie.statusText || '' 
  }
}

const fetchHomeData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/home`)
    if (response.ok) {
      const data = await response.json()
      homeData.value = {
        ...data,
        heroBanner: mapMovie(data.heroBanner), // Маппим и баннер тоже!
        newReleases: data.newReleases.map(mapMovie),
        top10: data.top10.map(mapMovie),
        inCinema: data.inCinema.map(mapMovie),
        movies: data.movies.map(mapMovie),
        series: data.series.map(mapMovie),
        cartoons: data.cartoons.map(mapMovie),
      }
    }
  } catch (err) {
    console.error('Failed to fetch home data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchHomeData)

// Mock genres as fallback if API doesn't return enough
const defaultGenres = [
  { title: 'Комедии', imageUrl: '/Comedy.png' },
  { title: 'Боевики', imageUrl: '/Comedy.png' },
  { title: 'Фантастика', imageUrl: '/Comedy.png' },
  { title: 'Триллеры', imageUrl: '/Comedy.png' },
  { title: 'Драмы', imageUrl: '/Comedy.png' },
]

const getGenreImage = (name) => {
  const imageMap = {
    'Комедия': '/Comedy.png',
    'Боевик': '/Comedy.png',
    'Фантастика': '/Comedy.png',
    'Триллер': '/Comedy.png',
    'Драма': '/Comedy.png',
    'Мультфильм': '/Comedy.png',
    'Ужасы': '/Comedy.png',
    'Мелодрама': '/Comedy.png'
  }
  return imageMap[name] || '/Comedy.png'
}
</script>

<template>
  <main class="min-h-screen bg-bg-body">
    <HeroBanner 
      v-if="homeData.heroBanner"
      :title="homeData.heroBanner.title"
      :description="homeData.heroBanner.shortDescription || homeData.heroBanner.description"
      :rating="homeData.heroBanner.rating"
      :genres="homeData.heroBanner.genres"
      :ageLimit="homeData.heroBanner.ageLimit"
      :year="homeData.heroBanner.year"
      :bannerUrl="homeData.heroBanner.bannerUrl" 
      :slug="homeData.heroBanner.slug"
    />
    <HeroBanner v-else-if="!isLoading" /> <!-- Fallback to default if no banner -->

    <!-- New Releases -->
    <MovieCategoryBlock 
      v-if="homeData.newReleases.length"
      title="Новинки" 
      :isFirst="true" 
      :movies="homeData.newReleases" 
    />

    <MovieCategoryBlock 
      v-if="homeData.top10.length"
      title="Топ-10 недели" 
      :movies="homeData.top10" 
    />

    <!-- Genres -->
    <MovieCategoryBlock title="Жанры">
      <GenreCard 
        v-for="genre in (homeData.genres.length ? homeData.genres.map(g => ({ 
          id: g.id,
          title: g.name, 
          slug: g.slug,
          imageUrl: getGenreImage(g.name) 
        })) : defaultGenres)" 
        :key="genre.id || genre.slug || genre.title"
        :title="genre.title"
        :imageUrl="genre.imageUrl"
        @click="$router.push(`/catalog?genre_id=${genre.id}`)"
      />
    </MovieCategoryBlock>

    <!-- Content Sections -->
    <MovieCategoryBlock 
      v-if="homeData.movies.length"
      title="Фильмы" 
      :movies="homeData.movies" 
    />
    
    <MovieCategoryBlock 
      v-if="homeData.series.length"
      title="Сериалы" 
      :movies="homeData.series" 
    />
    
    <MovieCategoryBlock 
      v-if="homeData.cartoons.length"
      title="Мультфильмы" 
      :movies="homeData.cartoons" 
    />

    <!-- Loading Placeholder -->
    <div v-if="isLoading" class="py-[100px] text-center text-text-light/20 body-m animate-pulse">
      Загрузка контента...
    </div>

    <!-- Empty State if nothing is found (after loading) -->
    <div v-if="!isLoading && !homeData.movies.length && !homeData.newReleases.length" class="py-[100px] text-center text-text-light/20 body-m">
      Контент пока не добавлен. Зайдите в админ-панель для наполнения.
    </div>
  </main>
</template>

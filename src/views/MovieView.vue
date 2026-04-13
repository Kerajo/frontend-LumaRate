<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Container from '../components/Container.vue'
import BadgeInfo from '../components/BadgeInfo.vue'
import BaseButton from '../components/BaseButton.vue'
import IconButton from '../components/IconButton.vue'
import IconBookmarks from '../components/icons/IconBookmarks.vue'
import IconLogo from '../components/icons/IconLogo.vue'
import IconKinopoisk from '../components/icons/IconKinopoisk.vue'
import IconImdb from '../components/icons/IconImdb.vue'
import HorizontalScroll from '../components/HorizontalScroll.vue'
import ReviewCard from '../components/ReviewCard.vue'
import BaseModal from '../components/BaseModal.vue'
import StarRating from '../components/StarRating.vue'
import MovieCategoryBlock from '../components/MovieCategoryBlock.vue'
import BaseNotification from '../components/BaseNotification.vue'
import { getFullImageUrl } from '../utils/url'

const route = useRoute()
const router = useRouter()
const { currentUser, accessToken } = useAuth()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const movie = ref(null)
const isLoading = ref(true)
const isBookmarked = ref(false)
const allReviews = ref([])
const allRecensions = ref([])

const fetchMovieData = async (slug) => {
  isLoading.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/contents/${slug}`)
    if (response.ok) {
      movie.value = await response.json()
      if (movie.value.id) {
        fetchReviews(movie.value.id)
        fetchRecensions(movie.value.id)
      }
    } else {
      router.replace({ name: 'not-found' })
    }
  } catch (err) {
    console.error('Failed to fetch movie details:', err)
    router.replace({ name: 'not-found' })
  } finally {
    isLoading.value = false
  }
}

const fetchReviews = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contents/${contentId}/reviews?limit=100`)
    if (response.ok) {
      const data = await response.json()
      allReviews.value = data.data
    }
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
  }
}

const fetchRecensions = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contents/${contentId}/recensions?limit=100`)
    if (response.ok) {
      const data = await response.json()
      allRecensions.value = data.data
    }
  } catch (err) {
    console.error('Failed to fetch recensions:', err)
  }
}

onMounted(() => {
  fetchMovieData(route.params.slug)
})

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) fetchMovieData(newSlug)
})

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

// Map helpers
const mapReviewProps = (review) => ({
  id: review.id,
  authorName: review.author.login,
  authorRole: review.author.role,
  rating: review.rating || review.score,
  date: new Date(review.createdAt || review.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
  text: review.text
})

const mapRecensionProps = (rec) => ({
  id: rec.id,
  authorName: rec.author.login,
  authorRole: rec.author.role,
  title: rec.title,
  date: new Date(rec.publishedAt || rec.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
  text: rec.text
})

const tabs = [
  { label: 'О фильме', id: 'about' },
  { label: 'Актеры', id: 'actors' },
  { label: 'Рецензии', id: 'reviews' },
  { label: 'Отзывы', id: 'comments' },
  { label: 'Похожее', id: 'similar' },
]

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const genresDisplay = computed(() => movie.value?.genres?.map(g => g.name).join(', ') || '')
const countriesDisplay = computed(() => movie.value?.countries?.map(c => c.name).join(', ') || '')
const directorsDisplay = computed(() => movie.value?.directors?.map(d => d.fullName).join(', ') || '')
const actorsDisplay = computed(() => movie.value?.actors?.map(a => a.fullName).join(', ') || '')

// Modals Logic
const selectedFullReview = ref(null)
const showReadMoreModal = ref(false)
const openReadMore = (review) => {
  selectedFullReview.value = review
  showReadMoreModal.value = true
}

const writeType = ref('review') // 'review' or 'recension'
const showWriteModal = ref(false)
const newScore = ref(0)
const newTitle = ref('')
const newText = ref('')
const isSubmitting = ref(false)
const newTitleError = ref('')
const newTextError = ref('')
const notification = ref({ show: false, message: '', type: 'success' })

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
}

watch(newTitle, () => {
  if (newTitleError.value) newTitleError.value = ''
})
watch(newText, () => {
  if (newTextError.value) newTextError.value = ''
})

const openWriteModal = (type) => {
  if (!currentUser.value) {
    router.push('/login')
    return
  }
  writeType.value = type
  newScore.value = 0
  newTitle.value = ''
  newText.value = ''
  newTitleError.value = ''
  newTextError.value = ''
  showWriteModal.value = true
}

const submitFeedback = async () => {
  newTitleError.value = ''
  newTextError.value = ''

  if (writeType.value === 'review') {
    if (newScore.value === 0) {
      showNotification('Пожалуйста, выберите оценку!', 'error')
      return
    }
    if (newText.value.length < 10) {
      newTextError.value = 'Текст отзыва должен быть не менее 10 символов'
      return
    }
    if (newText.value.length > 255) {
      newTextError.value = 'Текст отзыва не должен превышать 255 символов'
      return
    }
  } else {
    if (newTitle.value.length < 5) {
      newTitleError.value = 'Заголовок рецензии должен быть не менее 5 символов'
      return
    }
    if (newTitle.value.length > 100) {
      newTitleError.value = 'Заголовок не должен превышать 100 символов'
      return
    }
    if (newText.value.length < 200) {
      newTextError.value = 'Текст рецензии должен быть не менее 200 символов'
      return
    }
    if (newText.value.length > 255) {
      newTextError.value = 'Текст рецензии не должен превышать 255 символов'
      return
    }
  }

  isSubmitting.value = true
  const endpoint = writeType.value === 'review' ? 'reviews' : 'recensions'
  const body = writeType.value === 'review' 
    ? { score: newScore.value, text: newText.value }
    : { title: newTitle.value, text: newText.value }

  try {
    const response = await fetch(`${API_BASE_URL}/contents/${movie.value.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      showNotification('Отправлено на модерацию!', 'success')
      showWriteModal.value = false
      if (writeType.value === 'review') fetchReviews(movie.value.id)
      else fetchRecensions(movie.value.id)
    } else {
      const errorData = await response.json()
      showNotification(errorData.message || 'Ошибка при отправке', 'error')
    }
  } catch (err) {
    console.error('Submission failed:', err)
    showNotification('Не удалось отправить. Ошибка соединения.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const similarMovies = ref([])
</script>

<template>
  <main v-if="movie" class="w-full">
    <!-- Banner Section -->
    <div
      class="w-full relative min-h-[700px] flex flex-col"
      :style="{
        backgroundImage: `
          linear-gradient(
            180deg,
            rgba(18, 18, 18, 0.8) 0%,
            rgba(18, 18, 18, 0) 50%,
            rgba(18, 18, 18, 0.8) 100%
          ),
          url('${getFullImageUrl(movie.bannerUrl || movie.posterUrl)}')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }"
    >
      <Container class="flex-grow flex flex-col justify-between pt-[120px] pb-[80px]">
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-[8px] body-m text-text-light/60">
          <router-link to="/" class="hover:text-text-light transition-colors">Главная</router-link>
          <span>/</span>
          <router-link to="/catalog" class="hover:text-text-light transition-colors">Фильмы</router-link>
          <span>/</span>
          <span class="text-text-light">{{ movie.title }}</span>
        </div>

        <!-- Movie Info -->
        <div class="flex flex-col gap-[24px] max-w-[800px]">
          <div class="flex items-center gap-[8px]">
            <BadgeInfo v-if="movie.ageRating" class="bg-bg-body">{{ movie.ageRating }}</BadgeInfo>
            <BadgeInfo v-if="movie.year" class="bg-bg-body">{{ movie.year }}</BadgeInfo>
            <BadgeInfo v-for="g in movie.genres.slice(0, 3)" :key="g.id" class="bg-bg-body">{{ g.name }}</BadgeInfo>
          </div>

          <div class="flex flex-col gap-[16px]">
            <h1 class="text-text-light heading-4xl leading-tight">{{ movie.title }}</h1>
            <div class="flex items-center gap-[16px]">
              <div class="flex items-center gap-[4px] body-m text-text-light">
                <IconLogo class="w-[24px] h-[24px] fill-primary" />
                <span>{{ movie.ratings?.siteRating ? (movie.ratings.siteRating * 2).toFixed(1) : 'Нет оценок' }}</span>
              </div>
              <div v-if="movie.ratings?.kinopoiskRating" class="flex items-center gap-[4px] body-m text-text-light">
                <IconKinopoisk class="w-[24px] h-[24px]" />
                <span>{{ movie.ratings.kinopoiskRating.toFixed(1) }}</span>
              </div>
              <div v-if="movie.ratings?.imdbRating" class="flex items-center gap-[4px] body-m text-text-light">
                <IconImdb class="w-[48px] h-[24px]" />
                <span>{{ movie.ratings.imdbRating.toFixed(1) }}</span>
              </div>
            </div>
            <p class="body-m text-text-light/80 leading-relaxed">{{ movie.shortDescription }}</p>
          </div>

          <div class="flex items-center gap-[8px]">
            <BaseButton variant="primary" size="l" @click="openWriteModal('review')">Оценить фильм</BaseButton>
            <IconButton variant="secondary" size="l" :isActive="isBookmarked" @click="toggleBookmark">
              <IconBookmarks class="w-6 h-6" />
            </IconButton>
          </div>
        </div>
      </Container>
    </div>

    <!-- Page Content -->
    <div class="w-full pt-[120px] pb-[64px] flex flex-col gap-[120px]">
      <Container>
        <div class="p-[4px] rounded-[8px] bg-bg-content flex gap-[12px] w-fit">
          <BaseButton v-for="tab in tabs" :key="tab.id" variant="secondary" size="s" @click="scrollTo(tab.id)">{{ tab.label }}</BaseButton>
        </div>
      </Container>

      <!-- About -->
      <section id="about">
        <Container>
          <div class="flex flex-col gap-[32px]">
            <h2 class="heading-xl text-text-light">О фильме</h2>
            <div class="flex gap-[48px]">
              <div class="w-1/2">
                <p class="body-m text-text-light leading-relaxed whitespace-pre-wrap">{{ movie.description }}</p>
              </div>
              <div class="w-1/2 flex flex-wrap gap-y-[24px]">
                <div v-if="directorsDisplay" class="w-1/2 flex flex-col gap-[4px]"><span class="body-m text-text-light/60">Режиссеры</span><span class="body-m text-text-light">{{ directorsDisplay }}</span></div>
                <div v-if="countriesDisplay" class="w-1/2 flex flex-col gap-[4px]"><span class="body-m text-text-light/60">Страны</span><span class="body-m text-text-light">{{ countriesDisplay }}</span></div>
                <div v-if="actorsDisplay" class="w-full flex flex-col gap-[4px]"><span class="body-m text-text-light/60">Актеры</span><span class="body-m text-text-light">{{ actorsDisplay }}</span></div>
                <div v-if="genresDisplay" class="w-full flex flex-col gap-[4px]"><span class="body-m text-text-light/60">Жанры</span><span class="body-m text-text-light">{{ genresDisplay }}</span></div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <!-- Actors -->
      <section id="actors" v-if="movie.actors?.length">
        <Container class="mb-[32px]"><h2 class="heading-xl text-text-light">Актеры</h2></Container>
        <HorizontalScroll>
          <div v-for="(actor, index) in movie.actors" :key="index" class="flex flex-col items-center gap-[16px] flex-shrink-0">
            <div class="w-[202px] h-[202px] rounded-full overflow-hidden bg-bg-content shadow-xl border-2 border-transparent hover:border-primary/20 transition-all">
              <img :src="actor.photoUrl ? getFullImageUrl(actor.photoUrl) : '/actorimg.png'" :alt="actor.fullName" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
            <span class="heading-s text-text-light text-center">{{ actor.fullName }}</span>
          </div>
        </HorizontalScroll>
      </section>

      <!-- Recensions (Expert) -->
      <section id="reviews">
        <Container class="flex flex-col gap-[32px]">
          <div class="flex justify-between items-center">
            <h2 class="heading-xl text-text-light">Рецензии</h2>
            <BaseButton v-if="currentUser && currentUser.role !== 'USER'" variant="primary" size="l" @click="openWriteModal('recension')">
              Написать рецензию
            </BaseButton>
          </div>
          <div v-if="allRecensions.length" class="grid grid-cols-2 gap-[24px]">
            <ReviewCard v-for="rec in allRecensions" :key="rec.id" v-bind="mapRecensionProps(rec)" @read-more="openReadMore(rec)" />
          </div>
          <div v-else class="py-12 px-8 bg-white/5 rounded-[24px] text-center text-text-light/20 body-m">Для этого фильма пока нет рецензий от экспертов.</div>
        </Container>
      </section>

      <!-- User Reviews -->
      <section id="comments">
        <Container class="flex flex-col gap-[32px]">
          <div class="flex justify-between items-center">
            <h2 class="heading-xl text-text-light">Отзывы пользователей</h2>
            <BaseButton variant="primary" size="l" @click="openWriteModal('review')">
              Написать отзыв
            </BaseButton>
          </div>
          <div v-if="allReviews.length" class="grid grid-cols-2 gap-[24px]">
            <ReviewCard v-for="review in allReviews" :key="review.id" v-bind="mapReviewProps(review)" @read-more="openReadMore(review)" />
          </div>
          <div v-else class="py-12 px-8 bg-white/5 rounded-[24px] text-center text-text-light/20 body-m">Станьте первым, кто оставит отзыв!</div>
        </Container>
      </section>

      <section>
        <Container>
          <div class="bg-bg-content rounded-[24px] p-[48px] flex justify-between items-center shadow-2xl overflow-hidden relative">
            <div class="flex flex-col gap-[32px] max-w-[600px] relative z-10">
              <div class="flex flex-col gap-[16px]">
                <h2 class="heading-2xl text-text-light">Не забудьте оценить фильм</h2>
                <p class="body-normal-regular text-text-light/60">Помогите другим пользователям сделать правильный выбор — поделитесь своим мнением о фильме.</p>
              </div>
              <BaseButton variant="primary" size="l" class="w-fit" @click="openWriteModal('review')">Оценить фильм</BaseButton>
            </div>
            <img src="/CTA.svg" alt="CTA" class="w-[200px] relative z-10" />
            <div class="absolute inset-0 bg-primary/5 blur-[120px]"></div>
          </div>
        </Container>
      </section>

      <section id="similar"><MovieCategoryBlock title="Похожее" :movies="similarMovies" /></section>
    </div>

    <!-- Modals -->
    <BaseModal :show="showReadMoreModal" :title="selectedFullReview?.author?.login" @close="showReadMoreModal = false">
      <div class="flex flex-col gap-[16px]">
        <div class="flex justify-between items-center">
          <StarRating v-if="selectedFullReview?.rating" :modelValue="selectedFullReview?.rating" readonly />
          <span class="body-s text-text-light/40">{{ new Date(selectedFullReview?.createdAt || selectedFullReview?.publishedAt).toLocaleDateString() }}</span>
        </div>
        <p class="body-normal-regular text-text-light/80 whitespace-pre-wrap">{{ selectedFullReview?.text }}</p>
      </div>
    </BaseModal>

    <BaseModal :show="showWriteModal" :title="writeType === 'review' ? 'Написать отзыв' : 'Написать рецензию'" @close="showWriteModal = false">
      <div class="flex flex-col gap-[32px]">
        <div v-if="writeType === 'review'" class="flex flex-col gap-[12px]">
            <span class="body-normal-medium text-text-light">Оцените фильм</span>
            <StarRating v-model="newScore" :size="32" />
        </div>
        <div v-else class="flex flex-col gap-[12px]">
            <div class="flex justify-between items-center">
              <span class="body-normal-medium text-text-light">Заголовок рецензии</span>
              <span :class="['body-small-regular', newTitle.length > 90 ? 'text-error' : 'text-text-light-disabled']">{{ newTitle.length }}/100</span>
            </div>
            <input 
              v-model="newTitle" 
              type="text"
              maxlength="100"
              placeholder="Укажите тему рецензии" 
              :class="['w-full p-[16px] rounded-[12px] bg-bg-content border text-text-light focus:border-primary outline-none transition-colors', newTitleError ? 'border-[#FF3B30]' : 'border-border-tertiary']" 
            />
            <div v-if="newTitleError" class="text-[#FF3B30] body-s px-[4px] mt-[-4px]">{{ newTitleError }}</div>
        </div>
        <div class="flex flex-col gap-[12px]">
          <div class="flex justify-between items-center">
            <span class="body-normal-medium text-text-light">Текст {{ writeType === 'review' ? 'отзыва' : 'рецензии' }}</span>
            <span :class="['body-small-regular', newText.length > 240 ? 'text-error' : 'text-text-light-disabled']">{{ newText.length }}/255</span>
          </div>
          <textarea 
            v-model="newText" 
            maxlength="255"
            :placeholder="writeType === 'review' ? 'Поделитесь впечатлениями...' : 'Ваш глубокий анализ фильма...'" 
            :class="['w-full h-[200px] p-[16px] rounded-[12px] bg-bg-content border text-text-light focus:border-primary outline-none resize-none transition-colors', newTextError ? 'border-[#FF3B30]' : 'border-border-tertiary']"
          ></textarea>
          <div v-if="newTextError" class="text-[#FF3B30] body-s px-[4px] mt-[-4px]">{{ newTextError }}</div>
        </div>
        <BaseButton variant="primary" size="l" class="ml-auto w-fit px-[48px]" :disabled="isSubmitting" @click="submitFeedback">
          {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
        </BaseButton>
      </div>
    </BaseModal>

    <BaseNotification 
      :show="notification.show" 
      :message="notification.message" 
      :type="notification.type" 
      @close="notification.show = false"
    />
  </main>
  <Container v-else-if="isLoading"><div class="py-[200px] text-center text-text-light/20 body-m animate-pulse">Загрузка информации о фильме...</div></Container>
</template>

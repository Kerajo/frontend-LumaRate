<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { accessToken } = useAuth()
// Компоненты проекта
import Container from '@/components/Container.vue'
import AdminMultiSelect from '@/components/Admin/AdminMultiSelect.vue'

// Списочные данные
const genres = ref([])
const countries = ref([])
const persons = ref([])

const form = ref({
  type: 'MOVIE',
  title: '',
  slug: '',
  year: new Date().getFullYear(),
  originalTitle: '',
  shortDescription: '',
  description: '',
  posterUrl: '',
  bannerUrl: '',
  ageRating: '16+',
  durationMinutes: 120,
  seasonsCount: null,
  episodesCount: null,
  externalRatingImdb: 0,
  externalRatingKinopoisk: 0,
  genreIds: [],
  countryIds: [],
  directorIds: [],
  actorIds: [],
  trailers: [
    {
      title: 'Официальный трейлер',
      provider: 'YOUTUBE',
      videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      previewImageUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg'
    }
  ],
  isPublished: true,
  isFeatured: true
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Загрузка справочников
onMounted(async () => {
  try {
    const headers = { 'Authorization': `Bearer ${accessToken.value}` }

    const [genresRes, countriesRes, personsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/genres`),
      fetch(`${API_BASE_URL}/countries`),
      fetch(`${API_BASE_URL}/admin/persons`, { headers })
    ])

    genres.value = (await genresRes.json()).map(g => ({ id: g.id, name: g.name }))
    countries.value = (await countriesRes.json()).map(c => ({ id: c.id, name: c.name }))
    persons.value = (await personsRes.json()).map(p => ({ id: p.id, name: p.fullName }))
  } catch (err) {
    console.error('Failed to fetch initial data:', err)
  }
})

const slugify = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ь': '', 'ы': 'y', 'ъ': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return text.toString().toLowerCase().trim()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const generateSlug = () => {
  if (!form.value.title.trim()) {
    form.value.slug = ''
    return
  }

  const titleSlug = slugify(form.value.title)
  const yearSuffix = form.value.year ? `-${form.value.year}` : ''
  form.value.slug = `${titleSlug}${yearSuffix}`
}

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  success.value = null

  try {
    // 3. Отправляем форму (с путями к файлам)
    const response = await fetch(`${API_BASE_URL}/admin/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.value}`
      },
      body: JSON.stringify(form.value)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при создании контента')
    }

    success.value = 'Контент успешно создан!'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <Container>
    <div class="space-y-[40px] animate-in fade-in slide-in-from-bottom-4 duration-700 pb-[100px]">
      <div class="flex items-center justify-between flex-wrap gap-[16px]">
        <h1 class="heading-l text-text-light tracking-tight font-bold">Добавление контента</h1>

        <div v-if="success" class="bg-primary/10 border border-primary/20 text-primary px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ success }}
        </div>
        <div v-if="error" class="bg-error/10 border border-error/20 text-error px-[20px] py-[10px] rounded-[10px] body-normal-medium">
          {{ error }}
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-[32px]">

        <!-- Название и Оригинальное название -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">Название (RU)</label>
            <input
              v-model="form.title"
              @input="generateSlug"
              type="text"
              placeholder="Название на русском"
              class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
              required
            />
          </div>
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">Original Title (EN)</label>
            <input
              v-model="form.originalTitle"
              type="text"
              placeholder="Original title"
              class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
            />
          </div>
        </div>

        <!-- Постер и Баннер -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">URL Постера</label>
            <input
              v-model="form.posterUrl"
              type="url"
              placeholder="https://example.com/poster.jpg"
              class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
              required
            />
          </div>
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">URL Баннера</label>
            <input
              v-model="form.bannerUrl"
              type="url"
              placeholder="https://example.com/banner.jpg"
              class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
              required
            />
          </div>
        </div>

        <!-- Тип и Жанры -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <AdminMultiSelect
            label="Тип"
            :options="[{id: 'MOVIE', name: 'Фильм'}, {id: 'SERIES', name: 'Сериал'}, {id: 'CARTOON', name: 'Мультфильм'}]"
            v-model="form.type"
            single
          />
          <AdminMultiSelect
            label="Жанры"
            :options="genres"
            v-model="form.genreIds"
          />
        </div>

        <!-- Страны -->
        <AdminMultiSelect
          label="Страны"
          :options="countries"
          v-model="form.countryIds"
        />

        <!-- Короткое описание -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Короткое описание</label>
          <input
            v-model="form.shortDescription"
            type="text"
            placeholder="Краткая суть одним предложением..."
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm"
          />
        </div>

        <!-- Полное описание -->
        <div class="space-y-[12px]">
          <label class="body-normal-medium text-text-light-secondary ml-[4px]">Полное описание</label>
          <textarea
            v-model="form.description"
            placeholder="Полное описание сюжета..."
            rows="6"
            class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[20px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled resize-none shadow-sm"
          ></textarea>
        </div>

        <!-- Режиссеры -->
        <AdminMultiSelect
          label="Режиссеры"
          :options="persons"
          v-model="form.directorIds"
          placeholder="Поиск по базе режиссеров..."
        />

        <!-- Актеры -->
        <AdminMultiSelect
          label="Актеры"
          :options="persons"
          v-model="form.actorIds"
          placeholder="Поиск по базе актеров..."
        />

        <!-- Дополнительные параметры -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-[24px]">
          <div class="space-y-[8px]">
            <label class="body-s text-text-light/40 ml-[4px]">Год</label>
            <input v-model="form.year" @input="generateSlug" type="number" class="w-full bg-bg-content border border-white/5 rounded-[10px] px-[16px] py-[12px] text-text-light focus:outline-none focus:border-primary/40" />
          </div>
          <div class="space-y-[8px]">
            <label class="body-s text-text-light/40 ml-[4px]">Возраст</label>
            <input v-model="form.ageRating" type="text" class="w-full bg-bg-content border border-white/5 rounded-[10px] px-[16px] py-[12px] text-text-light focus:outline-none focus:border-primary/40" />
          </div>
          <div class="space-y-[8px]">
            <label class="body-s text-text-light/40 ml-[4px]">Длит. (м)</label>
            <input v-model="form.durationMinutes" type="number" class="w-full bg-bg-content border border-white/5 rounded-[10px] px-[16px] py-[12px] text-text-light focus:outline-none focus:border-primary/40" />
          </div>
          <div class="space-y-[8px]">
            <label class="body-s text-text-light/40 ml-[4px]">IMDb</label>
            <input v-model="form.externalRatingImdb" type="number" step="0.1" class="w-full bg-bg-content border border-white/5 rounded-[10px] px-[16px] py-[12px] text-text-light focus:outline-none focus:border-primary/40" />
          </div>
          <div class="space-y-[8px]">
            <label class="body-s text-text-light/40 ml-[4px]">Кинопоиск</label>
            <input v-model="form.externalRatingKinopoisk" type="number" step="0.1" class="w-full bg-bg-content border border-white/5 rounded-[10px] px-[16px] py-[12px] text-text-light focus:outline-none focus:border-primary/40" />
          </div>
        </div>

        <!-- Параметры сериала -->
        <div v-if="form.type === 'SERIES'" class="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">Количество сезонов</label>
            <input v-model="form.seasonsCount" type="number" placeholder="Например: 1" class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm" />
          </div>
          <div class="space-y-[12px]">
            <label class="body-normal-medium text-text-light-secondary ml-[4px]">Количество серий</label>
            <input v-model="form.episodesCount" type="number" placeholder="Например: 10" class="w-full bg-bg-content border border-white/5 rounded-[12px] px-[24px] py-[18px] text-text-light body-normal-regular focus:outline-none focus:border-primary/40 transition-all placeholder:text-text-light-disabled shadow-sm" />
          </div>
        </div>

        <!-- Кнопка отправки -->
        <div class="pt-[40px]">
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-[24px] bg-primary hover:brightness-110 active:scale-[0.99] text-text-dark heading-s font-bold rounded-[14px] transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {{ loading ? 'Создание...' : 'Добавить контент' }}
          </button>
        </div>

        <!-- Debug JSON (только при ошибке) -->
        <div v-if="error" class="mt-8 p-4 bg-black/50 rounded-lg overflow-auto max-h-[400px] border border-error/20">
          <h3 class="text-xs font-mono text-error/60 uppercase mb-2">Debug Payload Output (Error state):</h3>
          <pre class="text-xs font-mono text-error/40">{{ JSON.stringify(form, null, 2) }}</pre>
        </div>

      </form>
    </div>
  </Container>
</template>

<style scoped>
.animate-in {
  animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

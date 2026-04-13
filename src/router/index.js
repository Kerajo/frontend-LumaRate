import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'LumaRate — Смотреть фильмы онлайн' }
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: CatalogView,
      meta: { title: 'Каталог фильмов — LumaRate' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Страница не найдена — LumaRate' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Вход — LumaRate' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Регистрация — LumaRate' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Мой профиль — LumaRate' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
      meta: { title: 'Поиск — LumaRate' }
    },
    {
      path: '/movie/:slug',
      name: 'movie',
      component: () => import('../views/MovieView.vue'),
      meta: { title: 'LumaRate' } // Динамически обновляется в MovieView.vue
    },
    {
      path: '/admin',
      component: () => import('../views/Admin/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN', 'MODERATOR'] },
      children: [
        {
          path: '',
          redirect: (to) => {
            // Если админ - на контент, если модератор - на модерацию
            const user = JSON.parse(localStorage.getItem('lumarate_user') || '{}');
            if (user.role === 'ADMIN') return '/admin/content';
            return '/admin/moderation';
          }
        },
        {
          path: 'content',
          name: 'admin-content-list',
          component: () => import('../views/Admin/AdminContentListView.vue'),
          meta: { roles: ['ADMIN'], title: 'Управление контентом — LumaRate Admin' }
        },
        {
          path: 'content/add',
          name: 'admin-content-add',
          component: () => import('../views/Admin/AdminContentView.vue'),
          meta: { roles: ['ADMIN'], title: 'Добавить контент — LumaRate Admin' }
        },
        {
          path: 'content/edit/:id',
          name: 'admin-content-edit',
          component: () => import('../views/Admin/AdminContentView.vue'),
          meta: { roles: ['ADMIN'], title: 'Редактировать контент — LumaRate Admin' }
        },
        {
          path: 'persons',
          name: 'admin-persons',
          component: () => import('../views/Admin/AdminPersonsView.vue'),
          meta: { roles: ['ADMIN'], title: 'Персоны — LumaRate Admin' }
        },
        {
          path: 'genres',
          name: 'admin-genres',
          component: () => import('../views/Admin/AdminGenresView.vue'),
          meta: { roles: ['ADMIN'], title: 'Жанры — LumaRate Admin' }
        },
        {
          path: 'countries',
          name: 'admin-countries',
          component: () => import('../views/Admin/AdminCountriesView.vue'),
          meta: { roles: ['ADMIN'], title: 'Страны — LumaRate Admin' }
        },
        {
          path: 'moderation',
          name: 'admin-moderation',
          component: () => import('../views/Admin/AdminModerationView.vue'),
          meta: { roles: ['MODERATOR', 'ADMIN'], title: 'Модерация — LumaRate Admin' }
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('../views/Admin/AdminRolesView.vue'),
          meta: { roles: ['ADMIN'], title: 'Роли пользователей — LumaRate Admin' }
        }
      ]
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('../views/AccessDeniedView.vue'),
      meta: { title: 'Доступ запрещён — LumaRate' }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('lumarate_user') || 'null');
  const isAuthenticated = !!user;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  if (to.meta.roles && isAuthenticated) {
    if (!to.meta.roles.includes(user.role)) {
      if (to.path.startsWith('/admin')) {
        return next({ name: 'access-denied' });
      }
    }
  }

  next();
});

router.afterEach((to) => {
  const title = to.meta?.title
  if (title) {
    document.title = title
  }
})

export default router

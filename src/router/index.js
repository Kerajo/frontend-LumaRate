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
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: CatalogView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue')
    },
    {
      path: '/movie/:slug',
      name: 'movie',
      component: () => import('../views/MovieView.vue')
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
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'content/add',
          name: 'admin-content-add',
          component: () => import('../views/Admin/AdminContentView.vue'),
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'content/edit/:id',
          name: 'admin-content-edit',
          component: () => import('../views/Admin/AdminContentView.vue'),
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'persons',
          name: 'admin-persons',
          component: () => import('../views/Admin/AdminPersonsView.vue'),
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'genres',
          name: 'admin-genres',
          component: () => import('../views/Admin/AdminGenresView.vue'),
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'countries',
          name: 'admin-countries',
          component: () => import('../views/Admin/AdminCountriesView.vue'),
          meta: { roles: ['ADMIN'] }
        },
        {
          path: 'moderation',
          name: 'admin-moderation',
          component: () => import('../views/Admin/AdminModerationView.vue'), // Пустышка пока
          meta: { roles: ['MODERATOR', 'ADMIN'] }
        },
        {
          path: 'roles',
          name: 'admin-roles',
          component: () => import('../views/Admin/AdminRolesView.vue'), // Пустышка пока
          meta: { roles: ['ADMIN'] }
        }
      ]
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('../views/AccessDeniedView.vue')
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

export default router

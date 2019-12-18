import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/Login'
import Register from '@/views/Register'

import Home from '@/views/Home'
import Song from '@/views/Song'
import SongList from '@/views/SongList'
import AdminDashboard from '@/views/admin/AdminDashboard'
import UserDashboard from '@/views/user/UserDashboard'
import ManageSong from '@/views/admin/ManageSong'

import PostOrder from '@/views/PostOrder'

import store from '@/store'

Vue.use(Router)

const routeParamToNumber = (params, key) => {
  const value = Number.parseInt(params[key], 10)
  if (Number.isNaN(value)) return null
  const returnObj = {}
  returnObj[key] = value
  return returnObj
}

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/songs',
      name: 'songs',
      component: SongList
    },
    {
      path: '/instruments/:instrument',
      name: 'instruments',
      component: SongList,
      props: true
    },
    {
      path: '/genres/:genresCriteria',
      name: 'genres',
      component: SongList,
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: {
        guest: true
      }
    },
    {
      path: '/songs/:slug',
      name: 'song',
      component: Song,
      props: true
    },
    {
      path: '/admin',
      name: 'adminDashboard',
      component: AdminDashboard,
      meta: {
        allowedFor: ['admin']
      }
    },
    {
      path: '/user',
      name: 'userDashboard',
      component: UserDashboard,
      meta: {
        allowedFor: ['user', 'admin']
      }
    },
    {
      path: '/admin/songs/add',
      name: 'addSong',
      component: ManageSong,
      meta: {
        allowedFor: ['admin']
      }
    },
    {
      path: '/admin/songs/edit/:songId',
      name: 'editSong',
      component: ManageSong,
      props: route => ({
        ...routeParamToNumber(route.params, 'songId')
      }),
      meta: {
        allowedFor: ['admin']
      }
    },
    {
      path: '/postorder',
      name: 'postorder',
      component: PostOrder
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { user } = store.state.authentication
  const isUser = !!user
  const isAdmin = isUser && user.isAdmin

  const { allowedFor, guest } = to.meta
  if (guest && isUser) return next('/')
  if (!allowedFor) return next()

  if (isAdmin) return next()
  if (isUser && allowedFor.includes('user')) next()

  return next('/')
})

export default router
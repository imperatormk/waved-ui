import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/Login'
import Register from '@/views/Register'

import Song from '@/views/Song'
import Songs from '@/views/Songs'
import AdminDashboard from '@/views/admin/AdminDashboard'
import UserDashboard from '@/views/user/UserDashboard'
import ManageSong from '@/views/admin/ManageSong'

import ThankYou from '@/views/ThankYou'

Vue.use(Router)

const routeParamToNumber = (params, key) => {
  const value = Number.parseInt(params[key], 10)
  if (Number.isNaN(value)) return null
  const returnObj = {}
  returnObj[key] = value
  return returnObj
}

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Songs
    },
    {
      path: '/instruments/:instrument',
      name: 'instruments',
      component: Songs,
      props: true
    },
    {
      path: '/genres/:genresCriteria',
      name: 'genres',
      component: Songs,
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
      component: Register
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
      component: AdminDashboard
    },
    {
      path: '/user',
      name: 'userDashboard',
      component: UserDashboard
    },
    {
      path: '/admin/songs/add',
      name: 'addSong',
      component: ManageSong
    },
    {
      path: '/admin/songs/edit/:songId',
      name: 'editSong',
      component: ManageSong,
      props: route => ({
        ...routeParamToNumber(route.params, 'songId')
      })
    },
    {
      path: '/thankyou',
      name: 'thankyou',
      component: ThankYou
    }
  ]
})
import Vue from 'vue'
import Router from 'vue-router'
import Song from '@/views/Song'
import Songs from '@/views/Songs'
import Dashboard from '@/views/admin/Dashboard'
import AddSong from '@/views/admin/AddSong'

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
      path: '/songs/:songId',
      name: 'song',
      component: Song,
      props: route => ({
        ...routeParamToNumber(route.params, 'songId')
      })
    },
    {
      path: '/songs',
      name: 'songs',
      component: Songs
    },
    {
      path: '/admin',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/admin/songs/add',
      name: 'addSong',
      component: AddSong
    }
  ]
})
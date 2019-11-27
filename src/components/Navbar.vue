<template lang="pug">
  b-navbar(toggleable="lg" variant="light" sticky)
    b-navbar-brand(:to="{ name: 'home' }") Waved
    b-navbar-toggle(target="nav-collapse")

    b-collapse(id="nav-collapse" is-nav)
      b-navbar-nav
        b-nav-item-dropdown
          template(slot="button-content") Genres
          b-dropdown-item(v-for="genre in genres"
            :key="genre.id"
            :value="genre.name"
            @click="gotoGenre(genre.tag)") {{ genre.name }}
        b-nav-item-dropdown
          template(slot="button-content") Instruments
          b-dropdown-item(v-for="instrument in Object.keys(instruments)"
            :key="instrument"
            :value="instrument"
            v-if="instrument !== 'custom'"
            @click="gotoInstrument(instrument)") {{ instruments[instrument].title }}
      b-navbar-nav.ml-auto
        b-nav-item-dropdown(v-if="loggedIn" right)
          template(slot="button-content") {{ loggedUser.username }}
          b-dropdown-item(v-if="loggedUser.isAdmin" :to="{ name: 'adminDashboard' }") Admin dashboard
          b-dropdown-item(:to="{ name: 'userDashboard' }") Dashboard
          b-dropdown-item(@click="logout") Log out
        .flex-row(v-else)
          b-nav-item(:to="{ name: 'login' }") Log in
          b-nav-item(:to="{ name: 'register' }") Register
</template>

<script>
import Api from '@/services/api'
import { instruments } from '@/data'

export default {
  data: () => ({
    instruments,
    genres: []
  }),
  created() {
    this.getGenres()
  },
  computed: {
    loggedIn() {
      return this.$store.state.authentication.status.loggedIn
    },
    loggedUser() {
      return this.$store.state.authentication.user
    }
  },
  methods: {
    getGenres() {
      return Api.getGenres()
        .then((genres) => {
          this.genres = genres
        })
    },
    gotoGenre(genre) {
      this.$router.push({ name: 'genres', params: { genresCriteria: genre } })
    },
    gotoInstrument(instrument) {
      this.$router.push({ name: 'instruments', params: { instrument } })
    },
    logout() {
      this.$store.dispatch('authentication/logout')
    }
  }
}
</script>

<template lang="pug">
  b-navbar(toggleable="lg" variant="light" sticky)
    b-navbar-brand(:to="{ name: 'home' }") Waved
    b-navbar-toggle(target="nav-collapse")

    b-collapse(id="nav-collapse" is-nav)
      .p10
      b-navbar-nav
        b-nav-item-dropdown
          template(slot="button-content") Genres
          b-dropdown-item(v-for="(genre, idx) in Object.keys(genres)"
            :key="genre"
            :value="genre"
            @click="gotoGenre(genre)") {{ genres[genre] }}
        b-nav-item-dropdown
          template(slot="button-content") Instruments
          b-dropdown-item(v-for="(instrument, idx) in Object.keys(instruments)"
            :key="instrument"
            :value="instrument"
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
import { instruments, genres } from '@/data'

export default {
  data: () => ({
    instruments,
    genres
  }),
  computed: {
    loggedIn() {
      return this.$store.state.authentication.status.loggedIn
    },
    loggedUser() {
      return this.$store.state.authentication.user
    }
  },
  methods: {
    gotoGenre(genre) {
      this.$router.push({ name: 'genres', params: { genre } })
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

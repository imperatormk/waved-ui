<template lang="pug">
  b-navbar(toggleable="lg" variant="light" sticky)
    b-navbar-brand(:to="{ name: 'home' }") Waved
    b-navbar-toggle(target="nav-collapse")

    b-collapse(id="nav-collapse" is-nav)
      b-navbar-nav
        b-nav-item(href="#") Link A
        b-nav-item(href="#") Link B
      b-navbar-nav.ml-auto
        b-nav-item-dropdown(v-if="loggedUser" right)
          template(slot="button-content") {{ loggedUser.username }}
          b-dropdown-item(@click="logout") Log out
        .flex-row(v-else)
          b-nav-item(:to="{ name: 'login' }") Log in
          b-nav-item(:to="{ name: 'register' }") Register
</template>

<script>
export default {
  computed: {
    loggedIn() {
      return this.$store.state.authentication.status.loggedIn
    },
    loggedUser() {
      return this.$store.state.authentication.user
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('authentication/logout')
    }
  }
}
</script>

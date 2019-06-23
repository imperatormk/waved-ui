<template lang="pug">
  div
    b-card.p15
      b-alert(:show="loggingIn" variant="info") Please wait...
      b-alert(:show="!!loginError" variant="danger") {{ loginError }}
      b-form-input(v-model="user.username" placeholder="Username")
      br
      b-form-input(v-model="user.password" placeholder="Password" type="password")
      br
      b-button(@click="login" variant="primary") Login
</template>

<script>
export default {
  created() {
    this.$store.dispatch('authentication/logout')
  },
  data: () => ({
    user: {
      username: '',
      password: ''
    },
    loginError: ''
  }),
  computed: {
    loggingIn() {
      return this.$store.state.authentication.status.loggingIn
    }
  },
  methods: {
    login() {
      const username = this.user.username.trim()
      const password = this.user.password.trim()

      if (!username || !password) return

      this.loginError = ''
      this.$store.dispatch('authentication/login', { username, password })
        .then((user) => {
          this.$router.push({ name: 'home' })
        })
        .catch((err) => {
          this.loginError = err.msg
        })
    }
  }
}
</script>

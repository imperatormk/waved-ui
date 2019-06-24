<template lang="pug">
  div
    b-card.p15
      b-alert(:show="!!registerError" variant="danger") {{ registerError }}
      b-form-input(v-model="user.username" placeholder="Username")
      br
      b-form-input(v-model="user.email" placeholder="Email")
      br
      b-form-input(v-model="user.password" placeholder="Password" type="password")
      br
      b-form-input(v-model="user.confirmPassword" placeholder="Confirm password" type="password")
      br
      b-button(@click="register" variant="primary") Register
</template>

<script>
import Api from '@/services/api'

export default {
  data: () => ({
    user: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    registerError: ''
  }),
  methods: {
    register() {
      const username = this.user.username.trim()
      const email = this.user.email.trim()
      const password = this.user.password.trim()
      const confirmPassword = this.user.confirmPassword.trim()

      if (!username || !email || !password || !confirmPassword) return

      const userObj = {
        username,
        email,
        password,
        confirmPassword
      }

      this.registerError = ''
      Api.registerUser(userObj)
        .then(() => {
          this.$router.push({ name: 'login' })
          // TODO: add an alert here
        })
        .catch((err) => {
          this.registerError = err.msg
        })
    }
  }
}
</script>
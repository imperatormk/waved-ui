<template lang="pug">
  Layout(title="Register")
    b-card.p15
      b-form(@submit="register")
        b-alert(:show="!!registerError" variant="danger") {{ registerError }}
        b-input-group(prepend="Username")
          b-form-input(v-model="user.username" required)
        br
        b-input-group(prepend="Email")
          b-form-input(v-model="user.email" required)
        br
        b-input-group(prepend="Password")
          b-form-input(v-model="user.password" required placeholder="(unchanged)" type="password")
        br
        b-input-group(v-if="user.password" prepend="Confirm password")
          b-form-input(v-model="user.confirmPassword" required type="password")
        br
        b-button(type="submit" variant="primary") Register
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
    register(e) {
      e.preventDefault()

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
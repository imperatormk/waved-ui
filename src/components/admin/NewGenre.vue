<template lang="pug">
  b-form(@submit="onSubmit")
    b-form-input(v-model="genre.name" :state="!!genre.name" placeholder="Name" required)
    .m10
    b-button(type="submit" :disabled="adding" variant="primary") Submit
</template>

<script>
import Api from '@/services/api'

export default {
  data: () => ({
    genre: {
      name: ''
    },
    adding: false
  }),
  methods: {
    onSubmit(e) {
      e.preventDefault()
      this.adding = true
      Api.postGenre(this.genre)
        .then((res) => {
          this.adding = false
          this.$emit('saved', res)
        })
    }
  }
}
</script>
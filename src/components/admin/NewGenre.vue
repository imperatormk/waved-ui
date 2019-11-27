<template lang="pug">
  b-form(@submit="onSubmit")
    b-form-input(v-model="genre.name" :state="!!genre.name" placeholder="Name" required)
    .m10
    b-button(type="submit" :disabled="posting" variant="primary") Submit
</template>

<script>
import Api from '@/services/api'

export default {
  props: {
    initGenre: Object
  },
  created() {
    if (this.initGenre) this.genre = this.initGenre
  },
  data: () => ({
    genre: {
      name: ''
    },
    posting: false
  }),
  methods: {
    onSubmit(e) {
      e.preventDefault()
      this.posting = true

      const apiAction = !this.genre.id ? Api.postGenre : Api.updateGenre
      apiAction(this.genre)
        .then((res) => {
          this.$emit('saved', res)
        })
        .finally(() => {
          this.posting = false
        })
    }
  }
}
</script>
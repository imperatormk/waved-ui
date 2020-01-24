<template lang="pug">
  b-form(@submit="onSearch")
    b-input-group
      b-form-input(v-model.trim="searchTerm" type="text" style="width:300px;" placeholder="Title, artist...")
      b-input-group-append(v-if="searchQuery" @click="clearSearch" style="border:1px solid #ced4da;border-top-right-radius:0.25rem;border-bottom-right-radius:0.25rem;")
        .flex-row.align-center.p5-side
          font-awesome-icon(icon="times" fixed-width)
</template>

<script>
export default {
  created() {
    const searchTerm = this.searchQuery
    if (searchTerm) this.searchTerm = searchTerm
  },
  computed: {
    searchQuery() {
      return this.$route.query.q
    }
  },
  methods: {
    onSearch(e) {
      e.preventDefault()

      const { searchTerm } = this
      const pathObj = { name: 'songs' }

      if (searchTerm) {
        pathObj.query = { q: searchTerm }
      }
      this.$router.push(pathObj)
    },
    clearSearch() {
      if (!this.searchQuery) return
      this.$router.push({ name: 'songs' })
    }
  }
}
</script>
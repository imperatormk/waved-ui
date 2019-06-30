<template lang="pug">
  Layout(title="Admin dashboard")
    b-card
      .flex-row.space-between.align-center(slot="header")
        span Songs
        b-button(@click="gotoAddSong" variant="primary") Add new song
      .flex-col
        b-table(
          id="song-table"
          :items="songs"
          :busy="!loaded"
          :per-page="pagination.size"
          :current-page="1"
          :fields="fields"
          show-empty
          hover
          small
        )
          template(slot="empty")
            h5 Nothing to see here...
          template(slot="table-busy")
            h5 Loading...
        b-pagination(
          v-if="totalElements > pagination.size"
          v-model="pagination.page"
          :total-rows="totalElements"
          :per-page="pagination.size"
          aria-controls="song-table"
          @change="fetchData"
        )
</template>

<script>
import Api from '@/services/api'

export default {
  created() {
    this.fetchData()
  },
  data: () => ({
    pagination: {
      page: 1,
      size: 10
    },
    totalElements: 0,
    fields: ['title', 'artist', 'status'],
    songs: [],
    loaded: false
  }),
  methods: {
    fetchData() {
      this.loaded = false
      Api.getSongs(this.pagination)
        .then((resp) => {
          this.songs = resp.content
          this.totalElements = resp.totalElements
          this.loaded = true
        })
    },
    gotoAddSong() {
      this.$router.push({ name: 'addSong' })
    }
  }
}
</script>
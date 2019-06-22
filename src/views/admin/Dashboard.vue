<template lang="pug">
  div.text-white
    h3 Admin panel
    .p15
      b-button(@click="gotoAddSong" variant="light") Add new song
    .p15.flex-col(v-if="loaded")
      b-table(
        id="song-table"
        :items="songs"
        :per-page="pagination.size"
        :current-page="currentPage"
        show-empty
        small
      )
        template(slot="empty" slot-scope="scope")
          h5 Nothing to see here... {{ scope.emptyText }}
      b-pagination(
        v-model="currentPage"
        :total-rows="totalElements"
        :per-page="pagination.size"
        aria-controls="song-table"
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
    currentPage: 1,
    totalElements: 0,
    songs: [],
    loaded: false
  }),
  methods: {
    fetchData() {
      this.loaded = false
      Api.getSongs(this.pagination)
        .then((songs) => {
          this.songs = songs
          this.loaded = true
        })
    },
    gotoAddSong() {
      this.$router.push({ name: 'addSong' })
    }
  }
}
</script>


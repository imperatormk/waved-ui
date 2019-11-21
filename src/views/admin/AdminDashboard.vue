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
          :fields="songFields"
          show-empty
          hover
          small
        )
          template(slot="empty")
            span Nothing to see here...
          template(slot="table-busy")
            span Loading...
        b-pagination(
          v-if="totalElements > pagination.size"
          v-model="pagination.page"
          :total-rows="totalElements"
          :per-page="pagination.size"
          aria-controls="song-table"
          @change="fetchData"
        )
    .m10
    b-card
      .flex-row.space-between.align-center(slot="header")
        span Genres
        b-button(@click="newGenreVisible=!newGenreVisible" variant="primary") Add new genre
      .p20-bot(v-if="newGenreVisible && loaded")
        NewGenre(@saved="fetchData")
      .flex-col
        b-table(
          id="genre-table"
          :items="genres"
          :busy="!loaded"
          :per-page="pagination.size"
          :current-page="1"
          :fields="genreFields"
          show-empty
          hover
          small
        )
          template(slot="empty")
            span Nothing to see here...
          template(slot="table-busy")
            span Loading...
        b-pagination(
          v-if="totalElements > pagination.size"
          v-model="pagination.page"
          :total-rows="totalElements"
          :per-page="pagination.size"
          aria-controls="genre-table"
          @change="fetchData"
        )
</template>

<script>
import Api from '@/services/api'
import NewGenre from '@/components/admin/NewGenre'

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
    songFields: ['title', 'artist', 'status'],
    genreFields: ['name'],
    songs: [],
    genres: [],
    newGenreVisible: false,
    loaded: false
  }),
  methods: {
    fetchData() {
      this.loaded = false
      this.newGenreVisible = false

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
  },
  components: {
    NewGenre
  }
}
</script>
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
          :current-page="pagination.page"
          :fields="songFields"
          show-empty
          hover
          small
        )
          template(v-slot:cell(actions)="data")
            .flex-row
              b-button(@click="gotoEditSong(data.item.id)" size="sm" variant="warning")
                font-awesome-icon(icon="pen" fixed-width)
              .p5
              b-button(@click="deleteSong(data.item.id)" size="sm" variant="danger")
                font-awesome-icon(:icon="songToDelete !== data.item.id ? 'trash-alt' : 'check'" fixed-width)
              template(v-if="!data.item.published")
                .p5
                b-button(@click="publishSong(data.item.id)" size="sm" variant="primary")
                  font-awesome-icon(icon="rocket" fixed-width)
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
        b-button(@click="initAddGenre" variant="primary") Add new genre
      .p20-bot(v-if="newGenreVisible && loaded")
        NewGenre(@saved="fetchData" :initGenre="genreToEdit")
      .flex-col
        b-table(
          id="genre-table"
          :items="genres"
          :busy="!loaded"
          :fields="genreFields"
          show-empty
          hover
          small
        )
          template(v-slot:cell(actions)="data")
            .flex-row
              b-button(@click="initUpdateGenre(data.item)" size="sm" variant="warning")
                font-awesome-icon(icon="pen" fixed-width)
              .p5
              b-button(@click="deleteGenre(data.item.id)" size="sm" variant="danger")
                font-awesome-icon(:icon="genreToDelete !== data.item.id ? 'trash-alt' : 'check'" fixed-width)
          template(slot="empty")
            span Nothing to see here...
          template(slot="table-busy")
            span Loading...
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
    songFields: [
      { key: 'title', label: 'Title' },
      { key: 'artist', label: 'Artist' },
      { key: 'slug', label: 'Tag' },
      { key: 'status', label: 'Status' },
      { key: 'actions', label: 'Actions' }
    ],
    genreFields: [
      { key: 'name', label: 'Name' },
      { key: 'tag', label: 'Tag' },
      { key: 'actions', label: 'Actions' }
    ],
    songs: [],
    genres: [],
    newGenreVisible: false,
    genreToEdit: null,
    songToDelete: null,
    genreToDelete: null,
    loaded: false
  }),
  methods: {
    fetchData() {
      this.loaded = false
      this.newGenreVisible = false

      const criteriaObj = { unpublished: true }
      const songsPromise = Api.getSongs(this.pagination, criteriaObj)
        .then((resp) => {
          this.songs = resp.content
          this.totalElements = resp.totalElements
        })

      const genresPromise = Api.getGenres()
        .then((genres) => {
          this.genres = genres
        })

      Promise.all([songsPromise, genresPromise])
        .finally(() => {
          this.loaded = true
        })
    },
    gotoAddSong() {
      this.$router.push({ name: 'addSong' })
    },
    gotoEditSong(songId) {
      this.$router.push({ name: 'editSong', params: { songId } })
    },
    publishSong(songId) {
      Api.publishSong(songId)
        .then(() => this.fetchData())
    },
    deleteSong(songId) {
      if (this.songToDelete !== songId) {
        this.songToDelete = songId
      } else {
        Api.deleteSong(songId)
          .then(() => this.fetchData())
      }
    },
    initAddGenre() {
      if (!this.genreToEdit) {
        this.newGenreVisible = !this.newGenreVisible
      } else {
        this.newGenreVisible = false
        this.genreToEdit = null
        this.$nextTick(() => {
          this.newGenreVisible = true
        })
      }
    },
    initUpdateGenre(genre) {
      this.newGenreVisible = false
      this.genreToEdit = genre
      this.$nextTick(() => {
        this.newGenreVisible = true
      })
    },
    deleteGenre(genreId) {
      if (this.genreToDelete !== genreId) {
        this.genreToDelete = genreId
      } else {
        Api.deleteGenre(genreId)
          .then(() => this.fetchData())
      }
    }
  },
  components: {
    NewGenre
  }
}
</script>
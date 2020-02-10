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
          :per-page="pageSize"
          :current-page="1"
          :fields="songFields"
          show-empty
          hover
          responsive
          small
        )
          template(v-slot:cell(actions)="data")
            .flex-row
              b-button(@click="gotoEditSong(data.item.id)" size="sm" variant="warning")
                font-awesome-icon(icon="pen" fixed-width)
              .p5
              b-button(@click="deleteSong(data.item.id)" size="sm" variant="danger")
                font-awesome-icon(:icon="songToDelete !== data.item.id ? 'trash-alt' : 'check'" fixed-width)
              .p5
              b-button(@click="toggleSongArchive(data.item.id, data.item.archived)" size="sm" variant="info")
                font-awesome-icon(:icon="data.item.archived ? 'box-open' : 'box'" fixed-width)
              template(v-if="!data.item.published")
                .p5
                b-button(@click="publishSong(data.item.id)" size="sm" variant="primary")
                  font-awesome-icon(icon="rocket" fixed-width)
          template(slot="empty")
            span Nothing to see here...
          template(slot="table-busy")
            span Loading...
        .flex-row.space-between.align-center
          div
            b-pagination(
              v-if="totalElements > pageSize"
              v-model="pagination.page"
              :total-rows="totalElements"
              :per-page="pageSize"
              aria-controls="song-table"
              @change="fetchDataDeferred"
            )
          div
            b-dropdown
              template(v-slot:button-content)
                span Per page: {{ pageSize }}
              b-dropdown-item(
                v-for="size in [10,20,50,100]"
                :key="size"
                @click="pagination.size = size") {{ size }}
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
          responsive
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
    .m10
    b-card
      .flex-row.space-between.align-center(slot="header")
        span Settings
        b-button(@click="saveConfig" variant="primary") Save settings
      .flex-col
        .flex-row.w50.space-between
          span.font-weight-bold Logo
          .flex-col
            img.p5-bot(v-if="logoConfig" :src="logoSrc" width="200")
            span(v-else) N/A
            input(v-if="loaded" type="file" @change="logoBrowsed")
</template>

<script>
import Api from '@/services/api'
import NewGenre from '@/components/admin/NewGenre'
import { getServerUrl } from '@/services/system'

const serverUrl = getServerUrl()

export default {
  created() {
    this.fetchData()
  },
  watch: {
    pageSize() {
      this.fetchDataDeferred()
    }
  },
  data: () => ({
    pagination: {
      page: 1,
      size: 100,
      by: 'title'
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
    config: [],
    newGenreVisible: false,
    genreToEdit: null,
    songToDelete: null,
    genreToDelete: null,
    loaded: false
  }),
  methods: {
    fetchDataDeferred() {
      this.$nextTick(this.fetchData)
    },
    fetchData() {
      this.loaded = false
      this.newGenreVisible = false

      const criteriaObj = {
        unpublished: true,
        archived: 'all'
      }
      const songsPromise = Api.getSongs(this.pagination, criteriaObj)
        .then((resp) => {
          const { content, totalElements } = resp
          this.songs = content
          this.totalElements = totalElements
        })

      const genresPromise = Api.getGenres()
        .then((genres) => {
          this.genres = genres
        })

      const configPromise = Api.loadConfig()
        .then((config) => {
          this.config = config
        })

      Promise.all([songsPromise, genresPromise, configPromise])
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
    toggleSongArchive(songId, archived) {
      Api.toggleSongArchive(songId, !archived)
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
    },
    logoBrowsed(e) {
      const { files } = e.target
      const logo = files[0]
      if (!logo) return

      const reader = new FileReader()
      reader.onload = (re) => {
        const src = re.target.result
        const logoObj = {
          key: 'LOGO',
          value: src,
          file: logo
        }
        if (this.logoConfig) {
          this.config = this.config.filter(item => item.key !== 'LOGO')
        }
        this.config.push(logoObj)
      }
      reader.readAsDataURL(logo)
    },
    saveConfig() {
      const promises = []
      if (this.logoConfig && this.logoConfig.file) {
        const logoPromise = Api.updateLogo(this.logoConfig.file)
        promises.push(logoPromise)
      }
      const otherConfig = this.config.filter(item => item.key !== 'LOGO')
      const configPromise = Api.updateConfig(otherConfig)
      promises.push(configPromise)

      Promise.all(promises)
        .finally(() => {
          this.fetchData()
        })
    }
  },
  computed: {
    logoConfig() {
      const logo = this.config.find(item => item.key === 'LOGO')
      return logo || null
    },
    logoSrc() {
      const logo = this.logoConfig
      if (!logo) return null
      return logo.file ? logo.value : `${serverUrl}/static/system/${logo.value}`
    },
    pageSize() {
      return this.pagination.size
    }
  },
  components: {
    NewGenre
  }
}
</script>
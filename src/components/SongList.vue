<template lang="pug">
  .flex-col
    b-card-group
      b-card(no-body)
        b-list-group
          b-list-group-item.list-view-dense
            .song-title {{ criteriaType }}
          b-list-group-item.list-view-dense(v-for="song in songs" :key="songs.id")
            SongItem(:song="song")
        .fs18.p15(v-if="!songs.length")
          span Nothing to see here...
    template(v-if="totalElements > pagination.size && multipage")
      .p10
      b-pagination(
        v-model="pagination.page"
        :total-rows="totalElements"
        :per-page="pagination.size"
        @change="fetchDataDeferred"
      )
</template>

<script>
import SongItem from '@/components/SongItem'
import Api from '@/services/api'
import { instruments } from '@/data'

export default {
  props: {
    instrument: String,
    genresCriteria: String,
    feed: String,
    perPage: {
      type: Number,
      default: 10
    },
    multipage: {
      type: Boolean,
      default: false
    }
  },
  created() {
    if (this.perPage) {
      this.pagination.size = this.perPage
    }
    this.getGenres()
      .then(() => {
        this.getCriteria()
        this.getSongs()
      })
  },
  data: () => ({
    criteria: {},
    songs: [],
    genres: [],
    totalElements: 0,
    pagination: {
      page: 1,
      size: 10
    },
  }),
  computed: {
    criteriaType() {
      const { feed } = this
      const { instrument, genres } = this.criteria
      if (instrument) return `Instrument: ${instruments[instrument].title.toLowerCase()}`
      if (genres) {
        const genresMapped = genres
          .split(',')
          .map(item => item.toLowerCase())
          .join(', ')
          .trim()
        return `Genres: ${genresMapped}`
      }
      if (feed === 'bestsellers') return 'Best Sellers'
      if (feed === 'archive') return 'Archive'
      if (feed === 'latest') return 'Latest songs'
      return 'Song catalog'
    }
  },
  methods: {
    fetchDataDeferred() {
      this.$nextTick(this.getSongs)
    },
    getGenres() {
      return Api.getGenres()
        .then((genres) => {
          this.genres = genres
          return genres
        })
    },
    getCriteria() {
      const { q: searchTerm } = this.$route.query
      const { instrument, genresCriteria } = this
      const criteria = {}

      if (instruments[instrument]) {
        criteria.instrument = instrument
      } else if (genresCriteria) {
        criteria.genres = genresCriteria
      }
      if (searchTerm) criteria.q = searchTerm
      this.criteria = criteria
    },
    getSongs() {
      const { feed } = this
      const criteriaObj = {
        ...this.criteria,
        unpublished: false,
        feed
      }
      const { page, size } = this.pagination

      Api.getSongs({ page, size, order: 'DESC' }, criteriaObj)
        .then((resp) => {
          const { content, totalElements } = resp
          this.songs = content
          this.totalElements = totalElements
          this.$emit('songsLoaded', totalElements)
        })
    }
  },
  components: {
    SongItem
  }
}
</script>
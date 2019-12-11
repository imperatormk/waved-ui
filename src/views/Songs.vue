<template lang="pug">
  Layout
    b-card-group
      b-card(:header="criteriaType" no-body)
        b-list-group
          b-list-group-item(v-for="song in songs" :key="songs.id")
            SongItem(:song="song")
        .fs18.p15(v-if="!songs.length")
          span Nothing to see here...
</template>

<script>
import SongItem from '@/components/SongItem'
import Api from '@/services/api'
import { instruments } from '@/data'

export default {
  props: {
    instrument: String,
    genresCriteria: String
  },
  created() {
    this.getGenres()
      .then(() => {
        this.getCriteria()
        this.getSongs()
      })
  },
  data: () => ({
    criteria: {},
    songs: [],
    genres: []
  }),
  computed: {
    criteriaType() {
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
      return 'Latest songs'
    }
  },
  methods: {
    getGenres() {
      return Api.getGenres()
        .then((genres) => {
          this.genres = genres
          return genres
        })
    },
    getCriteria() {
      const { instrument, genresCriteria } = this
      const criteria = {}

      if (instruments[instrument]) {
        criteria.instrument = instrument
      } else if (genresCriteria) {
        criteria.genres = genresCriteria
      }
      this.criteria = criteria
    },
    getSongs() {
      const criteriaObj = {
        ...this.criteria,
        unpublished: false
      }

      Api.getSongs({ size: 10, order: 'DESC' }, criteriaObj)
        .then((songs) => {
          this.songs = songs.content
        })
    }
  },
  components: {
    SongItem
  }
}
</script>

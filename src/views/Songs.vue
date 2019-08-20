<template lang="pug">
  Layout
    b-card-group
      b-card(:header="criteriaType" no-body)
        b-list-group
          b-list-group-item(v-for="song in songs" :key="songs.id")
            SongItem(:song="song")
        .fs18.p15(v-if="!songs.length") Nothing to see here...
</template>

<script>
import SongItem from '@/components/SongItem'
import Api from '@/services/api'
import { instruments, genres } from '@/data'

export default {
  props: {
    instrument: String,
    genre: String
  },
  created() {
    this.getCriteria()
    this.getSongs()
  },
  data: () => ({
    criteria: {},
    songs: []
  }),
  computed: {
    criteriaType() {
      const { instrument, genre } = this.criteria
      if (instrument) return instruments[instrument].title
      if (genre) return genres[genre]
      return 'Latest songs'
    }
  },
  methods: {
    getCriteria() {
      const { instrument, genre } = this
      const criteria = {}

      if (instruments[instrument]) {
        criteria.instrument = instrument
      } else if (genres[genre]) {
        criteria.genre = genre
      }
      this.criteria = criteria
    },
    getSongs() {
      Api.getSongs({ size: 10, order: 'DESC' }, this.criteria)
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

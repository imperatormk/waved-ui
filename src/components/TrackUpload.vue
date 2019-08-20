<template lang="pug">
  .track-upload.font-black
    .flex-column.align-center
      label
        form(ref="fileform")
          input.hidden(type="file" ref="fileInput" @change="fileBrowsed")
          .flex-column.h100.justify-center
            .p10.fs25 Drag and drop
            .far.fa-copy.fs60
            .p10.fs25 Click to browse
            .file-listing(v-for="fileObj in files" :key="fileObj.metadata.id")
              .wrapper.p10(@click.prevent="")
                .flex-row.p5.align-center.space-around
                  span {{ fileObj.file.name }}
                .flex-row.p5.align-center.space-between
                  span Instrument
                  .p5
                  select(v-model="fileObj.metadata.instrument" required)
                    option(v-for="(instrument, idx) in Object.keys(instruments)" :key="instrument" :value="instrument") {{ instruments[instrument].title }}
                .flex-row.justify-end.p5
                  b-button(variant="danger"
                    @click.stop.prevent="removeFile(fileObj.metadata.id)"
                    color="error"
                    outline) Remove
</template>

<script>
import { instruments, genres } from '@/data'

export default {
  props: {
    filesProp: Array
  },
  data: () => ({
    dragAndDropCapable: false,
    files: [],
    instruments
  }),
  mounted() {
    if (this.filesProp) this.files = this.filesProp
    this.dragAndDropCapable = this.determineDragAndDropCapable()
    if (this.dragAndDropCapable) {
      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']
        .forEach((evt) => {
          this.$refs.fileform.addEventListener(evt, (e) => {
            e.preventDefault()
            e.stopPropagation()
          })
        })
      this.$refs.fileform.addEventListener('drop', (e) => {
        for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
          this.pushFile(e.dataTransfer.files[i])
        }
      })
    }
  },
  methods: {
    fileBrowsed(e) {
      const file = e.target.files[0]
      if (file) {
        this.pushFile(file)
        this.$emit('filesChanged', this.files)
      }
    },
    pushFile(file) {
      const metadata = {
        id: `track-${file.lastModified}`,
        instrument: null
      }

      this.files.push({
        metadata,
        file
      })
    },
    determineDragAndDropCapable() {
      const div = document.createElement('div')
      return (('draggable' in div)
              || ('ondragstart' in div && 'ondrop' in div))
              && 'FormData' in window
              && 'FileReader' in window
    },
    removeFile(key) {
      this.files.splice(key, 1)
      this.$emit('filesChanged', this.files)
    }
  }
}
</script>

<style lang="scss">
.track-upload {
  form {
    display: block;
    height: auto;
    min-height: 300px;
    border: 5px solid #bbbbbb;
    border-style: dashed;
    margin: auto;
    text-align: center;
    line-height: 1.6;
    padding: 40px;
  }
  div.file-listing {
    margin: auto;
    padding: 10px;
  }
  div.file-listing span {
    line-height: 1.5 !important;
  }
  div.wrapper {
    text-align: center;
    border: 2px solid #bbbbbb;
  }
  div.wrapper a {
    color: red;
    cursor: pointer;
  }
  a.submit-button {
    display: block;
    margin: auto;
    text-align: center;
    width: 200px;
    padding: 10px;
    text-transform: uppercase;
    background-color: #CCC;
    font-weight: bold;
    margin-top: 20px;
  }
}
</style>
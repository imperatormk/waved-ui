<template lang="pug">
  div(ref="container")
    .volumeBar(
      @mousedown="onMousedown"
      @mouseup="onMouseup"
      @mousemove="onMousemove"
      @mouseleave="dragging = false"
    )
      .volumebkg
      .volume(ref="volume")
      .volumeLabel.fs14(v-if="showLabel") {{ value }}%
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#007bff'
    },
    mute: Boolean,
    showLabel: Boolean
  },
  mounted() {
    this.updateVolume(null, this.value)
    this.setColor(this.color)
  },
  data: () => ({
    dragging: false,
    initialSet: true
  }),
  watch: {
    value(val) {
      this.updateVolume(null, val)
    },
    mute(val) {
      const opacity = val ? 0.6 : 1
      const { container } = this.$refs
      container.style.opacity = opacity
    }
  },
  methods: {
    onMousedown(e) {
      this.dragging = true
      this.updateVolume(e.pageX)
    },
    onMouseup(e) {
      if (this.dragging) {
        this.dragging = false
        this.updateVolume(e.pageX)
      }
    },
    onMousemove(e) {
      if (this.dragging) {
        this.updateVolume(e.pageX)
      }
    },
    updateVolume(x, vol) {
      const { volume } = this.$refs
      let percentage = 0

      if (vol) {
        percentage = vol < 1 ? vol * 100 : vol
      } else {
        const position = x - volume.getBoundingClientRect().left
        percentage = 100 * position / volume.offsetWidth
      }

      if (percentage > 100) {
        percentage = 100
      }
      if (percentage < 0) {
        percentage = 0
      }
      percentage = Math.round(percentage)

      volume.style.clip = `rect(0px, ${percentage}px, 50px, 0px)`

      if (this.initialSet) {
        this.initialSet = false
      } else {
        this.$emit('input', percentage)
      }
    },
    setColor(color) {
      const { volume } = this.$refs
      volume.style.borderColor = `transparent transparent ${color} transparent`
    }
  }
}
</script>

<style lang="scss">
.volume {
  position: absolute;
  clip: rect(0px,0px,0px,0px);
  width: 100px;
  height: 0;
  border-style: solid;
  border-width: 0 0 40px 100px;
  border-color: transparent transparent #007bff transparent;
  line-height: 0px;
}

.volumebkg {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 40px 100px;
  border-color: transparent transparent #dee2e6 transparent;
  line-height: 0px;
}

.volumeBar {
  display: block;
  height: 40px;
  position: relative;
  top: 0;
  left: 0;
  background-color: none;
  z-index: 100;
  width: 100px;
  cursor: pointer;
}

.volumeLabel {
  position: absolute;
  z-index: 1;
  bottom: 0;
  right: 3px;
}
</style>
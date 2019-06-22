<template lang="pug">
  b-navbar(toggleable="lg" variant="light")
    b-navbar-brand(:to="{ name: 'home' }") Waved
    b-navbar-toggle(target="nav-collapse")

    b-collapse(id="nav-collapse" is-nav)
      b-navbar-nav
        b-nav-item(href="#") Link A
        b-nav-item(href="#") Link B
</template>

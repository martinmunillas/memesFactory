<template>
  <header>
    <router-link :to="{ path: '/' }">
      <h1>Memes Factory</h1>
    </router-link>
  </header>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {},
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #111111;
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #eeeeee;
}

header {
  height: 120px;
  width: 100%;
  position: sticky;
  background-color: #222222;
  font-weight: 700;
  padding-left: 40px;
  display: flex;
  align-items: center;
}

header h1 {
  margin: 0;
}

a {
  color: white;
  text-decoration: none;
}
</style>

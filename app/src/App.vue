<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/profile">Profile</router-link>
  </nav>
  <router-view></router-view>
  <footer>
    <p>Created using <a href="https://vuejs.org/guide/introduction.html" target="_blank">Vue</a> + <a href="https://www.typescriptlang.org/docs/" target="_blank">Typescript</a> and generated using <a href="https://vitejs.dev/guide/" target="_blank">Vue</a></p>
  </footer>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

nav {
  padding: 20px;
}


footer {
  padding: 20px;
}
</style>

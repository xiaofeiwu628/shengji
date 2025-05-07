<template>
  <div>
    <router-view/>

  </div>
</template>

<style>

</style>
<script>


export default {
  name:"App",
  created(){
    // window.addEventListener('beforeunload', () => {
    //   localStorage.setItem('token', this.$store.getters.getToken)
    // })
    // this.$store.commit('changeToken',localStorage.getItem('token'));
  },

}
</script>
<style>

</style>

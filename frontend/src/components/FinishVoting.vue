<template>
  <div class="finish-page">
    <h2>Terima kasih telah memilih!</h2>
    <p>Akan kembali ke halaman login dalam {{ counter }} detik...</p>
    <button @click="logoutNow">Kembali Sekarang</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const counter = ref(15)
let timer

onMounted(() => {
  timer = setInterval(() => {
    counter.value--
    if (counter.value <= 0) {
      logoutNow()
    }
  }, 1000)
})

const logoutNow = () => {
  clearInterval(timer)
  sessionStorage.clear()
  router.push('/')
}
</script>

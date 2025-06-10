<template>
    <div class="preparation-page">
      <h2>Konfirmasi Data Diri</h2>
  
      <div class="user-info">
        <p><strong>ID:</strong> {{ userId }}</p>
        <p><strong>Nama:</strong> {{ userName }}</p>
        <p><strong>TPS:</strong> {{ tps }}</p>
      </div>
  
      <button @click="goToVoting">Mulai Memilih</button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import api from '@/api/api'

const router = useRouter()

const userId = ref(sessionStorage.getItem('id') || '')
const userName = ref(sessionStorage.getItem('nama') || '')
const tps = import.meta.env.VITE_TPS || ''

const userToken = sessionStorage.getItem('token')

const goToVoting = async () => {
  try {
    const response = await api.post(
      '/api/auth/beginvote',
      {},
      {
        headers: { Authorization: `Bearer ${userToken}` },
      }
    )
    if (response.status !== 200) {
      throw new Error('Gagal memulai pemungutan suara')
    }

    router.push('/voting')
  } catch (error) {
    alert('Gagal mengirim token')
  }
}
</script>
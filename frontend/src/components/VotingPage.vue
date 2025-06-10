<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Spinner from '@/components/Spinner.vue'
import api from '@/api/api.js'

const router = useRouter()

const candidates = ref([])

const userToken = sessionStorage.getItem('token')

onMounted(async () => {
  try {
    const response = await api.post(
      '/api/election/getCandidate',
      {},
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    )
    if (response.status !== 200) {
      throw new Error('Gagal memuat kandidat')
    }

    candidates.value = response.data.candidates || []
  } catch (error) {
    console.error('Gagal mengambil data kandidat:', error)
    alert('Gagal mengambil data kandidat, coba lagi!')
  }
})

const selectedCandidateId = ref(null)
const showConfirm = ref(false)
const isLoading = ref(false)

const confirmPick = (candidateNumber) => {
  selectedCandidateId.value = candidateNumber
  showConfirm.value = true
}

const cancelPick = () => {
  selectedCandidateId.value = null
  showConfirm.value = false
}

const submitVote = async () => {
  const token = sessionStorage.getItem('token')
  const tps = import.meta.env.VITE_TPS || ''
  isLoading.value = true

  try {
    const response = await api.post('/api/election/makeVoting', {
      candidate: selectedCandidateId.value,
      tps: tps
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.status !== 200) {
      throw new Error('Gagal mengirim suara')
    }

    showConfirm.value = false
    router.push('/finish')
  } catch (error) {
    console.error('Gagal mengirim suara:', error)
    alert('Gagal voting, coba lagi!')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="voting-page">
    <h2>Pilih Kandidat</h2>

    <div class="candidates">
      <div v-for="candidate in candidates" :key="candidate.candidateNumber" class="candidate-card">
        <h3>{{ candidate.name }}</h3>
        <img :src="candidate.photourl" alt="Foto Kandidat" class="candidate-image" />
        <p><strong>Partai:</strong> {{ candidate.party }}</p>
        <p>{{ candidate.description }}</p>
        <button @click="confirmPick(candidate.candidateNumber)">Pick</button>
      </div>
    </div>

    <div v-if="showConfirm" class="confirm-popup">
      <div class="confirm-content">
        <p>Apakah Anda yakin memilih kandidat ini?</p>
        <div class="buttons">
          <button @click="submitVote">Ya</button>
          <button @click="cancelPick">Tidak</button>
        </div>
      </div>
    </div>

    <Spinner v-if="isLoading" />
  </div>
</template>
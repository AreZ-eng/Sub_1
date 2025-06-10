<template>
  <div>
    <nav v-if="showNavbar">
      <span class="title">IMPLEMENTATION OF PAILLIER ALGORITHM: E-VOTING</span>
      <button @click="confirmLogout">Logout</button>
    </nav>

    <router-view />

    <!-- Konfirmasi Logout -->
    <div v-if="showLogoutConfirm" class="confirm-popup">
      <div class="confirm-content">
        <p>Apakah Anda yakin ingin logout?</p>
        <div class="buttons">
          <button @click="logout">Ya</button>
          <button @click="cancelLogout">Tidak</button>
        </div>
      </div>
    </div>

    <!-- Spinner Global -->
    <Spinner v-if="isLoading" />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Spinner from '@/components/Spinner.vue'

export default {
  components: { Spinner },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const isLoading = ref(false)
    const showLogoutConfirm = ref(false)

    const showNavbar = computed(() => {
      return route.name === 'Preparation' || route.name === 'Voting';
    });

    function confirmLogout() {
      showLogoutConfirm.value = true;
    }

    function cancelLogout() {
      showLogoutConfirm.value = false;
    }

    function logout() {
      sessionStorage.clear();
      showLogoutConfirm.value = false; // Tambahkan ini untuk menyembunyikan popup
      router.push('/');
    }

    // Opsional efek loading pindah halaman
    watch(() => route.fullPath, () => {
      isLoading.value = true; // Aktifkan spinner saat navigasi dimulai
      setTimeout(() => {
        isLoading.value = false; // Matikan spinner setelah navigasi selesai
      }, 500); // Sesuaikan durasi sesuai kebutuhan
    });

    return {
      isLoading,
      showNavbar,
      confirmLogout,
      cancelLogout,
      logout,
      showLogoutConfirm,
    };
  }
}
</script>

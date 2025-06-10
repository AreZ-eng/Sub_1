<!-- src/components/ConfirmVoting.vue -->
<template>
  <div class="confirm-popup">
    <div class="confirm-content">
      <p>Apakah kamu yakin memilih <strong>{{ candidate.name }}</strong>?</p>
      <div class="buttons">
        <button @click="$emit('confirm')">Yes</button>
        <button @click="$emit('cancel')">No</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  candidate: Object
})

defineEmits(['confirm', 'cancel'])
</script>

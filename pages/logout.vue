<template>
  <div />
</template>

<script setup>
definePageMeta({ layout: 'empty' })

const preview = useCookie('preview')
preview.value = null
await navigateTo('/coming-soon')
</script>

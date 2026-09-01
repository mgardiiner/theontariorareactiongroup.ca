<script setup>
// The Videos page became Media. Kept as a redirect so old links and any
// bookmarks or shared URLs still land somewhere useful.
definePageMeta({
  layout: 'default',
  middleware: [() => navigateTo('/media', { redirectCode: 301 })],
})
</script>

<template>
  <div />
</template>

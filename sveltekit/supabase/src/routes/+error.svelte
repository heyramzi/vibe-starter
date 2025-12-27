<script lang="ts">
  import { page } from '$app/state'
</script>

<main class="flex min-h-screen flex-col items-center justify-center p-24">
  <h1 class="text-6xl font-bold">{page.status}</h1>
  <p class="mt-4 text-muted-foreground">{page.error?.message}</p>
  <a href="/" class="mt-8 text-primary underline underline-offset-4 hover:text-primary/80">
    Go back home
  </a>
</main>

<script lang="ts">
	// =========================
	// IMPORTS
	// =========================
	import { navigating } from '$app/state'
	import { Toaster } from 'svelte-sonner'
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte'
	import { authClient } from '$lib/auth-client'
	import '../app.css'

	// =========================
	// PROPS
	// =========================
	let { children, data } = $props()

	// =========================
	// EFFECTS
	// =========================
	createSvelteAuthClient({
		authClient,
		getServerState: () => data.authState,
	})
</script>

<!-- =========================== -->
<!-- MARKUP -->
<!-- =========================== -->
{#if navigating.to}
	<div class="fixed top-0 left-0 z-50 h-1 w-full overflow-hidden bg-primary/20">
		<div class="h-full w-1/3 animate-pulse bg-primary" style="animation: loading 1s ease-in-out infinite;" />
	</div>
{/if}

<Toaster />
{@render children()}

<style>
	@keyframes loading {
		0% { transform: translateX(-100%); }
		50% { transform: translateX(200%); }
		100% { transform: translateX(-100%); }
	}
</style>

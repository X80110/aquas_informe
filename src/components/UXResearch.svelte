<script>
  import { themes } from '../config.js';
	import { getContext } from 'svelte';
	export let theme = getContext('theme');
	export let filled = true;
</script>

<nav style="border-bottom-color: {themes[theme]['muted']}; {filled ? 'background-color: ' +  themes[theme]['background'] + ';' : ''}">
  <div class="col-wide middle center">
		<p class='banner'> Col·labora a millorar l'experiència d'usuari, <a href="#">participa en la nostra recerca</a>  › </p>
        
  </div>
</nav>

<style>
	nav {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		position: relative;
		height: 46px;
		margin-bottom: -46px;
		border-bottom: 1px solid #777;
	}
	.banner {
		font-size: 70%;
		padding-bottom: 2em;
	}

</style>
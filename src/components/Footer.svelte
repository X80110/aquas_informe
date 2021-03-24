<script>
	import { themes } from '../.../../config.js';
	import { getContext } from 'svelte';

	export let theme = getContext('theme');
</script>

<footer style="color: {themes[theme]['text']}; background-color: {themes[theme]['pale']};">
	<div class="col-wide" data-analytics="footer">
		{#if theme == 'dark'}
		<img
			class="logo-img"
			src="./img/aquas.png"
			alt="Agència de Qualitat i Avaluació Sanitàries de Catalunya " />
		{:else}
		<img
			class="logo-img"
			src="./img/aquas.png"
			alt="Agència de Qualitat i Avaluació Sanitàries de Catalunya " />
		{/if}
		<ul>
			<li><a href="https://aquas.gencat.cat/ca/contacte/" class="list__link" stnyle="color: {themes[theme]['muted']}">Contacta'ns</a></li>
			<li><a href="http://web.gencat.cat/ca/menu-ajuda/ajuda/avis_legal/" class="list__link" style="color: {themes[theme]['muted']}">Privacitat i cookies</a></li>
		</ul>
		<hr style="border-top-color: {themes[theme]['muted']}" />
		<div class="license">
			Tot el contingut disponible al portal web Govern Obert de la Generalitat de Catalunya 
			<a
				href="http://governobert.gencat.cat/ca/dades_obertes/"
				class="external-link"
				target="_blank"
				rel="noopener"
				style="color: {themes[theme]['muted']}">AQuAS </a>
		</div>
	</div>
</footer>

<style>
	footer {
		padding-bottom: 72px;
		padding-top: 36px;
		font-size: 18px;
	}
	footer a {
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		text-decoration: underline;
		display: inline-block;
	}
	footer a:hover {
		text-decoration: none;
	}
	footer a:active {
		outline: 3px solid transparent;
		background-color: #fd0;
		-webkit-box-shadow: 0 -2px #fd0, 0 4px #222;
		box-shadow: 0 -2px #fd0, 0 4px #222;
		color: #222;
		text-decoration: none;
	}
	footer hr {
		margin-bottom: 27px;
		margin-top: 36px;
		border: none;
		border-top: 1px solid #777;
	}
	ul {
		padding: 0;
		margin: 0;
	}
	li {
		margin-right: 18px;
		display: inline-block;
	}
	.logo-img {
		margin-bottom: 27px;
	}
	.ogl-img {
		margin: 0 0.5rem 0.2rem 0;
		width: 59px;
		height: 24px;
		vertical-align: middle;
	}
	.license {
		vertical-align: top;
	}
</style>
<script>
	import { onMount } from 'svelte';
	import mapbox from 'mapbox-gl';
	import carto from '@carto/carto-vl';
	
	export let location = {
		bounds: [[-2.192621, 41.4049911], [2.86,  41.79]]
	};
	export let map;
	
	let container;
	let options;
	
	if (location.bounds) {
		options = { bounds: location.bounds };
	} else if (location.lon && location.lat) {
		options = {
			center: [location.lon, location.lat]
		}
		if (location.zoom) {
			options.zoom = location.zoom;
		}
	};


	const REQUEST_GET_MAX_URL_LENGTH = 2048;
	
	
	const layer = new carto.Layer('layer', source, viz);



	const source = new carto.source.SQL(`
				SELECT 
				g.the_geom_webmercator,
				g.cartodb_id,
				g.the_geom,
				t.aga,
				t._any,
				t.tipus_centre,
				sum(t.poblacio) as poblacio, 
				

				sum(t.pacients) as pacients,
				sum(t.visites) as visites, 
				(pacients / t.poblacio *1000) as pacients_mil_hab,
				(visites / poblacio *1000) as visites_mil_hab,
				pacients / visites as ratio_pacients_visites
				
			FROM public.tot as t left join public.geom_aga as g on  id_aga = codiaga

			where 
				_any = 2019 
				and tipus_centre = 'Adults'
			
				

			group by 
				g.the_geom_webmercator,
				g.cartodb_id,
				t.tipus_centre,
				t._any,
				t.aga,
				t.tipus_centre,
				t.poblacio,
				t.pacients,
				t.visites`);
				
	const viz = new carto.Viz(`
			color: ramp([$visites], (#fcde9c, #faa476, #f0746e, #e34f6f, #dc3977, #b9257a, #7c1d6f), quantiles
			strokeColor: rgba(0,0,0,0.4)
			strokeWidth: 1
			`);

	


      
	  carto.setDefaultAuth({
    		username: 'x80110',
    		apiKey: 'default_public'
		});

	onMount(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/mapbox-gl@1.13.0/dist/mapbox-gl.css';

		link.onload = () => {
			map = new mapbox.Map({
				container,
				style: style,
				interactive: false,
				...options
			});
			map.scrollZoom.disable();
			layer.addTo(map);

		};

		document.head.appendChild(link);

		return () => {
			map.remove();
			link.parentNode.removeChild(link);
		};
	});
</script>

<style>
	div {
		width: 100%;
		height: 100%;
	}
</style>

<div bind:this={container}>
	{#if map}
		<slot></slot>
	{/if}
</div>
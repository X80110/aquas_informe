<script>
	import { setContext, onMount } from "svelte";
	import * as d3 from 'd3';
	import { MultiSelect } from "carbon-components-svelte";
	import { getData, setColors, rollUnroll, reducer } from "./utils.js";
	import { themes } from './config.js';
	import locale from '@reuters-graphics/d3-locale';
	

	import UXResearch from "./components/UXBanner.svelte"

	import Header from "./components/Header.svelte";
	import Multiline from "./charts/Multiline.svelte";
	import Section from "./components/Section.svelte";
	import Footer from "./components/Footer.svelte";
	import Filler from "./components/Filler.svelte";
	import Scroller from "./components/Filler.svelte";
	import Media from "./components/Media.svelte";
	import Divider from "./components/Divider.svelte";
	
	const loc = new locale('es');
	const format = {
		x: loc.formatTime('%b %e'),
        y: loc.format(',.1d'),
    }
	var loaded = false;
	// STYLE CONFIG
	// Set theme globally (options are 'light' or 'dark')
	let theme = "light";
	setContext("theme", theme);
	setColors(themes, theme);

	// SCROLLYTELLING CONFIG
	// Config
	const threshold = 0.65;
	// State
	let index = [];
	let indexPrev = [];
	onMount(() => {
		indexPrev = [...index];
	});

	// DATA 
	const rawdata = "./data/territoripoblacio.csv";
	let rolledData;
	let multiline;
	let variable = "Visites";
	let v_absolut = ["PacientsN", "VisitesN"];
	let ratio = ["Ratio"];
	//let scale = [{ id: 'RS', text: 'Regió Sanitaria' }, { id: 'AGA', text: 'Àrea de gestió assistencial' }];
	let scale = ["AGA"]

	onMount(async () => {
        const data = await getData(rawdata);
        const mappedData = data.map(d => {
            return {
                Any:+d.Any,
					RS: d.id_rs,
					AGA: d.id_aga,
					Sexe: +d.sexe,
					Edat: d.edat,
					Baix: d.Nse_baix,
					Nou: d.Nou_pacient,
					Pcsm: d.pcsm,
					Pccsm: d.pccsm,
					Pacients: +d.pacients,
					Visites: +d.visites,
					Poblacio: +d.Poblacio,
					PacientsN : 100*(+d.pacients)/(+d.Poblacio),
					VisitesN : 100*(+d.visites)/(+d.Poblacio),
					Ratio: +d.visites/+d.pacients,
            }
        });
		
		rolledData = rollUnroll(mappedData, v => reducer(variable) (v, d => d[variable]), [ scale,"Any"], variable)
		let groupedData = d3.groups(rolledData,  d => d[scale]);
		multiline = [2016,2017, 2018, 2019].map(year => {return {
					time: new Date(`01/01/${year}`),
					val: groupedData.flat()[1].filter(d => d.Any == year).map,
					key: groupedData.flat()[1].filter(d => d.Any == year).map((d)=>d).map(d=>d.RS)
				}
				});console.log(multiline);
    }); 
	

	

</script>

<UXResearch	/>



<Header bgimage="./img/bg-dark.jpg" bgfixed={true} theme="dark">
	<h1 class="text-shadow">Àmbit de salut mental i addiccions </h1>
	<br>
	<p class="inset-medium text-big text-shadow">
		Observatori del sistema de salut de Catalunya
	</p>
	<p class="inset-medium text-big text-shadow">
		Central de resultats
	</p>
	<div class="text-shadow" style="margin-top: 48px;">
		Desplaça't per veure l'informe<br />
		<img src="./img/scroll-down-white.svg" class="svg-icon bounce" alt="down arrow"/>
	</div>
</Header>





<Filler theme="dark">
	<p class="text-big">
		Informe 2020
	</p>
</Filler>


<Section>
	<h2>Salut mental comunitària d’adults: centres de salut mental d’adults (CSMA)</h2>
	<h3>La meitat dels pacients atesos pels CSMA són pacients crònics (51,1%) i un de cada tres pacient crònic complex (32,3%)</h3>
	<p>
		Els 76 centres de salut mental d’adults (CSMA) que donen servei a la xarxa pública de salut de Catalunya tenen assignada una població de 5.969.735 persones de 18 anys o més (51,3% dones i 48,7% homes), el que suposa una mitjana d’un CSMA per cada 78.550 persones. 
	</p>
	<p>
		L’import de la contractació del conjunt de CSMA va ser de 51.363.489 €, que suposa una mitjana de 675.835€ per centre i de gairebé 304,5 € per persona atesa. El pressupost ha crescut un 9,3% respecte el 2016. 
	</p>
	<blockquote class="text-indent">
		"Una de cada 7 persones ateses per un CSMA
		té un nivell socioeconòmic molt baix."
	</blockquote>

	
	<p>
		L’any 2017, un total de 168.688 persones van ésser ateses en algun CSMA (59,6% dones i 40,4% homes), concretament el 2,7% de la població adulta (3,1% de les dones i 2,2% dels homes).
	</p>

</Section>

<div class="embed">
	<iframe width="60%" height="864" frameborder="0"
src="https://observablehq.com/embed/@x80110/aquas-plot?cells=viewof+scale%2Cviewof+variable%2Cviewof+sex%2Cviewof+edat%2Cviewof+cronic%2Cviewof+nou%2Cviewof+baix%2Cchart"></iframe>
</div>



{#if loaded}
<Multiline 
	data={multiline}
	title='Title' desc='Description'
	key={{x: 'year', y: ['val']}}
	format={{x: d3.utcFormat("%y"), y: v => v}}
	color={['#fc0', '#036', '#f0c']}
	layout='col'
/>
{/if}

<Section>
	<div class="filtres">
	<!-- <MultiSelect
		type="inline"
		titleText="Filtra les dades"
		label="Selecciona la regió..."
		items={scale}
	/> -->
	</div>
	
	
	
		
	</Section>
	
	<Divider />
	
	<Section>
		<h2>Gràfic dinàmic</h2>
		<p>
			La visualització a continuació recull dades territorials de visites realitzades als Centres de Salut Mental de Catalunya. 
			Desplaça per veure'n més.
		</p>
	</Section>


<div class="embed">
	<iframe width="70%" height="1184" frameborder="0" src="https://observablehq.com/embed/@oriolvidal/beeswarm-centres?cells=chart"></iframe>
</div>
<Divider />

<Section>
	<h2>La depressió és el diagnòstic més freqüent i l’esquizofrènia és el que genera més visites</h2>
	<p>
		En una anàlisi en detall dels diagnòstics, s’observa que en el 2017 la
		depressió va continuar essent el més freqüent, present en una ter-
		cera part de la població atesa (39,4% de les dones i 23,7% dels ho-
		mes). 
	</p>	
	<p>
		A l’altre extrem, la demència estava present únicament en un
		1,1% dels pacients (1,0% en dones i 1,2% en homes). El diagnòstic
		que va suposar un major nombre de visites és l’esquizofrènia, amb
		una mitjana de 13,4 visites a l’any (12,7 en dones i 13,8 en homes).
		A continuació, si bé amb un volum menor, trobem les altres psicosis
		(10,3) i el trastorn bipolar (9,5).
	</p>
</Section>

<Media col="full" height={600} caption="L'explicació del contingut previ">
	<div class="media">Gràfic o mèdia en ample complert</div>
</Media>

<Divider />

<Section>
	<h2>L'estat dels Centres de Salut Mental a Catalunya </h2>
	<p class="mb">
		
		Els serveis d’atenció ambulatòria d’adults compten amb 76 centres
		de salut mental d’adults (CSMA) que durant l’any 2017 van atendre
		a 168.688 persones. 
	</p>
</Section>


<Divider />

<Section>
	<h2>Consulta els informes anuals complerts de la Central de Resultats d'AQuAS</h2>
	<p>
		A continuació trobaras els informes dels darrers anys elaborats per l'Observatori del sistema de salut de Catalunya. 
	</p>
</Section>

<Media
col="wide"
grid="narrow"
caption="Fes click per descarregar.">
<div class="media">2020</div>
<div class="media">2019</div>
<div class="media">2018</div>
<div class="media">2017</div>
</Media>

<Section>
	<p>
		Descarrega la totalitat de les dades al portal de Transparència i Dades Obertes de la Generalitat. 
	</p>
</Section>

<Footer />

<style>
	.svg-icon {
		width: 48px;
		height: 48px;
	}
	.bounce {
		animation-duration: 2s;
		animation-iteration-count: infinite;
		animation-name: bounce;
		animation-timing-function: ease;
	}
/* 	@keyframes bounce {
		0%   { transform: translateY(10px); }
		30%  { transform: translateY(-10px); }
		50%  { transform: translateY(10px); }
		100% { transform: translateY(10px); }
	}
	.label-block {
		display: inline-block;
		text-align: right;
		width: 80px;
	}
	select {
		width: 210px;
	}
	.chart {
		margin-top: 45px;
		height: 100vh;
		width: calc(100% - 5px);
	} */
	/* The properties below make the media DIVs grey, for visual purposes in demo */
	.media {
	  background-color: #f0f0f0;
	  display: -webkit-box;
	  display: -ms-flexbox;
	  display: flex;
	  -webkit-box-orient: vertical;
	  	-webkit-box-direction: normal;
	      -ms-flex-flow: column;
	          flex-flow: column;
	  -webkit-box-pack: center;
	      -ms-flex-pack: center;
	          justify-content: center;
	  text-align: center;
	  color: #aaa;
  	}
	
	.filtres {
		font-size:70%;
	}

	.embed {
		margin-top:2em;
		display: flex;
        align-items: center;
		justify-content: center;
	}

</style>
	<!-- 
	<Scroller {threshold} bind:index={indqex[0]} splitscreen={true}>
		<div slot="background">
			<figure>
				<div class="col-wide height-full middle">
					{#if data && xKey && yKey}
					<div class="chart">
						<ScatterChart diameter={6} {data} {xKey} {yKey} {catKey} {colors} {categories} {selected} />
					</div>
					{/if}
				</div>
			</figure>
		</div>
	
		<div slot="foreground">
			<section>
				<div class="col-medium">
					<p>Una de cada set <span class="em em-muted">persones
						ateses</span> per un CSMA té un <span class="em em-muted"> nivell socioeconòmic</span>
						<span class="em em-muted">molt baix</span>.</p>
				</div>
			</section>
			<section>
				<div class="col-medium">
					<p>La mitjana de <span class="em em-muted">visites per pacient</span> decreix des del 2015.</p>
				</div>
			</section>
			<section>
				<div class="col-medium">
					<p>El 88% dels pacients atesos en el 2016 amb <span class="em em-muted">trastorn mental greu</span> van continuar atenent-se en el 2017</p>
				</div>
			</section>
			<section>
				<div class="col-medium">
					<h3>Explora les dades</h3>
					{#if data}
					<nobr>
						<span class="label-block">X:</span>
						<select bind:value={xKey}>
							{#each Object.keys(datakeys) as key}
								<option value={key}>{datakeys[key]}</option>
							{/each}
						</select>
					</nobr>
					<nobr>
						<span class="label-block">Y:</span>
						<select bind:value={yKey}>
							{#each Object.keys(datakeys) as key}
								<option value={key}>{datakeys[key]}</option>
							{/each}
						</select>
					</nobr>
					{#if places}
					<nobr>
							<span class="label-block">Zona</span>
	
							<select bind:value={selected}>
								<option value={null}>All</option>
								{#each places as place}
									<option value={{ value: place.code, col: 'aga' }}>
										{place.name}
									</option>
								{/each}
							</select>
						</nobr>
					{/if}
					{/if}
				</div>
			</section>
		</div>
	</Scroller>
	 -->
<!-- 	 <Scroller {threshold} bind:index={index[1]}>
		<div slot="background">
			<figure>
				<div class="col-full height-full">
					<Map style={mapstyle} bind:map={map} />
				</div>
			</figure>
		</div>
		
		<div slot="foreground">
			<section>
				<div class="col-medium">
					<p>Les regions de Catalunya amb més activitat als centres de salut mental són<span class="em em-muted">Barcelona i Tarragona</span>.</p>
				</div>
			</section>
			<section>
				<div class="col-medium">
					<p>Al <span class="em em-muted">Bages</span>, en canvi,  s'ha reduit molt el nombre de visites, fins un 23%.</p>
				</div>
			</section>
			<section>
				<div class="col-medium">
					<p>Mentre que les mesures que es va prendre <span class="em em-muted">, al CSM Infantil i Juvenil de Lleida</span> han aconseguit que un 53% més de pacients crònics que l'any anterior segueixin sent atesos enguany.</p>
				</div>
			</section>
		</div>
	</Scroller>
 -->	
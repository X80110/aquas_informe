<script>
	import { onMount } from 'svelte';
	import { setContext } from "svelte";
	import { getData, setColors } from "./utils.js";
	import { themes } from './config.js';
	import UXResearch from "./components/UXResearch.svelte"
	import Header from "./components/Header.svelte";
	import Section from "./components/Section.svelte";
	import Footer from "./components/Footer.svelte";
	import Filler from "./components/Filler.svelte";
	import Media from "./components/Media.svelte"
	import Divider from "./components/Divider.svelte";
	import Mapes from "./components/Tabs.svelte"
	/* import Map from "./components/Map.svelte";
	import Scroller from "./components/Scroller.svelte"; */
	import { Tabs, Tab, TabContent, Button } from "carbon-components-svelte";


	
	

	// STYLE CONFIG
	// Set theme globally (options are 'light' or 'dark')
	let theme = "light";
	setContext("theme", theme);
	setColors(themes, theme);


	// SCROLLYTELLING CONFIG
	// Config
	/* const threshold = 0.65;
	// State
	let index = [];
	let indexPrev = [];
	onMount(() => {
		indexPrev = [...index];
	});


	// MAP CODE
	// Config
	const mapstyle = 'https://geoserveis.icgc.cat/contextmaps/positron.json';
	const mapbounds = {
		barcelona: [[2.174689, 41.403806], [1.863, 55.872]],
		bages: [[1.51, 41.99], [1.53, 43.1]],
		lleida: [[0.682, 41.5448], [0.9170, 42.8]]
	};
	// State
	let map = null;
	// Actions for MAP scroller
	const mapActions = [
		() => { map.fitBounds(mapbounds.barcelona) },
		() => { map.fitBounds(mapbounds.bages) },
		() => { map.fitBounds(mapbounds.lleida) }
	]; */
	
	// Reactive code to trigger MAP actions
/* 	$: if (map && index[1] != indexPrev[1]) {
		if (mapActions[+index[1]]) {
			mapActions[+index[1]]();
		}
		indexPrev[1] = index[1];
	};//console.log(data); */


/* 
	// DATA 
	const rawdata = "./data/data.csv";
	let data;
	getData(rawdata)
		.then((result) => (data = result))
		.then(() => {

			data.map(d => {
				return {
					any: d.any,
					id_rs: d.id_rs,
					rs: d.rs,
					id_aga: d.id_aga,
					aga: d.aga,
					sexe: d.sexe,
					edat: d.grup_edat,
					nou_pacient: d.nou_pacient,
					nse_baix: d.nse_baix,
					pcsm: d.pcsm,
					pccsm: d.pccsm,
					pacients: +d.pacients,
					visites: +d.visites
				};
				})
			})
	 */
	// Force circles 

</script>

<UXResearch	/>


<Header bgimage="./img/bg-dark.jpg" bgfixed={true} theme="light">
	<h1 >Salut mental i adiccions</h1>
	<br>
	<p class="inset-medium text-big">
		Observatori del sistema de salut de Catalunya
	</p>
	<p class="inset-medium text-big ">
		Central de resultats
	</p>
	<div class="" style="margin-top: 6em;">
		Desplaça't per veure l'informe<br />
		<img src="./img/scroll-down-black.svg" class="svg-icon bounce" alt="down arrow"/>
	</div>
</Header>




<Section>
	<p class="text-big">
		Informe 2020
	</p>
	<h2>La xarxa d'atenció a la salut mental de Catalunya</h2>
	<h3>La meitat dels pacients atesos pels CSMA són pacients crònics (51,1%) i un de cada tres pacient crònic complex (32,3%)</h3>
	
	<p>
		La salut mental i les addiccions conformen un dels serveis del sistema d’atenció sanitària pública de Catalunya. El trastorns mentals tenen un impacte important en la qualitat de vida de les persones i afecten tots els àmbits de relació interpersonal (familiar, laboral i social), motiu pel qual demanen una atenció concreta.
	</p>
	<p>
		A Catalunya, els centres d’atenció primària (CAP) són la peça clau per a la detecció precoç i el seguiment dels trastorns mentals lleus. Un equip de professionals especialistes en salut mental dona suport als equips d’atenció primària i s’integra als centres d’atenció primària. Quan la patologia és més complexa, l’assistència es presta en serveis especialitzats, fora dels CAP.
	</p>

	<blockquote class="text-indent">
		Als CAP, equips multidisciplinaris integrats per psiquiatres, psicòlegs, treballadors socials i personal d’infermeria ofereixen assistència especialitzada en règim ambulatori (sense ingrés).
	</blockquote>
		

	<p>
		La xarxa de centres d’atenció a la salut mental es divideix en dos tipus, en funció de l’edat del pacient: Centres de salut mental d’adults (CSMA), per a majors de 18 anys, i Centres de salut mental infantil juvenil (CSMIJ), per a infants i adolescents fins a la majoria d’edat.
	</p>
	<p>	
		Per millorar la qualitat del sistema de salut de Catalunya, el Departament de Salut recull les dades assistencials. En aquest apartat hi trobareu representades les xifres referents a l’atenció prestada als centres de salut mental entre 2016 i 2019 mitjançant diversos gràfics.
	</p>


	
</Section>

<Section>
<h2>Pacients per Centres de Salut Mental de Catalunya</h2>
<div class="embed">
	<iframe width="70%" height="1184" frameborder="0" src="https://observablehq.com/embed/@oriolvidal/beeswarm-centres?cells=chart"></iframe>
</div>
</Section>



<Divider />


<Section>
	<h2>Les dades</h2>
	<p>
	Actualment, amb les últimes dades disponibles (2019), la xarxa de centres d’atenció a la salut mental atén 236.366 persones, el 47% homes i el 53% dones (i el 13%, menors d’edat). Entre els quatre anys analitzats, 2017 és el que acumula més pacients, concretament 237.863.
	</p>
	<p>
	Durant aquests quatre anys, els homes que han fet més ús dels centres de salut mental han estat els infants d’entre 6 i 12 anys (86.762 en total). A la banda contrària, els menors de sis anys han estat els que menys els han visitat (4.538 en conjunt).
</p>
<p>
	Pel que fa a les dones, el grup d’edat amb més pacients és el de 45-54 anys (95.030), mentre que les menors de sis anys també és el que acumula menys persones ateses (1.726).
</p>
<p>
Els centres de salut mental que han atès més persones varia any rere any, tant pel que fa als adults com als menors d’edat. Així, es passa del CSM Adults Tortosa el 2016 (64 pacients per cada mil habitants per àrea de gestió assistencial) al mateix recurs el 2019 (60,6 pacients/mil habitants) entre els adults. I del CSMIJ Gironès-Pla de l'Estany de 2016 (41,5 pacients/mil habitants) al CSM Infantil i Juvenil Alta Ribagorça el 2019 (78 pacients/mil habitants).
</p>
<p>
A l’extrem oposat, els centres que han atès menys persones són el CSM Adults Segarra, tant al 2016 (1,76 pacients/mil habitants) com al 2019 (1,20 pacients/mil habitants) per als majors d’edat. Mentre que a la xarxa d’infants i adolescents han estat el CSMIJ Badalona 1 Est Joan Obiols el 2016 (10,5 pacients/mil habitants) i el CSM Infantil i Juvenil La Mina el 2019 (3,5 pacients/mil habitants).
</p>

</Section>

<Section>
<h2>Exploreu les dades</h2>
<div class="embed">
	<iframe width="70%" height="864" frameborder="0"
	src="https://observablehq.com/embed/9e82aa763befec21?cells=viewof+scale%2Cviewof+variable%2Cviewof+sex%2Cviewof+edat%2Cviewof+cronic%2Cviewof+nou%2Cviewof+baix%2Cchart"></iframe>
</div>
</Section>
<br>
<Section>
<h2>Exploreu les dades</h2>
<br>
	<Mapes />
</Section>
<Divider />

<Section>
	<h2>Consulta els informes anuals complerts de la Central de Resultats d'AQuAS</h2>
	<p>
		A continuació trobaras els informes dels darrers anys elaborats per l'Observatori del sistema de salut de Catalunya. 
	</p>
</Section>
<!-- 
<Media
col="wide"
grid="narrow"
caption="Fes click per descarregar.">
<div class="media">2020</div>
<div class="media">2019</div>
<div class="media">2018</div>
<div class="media">2017</div>
</Media>
 -->
<Section>
	<p>
		Descarrega la totalitat de les dades al portal de Transparència i Dades Obertes de la Generalitat. 
	</p>
</Section>

<Footer />

<style>
	.embed {
		margin-top:2em;
		display: flex;
        align-items: center;
		justify-content: center;
	}
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
</style>
	<!-- 
	<Scroller {threshold} bind:index={index[0]} splitscreen={true}>
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
	 <!-- <Scroller {threshold} bind:index={index[1]}>
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
	</Scroller> -->
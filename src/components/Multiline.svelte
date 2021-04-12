<script type="module">
import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/@nuriaaltimir/aquas-plot-for-mvtec.js?v=3";
new Runtime().module(define, name => {
  if (name === "viewof scale") return new Inspector(document.querySelector("#observablehq-viewof-scale-f420384d"));
  if (name === "viewof variable") return new Inspector(document.querySelector("#observablehq-viewof-variable-f420384d"));
  if (name === "viewof sex") return new Inspector(document.querySelector("#observablehq-viewof-sex-f420384d"));
  if (name === "viewof edat") return new Inspector(document.querySelector("#observablehq-viewof-edat-f420384d"));
  if (name === "viewof cronic") return new Inspector(document.querySelector("#observablehq-viewof-cronic-f420384d"));
  if (name === "viewof nou") return new Inspector(document.querySelector("#observablehq-viewof-nou-f420384d"));
  if (name === "viewof baix") return new Inspector(document.querySelector("#observablehq-viewof-baix-f420384d"));
  if (name === "chart") return new Inspector(document.querySelector("#observablehq-chart-f420384d"));
  return ["DataUnrolled","DataGrouped","DataRolled","DataGrouped2","highlight","DataRolled2","datasum","DataFiltered2","filters","simplefilters","DataFiltered"].includes(name);
});
</script>
<div>
    <div id="observablehq-viewof-scale-f420384d"></div>
    <div id="observablehq-viewof-variable-f420384d"></div>
    <div id="observablehq-viewof-sex-f420384d"></div>
    <div id="observablehq-viewof-edat-f420384d"></div>
    <div id="observablehq-viewof-cronic-f420384d"></div>
    <div id="observablehq-viewof-nou-f420384d"></div>
    <div id="observablehq-viewof-baix-f420384d"></div>
    <div id="observablehq-chart-f420384d"></div>
</div>
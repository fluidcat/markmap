<script>
	import {
		afterUpdate
	} from 'svelte';
	export let source;
	import {
		Transformer
	} from 'markmap-lib';
	import * as markmap from 'markmap-view';
	import {
		mindmapSaveAsSvg,
		mindmapSaveAsHtml,
		wValue,
		hValue,
		markdownSource
	} from './stores.js';
	export let maxWidth;
	export let style;
	export let title;
	//let globalStyle;

	//$: globalStyle = style

	let mindmap;
	let w;
	let h;
	let widthBlockquote;
	let marginLeftBlockquote='';
	let nodeTitle;
	let description;
	$: description = $markdownSource;
	//let nodeDesc;

	$: if (maxWidth<250) {
		widthBlockquote = maxWidth;
		marginLeftBlockquote='margin-left:-10px;';
	} else {
		widthBlockquote= 250;
		marginLeftBlockquote='';
	}
	let mindmapRoot;

	$: wValue.update(n => w)
	$: hValue.update(n => h)

	afterUpdate(() => {
		const transformer = new Transformer();

		const {
			root,
			features
		} = transformer.transform(source);
		const {
			styles,
			scripts
		} = transformer.getUsedAssets(features);
		const {
			Markmap,
			loadCSS,
			loadJS
		} = markmap;

		if (styles) loadCSS(styles);
		if (scripts) loadJS(scripts, {
			getMarkmap: () => markmap
		});
		
		const options = {
			duration: 0,
			style: id => 'div{padding-bottom:0.12em!important} a {text-decoration:none} foreignObject {overflow:visible} strong{color:#333; font-size:0.98em} .hide, .hide *{color:transparent!important} .hide {background-color:#FFFFEC} .hide img {opacity:0} img[alt=h-25]{height:25px} img[alt=h-50]{height:50px} img[alt=h-75]{height:75px} img[alt=h-100]{height:100px} img[alt=h-125]{height:125px} img[alt=h-150]{height:150px} img[alt=h-175]{height:175px} img[alt=h-200]{height:200px} blockquote {width:'+widthBlockquote+'px!important; white-space: normal; text-align:justify; font-size:0.8em; line-height:1em; border:1px solid #aaa; padding:10px; border-radius:4px;'+marginLeftBlockquote+'} aside{font-size: 0.8em; display: inline-block!important; font-weight:normal;vertical-align: top} cite {font-style:inherit; font-family:serif; font-size:0.97em}'+ style,
			maxWidth: maxWidth,
			// Quelques classes supplémentaires :
			// .hide pour masquer (afficher avec un clic)
			spacingVertical: 8, // 5			
			//spacingHorizontal: 100,
			paddingX: 15, // 8
			autoFit: true,
		}
		mindmap.innerHTML = "";
		mindmapRoot = root;
		nodeTitle = document.createElement("title")
		nodeTitle.innerHTML=title;
		mindmap.appendChild(nodeTitle);
		//nodeDesc = document.createElement("desc")
		//nodeDesc.innerHTML=description;
		//mindmap.appendChild(nodeDesc);
		Markmap.create('#markmap', options, root);
		
	})


	function createSVG(mm) {
		mm = mm.replace(/<br>/g, '<br/>')
		mm = mm.replace(/\n/g, ' ')
		mm = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg id="markmap" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="' + mindmap.className['baseVal'] + '" style="width:100%; height:100%;" viewBox="0 0 ' + w + ' ' + h + '">'+'<title>'+title+'</title>'+'<desc>'+description.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&lt;')+'</desc>'+ mm.replace(/<title>.*<\/title>/,'') + '</svg>'
		return mm;
	}

	function mindMapSaveAsSvgCreateFile() {
		const file = new File([createSVG(mindmap.innerHTML)], "mindmap.svg", {
			type: "text/plain;charset=utf-8"
		});
		saveAs(file);
	}

	function mindMapSaveAsHtmlCreateFile() {
		const root = JSON.stringify(mindmapRoot);
		let templateHtml ='<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>'+title+'</title><style>*{margin:0; padding:0}#markmap{display:block; width:100vw; height:100vh}</style></head><body><svg id="markmap"><title>'+title+'</title><desc>'+description.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&lt;')+'</desc></svg><script src="https://cdn.jsdelivr.net/npm/d3"><\/script><script src="https://cdn.jsdelivr.net/npm/markmap-view"><\/script><script>const root='+root+'; const{Markmap, loadCSS, loadJS}=window.markmap; const maxWidth='+maxWidth+'; const styles="div{padding-bottom:0.12em!important} a {text-decoration:none} foreignObject {overflow:visible} strong{color:#333;  font-size:0.98em} .hide, .hide *{color:transparent!important} .hide {background-color:#FFFFEC} .hide img {opacity:0} img[alt=h-25]{height:25px} img[alt=h-50]{height:50px} img[alt=h-75]{height:75px} img[alt=h-100]{height:100px} img[alt=h-125]{height:125px} img[alt=h-150]{height:150px} img[alt=h-175]{height:175px} img[alt=h-200]{height:200px} blockquote {width:'+widthBlockquote+'px!important;  white-space: normal;  text-align:justify;  font-size:0.8em;  line-height:1em;  border:1px solid #aaa;  padding:10px;  border-radius:4px; '+marginLeftBlockquote+'} aside{font-size: 0.8em;  display: inline-block!important;  font-weight:normal; vertical-align: top} cite {font-style:inherit;  font-family:serif;  font-size:0.97em}'+style.replaceAll('"','\\"')+'"; const options={duration:0, style:id=>styles, maxWidth:maxWidth, spacingVertical:8, paddingX:15, autoFit:true}; Markmap.create("#markmap", options, root); <\/script></body></html>';
		const file = new File([templateHtml], "mindmap.html", {
			type: "text/plain;charset=utf-8"
		});
		saveAs(file);
	}

	$: if ($mindmapSaveAsSvg) {
		mindMapSaveAsSvgCreateFile();
		mindmapSaveAsSvg.update(n => false)
	}

	$: if ($mindmapSaveAsHtml) {
		mindMapSaveAsHtmlCreateFile();
		mindmapSaveAsHtml.update(n => false)
	}

</script>

<div bind:clientWidth={w} bind:clientHeight={h} style="width:98vw; height:98vh">
	<svg id="markmap" bind:this={mindmap} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		style="width:100%; height:100%">
	</svg>
</div>
<style>

	svg {
		z-index: 0;
		position: absolute;
		top: 0;
	}

	@media print {
		:global(nav) {
			display: none;
		}

		:global(main) {
			width: 31.7cm;
			height: 20cm;
		}

		:global(main svg) {
			overflow: visible;
			zoom: 55% !important;
		}

	}

</style>
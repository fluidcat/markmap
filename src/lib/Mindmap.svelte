<script>
	import {
		afterUpdate,
		onMount
	} from 'svelte';
	export let source;
	import {
		Transformer
	} from 'markmap-lib';
	import * as markmap from 'markmap-view';
	import {deriveOptions} from 'markmap-view';
	import {
		mindmapSaveAsSvg,
		mindmapSaveAsPng,
		mindmapSaveAsHtml,
		mindmapShareByGithub,
		wValue,
		hValue,
		markdownSource,
		show
	} from './stores.js';
	import * as svg2png from './svg2png.js';
	import * as github from "./github.js";
	import { Base64 } from 'js-base64';
	import { spring } from "svelte/motion";
	import copy from 'copy-to-clipboard';

	export let maxWidth;
	export let style;
	export let title;
	export let colorFreezeLevel;
	export let initialExpandLevel;
	export let openLinksInNewTab;

	let mindmap;
	let fname;
	let w;
	let h;
	let widthBlockquote;
	let marginLeftBlockquote='';
	let nodeTitle;
	let description;
	$: description = $markdownSource;

	let automaticResize = true;
	let mm;

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
			maxWidth: maxWidth,
			spacingVertical: 15,
			paddingX: 20,
			autoFit: false,
			initialExpandLevel: initialExpandLevel,
		}
		const optionsJSON = deriveOptions({
			color: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#8c564b", "#e377c2", "#17becf", "#bcbd22"],
			colorFreezeLevel: colorFreezeLevel,
		})
		const optionsFull = colorFreezeLevel > 0 ? {...options, ...optionsJSON} : options
		mindmap.innerHTML = "";
		mindmapRoot = root;
		nodeTitle = document.createElement("title")
		nodeTitle.innerHTML=title;
		mindmap.appendChild(nodeTitle);
		const styleCSS = 'svg div{margin-top:-4px;} svg a {text-decoration:none} svg foreignObject {overflow:visible;} svg strong{color:#333; font-size:0.98em!important; font-weight:500!important;} svg .hide, svg .hide *{color:transparent!important} svg .hide {background-color:#FFFFEC} svg .hide img {opacity:0} svg img[alt=h-25]{height:25px} svg img[alt=h-50]{height:50px} svg img[alt=h-75]{height:75px} svg img[alt=h-100]{height:100px} svg img[alt=h-125]{height:125px} svg img[alt=h-150]{height:150px} svg img[alt=h-175]{height:175px} svg img[alt=h-200]{height:200px} svg blockquote {width:'+widthBlockquote+'px!important; white-space: normal; text-align:justify; font-size:0.8em; line-height:1em; border:1px solid #aaa; padding:10px; border-radius:4px;'+marginLeftBlockquote+'} svg aside{font-size: 0.8em; display: inline-block!important; font-weight:normal;vertical-align: top} svg cite {font-style:inherit; font-family:serif; font-size:0.97em}'+ style;
		const styleElement = document.createElement("style")
		styleElement.innerHTML=styleCSS;
		mindmap.appendChild(styleElement);
	
		if(root.content){
			let template = document.createElement('template');
			template.innerHTML = root.content;
			const rootEle = template.content.lastChild;
			rootEle.style.border='0.05em solid #e7e7e791'
			rootEle.style['border-radius']='0.3em'
			rootEle.style.padding='0.3em 0.3em 0.3em 0.3em'
			rootEle.style.background='rgb(135 135 135 / 57%)'
			root.content = rootEle.outerHTML;
			fname = rootEle.innerText;
		} else {
			fname = 'mindmap';
		}

		mm=Markmap.create('#markmap', optionsFull, root);

		if(openLinksInNewTab) { 
			const links = mindmap.querySelectorAll('a');
			links.forEach(link => {
				link.setAttribute('target', '_blank');
			});
		}

	})

	function handleHide(event) {
			let targetElement = event.target
			const elementType = targetElement.tagName
			let searchDivCount = 0;
			if (elementType == 'SVG') {
				return
			} else {
				if (elementType =='circle' && event.altKey) {
					const parentElement = targetElement.parentElement
					const depth = parentElement.getAttribute('data-depth');
					const unfoldedBranches = mindmap.querySelectorAll('g[data-depth="'+depth+'"]:not(.markmap-fold)')
					for (const branch of unfoldedBranches) {
						const circle = branch.querySelector('circle');
						if (circle) {circle.dispatchEvent(new MouseEvent("click"));}
					}
						targetElement.dispatchEvent(new MouseEvent("click"));
					return
				}
				while (targetElement && targetElement.tagName !== 'DIV' && searchDivCount < 5) {
					targetElement = targetElement.parentElement;
					searchDivCount++;
				}
			}
			if (targetElement.tagName == 'DIV') {
				if (event.altKey) {
					targetElement.classList.toggle('hide'); }
				else {
					targetElement.classList.remove('hide');
				}
			}
			if(automaticResize) {
				mm.fit();
			}
	}

	function getBBox(element) {
		const {x, y, width, height} = element.getBBox();
		return {x: x, y: y, w: width, h: height};
	}


	function createSVG(mm) {
		const boundingBox = getBBox(mindmap)
		mm = mm.replace(/<br>/g, '<br/>')
		mm = mm.replace(/\n/g, ' ')
		mm = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">'
		+ '<svg id="markmap" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
		+ 'class="' + mindmap.className['baseVal'] + '" '
		+ 'width="'+boundingBox.w+'" height="'+(boundingBox.h+30)+'" '
		+ 'style="width:100%; height:100%;" viewBox="' + boundingBox.x + ' ' + (boundingBox.y-15) + ' ' + (boundingBox.w) + ' ' + (boundingBox.h+30) + '">'
		+'<use xlink:href=""><title>'+title+'</title></use>'+'<desc>'+description.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&lt;')+'</desc>'+ mm.replace(/<title>.*<\/title>/,'') + '</svg>'
		return mm;
	}

	function svgDownload() {
		const svgXml = createSVG(mindmap.innerHTML)
		const filename = fname + '.svg';
		const file = new File([svgXml], filename, {
			type: "text/plain;charset=utf-8"
		});
		saveAs(file);
	}
	function pngDownload() {
		const svgXml = createSVG(mindmap.innerHTML)
		const filename = fname + '.png';
		svg2png
			.svgToPng(svgXml)
			.then(b64 => saveAs(b64toFile(b64, filename)));
	}

	async function getGithubUrl() {
		const svgXml = createSVG(mindmap.innerHTML)
		const b64 = await svg2png.svgToPng(svgXml)
		return uploadGithub(b64)
	}

	async function uploadGithub(b64) {
		const curr = getDatatimeStr();
		const pngPath = `md/${curr.substring(0,4)}/${curr.substring(4,6)}/${curr}.png`;
		const markdownPath = `markdown/mindmap-${fname}.md`;
		const mds = $markdownSource;

		await github.createOrUpdateStringFile('markmap server upload', b64.split(",")[1], pngPath);

		await github.createOrUpdateStringFile(`save ${fname}.md`,  Base64.encode(mds), markdownPath);

		return 'https://cdn.jsdelivr.net/gh/fluidcat/imgs@md/'+ pngPath;
	}


	function getDatatimeStr(){
		const date = new Date();
		const year = date.getFullYear();  
		const month = (date.getMonth() + 1).toString().padStart(2, '0');  
		const day = date.getDate().toString().padStart(2, '0'); 
		const hour = date.getHours().toString().padStart(2, '0');
		const minute = date.getMinutes().toString().padStart(2, '0');
		const second = date.getSeconds().toString().padStart(2, '0');
		const milliSecond = date.getMilliseconds().toString().padStart(3, '0');
		const formattedDate = `${year}${month}${day}${hour}${minute}${second}${milliSecond}`;  
		return formattedDate;
	}

	function stringSha(text) {
		const bytes =  CryptoJS.lib.WordArray.create(text)
		const hash = CryptoJS.SHA1(bytes).toString();
		return hash;
	}

	function fileSha(file) {
		let read = new FileReader();
		read.readAsArrayBuffer(file)
		read.onload = function () {
			(async function () {
				console.log(CryptoJS.SHA1(read.result).toString());
			})();
		}
	}

	function b64toFile(data, fileName) {
    	var arr = data.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
		while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], fileName, { type: mime });
	}

	function mindMapSaveAsHtmlCreateFile() {
		const root = JSON.stringify(mindmapRoot);
		let templateHtml ='<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>'+title+'</title><style>*{margin:0; padding:0}#markmap{display:block; width:100vw; height:100vh}</style></head><body><svg id="markmap"><use xlink:href=""><title>'+title+'</title></use><desc>'+description.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&lt;')+'</desc></svg><script src="https://cdn.jsdelivr.net/npm/d3"><\/script><script src="https://cdn.jsdelivr.net/npm/markmap-view"><\/script><script>const root='+root+'; const{Markmap, loadCSS, loadJS}=window.markmap; const maxWidth='+maxWidth+'; const styles="div{padding-bottom:0.12em!important} a {text-decoration:none} foreignObject {overflow:visible} strong{color:#333;  font-size:0.98em} .hide, .hide *{color:transparent!important} .hide {background-color:#FFFFEC} .hide img {opacity:0} img[alt=h-25]{height:25px} img[alt=h-50]{height:50px} img[alt=h-75]{height:75px} img[alt=h-100]{height:100px} img[alt=h-125]{height:125px} img[alt=h-150]{height:150px} img[alt=h-175]{height:175px} img[alt=h-200]{height:200px} blockquote {width:'+widthBlockquote+'px!important;  white-space: normal;  text-align:justify;  font-size:0.8em;  line-height:1em;  border:1px solid #aaa;  padding:10px;  border-radius:4px; '+marginLeftBlockquote+'} aside{font-size: 0.8em;  display: inline-block!important;  font-weight:normal; vertical-align: top} cite {font-style:inherit;  font-family:serif;  font-size:0.97em}'+style.replaceAll('"','\\"')+'"; const options={duration:0, style:id=>styles, maxWidth:maxWidth, spacingVertical:8, paddingX:15, autoFit:true}; Markmap.create("#markmap", options, root); <\/script></body></html>';
		const file = new File([templateHtml], "mindmap.html", {
			type: "text/plain;charset=utf-8"
		});
		saveAs(file);
	}

	$: if ($mindmapSaveAsSvg) {
		svgDownload();
		mindmapSaveAsSvg.update(n => false)
	}

	$: if ($mindmapSaveAsPng) {
		pngDownload();
		mindmapSaveAsPng.update(n => false)
	}

	$: if ($mindmapShareByGithub) {
		getGithubUrl().then(url=> copy(url));
		mindmapShareByGithub.update(n => false)
	}

	$: if ($mindmapSaveAsHtml) {
		mindMapSaveAsHtmlCreateFile();
		mindmapSaveAsHtml.update(n => false)
	}

	function handleKeydown(event) {
		if (!$show && event.key === 'r') {
			automaticResize = automaticResize ? false : true;
			if(automaticResize) {
				mm.fit();
			}
		}
	}

	const mindmapDiv = spring(0, {
		precision: 0.1,
		soft: true
	});

	$: if($show) {
		mindmapDiv.set(28);
	} else {
		mindmapDiv.set(0);
	}

</script>

<svelte:window on:keydown={handleKeydown} />


<div bind:clientWidth={w} bind:clientHeight={h} style="width: {98-$mindmapDiv}vw; height:98vh; margin-left: {$mindmapDiv}vw" >
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg id="markmap" bind:this={mindmap} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		style="width:100%; height:100%" on:click={handleHide}>
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
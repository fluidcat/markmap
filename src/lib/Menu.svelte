<script>
	import {
		show,
		baseURL,
		mindmapSaveAsSvg,
		mindmapSaveAsPng,
		mindmapShareByGithub,
		mindmapSaveAsHtml
	} from './stores.js'
	export let source;
	import url from './url.js';
	import { tooltip } from './tooltip';
	
	import { fade, fly } from 'svelte/transition';

	let urlToShare;
	let encodageHash;
	import {
		saveAs
	} from 'file-saver-es';

	let menu;

	function menuEdit() {
		showNotification = false;
		show.update(n => true);
	}

	function menuView() {
		show.update(n => false);
	}

	function menuSaveAsSvg() {
		mindmapSaveAsSvg.update(n => true)
	}

	function menuSaveAsPng() {
		mindmapSaveAsPng.update(n => true)
	}

	function menuSaveAsHtml() {
		mindmapSaveAsHtml.update(n => true)
	}

	function menuHide() {
		menu.style.display = menu.style.display == 'none' ? 'block' : 'none';
	}

	function menuShare() {
		mindmapShareByGithub.update(n => true)
		toastNotification();
	}

	function menuShare_bak() {
		toastNotification();
		encodageHash = encodeURI(source);
		urlToShare = $baseURL + '/#' + encodageHash
		navigator.clipboard.writeText(urlToShare);
	}

	function handleKeydown(event) {
		if (!$show) {
			if (event.key === 'e') {
				event.preventDefault();
				menu.style.display = 'block';
				menuEdit();
			}
			if (event.key === 's') {
				menu.style.display = 'block';
				menuSaveAsSvg();
			}
			if (event.key === 'h') {
				menu.style.display = 'block';
				menuSaveAsHtml();
			}
			if (event.key === 'l') {
				menu.style.display = 'block';
				menuShare();
			}
			if (event.key == 'm') {
				menuHide();
			}
		} else {
			if (event.key === 'Escape') {
				menu.style.display = 'block';
				menuView();
			}
		}
	}

	function beforeunload(event) {
		event.preventDefault();
		return event.returnValue = '';
	}

	let showNotification = false;

	function toastNotification() {
		showNotification= true
		setTimeout(function () {
			showNotification= false;
		}, 1500);
	}

</script>

<svelte:window on:keydown={handleKeydown} on:beforeunload={beforeunload} />

<nav id="menu" bind:this={menu}>
	{#if $show}<a href="#edit" on:click|preventDefault={menuView}>👓</a>{:else}<a href="#edit" on:click|preventDefault={menuEdit}>✒️</a>{/if}
		<a href="#saveHTML" use:tooltip title='保存为网页' on:click|preventDefault={menuSaveAsHtml}>🌐</a>
		<a href="#saveSVG" use:tooltip title='保存为矢量图' on:click|preventDefault={menuSaveAsSvg}>SVG</a>
		<a href="#saveSVG" use:tooltip title='保存为图片' on:click|preventDefault={menuSaveAsPng}>PNG</a>
		<a href="#share" use:tooltip title='生成引用链接' on:click|preventDefault={menuShare}>🔗</a>
		{#if showNotification}
		<div id="shareNotification" in:fly="{{ y: 50, duration: 1000 }}" out:fade>引用链接已复制到剪切板</div>
		{/if}
		<a href="{$baseURL}" target="_blank" rel="noreferrer">❓</a>
</nav>

<style>
	#menu {
		z-index: 1;
		margin: 1em;
		position: absolute;
		font-size: 1.4em
	}

	#menu a {
		margin-left: 1em;
		text-decoration: none;
	}

	#shareNotification {
		position:absolute;
		width:160px;
		margin-top:1em;
		margin-left:2em;
		background-color: #5cb85c;
		color:white;
		font-size:16px;
		text-align:center;
		padding:10px 2px!important;
		display:table-cell;
		font-family: 'Roboto', 'sans-serif';
		border-radius:5px;
		
	}
</style>
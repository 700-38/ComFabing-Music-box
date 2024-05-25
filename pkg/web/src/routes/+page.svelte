<script>
	import Preview from './Preview.svelte';
	import { onMount } from 'svelte';
	import {
		prepareRender,
		drawCommands,
		cameras,
		entitiesFromSolids,
		controls
	} from '@jscad/regl-renderer';
	import { Midi } from '@tonejs/midi';
	import { Assembly, example_config, toStl } from '$lib/scad';
	let midiFile = null;
	let notes = [];
	let previewModel;

	const handleFileUpload = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const arrayBuffer = await file.arrayBuffer();
			const midi = new Midi(arrayBuffer);
			parseMidi(midi);
		}
	};

	const parseMidi = (midi) => {
		notes = [];
		midi.tracks.forEach((track) => {
			track.notes.forEach((note) => {
				notes.push({
					name: note.name,
					time: note.time,
					duration: note.duration,
					velocity: note.velocity
				});
			});
		});
		// console.log(Assembly(example_config));
		// const note_cyl = Assembly(example_config);
		// const stl = toStl(note_cyl);
		// previewModel = stl;
		// console.log(stl);
	};
	onMount(() => {
		const note_cyl = Assembly(example_config);
		const stl = toStl(note_cyl);
		previewModel = stl;
		console.log(stl);
	});
</script>

<main>
	<h1>MIDI File Reader</h1>
	<input type="file" accept=".mid, .midi" on:change={handleFileUpload} />
	<Preview model={previewModel}></Preview>
	<!-- {#if notes.length > 0}
		<pre>{JSON.stringify(notes, null, 2)}</pre>
	{/if} -->
</main>

<style>
	main {
		font-family: Arial, sans-serif;
		padding: 1rem;
	}
	pre {
		background: #f0f0f0;
		padding: 1rem;
		border-radius: 8px;
	}
</style>

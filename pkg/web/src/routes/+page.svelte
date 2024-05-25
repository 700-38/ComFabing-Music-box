<script>
	import Preview from './Preview.svelte';
	import { onMount } from 'svelte';
	import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
	import ConfigTab from './ConfigTab.svelte';
	import {
		Scene,
		PerspectiveCamera,
		WebGLRenderer,
		Mesh,
		MeshBasicMaterial,
		BoxGeometry,
		Color,
		Group,
		DirectionalLight,
		SpotLight
	} from 'three';
	import { CSG } from '@jscad/csg';
	import { Midi, Track } from '@tonejs/midi';
	import { Assembly, example_config, jscadGeom3ToThreeGeometry, toObj } from '$lib/scad';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	let midiFile = null;
	/** @type {Array<Array<number>>} */
	let notes = [];
	let selectedTrack = null;
	/**
	 * @type {HTMLCanvasElement}
	 */
	let canvas;
	/**
	 * @type {WebGLRenderer}
	 */
	let renderer;
	/**
	 * @type {import("three").Camera}
	 */
	let camera;
	let scene = new Scene();
	let group = new Group();
	/**
	 * @type {Midi | null}
	 */
	let midi = null;

	const handleFileUpload = async (event) => {
		const file = event.target.files[0];
		if (file) {
			const arrayBuffer = await file.arrayBuffer();
			midi = new Midi(arrayBuffer);
			// parseMidi(midi);
		}
	};

	const generatePreview = () => {
		if (midi) {
			parseMidi(midi);
		}
	};

	const parseMidi = (midi) => {
		notes = [];
		try {
			console.log(midi.tracks);
			midi.tracks.forEach((track) => {
				const duration = track.duration;
				track.notes.forEach((note) => {
					if (note.midi < 65 || note.midi > 136) throw new Error('Note out of range');
					const midi = note.midi - 64;
					const time = (note.time / duration) * 340;
					notes.push([midi, time]);
				});
			});
		} catch (error) {
			console.error(error);
			return alert('Note out of range');
		}

		const cyl = createNoteCylinder(notes);
		addCylinderToScene(cyl);
	};

	const createNoteCylinder = (
		/** @type {Array<Array<number>>} */ midi_note,
		config = example_config
	) => {
		const note_cyl = Assembly({ ...config, pin_list: midi_note });
		const cyl_obj = toObj(note_cyl);
		const cyl_blob = new Blob(cyl_obj);
		const blobURL = URL.createObjectURL(cyl_blob);
		loadObj(blobURL);
		return;
	};

	const addCylinderToScene = (cylinder) => {
		scene.add(cylinder);
	};

	const loadObj = (url) => {
		const loader = new OBJLoader();
		loader.load(url, (obj) => {
			obj.traverse(function (child) {
				if (child instanceof Mesh) {
					child.material.color.set(0xff0000); // Set color to red
				}
			});
			group.add(obj);
		});
	};

	onMount(() => {
		// Scene setup
		const bgColor = new Color(0x14c8a1);

		scene.background = bgColor;
		camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		renderer = new WebGLRenderer({ canvas });
		renderer.setSize(window.innerWidth, window.innerHeight);
		const light = new DirectionalLight(0xffffff, 3);
		light.position.set(0, 100, 100);
		scene.add(light);

		// Convert JSCAD geometry to Three.js geometry
		// const note_cyl = Assembly(example_config);
		// const cyl_obj = toObj(note_cyl);
		// const cyl_blob = new Blob(cyl_obj);
		// const blobURL = URL.createObjectURL(cyl_blob);
		// loadObj(blobURL);
		scene.add(group);

		// Position the camera
		camera.position.z = 200;
		group.rotateY(Math.PI / 2);
		group.translateZ(-50);
		// Animation loop
		const animate = () => {
			requestAnimationFrame(animate);

			group.rotation.x += 0.005;
			// group.rotation.y += 0.001;

			renderer.render(scene, camera);
		};

		animate();
	});
</script>

<main>
	<h1>MIDI File Reader</h1>
	<input type="file" accept=".mid, .midi" on:change={handleFileUpload} />
	<label class="justify-center">
		<div class="label w-full"><span>Select track here</span></div>
		<select bind:value={selectedTrack}></select>
	</label>
	<canvas bind:this={canvas}></canvas>
	<ConfigTab />
</main>

<style>
	main {
		font-family: Arial, sans-serif;
		padding: 1rem;
	}
	canvas {
		display: block;
	}
</style>

<script>
	import { onMount } from 'svelte';
	import {
		prepareRender,
		drawCommands,
		cameras,
		entitiesFromSolids,
		controls
	} from '@jscad/regl-renderer';

	export let model;

	$: entities = entitiesFromSolids({}, model);

	let containerElement;

	const perspectiveCamera = cameras.perspective;

	const orbitControls = controls.orbit;

	const state = {
		controls: orbitControls.defaults,
		camera: { ...perspectiveCamera.defaults }
	};

	$: options = {
		glOptions: { container: containerElement },
		drawCommands: {
			drawAxis: drawCommands.drawAxis,
			drawGrid: drawCommands.drawGrid,
			drawLines: drawCommands.drawLines,
			drawMesh: drawCommands.drawMesh
		},
		entities
	};

	onMount(() => {
		options.camera = state.camera;

		perspectiveCamera.setProjection(state.camera, state.camera, {
			width: containerElement.clientWidth,
			height: containerElement.clientHeight
		});

		const render = prepareRender(options);

		let updateView = true;

		const doRotatePanZoom = () => {
			if (rotateDelta[0] || rotateDelta[1]) {
				const updated = orbitControls.rotate(
					{ controls: state.controls, camera: state.camera, speed: rotateSpeed },
					rotateDelta
				);
				state.controls = { ...state.controls, ...updated.controls };
				updateView = true;
				rotateDelta = [0, 0];
			}

			if (panDelta[0] || panDelta[1]) {
				const updated = orbitControls.pan(
					{ controls: state.controls, camera: state.camera, speed: panSpeed },
					panDelta
				);
				state.controls = { ...state.controls, ...updated.controls };
				panDelta = [0, 0];
				state.camera.position = updated.camera.position;
				state.camera.target = updated.camera.target;
				updateView = true;
			}

			if (zoomDelta) {
				const updated = orbitControls.zoom(
					{ controls: state.controls, camera: state.camera, speed: zoomSpeed },
					zoomDelta
				);
				state.controls = { ...state.controls, ...updated.controls };
				zoomDelta = 0;
				updateView = true;
			}
		};

		let lastX = 0;
		let lastY = 0;

		const rotateSpeed = 0.002;
		const panSpeed = 1;
		const zoomSpeed = 0.08;
		let rotateDelta = [0, 0];
		let panDelta = [0, 0];
		let zoomDelta = 0;
		let pointerDown = false;

		const moveHandler = (ev) => {
			if (!pointerDown) return;

			const dx = lastX - ev.pageX;
			const dy = ev.pageY - lastY;

			const shiftKey = ev.shiftKey === true || (ev.touches && ev.touches.length > 2);

			if (shiftKey) {
				panDelta[0] += dx;
				panDelta[1] += dy;
			} else {
				rotateDelta[0] -= dx;
				rotateDelta[1] -= dy;
			}

			lastX = ev.pageX;
			lastY = ev.pageY;

			ev.preventDefault();
		};

		const downHandler = (ev) => {
			pointerDown = true;
			lastX = ev.pageX;
			lastY = ev.pageY;
			containerElement.setPointerCapture(ev.pointerId);
		};

		const upHandler = (ev) => {
			pointerDown = false;
			containerElement.releasePointerCapture(ev.pointerId);
		};

		const wheelHandler = (ev) => {
			zoomDelta += ev.deltaY;
			ev.preventDefault();
		};

		containerElement.onpointermove = moveHandler;
		containerElement.onpointerdown = downHandler;
		containerElement.onpointerup = upHandler;
		containerElement.onwheel = wheelHandler;

		const updateAndRender = (timestamp) => {
			doRotatePanZoom();

			if (updateView) {
				const updates = orbitControls.update({
					controls: state.controls,
					camera: state.camera
				});

				state.controls = { ...state.controls, ...updates.controls };
				updateView = state.controls.changed; // for elasticity in rotate / zoom

				state.camera.position = updates.camera.position;
				perspectiveCamera.update(state.camera);

				render(options);
			}

			window.requestAnimationFrame(updateAndRender);
		};

		window.requestAnimationFrame(updateAndRender);
	});
</script>

<div bind:this={containerElement}></div>

<style>
	div {
		height: 100px;
	}
</style>

import { cylinder, cylinderElliptic } from '@jscad/modeling/src/primitives';
import { booleans, transforms, geometries, utils } from '@jscad/modeling';
// const { serialize } = require('@jscad/scad-api');
// import { serialize } from '@jscad/stl-serializer';
import { serialize } from '@jscad/obj-serializer';
import * as THREE from 'three';
const { subtract, union } = booleans;
const { translate, rotate } = transforms;
const { degToRad } = utils;
const { geom3 } = geometries;
// import { difference, union } from '@jscad/modeling/src/booleans';
const Side_Plate = (thickness, radius, segments) =>
	translate(
		[0, 0, thickness / 2],
		cylinder({ height: thickness, radius: radius, segments: segments })
	);

const Base_Cylinder = (inner_r, outer_r, height, segments) =>
	translate(
		[0, 0, height / 2],
		subtract(
			cylinder({ height: height, radius: outer_r, segments: segments }),
			translate([0, 0, -1], cylinder({ height: height + 2, radius: inner_r, segments: segments }))
		)
	);

const Note_Pin = (trunk_r, tip_r, height, segments) =>
	rotate(
		[0, degToRad(90), 0],
		translate(
			[0, 0, height / 2],
			cylinderElliptic({
				height: height,
				startRadius: [trunk_r, trunk_r],
				endRadius: [tip_r, tip_r],
				segments: segments
			})
		)
	);

// export const normalizeMIDI = (midi) => {

// }

export const Assembly = (config) => {
	const { side_plate, base_cylinder, note_pin, pin_padding, pin_gap, pin_list } = config;

	const side_plate_obj = Side_Plate(side_plate.thickness, side_plate.radius, config.segments);
	const base_cylinder_obj = Base_Cylinder(
		base_cylinder.inner_r,
		base_cylinder.outer_r,
		base_cylinder.height,
		config.segments
	);

	const pins = pin_list.map(([note, angle]) => {
		const pin_offset = pin_padding + note * pin_gap;
		return rotate(
			[0, 0, degToRad(angle)],
			translate(
				[base_cylinder.outer_r, 0, pin_offset],
				Note_Pin(note_pin.trunk_r, note_pin.tip_r, note_pin.height, config.segments)
			)
		);
	});

	return union(side_plate_obj, base_cylinder_obj, ...pins);
};

export const example_config = {
	side_plate: {
		thickness: 2,
		radius: 50
	},
	base_cylinder: {
		inner_r: 36,
		outer_r: 40,
		height: 120
	},
	note_pin: {
		trunk_r: 1,
		tip_r: 0.5,
		height: 2
	},
	segments: 50,
	pin_padding: 10,
	pin_gap: 3,
	pin_list: [
		[1, 20],
		[2, 30],
		[3, 40],
		[4, 50],
		[5, 60],
		[6, 70],
		[7, 80],
		[8, 90],
		[9, 100],
		[10, 110],
		[11, 120],
		[12, 130],
		[13, 140],
		[14, 150],
		[15, 160],
		[16, 170],
		[17, 180],
		[18, 190],
		[19, 200],
		[20, 210],
		[21, 220],
		[22, 230],
		[23, 240],
		[24, 250],
		[25, 260],
		[26, 270],
		[27, 280],
		[28, 290],
		[29, 300],
		[30, 310],
		[31, 320],
		[32, 330],
		[33, 340],
		[34, 350],
		[35, 360],
		[36, 370],
		[37, 380],
		[38, 390],
		[39, 400],
		[40, 410],
		[41, 420],
		[42, 430],
		[43, 440],
		[44, 450],
		[45, 460],
		[46, 470]
	]
};

// export const toStl = (scad) => serialize({ binary: 'false' }, scad)[0];
export const toObj = (scad) => serialize({}, scad);

export function jscadGeom3ToThreeGeometry(geom) {
	const geometry = new THREE.BufferGeometry();

	const polygons = geom3.toPolygons(geom);
	const verticesArray = [];
	const indicesArray = [];

	polygons.forEach((polygon) => {
		const vertices = polygon.vertices.map((v) => new THREE.Vector3(v[0], v[1], v[2]));
		const startIndex = verticesArray.length;

		vertices.forEach((vertex) => verticesArray.push(vertex.x, vertex.y, vertex.z));

		for (let i = 2; i < vertices.length; i++) {
			indicesArray.push(startIndex, startIndex + i - 1, startIndex + i);
		}
	});

	geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verticesArray), 3));
	geometry.setIndex(indicesArray);

	return geometry;
}

// const output = Assembly(example_config);

// fs.writeFileSync('./dist/output.scad', output.serialize({ $fn: 100 }));

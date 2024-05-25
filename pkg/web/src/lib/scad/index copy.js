const fs = require('fs');
const { cylinder, difference, sphere, union } = require('scad-js');

const Side_Plate = (thickness, radius) => cylinder(thickness, radius, { center: false });

const Base_Cylinder = (inner_r, outer_r, height) =>
	difference(
		cylinder(height, outer_r, { center: false }),
		cylinder(height + 2, inner_r, { center: false }).translate([0, 0, -1])
	);

const Note_Pin = (trunk_r, tip_r, height) =>
	cylinder(height, [trunk_r, tip_r], { center: false }).rotate([0, 90, 0]);

const Assembly = (config) => {
	const { side_plate, base_cylinder, note_pin, pin_padding, pin_gap, pin_list } = config;

	const side_plate_obj = Side_Plate(side_plate.thickness, side_plate.radius);
	const base_cylinder_obj = Base_Cylinder(
		base_cylinder.inner_r,
		base_cylinder.outer_r,
		base_cylinder.height
	);

	const pins = pin_list.map(([note, angle]) => {
		const pin_offset = pin_padding + note * pin_gap;
		return Note_Pin(note_pin.trunk_r, note_pin.tip_r, note_pin.height)
			.translate([base_cylinder.outer_r, 0, pin_offset])
			.rotate([0, 0, angle]);
	});

	return union(side_plate_obj, base_cylinder_obj, ...pins);
};

const example_config = {
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
	pin_padding: 10,
	pin_gap: 2,
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

const output = Assembly(example_config);

fs.writeFileSync('./dist/output.scad', output.serialize({ $fn: 100 }));

import { DefinitionBase } from './DefinitionBase.js';

export class ParametricServiceDefinition extends DefinitionBase {
  constructor({ paramsSchema = null, timeModelKey = null, pricingModelKey = null, ...rest }) {
    super(rest);
    this.paramsSchema = paramsSchema;     // { key, min, max, unit }
    this.timeModelKey = timeModelKey;     // points to Settings.timeModels
    this.pricingModelKey = pricingModelKey; // points to Settings.pricingModels
  }

  validate() {
    this.validateBase();
    if (this.scope !== 'property') throw new Error('ParametricServiceDefinition must be scope=property');
    if (!this.timeModelKey) throw new Error('timeModelKey required');
    if (!this.pricingModelKey) throw new Error('pricingModelKey required');
    if (this.paramsSchema && !this.paramsSchema.key) throw new Error('paramsSchema.key required');
  }
}

import { ParametricServiceDefinition } from '../definitions/ParametricServiceDefinition.js';


export const COMMERCIAL_RUBBISH_DEFINITIONS = {


'service.rubbish.small_tin': new ParametricServiceDefinition({
definitionId: 'service.rubbish.small_tin',
kind: 'service',
scope: 'property',
label: 'Small rubbish tin cleared',
category: 'rubbish',
description: 'Small rubbish tin (60L). Cleared and removed.',
paramsSchema: { key: 'number_of_small_tins', min: 0, unit: 'bin' },
timeModelKey: 'rubbish_small_tin',
pricingModelKey: 'rubbish_small_tin'
}),


'service.rubbish.medium_bin': new ParametricServiceDefinition({
definitionId: 'service.rubbish.medium_bin',
kind: 'service',
scope: 'property',
label: 'Medium rubbish bin cleared',
category: 'rubbish',
description: 'Medium rubbish bin (120L). Cleared and removed.',
paramsSchema: { key: 'number_of_medium_bins', min: 0, unit: 'bin' },
timeModelKey: 'rubbish_medium_bin',
pricingModelKey: 'rubbish_medium_bin'
}),


'service.rubbish.large_bin': new ParametricServiceDefinition({
definitionId: 'service.rubbish.large_bin',
kind: 'service',
scope: 'property',
label: 'Large rubbish bin cleared',
category: 'rubbish',
description: 'Large rubbish bin (240L+). Cleared and removed.',
paramsSchema: { key: 'number_of_large_bins', min: 0, unit: 'bin' },
timeModelKey: 'rubbish_large_bin',
pricingModelKey: 'rubbish_large_bin'
}),


'service.rubbish.transport': new ParametricServiceDefinition({
definitionId: 'service.rubbish.transport',
kind: 'service',
scope: 'property',
label: 'Rubbish transport to dumpster',
category: 'rubbish',
description: 'Transport rubbish to dumpster station.',
paramsSchema: { key: 'transport_distance_meters', min: 0, unit: 'meters' },
timeModelKey: 'rubbish_transport_distance',
pricingModelKey: 'rubbish_transport_distance'
})
};

//#(Numbers shown here are placeholders 

//#settings.timeModels.rubbish_small_tin = {
//#baseRangeMinutes: [1, 2, 4],
//#unit: 'bin',
//#notes: 'Includes walking between desks'
};


settings.pricingModels.rubbish_small_tin = {
pricePerUnit: 0.0 // bundled or rolled into contract
};

//— owner-controlled in Settings UI.)

import { ParametricServiceDefinition } from '../definitions/ParametricServiceDefinition.js';
scope: 'property',
label: 'Private office cleaned',
category: 'offices',
description: 'Single private office. Floors, surfaces, trash.',
paramsSchema: { key: 'number_of_private_offices', min: 0, unit: 'room' },
timeModelKey: 'offices_private_office',
pricingModelKey: 'offices_private_office',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['surface_cleaner', 'vacuum_cleaner', 'cloth']
}
}),


'service.offices.open_plan_desk': new ParametricServiceDefinition({
definitionId: 'service.offices.open_plan_desk',
kind: 'service',
scope: 'property',
label: 'Open-plan desk station',
category: 'offices',
description: 'Individual desk in open-plan area. Surfaces, trash.',
paramsSchema: { key: 'number_of_open_plan_desks', min: 0, unit: 'desk' },
timeModelKey: 'offices_open_plan_desk',
pricingModelKey: 'offices_open_plan_desk',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['surface_cleaner', 'microfiber_cloth']
}
}),


'service.offices.boardroom': new ParametricServiceDefinition({
definitionId: 'service.offices.boardroom',
kind: 'service',
scope: 'property',
label: 'Boardroom/conference room',
category: 'offices',
description: 'Conference room. Table, chairs, floor, trash.',
paramsSchema: { key: 'number_of_boardrooms', min: 0, unit: 'room' },
timeModelKey: 'offices_boardroom',
pricingModelKey: 'offices_boardroom',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['surface_cleaner', 'vacuum_cleaner', 'cloth']
}
}),


'service.offices.reception': new ParametricServiceDefinition({
definitionId: 'service.offices.reception',
kind: 'service',
scope: 'property',
label: 'Reception area',
category: 'offices',
description: 'Reception desk area. Surfaces, waiting area, trash.',
paramsSchema: { key: 'number_of_receptions', min: 0, unit: 'area' },
timeModelKey: 'offices_reception',
pricingModelKey: 'offices_reception',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['surface_cleaner', 'vacuum_cleaner', 'cloth']
}
})
};


import { ParametricServiceDefinition } from '../definitions/ParametricServiceDefinition.js';


export const COMMERCIAL_TOILETS_DEFINITIONS = {


'service.toilets.single_toilet': new ParametricServiceDefinition({
definitionId: 'service.toilets.single_toilet',
kind: 'service',
scope: 'property',
label: 'Single toilet (urinal/stall)',
category: 'toilets',
description: 'Single toilet/urinal. Cleaned, sanitized, paper/soap restocked.',
paramsSchema: { key: 'number_of_single_toilets', min: 0, unit: 'fixture' },
timeModelKey: 'toilets_single_toilet',
pricingModelKey: 'toilets_single_toilet',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['toilet_cleaner', 'toilet_brush', 'disinfectant', 'toilet_paper', 'soap']
}
}),


'service.toilets.stall': new ParametricServiceDefinition({
definitionId: 'service.toilets.stall',
kind: 'service',
scope: 'property',
label: 'Toilet stall',
category: 'toilets',
description: 'Private toilet stall. Cleaned, sanitized, paper restocked.',
paramsSchema: { key: 'number_of_stalls', min: 0, unit: 'stall' },
timeModelKey: 'toilets_stall',
pricingModelKey: 'toilets_stall',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['toilet_cleaner', 'toilet_brush', 'disinfectant', 'toilet_paper']
}
}),


'service.toilets.sink_station': new ParametricServiceDefinition({
definitionId: 'service.toilets.sink_station',
kind: 'service',
scope: 'property',
label: 'Sink/washbasin station',
category: 'toilets',
description: 'Sink and counter area. Cleaned, mirrors, soap restocked.',
paramsSchema: { key: 'number_of_sinks', min: 0, unit: 'basin' },
timeModelKey: 'toilets_sink_station',
pricingModelKey: 'toilets_sink_station',
meta: {
workType: 'labor',
skillLevel: 'basic',
products: ['bathroom_cleaner', 'microfiber_cloth', 'glass_cleaner', 'soap']
}
})
};

settings.timeModels.offices_private_office = { baseRangeMinutes: [10, 20, 45], unit: 'room' };
settings.pricingModels.offices_private_office = { pricePerUnit: 0.0 };


settings.timeModels.offices_open_plan_desk = { baseRangeMinutes: [2, 4, 8], unit: 'desk' };
settings.pricingModels.offices_open_plan_desk = { pricePerUnit: 0.0 };


settings.timeModels.toilets_single_toilet = { baseRangeMinutes: [3, 6, 15], unit: 'fixture' };
settings.pricingModels.toilets_single_toilet = { pricePerUnit: 0.0 };
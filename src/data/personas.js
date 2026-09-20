/**
 * SPDX-FileCopyrightText: 2026 FOSS Ethics Quiz contributors
 * SPDX-License-Identifier: CC-BY-SA-4.0
 */

import { ARCHETYPES } from "./archetypes.js";

/**
 * Maintained, named synthetic response profiles. Their target values are rounded
 * to the questionnaire’s attainable five-point increments before scoring.
 */
export const SYNTHETIC_PERSONAS = Object.freeze(ARCHETYPES.map((archetype) => Object.freeze({
  id: `${archetype.id}-persona`,
  targetArchetypeId: archetype.id,
  label: archetype.name,
  axisTargets: Object.freeze({ ...archetype.prototype }),
})));

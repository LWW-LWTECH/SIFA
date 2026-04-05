# Structured Interactive Form Actions
**Author:** Lee W Winter  
**Version:** 1.0.0  
**Files:** `sifa.engine.js` · `sifa.actions.js` · `cust.actions.js` *(optional)*

---

## Overview

SIFA is a lightweight, rules-based form engine. It scans your HTML for targeted elements and inputs, then drives dynamic behaviour through a configurable set of rule groups, actions, and validations — all without requiring you to write per-field JavaScript.

The core loop is:

1. Engine scans the page and registers all elements and inputs
2. User interacts with a field — an event fires (LOAD, INPUT, CHANGE, CLICK, SAVE)
3. Engine evaluates matching rule groups in order
4. Each rule checks an **active** condition, a **main condition**, then runs **true** or **false** actions
5. Validations run after actions
6. Unit cost and sale price are recalculated
7. Your event callback receives the updated outcome

---

## File Structure

```
project/
├── sifa.engine.js       # Core engine — required
├── sifa.actions.js      # Built-in actions — required
└── cust.actions.js      # Your custom actions — optional
```

All three files must be served from the same directory. The engine imports them using ES module dynamic imports, so the page must be served over HTTP (not `file://`).

---

## HTML Setup

### Field Elements

Wrap each field in a container element with the target class (`sifa-input` by default). The engine scans inside these containers for `input`, `select`, `textarea`, `label`, and `button` elements.

```html
<div class="sifa-input" id="name-field">
    <label for="full_name">Full Name</label>
    <input type="text" id="full_name" name="full_name" />
</div>

<div class="sifa-input" id="country-field">
    <label for="country">Country</label>
    <select id="country" name="country">
        <option value="">Select...</option>
        <option value="au">Australia</option>
        <option value="us">United States</option>
    </select>
</div>
```

### Radio & Checkbox Groups

Radio and checkbox inputs use `name` as their shared reference key. Group them inside a single `.sifa-input` container.

```html
<div class="sifa-input" id="colour-field">
    <label>Colour</label>
    <label><input type="radio" name="colour" value="red"   /> Red</label>
    <label><input type="radio" name="colour" value="blue"  /> Blue</label>
    <label><input type="radio" name="colour" value="green" /> Green</label>
</div>

<div class="sifa-input" id="interests-field">
    <label>Interests</label>
    <label><input type="checkbox" name="interests" value="tech"   /> Tech</label>
    <label><input type="checkbox" name="interests" value="sports" /> Sports</label>
    <label><input type="checkbox" name="interests" value="music"  /> Music</label>
</div>
```

### Group Elements

Group containers are used to show/hide entire sections. Use the target group class (`sifa-group` by default), or simply use semantic HTML — SIFA automatically scans `section`, `fieldset`, `details`, and `article` elements.

```html
<!-- Explicit group class -->
<div class="sifa-group" id="payment-section">
    ...
</div>

<!-- Semantic — scanned automatically -->
<section id="delivery-section">
    ...
</section>
```

### Element Tagging

SIFA generates reference keys from element `id` attributes. You can override this with a `data-tag` attribute:

```html
<div class="sifa-input" data-tag="my_custom_ref">
    <input type="text" name="phone" />
</div>
```

---

## Initialisation

Import the engine and create a new instance. Pass your configuration object to the constructor.

```html
<script type="module">
    import { SifaEngine } from './sifa.engine.js';

    const engine = new SifaEngine({
        targetElement: 'sifa-input',
        targetGroup:   'sifa-group',
        debug:         false,
        rules:         [ ...ruleGroups ],
        validationRules: [ ...validationObjects ],
        priceRules:    [ ...priceRuleObjects ],
        variables:     { myVar: 'initial value' },
        answers:       { field_full_name: 'Jane' },
        events: {
            LOAD:   (outcome) => console.log('Loaded', outcome),
            CHANGE: (target, outcome) => console.log('Changed', target, outcome),
            CLICK:  (target, outcome) => console.log('Clicked', target, outcome),
            INPUT:  (target, outcome) => console.log('Input', target, outcome),
            SAVE:   (outcome) => console.log('Saved', outcome),
        }
    });
</script>
```

The engine assigns itself to `window.SIFA` so it is accessible globally after initialisation.

---

## Settings Reference

| Property | Type | Default | Description |
|---|---|---|---|
| `targetElement` | `string` | `'sifa-input'` | CSS class name of field container elements |
| `targetGroup` | `string` | `'sifa-group'` | CSS class name of group container elements |
| `debug` | `boolean` | `false` | Enables console logging throughout the engine |
| `rules` | `array` | `[]` | Array of rule group objects |
| `validationRules` | `array` | `[]` | Array of validation rule objects |
| `priceRules` | `array` | `undefined` | Array of price rule objects |
| `variables` | `object` | `{}` | Initial variables merged into `outcome.variables` |
| `answers` | `object` | `{}` | Initial answers pre-applied to fields on load |
| `events` | `object` | `{}` | Callback functions for each engine event |
| `revID` | `number` | auto | Cache-busting ID — set automatically, do not override |

URL query string parameters are automatically parsed and merged into `outcome.variables` on load.

---

## How Elements Are Referenced

When the engine scans the page it assigns every element a **reference key** stored in `SIFA.elements`. You use these keys in all action calls.

| Element Type | Key Format | Example |
|---|---|---|
| Field container (`.sifa-input`) | `ele_{id}` | `ele_name_field` |
| Text / number / email input | `field_{name\|id}` | `field_full_name` |
| Select element | `field_{name\|id}` | `field_country` |
| Textarea | `field_{name\|id}` | `field_notes` |
| Radio group | `field_{name}` | `field_colour` |
| Checkbox group | `field_{name}` | `field_interests` |
| Label | `label_{for\|id}` | `label_full_name` |
| Button | `button_{id\|name}` | `button_submit_btn` |
| Group container | `group_{id}` | `group_payment_section` |

Keys are **slugified** — spaces and hyphens become underscores, all lowercase. For example an element with `id="name-field"` becomes `ele_name_field`.

Each registered element also has `el.sifaTag` (its own key) and `el.sifaRef` (for inputs and labels) set as properties directly on the DOM element.

---

## Rules

Rules are organised into **groups**. Each group targets one event and contains an ordered array of rule objects. Groups with `enable: false` are skipped entirely.

### Rule Group Structure

```javascript
{
    event:  'CHANGE',   // LOAD | INPUT | CHANGE | CLICK | SAVE | ALL
    enable: true,
    rules: [ ...ruleObjects ]
}
```

### Rule Object Structure

```javascript
{
    ref:           'my_rule_ref',                           // unique identifier — used by triggerRule()
    enable:        true,                                    // false skips this rule, group continues
    priority:      0,                                       // lower numbers run first within the group
    active:        'true',                                  // condition — if false, rule is skipped
    condition:     'sifa_inputHasValue("field_full_name")', // action to run to find a true or false condition
    true_actions:  [                                        // if true run these actions sequentially
        'sifa_showElement("ele_address_field")',
        'sifa_setValue("field_status", "active")'
    ],
    false_actions: [                                        // if false run these actions sequentially
        'sifa_hideElement("ele_address_field")'
    ]
}
```

### Rule Processing Order

1. Engine resets `engine.state` to `true`
2. Rule groups matching the event are filtered
3. Groups are processed in array order; a disabled group stops processing
4. Within each group, rules are sorted by `priority` (ascending) then executed
5. For each rule: `active` is evaluated → `condition` is evaluated → `true_actions` or `false_actions` run
6. If any action returns `false` or `engine.state` becomes `false`, processing halts

### Full Example

```javascript
rules: [
    {
        event: 'LOAD',
        enable: true,
        rules: [
            {
                ref: 'hide_delivery_on_load',
                enable: true,
                priority: 0,
                active: 'true',
                condition: 'true',
                true_actions: ['sifa_hideElement("group_delivery_section")'],
                false_actions: []
            }
        ]
    },
    {
        event: 'CHANGE',
        enable: true,
        rules: [
            {
                ref: 'show_delivery_if_shipping',
                enable: true,
                priority: 0,
                active: 'sifa_triggeredField("field_fulfillment")',
                condition: 'sifa_answerEquals("field_fulfillment", "ship")',
                true_actions: [
                    'sifa_showElement("group_delivery_section")',
                    'sifa_setVariable("requires_delivery", true)'
                ],
                false_actions: [
                    'sifa_hideElement("group_delivery_section")',
                    'sifa_clearGroup("group_delivery_section")'
                ]
            },
            {
                ref: 'age_check',
                enable: true,
                priority: 1,
                active: 'sifa_triggeredField("field_age")',
                condition: 'sifa_isGreaterThanOrEqualTo(sifa_getValue("field_age"), 18)',
                true_actions: ['sifa_showElement("ele_adult_content")'],
                false_actions: ['sifa_hideElement("ele_adult_content")']
            }
        ]
    }
]
```

---

## Validation Rules

Validations run after actions on LOAD, CHANGE, CLICK, and SAVE events. They write pass/fail messages into `outcome.validation` keyed by `ref`.

### Validation Object Structure

```javascript
{
    ref:           'name_required',
    enable:        true,
    condition:     'sifa_inputIsEmpty("field_full_name")',
    true_message:  'Full name is required',
    false_message: ''
}
```

- If `condition` evaluates **true** and `true_message` is set, the result is written
- If `condition` evaluates **false** and `false_message` is set, the result is written
- If a message is an empty string, nothing is written for that branch

### Validation Result Shape

```javascript
SIFA.outcome.validation['name_required']
// { outcome: true, message: 'Full name is required' }
```

### Full Example

```javascript
validationRules: [
    {
        ref: 'name_required',
        enable: true,
        condition: 'sifa_inputIsEmpty("field_full_name")',
        true_message:  'Full name is required',
        false_message: ''
    },
    {
        ref: 'age_valid',
        enable: true,
        condition: 'sifa_isBetween(sifa_getValue("field_age"), 18, 120)',
        true_message:  '',
        false_message: 'Age must be between 18 and 120'
    }
]
```

---

## Price Rules

Price rules calculate `outcome.saleprice` based on `outcome.unitcost` (derived from BOM items) and any configured rules. They are evaluated on LOAD, CHANGE, and SAVE events.

### Price Rule Object Structure

```javascript
{
    enable:    true,
    condition: 'sifa_variableEquals("region", "au")',   // optional — omit for always-on
    method:    'sifa_costPlusPrice',                     // the pricing action to apply
    set: {
        value: 20,
        type: 'percent'
    }
}
```

### Full Example

```javascript
priceRules: [
    {
        enable: true,
        condition: 'true',
        method: 'sifa_basePrice',
        set: { value: 0, type: 'unit' }         // start from zero
    },
    {
        enable: true,
        condition: 'true',
        method: 'sifa_costPlusPrice',
        set: { value: 30, type: 'percent' }     // cost + 30%
    },
    {
        enable: true,
        condition: 'sifa_answerEquals("field_promo", "SAVE10")',
        method: 'sifa_discountPrice',
        set: { value: 10, type: 'percent' }     // 10% off if promo applied
    }
]
```

---

## Events

All events are optional callbacks defined in the `events` setting.

| Event | Signature | When it fires |
|---|---|---|
| `LOAD` | `(outcome)` | Once after page scan and LOAD rules complete |
| `INPUT` | `(target, outcome)` | On every keystroke before value is committed |
| `CHANGE` | `(target, outcome)` | When a field value is committed |
| `CLICK` | `(target, outcome)` | On any click inside a registered element |
| `SAVE` | `(outcome)` | When `SIFA.onSaveEvent()` is called |

```javascript
events: {
    LOAD: (outcome) => {
        console.log('Page loaded', outcome.answers);
    },
    CHANGE: (target, outcome) => {
        console.log('Field changed:', target.sifaRef, '=', target.value);
    },
    SAVE: (outcome) => {
        submitToServer(outcome);
    }
}
```

---

## onSaveEvent

Call `SIFA.onSaveEvent()` manually to trigger SAVE rules, re-run validations, recalculate pricing, and return a subset of the outcome.

```javascript
const result = await SIFA.onSaveEvent(['answers', 'validation', 'cost']);
```

Pass an array of keys — or their aliases — to control what is returned.

| Key | Aliases | Returns |
|---|---|---|
| `answers` | `answer`, `ans` | `outcome.answers` |
| `variables` | `variable`, `var` | `outcome.variables` |
| `validation` | `validate`, `val` | `outcome.validation` |
| `logs` | `log` | `outcome.logs` |
| `mbom` | `bom`, `items` | `outcome.mbom` |
| `unitcost` | `cost` | `outcome.unitcost` |
| `saleprice` | `price`, `sale_price` | `outcome.saleprice` |

```javascript
// Return everything needed for a quote
const quote = await SIFA.onSaveEvent(['ans', 'bom', 'cost', 'price']);

// Return only validation to check before submitting
const check = await SIFA.onSaveEvent(['val']);
```

---

## Custom Actions

Create a `cust.actions.js` file in the same directory. Export functions prefixed with `cust_`. They will be registered on `SIFA.actions` and can be used in rules and conditions just like built-in actions.

```javascript
// cust.actions.js

export function cust_myCustomAction(ref, value) {
    // your logic here
    console.log('Custom action called', ref, value);
}

export function cust_isWeekday() {
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
}
```

Use in rules exactly like built-in actions:

```javascript
true_actions: ['cust_myCustomAction("field_name", "hello")']
condition:    'cust_isWeekday()'
```

---

## Outcome Object

The `SIFA.outcome` object is the central state store. It is passed to all event callbacks and returned by `onSaveEvent`.

```javascript
SIFA.outcome = {
    answers:    {},     // { field_ref: value } — current field values
    variables:  {},     // { key: value } — runtime variables including URL params
    validation: {},     // { ref: { outcome: bool, message: string } }
    logs:       [],     // [{ key, value, timestamp }] — cleared each CHANGE/LOAD
    mbom:       {},     // { sku_line: { sku, description, quantity, unitcost, ... } }
    unitcost:   0.00,   // sum of (mbom item quantity * unitcost)
    saleprice:  0.00    // calculated by price rules
}
```

You can read from `SIFA.outcome` at any time from outside the engine:

```javascript
const name    = SIFA.outcome.answers['field_full_name'];
const isValid = SIFA.outcome.validation['name_required']?.outcome === false;
const cost    = SIFA.outcome.unitcost;
```

---

## Action Reference

Actions are called as strings inside `true_actions`, `false_actions`, and `condition`/`active` fields. Use the `sifa_` prefix for built-in actions and `cust_` for custom ones.

> **Note on chaining:** Most condition-check actions return a result object `{ outcome: true|false, ... }`. When you pass one action's result directly into another, SIFA automatically unwraps the `.outcome` value. See [Nested Outcomes](#nested-outcomes).

---

### Element & Visibility Control

---

#### `sifa_hideElement(ref)`
Hides an element by setting `display: none`. The previous display value is saved internally so `showElement` can restore it.

```javascript
'sifa_hideElement("ele_address_field")'
'sifa_hideElement("group_payment_section")'
```

---

#### `sifa_showElement(ref)`
Shows a previously hidden element, restoring its original display value. Falls back to `block` if the original was not recorded.

```javascript
'sifa_showElement("ele_address_field")'
```

---

#### `sifa_setClass(ref, cls)`
Adds a CSS class to an element.

```javascript
'sifa_setClass("ele_name_field", "error")'
'sifa_setClass("ele_name_field", "highlight")'
```

---

#### `sifa_removeClass(ref, cls)`
Removes a CSS class from an element.

```javascript
'sifa_removeClass("ele_name_field", "error")'
```

---

#### `sifa_toggleClass(ref, cls)`
Toggles a CSS class — adds it if absent, removes it if present.

```javascript
'sifa_toggleClass("ele_name_field", "active")'
```

---

#### `sifa_setAttribute(ref, attr, value)`
Sets an HTML attribute on an element.

```javascript
'sifa_setAttribute("field_age", "min", "18")'
'sifa_setAttribute("field_email", "disabled", "true")'
'sifa_setAttribute("ele_name_field", "data-status", "complete")'
```

---

#### `sifa_removeAttribute(ref, attr)`
Removes an HTML attribute from an element.

```javascript
'sifa_removeAttribute("field_email", "disabled")'
```

---

#### `sifa_setElementText(ref, text)`
Sets the `textContent` of an element. Useful for updating labels, headings, or display-only containers.

```javascript
'sifa_setElementText("ele_title_field", "Shipping Address")'
'sifa_setElementText("ele_summary", sifa_getVariable("summary_text"))'
```

---

### Field Value Control

---

#### `sifa_setValue(ref, value)`
Sets the value of a field and updates `outcome.answers`. Works for text inputs, selects, textareas, and radio groups.

For radio groups, pass the value to select:
```javascript
'sifa_setValue("field_colour", "blue")'
```

For multi-select, pass a comma-separated string or array:
```javascript
'sifa_setValue("field_interests", "tech,music")'
```

For text inputs:
```javascript
'sifa_setValue("field_full_name", "Jane Doe")'
'sifa_setValue("field_age", sifa_getVariable("default_age"))'
```

---

#### `sifa_getValue(ref)`
Returns the current stored answer for a field from `outcome.answers`. Returns `null` if not found.

Primarily used as a value source inside other actions or conditions:
```javascript
condition: 'sifa_isGreaterThan(sifa_getValue("field_age"), 18)'
```

---

#### `sifa_clearValue(ref)`
Clears a single field's value in the DOM and sets its answer to `null` in `outcome.answers`. Works for text inputs, selects, textareas, and radio groups.

```javascript
'sifa_clearValue("field_full_name")'
'sifa_clearValue("field_colour")'
```

---

#### `sifa_clearGroup(ref)`
Clears all inputs, selects, textareas, and contenteditable elements found inside a group container. Also clears their answers from `outcome.answers`.

```javascript
'sifa_clearGroup("group_delivery_section")'
'sifa_clearGroup("group_payment_section")'
```

---

#### `sifa_hideOptions(ref, options)`
Hides specific options in a `<select>` element by value. The options remain in the DOM but are not visible.

```javascript
'sifa_hideOptions("field_country", ["au", "nz"])'
```

---

#### `sifa_showOptions(ref, options)`
Shows previously hidden options in a `<select>` element.

```javascript
'sifa_showOptions("field_country", ["au", "nz"])'
```

---

#### `sifa_addOptions(ref, options)`
Appends new options to a `<select>` element. Each option is an object with `value` and `text`.

```javascript
'sifa_addOptions("field_state", [{"value":"vic","text":"Victoria"},{"value":"nsw","text":"New South Wales"}])'
```

---

#### `sifa_removeOptions(ref, options)`
Removes options from a `<select>` by value array.

```javascript
'sifa_removeOptions("field_country", ["us", "uk"])'
```

---

#### `sifa_resetOptions(ref)`
Restores a `<select>` to its original options as they were when the page was first scanned (stored as `baseOptions`). Also re-applies the current stored answer if one exists.

```javascript
'sifa_resetOptions("field_state")'
```

---

### Condition Checks

These actions return a result object `{ outcome: true|false, ... }` and are primarily used in `condition` and `active` fields. When nested inside other actions, the `.outcome` value is automatically unwrapped.

---

#### `sifa_triggeredField(ref)`
Returns `true` if the field that triggered the current event matches the given ref. Useful in CHANGE rules to only run logic for a specific field.

```javascript
active: 'sifa_triggeredField("field_country")'
```

---

#### `sifa_inputHasValue(ref)`
Returns `true` if the field has a non-empty, non-null value.

```javascript
condition: 'sifa_inputHasValue("field_full_name")'
```

---

#### `sifa_inputIsEmpty(ref)`
Returns `true` if the field is empty, null, or undefined.

```javascript
condition: 'sifa_inputIsEmpty("field_email")'
```

---

#### `sifa_inputIsChecked(ref, value)`
Returns `true` if a specific checkbox or radio option is currently checked.

```javascript
condition: 'sifa_inputIsChecked("field_interests", "tech")'
condition: 'sifa_inputIsChecked("field_colour", "blue")'
```

---

#### `sifa_isGreaterThan(value, threshold)`
Returns `true` if `value > threshold`. Both are coerced to numbers.

```javascript
condition: 'sifa_isGreaterThan(sifa_getValue("field_age"), 18)'
condition: 'sifa_isGreaterThan(10, 5)'
```

---

#### `sifa_isLessThan(value, threshold)`
Returns `true` if `value < threshold`.

```javascript
condition: 'sifa_isLessThan(sifa_getValue("field_qty"), 100)'
```

---

#### `sifa_isEqualTo(value, target)`
Returns `true` if `value === target` (strict, after numeric coercion).

```javascript
condition: 'sifa_isEqualTo(sifa_getValue("field_qty"), 1)'
```

---

#### `sifa_isNotEqualTo(value, target)`
Returns `true` if `value !== target`.

```javascript
condition: 'sifa_isNotEqualTo(sifa_getValue("field_status"), "cancelled")'
```

---

#### `sifa_isGreaterThanOrEqualTo(value, threshold)`
Returns `true` if `value >= threshold`.

```javascript
condition: 'sifa_isGreaterThanOrEqualTo(sifa_getValue("field_age"), 18)'
```

---

#### `sifa_isLessThanOrEqualTo(value, threshold)`
Returns `true` if `value <= threshold`.

```javascript
condition: 'sifa_isLessThanOrEqualTo(sifa_getValue("field_qty"), 10)'
```

---

#### `sifa_isBetween(value, min, max)`
Returns `true` if `min <= value <= max` (inclusive).

```javascript
condition: 'sifa_isBetween(sifa_getValue("field_age"), 18, 65)'
```

---

#### `sifa_isBetweenExclusive(value, min, max)`
Returns `true` if `min < value < max` (exclusive boundaries).

```javascript
condition: 'sifa_isBetweenExclusive(sifa_getValue("field_score"), 0, 100)'
```

---

#### `sifa_answerEquals(ref, value)`
Returns `true` if the stored answer for `ref` equals `value`. For checkbox/array answers, returns `true` if any element matches.

```javascript
condition: 'sifa_answerEquals("field_country", "au")'
condition: 'sifa_answerEquals("field_interests", "tech")'
```

---

#### `sifa_answerContains(ref, value)`
Returns `true` if the stored answer contains the given substring. For array answers, checks if any element contains the substring.

```javascript
condition: 'sifa_answerContains("field_full_name", "Smith")'
```

---

### Variable Control

Variables are stored in `outcome.variables` and persist across events until explicitly cleared. URL query string parameters are automatically added to variables on load.

---

#### `sifa_setVariable(ref, value)`
Sets a variable in `outcome.variables`.

```javascript
'sifa_setVariable("step", 1)'
'sifa_setVariable("user_type", "admin")'
'sifa_setVariable("total", sifa_getValue("field_price"))'
```

---

#### `sifa_getVariable(ref)`
Returns the current value of a variable, or `null` if it does not exist.

Used inside other actions or conditions:
```javascript
condition: 'sifa_isGreaterThan(sifa_getVariable("step"), 2)'
'sifa_setValue("field_region", sifa_getVariable("default_region"))'
```

---

#### `sifa_clearVariable(ref)`
Deletes a variable from `outcome.variables`.

```javascript
'sifa_clearVariable("temp_value")'
```

---

#### `sifa_variableEquals(ref, value)`
Returns `true` if the variable matches the given value. Uses loose equality (`==`).

```javascript
condition: 'sifa_variableEquals("step", 2)'
condition: 'sifa_variableEquals("user_type", "admin")'
```

---

#### `sifa_variableContains(ref, value)`
Returns `true` if the variable (string or array) contains the given value.

```javascript
condition: 'sifa_variableContains("selected_tags", "priority")'
```

---

### Answer Control

---

#### `sifa_setAnswers(answerObject)`
Sets multiple field answers at once and applies them to the DOM. Accepts a key/value object where keys are field refs.

```javascript
'sifa_setAnswers({"field_full_name":"Jane","field_country":"au"})'
```

For checkboxes, pass an array of selected values:
```javascript
'sifa_setAnswers({"field_interests":["tech","music"]})'
```

---

#### `sifa_getAnswers()`
Returns a result object where `.outcome` is the full `outcome.answers` object.

```javascript
condition: 'sifa_getAnswers()'
// result.outcome = { field_full_name: 'Jane', field_country: 'au', ... }
```

---

#### `sifa_copyAnswer(fromRef, toRef)`
Copies the DOM `.value` of one field directly into another field.

```javascript
'sifa_copyAnswer("field_billing_name", "field_delivery_name")'
```

---

#### `sifa_clearAnswers()`
Clears all registered field values in the DOM. Resets text inputs and selects to empty, unchecks all checkboxes and radios.

```javascript
'sifa_clearAnswers()'
```

---

### BOM Control

The Bill of Materials (BOM) stores line items in `outcome.mbom`. Unit cost is automatically calculated from BOM items after every LOAD, CHANGE, and SAVE event.

---

#### `sifa_addBomItem(sku, data)`
Adds an item to the BOM. The `data` object can include any properties; the following are standard.

```javascript
'sifa_addBomItem("SKU-001", {
    "description": "Steel bracket",
    "quantity": 2,
    "unitcost": 4.50,
    "price": 9.00,
    "uom": "each",
    "revision": "A",
    "parent_sku": "ASSEMBLY-01"
})'
```

Items are stored as `outcome.mbom["{sku}_{lineNumber}"]`. Line numbers are assigned automatically.

---

#### `sifa_removeBomItem(key)`
Removes an item from the BOM by its full key (`{sku}_{line}`).

```javascript
'sifa_removeBomItem("SKU-001_1")'
```

---

#### `sifa_updateBomItem(key, data)`
Merges new data into an existing BOM item.

```javascript
'sifa_updateBomItem("SKU-001_1", {"quantity": 4, "unitcost": 3.80})'
```

---

### Price Calculations

Price actions are used in `priceRules` and modify `outcome.saleprice` directly. They are not typically called from regular rule actions.

---

#### `sifa_basePrice(set)`
Sets or adds a base amount to the sale price.

| Property | Type | Description |
|---|---|---|
| `value` | `number` | The price value |
| `type` | `'unit'` \| `'percent'` | `unit` adds a fixed amount; `percent` adds a percentage of current sale price |

```javascript
// Set a flat base price of $100
{ method: 'sifa_basePrice', set: { value: 100, type: 'unit' } }

// Add 10% markup to current sale price
{ method: 'sifa_basePrice', set: { value: 10, type: 'percent' } }
```

---

#### `sifa_discountPrice(set)`
Subtracts from the current sale price.

```javascript
// Subtract $20 flat
{ method: 'sifa_discountPrice', set: { value: 20, type: 'unit' } }

// Apply 15% discount
{ method: 'sifa_discountPrice', set: { value: 15, type: 'percent' } }
```

---

#### `sifa_costPlusPrice(set)`
Adds a margin on top of `outcome.unitcost`.

```javascript
// Cost + 30%
{ method: 'sifa_costPlusPrice', set: { value: 30, type: 'percent' } }

// Cost + flat $50
{ method: 'sifa_costPlusPrice', set: { value: 50, type: 'unit' } }
```

---

### Flow Control

---

#### `sifa_stopRules()`
Sets `engine.state` to `false`, halting all further action and rule processing for the current event. Processing resets to `true` at the start of the next event.

```javascript
true_actions: [
    'sifa_stopRules()'      // no further actions or rules will run
]
```

---

#### `sifa_delayAction(ms)`
Pauses rule processing for the given number of milliseconds before continuing.

```javascript
'sifa_delayAction(500)'     // wait 500ms
'sifa_delayAction(1000)'    // wait 1 second
```

---

#### `sifa_triggerRule(ruleRef)`
Finds a rule by its `ref` across all rule groups and executes it immediately, regardless of event context.

```javascript
'sifa_triggerRule("validate_address")'
'sifa_triggerRule("calculate_totals")'
```

The referenced rule must exist in `SIFA.rules`. If not found, a warning is logged and execution continues.

---

### Logging & Debugging

Logs are stored in `outcome.logs` as `{ key, value, timestamp }` entries. Logs are cleared at the start of each LOAD and CHANGE event.

---

#### `sifa_addLog(key, value)`
Pushes a custom entry into `outcome.logs`.

```javascript
'sifa_addLog("step_reached", {"step": 2, "field": "field_country"})'
```

---

#### `sifa_clearLogs()`
Empties `outcome.logs`.

```javascript
'sifa_clearLogs()'
```

---

#### `sifa_logAnswer(ref)`
Pushes a `logAnswer` entry into `outcome.logs` containing the field ref and its current answer value.

```javascript
'sifa_logAnswer("field_full_name")'
'sifa_logAnswer("field_country")'
```

---

### Casting & Utilities

---

#### `sifa_toNumber(value)`
Converts a value to a number. Returns a result object where `.outcome` is the number, or `null` if not numeric.

```javascript
condition: 'sifa_isGreaterThan(sifa_toNumber(sifa_getValue("field_price")), 100)'
```

---

#### `sifa_toString(value)`
Converts a value to a string. Returns a result object where `.outcome` is the string, or `null` if the input is null.

```javascript
'sifa_setElementText("ele_display", sifa_toString(sifa_getVariable("count")))'
```

---

#### `sifa_isNumber(value)`
Returns `true` if the value can be converted to a valid number.

```javascript
condition: 'sifa_isNumber(sifa_getValue("field_qty"))'
```

---

#### `sifa_length(value)`
Returns the `.length` of a string or array. Returns `null` if the value is empty.

```javascript
condition: 'sifa_isGreaterThan(sifa_length(sifa_getValue("field_notes")), 10)'
```

---

## Nested Outcomes

Most condition-check actions return a result object `{ name, inputs, outcome, timestamp, error }` rather than a raw value. When you pass the result of one action directly into another, SIFA automatically unwraps the `.outcome` property before using it.

This means you can chain actions together without manually extracting values:

```javascript
// sifa_getValue returns the raw answer
// sifa_isGreaterThan receives it and compares
condition: 'sifa_isGreaterThan(sifa_getValue("field_age"), 18)'

// sifa_toNumber returns { outcome: 42, ... }
// sifa_isGreaterThan receives the result object and unwraps .outcome automatically
condition: 'sifa_isGreaterThan(sifa_toNumber("42"), 18)'

// Three levels deep — all unwrap correctly
condition: 'sifa_isGreaterThan(sifa_toNumber(sifa_getValue("field_price")), 100)'
```

---

## Debug Mode

Set `debug: true` in settings to enable engine logging. The following will be logged to the browser console:

- The active event being processed on each engine cycle
- The full SIFA object on the LOAD event
- The return outcome on SAVE events

```javascript
new SifaEngine({
    debug: true,
    rules: [ ... ]
});
```

You can also inspect the full engine state at any time from the browser console:

```javascript
console.log(SIFA.elements);     // all registered elements
console.log(SIFA.outcome);      // current answers, variables, validation, logs, bom
console.log(SIFA.rules);        // current rule configuration
console.log(SIFA.actions);      // all registered action functions
```

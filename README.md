# SIFA — Structured Interactive Form Actions

> A lightweight, rules-based form engine for the browser. Define how your form behaves through configuration — no per-field JavaScript required.

**Author:** Lee W Winter &nbsp;·&nbsp; **Version:** 1.0.0

---

## What is SIFA?

SIFA scans your HTML for targeted form elements, registers them by reference key, then drives all dynamic behaviour — show/hide, set values, validate, calculate pricing — through a JSON-configurable rule system.

Instead of writing `document.getElementById` and event listeners for every field, you describe *what should happen and when* in a rules array. SIFA handles the rest.

```
Field changes → Event fires → Rules evaluate → Actions run → Validations update → Your callback receives outcome
```

## Demos

[Pizza Builder](https://lwinter.tech/devproj/sifa/demos/pizza.html)

---

## Features

- **Zero DOM queries at runtime** — all elements are pre-registered on load
- **Rule groups** with priority ordering and enable/disable toggling
- **Five events** — `LOAD`, `INPUT`, `CHANGE`, `CLICK`, `SAVE`
- **40+ built-in actions** — visibility, field values, conditions, variables, logging, flow control, casting
- **Validation rules** — condition-based pass/fail messages written to a central state object
- **BOM & pricing engine** — bill of materials with automatic unit cost calculation and configurable price rules
- **Custom actions** — drop a `cust.actions.js` file alongside the engine to extend with your own functions
- **URL parameter ingestion** — query string values are automatically available as variables on load
- **Debug mode** — structured console output at every processing step
- **No dependencies** — pure vanilla JavaScript ES modules, no build step required

---

## File Structure

```
your-project/
├── sifa.engine.js      ← Core engine  (required)
├── sifa.actions.js     ← Built-in actions  (required)
└── cust.actions.js     ← Your custom actions  (optional)
```

All three files must live in the same directory. The engine uses ES module dynamic imports so your page must be served over HTTP — `file://` will not work.

---

## Quick Start

[Documentation](https://localhost:441/devproj/sifa/docs/)

### 1. Mark up your HTML

Wrap each field in a container element with the class `sifa-input`. Use `sifa-group` (or semantic elements like `<section>`, `<fieldset>`) for collapsible areas.

```html
<div class="sifa-input" id="name-field">
    <label for="full_name">Full Name</label>
    <input type="text" id="full_name" name="full_name" />
</div>

<div class="sifa-input" id="colour-field">
    <label><input type="radio" name="colour" value="red"  /> Red</label>
    <label><input type="radio" name="colour" value="blue" /> Blue</label>
</div>

<section id="delivery-section">
    <!-- Scanned automatically as group_delivery_section -->
</section>
```

### 2. Import and initialise

```html
<script type="module">
    import { SifaEngine } from './sifa.engine.js';

    new SifaEngine({
        rules: [
            {
                event:  'CHANGE',
                enable: true,
                rules: [
                    {
                        ref:           'show_delivery',
                        enable:        true,
                        priority:      0,
                        active:        'sifa_triggeredField("field_shipping_method")',
                        condition:     'sifa_answerEquals("field_shipping_method", "deliver")',
                        true_actions:  ['sifa_showElement("group_delivery_section")'],
                        false_actions: ['sifa_hideElement("group_delivery_section")']
                    }
                ]
            }
        ]
    });
</script>
```

### 3. React to events and save

```javascript
new SifaEngine({
    events: {
        CHANGE: (target, outcome) => {
            console.log(target.sifaRef, '=', outcome.answers[target.sifaRef]);
        }
    }
});

// Later — trigger save and get a subset of outcome
const result = await SIFA.onSaveEvent(['answers', 'validation', 'cost']);
```

---

## Initialisation Options

All options are optional. SIFA works with an empty config object.

```javascript
new SifaEngine({
    targetElement:   'sifa-input',      // CSS class of field container elements
    targetGroup:     'sifa-group',      // CSS class of group container elements
    debug:           false,             // enables structured console logging
    rules:           [ ...groups ],     // rule group array
    validationRules: [ ...validations ],// validation rule array
    priceRules:      [ ...pricing ],    // price rule array
    variables:       { key: 'value' },  // pre-set variables
    answers:         { field_name: '' },// pre-fill field answers on load
    events: {
        LOAD:   (outcome) => {},
        INPUT:  (target, outcome) => {},
        CHANGE: (target, outcome) => {},
        CLICK:  (target, outcome) => {},
        SAVE:   (outcome) => {}
    }
});
```

---

## How Element References Work

SIFA generates a unique reference key for every registered element. Keys are **slugified** — spaces and hyphens become underscores, all lowercase.

| Element | Key format | Example |
|---|---|---|
| `.sifa-input` container | `ele_{id}` | `ele_name_field` |
| Text / number / email input | `field_{name\|id}` | `field_full_name` |
| Select | `field_{name\|id}` | `field_country` |
| Textarea | `field_{name\|id}` | `field_notes` |
| Radio group | `field_{name}` | `field_colour` |
| Checkbox group | `field_{name}` | `field_interests` |
| Label | `label_{for\|id}` | `label_full_name` |
| Button | `button_{id\|name}` | `button_submit` |
| Group container | `group_{id}` | `group_delivery_section` |

Override the auto-generated key with a `data-tag` attribute:

```html
<div class="sifa-input" data-tag="my_custom_ref">
    <input type="text" name="phone" />
</div>
<!-- registered as ele_my_custom_ref -->
```

---

## Rules

Rules are grouped by event. Each group can be enabled or disabled as a unit. Within a group, rules run in `priority` order (lowest number first).

### Rule Group

```javascript
{
    event:  'CHANGE',   // LOAD | INPUT | CHANGE | CLICK | SAVE | ALL
    enable: true,
    rules:  [ ...ruleObjects ]
}
```

### Rule Object

```javascript
{
    ref:           'unique_rule_id',                          // used by triggerRule()
    enable:        true,                                      // false skips, group continues
    priority:      0,                                         // execution order within group
    active:        'sifa_triggeredField("field_country")',    // gate condition — skip if false
    condition:     'sifa_answerEquals("field_country", "au")',// main condition
    true_actions:  ['sifa_showElement("group_au_fields")'],
    false_actions: ['sifa_hideElement("group_au_fields")']
}
```

### Rule Execution Flow

```
engine.state reset → group filtered by event → sorted by priority
  └─ For each rule:
       active == false?  → skip rule, continue group
       condition == true? → run true_actions
       condition == false? → run false_actions
       action returns false or stopRules() called? → halt all processing
```

### Chaining Action Results

Condition checks return a result object `{ outcome: true|false, ... }`. When passed into another action, SIFA automatically unwraps `.outcome` — so you can chain freely:

```javascript
// getValue returns the raw answer value
// isGreaterThan receives it and compares
condition: 'sifa_isGreaterThan(sifa_getValue("field_age"), 18)'

// Three levels — all unwrap correctly
condition: 'sifa_isGreaterThan(sifa_toNumber(sifa_getValue("field_price")), 100)'
```

---

## Validation Rules

Validations run after actions on every event. Results are written to `SIFA.outcome.validation`.

```javascript
validationRules: [
    {
        ref:           'name_required',
        enable:        true,
        condition:     'sifa_inputIsEmpty("field_full_name")',
        true_message:  'Full name is required',
        false_message: ''
    }
]
```

Results are keyed by `ref`:

```javascript
SIFA.outcome.validation['name_required']
// { outcome: true, message: 'Full name is required' }
```

---

## Price Rules

Price rules calculate `outcome.saleprice` from `outcome.unitcost` (summed from BOM items). They run on LOAD, CHANGE, and SAVE.

```javascript
priceRules: [
    {
        enable:    true,
        condition: 'true',
        method:    'sifa_costPlusPrice',
        set:       { value: 30, type: 'percent' }   // cost + 30%
    },
    {
        enable:    true,
        condition: 'sifa_answerEquals("field_promo", "SAVE10")',
        method:    'sifa_discountPrice',
        set:       { value: 10, type: 'percent' }   // 10% discount
    }
]
```

---

## onSaveEvent

Call `SIFA.onSaveEvent()` to trigger SAVE rules, re-run validations, recalculate pricing, and return a subset of outcome.

```javascript
const result = await SIFA.onSaveEvent(['answers', 'val', 'cost', 'price']);
```

| Key | Aliases |
|---|---|
| `answers` | `answer`, `ans` |
| `variables` | `variable`, `var` |
| `validation` | `validate`, `val` |
| `logs` | `log` |
| `mbom` | `bom`, `items` |
| `unitcost` | `cost` |
| `saleprice` | `price`, `sale_price` |

---

## Custom Actions

Create `cust.actions.js` in the same directory. Export functions with the `cust_` prefix. They are registered automatically and can be used in any rule string.

```javascript
// cust.actions.js

export function cust_isWeekday() {
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
}

export function cust_formatCurrency(value) {
    return '$' + Number(value).toFixed(2);
}
```

```javascript
// Used in rules exactly like built-in actions
condition:    'cust_isWeekday()'
true_actions: ['sifa_setElementText("ele_price", cust_formatCurrency(sifa_getVariable("total")))']
```

---

## Built-in Actions

### Element & Visibility

| Action | Description |
|---|---|
| `sifa_hideElement(ref)` | Sets `display:none`, saves previous display value |
| `sifa_showElement(ref)` | Restores previous display, falls back to `block` |
| `sifa_setClass(ref, cls)` | Adds a CSS class |
| `sifa_removeClass(ref, cls)` | Removes a CSS class |
| `sifa_toggleClass(ref, cls)` | Toggles a CSS class |
| `sifa_setAttribute(ref, attr, value)` | Sets an HTML attribute |
| `sifa_removeAttribute(ref, attr)` | Removes an HTML attribute |
| `sifa_setElementText(ref, text)` | Sets `textContent` of any element |

### Field Values

| Action | Description |
|---|---|
| `sifa_setValue(ref, value)` | Sets a field value and updates `outcome.answers` |
| `sifa_getValue(ref)` | Returns the stored answer for a field |
| `sifa_clearValue(ref)` | Clears a single field and nulls its answer |
| `sifa_clearGroup(ref)` | Clears all inputs inside a group container |
| `sifa_hideOptions(ref, [values])` | Hides select options by value array |
| `sifa_showOptions(ref, [values])` | Shows previously hidden select options |
| `sifa_addOptions(ref, [{value, text}])` | Appends options to a select |
| `sifa_removeOptions(ref, [values])` | Removes options from a select by value |
| `sifa_resetOptions(ref)` | Restores select to its original scanned options |

### Condition Checks

These return `{ outcome: true|false }` and are used in `condition` and `active` fields.

| Action | Description |
|---|---|
| `sifa_triggeredField(ref)` | True if the event-triggering field matches ref |
| `sifa_inputHasValue(ref)` | True if field has a non-empty value |
| `sifa_inputIsEmpty(ref)` | True if field is blank or null |
| `sifa_inputIsChecked(ref, value)` | True if a specific radio/checkbox option is checked |
| `sifa_isGreaterThan(value, threshold)` | `value > threshold` |
| `sifa_isLessThan(value, threshold)` | `value < threshold` |
| `sifa_isEqualTo(value, target)` | `value === target` |
| `sifa_isNotEqualTo(value, target)` | `value !== target` |
| `sifa_isGreaterThanOrEqualTo(value, threshold)` | `value >= threshold` |
| `sifa_isLessThanOrEqualTo(value, threshold)` | `value <= threshold` |
| `sifa_isBetween(value, min, max)` | `min <= value <= max` (inclusive) |
| `sifa_isBetweenExclusive(value, min, max)` | `min < value < max` (exclusive) |
| `sifa_answerEquals(ref, value)` | True if stored answer equals value |
| `sifa_answerContains(ref, value)` | True if stored answer contains substring |

### Variables

| Action | Description |
|---|---|
| `sifa_setVariable(ref, value)` | Stores a value in `outcome.variables` |
| `sifa_getVariable(ref)` | Returns a variable value or null |
| `sifa_clearVariable(ref)` | Deletes a variable |
| `sifa_variableEquals(ref, value)` | True if variable loosely equals value |
| `sifa_variableContains(ref, value)` | True if variable contains substring |

### Answers

| Action | Description |
|---|---|
| `sifa_setAnswers({ field: value })` | Sets multiple answers and applies to DOM |
| `sifa_getAnswers()` | Returns `{ outcome: answersObject }` |
| `sifa_copyAnswer(fromRef, toRef)` | Copies one field's value to another |
| `sifa_clearAnswers()` | Resets all registered fields in the DOM |

### BOM

| Action | Description |
|---|---|
| `sifa_addBomItem(sku, data)` | Adds a line item to `outcome.mbom` |
| `sifa_removeBomItem(key)` | Removes a BOM item by key (`sku_line`) |
| `sifa_updateBomItem(key, data)` | Merges data into an existing BOM item |

### Price Calculations

Used as `method` in `priceRules`. Each accepts `{ value, type }` where `type` is `'unit'` or `'percent'`.

| Action | Description |
|---|---|
| `sifa_basePrice(set)` | Adds a base amount to `outcome.saleprice` |
| `sifa_discountPrice(set)` | Subtracts from `outcome.saleprice` |
| `sifa_costPlusPrice(set)` | Adds a margin on top of `outcome.unitcost` |

### Flow Control

| Action | Description |
|---|---|
| `sifa_stopRules()` | Halts all further rule and action processing for the current event |
| `sifa_delayAction(ms)` | Pauses processing for the given milliseconds |
| `sifa_triggerRule(ref)` | Finds and executes a named rule by its `ref` |

### Logging

| Action | Description |
|---|---|
| `sifa_addLog(key, value)` | Pushes a timestamped entry to `outcome.logs` |
| `sifa_clearLogs()` | Empties `outcome.logs` |
| `sifa_logAnswer(ref)` | Logs the current stored answer for a field |

### Casting & Utilities

| Action | Description |
|---|---|
| `sifa_toNumber(value)` | Converts to number, returns `null` if not numeric |
| `sifa_toString(value)` | Converts to string |
| `sifa_isNumber(value)` | True if value is numeric |
| `sifa_length(value)` | Returns `.length` of string or array |

---

## The Outcome Object

`SIFA.outcome` is the central state store. It is passed to all event callbacks and returned by `onSaveEvent`.

```javascript
SIFA.outcome = {
    answers:    {},     // { field_ref: value } — current committed field values
    variables:  {},     // { key: value } — runtime variables + URL params
    validation: {},     // { ref: { outcome: bool, message: string } }
    logs:       [],     // [{ key, value, timestamp }] — cleared on LOAD and CHANGE
    mbom:       {},     // { sku_line: { sku, description, quantity, unitcost, ... } }
    unitcost:   0.00,   // auto-calculated from mbom item quantities × unitcost
    saleprice:  0.00    // calculated by priceRules
}
```

You can read from it at any time:

```javascript
const name     = SIFA.outcome.answers['field_full_name'];
const isValid  = SIFA.outcome.validation['name_required']?.outcome === false;
const cost     = SIFA.outcome.unitcost;
const elements = SIFA.elements;   // all registered DOM references
```

---

## Debug Mode

Set `debug: true` to log engine activity to the browser console.

```javascript
new SifaEngine({ debug: true });
```

You can also inspect state directly from the console at any time:

```javascript
SIFA.elements       // all registered element references
SIFA.outcome        // current answers, variables, validation, logs, bom, pricing
SIFA.rules          // active rule configuration
SIFA.actions        // all registered action functions (sifa_ and cust_)
SIFA.engine.state   // current processing state (true = running, false = stopped)
```

---

## Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>SIFA Example</title></head>
<body>

<div class="sifa-input" id="shipping-field">
    <label for="shipping">Shipping Method</label>
    <select id="shipping" name="shipping">
        <option value="">Select...</option>
        <option value="pickup">Click & Collect</option>
        <option value="deliver">Home Delivery</option>
    </select>
</div>

<section id="delivery-address">
    <div class="sifa-input" id="address-field">
        <label for="address">Delivery Address</label>
        <input type="text" id="address" name="address" />
    </div>
</section>

<button id="save-btn">Submit Order</button>

<script type="module">
import { SifaEngine } from './sifa.engine.js';

new SifaEngine({
    debug: false,

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
                    true_actions: ['sifa_hideElement("group_delivery_address")'],
                    false_actions: []
                }
            ]
        },
        {
            event: 'CHANGE',
            enable: true,
            rules: [
                {
                    ref: 'toggle_delivery_address',
                    enable: true,
                    priority: 0,
                    active: 'sifa_triggeredField("field_shipping")',
                    condition: 'sifa_answerEquals("field_shipping", "deliver")',
                    true_actions: ['sifa_showElement("group_delivery_address")'],
                    false_actions: [
                        'sifa_hideElement("group_delivery_address")',
                        'sifa_clearGroup("group_delivery_address")'
                    ]
                }
            ]
        }
    ],

    validationRules: [
        {
            ref: 'address_required',
            enable: true,
            condition: 'sifa_answerEquals("field_shipping", "deliver") && sifa_inputIsEmpty("field_address")',
            true_message:  'Please enter a delivery address',
            false_message: ''
        }
    ],

    events: {
        LOAD: (outcome) => {
            console.log('Form ready', outcome);
        },
        CHANGE: (target, outcome) => {
            console.log(target.sifaRef, '→', outcome.answers[target.sifaRef]);
        }
    }
});

document.getElementById('save-btn').addEventListener('click', async () => {
    const result = await SIFA.onSaveEvent(['answers', 'validation']);
    const hasErrors = Object.values(result.validation).some(v => v.outcome === true);
    if (hasErrors) {
        console.warn('Validation failed', result.validation);
    } else {
        console.log('Submitting', result.answers);
    }
});
</script>
</body>
</html>
```
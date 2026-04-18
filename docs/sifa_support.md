# Structured Interactive Form Actions
## Overview

**Author:** Lee W Winter  
**Version:** 1.0.0  
**Files:** `sifa.engine.js` · `sifa.actions.js` · `cust.actions.js` *(optional)*

SIFA is a lightweight, rules-based form engine. It scans your HTML for targeted elements and inputs, then drives dynamic behaviour through a configurable set of rule groups, actions, and validations — all without requiring you to write per-field JavaScript.


### File Structure

```
sifa/
├── sifa.engine.js       # Core engine — required
├── sifa.actions.js      # Built-in actions — required
└── cust.actions.js      # Your custom actions — optional
```

All three files must be served from the same directory. The engine imports them using ES module dynamic imports, so the page must be served over HTTP (not `file://`).

## Initialisation SIFA
Import the engine and create a new instance. Pass your configuration object to the constructor.

```html
<html>
    <head></head>
    <body>
        <form></form>
        <script type="module">

            import SifaEngine from './sifa.engine.js';
            new SifaEngine({/* configuration */});

        </script>
    </body>
</html>
```

### Configuration Properties
These are the properties that you can pass in when initializing the SIFA engine.

| Property | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enables console logging throughout the engine |
| `rules` | `array` | `[]` | Array of rule group objects |
| `validationRules` | `array` | `[]` | Array of validation rule objects |
| `priceRules` | `array` | `undefined` | Array of price rule objects |
| `variables` | `object` | `{}` | Initial variables merged into `outcome.variables` |
| `answers` | `object` | `{}` | Initial answers pre-applied to fields on load |
| `events` | `object` | `{}` | Callback functions for each engine event |


### Global Variable
The SIFA engine stores its configuration and values in a global variable that Javascript can access via SIFA at anytime and you can custom code to intergrate with this object.
```javascript
// Call object
console.log(SIFA);

// Response
SIFA.{
    "engine": { "state": true },
    "settings": {
        "targetInput": ".sifa-input",
        "targetGroup": ".sifa-group",
        "targetElement": ".sifa-element",
        "targetValidation": "#sifa-validation",
        "revID": 2264558227372500,
        "debug": false,
        "editMode": true
    },
    "elements": {},
    "triggerInput": {},
    "rules": [],
    "actions": {},
    "outcome": {
        "logs": [],
        "variables": {},
        "answers": {},
        "validation": {},
        "mbom": {},
        "unitcost": 0,
        "saleprice": 0
    },
    "validationRules": []
}
```
### URL Variables

When the page url passes parameters SIFA will auto pull and store these as variables so they can be used as part of the rulesets.
```javascript
URL: https://website/index.html?page=1&fid=89411445681

SIFA.outcome.variables = {
    'page': 1,
    'fid': 89411445681
}
```
### Outcome Object

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
### Events

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

## Elements, Fields and Buttons
These are SIFA selectors to find elements inside your form.

| Key | Default Value | Purpose |
|---|---|---|
| targetElement | .sifa-element | Elements with this class will become a targetable element |
| targetGroup | .sifa-group | Containers with this class will become a targetable group |
| targetInput | .sifa-input | Elements with this class will be scanned for input, select, textarea, label and button |
| targetValidation | #sifa-validation | The element with this ID will auto populate with validation messages |

It is also possible to pass customer classes and IDs into these properties

```javascript
new SifaEngine({
    targetElement:".custom-ele-selector"
});
```

### Element Auto Tagging
SIFA auto generates reference keys from the scanned element, the key is prioritiesed based on `id`, `name`, `dataset.tag` attributes, if non of these are found it will auto assign an index number based on its scanned order

#### ID Key Reference
```html
<div class="sifa-input">
    <input type="text" name="phone" id="my_custom_ref" />
</div>
// SIFA.elements.field_my_custom_ref
```

#### Name Key Reference
```html
<div class="sifa-input">
    <input type="text" name="phone"  />
</div>
// SIFA.elements.field_phone
```

#### Data Key Reference
```html
<div class="sifa-input">
    <input type="text" data-tag="phone_input"  />
</div>
// SIFA.elements.field_phone_input
```

#### Index Key Reference
```html
<div class="sifa-input">
    <input type="text"  />
</div>
// SIFA.elements.field_1
```

### How Elements Are Referenced

When you are using the elements in a condition or an rule action, they will most likly be called using an action, somthing like `sifa_getValue(ref)`<br/>
When you see ref in the action its expecting a string that matches the Key reference it was assigned when scanned on load.

`sifa_getValue('field_phone')`

## Rulesets
Rules are organised into **groups** called **Rulesets**. Each Rulesets targets one event and contains an ordered array of rules.

```
{
    event:  'LOAD',   // LOAD | CHANGE | CLICK | SAVE | ALL | SLEEP
    enable: true,
    priority: 0,
    desc: 'Hide all sections on load',
    rules: [ ...rules ]
}
```
- Events are assigned by SIFA and triggered by the users interaction with their form.
    - **LOAD:** This will be triggered once SIFA has finished pre processing.
    - **CHANGE:** is attached to all inputs as a change event.
    - **CLICK:** is attached to all buttons as a click event.
    - **SAVE:** is not directly attached to anything, but is available for you to trigger on form save or submit.
    - **ALL:** will tell this Ruleset to run on all events.
    - **SLEEP** this ruleset will never run on its own and can contain rules that are triggered by another rule.
- Enable is a boolean true or false, a way to turn a Ruleset on or off. Usefull when developing or debugging.
- Priority allows you to sort your Rulesets since the order of sequence will matter on if some information is avaiable to the next rule.
- Desc is a text field for you as the admin to be able to note what this rulesets purpose is for.

### Rules
Rules are based on conditions and possible outcomes, it allows you to set actions if the condition is true or false.

```
{
    ref:           'my_rule_ref',    
    priority:      0,                          
    enable:        true,                                                    
    active:        'true',                                  
    condition:     'sifa_inputHasValue("field_full_name")',
    true_actions:  [                                        
        'sifa_showElement("ele_address_field")'
    ],
    false_actions: [
        'sifa_hideElement("ele_address_field")'
    ]
}
```
- Ref is a unique spaceless string that is used to uniquely identify a rule. This can be used to trigger the rule from another rule.
- Priority allows you to sort your Rules execution order.
- Enable is a boolean true or false, a way to turn a rule on or off. Usefull when developing or debugging.
- Active is both a boolean true or false but also a target condition that will only let this Rule run if true. <br/> A good example is `sifa_triggeredField('field_phone')` which will only run if the field that triggered the change was the phone number field. <br/>
You can also string conditions with `||` for OR and `&&` for AND.<br/> 
If set to true it will always try to run. Notice this is a string true not a boolean.
- Condition is the state which determins if the true or false actions will be ran. <br/> The example is saying if the full_name field is not empty and has a value then run true actions else run false actions.
- True and False actions are an array of rules that run sequencialy. <br/>Actions can be chained together like `sifa_setValue('field_phone', sifa_getVariable('company_num'))`


## Validation Rules

Validations run after actions on LOAD, CHANGE, CLICK, and SAVE events. They write pass/fail messages into `SIFA.outcome.validation` keyed by `ref`.<br/>
If you set the SIFA.settings.targetValidation selector these messages will be listed out inside that element.<br/>
If you leave blank the validation will still happen but it will only be inside the SIFA object. You could display these values yourself on the SAVE event.

### Validation Object Structure

```
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

```
SIFA.outcome.validation = {
    'name_required':{ outcome: true, message: 'Full name is required' }
}
```

## Price Rules

Price rules calculate the final sales price and stores the number under `SIFA.outcome.saleprice`.<br/>
It is possible to use variables to store different sub prices such as Taxes, Shipping, Extras. This was built to handle the final sales price.

```
{
    enable:    true,
    condition: 'sifa_variableEquals("region", "au")',
    method:    'sifa_costPlusPrice',                     // the pricing action to apply
    set: {
        value: 20,
        type: 'percent'
    }
}
```

## onSaveEvent

Call `SIFA.onSaveEvent()` manually to trigger SAVE rules, re-run validations, recalculate pricing, and return a subset of the outcome.

```
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


## Action Reference

Actions are called as strings inside `true_actions`, `false_actions`, and `condition`/`active` fields. Use the `sifa_` prefix for built-in actions and `cust_` for custom ones.

> **Note on chaining:** Most condition-check actions return a result object `{ outcome: true|false, ... }`. When you pass one action's result directly into another, SIFA automatically unwraps the `.outcome` value. See [Nested Outcomes](#nested-outcomes).

---

### Element & Visibility Control

---

#### `sifa_hideElement(ref)`
Hides an element by changing the display style to none. <br/>
It stores the current display value so it can be returned to the same state. <br/>
The action requires an element reference from `SIFA.elements` <br/>
The function returns `true` if successful and `false` if there are any errors.

```
'sifa_hideElement("ele_elementref")'
```

#### `sifa_showElement(ref)`
Shows a hidden element by setting display value to what it was before it was hidden or block by default. <br/>
The action requires an element reference from `SIFA.elements` <br/>
The function returns `true` if successful and `false` if there are any errors.

```
'sifa_showElement("ele_elementref")'
```

#### `sifa_setClass(ref, class)`
Appends a class to the element. <br/>
The action requires an element reference from `SIFA.elements` and the name of the class.  <br/>
The function returns `true` if successful and `false` if there are any errors.

```
'sifa_setClass("ele_elementref", "class_name")'
```

#### `sifa_removeClass(ref, class)`
Targets and removes a class from an element. <br/>
The action requires an element reference from `SIFA.elements` and the name of the class.  <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_removeClass("ele_elementref", "class_name")'
```

#### `sifa_toggleClass(ref, class)`
Toggles a class on an element adds and removes each time its called. <br/>
The action requires an element reference from `SIFA.elements` and the name of the class.  <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_toggleClass("ele_elementref", "class_name")'
```

#### `sifa_setAttribute(ref, attribute_name, attribute_value)`
Sets an elements attribute value. <br/>
The action requires an element reference from `SIFA.elements`, The attribute name and value. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_setAttribute("ele_elementref", "attribute_name", "attribute_value")'
```

#### `sifa_removeAttribute(ref, attribute_name)`
Removes an elements attribute value. <br/>
The action requires an element reference from `SIFA.elements`, The attribute name. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_removeAttribute("ele_elementref", "attribute_name")'
```

#### `sifa_setElementText(ref, text)`
Sets the inner content of an element. <br/>
If the content contains html it will add as html and not straight text. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_setElementText("ele_elementref", "text_string")'
```


### Field Value Control
---

#### `sifa_setValue(ref, value)`
Sets the value of a field and updates `outcome.answers`. <br/>
If the field type is a `checkbox` or `select-multiple` an array of values can be used. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
// select, text, radio, number, textarea
'sifa_setValue("field_elementref", "blue")'

// radio, select-multiple
'sifa_setValue("field_elementref", ["blue", "red"])'
OR
'sifa_setValue("field_elementref", "blue,red")'
```

#### `sifa_getValue(ref)`
Returns the current stored answer for a field from `outcome.answers`. <br/>
Returns `null` if not found.
```
'sifa_getValue("field_elementref")'
```

#### `sifa_clearValue(ref)`
Clears the field and sets the `outcome.answer` value to `null`. <br/>
The action requires a field reference from `SIFA.elements`. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_clearValue("field_elementref")'
```

#### `sifa_clearGroup(ref)`
Clear all fields inside a specified element. <br/>
This also clears the answers stored in `outcome.answers`. <br/>
The action requires a field reference from `SIFA.elements`. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_clearGroup("ele_elementref")'
```

#### `sifa_hideOptions(ref, options)`
Hides specific options in a `<select>` element by value. 
The action requires a field reference from `SIFA.elements`. <br/>
To target the options pass the option values as an array. <br/>
The options remain in the DOM but are not visible. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_hideOptions("ele_elementref", ["val1", "val2"])'
```

#### `sifa_showOptions(ref, options)`
Shows previously hidden options in a `<select>` element.
The action requires a field reference from `SIFA.elements`. <br/>
To target the options pass the option values as an array. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_showOptions("ele_elementref", ["val1", "val2"])'
```

#### `sifa_addOptions(ref, options)`
Appends new options to a `<select>` element. <br/>
Each option is an object with `value` and `text`. <br/>
The action requires a field reference from `SIFA.elements`. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_addOptions("ele_elementref", [{"value":"val3","text":"Value 3"}])'
```

#### `sifa_removeOptions(ref, options)`
Removes options from a `<select>` element. <br/>
The action requires a field reference from `SIFA.elements`. <br/>
To target the options pass the option values as an array. <br/>
This will completely remove the option not just hide it. <br/>
The function returns `true` if successful and `false` if there are any errors.
```
'sifa_removeOptions("ele_elementref", ["val1", "val2"])'
```

### Condition Checks

These actions return a result object `{ outcome: true|false, ... }` and are primarily used in `condition` and `active` fields. When nested inside other actions, the `.outcome` value is automatically unwrapped.

---

#### `sifa_triggeredField(ref)`
Returns `true` if the field that triggered the current event matches the given ref. Useful in CHANGE rules to only run logic for a specific field.

```
active: 'sifa_triggeredField("field_country")'
```

---

#### `sifa_inputHasValue(ref)`
Returns `true` if the field has a non-empty, non-null value.

```
condition: 'sifa_inputHasValue("field_full_name")'
```

---

#### `sifa_inputIsEmpty(ref)`
Returns `true` if the field is empty, null, or undefined.

```
condition: 'sifa_inputIsEmpty("field_email")'
```

---

#### `sifa_inputIsChecked(ref, value)`
Returns `true` if a specific checkbox or radio option is currently checked.

```
condition: 'sifa_inputIsChecked("field_interests", "tech")'
condition: 'sifa_inputIsChecked("field_colour", "blue")'
```

---

#### `sifa_isGreaterThan(value, threshold)`
Returns `true` if `value > threshold`. Both are coerced to numbers.

```
condition: 'sifa_isGreaterThan(sifa_getValue("field_age"), 18)'
condition: 'sifa_isGreaterThan(10, 5)'
```

---

#### `sifa_isLessThan(value, threshold)`
Returns `true` if `value < threshold`.

```
condition: 'sifa_isLessThan(sifa_getValue("field_qty"), 100)'
```

---

#### `sifa_isEqualTo(value, target)`
Returns `true` if `value === target` (strict, after numeric coercion).

```
condition: 'sifa_isEqualTo(sifa_getValue("field_qty"), 1)'
```

---

#### `sifa_isNotEqualTo(value, target)`
Returns `true` if `value !== target`.

```
condition: 'sifa_isNotEqualTo(sifa_getValue("field_status"), "cancelled")'
```

---

#### `sifa_isGreaterThanOrEqualTo(value, threshold)`
Returns `true` if `value >= threshold`.

```
condition: 'sifa_isGreaterThanOrEqualTo(sifa_getValue("field_age"), 18)'
```

---

#### `sifa_isLessThanOrEqualTo(value, threshold)`
Returns `true` if `value <= threshold`.

```
condition: 'sifa_isLessThanOrEqualTo(sifa_getValue("field_qty"), 10)'
```

---

#### `sifa_isBetween(value, min, max)`
Returns `true` if `min <= value <= max` (inclusive).

```
condition: 'sifa_isBetween(sifa_getValue("field_age"), 18, 65)'
```

---

#### `sifa_isBetweenExclusive(value, min, max)`
Returns `true` if `min < value < max` (exclusive boundaries).

```
condition: 'sifa_isBetweenExclusive(sifa_getValue("field_score"), 0, 100)'
```

---

#### `sifa_answerEquals(ref, value)`
Returns `true` if the stored answer for `ref` equals `value`. For checkbox/array answers, returns `true` if any element matches.

```
condition: 'sifa_answerEquals("field_country", "au")'
condition: 'sifa_answerEquals("field_interests", "tech")'
```

---

#### `sifa_answerContains(ref, value)`
Returns `true` if the stored answer contains the given substring. For array answers, checks if any element contains the substring.

```
condition: 'sifa_answerContains("field_full_name", "Smith")'
```

---

### Variable Control

Variables are stored in `outcome.variables` and persist across events until explicitly cleared. URL query string parameters are automatically added to variables on load.

---

#### `sifa_setVariable(ref, value)`
Sets a variable in `outcome.variables`.

```
'sifa_setVariable("step", 1)'
'sifa_setVariable("user_type", "admin")'
'sifa_setVariable("total", sifa_getValue("field_price"))'
```

---

#### `sifa_getVariable(ref)`
Returns the current value of a variable, or `null` if it does not exist.

Used inside other actions or conditions:
```
condition: 'sifa_isGreaterThan(sifa_getVariable("step"), 2)'
'sifa_setValue("field_region", sifa_getVariable("default_region"))'
```

---

#### `sifa_clearVariable(ref)`
Deletes a variable from `outcome.variables`.

```
'sifa_clearVariable("temp_value")'
```

---

#### `sifa_variableEquals(ref, value)`
Returns `true` if the variable matches the given value. Uses loose equality (`==`).

```
condition: 'sifa_variableEquals("step", 2)'
condition: 'sifa_variableEquals("user_type", "admin")'
```

---

#### `sifa_variableContains(ref, value)`
Returns `true` if the variable (string or array) contains the given value.

```
condition: 'sifa_variableContains("selected_tags", "priority")'
```

---

### Answer Control

---

#### `sifa_setAnswers(answerObject)`
Sets multiple field answers at once and applies them to the DOM. Accepts a key/value object where keys are field refs.

```
'sifa_setAnswers({"field_full_name":"Jane","field_country":"au"})'
```

For checkboxes, pass an array of selected values:
```
'sifa_setAnswers({"field_interests":["tech","music"]})'
```

---

#### `sifa_getAnswers()`
Returns a result object where `.outcome` is the full `outcome.answers` object.

```
condition: 'sifa_getAnswers()'
// result.outcome = { field_full_name: 'Jane', field_country: 'au', ... }
```

---

#### `sifa_copyAnswer(fromRef, toRef)`
Copies the DOM `.value` of one field directly into another field.

```
'sifa_copyAnswer("field_billing_name", "field_delivery_name")'
```

---

#### `sifa_clearAnswers()`
Clears all registered field values in the DOM. Resets text inputs and selects to empty, unchecks all checkboxes and radios.

```
'sifa_clearAnswers()'
```

---

### BOM Control

The Bill of Materials (BOM) stores line items in `outcome.mbom`. Unit cost is automatically calculated from BOM items after every LOAD, CHANGE, and SAVE event.

---

#### `sifa_addBomItem(sku, data)`
Adds an item to the BOM. The `data` object can include any properties; the following are standard.

```
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

```
'sifa_removeBomItem("SKU-001_1")'
```

---

#### `sifa_updateBomItem(key, data)`
Merges new data into an existing BOM item.

```
'sifa_updateBomItem("SKU-001_1", {"quantity": 4, "unitcost": 3.80})'
```

---

### Price Calculations
The price ledger is a named collection of price lines stored in SIFA.outcome.priceLedger. Each line contributes a signed amount to the final price. Lines can be enabled or disabled at any time through rule actions — the engine recalculates automatically on every change event.

```
SIFA.outcome.priceLedger:{
    lines:{
        { label: '', type:'', amount:0.00, method:'unit | percent', enabled: true|false}
    },
    unitcost: 0,
    subtotal:0,
    tax:0,
    total:0
}
```

---

#### `sifa_addPriceLine(ref, label, type, amount, method, enabled)`
Add a price ledger line to the price engine.
- ref: a unique ledger key, if the same key is provided it will replace the any that already exist.
- label: short name of the ledger line for your use only
- type: a short group name for this ledger line. should be one word or caml case. "pizzaCrust"
- amount: a number value
- method: a value that represents if the amount is a unit or percentage
- enabled: true or false, to control if this should be included in the calculation
```
'sifa_addPriceLine("pizza_price", "base price", "pizza", 14.00, "UNIT", true)'
```

#### `sifa_removePriceLine(ref)`
Removes the price ledger line
```
'sifa_removePriceLine("pizza_price")'
```

#### `sifa_enablePriceLine(ref)`
Enables the price ledger line
```
'sifa_enablePriceLine("pizza_price")'
```

#### `sifa_disablePriceLine(ref)`
Disables the price ledger line
```
'sifa_disablePriceLine("pizza_price")'
```

#### `sifa_getPriceLine(ref)`
Returns the amount of a references price ledger line
```
'sifa_getPriceLine("pizza_price")'
```

#### `sifa_getPriceTypeTotal(type)`
Sums up the total amount of all lines with the same type reference
```
'sifa_getPriceTypeTotal("pizza")'
```

#### `sifa_getPriceTotal()`
Returns the total from the price ledger
```
'sifa_getPriceTotal()'
```

#### `sifa_getPriceTax()`
Returns the tax from the price ledger
```
'sifa_getPriceTax()'
```

#### `sifa_getPriceCost()`
Returns the unitcost from the price ledger
```
'sifa_getPriceCost()'
```


### Flow Control

---

#### `sifa_stopRules()`
Sets `engine.state` to `false`, halting all further action and rule processing for the current event. Processing resets to `true` at the start of the next event.

```
true_actions: [
    'sifa_stopRules()'      // no further actions or rules will run
]
```


#### `sifa_delayAction(ms)`
Pauses rule processing for the given number of milliseconds before continuing.

```
'sifa_delayAction(500)'     // wait 500ms
'sifa_delayAction(1000)'    // wait 1 second
```


#### `sifa_triggerRule(ruleRef)`
Finds a rule by its `ref` across all rule groups and executes it immediately, regardless of event context.

```
'sifa_triggerRule("validate_address")'
'sifa_triggerRule("calculate_totals")'
```

The referenced rule must exist in `SIFA.rules`. If not found, a warning is logged and execution continues.


### Logging & Debugging

Logs are stored in `outcome.logs` as `{ key, value, timestamp }` entries. Logs are cleared at the start of each LOAD and CHANGE event.


#### `sifa_addLog(key, value)`
Pushes a custom entry into `outcome.logs`.

```
'sifa_addLog("step_reached", {"step": 2, "field": "field_country"})'
```


#### `sifa_clearLogs()`
Empties `outcome.logs`.

```
'sifa_clearLogs()'
```


#### `sifa_logAnswer(ref)`
Pushes a `logAnswer` entry into `outcome.logs` containing the field ref and its current answer value.

```
'sifa_logAnswer("field_full_name")'
'sifa_logAnswer("field_country")'
```


### Casting & Utilities

---

#### `sifa_toNumber(value)`
Converts a value to a number. Returns a result object where `.outcome` is the number, or `null` if not numeric.

```
condition: 'sifa_isGreaterThan(sifa_toNumber(sifa_getValue("field_price")), 100)'
```

---

#### `sifa_toString(value)`
Converts a value to a string. Returns a result object where `.outcome` is the string, or `null` if the input is null.

```
'sifa_setElementText("ele_display", sifa_toString(sifa_getVariable("count")))'
```

---

#### `sifa_isNumber(value)`
Returns `true` if the value can be converted to a valid number.

```
condition: 'sifa_isNumber(sifa_getValue("field_qty"))'
```

---

#### `sifa_length(value)`
Returns the `.length` of a string or array. Returns `null` if the value is empty.

```
condition: 'sifa_isGreaterThan(sifa_length(sifa_getValue("field_notes")), 10)'
```
# SIFA — Structured Interactive Form Actions

> A lightweight, rules-based form engine for the browser. Define how your form behaves through configuration — no per-field JavaScript required.

**Developer:** Lee W Winter <br/>
**Version:** 1.0.0 <br/>
**Language:** JavaScript <br/>

### Links

- [L.W. Winter Website](https://lwinter.tech)
- [Support Documentation](https://lwinter.tech/devproj/sifa/docs/)
- [Demo Pizza Builder](https://lwinter.tech/devproj/sifa/demos/pizza.html)
- [Demo BMW Builder](https://lwinter.tech/devproj/sifa/demos/bmw.html)

## What is SIFA?

A light JavaScript class to control your web forms with condition rulesets. This was built with product configuration in mind but is light weight enough to be used for survey, registration and contact forms.

## Developers Goal

I have worked with a variety of configuration tools, ranging from simple to complex. In each case, the framework imposed strict limitations on what users could see and interact with. These constraints hindered the UI/UX, often leading teams to rely on third-party plugins just to bridge the gaps the framework left behind. So this tool was meant to bring all the logic and complete freedom on the UI/UX to meet companies brands. `How was this achived?` I did not build a framework that relied on its own components and elements, work with standard web inputs used on all web forms and do do it while its in the layout the customer wants.

## Features

- **Zero DOM queries at runtime** — all elements are pre-registered on load
- **Rule groups** with priority ordering and enable/disable toggling
- **Four events** — `LOAD`, `CHANGE`, `CLICK`, `SAVE`
- **40+ built-in actions** — visibility, field values, conditions, variables, logging, flow control, casting
- **Validation rules** — condition-based pass/fail messages written to a central state object
- **BOM & pricing engine** — bill of materials with automatic unit cost calculation and configurable price rules
- **Custom actions** — drop a `cust.actions.js` file alongside the engine to extend with your own functions
- **URL parameter ingestion** — query string values are automatically available as variables on load
- **No dependencies** — pure vanilla JavaScript ES modules, no build step required


## File Structure

```
your-project/
├── sifa.engine.js      ← Core engine  (required)
├── sifa.actions.js     ← Built-in actions  (required)
└── cust.actions.js     ← Your custom actions  (optional)
```

All three files must live in the same directory. The engine uses ES module dynamic imports so your page must be served over HTTP — `file://` will not work.


## Quick Start

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
    import SifaEngine from '../sifa.engine.js';

    new SifaEngine({
        rules: [
            {
                event:  'CHANGE',
                enable: true,
                priority: 0,
                desc: 'Ruleset description',
                rules: [
                    {
                        ref: 'ruleref',
                        enable: true,
                        priority: 0,
                        active: 'true',
                        condition: 'true',
                        true_actions: [
                            'sifa_hideElement("group_submit_section")'
                        ],
                        false_actions: []
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


## Initialisation Options

All options are optional. SIFA works with an empty config object.

```javascript
new SifaEngine({
    debug:           false,
    rules:           [],
    validationRules: [],
    variables:       {},
    answers:         {},
    events: {
        LOAD:   (outcome) => {},
        CHANGE: (target, outcome) => {},
        CLICK:  (target, outcome) => {},
        SAVE:   (outcome) => {}
    }
});
```
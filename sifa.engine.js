/**
 * =============================================================================
 * SIFA — Structured Interactive Form Actions
 * =============================================================================
 * @file        sifa.engine.js
 * @author      Lee W Winter
 * @version     1.0.0
 * @description
 *   SIFA is a lightweight rules-based form engine that scans a page for
 *   targeted HTML elements and inputs, then dynamically drives behavior 
 *   through a configurable set of rules, actions, and validations.
 *
 * -----------------------------------------------------------------------------
 * CORE CONCEPTS
 * -----------------------------------------------------------------------------
 *   Elements     Scans the DOM for elements matching a target class and
 *                semantic grouping tags (section, fieldset, details, article),
 *                storing references for direct manipulation at runtime.
 *
 *   Inputs       Registers all input, select, and textarea elements found
 *                within target elements, including support for radio and
 *                checkbox groups. Each input is assigned a unique sifaRef
 *                key used throughout the engine.
 *
 *   Rules        A configurable array of rule objects, each containing an
 *                event trigger, an active condition, a main condition, and
 *                true/false action lists. Rules are evaluated in order on
 *                each triggered event.
 *
 *   Actions      Functions loaded from global and custom action modules.
 *                Called dynamically via eval during rule processing. Global
 *                actions are prefixed sifa_, custom actions with cust_.
 *
 *   Validations  A separate set of condition-based rules that write pass/fail
 *                messages into outcome.validation, evaluated on load, change,
 *                click, and save events.
 *
 *   Outcome      A central state object containing answers, variables,
 *                validation results, and logs — returned on save and passed
 *                to all user-defined event callbacks.
 *
 * -----------------------------------------------------------------------------
 * EVENTS
 * -----------------------------------------------------------------------------
 *   LOAD         Fires once on initialisation after elements are scanned.
 *   INPUT        Fires on every keystroke / value change (before commit).
 *   CHANGE       Fires when a field value is committed and updates answers.
 *   CLICK        Fires on any click within a registered element.
 *   SAVE         Fires when onSaveEvent() is called, returns selected outcome.
 *
 * -----------------------------------------------------------------------------
 * USAGE
 * -----------------------------------------------------------------------------
 *   const engine = new SifaEngine({
 *       targetElement: 'my-field-class',
 *       targetGroup:   'my-group-class',
 *       debug:         true,
 *       rules:         [ ...ruleObjects ],
 *       validation:    [ ...validationObjects ],
 *       variables:     { presetKey: 'value' },
 *       answers:       { presetField: 'value' },
 *       events: {
 *           LOAD:   (outcome) => {},
 *           CHANGE: (target, outcome) => {},
 *           SAVE:   (outcome) => {},
 *       }
 *   });
 *
 * -----------------------------------------------------------------------------
 * DEPENDENCIES
 * -----------------------------------------------------------------------------
 *   sifa.actions.js   Built-in action functions (sifa_ prefix)
 *   cust.actions.js          User-defined custom actions  (cust_ prefix)
 *
 * =============================================================================
 */

let run_rev   = Math.floor(Math.random() * 1984) * new Date().getTime();

//// ACTIONS
let global_acts; try { global_acts  = await import("./sifa.actions.js?ts=" + run_rev);   } catch (e) { console.warn('global_acts error', e); global_acts = null; }
let custom_acts; try { custom_acts  = await import("./cust.actions.js?ts=" + run_rev);   } catch (e) { console.warn('custom_acts error', e); custom_acts = null; }

export class SifaEngine {
    constructor(set){
        window.SIFA = this;
        SIFA.engine = { state: true }; // global state to control flow (e.g. stopRules)
        SIFA.settings = {};
        SIFA.elements = {};
        SIFA.triggerInput = null;
        SIFA.rules = [];
        SIFA.actions = {};
        SIFA.outcome = {
            logs: [],           // Array to store log messages with timestamps
            variables: {},      // List to store variables to be used later
            answers: {},        // List that stores all vaues from SIFA.fields
            validation: {},     // List that stores outcome from validation rules
            mbom:{},             // List that stores bill of materials or other metadata
            unitcost: 0.00,
            saleprice: 0.00
        };
        SIFA.setSettings(set);
        SIFA.start().catch(e => console.error('SIFA start error', e));
    }

    setSettings(set={}){
        const {  validationRules = [], variables = {}, answers = {}, rules = [], ...rest } = set;
        SIFA.settings = {
            targetElement: 'sifa-input',
            targetGroup:   'sifa-group',
            targetValidation: null,
            revID:         run_rev,
            debug:         false,
            events:        {},
            ...rest
        };
        SIFA.rules = rules;
        SIFA.validationRules = validationRules;
        SIFA.outcome.variables = { ...SIFA.getUrlParams(), ...variables };
        SIFA.outcome.answers   = { ...SIFA.outcome.answers, ...answers };
    }
    async start(){
        // Global Class Functions
        if (global_acts) {
            for (const key in global_acts) {
                const clean = key.replace(/^(cust_|sifa_)/, '');
                SIFA.actions[`sifa_${clean}`] = global_acts[key];
            }
        }
        // Custom Class Functions
        if (custom_acts) {
            for (const key in custom_acts) {
                const clean = key.replace(/^(cust_|sifa_)/, '');
                SIFA.actions[`cust_${clean}`] = custom_acts[key];
            }
        }
        SIFA.scanPageElements();
        await SIFA.onLoadEvent();
    }
    scanPageElements(){
        const slugify = str => str.toString().toLowerCase().replace(/[ -]/g, '_');
        const resolveTag = (el, index) => slugify(el.id || el.dataset.tag || index);

        // Utility function to register input elements and create references for easy access
        const registerInput = (el, input, index) => {
            const key = `field_${slugify(input.name || input.id || index)}`;
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.sifaRef = `${key}_${input.value}`;
                (SIFA.elements[key] ??= {})[input.value] = input;
                // return;
            }else if(input.tagName.toUpperCase() === 'SELECT') {
                input.sifaRef = key;
                input.baseOptions = [...input.options].map(o => ({ value: o.value, text: o.text }));
                SIFA.elements[key] = input;
            }else{
                input.sifaRef = key;
                SIFA.elements[key] = input;
            }
        };

        const registerLabel = (el, index) => {
            const key = `label_${slugify(el.getAttribute('for') || el.id || index)}`;
            el.sifaRef = key;
            SIFA.elements[key] = el;
        }

        const registerButton = (el, index) => {
            const key = `button_${slugify(el.id || el.name || index)}`;
            el.sifaRef = key;
            SIFA.elements[key] = el;
        }

        const attachListeners = (el) => {
            el.addEventListener('change', e => SIFA.onChangeEvent(e.target));
            el.addEventListener('input',  e => SIFA.onInputEvent(e.target));
            el.addEventListener('click',  e => SIFA.onClickEvent(e.target));
        };

        const scanElements = (selector, prefix, callback) => {
            document.querySelectorAll(selector).forEach((el, index) => {
                const tag = `${prefix}_${resolveTag(el, index)}`;
                if (SIFA.elements[tag]) return; // skip if already registered
                el.sifaTag = tag;
                SIFA.elements[tag] = el;
                callback?.(el, index);
            });
        };

        // Scan target class elements
        scanElements(`.${SIFA.settings.targetElement}`, 'ele', (el, index) => {
            // attachListeners(el);
            el.querySelectorAll('input, select, textarea').forEach(input => {
                registerInput(el, input, index);
                input.addEventListener('change', e => SIFA.onChangeEvent(e.target));
            });
            el.querySelectorAll('label').forEach(label => {
                registerLabel(label, index);
            });
            el.querySelectorAll('button').forEach(button => {
                registerButton(button, index);
                button.addEventListener('click', e => SIFA.onClickEvent(e.target));
            });
        });

        // Scan group elements
        const defaultGroupSelectors = ['details', 'section', 'fieldset', 'article'];
        const existingSelectors = SIFA.settings.targetGroup.split(',').map(s => s.trim());
        // Append only selectors not already present
        const mergedSelectors = [
            ...existingSelectors,
            ...defaultGroupSelectors.filter(s => !existingSelectors.includes(s))
        ].join(', ');
        scanElements(mergedSelectors, 'group');
    }

    async onLoadEvent(){
        SIFA.outcome.logs = []; // clear logs on each action processing
        SIFA.actions.sifa_setAnswers(SIFA.outcome.answers);
        if (SIFA.settings.debug) console.log('SIFA Page Load Event', SIFA);
        await SIFA.processActions('LOAD');
        await SIFA.processValidations();
        SIFA.calculateUnitCost();
        
        SIFA.settings.events.LOAD?.(SIFA.outcome);
    }
    async onInputEvent(target){
        SIFA.triggerInput = target;
        await SIFA.processActions('INPUT');
        SIFA.settings.events.INPUT?.(target, SIFA.outcome);
    }
    async onChangeEvent(target){
        SIFA.outcome.logs = []; // clear logs on each action processing
        SIFA.triggerInput = target;
        const baseKey = target.type === 'checkbox' || target.type === 'radio'
            ? target.sifaRef.replace(/_[^_]+$/, '')  // strip _value suffix
            : target.sifaRef;
        const value = target.type === 'checkbox'
            ? Object.values(SIFA.elements[baseKey]).filter(i => i.checked).map(i => i.value)
            : target.value;
        SIFA.actions.sifa_setAnswers({ [baseKey]: value });
        await SIFA.processActions('CHANGE');
        await SIFA.processValidations();
        SIFA.calculateUnitCost();
        SIFA.settings.events.CHANGE?.(target, SIFA.outcome);
    }
    async onClickEvent(target){
        SIFA.triggerInput = target;
        await SIFA.processActions('CLICK');
        await SIFA.processValidations();
        SIFA.settings.events.CLICK?.(target, SIFA.outcome);
    }
    async onSaveEvent(outcome=['answers']){
        await SIFA.processActions('SAVE');
        await SIFA.processValidations();
        SIFA.calculateUnitCost();
        const aliases = {
            answers:    ['answers', 'answer', 'ans'],
            variables:  ['variables', 'variable', 'var'],
            validation: ['validation', 'validate', 'val'],
            logs:       ['logs', 'log'],
            mbom:       ['mbom', 'bom', 'items'],
            unitcost:   ['unitcost', 'cost'],
            saleprice:  ['saleprice', 'price', 'sale_price']
        };
        const return_outcome = Object.fromEntries(
            Object.entries(aliases)
                .filter(([, keys]) => keys.some(k => outcome.includes(k)))
                .map(([key]) => [key, SIFA.outcome[key]])
        );
        SIFA.settings.events.SAVE?.(SIFA.outcome);
        if (SIFA.settings.debug) console.log('SIFA Save Outcome', return_outcome);
        return return_outcome;
    }

    // Processing Rules
    async processActions(event="ALL"){
        SIFA.engine.state = true; // reset state at the start of each event processing
        const event_up = event.toUpperCase();
        if (SIFA.settings.debug) console.log('SIFA Processing Event', event_up);
        const rgroup = SIFA.rules.filter(r => r.event.toUpperCase() === event_up || r.event.toUpperCase() === 'ALL');
        for (const group of rgroup) {
            if(group.enable === false){ return ''; }
            if(group.rules && group.rules.length > 0){  
                let rules = group.rules;
                rules = rules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)); // sort rules by priority property
                for (const rule of rules) {
                    let step = await this.runRule(rule);
                    if(step === false){ console.warn('SIFA rule processing returned false, stopping further rules.'); return ''; }
                }
            }else{
                return '';
            }
        }
    }

    runRule(rule){
        if(SIFA.engine.state === false){ return false; }
        if (!rule.enable) return false;

        if (SIFA.evaluateAction(SIFA.prefixFuncs(rule.active)) == false) return false;
        const outcome = SIFA.evaluateAction(SIFA.prefixFuncs(rule.condition));
        const actions = outcome ? rule.true_actions : rule.false_actions;

        if (actions?.length) {
            for (const act of actions) {
                if(SIFA.engine.state === false){ console.warn('SIFA engine state processing returned false, stopping further actions.'); return false; }
                try{
                    SIFA.evaluateAction(SIFA.prefixFuncs(act));
                }catch(e){
                    console.log(e);
                    return false;
                }
            }
        }
    }

    // Process Validations
    async processValidations(){
        // Clear previous validation outcomes
            SIFA.outcome.validation = {};
        // Check validation settings exists, if not stop running.
            if (!SIFA.validationRules) { return; }
        // Run Validations
            for (const v of SIFA.validationRules) {
                if (!v.enable) continue;
                let cond = SIFA.prefixFuncs(v.condition);
                let res = SIFA.evaluateAction(cond);
                if (res === true  && v.true_message)  SIFA.outcome.validation[v.ref] = { outcome: true,  message: v.true_message  };
                if (res === false && v.false_message)  SIFA.outcome.validation[v.ref] = { outcome: false, message: v.false_message };
            }
        // Display validation messages
        if(SIFA.settings.targetValidation!=null){
            let ele = document.querySelector(SIFA.settings.targetValidation);
            if(!ele){ console.warn(`The target validation ${SIFA.settings.targetValidation} could not find a element.`); return; }
            ele.innerHTML = '';
            for(let vkey in SIFA.outcome.validation){
                SIFA.genhtml({type:'p', attr:{class:'sifa-validation-message'}, html:SIFA.outcome.validation[vkey].message, parent:ele});
            }
        }
    }

    async calculateUnitCost(){
        // Calculate unit cost based on mbom items
        SIFA.outcome.unitcost = 0.00;
        for(const item of Object.values(SIFA.outcome.mbom)){
            SIFA.outcome.unitcost += (item.quantity * item.unitcost);
        }

        // Process price rules
        SIFA.outcome.saleprice = 0.00;
        let func = SIFA.actions;
        if(SIFA.settings.priceRules){
            for(const rule of SIFA.settings.priceRules){
                if(rule.enable === false){ continue; }
                let condition = rule.condition ? SIFA.prefixFuncs(rule.condition) : 'true';
                let conditionResult = await SIFA.evaluateAction(condition);
                if(conditionResult === true){
                    let pfun = this.prefixFuncs(rule.method);
                    let settings = rule.set ? rule.set : {};
                    pfun += `(settings)`;
                    eval(pfun);
                }else{
                    if(SIFA.settings.debug) console.log(`SIFA Price Rule condition not met, skipping: ${condition}`);
                }
            }
        }
    }
    evaluateAction(action){
        let func = SIFA.actions;
        let data = eval(action);
        return data?.outcome === true || data?.outcome === false ? data.outcome : data;
    }
    getUrlParams(){
        return Object.fromEntries(
            [...new URLSearchParams(window.location.search)]
                .map(([k, v]) => {
                    if (v === 'true')        return [k, true];
                    if (v === 'false')       return [k, false];
                    if (v !== '' && !isNaN(v)) return [k, Number(v)];
                    return [k, v];
                })
        );
    }
    prefixFuncs(str) {
        let con = str.replace(/\b(sifa|cust)_/g, 'func.$1_');
        if(con.includes('func.func.')){ con = con.replace(/func\.func\./g, 'func.'); }
        return con;
    }
    genhtml(set){
        if(!set.type){ console.error('Type is required for genhtml function.', ['div', 'span', 'p', 'a', 'button']); return null; }
        // SVG namespace support
        const SVG_TAGS = new Set(['svg','path','circle','rect','line','polyline','polygon','ellipse','text','g','defs','use','symbol','clipPath','marker']);
        const el = SVG_TAGS.has(set.type)
            ? document.createElementNS('http://www.w3.org/2000/svg', set.type)
            : document.createElement(set.type);
        // Reference key on the element itself
        const ref = set.ref ?? set.key;
        if (ref) el.veloref = ref;
        // Set ID
        if(set.id){ el.id = set.id; }
        // Set attributes
        const att = set.att ?? set.attr ?? set.attributes; att ? setAttributes(el, att) : null;
        // Set Data Attributes
        const data = set.data ?? set.dataset; data ? setDataset(el, data) : null;
        // Set Additional Properties
        const odata = set.odata ?? set.props; odata ? setOdata(el, odata) : null;
        // Set Tooltip
        set.tooltip ? el.setAttribute('title', set.tooltip) : null;
        set.disabled ? el.disabled = true : null;
        set.hidden ? el.hidden = true : null;
        // Set Inner HTML
        const html = set.html ?? set.innerHTML;
        const text = set.text ?? set.innerText;
        html ? setHTML(el, html) : text ? setText(el, text) : null;
        // Set Classes
        const cls = set.cls ?? set.class ?? set.classes ?? set.className; cls ? setClasses(el, cls) : null;
        // Set Style
        const style = set.style ?? set.css; style ? setStyle(el, style) : null;
        // Set Events
        const events = set.events ?? set.ev; events ? setEvents(el, events) : null;
        // Set Children
        if(set.children){
            for (const child of set.children) {
                const childEl = genhtml({ ...child, parent: el });
                const childRef = child.ref ?? child.key;
                if (childRef) el[childRef] = childEl;
            }
        }
        // set Aria attributes
        const aria = set.aria; if(aria){ for(const [k, v] of Object.entries(aria)){ el.setAttribute('aria-' + k, v); } }
        // Set Parent
        const target = set.parent ?? set.target;
        if(target){ 
            const parentEl = typeof target === 'string' ? document.querySelector(target) : target;
            if (parentEl) {
                if (set.prepend)         parentEl.prepend(el);
                else if (set.before)     set.before.before(el);
                else if (set.after)      set.after.after(el);
                else                     parentEl.appendChild(el);
                if (ref) parentEl[ref] = el;
            }else{
                console.error('Parent element not found for genhtml function.', target);
            }
        }
        function setAttributes(el, attributes){ for (const [k, v] of Object.entries(attributes)) { el.setAttribute(k, v); } }
        function setDataset(el, dataset){ for(let dataAttr in dataset){ el.dataset[dataAttr] = dataset[dataAttr]; }}
        function setHTML(el, html){  Array.isArray(html) ? html.forEach(n => el.appendChild(n)) : html instanceof Node ? el.appendChild(html) : el.innerHTML = html; }
        function setText(el, text){ el.textContent = text; }
        function setClasses(el, classes){ if(Array.isArray(classes)){ el.classList.add(...classes); }else if(typeof classes === 'object'){ for(const [key, value] of Object.entries(classes)){ if(value) el.classList.add(key); else el.classList.remove(key); } }else{ el.className = classes; } }
        function setEvents(el, events) { for (const [evt, value] of Object.entries(events)) { typeof value === 'function' ? el.addEventListener(evt, value) : value?.handler ? el.addEventListener(evt, value.handler, value.options || false) : null; } }
        function setStyle(el, style) { typeof style === 'string' ? el.style.cssText = style : style instanceof Object ? Object.entries(style).forEach(([k, v]) => k.startsWith('--') ? el.style.setProperty(k, v) : el.style[k] = v) : null; }
        function setOdata(el, odata){ for(let prop in odata){ el[prop] = odata[prop]; } }
        return el;
    }
}
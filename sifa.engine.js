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
 *       targetInput: 'my-field-class',
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
            targetInput: '.sifa-input',
            targetGroup:   '.sifa-group',
            targetElement: '.sifa-element',
            targetValidation: null,
            revID:         run_rev,
            debug:         false,
            editMode:      false,
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

        SIFA.settings.editMode ? SIFA.editor_Window() : null;
        await SIFA.onLoadEvent();
    }
    scanPageElements(){

        const slugify = str => str.toString().toLowerCase().replace(/[ -]/g, '_');
        const resolveTag = (el, index) => slugify(el.id || el.dataset.tag || index);

        // Utility function to register input elements and create references for easy access
        const registerInput = (el, input, index) => {
            const key = `field_${slugify(input.name || input.id || index)}`;
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.sifaRef = `${input.value}`;
                input.sifaPRef = `${key}`;
                (SIFA.elements[key] ??= {})[input.value] = input;
                SIFA.outcome.answers[key] = null;
                // return;
            }else if(input.tagName.toUpperCase() === 'SELECT') {
                input.sifaRef = key;
                input.baseOptions = [...input.options].map(o => ({ value: o.value, text: o.text }));
                SIFA.elements[key] = input;
                SIFA.outcome.answers[key] = null;
            }else{
                input.sifaRef = key;
                SIFA.elements[key] = input;
                SIFA.outcome.answers[key] = null;
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

        const registerElement = (el, index) => {
            const key = `ele_${slugify(el.id || el.dataset.tag || index)}`;
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
        scanElements(`${SIFA.settings.targetInput}`, 'ele', (el, index) => {
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

        scanElements(`${SIFA.settings.targetElement}`, 'ele', (el, index) => {
            registerElement(el, index);
        });

        // Scan group elements
        // const defaultGroupSelectors = ['details', 'section', 'fieldset', 'article'];
        scanElements(SIFA.settings.targetGroup, 'group', (el, index) => {
            // lookup buttons
            el.querySelectorAll('button').forEach(button => {
                registerButton(button, index);
                button.addEventListener('click', e => SIFA.onClickEvent(e.target));
            });
        });
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
        const baseKey = target.type === 'checkbox' || target.type === 'radio' ? target.sifaPRef : target.sifaRef;
        const valKey  = target.type === 'checkbox' || target.type === 'radio' ? target.sifaRef : null;

        const value = target.type === 'checkbox' || target.type === 'radio'
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
                    // if(step === false){ console.warn('SIFA rule processing returned false, stopping further rules.'); return ''; }
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
                const childEl = SIFA.genhtml({ ...child, parent: el });
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

    editor_CSS(){
        SIFA.editor.editor_CSS ? SIFA.editor.editor_CSS.remove() : null;
        SIFA.editor.editor_CSS = SIFA.genhtml({
            type: 'style',
            attr: { id: 'sifa-editor-css' },
            parent: document.head,
            html:`
                :root{
                    --sifae-bg: #F3F5F9;
                    --sifae-blue: rgba(24, 106, 156, 0.8);
                    --sifae-red: rgba(156, 24, 24, 0.8);
                    --sifae-green: rgba(24, 156, 78, 0.8);
                    --sifae-text: rgba(39, 39, 39, 1);
                    --sifae-glass: backdrop-filter: blur(10px); /* use inline below */
                    --sifae-radius: 4px;
                }
                .sifae-window {
                    position: fixed;
                    inset: 0 auto 0 0;
                    font-family: monospace, Arial, sans-serif !important;
                    color: var(--sifae-text);
                    background: var(--sifae-bg);
                    font-size: 12px;
                    z-index: 9999;
                    width: calc(100% - 60px);
                    max-width: 800px;
                    min-width: 400px;
                    transition: 0.5s ease-in-out;
                }
                .sifae-window-hide { left: -800px; }
                .sifae_showhide_tab{
                    position: absolute;
                    transform: rotate(90deg);
                    background: var(--sifae-bg);
                    font-family: monospace, Arial, sans-serif !important;
                    right: -62px;
                    width: 100px;
                    text-align: center;
                    height: 26px;
                    padding-top: 8px;
                    box-sizing: border-box;
                    inset-block: 0;
                    margin: auto;
                    cursor: pointer;
                    border-radius: var(--sifae-radius) var(--sifae-radius) 0 0;
                    border-right: 1px solid #666;
                    border-top: 1px solid #666;
                    border-left: 1px solid #666;
                    z-index: 1;
                }
                .sifae_tabs, .sifae_content {
                    position: absolute; left: 0; right: 0;
                }
                .sifae_tabs { 
                    height: 40px;
                    border-bottom: 1px solid #666;
                    display: grid;
                    grid-template-columns: auto auto auto auto auto 40px;
                    justify-items: center;
                }
                .sifae_content {
                    bottom: 0px;
                    top: 40px;
                    overflow-y: auto;
                    padding: 0 8px;
                    border-right: 1px solid #666;
                }
                .sifae_tabs button {
                    font-family: monospace, Arial, sans-serif !important;
                    background: none; border: none;
                    cursor: pointer;
                    width: fit-content;
                }
                .sifae-window input,
                .sifae-window select,
                .sifae-window textarea{ 
                    padding: 4px; 
                    font-family: monospace, Arial, sans-serif !important;
                    box-sizing: border-box;
                }
                .sifa-rule-block {
                    font-family: monospace, Arial, sans-serif !important;
                    display: grid;
                    grid-template-columns: 30px 100px 100px auto 30px;
                    width: calc(100% - 16px);
                    margin: 8px auto 0;
                    gap: 4px;
                    box-sizing: border-box;
                }
                .sifa-rule-block label,
                .sifa-rule label { font-weight: bold; }
                .sifa-rule-block select,
                .sifa-rule-block input { width: 100%; }
                .sifa-rulesets { display: block; padding: 8px; }
                .ruleset {
                    display: block;
                    border: 1px solid #666;
                    padding: 8px;
                    box-sizing: border-box;
                    border-radius: var(--sifae-radius);
                }
                .sifa-rule-add,
                .sifa-rule-del {
                    color: white; border: none; cursor: pointer; border-radius: var(--sifae-radius);
                }
                .sifa-rule-add { background-color: var(--sifae-green); }
                .sifa-rule-del { background-color: var(--sifae-red); }
                .sifae_actions summary { cursor: pointer; padding: 8px 0; }
                .sifae_actions > div { display: flex; flex-direction: column; gap: 4px; }
                .sife_action_rows { display: grid; grid-template-columns: auto 25px; gap: 4px; }
                .sifae_lookup_window {
                    position: fixed;
                    z-index: 999999;
                    background-color: white;
                    inset: 0;
                    margin: auto;
                    max-width: 800px;
                    max-height: 335px;
                    padding: 8px;
                    box-sizing: border-box;
                    border-radius: var(--sifae-radius);
                    box-shadow: 0 0 11px 0 rgba(0,0,10,0.5);
                    border: 1px solid #b6becc;
                }
                .sifae_lookup_opt { background-color: rgba(200,200,200,0.1); padding: 8px; box-sizing: border-box; }
                .sifae_lookup_opt:hover { background-color: rgba(100,100,100,0.1); }
                .sifae_lookupfield {
                    resize: none;
                    width: 100%;
                    height: 70px;
                    border: 1px solid #cbcbcb;
                    border-radius: var(--sifae-radius);
                    box-sizing: border-box;
                }
                .suggestions {
                    background-color: white;
                    width: 100%;
                    border: 1px solid #cbcbcb;
                    overflow: auto;
                    border-radius: var(--sifae-radius);
                    height: 205px;
                    box-sizing: border-box;
                }
                .suggestion {
                    display: grid;
                    grid-template-columns: 250px auto 50px;
                    cursor: pointer;
                    padding: 8px;
                }
                .suggestion:hover { background-color: rgba(100,100,100,0.1); }
                .sifae_active { background-color: var(--sifae-blue); color: white; }
                .sifae_var_table{
                    width: 100%;
                    border-collapse: collapse;
                }
                .sifae_var_table th{
                    font-weight: bold;
                    background-color: rgba(200,200,200,0.3);
                }
                .sifae_var_table th, .sifae_var_table td{
                    border: 1px solid #cbcbcb;
                    padding: 4px;
                    text-align: left;
                }
            `
        });
    }
    editor_Window(){
        SIFA.editor = {};
        SIFA.editor_CSS();
        SIFA.editor.elements = {};
        for(let fieldk in SIFA.elements){
            // Create groupings based on prefix (e.g. field_, label_, button_)
            let prefix = fieldk.split('_')[0];
            SIFA.editor.elements[prefix+'s'] ? null : SIFA.editor.elements[prefix+'s'] = [];
            fieldk.includes(prefix+'_') ? SIFA.editor.elements[prefix+'s'].push(fieldk) : null;
        }
        SIFA.editor.ele = {};
        SIFA.editor.ele.editor_Window = SIFA.genhtml({type:'section', attr:{class:'sifae-window'}, parent:document.body, children:[
            {type:'div', attr:{class:'sifae_showhide_tab', title:'Toggle SIFA Editor'}, children:[{type:'span', html:'SIFA Editor', events:{ click:()=>{  SIFA.editor.ele.editor_Window.classList.toggle('sifae-window-hide'); } }}]},
            {type:'div', ref:'actions', attr:{class:'sifae_tabs'}, children:[
                {type:'button', html:'Settings', events:{click:()=>{ SIFA.editor_renderSettings(); }}},
                {type:'button', html:'Rules(' + SIFA.rules.length + ')', events:{click:()=>{ SIFA.editor_RenderRulesets(); }}},
                {type:'button', html:'Validation(' + SIFA.validationRules.length + ')', events:{click:()=>{ SIFA.editor_renderValidation(); }}},
                {type:'button', html:'Variables', events:{click:()=>{ SIFA.editor_renderVariables(); }}},
                {type:'span'},
                {type:'button', html:'(ƒ)', events:{click:()=>{ SIFA.editorLookup(); }}}
            ]},
            {type:'div', ref:'sifae_content', attr:{class:'sifae_content'}}
        ]});
        SIFA.editor_renderSettings();
    }
    editor_renderSettings(){
        let domParent = SIFA.editor.ele.editor_Window.sifae_content;
        domParent.innerHTML = '';
        let settings = {"debug": "boolean", "targetElement": "string", "targetGroup": "string", "targetInput": "string", "targetValidation": "string"};

        SIFA.genhtml({type:'br', parent:domParent});
        SIFA.genhtml({type:'h2', html:'SIFA Settings', parent:domParent});
        SIFA.genhtml({type:'p',  html:`<br/> To use the dynamic lookup for rules and validations put focus on the condition or action field and press the lookup button. (ƒ)
            <br/><br/>Use this tab to configure the SIFA engine settings.<br/><br/>`, parent:domParent});

        // Settings
        let setblock = SIFA.genhtml({type:'div', attr:{class:'sifa-settings-block', style:'margin-top:8px; display: flex; flex-direction: column; gap: 8px;'}, parent:domParent});
        for(let set in settings){
            SIFA.genhtml({type:'div', attr:{class:'sifa-settings-row', style:'display: grid; grid-template-columns: 150px auto; gap: 8px;'}, parent:setblock, children:[
                {type:'label', html:set},
                settings[set] === 'boolean' ? {type:'select', ref:set, children:[
                    {type:'option', attr:{value:true}, html:'True'},
                    {type:'option', attr:{value:false}, html:'False'}
                ], events:{change:(e)=>{ SIFA.settings[set] = e.target.value === 'true'; }}}
                : {type:'input', attr:{type:'text', value:SIFA.settings[set]}, ref:set, events:{change:(e)=>{ SIFA.settings[set] = e.target.value; }}, 
                events:{
                    change:(e)=>{  SIFA.settings[set] = e.target.value; }
                }}
            ]});
        }
        SIFA.genhtml({type:'div', html:'<br/><hr/><br/>', parent:domParent});
    }

    editor_RenderRulesets(){
        SIFA.editor.ele.editor_Window.sifae_content.innerHTML = '';
        let newr = {ref: 'new', enable: false, priority: 0, active: '', condition: '', true_actions: [], false_actions: [] }

        SIFA.genhtml({type:'h2', html:'Rulesets', parent:SIFA.editor.ele.editor_Window.sifae_content, attr:{}});
        SIFA.genhtml({type:'p', html:'<br/>Use this section to configure rulesets.<br/><br/>', parent:SIFA.editor.ele.editor_Window.sifae_content});

        rulesetRender('new', SIFA.editor.ele.editor_Window.sifae_content, {});
        SIFA.genhtml({type:'br', parent:SIFA.editor.ele.editor_Window.sifae_content});
        SIFA.genhtml({type:'hr', parent:SIFA.editor.ele.editor_Window.sifae_content});
        SIFA.rules = SIFA.rules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)); // sort rulesets by priority property
        for(let rule of SIFA.rules){ rulesetRender('edit', SIFA.editor.ele.editor_Window.sifae_content, rule); }

        function rulesetRender(type, parent, ruleset){
            let newRuleBlock = SIFA.genhtml({type:'div', attr:{class:'sifa-rule-block', style:'grid-template-columns: 30px 100px 100px auto 60px 30px;'}, parent:parent, children:[
                {type:'label', attr:{class:'sifa-rule-desc'}, html:''},
                {type:'label', attr:{class:'sifa-rule-desc'}, html:'Enable'}, 
                {type:'label', attr:{class:'sifa-rule-desc'}, html:'Event'}, 
                {type:'label', attr:{class:'sifa-rule-desc'}, html:'Description'}, 
                {type:'label', attr:{class:'sifa-rule-desc'}, html:'Priority'},
                {type:'label', attr:{class:'sifa-rule-desc'}, html:''},
                {type:'button', ref:'add', attr:{class:type=='new' ? 'sifa-rule-add' : 'sifa-rule-del', title:type=='new' ? 'Add New Ruleset' : 'Delete This Ruleset'}, html:type=='new' ? '+' : '-', events:{click:()=>{
                    if(type=='new'){
                        let newRule = {'event': newRuleBlock.event.value, 'enable': newRuleBlock.enable.value, 'desc': newRuleBlock.desc.value, 'priority': newRuleBlock.priority.value, 'rules':[newr] };
                        SIFA.rules.push(newRule);
                        SIFA.editor_RenderRulesets();
                    }else{
                        confirm('Are you sure you want to delete this rule?') ? (() => {
                            SIFA.rules = SIFA.rules.filter(r => r !== ruleset);
                            SIFA.editor_RenderRulesets();
                        })() : null;
                    }
                }}},
                {type:'select', ref:'enable', attr:{class:'sifa-rule-enable'}, children:[
                    {type:'option', attr:{value:false}, html:'Disable'},
                    {type:'option', attr:{value:true}, html:'Enable'}
                ], events:{change:(e)=>{ ruleset.enable = e.target.value; }}},
                {type:'select', ref:'event', attr:{class:'sifa-rule-event'}, children:[
                    {type:'option', attr:{value:'LOAD'}, html:'LOAD'},
                    {type:'option', attr:{value:'INPUT'}, html:'INPUT'},
                    {type:'option', attr:{value:'CHANGE'}, html:'CHANGE'},
                    {type:'option', attr:{value:'CLICK'}, html:'CLICK'},
                    {type:'option', attr:{value:'SAVE'}, html:'SAVE'},
                    {type:'option', attr:{value:'ALL'}, html:'ALL'}
                ], events:{change:(e)=>{ ruleset.event = e.target.value; }}},
                {type:'input', ref:'desc', attr:{type:'text', class:'sifa-rule-desc'}, events:{change:(e)=>{ ruleset.desc = e.target.value; }}},
                {type:'input', ref:'priority', attr:{type:'number', class:'sifa-rule-priority', value:'0'}, events:{change:(e)=>{ ruleset.priority = e.target.value; SIFA.editor_RenderRulesets(); }}},
                {'type':type=='new' ? 'span' : 'button', ref:'add', attr:{class:type=='new' ? 'sifa-rule-desc' : 'sifa-rule-add', title:type=='new' ? '' : 'Add new rule'}, html:type=='new' ? '' : '+', events:{
                    click:()=>{
                        if(type=='new'){ return; }
                        ruleset.rules.push(newr);
                        SIFA.editor_RenderRulesets();
                    }
                }}
            ]});
            let rulesetbox = SIFA.genhtml({type:'div', attr:{class:'sifa-rulesets'}, parent:SIFA.editor.ele.editor_Window.sifae_content});
            // Set ruleset field values
                if(ruleset && ruleset.enable){
                    newRuleBlock.enable.value = ruleset.enable;
                    newRuleBlock.event.value = ruleset.event;
                    newRuleBlock.desc.value = ruleset.desc;
                    newRuleBlock.priority.value = ruleset.priority ?? 0;
                }
            // Render rules
                if(ruleset && ruleset.rules){
                    let rules = ruleset.rules;
                    SIFA.editor_RenderRule(rulesetbox, rules);
                }
        }
    }
    editor_RenderRule(parent, rules){
        parent.innerHTML = '';
        rules = rules.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)); // sort rules by priority property
        for(let rule of rules){
            let ruleDetails = SIFA.genhtml({type:'details', attr:{class:'sifa-rule'}, parent:parent, children:[
                {type:'summary', children:[
                    {type:'input', odata:{'rule':rule, 'field':'ref'}, attr:{type:'text', autocomplete:'off', value:rule.ref, class:'sifa-rule-ref', style:'width:calc(100% - 40px); background:none; border:none; padding:4px;'}, events:{change:(e)=>{
                        let rule = e.target.rule;
                        rule[e.target.field] = e.target.value;
                    }}}
                ]},
                {type:'div', ref:'content', attr:{class:'ruleset'}, children:[
                    {type:'div', ref:'row1', attr:{style:'display:grid; grid-template-columns: auto 100px 50px 30px; gap: 4px;'}, children:[
                        {type:'label', html:'Active'},{type:'label', html:'Enable'},{type:'label', html:'Priority'},{type:'label', html:''},

                        {type:'select', ref:'active', odata:{'rule':rule, 'field':'active'}, attr:{class:'sifa-rule-active'}, children:[
                            {type:'option', attr:{value:false}, html:'Disable'},
                            {type:'option', attr:{value:true}, html:'Enable'},
                            ...SIFA.editor.elements.fields.map((fk, fv) => ({ type:'option', attr:{value:`sifa_triggeredField("${fk}")`}, html:`sifa_triggeredField("${fk}")` }))
                        ], events:{change:(e)=>{
                            let rule = e.target.rule;
                            rule[e.target.field] = e.target.value;
                        }}},
                        {type:'select', ref:'enable', odata:{'rule':rule, 'field':'enable'}, attr:{class:'sifa-rule-enable'}, children:[
                            {type:'option', attr:{value:false}, html:'Disable'},
                            {type:'option', attr:{value:true}, html:'Enable'}
                        ], events:{change:(e)=>{
                            let rule = e.target.rule;
                            rule[e.target.field] = e.target.value;
                        }}},
                        {type:'input', attr:{type:'number', value:rule.priority ?? 0, class:'sifa-rule-priority'}, odata:{'rule':rule, 'field':'priority'}, events:{change:(e)=>{
                            let rule = e.target.rule;
                            rule[e.target.field] = Number(e.target.value);
                        }}},
                        {type:'button', html:'-', attr:{title:'Delete this rule', class:'sifa-rule-del'}, events:{click:(e)=>{
                            confirm('Are you sure you want to delete this rule?') ? (() => {
                                rules.splice(rules.indexOf(rule), 1);
                                SIFA.editor_RenderRule(parent, rules);
                            })() : null;
                        }}}
                    ]},
                    {type:'div', attr:{style:'display:flex; flex-direction:column;'}, children:[
                        {type:'label', html:'Condition'},
                        {type:'input', attr:{type:'text', value:rule.condition, class:'sifa-rule-condition sifae-lookupfield'}, odata:{'rule':rule, 'field':'condition'}, events:{change:(e)=>{
                            let rule = e.target.rule;
                            rule[e.target.field] = e.target.value;
                        }}}
                    ]},
                    {type:'details', ref:'trueactions', attr:{class:'sifae_actions'}, children:[
                        {type:'summary', html:'True Actions'},
                        {type:'div', ref:'container', attr:{class:'true_rules'}}
                    ]},
                    {type:'details', ref:'falseactions', attr:{class:'sifae_actions'}, children:[
                        {type:'summary', html:'False Actions'},
                        {type:'div', ref:'container', attr:{class:'false_rules'}}
                    ]}
                ]}
            ]});
            ruleDetails.content.row1.enable.value = rule.enable;
            ruleDetails.content.row1.active.value = rule.active;

            SIFA.editor_RenderActions(ruleDetails.content.trueactions.container, rule.true_actions);
            SIFA.editor_RenderActions(ruleDetails.content.falseactions.container, rule.false_actions);
        }

        // Add lookup field listeners
        let sifaeLookupfields = parent.querySelectorAll('.sifae-lookupfield');
        for(let field of sifaeLookupfields){
            field.addEventListener('focus', e => {
                SIFA.editor.lookupField = e.target;
            });
        }
    }
    editor_RenderActions(parent, actions){
        parent.innerHTML = '';

        // Render New Option
        renderActionRow('new');
        for(let act of actions){ renderActionRow('edit', act); }

        function renderActionRow(type='new', act=''){
            let action = SIFA.genhtml({type:'div', parent:parent, attr:{class:'sife_action_rows'}, children:[
                {type:'input', ref:'input', attr:{type:'text', value:'', class:'sifa-rule-add', placeholder:'Action code...', class:'sifa-action-input sifae-lookupfield'},
                events:{change:(e)=>{
                        if(type=='new'){ return; }
                        let index = actions.indexOf(act);
                        if(index > -1){ actions[index] = e.target.value.trim(); }
                }}},
                {type:'button', html:type=='new' ? '+' : '-', attr:{title:type=='new' ? 'Add action' : 'Remove action', class:type=='new' ? 'sifa-rule-add' : 'sifa-rule-del'}, 
                    events:{click:(e)=>{
                        if(type=='new'){
                            let input = e.target.previousElementSibling;
                            if(input.value.trim() !== ''){
                                actions.push(input.value.trim());
                                SIFA.editor_RenderActions(parent, actions);
                            }
                        }else{
                            confirm('Are you sure you want to delete this action?') ? (() => {
                                actions.splice(actions.indexOf(act), 1);
                                SIFA.editor_RenderActions(parent, actions);
                            })() : null;
                        }
                    }
                }}
            ]});
            if(act !== ''){ action.input.value = act; }
        }
    }
    editorLookup(){
        const SYNTAX = [];
        for(let fieldk in SIFA.elements){
            // Create groupings based on prefix (e.g. field_, label_, button_)
            let prefix = fieldk.split('_')[0];
            let obj = {};
            switch(prefix){
                case 'field': obj = { 'word': fieldk, 'desc': 'Input field', 'tag': prefix }; break;
                case 'label': obj = { 'word': fieldk, 'desc': 'Input label', 'tag': prefix }; break;
                case 'button': obj = { 'word': fieldk, 'desc': 'Button element', 'tag': prefix }; break;
                case 'group': obj = { 'word': fieldk, 'desc': 'Group element', 'tag': prefix }; break;
                case 'ele': obj = { 'word': fieldk, 'desc': 'DOM Elements tagged with class .sifa-element <br/> or user defined class SIFA.settings.targetElement', 'tag': prefix }; break;
            }
            SYNTAX.push(obj);
        }
        for(let action in SIFA.actions){
            let info = SIFA.actions.sifa_actionInfo(action.replace('sifa_', ''));
            if(info){ SYNTAX.push({ word: info.syntax, desc: info ? (info.desc ?? 'No description available') : 'No description available', tag: 'action' }); }
        }
        for(let variable in SIFA.outcome.variables){
            SYNTAX.push({ 'word': variable, 'desc': `Suggestion: sifa_getVariable("${variable}") = ${SIFA.outcome.variables[variable]}`, 'tag': 'variable' });
        }

        // Check if any field is selected for lookup
            if(!SIFA.editor.lookupField){
                alert('Please select a condition or rule field');
                return;
            }
        // Generate lookup window
            SIFA.editor.sifa_lookup = SIFA.genhtml({type:'section', attr:{class:'sifae_lookup_window'}, parent:document.body});
        // Generate lookup field
            SIFA.editor.sifa_lookup.rule = sifa_lookupField(SYNTAX);
            SIFA.editor.sifa_lookup.append(SIFA.editor.sifa_lookup.rule);
        // Populate lookup field with current value
            SIFA.editor.sifa_lookup.rule.input.value = SIFA.editor.lookupField.value;
        
        SIFA.genhtml({type:'button', html:'Close', attr:{style:'display: block; padding: 4px 8px; margin-top: 8px;'}, parent:SIFA.editor.sifa_lookup, events:{click:()=>{
            SIFA.editor.sifa_lookup.remove();
            SIFA.editor.lookupField.focus();
        }}});
    }

    editor_renderValidation(){
        let domParent = SIFA.editor.ele.editor_Window.sifae_content;
        domParent.innerHTML = '';

        let newVal = {"ref": "New", "enable": false, "condition": "", "true_message": "", "false_message": ""};
        SIFA.genhtml({type:'br', parent:domParent});
        SIFA.genhtml({type:'h2', html:'Validations', parent:domParent, children:[
            {type:'button', html:'Add Validation Rule', attr:{class:'sifa-rule-add', style:'margin-left: 16px; padding: 4px 8px;'}, events:{click:()=>{
                SIFA.validationRules.push({...newVal});
                SIFA.editor_renderValidation();
            }}}
        ]});
        SIFA.genhtml({type:'p', html:'<br/>Use this section to build and manage your validation rules.<br/><br/>', parent:SIFA.editor.ele.editor_Window.sifae_content});
        SIFA.genhtml({type:'br', parent:domParent});
        
        for(let rule of SIFA.validationRules){ renderValidationRule('edit', rule); }
        function renderValidationRule(type='new', rule={}){
            let val = SIFA.genhtml({type:'details', parent:domParent, attr:{style:'margin-top: 8px;'}, children:[
                {type:'summary', html:'Validation - ' + (rule.ref ?? 'New')},
                {type:'div', ref:'form', attr:{style:'padding: 8px 12px;'}, children:[
                    {type:'div', ref:'row1', attr:{style:'display:grid; grid-template-columns: 2fr 1fr 30px; gap: 0 8px;'}, children:[
                        {type:'label', html:'Reference'},
                        {type:'label', html:'Enable'},
                        {type:'label', html:''},
                        {type:'input', ref:'ref', attr:{type:'text', style:'width:100%;'}, events:{change:(e)=>{ rule.ref = e.target.value; SIFA.editor_renderValidation(); }}},
                        {type:'select', ref:'enable', attr:{class:'sifa-rule-enable'}, children:[
                            {type:'option', attr:{value:false}, html:'Disable'},
                            {type:'option', attr:{value:true}, html:'Enable'}
                        ], events:{change:(e)=>{ rule.enable = e.target.value; }}},
                        {type:'button', html:'-', attr:{title:'Delete this validation rule', class:'sifa-rule-del'}, events:{click:(e)=>{
                            confirm('Are you sure you want to delete this validation rule?') ? (() => {
                                SIFA.validationRules.splice(SIFA.validationRules.indexOf(rule), 1);
                                SIFA.editor_renderValidation();
                            })() : null;
                        }}}
                    ]},
                    {type:'label', html:'Condition'},
                    {type:'input', ref:'condition', attr:{type:'text', style:'width:100%;'}, events:{change:(e)=>{ rule.condition = e.target.value; }}},
                    {type:'label', html:'True Message'},
                    {type:'input', ref:'true_message', attr:{type:'text', style:'width:100%;'}, events:{change:(e)=>{ rule.true_message = e.target.value; }}},
                    {type:'label', html:'False Message'},
                    {type:'input', ref:'false_message', attr:{type:'text', style:'width:100%;'}, events:{change:(e)=>{ rule.false_message = e.target.value; }}}
                ]}
            ]});

            val.form.row1.ref.value = rule.ref;
            val.form.row1.enable.value = rule.enable;
            val.form.condition.value = rule.condition;
            val.form.true_message.value = rule.true_message;
            val.form.false_message.value = rule.false_message;
        }
    }

    editor_renderVariables(){
        let domParent = SIFA.editor.ele.editor_Window.sifae_content;
        domParent.innerHTML = '';

        let newVal = {newvar: ''};
        SIFA.genhtml({type:'br', parent:domParent});
        SIFA.genhtml({type:'h2', html:'Variables', parent:domParent, children:[
            {type:'button', html:'Add Variable', attr:{class:'sifa-variable-add', style:'margin-left: 16px; padding: 4px 8px;'}, events:{click:()=>{
                SIFA.outcome.variables = {...SIFA.outcome.variables, ...newVal};
                SIFA.editor_renderVariables();
            }}}
        ]});
        SIFA.genhtml({type:'p', html:'<br/>Use this section to manage your variables.<br/><br/>', parent:SIFA.editor.ele.editor_Window.sifae_content});


        SIFA.genhtml({type:'br', parent:domParent});
        let table = SIFA.genhtml({type:'table', parent:domParent, attr:{class:'sifae_var_table', border:'1'}, children:[
            {type:'thead', ref:'thead', children:[
                {type:'tr', children:[
                    {type:'th', html:'Key'},
                    {type:'th', html:'Value'},
                    {type:'th', attr:{width:'24px;'}, html:''}
                ]},
            ]},
            {type:'tbody', ref:'tbody'}
        ]});
        for(let variable in SIFA.outcome.variables){  
            SIFA.genhtml({type:'tr', parent:table.tbody,  children:[
                {type:'td', attr:{style:'font-weight:bold;'}, children:[
                    {type:'input', odata:{originalValue: variable}, attr:{type:'text', value:variable, style:'width:100%;'}, events:{change:(e)=>{
                        let val = e.target.value.trim();
                        let original = e.target.originalValue;
                        SIFA.outcome.variables[val] = SIFA.outcome.variables[original];
                        delete SIFA.outcome.variables[original];
                        SIFA.editor_renderVariables();
                    }}}
                ]},
                {type:'td', children:[
                    {type:'input', attr:{type:'text', value:SIFA.outcome.variables[variable], style:'width:100%;'}, events:{change:(e)=>{
                        SIFA.outcome.variables[variable] = e.target.value;
                        SIFA.editor_renderVariables();
                    }}}
                ]},
                {type:'td', children:[
                    {type:'button', html:'-', attr:{title:'Delete this variable', class:'sifa-rule-del', style:'width: 24px; height: 24px;'}, events:{click:(e)=>{
                        confirm('Are you sure you want to delete this variable?') ? (() => {
                            delete SIFA.outcome.variables[variable];
                            SIFA.editor_renderVariables();
                        })() : null;
                    }}}
                ]}
            ]});
        }
    }
}

function sifa_lookupField(SYNTAX){
    let ele = SIFA.genhtml({type:'div', attr:{class:'sifa-lookup-container'}, children:[
        {type:'textarea',
            ref:'input',
            odata:{
                activeIdx:-1,
                currentMatches:[],
                currentToken:'',
                tokenStart:0,
                setActive: function(idx, sug){
                    const items = sug.children;
                    let target = items[idx];
                    for(let i=0; i<items.length; i++){ items[i].classList.remove('sifae_active'); }
                    if (idx >= 0 && idx < items.length) target.classList.add('sifae_active');
                },
                accept(idx) {
                    if (idx < 0 || idx >= this.currentMatches.length) return;
                    const word = this.currentMatches[idx].word;
                    const val = this.value;
                    const before = val.slice(0, this.tokenStart);
                    const after = val.slice(this.tokenStart + this.currentToken.length);
                    this.value = before + word + after;
                    const newPos = this.tokenStart + word.length;
                    this.setSelectionRange(newPos, newPos);
                    this.focus();
                },
                render() {
                    const pos = this.selectionStart;
                    const { matches, token, start } = this.getSuggestionsTop(pos);
                    this.currentMatches = matches;
                    this.currentToken = token;
                    this.tokenStart = start;
                    this.activeIdx = -1;
                    this.parentNode.sug.innerHTML = matches.map((m, i) =>
                        `<div class="suggestion" data-i="${i}">
                            <span class="s-keyword">${m.word}</span>
                            <span class="s-desc">${m.desc}</span>
                            <span class="s-tag">${m.tag}</span>
                        </div>`
                    ).join('');
                    this.parentNode.sug.querySelectorAll('.suggestion').forEach(el => {
                        el.addEventListener('mousedown', e => {
                            e.preventDefault();
                            this.accept(parseInt(el.dataset.i));
                        });
                    });
                },
                getSuggestionsTop(pos) {
                    const val = this.value;
                    const { token, start } = this.getToken(val, pos);
                    if (!token) return { matches: [], token: '', start };
                    const lower = token.toLowerCase();
                    const matches = SYNTAX.filter(s => s.word.toLowerCase().includes(lower) && s.word !== token)
                        .sort((a, b) => a.word.length - b.word.length);
                    return { matches, token, start };
                },
                getToken(text, pos) {
                    let s = pos - 1;
                    while (s >= 0 && /\w/.test(text[s])) s--; s++;
                    return { token: text.slice(s, pos), start: s };
                }
            },
            attr:{ class:'sifae_lookupfield' },
            events:{
                input:(e)=>{
                    e.target.render();
                },
                keydown:(e)=>{
                    const n = e.target.currentMatches.length;
                    e.key === 'ArrowDown' || e.key === 'ArrowUp' ? e.preventDefault() : null;

                    if (e.key === 'ArrowDown') {
                        e.target.activeIdx = Math.min(e.target.activeIdx + 1, n - 1);
                        e.target.setActive(e.target.activeIdx, e.target.parentNode.sug);
                    } else if (e.key === 'ArrowUp') {
                        e.target.activeIdx = Math.max(e.target.activeIdx - 1, 0);
                        e.target.setActive(e.target.activeIdx, e.target.parentNode.sug);
                    } else if (e.key === 'Enter' || e.key === 'Tab') {
                        if (e.target.activeIdx >= 0) { e.preventDefault(); e.target.accept(e.target.activeIdx); }
                    } else if (e.key === 'Escape') {
                        e.target.sug.style.display = 'none';
                        e.target.activeIdx = -1;
                    }
                },
                change:(e)=>{
                    SIFA.editor.lookupField ? SIFA.editor.lookupField.value = e.target.value : null;
                }   
            }
        },
        {type:'div', ref:'sug', attr:{class:'suggestions', id:'sug', style:'display:block;'}}
    ]});

    ele.input.value = 'sifa';
    ele.input.render();
    return ele;
}
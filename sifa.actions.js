/**
 * =============================================================================
 * SIFA — Developer Defined Custom Actions
 * =============================================================================
 * @file        sifa.actions.js
 * @author      Lee W Winter
 * @version     1.0.0
 * 
 * -----------------------------------------------------------------------------
 * USAGE
 * -----------------------------------------------------------------------------
 * All actions defined in this file will be labeled sifa_actionName.
 * 
 **/


// ELEMENT and VISIBILITY CONTROL
export function hideElement(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.sifaDisplay = ele.style.display;
    ele.style.display = "none";
}
export function showElement(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.style.display = ele.sifaDisplay && ele.sifaDisplay !== "" && ele.sifaDisplay !== "none" ? ele.sifaDisplay : "block";
}
export function setClass(ref, cls){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.classList.add(inputs.cls);
}
export function removeClass(ref, cls){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.classList.remove(inputs.cls);
}
export function toggleClass(ref, cls){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.classList.toggle(inputs.cls);
}
export function setAttribute(ref, attr, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, attr:attr, value:value});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.setAttribute(inputs.attr, inputs.value);
}
export function removeAttribute(ref, attr){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, attr:attr});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.removeAttribute(inputs.attr);
}
export function setElementText(ref, text){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, text:text});
    let ele = sifa_checkElementExists(inputs.ref);
    ele.textContent = inputs.text;
}


// FIELD VALUE CONTROL
export function setValue(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    try{
        switch(type){
            case 'input':
                if(ele.type === 'select-multiple'){
                    if(typeof inputs.value === 'string'){ inputs.value = String(inputs.value).split(',').map(v => v.trim()); }
                    for (let option of ele.options) {
                        option.selected = inputs.value.includes(option.value);
                    }
                }else{
                    ele.value = inputs.value;
                }
            break;
            case 'radio':
                if(typeof inputs.value === 'string' && inputs.value.includes(',')){
                    inputs.value = inputs.value.split(',');
                }
                for(let key in ele){
                    if(typeof inputs.value === 'string' || typeof inputs.value === 'number'){
                        ele[key].checked = inputs.value.toUpperCase() == ele[key].value.toUpperCase() ? true : false;
                    }else if(Array.isArray(inputs.value)){
                        ele[key].checked = inputs.value.some(v => v.toUpperCase() == ele[key].value.toUpperCase()) ? true : false;
                    }
                }
            break;
        }
        SIFA.outcome.answers[inputs.ref] = inputs.value;
    }catch(e){
        console.error(`Error setting value for ${inputs.ref}: ${inputs.value}`, e);
    }
}
export function getValue(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    if(!SIFA.outcome.answers[ref]){ console.warn(`getAnswer: Reference "${ref}" not found in SIFA.outcome.answers.`); return null; }
    let answer = SIFA.outcome.answers[ref];
    return answer;
}
export function clearValue(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    try{
        switch(type){
            case 'input':
                ele.value = '';
            break;
            case 'radio':
                for(let key in ele){
                    ele[key].checked = false;
                }
            break;
        }
        SIFA.outcome.answers[inputs.ref] = null;
    }catch(e){
        console.error(`Error clearing value for ${inputs.ref}`, e);
    }
}
export function clearGroup(ref){
    const { ref: resolvedRef } = sifa_checkIfNestedOutcomeMulti({ ref });
    const el = sifa_checkElementExists(resolvedRef);

    if (!(el instanceof HTMLElement)) return;

    el.querySelectorAll('input, select, textarea, [contenteditable]').forEach(field => {
        try {
            const isCheckable = field.type === 'checkbox' || field.type === 'radio';
            const isContentEditable = field.isContentEditable;

            if (isCheckable) {
                field.checked = false;
                const answerKey = field.sifaRef.split('_').slice(0, -1).join('_');
                SIFA.outcome.answers[answerKey] = [];
            } else if (isContentEditable) {
                field.textContent = '';
                SIFA.outcome.answers[field.sifaRef] = null;
            } else {
                field.value = '';
                if (field.sifaRef) {
                    SIFA.outcome.answers[field.sifaRef] = null;
                } else {
                    console.warn('Field missing sifaRef:', field);
                }
            }
        } catch (e) {
            console.error(`Error clearing field in group ${resolvedRef}:`, e);
        }
    });


    /*
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    if(ele!=undefined && ele instanceof HTMLElement){
        let fields = ele.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            let type = field.type;
            try{
                switch(type){
                    case 'checkbox':
                    case 'radio':
                        field.checked = false;
                        let nref = field.sifaRef.split('_').slice(0, -1).join('_');
                        SIFA.outcome.answers[nref] = [];
                    break;
                    default:
                        field.value = '';
                        SIFA.outcome.answers[field.sifaRef] = null;
                    break;
                }
            }catch(e){
                console.error(`Error clearing field in group ${inputs.ref}:`, e);
            }
            
        });
    }
    */
}
export function hideOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let lops = ele.options ? ele.options : null;
    for(let i=0; i<lops.length; i++){
        if(inputs.options.includes(lops[i].value)){
            lops[i].style.display = "none";
        }
    }
}
export function showOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let lops = ele.options ? ele.options : null;
    for(let i=0; i<lops.length; i++){
        if(inputs.options.includes(lops[i].value)){
            lops[i].style.display = "block";
        }
    }
}
export function addOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    for(let i=0; i<inputs.options.length; i++){
        let opt = document.createElement("option");
        opt.value = inputs.options[i].value;
        opt.text = inputs.options[i].text;
        ele.add(opt);
    }
}
export function removeOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let lops = ele.options ? ele.options : null;
    for(let i=lops.length-1; i>=0; i--){
        if(inputs.options.includes(lops[i].value)){
            ele.remove(i);
        }
    }
}
export function resetOptions(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    let lops = ele.baseOptions ? ele.baseOptions : null;
    if(lops){
        ele.innerHTML = '';
        for(let i=0; i<lops.length; i++){
            let opt = document.createElement("option");
            opt.value = lops[i].value;
            opt.text = lops[i].text;
            ele.add(opt);
        }
        // 
        setValue(inputs.ref, SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : '');
    }
}


// CONDITION CHECKS
export function triggeredField(ref){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        let tref = SIFA.triggerInput ? SIFA.triggerInput.sifaRef.toUpperCase() : null;
        return outputResult("triggeredField", {"ref": inputs.ref.toUpperCase(), "target": tref}, tref == inputs.ref.toUpperCase() ? true : false);
    }catch(e){
        console.log("Error in triggeredField:", e);
        return outputResult("triggeredField", {"ref": inputs.ref.toUpperCase(), "target": tref}, null, e);
    }
}
export function inputHasValue(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref); let ans = ele.value;
    if(ans === null || ans == 'null' || ans ==='NULL' || ans === '' || (Array.isArray(ans) && ans.length === 0) || ans === undefined || ans === 'undefined' || ans == 'UNDEFINED'){
        return outputResult("isAnswered", {"ref": inputs.ref}, false);
    }
    return outputResult("isAnswered", {"ref": inputs.ref}, true);
}
export function inputIsEmpty(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    if(ele.value === '' || ele.value === null || ele.value === undefined || ele.value === 'null' || ele.value === 'undefined' || (Array.isArray(ele.value) && ele.value.length === 0)){
        return outputResult("isEmpty", {"ref": inputs.ref}, true);
    }
    return outputResult("isEmpty", {"ref": inputs.ref}, false);
}
export function inputIsChecked(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ele = sifa_checkElementExists(inputs.ref);
    if(ele[inputs.value]){
        return outputResult("isChecked", {"ref": inputs.ref, "value": inputs.value}, ele[inputs.value].checked);
    }else{
        console.warn(`Reference "${inputs.ref}" does not have a subfield "${inputs.value}".`);
    }
}
export function isGreaterThan(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.threshold) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return outputResult("isGreaterThan", {"value": inputs.value, "threshold": inputs.threshold}, inputs.value > inputs.threshold);
    }catch(e){
        console.log("Error in isGreaterThan:", e);
        return outputResult("isGreaterThan", {"value": inputs.value, "threshold": inputs.threshold}, null, e);
    }
}
export function isLessThan(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.threshold) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return outputResult("isLessThan", {"value": inputs.value, "threshold": inputs.threshold}, inputs.value < inputs.threshold);
    }catch(e){
        console.log("Error in isLessThan:", e);
        return outputResult("isLessThan", {"value": inputs.value, "threshold": inputs.threshold}, null, e);
    }
}
export function isEqualTo(value, target) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, target:target});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.target) ? inputs.target = int_toNumber(inputs.target) : inputs.target = null;
        return outputResult("isEqualTo", {"value": inputs.value, "target": inputs.target}, inputs.value === inputs.target);
    }catch(e){
        console.log("Error in isEqualTo:", e);
        return outputResult("isEqualTo", {"value": inputs.value, "target": inputs.target}, null, e);
    }
}
export function isNotEqualTo(value, target) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, target:target});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.target) ? inputs.target = int_toNumber(inputs.target) : inputs.target = null;
        return outputResult("isNotEqualTo", {"value": inputs.value, "target": inputs.target}, inputs.value !== inputs.target);
    }catch(e){
        console.log("Error in isNotEqualTo:", e);
        return outputResult("isNotEqualTo", {"value": inputs.value, "target": inputs.target}, null, e);
    }
}
export function isGreaterThanOrEqualTo(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return outputResult("isGreaterThanOrEqualTo", {"value": inputs.value, "threshold": inputs.threshold}, inputs.value >= inputs.threshold);
    }catch(e){
        console.log("Error in isGreaterThanOrEqualTo:", e);
        return outputResult("isGreaterThanOrEqualTo", {"value": inputs.value, "threshold": inputs.threshold}, null, e);
    }
}
export function isLessThanOrEqualTo(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return outputResult("isLessThanOrEqualTo", {"value": inputs.value, "threshold": inputs.threshold}, inputs.value <= inputs.threshold);
    }catch(e){
        console.log("Error in isLessThanOrEqualTo:", e);
        return outputResult("isLessThanOrEqualTo", {"value": inputs.value, "threshold": inputs.threshold}, null, e);
    }
}
export function isBetween(value, min, max) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, min:min, max:max});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.min) ? inputs.min = int_toNumber(inputs.min) : inputs.min = null;
        int_isNumber(inputs.max) ? inputs.max = int_toNumber(inputs.max) : inputs.max = null;
        return outputResult("isBetween", {"value": inputs.value, "min": inputs.min, "max": inputs.max}, inputs.value >= inputs.min && inputs.value <= inputs.max);
    }catch(e){
        console.log("Error in isBetween:", e);
        return outputResult("isBetween", {"value": inputs.value, "min": inputs.min, "max": inputs.max}, null, e);
    }
}
export function isBetweenExclusive(value, min, max) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, min:min, max:max});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.min) ? inputs.min = int_toNumber(inputs.min) : inputs.min = null;
        int_isNumber(inputs.max) ? inputs.max = int_toNumber(inputs.max) : inputs.max = null;
        return outputResult("isBetweenExclusive", {"value": inputs.value, "min": inputs.min, "max": inputs.max}, inputs.value > inputs.min && inputs.value < inputs.max);
    }catch(e){
        console.log("Error in isBetweenExclusive:", e);
        return outputResult("isBetweenExclusive", {"value": value, "min": min, "max": max}, null, e);
    }
}


// VARIABLES CONTROL
export function setVariable(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    SIFA.outcome.variables[inputs.ref] = inputs.value;
    return inputs.value;
}
export function getVariable(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    return SIFA.outcome.variables[inputs.ref] !== undefined ? SIFA.outcome.variables[inputs.ref] : null;
}
export function clearVariable(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    SIFA.outcome.variables[inputs.ref] !== undefined ? delete SIFA.outcome.variables[inputs.ref] : null;
}
export function variableEquals(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let varval = SIFA.outcome.variables[inputs.ref] !== undefined ? SIFA.outcome.variables[inputs.ref] : null;
    return varval == inputs.value;
}
export function variableContains(ref, value){
    if (!ref) { console.warn("variableContains: Missing 'ref' argument."); return false; }
    
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});

    if (!SIFA?.outcome?.variables?.[inputs.ref]) {
        console.warn(`Reference "${inputs.ref}" not found in SIFA.outcome.variables.`);
        return false;
    }

    let varval = SIFA.outcome.variables[inputs.ref];
    if (varval && typeof varval.includes === 'function') {
        return varval.includes(inputs.value);
    }

    return false;
}


// ANSWERS CONTROL
export function setAnswers(answer){
    if (!Object.keys(answer).length) return;
    // Merge answers into outcome
    Object.assign(SIFA.outcome.answers, answer);
    // Apply to fields present on the page
    for (const key in SIFA.elements) {
        if (!key.startsWith('field_')) continue;
        const el = SIFA.elements[key];
        const savedAnswer = SIFA.outcome.answers[key];
        if (savedAnswer === undefined) continue; // no answer for this field
        applyAnswerToField(el, savedAnswer);
    }
    // SIFA.hisotry.push({ type: "setAnswers", data: {...SIFA.outcome.answers}, timestamp: new Date().toISOString() });
    return outputResult("setAnswers", { answer }, null, null);

    function applyAnswerToField(el, value) {
        // Group of checkboxes/radios (stored as plain object/array of elements)
        if (!(el instanceof Element)) {
            for (const key in el) {
                const input = el[key];
                if (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'radio')) {
                    input.checked = Array.isArray(value) ? value.includes(key) : value === key;
                }
            }
            return;
        }
        // Multi-select
        if (el instanceof HTMLSelectElement && el.multiple) {
            const selected = Array.isArray(value) ? value : [value];
            Array.from(el.options).forEach(option => {
                option.selected = selected.includes(option.value);
            });
            return;
        }
        // Everything else (input, textarea, single select)
        el.value = value ?? '';
    }
}
export function getAnswers(){
    try{
        return outputResult("getAnswers", {}, SIFA.outcome.answers, null);
    }catch(e){
        console.log("Error in getAnswers:", e);
        return outputResult("getAnswers", {}, null, e);
    }
}
export function copyAnswer(fromRef, toRef){
    let inputs = sifa_checkIfNestedOutcomeMulti({fromRef:fromRef, toRef:toRef});
    if(!SIFA.elements[inputs.fromRef]){ console.warn(`copyAnswer: Reference "${inputs.fromRef}" not found in SIFA.elements.`); return null; }
    if(!SIFA.elements[inputs.toRef]){ console.warn(`copyAnswer: Reference "${inputs.toRef}" not found in SIFA.elements.`); return null; }
    let fromIn = SIFA.elements[inputs.fromRef];
    let toIn = SIFA.elements[inputs.toRef];
    toIn.value = fromIn.value;
}
export function clearAnswers(){
    for (const key in SIFA.elements) {
        if (!key.startsWith('field_')) continue;
        const el = SIFA.elements[key];
        // Group of checkboxes/radios
        if (!(el instanceof Element)) {
            for (const child in el) {
                clearField(el[child]);
            }
            continue;
        }
        clearField(el);
    }

    function clearField(el) {
        if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLSelectElement) && !(el instanceof HTMLTextAreaElement)) return;
        if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
            el.checked = false;
        } else {
            el.value = '';
        }
    }
}


// LOGGING and DEBUGGING
export function addLog(key, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({key:key, value:value});
    SIFA.outcome.logs.push({key: inputs.key, value: inputs.value, timestamp: new Date().toISOString()});
    return true;
}
export function clearLogs(){
    SIFA.outcome.logs = [];
}
export function logAnswer(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    addLog("logAnswer", {"ref": inputs.ref, "value": ans});
}


// FLOW CONTROL
export function stopRules(){
    SIFA.engine.state = false;
}
export async function delayAction(ms){
    let inputs = sifa_checkIfNestedOutcomeMulti({ms:ms});
    return new Promise(resolve => setTimeout(() => {
        addLog("delayAction", {"ms": inputs.ms}, null);
        resolve();
    }, inputs.ms));
}
export async function triggerRule(ruleRef){
    let inputs = sifa_checkIfNestedOutcomeMulti({ruleRef:ruleRef});
    const rule = sifa_findRule(inputs.ruleRef);
    if(!rule){ console.warn(`triggerRule: Rule "${inputs.ruleRef}" not found.`); return; }
    let step = await SIFA.runRule(rule);
    if(step==undefined || step==false){ console.warn(`triggerRule: Rule "${inputs.ruleRef}" did not execute properly.`); return; }
}


// CASTING ACTIONS
export function toNumber(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    const num = Number(inputs.value);
    return outputResult("toNumber", {"value": inputs.value}, isNaN(num) ? null : num);
}
export function toString(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return outputResult("toString", {"value": inputs.value}, inputs.value != null ? String(inputs.value) : null);
}
export function isNumber(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return outputResult("isNumber", {"value": inputs.value}, !isNaN(Number(inputs.value)));
}
export function length(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return outputResult("length", {"value": inputs.value}, inputs.value ? inputs.value.length : null);
}
export function answerEquals(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    if(ans === null){ console.warn(`checkAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(Array.isArray(ans)){
        return outputResult("checkAnswer", {"ref": inputs.ref, "value": inputs.value}, ans.some(a => a == inputs.value));
    }else{
        return outputResult("checkAnswer", {"ref": inputs.ref, "value": inputs.value}, ans == inputs.value);
    }
}
export function answerContains(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    if(ans === null){ console.warn(`checkAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(Array.isArray(ans)){
        return outputResult("checkAnswer", {"ref": inputs.ref, "value": inputs.value}, ans.some(a => a.includes(inputs.value)));
    }else{
        return outputResult("checkAnswer", {"ref": inputs.ref, "value": inputs.value}, ans.includes(inputs.value));
    }
}


// BOM CONTROL
export function addBomItem(item, data){
    let inputs = sifa_checkIfNestedOutcomeMulti({item:item});
    let row = {
        "sku": inputs.item,
        "description": data.description ? data.description : '',
        "revision": data.revision ? data.revision : '',
        "parent_sku": data.parent_sku ? data.parent_sku : '',
        "UOM": data.uom ? data.uom : 'each',
        "quantity": data.quantity ? data.quantity : 1,
        "unitcost": data.unitcost ? data.unitcost : 0, // internal cost to manufacture
        "price": data.price ? data.price : 0
    };
    row = {...row, ...data};
    let rowIndex = Object.keys(SIFA.outcome.mbom).length;
    row.line = rowIndex + 1;
    SIFA.outcome.mbom[row.sku + "_" + row.line] = row;
}
export function removeBomItem(item){
    SIFA.outcome.mbom[item] !== undefined ? delete SIFA.outcome.mbom[item] : null;
}
export function updateBomItem(item, data){
    let inputs = sifa_checkIfNestedOutcomeMulti({item:item});
    if(SIFA.outcome.mbom[inputs.item]){
        SIFA.outcome.mbom[inputs.item] = {...SIFA.outcome.mbom[inputs.item], ...data};
    }
}


// PRICE CALCULATIONS
export function basePrice(set){
    let value = set.value ? set.value : 0;
    let num = int_isNumber(value) ? int_toNumber(value) : null;
    let type = set.type ? set.type : 'unit';
    switch(type){
        case 'percent':
            num = num / 100;
            SIFA.outcome.saleprice = SIFA.outcome.saleprice + (SIFA.outcome.saleprice * num);
        break;
        case 'unit':
            SIFA.outcome.saleprice = SIFA.outcome.saleprice + num;
        break;
    }
}
export function discountPrice(set){
    let value = set.value ? set.value : 0;
    let num = int_isNumber(value) ? int_toNumber(value) : null;
    let type = set.type ? set.type : 'unit';
    switch(type){
        case 'percent':
            num = num / 100;
            SIFA.outcome.saleprice = SIFA.outcome.saleprice - (SIFA.outcome.saleprice * num);
        break;
        case 'unit':
            SIFA.outcome.saleprice = SIFA.outcome.saleprice - num;
        break;
    }
}
export function costPlusPrice(set){
    let value = set.value ? set.value : 0;
    let num = int_isNumber(value) ? int_toNumber(value) : null;
    let cost = SIFA.outcome.unitcost ? SIFA.outcome.unitcost : 0;
    let type = set.type ? set.type : 'unit';
    switch(type){
        case 'percent':
            num = num / 100;
            SIFA.outcome.saleprice = SIFA.outcome.saleprice + (cost * num);
        break;
        case 'unit':
            SIFA.outcome.saleprice = SIFA.outcome.saleprice + (cost + num);
        break;
    }
}


/* Utility Functions */
function sifa_findRule(ref, rulegroups = SIFA.rules) {
    let foundrule = false;
    // loop each rulegroup
    for(const rulegrp of rulegroups) {
        let rules = rulegrp.rules ? rulegrp.rules : [];
        let lookup = rules.find(r => r.ref === ref);
        if(lookup){
            foundrule = lookup;
        }
    }
    return foundrule;
}
function sifa_checkIfNestedOutcomeMulti(set={}){
    let outcome = {};
     for(let key in set){
        if(set[key] && typeof set[key] === 'object' && set[key].outcome !== undefined){
            outcome[key] = set[key].outcome;
        }else{
            outcome[key] = set[key];
        }
    }
    return outcome;
}
function sifa_checkElementExists(ref){
    if(!ref){ console.warn('Element reference is required.'); return false; }
    if(!SIFA.elements[ref]){ console.warn(`Element with reference "${ref}" not found in SIFA.elements.`); return false; }

    let ele = SIFA.elements[ref];
    if(!ele){ console.warn(`Reference "${ref}" not found in SIFA.elements.`); return false; }
    return ele;
}
function sifa_identifyElement(ref){
    let ele = sifa_checkElementExists(ref);
    if(ele && ( ele instanceof HTMLInputElement || ele instanceof HTMLSelectElement || ele instanceof HTMLTextAreaElement) ){
        return 'input';
    }else if( ele && ele instanceof HTMLElement ){
        return ele.tagName.toLowerCase();
    }else if(  ele && !(ele instanceof HTMLElement) && typeof ele === 'object' && Object.keys(ele).length > 0 ){
        return 'radio';
    }else if( ele && Array.isArray(ele) ){
        return 'array';
    }
}
function int_toNumber(value){
    const num = Number(value);
    return isNaN(num) ? null : num;
}
function int_isNumber(value){
    return !isNaN(Number(value));
}
function outputResult(name, inputs, outcome, error=null){
    let valobj = {
        "name": name,
        "inputs": inputs,
        "timestamp": new Date().toISOString(),
        "outcome": outcome,
        "error": error
    };
    addLog(name, valobj);
    return valobj;
}
function genhtml(set){
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

/*
// Local Storage
export function setLocalStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
    return {outcome: true, value: value};
}
export function getLocalStorage(key){
    if(!(key in localStorage)){ return {outcome: false, value: null}; }
    let value = localStorage.getItem(key);
    try{ value = JSON.parse(value); }catch(e){}
    return {outcome: true, value: value};
}
export function removeLocalStorage(key){
    if(!(key in localStorage)){ return {outcome: false}; }
    localStorage.removeItem(key);
    return {outcome: true};
}
*/
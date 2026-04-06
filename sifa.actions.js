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
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.sifaDisplay = ele.style.display;
            ele.style.display = "none";
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function showElement(ref){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.style.display = ele.sifaDisplay && ele.sifaDisplay !== "" && ele.sifaDisplay !== "none" ? ele.sifaDisplay : "block";
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function setClass(ref, cls){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.classList.add(inputs.cls);
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function removeClass(ref, cls){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.classList.remove(inputs.cls);
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function toggleClass(ref, cls){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, cls:cls});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.classList.toggle(inputs.cls);
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function setAttribute(ref, attr, value){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, attr:attr, value:value});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.setAttribute(inputs.attr, inputs.value);
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function removeAttribute(ref, attr){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, attr:attr});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.removeAttribute(inputs.attr);
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function setElementText(ref, text){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, text:text});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.textContent = inputs.text;
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}


// FIELD VALUE CONTROL
export function setValue(ref, value){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            let type = sifa_identifyElement(inputs.ref);
            switch(type){
                case 'input': case 'textarea': case 'select':
                    ele.value = inputs.value;
                break;
                case 'select-multiple':
                    if(typeof inputs.value === 'string'){ inputs.value = String(inputs.value).split(',').map(v => v.trim()); }
                    for (let option of ele.options) {
                        option.selected = inputs.value.includes(option.value);
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
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);
        return false;
    }
}
export function getValue(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    if(!SIFA.outcome.answers[inputs.ref]){ console.warn(`getAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return null; }
    return SIFA.outcome.answers[inputs.ref];
}
export function clearValue(ref){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        let ele = sifa_checkElementExists(inputs.ref);
        let type = sifa_identifyElement(inputs.ref);
        switch(type){
            case 'input': case 'textarea': case 'select': case 'select-multiple': 
                console.log(ele); 
                if(ele.type == 'color'){  ele.value = '#000000'; }else{ ele.value = ''; }
            break;
            case 'radio': for(let key in ele){ ele[key].checked = false; } break;
        }
        SIFA.outcome.answers[inputs.ref] = null;
        return true;
    }catch(e){
        console.warn(e);
        return false;
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
    let type = sifa_identifyElement(inputs.ref);
    if(type == 'select' || type == 'select-multiple'){
        let lops = ele.options ? ele.options : null;
        if(lops!==null){
            for(let i=0; i<lops.length; i++){
                if(inputs.options.includes(lops[i].value)){
                    lops[i].style.display = "none";
                }
            }
            return true;
        }else{ return false; }
    }else{
        return false;
    }
}
export function showOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    if(type == 'select' || type == 'select-multiple'){
        let lops = ele.options ? ele.options : null;
        if(lops!==null){
            for(let i=0; i<lops.length; i++){
                if(inputs.options.includes(lops[i].value)){
                    lops[i].style.display = "block";
                }
            }
            return true;
        }else{ return false; }
    }else{ return false; }
}
export function addOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    if(type == 'select' || type == 'select-multiple'){
        for(let i=0; i<inputs.options.length; i++){
            let opt = document.createElement("option");
            opt.value = inputs.options[i].value;
            opt.text = inputs.options[i].text;
            ele.add(opt);
        }
        return true;
    }else{ console.warn('addOptions requires the input to be a select or select-multiple'); return false; }
}
export function removeOptions(ref, options){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, options:options});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    if(type == 'select' || type == 'select-multiple'){
        let lops = ele.options ? ele.options : null;
        for(let i=lops.length-1; i>=0; i--){
            if(inputs.options.includes(lops[i].value)){
                ele.remove(i);
            }
        }
        return true;
    }else{ console.warn('removeOptions requires the input to be a select or select-multiple'); return false; }
}
export function resetOptions(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    if(type == 'select' || type == 'select-multiple'){
        ele.innerHTML = '';
        let lops = ele.baseOptions ? ele.baseOptions : null;
        for(let i=0; i<lops.length; i++){
            SIFA.genhtml({type:'option', parent:ele, attr:{value:lops[i].value}, html:lops[i].text});
        }
        setValue(inputs.ref, SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : '');
        return true;
    }else{ console.warn('resetOptions requires the input to be a select or select-multiple'); return false; }
}


// CONDITION CHECKS
export function triggeredField(ref){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        if(!SIFA.triggerInput){ return false; }
        let tref = SIFA.triggerInput.sifaRef.toUpperCase();
        let outcome = tref!=null ? tref == inputs.ref.toUpperCase() : false;
        return outcome;
    }catch(e){ console.warn("Error in triggeredField:", e); return false; }
}
export function inputHasValue(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref); 
    let type = sifa_identifyElement(inputs.ref);
    let value = null;
    switch(type){
        case 'radio': for(let rk in ele){ ele[rk].checked ? value = ele[rk].value : null; } break;
        default: value = ele.value; break;
    }
    if(value === null || value === undefined || value === ''){ return false; }else{ return true; }
}
export function inputIsEmpty(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ele = sifa_checkElementExists(inputs.ref); 
    let type = sifa_identifyElement(inputs.ref);
    let value = null;
    switch(type){
        case 'radio': for(let rk in ele){ ele[rk].checked ? value = ele[rk].value : null; } break;
        default: value = ele.value; break;
    }
    if(value === null || value === undefined || value === ''){ return true; }else{ return false; }
}
export function inputIsChecked(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ele = sifa_checkElementExists(inputs.ref);
    let type = sifa_identifyElement(inputs.ref);
    if(type !== 'radio'){ console.warn('inputIsChecked requires the input to be radio/checkbox not ' + type); return false; }

    if(ele[inputs.value]){
        return ele[inputs.value].checked;
    }else{
        console.warn(`Reference "${inputs.ref}" does not have a subfield "${inputs.value}".`);
        return false;
    }
}
export function isGreaterThan(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.threshold) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return inputs.value > inputs.threshold;
    }catch(e){
        console.log("Error in isGreaterThan:", e);
        return false;
    }
}
export function isLessThan(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.threshold) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return inputs.value < inputs.threshold;
    }catch(e){
        console.log("Error in isLessThan:", e);
        return false;
    }
}
export function isEqualTo(value, target) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, target:target});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.target) ? inputs.target = int_toNumber(inputs.target) : inputs.target = null;
        return inputs.value === inputs.target;
    }catch(e){
        console.log("Error in isEqualTo:", e);
        return false;
    }
}
export function isNotEqualTo(value, target) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, target:target});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.target) ? inputs.target = int_toNumber(inputs.target) : inputs.target = null;
        return inputs.value !== inputs.target;
    }catch(e){
        console.log("Error in isNotEqualTo:", e);
        return false;
    }
}
export function isGreaterThanOrEqualTo(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return inputs.value >= inputs.threshold;
    }catch(e){
        console.log("Error in isGreaterThanOrEqualTo:", e);
        return false;
    }
}
export function isLessThanOrEqualTo(value, threshold) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, threshold:threshold});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.threshold) ? inputs.threshold = int_toNumber(inputs.threshold) : inputs.threshold = null;
        return inputs.value <= inputs.threshold;
    }catch(e){
        console.log("Error in isLessThanOrEqualTo:", e);
        return false;
    }
}
export function isBetween(value, min, max) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, min:min, max:max});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.min) ? inputs.min = int_toNumber(inputs.min) : inputs.min = null;
        int_isNumber(inputs.max) ? inputs.max = int_toNumber(inputs.max) : inputs.max = null;
        return (inputs.value >= inputs.min && inputs.value <= inputs.max);
    }catch(e){
        console.log("Error in isBetween:", e);
        return false;
    }
}
export function isBetweenExclusive(value, min, max) {
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({value:value, min:min, max:max});
        int_isNumber(inputs.value) ? inputs.value = int_toNumber(inputs.value) : inputs.value = null;
        int_isNumber(inputs.min) ? inputs.min = int_toNumber(inputs.min) : inputs.min = null;
        int_isNumber(inputs.max) ? inputs.max = int_toNumber(inputs.max) : inputs.max = null;
        return (inputs.value > inputs.min && inputs.value < inputs.max);
    }catch(e){
        console.log("Error in isBetweenExclusive:", e);
        return false;
    }
}


// VARIABLES CONTROL
export function setVariable(ref, value){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
        SIFA.outcome.variables[inputs.ref] = inputs.value;
        return true;
    }catch(e){
        console.warn('setVariable', e);
        return false;
    }
}
export function getVariable(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    if(SIFA.outcome.variables[inputs.ref] === undefined){ console.warn('getVariable could not find ref ' + inputs.ref); return null; }
    return SIFA.outcome.variables[inputs.ref];
}
export function clearVariable(ref){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        if(SIFA.outcome.variables[inputs.ref] === undefined){ console.warn('getVariable could not find ref ' + inputs.ref); return false; }
        delete SIFA.outcome.variables[inputs.ref];
        return true;
    }catch(e){
        console.warn('error running clearVariable', e);
        return false;
    }
}
export function variableEquals(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    if(SIFA.outcome.variables[inputs.ref] === undefined){ console.warn('variableEquals could not find ref ' + inputs.ref); return false; }
    return SIFA.outcome.variables[inputs.ref] == inputs.value;
}
export function variableContains(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    if(SIFA.outcome.variables[inputs.ref] === undefined){ console.warn('variableContains could not find ref ' + inputs.ref); return false; }
    return SIFA.outcome.variables[inputs.ref].includes(inputs.value);
}


// ANSWERS CONTROL
export function setAnswers(answer){
    if (!Object.keys(answer).length) return;
    // Set answers in outcome if the field exists on the page
    for(let fkey in answer){
        if(SIFA.elements[fkey]){
            setValue(fkey, answer[fkey]);
            SIFA.outcome.answers[fkey] = answer[fkey];
        }
    }
}
export function getAnswers(){
    return SIFA.outcome.answers ? SIFA.outcome.answers : {};
}
export function copyAnswer(fromRef, toRef){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({fromRef:fromRef, toRef:toRef});
        if(!SIFA.elements[inputs.fromRef]){ console.warn(`copyAnswer: Reference "${inputs.fromRef}" not found in SIFA.elements.`); return null; }
        if(!SIFA.elements[inputs.toRef]){ console.warn(`copyAnswer: Reference "${inputs.toRef}" not found in SIFA.elements.`); return null; }
        let fromIn = SIFA.elements[inputs.fromRef];
        SIFA.elements[inputs.toRef].value = SIFA.elements[inputs.fromRef].value;
        return true;
    }catch(e){ return false; }
}
export function clearAnswers(){
    // Loop each field // clearValue(ref)
    for (const key in SIFA.elements) {
        if (!key.startsWith('field_')) continue;
        clearValue(key);
    }
}
export function answerEquals(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    if(ans === null){ console.warn(`checkAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(Array.isArray(ans)){
        return ans.some(a => a == inputs.value);
    }else{
        return ans === inputs.value;
    }
}
export function answerContains(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    if(ans === null){ console.warn(`checkAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(Array.isArray(ans)){
        return ans.some(a => a.includes(inputs.value));
    }else{
        return ans.includes(inputs.value);
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
    return new Promise(resolve => setTimeout(() => { resolve(); }, inputs.ms));
}
export function triggerRule(ruleRef){
    let inputs = sifa_checkIfNestedOutcomeMulti({ruleRef:ruleRef});
    const rule = sifa_findRule(inputs.ruleRef);
    if(!rule){ console.warn(`triggerRule: Rule "${inputs.ruleRef}" not found.`); return; }
    return SIFA.runRule(rule);
}


// CASTING ACTIONS
export function toNumber(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    const num = Number(inputs.value);
    return isNaN(num) ? null : num;
}
export function toString(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return inputs.value != null ? String(inputs.value) : null;
}
export function isNumber(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return !isNaN(Number(inputs.value));
}
export function length(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    return inputs.value ? inputs.value.length : null;
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
    if(!SIFA.outcome.mbom[inputs.item]){ console.warn(`updateBomItem: Item "${inputs.item}" not found in MBOM.`); return; }
    SIFA.outcome.mbom[inputs.item] = {...SIFA.outcome.mbom[inputs.item], ...data};
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
    if(ele && ele instanceof HTMLInputElement ){
        return 'input';
    }else if( ele && ele instanceof HTMLSelectElement ){
        if(ele.type === 'select-multiple'){
            return 'select-multiple';
        }else{
            return 'select';
        }
    }else if( ele && ele instanceof HTMLTextAreaElement ){
        return 'textarea';
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
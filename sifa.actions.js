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
export function actionInfo(ref){
    let info = {
        'hideElement': {
            desc: 'Hides the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element to hide.', 
            parameters: ['ref: string - The reference of the element to hide.'],
            syntax: 'sifa_hideElement(ref)'
        },
        'showElement': {
            desc: 'Shows the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element to show.', 
            parameters: ['ref: string - The reference of the element to show.'],
            syntax: 'sifa_showElement(ref)'
        },
        'setClass': {
            desc: 'Adds a class to the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element. <br/> <b>cls</b> = string - The class to add', 
            parameters: ['ref: string - The reference of the element.', 'cls: string - The class to add.'],
            syntax: 'sifa_setClass(ref, cls)'
        },
        'removeClass': {
            desc: 'Removes a class from the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element. <br/> <b>cls</b> = string - The class to remove', 
            parameters: ['ref: string - The reference of the element.', 'cls: string - The class to remove.'],
            syntax: 'sifa_removeClass(ref, cls)'
        },
        'toggleClass': {
            desc: 'Toggles a class on the element that matches the specified reference. <br/> <b>ref</b> = string - the reference of the element. <br/> <b>cls</b> = string - the class to toggle', 
            parameters: ['ref: string - the reference of the element.', 'cls: string - the class to toggle.'],
            syntax: 'sifa_toggleClass(ref, cls)'
        },
        'setAttribute': {
            desc: 'Sets an attribute on the element that matches the specified reference. <br/> <b>ref</b> = string - the reference of the element. <br/> <b>attr</b> = string - the attribute to set. [title, id, alt] <br/> <b>value</b> = string - the value to set.', 
            parameters: ['ref: string - the reference of the element.', 'attr: string - the attribute to set.', 'value: string - the value to set.'],
            syntax: 'sifa_setAttribute(ref, attr, value)'
        },
        'setElementStyle': {
            desc: 'Sets a style property on the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element. <br/> <b>styleProp</b> = string - The style property to set. <br/> <b>value</b> = string - The value to set.', 
            parameters: ['ref: string - the reference of the element.', 'styleProp: string - the style property to set.', 'value: string - the value to set.'],
            syntax: 'sifa_setElementStyle(ref, styleProp, value)'
        },
        'removeAttribute': {
            desc: 'Removes an attribute from the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element. <br/> <b>attr</b> = string - The attribute to remove.', 
            parameters: ['ref: string - The reference of the element.', 'attr: string - The attribute to remove.'],
            syntax: 'sifa_removeAttribute(ref, attr)'
        },
        'setElementText': {
            desc: 'Sets the text content of the element that matches the specified reference. <br/> <b>ref</b> = string - The reference of the element. <br/> <b>text</b> = string - The text to set.', 
            parameters: ['ref: string - The reference of the element.', 'text: string - The text to set.'],
            syntax: 'sifa_setElementText(ref, text)'
        },
        'setValue': {
            desc: 'Sets the value of the specified input field. <br/> <b>ref</b> = string - the reference of the input field. <br/> <b>value</b> = string - the value to set.',
            parameters: ['ref: string - the reference of the input field.', 'value: string - the value to set.'],
            syntax: 'sifa_setValue(ref, value)'
        },
        'getValue': {
            desc: 'Gets the value of the specified input field. <br/> <b>ref</b> = string - the reference of the input field.',
            parameters: ['ref: string - the reference of the input field.'],
            syntax: 'sifa_getValue(ref)'
        },
        'clearValue': {
            desc: 'Clears the value of the specified input field. <br/> <b>ref</b> = string - the reference of the input field.',
            parameters: ['ref: string - the reference of the input field.'],
            syntax: 'sifa_clearValue(ref)'
        },
        'clearGroup': {
            desc: 'Clears all input fields within the specified group element. <br/> <b>ref</b> = string - the reference of the group element.',
            parameters: ['ref: string - the reference of the group element.'],
            syntax: 'sifa_clearGroup(ref)'
        },
        'hideOptions': {
            desc: 'Hides specific options within a select element. <br/> <b>ref</b> = string - the reference of the select element. <br/> <b>options</b> = array - the values of the options to hide.',
            parameters: ['ref: string - the reference of the select element.', 'options: array - the values of the options to hide.'],
            syntax: 'sifa_hideOptions(ref, options)'
        },
        'showOptions': {
            desc: 'Shows specific options within a select element. <br/> <b>ref</b> = string - the reference of the select element. <br/> <b>options</b> = array - the values of the options to show.',
            parameters: ['ref: string - the reference of the select element.', 'options: array - the values of the options to show.'],
            syntax: 'sifa_showOptions(ref, options)'
        },
        'addOptions': {
            desc: 'Adds options to a select element. <br/> <b>ref</b> = string - the reference of the select element. <br/> <b>options</b> = array - the options to add, each option should be an object with "value" and "text" properties.',
            parameters: ['ref: string - the reference of the select element.', 'options: array - the options to add, each option should be an object with "value" and "text" properties.'],
            syntax: 'sifa_addOptions(ref, options)'
        },
        'removeOptions': {
            desc: 'Removes options from a select element. <br/> <b>ref</b> = string - the reference of the select element. <br/> <b>options</b> = array - the values of the options to remove.',
            parameters: ['ref: string - the reference of the select element.', 'options: array - the values of the options to remove.'],
            syntax: 'sifa_removeOptions(ref, options)'
        },
        'resetOptions': {
            desc: 'Resets the options of a select element to its original state. <br/> <b>ref</b> = string - the reference of the select element.',
            parameters: ['ref: string - the reference of the select element.'],
            syntax: 'sifa_resetOptions(ref)'
        },
        'triggeredField': {
            desc: 'Checks if the specified field triggered the current action. <br/> <b>ref</b> = string - the reference of the field to check.',
            parameters: ['ref: string - the reference of the field to check.'],
            syntax: 'sifa_triggeredField(ref)'
        },
        'inputHasValue': {
            desc: 'Checks if the specified input field has a value. <br/> <b>ref</b> = string - the reference of the input field.',
            parameters: ['ref: string - the reference of the input field.'],
            syntax: 'sifa_inputHasValue(ref)'
        },
        'inputIsEmpty': {
            desc: 'Checks if the specified input field is empty. <br/> <b>ref</b> = string - the reference of the input field.',
            parameters: ['ref: string - the reference of the input field.'],
            syntax: 'sifa_inputIsEmpty(ref)'
        },
        'inputIsChecked': {
            desc: 'Checks if the specified radio/checkbox input is checked. <br/> <b>ref</b> = string - the reference of the input field. <br/> <b>value</b> = string - the value of the radio/checkbox to check.',
            parameters: ['ref: string - the reference of the input field.', 'value: string - the value of the radio/checkbox to check.'],
            syntax: 'sifa_inputIsChecked(ref, value)'
        },
        'isGreaterThan': {
            desc: 'Checks if a value is greater than a threshold. <br/> <b>value</b> = string|number - the value to check. <br/> <b>threshold</b> = string|number - the threshold to compare against.',
            parameters: ['value: string|number - the value to check.', 'threshold: string|number - the threshold to compare against.'],
            syntax: 'sifa_isGreaterThan(value, threshold)'
        },
        'isLessThan': {
            desc: 'Checks if a value is less than a threshold. <br/> <b>value</b> = string|number - the value to check. <br/> <b>threshold</b> = string|number - the threshold to compare against.',
            parameters: ['value: string|number - the value to check.', 'threshold: string|number - the threshold to compare against.'],
            syntax: 'sifa_isLessThan(value, threshold)'
        },
        'isEqualTo': {
            desc: 'Checks if a value is equal to a target. <br/> <b>value</b> = string|number - the value to check. <br/> <b>target</b> = string|number - the target to compare against.',
            parameters: ['value: string|number - the value to check.', 'target: string|number - the target to compare against.'],
            syntax: 'sifa_isEqualTo(value, target)'
        },
        'isNotEqualTo': {
            desc: 'Checks if a value is not equal to a target. <br/> <b>value</b> = string|number - the value to check. <br/> <b>target</b> = string|number - the target to compare against.',
            parameters: ['value: string|number - the value to check.', 'target: string|number - the target to compare against.'],
            syntax: 'sifa_isNotEqualTo(value, target)'
        },
        'isGreaterThanOrEqualTo': {
            desc: 'Checks if a value is greater than or equal to a threshold. <br/> <b>value</b> = string|number - the value to check. <br/> <b>threshold</b> = string|number - the threshold to compare against.',
            parameters: ['value: string|number - the value to check.', 'threshold: string|number - the threshold to compare against.'],
            syntax: 'sifa_isGreaterThanOrEqualTo(value, threshold)'
        },
        'isLessThanOrEqualTo': {
            desc: 'Checks if a value is less than or equal to a threshold. <br/> <b>value</b> = string|number - the value to check. <br/> <b>threshold</b> = string|number - the threshold to compare against.',
            parameters: ['value: string|number - the value to check.', 'threshold: string|number - the threshold to compare against.'],
            syntax: 'sifa_isLessThanOrEqualTo(value, threshold)'
        },
        'isBetween': {
            desc: 'Checks if a value is between a minimum and maximum (inclusive). <br/> <b>value</b> = string|number - the value to check. <br/> <b>min</b> = string|number - the minimum threshold. <br/> <b>max</b> = string|number - the maximum threshold.',
            parameters: ['value: string|number - the value to check.', 'min: string|number - the minimum threshold.', 'max: string|number - the maximum threshold.'],
            syntax: 'sifa_isBetween(value, min, max)'
        },
        'isBetweenExclusive': {
            desc: 'Checks if a value is between a minimum and maximum (exclusive). <br/> <b>value</b> = string|number - the value to check. <br/> <b>min</b> = string|number - the minimum threshold. <br/> <b>max</b> = string|number - the maximum threshold.',
            parameters: ['value: string|number - the value to check.', 'min: string|number - the minimum threshold.', 'max: string|number - the maximum threshold.'],
            syntax: 'sifa_isBetweenExclusive(value, min, max)'
        },
        'setVariable': {
            desc: 'Sets a variable in the outcome. <br/> <b>ref</b> = string - the reference of the variable. <br/> <b>value</b> = any - the value to set.',
            parameters: ['ref: string - the reference of the variable.', 'value: any - the value to set.'],
            syntax: 'sifa_setVariable(ref, value)'
        },
        'getVariable': {
            desc: 'Gets a variable from the outcome. <br/> <b>ref</b> = string - the reference of the variable.',
            parameters: ['ref: string - the reference of the variable.'],
            syntax: 'sifa_getVariable(ref)'
        },
        'clearVariable': {
            desc: 'Clears a variable from the outcome. <br/> <b>ref</b> = string - the reference of the variable.',
            parameters: ['ref: string - the reference of the variable.'],
            syntax: 'sifa_clearVariable(ref)'
        },
        'variableEquals': {
            desc: 'Checks if a variable equals a value. <br/> <b>ref</b> = string - the reference of the variable. <br/> <b>value</b> = any - the value to compare against.',
            parameters: ['ref: string - the reference of the variable.', 'value: any - the value to compare against.'],
            syntax: 'sifa_variableEquals(ref, value)'
        },
        'variableContains': {
            desc: 'Checks if a variable (string or array) contains a value. <br/> <b>ref</b> = string - the reference of the variable. <br/> <b>value</b> = any - the value to check for.',
            parameters: ['ref: string - the reference of the variable.', 'value: any - the value to check for.'],
            syntax: 'sifa_variableContains(ref, value)'
        },
        'setAnswers': {
            desc: 'Sets multiple answers in the outcome at once. <br/> <b>answers</b> = object - an object where keys are answer references and values are the answers to set.',
            parameters: ['answers: object - an object where keys are answer references and values are the answers to set.'],
            syntax: 'sifa_setAnswers(answers)'
        },
        'getAnswer': {
            desc: 'Gets an answer from the outcome. <br/> <b>ref</b> = string - the reference of the answer.',
            parameters: ['ref: string - the reference of the answer.'],
            syntax: 'sifa_getAnswer(ref)'
        },
        'copyAnswer': {
            desc: 'Copies the value of one answer to another. <br/> <b>fromRef</b> = string - the reference of the answer to copy from. <br/> <b>toRef</b> = string - the reference of the answer to copy to.',
            parameters: ['fromRef: string - the reference of the answer to copy from.', 'toRef: string - the reference of the answer to copy to.'],
            syntax: 'sifa_copyAnswer(fromRef, toRef)'
        },
        'clearAnswers': {
            desc: 'Clears multiple answers from the outcome. <br/> <b>refs</b> = array - an array of answer references to clear.',
            parameters: ['refs: array - an array of answer references to clear.'],
            syntax: 'sifa_clearAnswers(refs)'
        },
        'answerEquals': {
            desc: 'Checks if an answer equals a value. <br/> <b>ref</b> = string - the reference of the answer. <br/> <b>value</b> = any - the value to compare against.',
            parameters: ['ref: string - the reference of the answer.', 'value: any - the value to compare against.'],
            syntax: 'sifa_answerEquals(ref, value)'
        },
        'answerContains': {
            desc: 'Checks if an answer (string or array) contains a value. <br/> <b>ref</b> = string - the reference of the answer. <br/> <b>value</b> = any - the value to check for.',
            parameters: ['ref: string - the reference of the answer.', 'value: any - the value to check for.'],
            syntax: 'sifa_answerContains(ref, value)'
        },
        'answerNotEmpty': {
            desc: 'Checks if an answer is not empty. <br/> <b>ref</b> = string - the reference of the answer.',
            parameters: ['ref: string - the reference of the answer.'],
            syntax: 'sifa_answerNotEmpty(ref)'
        },
        'addLog': {
            desc: 'Adds a log entry to the outcome. <br/> <b>message</b> = string - the log message to add.',
            parameters: ['message: string - the log message to add.'],
            syntax: 'sifa_addLog(message)'
        },
        'getLogs': {
            desc: 'Gets all log entries from the outcome.',
            parameters: [],
            syntax: 'sifa_getLogs()'
        },
        'clearLogs': {
            desc: 'Clears all log entries from the outcome.',
            parameters: [],
            syntax: 'sifa_clearLogs()'
        },
        'stopRules': {
            desc: 'Stops further rule processing for the current trigger.',
            parameters: [],
            syntax: 'sifa_stopRules()'
        },
        'delayAction': {
            desc: 'Delays the execution of an action by a specified amount of time. <br/> <b>action</b> = function - the action to delay. <br/> <b>delay</b> = number - the delay in milliseconds.',
            parameters: ['action: function - the action to delay.', 'delay: number - the delay in milliseconds.'],
            syntax: 'sifa_delayAction(action, delay)'
        },
        'triggerRule': {
            desc: 'Triggers a rule by its reference. <br/> <b>ref</b> = string - the reference of the rule to trigger.',
            parameters: ['ref: string - the reference of the rule to trigger.'],
            syntax: 'sifa_triggerRule(ref)'
        },
        'toNumber': {
            desc: 'Converts a value to a number. <br/> <b>value</b> = any - the value to convert. <br/> If the value cannot be converted to a number, it returns NaN.',
            parameters: ['value: any - the value to convert.'],
            syntax: 'sifa_toNumber(value)'
        },
        'toString': {
            desc: 'Converts a value to a string. <br/> <b>value</b> = any - the value to convert.',
            parameters: ['value: any - the value to convert.'],
            syntax: 'sifa_toString(value)'
        },
        'isNumber': {
            desc: 'Checks if a value is a number. <br/> <b>value</b> = any - the value to check.',
            parameters: ['value: any - the value to check.'],
            syntax: 'sifa_isNumber(value)'
        },
        'length': {
            desc: 'Gets the length of a value (string or array). <br/> <b>value</b> = any - the value to get the length of.',
            parameters: ['value: any - the value to get the length of.'],
            syntax: 'sifa_length(value)'
        },
        'upperCase': {
            desc: 'Converts a string to uppercase. <br/> <b>value</b> = string - the string to convert.',
            parameters: ['value: string - the string to convert.'],
            syntax: 'sifa_upperCase(value)'
        },
        'lowerCase': {
            desc: 'Converts a string to lowercase. <br/> <b>value</b> = string - the string to convert.',
            parameters: ['value: string - the string to convert.'],
            syntax: 'sifa_lowerCase(value)'
        },
        'upperLowerCase': {
            desc: 'Converts a string to uppercase or lowercase based on a condition. <br/> <b>value</b> = string - the string to convert. <br/> <b>toCase</b> = string - "upper" to convert to uppercase, "lower" to convert to lowercase.',
            parameters: ['value: string - the string to convert.', 'toCase: string - "upper" to convert to uppercase, "lower" to convert to lowercase.'],
            syntax: 'sifa_upperLowerCase(value, toCase)'
        },
        'addition': {
            desc: 'Adds two numbers together. <br/> <b>value1</b> = number - the first value. <br/> <b>value2</b> = number - the second value.',
            parameters: ['value1: number - the first value.', 'value2: number - the second value.'],
            syntax: 'sifa_addition(value1, value2)'
        },
        'subtraction': {
            desc: 'Subtracts the second number from the first. <br/> <b>value1</b> = number - the first value. <br/> <b>value2</b> = number - the second value.',
            parameters: ['value1: number - the first value.', 'value2: number - the second value.'],
            syntax: 'sifa_subtraction(value1, value2)'
        },
        'multiplication': {
            desc: 'Multiplies two numbers together. <br/> <b>value1</b> = number - the first value. <br/> <b>value2</b> = number - the second value.',
            parameters: ['value1: number - the first value.', 'value2: number - the second value.'],
            syntax: 'sifa_multiplication(value1, value2)'
        },
        'division': {
            desc: 'Divides the first number by the second. <br/> <b>value1</b> = number - the first value. <br/> <b>value2</b> = number - the second value.',
            parameters: ['value1: number - the first value.', 'value2: number - the second value.'],
            syntax: 'sifa_division(value1, value2)'
        },
        'addBomItem': {
            desc: 'Adds an item to the Bill of Materials to SIFA.outcome.mbom <br/> <b>item</b> = String SKU / Part Number <br/><br/> <ul><li>description</li><li>revision</li><li>parent_sku</li><li>UOM</li><li>quantity</li><li>unitcost</li><li>price</li></ul> <br/> Additional key-value pairs can be included in the item object as needed. <br/> The example above shows the prebuilt keys that SIFA will recognize',
            parameters: ['item: object - the item to add, should have properties like "sku", "description", "revision", "parent_sku", "UOM", "quantity", "unitcost", "price", etc.'],
            syntax: 'sifa_addBomItem(item, {key: "value"})'
        },
        'removeBomItem': {
            desc: 'Removes an item from the Bill of Materials from SIFA.outcome.mbom. <br/> <b>item</b> = String SKU / Part Number',
            parameters: ['item: string - the SKU or identifier of the item to remove.'],
            syntax: 'sifa_removeBomItem(item)'
        },
        'updateBomItem': {
            desc: 'Updates an item in the Bill of Materials to SIFA.outcome.mbom. <br/> <b>item</b> = String SKU / Part Number <br/><br/> <ul><li>description</li><li>revision</li><li>parent_sku</li><li>UOM</li><li>quantity</li><li>unitcost</li><li>price</li></ul> <br/> Additional key-value pairs can be included in the item object as needed. <br/> The example above shows the prebuilt keys that SIFA will recognize',
            parameters: ['item: string - the SKU or identifier of the item to update.', 'updates: object - an object with the properties to update, e.g. {quantity: 10, cost: 5.99}'],
            syntax: 'sifa_updateBomItem(item, {key: "value"})'
        },
        'basePrice': {
            desc: 'Calculates and sets a base price. <br/> Price + Unit <br/> set = {type: percent | unit, value: number}',
            parameters: ['set: Object{type: percent | unit, value: number}'],
            syntax: 'sifa_basePrice({type: "unit", value: 0})'
        },
        'discountPrice': {
            desc: 'Calculates the price after applying a discount. <br/> set = {type: percent | unit, value: number}',
            parameters: ['set: Object{type: percent | unit, value: number}'],
            syntax: 'sifa_discountPrice({type: "unit", value: 0})'
        },
        'costPlusPrice': {
            desc: 'Calculates the price using a cost-plus method. <br/> set = {type: percent | unit, value: number}',
            parameters: ['set: Object{type: percent | unit, value: number}'],
            syntax: 'sifa_costPlusPrice({type: "unit", value: 0})'
        },
        'getPrice': {
            desc: 'Returns the current price from SIFA.outcome.saleprice',
            parameters: [],
            syntax: 'sifa_getPrice()'
        },
        'getCost': {
            desc: 'Returns the current cost from SIFA.outcome.unitcost',
            parameters: [],
            syntax: 'sifa_getCost()'
        }
    };
    return info[ref] ? info[ref] : null;
}

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
export function setElementStyle(ref, styleProp, value){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, styleProp:styleProp, value:value});
        let ele = sifa_checkElementExists(inputs.ref);
        if(ele){
            ele.style[inputs.styleProp] = inputs.value;
            return true;
        }else{ return false; }
    }catch(e){
        console.warn(e);        return false;
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
            if(hasHTML(inputs.text)){
                ele.innerHTML = inputs.text;
            }else{
                ele.textContent = inputs.text;
            }
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
    if(SIFA.outcome.answers[inputs.ref] === undefined){ console.warn(`getAnswer: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return null; }
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
export function checkPattern(string, pattern){
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({string:string, pattern:pattern});
        let regex = new RegExp(inputs.pattern);
        return regex.test(inputs.string);
    }catch(e){
        console.warn("Error in checkPattern:", e);
        return false;
    }
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
    if(ans === undefined){ console.warn(`answerEquals: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(Array.isArray(ans)){
        return ans.some(a => a == inputs.value);
    }else{
        return ans === inputs.value;
    }
}
export function answerContains(ref, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, value:value});
    if(SIFA.outcome.answers[inputs.ref] === undefined){ console.warn(`answerContains: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return false; }

    let ans = SIFA.outcome.answers[inputs.ref];
    if(ans === null || ans === undefined){ return false; }

    if(Array.isArray(ans)){
        return ans.some(a => a.includes(inputs.value));
    }else{
        return ans.includes(inputs.value);
    }
}
export function answerNotEmpty(ref){
    let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
    let ans = SIFA.outcome.answers[inputs.ref] ? SIFA.outcome.answers[inputs.ref] : null;
    if(ans === undefined){ console.warn(`answerNotEmpty: Reference "${inputs.ref}" not found in SIFA.outcome.answers.`); return; }
    if(ans === null || ans === undefined){ return false; }
    return true;
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
export function upperCase(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    if(!inputs.value){ return undefined; }
    if(Array.isArray(inputs.value)){
        return inputs.value.map(v => v.toUpperCase());
    }else{
        return String(inputs.value).toUpperCase();
    }
}
export function lowerCase(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    if(!inputs.value){ return undefined; }
    if(Array.isArray(inputs.value)){
        return inputs.value.map(v => v.toLowerCase());
    }else{
        return String(inputs.value).toLowerCase();
    }
}
export function upperLowerCase(value){
    let inputs = sifa_checkIfNestedOutcomeMulti({value:value});
    if(!inputs.value){ return undefined; }
    if(Array.isArray(inputs.value)){
        return inputs.value.map(v => {
            let str = String(v);
            return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        });
    }else{
        let str = String(inputs.value);
        return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
}
export function addition(value1, value2){
    let inputs = sifa_checkIfNestedOutcomeMulti({value1:value1, value2:value2});
    let num1 = Number(inputs.value1);
    let num2 = Number(inputs.value2);
    if(isNaN(num1) || isNaN(num2)){ return null; }
    return num1 + num2;
}
export function subtraction(value1, value2){
    let inputs = sifa_checkIfNestedOutcomeMulti({value1:value1, value2:value2});
    let num1 = Number(inputs.value1);
    let num2 = Number(inputs.value2);
    if(isNaN(num1) || isNaN(num2)){ return null; }
    return num1 - num2;
}
export function multiplication(value1, value2){
    let inputs = sifa_checkIfNestedOutcomeMulti({value1:value1, value2:value2});
    let num1 = Number(inputs.value1);
    let num2 = Number(inputs.value2);
    if(isNaN(num1) || isNaN(num2)){ return null; }
    return num1 * num2;
}
export function division(value1, value2){
    let inputs = sifa_checkIfNestedOutcomeMulti({value1:value1, value2:value2});
    let num1 = Number(inputs.value1);
    let num2 = Number(inputs.value2);
    if(isNaN(num1) || isNaN(num2) || num2 === 0){ return null; }
    return num1 / num2;
}

// BOM CONTROL
export function addBomItem(item, data){
    let inputs = sifa_checkIfNestedOutcomeMulti({item:item});
    let row = {
        "sku": data.sku ? data.sku : inputs.item,
        "description": data.description ? data.description : '',
        "revision": data.revision ? data.revision : '',
        "parent_sku": data.parent_sku ? data.parent_sku : '',
        "UOM": data.uom ? data.uom : 'each',
        "quantity": data.quantity ? data.quantity : 1,
        "unitcost": data.unitcost ? data.unitcost : 0, // internal cost to manufacture
        "price": data.price ? data.price : 0
    };
    row = {...row, ...data};
    SIFA.outcome.mbom[inputs.item] = row;
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

// Set or update a named price line
export function addPriceLine(ref='', label='', type='', amount=0, method='UNIT'||'PERCENT', enabled=true){
    if(ref=='' || label=='' || type=='' || amount==0){ return false; }
    if(method.toUpperCase()!='UNIT' && method.toUpperCase()!='PERCENT'){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref, label:label, type:type, amount:amount, method:method, enabled:enabled});
        SIFA.outcome.priceLedger.lines[inputs.ref] = {"label":inputs.label, "type":inputs.type, "amount":inputs.amount, "method":inputs.method, "enabled":inputs.enabled};
        return true;
    }catch(e){
        console.error('addPriceLine', e);
        return false;
    }
}
export function removePriceLine(ref=''){
    if(ref==''){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        SIFA.outcome.priceLedger.lines[inputs.ref] ? delete SIFA.outcome.priceLedger.lines[inputs.ref] : null;
        return true;
    }catch(e){
        console.error('removePriceLine', e);
        return false; 
    }
}
export function enablePriceLine(ref=''){
    if(ref==''){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        SIFA.outcome.priceLedger.lines[inputs.ref] ? SIFA.outcome.priceLedger.lines[inputs.ref].enabled = true : null;
        return true;
    }catch(e){
        console.error('enablePriceLine', e);
        return false;
    }
}
export function disablePriceLine(ref){
    if(ref==''){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        SIFA.outcome.priceLedger.lines[inputs.ref] ? SIFA.outcome.priceLedger.lines[inputs.ref].enabled = false : null;
        return true;
    }catch(e){
        console.error('disablePriceLine', e);
        return false;
    }
}
export function getPriceLine(ref=''){
    if(ref==''){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({ref:ref});
        return SIFA.outcome.priceLedger.lines[inputs.ref] ? SIFA.outcome.priceLedger.lines[inputs.ref].amount : false;
    }catch(e){
        console.error('getPriceLine', e);
        return false;
    }
}
export function getPriceTypeTotal(type=''){
    if(type==''){ return false; }
    try{
        let inputs = sifa_checkIfNestedOutcomeMulti({type:type});
        let total = 0;
        for(const [ref, line] of Object.entries(SIFA.outcome.priceLedger.lines)){
            const method = line.method.toUpperCase() || 'UNIT';
            let amount = line.amount || 0;
            if(line.type.toUpperCase() == inputs.type.toUpperCase()){
                if(method == 'PERCENT'){
                    total = (total * amount);
                }else{
                    total += amount;
                }
            }
        }
        return total;
    }catch(e){
        console.error('getPriceTypeTotal', e);
        return false;
    }
}
export function getPriceTotal(){
    return SIFA.outcome.priceLedger.total;
}
export function getPriceTax(){
    return SIFA.outcome.priceLedger.tax;
}
export function getPriceCost(){
    return SIFA.outcome.priceLedger.unitcost;
}

// Local Storage
export function setLocalStorage(key, value){
    let inputs = sifa_checkIfNestedOutcomeMulti({key:key, value:value});
    try{
        localStorage.setItem(inputs.key, JSON.stringify(inputs.value));
        return true;
    }catch(e){
        console.error('setLocalStorage', e);
        return false;
    }
}
export function getLocalStorage(key){
    let inputs = sifa_checkIfNestedOutcomeMulti({key:key});
    try {
        if(!(inputs.key in localStorage)){ return false; }
        let value = localStorage.getItem(key);
        try{ value = JSON.parse(value); }catch(e){}
        return value;
    }catch(e){
        console.error('getLocalStorage', e);
        return false;
    }
}
export function removeLocalStorage(key){
    let inputs = sifa_checkIfNestedOutcomeMulti({key:key});
    try {
        if(!(inputs.key in localStorage)){ return false; }
        localStorage.removeItem(inputs.key);
        return true;
    }catch(e){
        console.error('removeLocalStorage', e);
        return false;
    }
}

export function exportSIFAConfig(){
    let config = {};
    config.rules = SIFA.rules;
    config.validationRules = SIFA.validationRules;
    config.answers = SIFA.outcome.answers;
    config.variables = SIFA.outcome.variables;
    config.debug = SIFA.settings.debug;
    config.editMode = SIFA.settings.editMode;
    config.targetElement = SIFA.settings.targetElement;
    config.targetGroup = SIFA.settings.targetGroup;
    config.targetInput = SIFA.settings.targetInput;
    config.targetValidation = SIFA.settings.targetValidation;
    config.taxRate = SIFA.settings.taxRate;
    return JSON.stringify(config, null, 2);
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
function hasHTML(str) {
    return /<[a-z][\s\S]*>/i.test(str);
}
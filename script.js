// Variables for pen properties and control
let penColor = 'black';
let penSize = 1;
const variables = {};
let currentSound = null;

// Save actions array
const savedActions = [];

// Handle drag and drop functionality
const assets = document.querySelectorAll('.asset');
const workspace = document.getElementById('workspace');
const preview = document.getElementById('preview');

assets.forEach(asset => {
    asset.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });
});

workspace.addEventListener('dragover', e => {
    e.preventDefault();
});

workspace.addEventListener('drop', e => {
    e.preventDefault();
    const assetId = e.dataTransfer.getData('text/plain');
    const asset = document.getElementById(assetId);
    const clone = document.createElement('div');
    clone.classList.add('workspace-asset');
    clone.style.position = 'absolute';
    clone.style.left = `${e.offsetX}px`;
    clone.style.top = `${e.offsetY}px`;
    clone.style.width = '120px';
    clone.style.height = '90px';
    clone.style.transform = 'rotate(0deg)'; // Initialize rotation

    const img = document.createElement('img');
    img.src = asset.getAttribute('data-image');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    clone.appendChild(img);
    workspace.appendChild(clone);
});

// Play button functionality
const playButton = document.getElementById('play-button');
playButton.addEventListener('click', () => {
    executeSavedActions();
});

// Script handling
const scriptInput = document.getElementById('script-input');
const runScriptButton = document.getElementById('run-script');

runScriptButton.addEventListener('click', () => {
    const script = scriptInput.value;
    executeScript(script);
});

function executeScript(script) {
    const commands = script.split('\n').filter(cmd => cmd.trim() !== ''); // Filter out empty lines
    commands.forEach(command => {
        const [action, ...args] = command.split(' ');
        handleCommand(action, args);
        // Save the action
        savedActions.push(command);
        updateSavedActionsList();
    });
}

function executeSavedActions() {
    let index = 0;

    function executeNext() {
        if (index < savedActions.length) {
            const [action, ...args] = savedActions[index].split(' ');
            handleCommand(action, args);
            index++;
            setTimeout(executeNext, 1000); // Adjust the delay between actions as needed
        }
    }

    executeNext();
}

function handleCommand(action, args) {
    const workspaceAssets = document.querySelectorAll('.workspace-asset');
    workspaceAssets.forEach(asset => {
        switch (action) {
            case 'move':
                moveCharacter(asset, args);
                break;
            case 'turn':
                turnCharacter(asset, args);
                break;
            case 'run':
                runCharacter(asset, args);
                break;
            case 'say':
                sayCharacter(asset, args);
                break;
            case 'think':
                thinkCharacter(asset, args);
                break;
            case 'play-sound':
                playSound(args);
                break;
            case 'stop-sound':
                stopAllSounds();
                break;
            case 'set-variable':
                setVariable(args);
                break;
            case 'change-variable':
                changeVariable(args);
                break;
            case 'show-variable':
                showVariable(args);
                break;
            case 'loop':
                executeLoop(args);
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    });
}

function executeLoop([iterations, ...commands]) {
    const loopCount = parseInt(iterations, 10) || 1;
    const script = commands.join(' ');

    let currentIteration = 0;
    const interval = setInterval(() => {
        if (currentIteration < loopCount) {
            executeScript(script);
            currentIteration++;
            showIterationCompletion(currentIteration);
        } else {
            clearInterval(interval);
        }
    }, 1000); // Adjust the interval time as needed
}

function showIterationCompletion(iteration) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('iteration-message');
    messageElement.textContent = `Iteration ${iteration} completed`;
    messageElement.style.position = 'absolute';
    messageElement.style.top = '10px';
    messageElement.style.left = '10px';
    messageElement.style.backgroundColor = 'lightblue';
    messageElement.style.padding = '5px';
    messageElement.style.borderRadius = '3px';
    workspace.appendChild(messageElement);
    
    // Remove message after some time
    setTimeout(() => {
        workspace.removeChild(messageElement);
    }, 2000); // Adjust the time as needed
}

function moveCharacter(character, [direction]) {
    const distanceInput = document.querySelector(`#move-${direction}-distance`);
    if (!distanceInput) {
        console.log(`Distance input for direction ${direction} not found.`);
        return;
    }
    const distance = parseInt(distanceInput.value, 10) || 0;
    const style = character.style;

    let left = parseInt(style.left, 10) || 0;
    let top = parseInt(style.top, 10) || 0;

    switch (direction) {
        case 'left':
            style.left = `${left - distance}px`;
            break;
        case 'right':
            style.left = `${left + distance}px`;
            break;
        case 'up':
            style.top = `${top - distance}px`;
            break;
        case 'down':
            style.top = `${top + distance}px`;
            break;
        default:
            console.log(`Unknown direction: ${direction}`);
    }
}

function turnCharacter(character, [direction]) {
    const angleInput = document.querySelector(`#turn-${direction}-angle`);
    if (!angleInput) {
        console.log(`Angle input for direction ${direction} not found.`);
        return;
    }
    const angle = parseInt(angleInput.value, 10) || 0;
    const style = character.style;
    const currentRotation = parseInt(style.transform.replace('rotate(', '').replace('deg)', ''), 10) || 0;

    // Adjust the angle based on the direction
    let newRotation;
    if (direction === 'left') {
        newRotation = currentRotation - angle;
    } else if (direction === 'right') {
        newRotation = currentRotation + angle;
    } else {
        console.log(`Unknown direction: ${direction}`);
        return;
    }

    // Ensure the rotation value stays within the 0-360 degrees range
    newRotation = (newRotation + 360) % 360;
    style.transform = `rotate(${newRotation}deg)`;
}

function runCharacter(character) {
    console.log('Running character');
}

function createMessageElement(message, x, y, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-text', type);
    messageElement.textContent = message;
    messageElement.style.position = 'absolute';
    messageElement.style.left = `${x}px`;
    messageElement.style.top = `${y}px`;
    messageElement.style.whiteSpace = 'nowrap';
    messageElement.style.backgroundColor = type === 'say' ? 'lightgreen' : 'lightyellow'; // Different colors for say and think
    messageElement.style.padding = '5px';
    messageElement.style.borderRadius = '3px';
    messageElement.style.border = '1px solid black';
    workspace.appendChild(messageElement);
}

function sayCharacter(character, [message]) {
    const timesInput = document.getElementById('say-times');
    const times = parseInt(timesInput.value, 10) || 1;
    const rect = character.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    const offsetX = rect.left - workspaceRect.left;
    const offsetY = rect.top - workspaceRect.top;

    // Use custom message if provided
    const displayMessage = message || "I am saying"; // Default to "I am saying" if no message is provided

    for (let i = 0; i < times; i++) {
        createMessageElement(displayMessage, offsetX + 20, offsetY - (i * 30) - 40, 'say');
    }
}

function thinkCharacter(character, [message]) {
    const timesInput = document.getElementById('think-times');
    const times = parseInt(timesInput.value, 10) || 1;
    const rect = character.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    const offsetX = rect.left - workspaceRect.left;
    const offsetY = rect.top - workspaceRect.top;

    // Use custom message if provided
    const displayMessage = message || "I am thinking"; // Default to "I am thinking" if no message is provided

    for (let i = 0; i < times; i++) {
        createMessageElement(displayMessage, offsetX + 20, offsetY - (i * 30) - 40, 'think');
    }
}

function playSound([sound]) {
    stopAllSounds();
    const audio = new Audio(sound);
    audio.play();
    currentSound = audio;
}

function stopAllSounds() {
    if (currentSound) {
        currentSound.pause();
        currentSound.currentTime = 0;
    }
}

function setVariable([name, value]) {
    variables[name] = value;
    console.log(`Variable ${name} set to ${value}`);
}

function changeVariable([name, value]) {
    if (variables[name] !== undefined) {
        variables[name] += parseInt(value, 10);
        console.log(`Variable ${name} changed to ${variables[name]}`);
    }
}

function showVariable([name]) {
    if (variables[name] !== undefined) {
        console.log(`Variable ${name}: ${variables[name]}`);
    }
}

// Control buttons functionality
document.getElementById('move-left').addEventListener('click', () => {
    executeScript(`move left`);
});

document.getElementById('move-right').addEventListener('click', () => {
    executeScript(`move right`);
});

document.getElementById('move-up').addEventListener('click', () => {
    executeScript(`move up`);
});

document.getElementById('move-down').addEventListener('click', () => {
    executeScript(`move down`);
});

document.getElementById('turn-left').addEventListener('click', () => {
    executeScript(`turn left`);
});

document.getElementById('turn-right').addEventListener('click', () => {
    executeScript(`turn right`);
});

document.getElementById('run').addEventListener('click', () => {
    executeScript('run');
});

document.getElementById('play-sound').addEventListener('click', () => {
    const soundSelect = document.getElementById('sound-select');
    const sound = soundSelect.value;
    executeScript(`play-sound ${sound}`);
});

document.getElementById('stop-sound').addEventListener('click', () => {
    executeScript('stop-sound');
});

document.getElementById('set-variable').addEventListener('click', () => {
    executeScript('set-variable myVar 10');
});

document.getElementById('change-variable').addEventListener('click', () => {
    executeScript('change-variable myVar 5');
});

document.getElementById('show-variable').addEventListener('click', () => {
    executeScript('show-variable myVar');
});

// Loop button functionality
document.getElementById('start-loop').addEventListener('click', () => {
    const loopCountInput = document.getElementById('loop-count');
    const loopCount = parseInt(loopCountInput.value, 10) || 1;

    // Get selected operations from the dropdown
    const selectedOptions = Array.from(document.getElementById('loop-operations').selectedOptions);
    const directions = selectedOptions.map(option => option.value);

    // Construct the script based on selected options
    let script = '';
    directions.forEach(direction => {
        script += `${direction}\n`;
    });

    // Execute the loop with the constructed script
    executeScript(`loop ${loopCount} ${script}`);
});

// Say button functionality
document.getElementById('say-button').addEventListener('click', () => {
    const messageInput = document.getElementById('say-message');
    const message = messageInput.value;
    executeScript(`say ${message}`);
});

// Update saved actions list
function updateSavedActionsList() {
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = ''; // Clear current list

    savedActions.forEach((action, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = action;

        // Create and append delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            savedActions.splice(index, 1); // Remove action from array
            updateSavedActionsList(); // Update list display
        });
        
        listItem.appendChild(deleteButton);
        actionsList.appendChild(listItem);
    });
}
function changeCharacterSize(size) {
    const workspaceAssets = document.querySelectorAll('.workspace-asset img');
    workspaceAssets.forEach(img => {
        const newSize = parseInt(size, 10) || 1000; // Default to 100px if invalid
        img.style.width = `${newSize}px`;
        img.style.height = 'auto'; // Maintain aspect ratio
    });
}

document.getElementById('change-size-button').addEventListener('click', () => {
    const sizeInput = document.getElementById('size-input');
    const size = sizeInput.value;
    changeCharacterSize(size);
});
// Variables for storing wait times
const waitTimes = [];

// Function to execute saved actions with delays
function executeSavedActions() {
    let index = 0;

    function executeNext() {
        if (index < savedActions.length) {
            const [action, ...args] = savedActions[index].split(' ');
            if (action === 'wait') {
                const waitTime = parseInt(args[0], 10) * 1000;
                showWaitTimer(waitTime);
                setTimeout(() => {
                    handleCommand(action, args);
                    index++;
                    executeNext();
                }, waitTime);
            } else {
                handleCommand(action, args);
                index++;
                setTimeout(executeNext, 1000);
            }
        }
    }

    executeNext();
}


function showWaitTimer(duration) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('wait-timer');
    messageElement.textContent = `Waiting for ${duration / 1000} seconds...`;
    messageElement.style.position = 'absolute';
    messageElement.style.top = '10px';
    messageElement.style.left = '10px';
    messageElement.style.backgroundColor = 'lightcoral';
    messageElement.style.padding = '5px';
    messageElement.style.borderRadius = '3px';
    workspace.appendChild(messageElement);
    
    // Remove message after duration
    setTimeout(() => {
        workspace.removeChild(messageElement);
    }, duration);
}

document.getElementById('wait-button').addEventListener('click', () => {
    const waitInput = document.getElementById('wait-input');
    const waitTime = waitInput.value;
    if (waitTime) {
        savedActions.push(`wait ${waitTime}`);
        updateSavedActionsList(); // Update list display
    }
});

// Other existing event listeners...


document.getElementById('wait-button').addEventListener('click', function() {
    const waitInput = document.getElementById('wait-input');
    const waitTimeDisplay = document.getElementById('wait-time');
    const waitTimer = document.getElementById('wait-timer');

    let waitTime = parseInt(waitInput.value, 10); // Get wait time in seconds
    if (isNaN(waitTime) || waitTime < 0) {
        // Handle invalid input
        alert('Please enter a valid number greater than or equal to 0.');
        return;
    }

    // Show the wait timer
    waitTimer.style.display = 'block';
    waitTimeDisplay.textContent = waitTime;

    // Function to handle the wait operation
    const countdown = setInterval(function() {
        waitTime--;
        waitTimeDisplay.textContent = waitTime;

        if (waitTime < 0) {
            clearInterval(countdown);
            waitTimer.style.display = 'none'; // Hide the timer
            // Resume normal operations here
            performNextOperation();
        }
    }, 1000); // Update every second
});

// Function to perform the next operation after the wait time
function performNextOperation() {
    // Place your logic here to continue with the next operation
    console.log('Next operation triggered.');
    // For example, you might call a function to move the character or perform an action
}

let draggedItem = null;

function makeListSortable() {
    const actionsList = document.getElementById('actions-list');

    actionsList.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        e.target.classList.add('dragging');
    });

    actionsList.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        draggedItem = null;
        saveOrder(); // Save the new order after dragging
    });

    actionsList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target;
        if (target && target.nodeName === 'LI' && target !== draggedItem) {
            const rect = target.getBoundingClientRect();
            const offset = rect.y + rect.height / 2;
            if (e.clientY > offset) {
                target.style.borderBottom = '2px dashed #000';
            } else {
                target.style.borderBottom = '';
            }
        }
    });

    actionsList.addEventListener('dragleave', (e) => {
        e.target.style.borderBottom = '';
    });

    actionsList.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.target;
        if (target && target.nodeName === 'LI' && target !== draggedItem) {
            target.style.borderBottom = '';
            actionsList.insertBefore(draggedItem, target.nextSibling);
        }
    });
}

function saveOrder() {
    const actionsList = document.getElementById('actions-list');
    savedActions.length = 0; // Clear current actions

    actionsList.querySelectorAll('li').forEach((item) => {
        savedActions.push(item.textContent.replace('Delete', '').trim()); // Remove 'Delete' button text
    });
    console.log('Saved Actions:', savedActions); // Debugging output
}

function updateSavedActionsList() {
    const actionsList = document.getElementById('actions-list');
    actionsList.innerHTML = ''; // Clear current list

    savedActions.forEach((action, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = action;
        listItem.setAttribute('draggable', true);

        // Create and append delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            savedActions.splice(index, 1); // Remove action from array
            updateSavedActionsList(); // Update list display
        });
        
        listItem.appendChild(deleteButton);
        actionsList.appendChild(listItem);
    });

    makeListSortable(); // Initialize sortable functionality
}

// Initialize the saved actions list on page load or script initialization
updateSavedActionsList();
// Stacks for undo and redo
const undoStack = [];
const redoStack = [];

// Function to execute a script and manage actions
function executeScript(script) {
    const commands = script.split('\n').filter(cmd => cmd.trim() !== ''); // Filter out empty lines

    // Save the state before executing commands for undo purposes
    saveStateForUndo();

    commands.forEach(command => {
        const [action, ...args] = command.split(' ');
        handleCommand(action, args);
        // Save the action for undo
        savedActions.push(command);
    });

    updateSavedActionsList();
}

// Function to save the current state in the undo stack
function saveStateForUndo() {
    // Save the current state in the undo stack
    const state = {
        actions: [...savedActions],
        assets: Array.from(document.querySelectorAll('.workspace-asset')).map(asset => {
            const img = asset.querySelector('img');
            const computedStyle = window.getComputedStyle(img);
            return {
                id: asset.id,
                left: asset.style.left,
                top: asset.style.top,
                transform: asset.style.transform,
                width: computedStyle.width,  // Save size
                height: computedStyle.height,  // Save size
                image: img ? img.src : null
            };
        }),
        variables: { ...variables },
        currentSound: currentSound ? currentSound.src : null
    };
    undoStack.push(state);
    // Clear the redo stack
    redoStack.length = 0;
}

// Function to undo the last action
function undo() {
    if (undoStack.length === 0) return;

    // Save the current state to redo stack
    redoStack.push({
        actions: [...savedActions],
        assets: Array.from(document.querySelectorAll('.workspace-asset')).map(asset => {
            const img = asset.querySelector('img');
            const computedStyle = window.getComputedStyle(img);
            return {
                id: asset.id,
                left: asset.style.left,
                top: asset.style.top,
                transform: asset.style.transform,
                width: computedStyle.width,  // Save size
                height: computedStyle.height,  // Save size
                image: img ? img.src : null
            };
        }),
        variables: { ...variables },
        currentSound: currentSound ? currentSound.src : null
    });

    // Restore the last state from undo stack
    const previousState = undoStack.pop();
    restoreState(previousState);
}

// Function to redo the last undone action
function redo() {
    if (redoStack.length === 0) return;

    // Save the current state to undo stack
    undoStack.push({
        actions: [...savedActions],
        assets: Array.from(document.querySelectorAll('.workspace-asset')).map(asset => {
            const img = asset.querySelector('img');
            const computedStyle = window.getComputedStyle(img);
            return {
                id: asset.id,
                left: asset.style.left,
                top: asset.style.top,
                transform: asset.style.transform,
                width: computedStyle.width,  // Save size
                height: computedStyle.height,  // Save size
                image: img ? img.src : null
            };
        }),
        variables: { ...variables },
        currentSound: currentSound ? currentSound.src : null
    });

    // Restore the next state from redo stack
    const nextState = redoStack.pop();
    restoreState(nextState);
}

// Function to restore the saved state
function restoreState(state) {
    // Clear current state
    savedActions.length = 0;
    document.querySelectorAll('.workspace-asset').forEach(asset => asset.remove());

    // Restore saved actions
    savedActions.push(...state.actions);
    updateSavedActionsList();

    // Restore assets
    state.assets.forEach(assetData => {
        const asset = document.createElement('div');
        asset.classList.add('workspace-asset');
        asset.id = assetData.id;
        asset.style.position = 'absolute';
        asset.style.left = assetData.left;
        asset.style.top = assetData.top;
        asset.style.transform = assetData.transform;

        const img = document.createElement('img');
        img.src = assetData.image || ''; // Set default if image is null
        img.style.width = assetData.width || 'auto'; // Restore size
        img.style.height = assetData.height || 'auto'; // Restore size
        img.style.objectFit = 'cover';

        asset.appendChild(img);
        workspace.appendChild(asset);
    });

    // Restore variables
    Object.assign(variables, state.variables);

    // Restore sound
    if (state.currentSound) {
        playSound([state.currentSound]);
    } else {
        stopAllSounds();
    }
}

// Add event listeners for undo and redo buttons
document.getElementById('undo-button').addEventListener('click', undo);
document.getElementById('redo-button').addEventListener('click', redo);

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the "Load Workspace" button element
    const loadWorkspaceButton = document.getElementById('load-workspace');
    
    // Check if the button exists
    if (loadWorkspaceButton) {
        // Add a click event listener to the button
        loadWorkspaceButton.addEventListener('click', () => {
            // Reload the page when the button is clicked
            window.location.reload();
        });
    }
})


document.addEventListener('DOMContentLoaded', () => {
    const checkConditionButton = document.getElementById('check-condition');
    const conditionInput = document.getElementById('condition-input');
    const conditionMessage = document.getElementById('condition-message');

    checkConditionButton.addEventListener('click', () => {
        const condition = conditionInput.value.trim();
        
        try {
            // Evaluate the condition as a JavaScript expression
            const result = eval(condition);
            
            if (result) {
                conditionMessage.textContent = 'Good job!';
                conditionMessage.style.color = 'green';
            } else {
                conditionMessage.textContent = 'Try again';
                conditionMessage.style.color = 'red';
            }
        } catch (error) {
            conditionMessage.textContent = 'Invalid condition';
            conditionMessage.style.color = 'blue';
        }
    });
});

document.getElementById('set-variable').addEventListener('click', () => {
    const variableName = prompt('Enter variable name:');
    const variableValue = prompt('Enter variable value:');
    if (variableName && variableValue !== null) {
        localStorage.setItem(variableName, variableValue); // Save variable in local storage or a similar mechanism
        alert(`Variable ${variableName} set to ${variableValue}`);
    }
});
document.getElementById('change-variable').addEventListener('click', () => {
    const variableName = prompt('Enter the name of the variable to change:');
    const newValue = prompt('Enter the new value:');
    if (variableName && newValue !== null) {
        localStorage.setItem(variableName, newValue); // Update variable value
        alert(`Variable ${variableName} changed to ${newValue}`);
    }
});
document.getElementById('show-variable').addEventListener('click', () => {
    const variableName = prompt('Enter the name of the variable to show:');
    const variableValue = localStorage.getItem(variableName);
    if (variableValue !== null) {
        alert(`Variable ${variableName} has the value: ${variableValue}`);
    } else {
        alert(`Variable ${variableName} does not exist.`);
    }
});


// script.js

document.addEventListener('DOMContentLoaded', () => {
    const workspace = document.getElementById('workspace');
    const assets = document.querySelectorAll('.asset');
    
    assets.forEach(asset => {
        asset.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
    });

    workspace.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const droppedElement = document.getElementById(id);
        
        if (droppedElement && droppedElement.id === 'forest') {
            workspace.style.backgroundImage = 'url(forest.png)';
            workspace.style.backgroundSize = 'cover'; // Optional, to cover the whole area
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const workspace = document.getElementById('workspace');
    const assets = document.querySelectorAll('.asset');
    
    assets.forEach(asset => {
        asset.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
    });

    workspace.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const droppedElement = document.getElementById(id);
        
        if (droppedElement && droppedElement.id === 'ocean') {
            workspace.style.backgroundImage = 'url(ocean.png)';
            workspace.style.backgroundSize = 'cover'; // Optional, to cover the whole area
        }
    });
});

const checkLengthButton = document.getElementById('check-length');
const lengthOutput = document.getElementById('length-output');
const joinStringsButton = document.getElementById('join-strings');
const concatenationOutput = document.getElementById('concatenation-output');

checkLengthButton.addEventListener('click', () => {
    const userInput = document.getElementById('string-input').value;
    lengthOutput.textContent = `Length: ${userInput.length}`;
});

joinStringsButton.addEventListener('click', () => {
    const string1 = document.getElementById('string1').value;
    const string2 = document.getElementById('string2').value;
    concatenationOutput.textContent = `Joined String: ${string1 + string2}`;
});

const checkCharButton = document.getElementById('check-char-button');
const charOutput = document.getElementById('char-output');

checkCharButton.addEventListener('click', () => {
    const userString = document.getElementById('check-string').value;
    const userChar = document.getElementById('check-char').value;

    // Check if a single character is provided
    if (userChar.length !== 1) {
        charOutput.textContent = 'Please enter a single character.';
        return;
    }

    const isPresent = userString.includes(userChar);
    charOutput.textContent = `Character "${userChar}" present: ${isPresent}`;
});

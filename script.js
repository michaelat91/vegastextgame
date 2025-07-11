document.addEventListener('DOMContentLoaded', () => {
    const commandInput = document.getElementById('command-input');
    const narrativeLog = document.getElementById('narrative-log');
    const visualManager = new VisualManager('visual-scene');

    let storyHistory = [];

    // Focus on the input field when the page loads
    commandInput.focus();

    commandInput.addEventListener('keydown', async function(event) {
        if (event.key === 'Enter') {
            const command = commandInput.value.trim();
            if (command) {
                // Display the command in the narrative log
                const commandElement = document.createElement('p');
                commandElement.textContent = `> ${command}`;
                commandElement.style.fontFamily = 'var(--font-mono)';
                narrativeLog.appendChild(commandElement);

                // Clear the input field
                commandInput.value = '';

                // Scroll to the bottom of the narrative log
                narrativeLog.scrollTop = narrativeLog.scrollHeight;

                // Process the command
                await processCommand(command);
            }
        }
    });

    async function processCommand(command) {
        // Display a "thinking..." message
        const thinkingElement = document.createElement('p');
        thinkingElement.className = 'highlight';
        thinkingElement.textContent = 'thinking...';
        narrativeLog.appendChild(thinkingElement);
        narrativeLog.scrollTop = narrativeLog.scrollHeight;

        try {
            const response = await fetch('/api/openai-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    story_history: storyHistory,
                    current_command: command
                }),
            });

            // Remove the "thinking..." message
            narrativeLog.removeChild(thinkingElement);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            updateGame(data, command);

        } catch (error) {
            console.error('Error calling proxy:', error);
            const errorElement = document.createElement('p');
            errorElement.style.color = 'red';
            errorElement.textContent = 'Error connecting to the story engine. Please check the console and try again.';
            narrativeLog.appendChild(errorElement);
            // Ensure "thinking..." is removed on error too
            if (narrativeLog.contains(thinkingElement)) {
                narrativeLog.removeChild(thinkingElement);
            }
        }
    }

    function updateGame(data, command) {
        // Append to history
        storyHistory.push(`> ${command}`);
        storyHistory.push(data.narrative);

        // Display AI narrative
        const responseElement = document.createElement('p');
        responseElement.innerHTML = data.narrative; // Use innerHTML to render potential HTML tags from AI
        narrativeLog.appendChild(responseElement);

        if (data.visuals) {
            visualManager.updateScene(data.visuals);
        }

        // Scroll to the bottom
        narrativeLog.scrollTop = narrativeLog.scrollHeight;
    }

    // Initial message
    function displayInitialMessage() {
        const initialMessage = document.createElement('p');
        initialMessage.innerHTML = 'You stand at the entrance of the <span class="highlight">Casino For Real</span>, a place that hums with an unnatural energy. The story is yours to shape. What will you do?';
        narrativeLog.appendChild(initialMessage);
        storyHistory.push(initialMessage.textContent);
    }

    displayInitialMessage();
});
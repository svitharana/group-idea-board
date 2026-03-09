document.addEventListener('DOMContentLoaded', () => {
    const userNameInput = document.getElementById('userName');
    const userIdeaInput = document.getElementById('userIdea');
    const postButton = document.getElementById('postButton');
    const ideasDisplay = document.getElementById('ideasDisplay');

    // Dummy ideas to start with
    const dummyIdeas = [
        { name: 'Alice', idea: 'A shared coffee station for the office!' },
        { name: 'Bob', idea: 'Weekly lightning talks on new technologies.' },
        { name: 'Charlie', idea: 'Implement a "Friday Fun Hour" for team bonding.' }
    ];

    // Function to add an idea to the board
    function addIdea(name, idea) {
        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card';
        
        const nameElement = document.createElement('strong');
        nameElement.textContent = name;
        
        const ideaElement = document.createElement('p');
        ideaElement.textContent = idea;
        
        ideaCard.appendChild(nameElement);
        ideaCard.appendChild(ideaElement);
        
        // Add new ideas to the top
        ideasDisplay.insertBefore(ideaCard, ideasDisplay.firstChild);
    }

    // Load dummy ideas
    dummyIdeas.forEach(item => addIdea(item.name, item.idea));

    // Handle posting a new idea
    postButton.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        const idea = userIdeaInput.value.trim();

        if (name && idea) {
            addIdea(name, idea);
            
            // Clear inputs
            userNameInput.value = '';
            userIdeaInput.value = '';
            
            // Optional: focus back to idea input for quick entry
            userIdeaInput.focus();
        } else {
            alert('Please enter both your name and an idea.');
        }
    });

    // Also allow posting with Enter key in the idea input
    userIdeaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            postButton.click();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const nameDropdown = document.getElementById('nameDropdown');
    const newStudentInput = document.getElementById('newStudentName');
    const addStudentButton = document.getElementById('addStudentButton');
    const userIdeaInput = document.getElementById('userIdea');
    const postButton = document.getElementById('postButton');
    const ideasDisplay = document.getElementById('ideasDisplay');

    // Load initial data from localStorage or use defaults
    let students = JSON.parse(localStorage.getItem('group_idea_board_students')) || ['Alice', 'Bob', 'Charlie', 'David', 'Eva'];
    let ideas = JSON.parse(localStorage.getItem('group_idea_board_ideas')) || [
        { name: 'Alice', idea: 'Organize a monthly coding hackathon to work on side projects.' },
        { name: 'Bob', idea: 'Introduce a peer-to-peer mentoring system for new students.' },
        { name: 'Charlie', idea: 'Create a shared digital library for recommended learning resources.' }
    ];

    // Save to localStorage
    function saveData() {
        localStorage.setItem('group_idea_board_students', JSON.stringify(students));
        localStorage.setItem('group_idea_board_ideas', JSON.stringify(ideas));
    }

    // Populate dropdown
    function populateDropdown() {
        // Keep the first placeholder option
        const placeholder = nameDropdown.options[0];
        nameDropdown.innerHTML = '';
        nameDropdown.appendChild(placeholder);
        
        students.sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            nameDropdown.appendChild(option);
        });
    }

    // Add new student
    addStudentButton.addEventListener('click', () => {
        const newName = newStudentInput.value.trim();
        if (newName && !students.includes(newName)) {
            students.push(newName);
            saveData();
            populateDropdown();
            newStudentInput.value = '';
            alert(`${newName} added to the list!`);
        } else if (students.includes(newName)) {
            alert('This student is already in the list.');
        } else {
            alert('Please enter a valid student name.');
        }
    });

    // Display ideas
    function renderIdeas() {
        ideasDisplay.innerHTML = '';
        ideas.forEach((item, index) => {
            const ideaCard = document.createElement('div');
            ideaCard.className = 'idea-card';
            
            const contentContainer = document.createElement('div');
            contentContainer.className = 'idea-content';
            
            const nameElement = document.createElement('strong');
            nameElement.textContent = item.name;
            
            const ideaElement = document.createElement('p');
            ideaElement.textContent = item.idea;
            
            contentContainer.appendChild(nameElement);
            contentContainer.appendChild(ideaElement);
            
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'idea-actions';
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => editIdea(index);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteIdea(index);
            
            actionsContainer.appendChild(editBtn);
            actionsContainer.appendChild(deleteBtn);
            
            ideaCard.appendChild(contentContainer);
            ideaCard.appendChild(actionsContainer);
            
            // Add new ideas to the top
            ideasDisplay.prepend(ideaCard);
        });
    }

    // Delete idea
    function deleteIdea(index) {
        if (confirm('Are you sure you want to delete this idea?')) {
            ideas.splice(index, 1);
            saveData();
            renderIdeas();
        }
    }

    // Edit idea
    function editIdea(index) {
        const newIdea = prompt('Edit your idea:', ideas[index].idea);
        if (newIdea !== null && newIdea.trim() !== '') {
            ideas[index].idea = newIdea.trim();
            saveData();
            renderIdeas();
        }
    }

    // Post new idea
    postButton.addEventListener('click', () => {
        const name = nameDropdown.value;
        const idea = userIdeaInput.value.trim();

        if (name && idea) {
            ideas.push({ name, idea });
            saveData();
            renderIdeas();
            
            // Clear inputs
            userIdeaInput.value = '';
            nameDropdown.selectedIndex = 0;
            userIdeaInput.focus();
        } else {
            alert('Please select your name and enter an idea.');
        }
    });

    // Initial setup
    populateDropdown();
    renderIdeas();

    // Allow posting with Enter key in the idea input
    userIdeaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            postButton.click();
        }
    });
});

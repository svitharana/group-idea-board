document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const nameDropdown = document.getElementById('nameDropdown');
    const filterDropdown = document.getElementById('filterDropdown');
    const newStudentInput = document.getElementById('newStudentName');
    const addStudentButton = document.getElementById('addStudentButton');
    const userIdeaInput = document.getElementById('userIdea');
    const postButton = document.getElementById('postButton');
    const resetFormButton = document.getElementById('resetFormButton');
    const ideasDisplay = document.getElementById('ideasDisplay');
    const totalIdeasSpan = document.getElementById('totalIdeas');
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    // Modal Elements
    const modalOverlay = document.getElementById('modalOverlay');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const editIdeaText = document.getElementById('editIdeaText');
    const saveEditBtn = document.getElementById('saveEdit');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    
    let currentEditIndex = null;
    let currentDeleteIndex = null;

    // State
    let students = JSON.parse(localStorage.getItem('group_idea_board_students')) || ['Alice', 'Bob', 'Charlie', 'David', 'Eva'];
    let ideas = JSON.parse(localStorage.getItem('group_idea_board_ideas')) || [
        { name: 'Alice', idea: 'Organize a monthly coding hackathon to work on side projects.', votes: 0 },
        { name: 'Bob', idea: 'Introduce a peer-to-peer mentoring system for new students.', votes: 0 },
        { name: 'Charlie', idea: 'Create a shared digital library for recommended learning resources.', votes: 0 }
    ];

    // Ensure all existing ideas have a votes property
    ideas = ideas.map(idea => ({ ...idea, votes: idea.votes || 0 }));

    let isDarkMode = localStorage.getItem('idea_board_theme') !== 'light';

    // Functions
    function applyTheme() {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            document.body.classList.remove('dark-mode');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
        localStorage.setItem('idea_board_theme', isDarkMode ? 'dark' : 'light');
    }

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        applyTheme();
    }

    function saveData() {
        localStorage.setItem('group_idea_board_students', JSON.stringify(students));
        localStorage.setItem('group_idea_board_ideas', JSON.stringify(ideas));
        updateStats();
    }

    function updateStats() {
        totalIdeasSpan.textContent = ideas.length;
    }

    function populateDropdowns() {
        const placeholder = '<option value="" disabled selected>Select Your Name</option>';
        nameDropdown.innerHTML = placeholder;
        
        const filterPlaceholder = '<option value="all">All Authors</option>';
        filterDropdown.innerHTML = filterPlaceholder;
        
        students.sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            nameDropdown.appendChild(option.cloneNode(true));
            filterDropdown.appendChild(option);
        });
    }

    function handleVote(index) {
        ideas[index].votes++;
        saveData();
        renderIdeas(filterDropdown.value);
    }

    function renderIdeas(filter = 'all') {
        ideasDisplay.innerHTML = '';
        const filteredIdeas = filter === 'all' 
            ? ideas 
            : ideas.filter(item => item.name === filter);

        if (filteredIdeas.length === 0) {
            ideasDisplay.innerHTML = `<div class="no-ideas" style="color: ${isDarkMode ? 'white' : 'var(--text-main)'}; grid-column: 1/-1; text-align: center; padding: 2rem;">No ideas found for this selection.</div>`;
            return;
        }

        // Find the maximum vote count to identify "Hot" ideas
        const maxVotes = ideas.length > 0 ? Math.max(...ideas.map(i => i.votes)) : 0;

        // We show newest first
        [...filteredIdeas].reverse().forEach((item) => {
            // Find original index in the main ideas array
            const originalIndex = ideas.findIndex(i => i === item);
            const isHot = item.votes > 0 && item.votes === maxVotes;
            
            const card = document.createElement('div');
            card.className = `idea-card ${isHot ? 'hot-card' : ''}`;
            
            card.innerHTML = `
                ${isHot ? '<div class="hot-badge">🔥 HOT</div>' : ''}
                <div class="idea-content">
                    <div class="idea-header">
                        <strong>${item.name}</strong>
                        <div class="vote-display">
                            <span>${item.votes}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isHot ? '#ff9f1c' : 'currentColor'}" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                    </div>
                    <p>${item.idea}</p>
                </div>
                <div class="idea-actions">
                    <button class="btn-vote vote-btn" title="Vote for this idea">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        Vote
                    </button>
                    <button class="btn-secondary edit-btn">Edit</button>
                    <button class="btn-danger delete-btn">Delete</button>
                </div>
            `;
            
            card.querySelector('.vote-btn').onclick = () => handleVote(originalIndex);
            card.querySelector('.edit-btn').onclick = () => openEditModal(originalIndex);
            card.querySelector('.delete-btn').onclick = () => openDeleteModal(originalIndex);
            
            ideasDisplay.appendChild(card);
        });
    }

    // Modal Logic
    function openModal(modal) {
        modalOverlay.classList.add('active');
        modal.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        editModal.classList.remove('active');
        deleteModal.classList.remove('active');
        currentEditIndex = null;
        currentDeleteIndex = null;
    }

    function openEditModal(index) {
        currentEditIndex = index;
        editIdeaText.value = ideas[index].idea;
        openModal(editModal);
    }

    function openDeleteModal(index) {
        currentDeleteIndex = index;
        openModal(deleteModal);
    }

    // Event Listeners
    addStudentButton.addEventListener('click', () => {
        const newName = newStudentInput.value.trim();
        if (newName && !students.includes(newName)) {
            students.push(newName);
            saveData();
            populateDropdowns();
            newStudentInput.value = '';
        } else if (students.includes(newName)) {
            alert('Name already exists!');
        }
    });

    postButton.addEventListener('click', () => {
        const name = nameDropdown.value;
        const idea = userIdeaInput.value.trim();

        if (name && idea) {
            ideas.push({ name, idea });
            saveData();
            renderIdeas(filterDropdown.value);
            userIdeaInput.value = '';
            userIdeaInput.focus();
        } else {
            alert('Please select a name and enter your idea.');
        }
    });

    resetFormButton.addEventListener('click', () => {
        userIdeaInput.value = '';
        newStudentInput.value = '';
        nameDropdown.selectedIndex = 0;
    });

    filterDropdown.addEventListener('change', (e) => {
        renderIdeas(e.target.value);
    });

    saveEditBtn.addEventListener('click', () => {
        const updatedText = editIdeaText.value.trim();
        if (updatedText && currentEditIndex !== null) {
            ideas[currentEditIndex].idea = updatedText;
            saveData();
            renderIdeas(filterDropdown.value);
            closeModal();
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (currentDeleteIndex !== null) {
            ideas.splice(currentDeleteIndex, 1);
            saveData();
            renderIdeas(filterDropdown.value);
            closeModal();
        }
    });

    // Close modal on overlay click or cancel
    document.querySelectorAll('.close-modal, #cancelEdit, #cancelDelete').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    themeToggle.addEventListener('click', toggleTheme);

    // Initial Load
    applyTheme();
    populateDropdowns();
    renderIdeas();
    updateStats();
});

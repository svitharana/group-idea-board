document.addEventListener('DOMContentLoaded', () => {
    // ==================== IDEA BOARD VARIABLES ====================
    const nameDropdown = document.getElementById('nameDropdown');
    const filterDropdown = document.getElementById('filterDropdown');
    const newStudentInput = document.getElementById('newStudentName');
    const addStudentButton = document.getElementById('addStudentButton');
    const userIdeaInput = document.getElementById('userIdea');
    const postButton = document.getElementById('postButton');
    const resetFormButton = document.getElementById('resetFormButton');
    const ideasDisplay = document.getElementById('ideasDisplay');
    const charCount = document.getElementById('charCount');
    const editCharCount = document.getElementById('editCharCount');

    const MAX_IDEA_LENGTH = 300;
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

    ideas = ideas.map(idea => ({ ...idea, votes: idea.votes || 0 }));

    // ==================== GPA CALCULATOR VARIABLES ====================
    const coursesTableBody = document.getElementById('coursesTableBody');
    const courseNameInput = document.getElementById('courseName');
    const courseGradeSelect = document.getElementById('courseGrade');
    const courseCreditsInput = document.getElementById('courseCredits');
    const addCourseButton = document.getElementById('addCourseButton');
    const gpaResult = document.getElementById('gpaResult');
    const totalCreditsDisplay = document.getElementById('totalCredits');
    const totalQualityPointsDisplay = document.getElementById('totalQualityPoints');
    const resetGPAButton = document.getElementById('resetGPAButton');

    let courses = JSON.parse(localStorage.getItem('student_toolkit_courses')) || [];

    // ==================== POMODORO TIMER VARIABLES ====================
    const timerDisplay = document.getElementById('timerDisplay');
    const startTimerButton = document.getElementById('startTimerButton');
    const pauseTimerButton = document.getElementById('pauseTimerButton');
    const resetTimerButton = document.getElementById('resetTimerSmallButton');
    const resetTimerMainButton = document.getElementById('resetTimerButton');
    const workDurationInput = document.getElementById('workDuration');
    const breakDurationInput = document.getElementById('breakDuration');
    const sessionsCountDisplay = document.getElementById('sessionsCount');
    const progressCircle = document.getElementById('progressCircle');

    // ==================== SIDEBAR ELEMENTS ====================
    const sidebarSearch = document.getElementById('sidebarSearch');
    const eventsList = document.getElementById('eventsList');

    // sample events list
    const upcomingEvents = [
        { title: 'Annual Hackathon', date: 'Apr 5', venue: 'Main Hall', organizer: 'Tech Club', icon: 'H' },
        { title: 'Guest Lecture: AI Ethics', date: 'Apr 12', venue: 'Auditorium', organizer: 'Dr. Smith', icon: '🎤' },
        { title: 'Spring Break', date: 'May 1–7', venue: 'Campus Wide', organizer: 'Office of Student Affairs', icon: '🌴' },
        { title: 'Coding Workshop', date: 'Jun 2', venue: 'Lab 204', organizer: 'CS Dept', icon: '💻' },
        { title: 'Art Expo', date: 'Jul 20', venue: 'Gallery', organizer: 'Art Club', icon: '🎨' }
    ];

    function svgDataForIcon(char) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="#d1d5db"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${char}</text></svg>`;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    function renderSidebar() {
        if (!eventsList) return;
        const query = sidebarSearch.value.trim().toLowerCase();
        eventsList.innerHTML = '';

        const filtered = upcomingEvents.filter(e => e.title.toLowerCase().includes(query));
        filtered.forEach(e => {
            const li = document.createElement('li');
            const imgSrc = svgDataForIcon(e.icon || '?');
            li.innerHTML = `
                <div class="event-info">
                    <img class="event-img" src="${imgSrc}" alt="${e.title}">
                    <div class="event-text">
                        <span class="event-title">${e.title}</span>
                        <span class="event-date">${e.date}</span>
                    </div>
                </div>
                <div class="event-meta">
                    <span class="event-venue">${e.venue}</span>
                    <span class="event-organizer">${e.organizer}</span>
                </div>`;
            eventsList.appendChild(li);
        });
    }

    sidebarSearch.addEventListener('input', renderSidebar);


    let timerState = {
        isRunning: false,
        isWorkSession: true,
        timeRemaining: 25 * 60,
        totalTime: 25 * 60,
        sessionsCompleted: parseInt(localStorage.getItem('student_toolkit_sessions')) || 0,
        intervalId: null
    };

    // ==================== THEME MANAGEMENT ====================
    // read stored theme and apply to body class directly
    (function initializeTheme() {
        const stored = localStorage.getItem('student_toolkit_theme');
        if (stored === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    })();

    function applyTheme() {
        const dark = document.body.classList.contains('dark-mode');
        sunIcon.style.display = dark ? 'none' : 'block';
        moonIcon.style.display = dark ? 'block' : 'none';
        localStorage.setItem('student_toolkit_theme', dark ? 'dark' : 'light');
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        applyTheme();
    }

    // ==================== NAVIGATION ====================
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const toolName = tab.getAttribute('data-tool');
            switchTool(toolName);
        });
    });

    function switchTool(toolName) {
        // Hide all tool sections
        document.querySelectorAll('.tool-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tool
        const toolSection = document.getElementById(`${toolName}-tool`);
        if (toolSection) {
            toolSection.classList.add('active');
        }
        
        // Mark tab as active
        document.querySelector(`[data-tool="${toolName}"]`).classList.add('active');
    }

    // ==================== IDEA BOARD FUNCTIONS ====================
    function saveIdeaBoardData() {
        localStorage.setItem('group_idea_board_students', JSON.stringify(students));
        localStorage.setItem('group_idea_board_ideas', JSON.stringify(ideas));
    }

    // escape HTML entities to prevent injection when rendering
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // check for forbidden characters or tags
    function containsHtmlTags(str) {
        return /[<>]/.test(str);
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
        saveIdeaBoardData();
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

        const maxVotes = ideas.length > 0 ? Math.max(...ideas.map(i => i.votes)) : 0;

        [...filteredIdeas].reverse().forEach((item) => {
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
                    <p>${escapeHtml(item.idea)}</p>
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
        if (editCharCount) {
            const len = editIdeaText.value.length;
            editCharCount.textContent = `${len}/${MAX_IDEA_LENGTH}`;
        }
        openModal(editModal);
    }

    function openDeleteModal(index) {
        currentDeleteIndex = index;
        openModal(deleteModal);
    }

    // ==================== GPA CALCULATOR FUNCTIONS ====================
    function saveGPAData() {
        localStorage.setItem('student_toolkit_courses', JSON.stringify(courses));
        calculateGPA();
    }

    function addCourse() {
        const name = courseNameInput.value.trim();
        const grade = parseFloat(courseGradeSelect.value);
        const credits = parseFloat(courseCreditsInput.value);

        if (!name || !courseGradeSelect.value || !credits) {
            alert('Please fill in all fields');
            return;
        }

        courses.push({ name, grade, credits });
        saveGPAData();
        renderCoursesTable();
        courseNameInput.value = '';
        courseGradeSelect.value = '';
        courseCreditsInput.value = '';
    }

    function deleteCourse(index) {
        courses.splice(index, 1);
        saveGPAData();
        renderCoursesTable();
    }

    function calculateGPA() {
        if (courses.length === 0) {
            gpaResult.textContent = '0.00';
            totalCreditsDisplay.textContent = '0';
            totalQualityPointsDisplay.textContent = '0';
            return;
        }

        let totalQualityPoints = 0;
        let totalCredits = 0;

        courses.forEach(course => {
            const qualityPoints = course.grade * course.credits;
            totalQualityPoints += qualityPoints;
            totalCredits += course.credits;
        });

        const gpa = totalQualityPoints / totalCredits;
        gpaResult.textContent = gpa.toFixed(2);
        totalCreditsDisplay.textContent = totalCredits.toFixed(1);
        totalQualityPointsDisplay.textContent = totalQualityPoints.toFixed(2);
    }

    function renderCoursesTable() {
        coursesTableBody.innerHTML = '';
        courses.forEach((course, index) => {
            const qualityPoints = course.grade * course.credits;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.name}</td>
                <td>${course.grade.toFixed(1)}</td>
                <td>${course.credits.toFixed(1)}</td>
                <td>${qualityPoints.toFixed(2)}</td>
                <td><button class="btn-delete-course">Remove</button></td>
            `;
            row.querySelector('.btn-delete-course').addEventListener('click', () => deleteCourse(index));
            coursesTableBody.appendChild(row);
        });
        calculateGPA();
    }

    // ==================== POMODORO TIMER FUNCTIONS ====================
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timerState.timeRemaining);
        updateProgressCircle();
    }

    function updateProgressCircle() {
        const progress = (timerState.timeRemaining / timerState.totalTime);
        const circumference = 2 * Math.PI * 140;
        const offset = circumference * progress;
        progressCircle.style.strokeDashoffset = offset;
    }

    // simple bell-like beep using Web Audio API or fallback audio element
    function playBellSound() {
        // try Web Audio API first
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            const fallback = document.getElementById('bellSound');
            if (fallback) fallback.play().catch(() => {});
        }
    }

    function startTimer() {
        if (timerState.isRunning) return;

        timerState.isRunning = true;
        startTimerButton.style.display = 'none';
        pauseTimerButton.style.display = 'flex';

        timerState.intervalId = setInterval(() => {
            if (timerState.timeRemaining > 0) {
                timerState.timeRemaining--;
                updateTimerDisplay();
            } else {
                completeSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        timerState.isRunning = false;
        clearInterval(timerState.intervalId);
        startTimerButton.style.display = 'flex';
        pauseTimerButton.style.display = 'none';
    }

    function resetTimer() {
        pauseTimer();
        timerState.isWorkSession = true;
        timerState.timeRemaining = workDurationInput.value * 60;
        timerState.totalTime = timerState.timeRemaining;
        updateTimerDisplay();
        updateSessionStatus();
    }

    function completeSession() {
        pauseTimer();
        playBellSound();

        if (timerState.isWorkSession) {
            timerState.isWorkSession = false;
            timerState.timeRemaining = breakDurationInput.value * 60;
            timerState.sessionsCompleted++;
            sessionsCountDisplay.textContent = timerState.sessionsCompleted;
            localStorage.setItem('student_toolkit_sessions', timerState.sessionsCompleted);
        } else {
            timerState.isWorkSession = true;
            timerState.timeRemaining = workDurationInput.value * 60;
        }

        timerState.totalTime = timerState.timeRemaining;
        updateTimerDisplay();
        updateSessionStatus();

        setTimeout(() => {
            startTimer();
        }, 1000);
    }

    function updateSessionStatus() {
        const status = document.querySelector('.timer-status');
        status.textContent = timerState.isWorkSession ? 'Work Time' : 'Break Time';
    }

    // ==================== EVENT LISTENERS - IDEA BOARD ====================
    addStudentButton.addEventListener('click', () => {
        const newName = newStudentInput.value.trim();
        if (newName && !students.includes(newName)) {
            students.push(newName);
            saveIdeaBoardData();
            populateDropdowns();
            newStudentInput.value = '';
        } else if (students.includes(newName)) {
            alert('Name already exists!');
        }
    });

    // character counter for new idea field
    userIdeaInput.addEventListener('input', () => {
        const len = userIdeaInput.value.length;
        if (charCount) {
            charCount.textContent = `${len}/${MAX_IDEA_LENGTH}`;
            if (len > MAX_IDEA_LENGTH) charCount.classList.add('over');
            else charCount.classList.remove('over');
        }
    });

    postButton.addEventListener('click', () => {
        const name = nameDropdown.value;
        const idea = userIdeaInput.value.trim();

        if (name && idea) {
            if (containsHtmlTags(idea)) {
                alert('HTML tags or code are not allowed in ideas.');
                return;
            }
            if (idea.length > MAX_IDEA_LENGTH) {
                alert(`Ideas must be ${MAX_IDEA_LENGTH} characters or fewer.`);
                return;
            }
            // block duplicate idea text from being added by anyone
            const exists = ideas.some(i => i.idea.toLowerCase() === idea.toLowerCase());
            if (exists) {
                alert('That idea already exists.');
                return;
            }

            ideas.push({ name, idea, votes: 0 });
            saveIdeaBoardData();
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

    // character counter for edit textarea
    editIdeaText.addEventListener('input', () => {
        const len = editIdeaText.value.length;
        if (editCharCount) {
            editCharCount.textContent = `${len}/${MAX_IDEA_LENGTH}`;
            if (len > MAX_IDEA_LENGTH) editCharCount.classList.add('over');
            else editCharCount.classList.remove('over');
        }
    });

    saveEditBtn.addEventListener('click', () => {
        const updatedText = editIdeaText.value.trim();
        if (updatedText && currentEditIndex !== null) {
            if (containsHtmlTags(updatedText)) {
                alert('HTML tags or code are not allowed in ideas.');
                return;
            }
            if (updatedText.length > MAX_IDEA_LENGTH) {
                alert(`Ideas must be ${MAX_IDEA_LENGTH} characters or fewer.`);
                return;
            }
            // prevent changing idea into an existing one
            const exists = ideas.some((i, idx) => idx !== currentEditIndex && i.idea.toLowerCase() === updatedText.toLowerCase());
            if (exists) {
                alert('That idea already exists.');
                return;
            }
            ideas[currentEditIndex].idea = updatedText;
            saveIdeaBoardData();
            renderIdeas(filterDropdown.value);
            closeModal();
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (currentDeleteIndex !== null) {
            ideas.splice(currentDeleteIndex, 1);
            saveIdeaBoardData();
            renderIdeas(filterDropdown.value);
            closeModal();
        }
    });

    document.querySelectorAll('.close-modal, #cancelEdit, #cancelDelete').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // ==================== EVENT LISTENERS - GPA CALCULATOR ====================
    addCourseButton.addEventListener('click', addCourse);

    courseCreditsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addCourse();
    });

    resetGPAButton.addEventListener('click', () => {
        courses = [];
        localStorage.removeItem('student_toolkit_courses');
        renderCoursesTable();
    });

    // ==================== EVENT LISTENERS - POMODORO TIMER ====================
    startTimerButton.addEventListener('click', startTimer);
    pauseTimerButton.addEventListener('click', pauseTimer);
    resetTimerButton.addEventListener('click', resetTimer);
    resetTimerMainButton.addEventListener('click', resetTimer);

    workDurationInput.addEventListener('change', () => {
        if (!timerState.isRunning) {
            timerState.timeRemaining = workDurationInput.value * 60;
            timerState.totalTime = timerState.timeRemaining;
            updateTimerDisplay();
        }
    });

    themeToggle.addEventListener('click', toggleTheme);

    // ==================== INITIALIZATION ====================
    applyTheme();
    populateDropdowns();
    renderIdeas();
    renderCoursesTable();
    renderSidebar();
    sessionsCountDisplay.textContent = timerState.sessionsCompleted;
    updateTimerDisplay();
    updateSessionStatus();
});

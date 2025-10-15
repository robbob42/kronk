// app/static/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // --- GRAB DOM ELEMENTS (no changes) ---
    const projectsTab = document.getElementById('projectsTab');
    const usersTab = document.getElementById('usersTab');
    const projectsContainer = document.getElementById('projectsContainer');
    const usersContainer = document.getElementById('usersContainer');
    const manualScreensaverBtn = document.getElementById('manualScreensaverBtn');
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.getElementById('closeModal');

    const screensaver = document.getElementById('screensaver');
    const screensaverContent = document.getElementById('screensaverContent');

    let currentProjects = [];
    let currentUsers = [];

    // --- API & MODAL & SCREENSAVER LOGIC (no changes here, keeping it compact for clarity) ---
    let idleTimer; let screensaverInterval; const IDLE_TIMEOUT = 300000; const CONTENT_CHANGE_INTERVAL = 20000;
    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const showRandomContent = () => { screensaverContent.style.opacity = 0; setTimeout(() => { const contentTypes = ['quote', 'whisper', 'recipe']; const randomType = getRandomItem(contentTypes); let html = ''; if (randomType === 'quote') { const item = getRandomItem(KRONK_QUOTES); html = `<p class="whisper">"${item}"</p>`; } else if (randomType === 'whisper') { const isAngel = Math.random() < 0.5; if (isAngel) { const item = getRandomItem(ANGEL_WHISPERS); html = `<p class="whisper angel-text">${item}</p><img src="static/images/kronk-ethics.jpg" alt="Angel and Devil Kronk">`; } else { const item = getRandomItem(DEVIL_WHISPERS); html = `<img src="static/images/kronk-ethics.jpg" alt="Angel and Devil Kronk"><p class="whisper devil-text">${item}</p>`; } } else if (randomType === 'recipe') { const item = getRandomItem(SPINACH_PUFF_RECIPE); html = `<img src="static/images/kronk-spinach-puffs.jpg" alt="Kronk's Spinach Puffs"><p class="whisper">${item.text}</p>`; } screensaverContent.innerHTML = html; screensaverContent.style.opacity = 1; }, 1500); };
    const startScreensaver = () => { screensaver.style.display = 'flex'; showRandomContent(); screensaverInterval = setInterval(showRandomContent, CONTENT_CHANGE_INTERVAL); };
    const stopScreensaver = () => { screensaver.style.display = 'none'; clearInterval(screensaverInterval); resetIdleTimer(); };
    const resetIdleTimer = () => { clearTimeout(idleTimer); idleTimer = setTimeout(startScreensaver, IDLE_TIMEOUT); };
    const fetchData = async (endpoint) => { const response = await fetch(`/api/${endpoint}`); if (!response.ok) { console.error(`Error fetching ${endpoint}:`, response.statusText); return []; } return await response.json(); };
    const postData = async (endpoint, data) => { const response = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), }); return response.json(); };
    const openModal = () => modal.style.display = 'flex';
    const hideModal = () => modal.style.display = 'none';

    // --- NEW & UPDATED FUNCTIONS FOR SHARES ---
    const recalculateAndDisplayShares = (projectValue) => {
        const userList = modalBody.querySelector('.user-select-list');
        const checkedUsers = userList.querySelectorAll('input[type="checkbox"]:checked');
        
        // Hide all share controls first
        userList.querySelectorAll('.shares-control').forEach(control => control.style.display = 'none');

        if (checkedUsers.length <= 1) {
            return; // No need for shares if 0 or 1 person is selected
        }

        let totalShares = 0;
        checkedUsers.forEach(checkbox => {
            const shares = parseInt(checkbox.closest('.user-share-wrapper').querySelector('.share-value').textContent);
            totalShares += shares;
        });

        const valuePerShare = projectValue / totalShares;

        checkedUsers.forEach(checkbox => {
            const wrapper = checkbox.closest('.user-share-wrapper');
            const shares = parseInt(wrapper.querySelector('.share-value').textContent);
            const userReward = valuePerShare * shares;
            
            const sharesControl = wrapper.querySelector('.shares-control');
            sharesControl.style.display = 'flex'; // Show controls for selected users
            sharesControl.querySelector('.calculated-split').textContent = `$${userReward.toFixed(2)}`;
        });
    };

    const showProjectDetails = (projectId) => {
        const project = currentProjects.find(p => p.id === projectId);
        if (!project) return;

        modalTitle.innerText = project.name;
        
        let userChecklistHtml = '<h4>Who participated?</h4><ul class="user-select-list">';
        currentUsers.forEach(user => {
            userChecklistHtml += `
                <li>
                    <div class="user-share-wrapper">
                        <input type="checkbox" id="user-${user.id}" value="${user.id}">
                        <label for="user-${user.id}">${user.name}</label>
                        <div class="shares-control" style="display: none;">
                            <button class="share-button minus" data-user-id="${user.id}">-</button>
                            <span class="share-value">1</span>
                            <button class="share-button plus" data-user-id="${user.id}">+</button>
                            <span class="calculated-split"></span>
                        </div>
                    </div>
                </li>
            `;
        });
        userChecklistHtml += '</ul>';

        modalBody.innerHTML = `
            <p>${project.description || 'No description available.'}</p>
            <p><strong>Value:</strong> <span class="money-value positive">$${project.value.toFixed(2)}</span></p>
            ${userChecklistHtml}
            <button class="action-button" id="completeProjectBtn" data-project-id="${project.id}">Complete Project</button>
        `;

        // Add event listeners for the new controls
        const userList = modalBody.querySelector('.user-select-list');
        userList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                recalculateAndDisplayShares(project.value);
            }
        });
        userList.addEventListener('click', (e) => {
            const button = e.target;
            if (button.classList.contains('share-button')) {
                const wrapper = button.closest('.shares-control');
                const shareValueEl = wrapper.querySelector('.share-value');
                let currentShares = parseInt(shareValueEl.textContent);
                if (button.classList.contains('plus')) {
                    currentShares++;
                } else if (button.classList.contains('minus') && currentShares > 1) {
                    currentShares--;
                }
                shareValueEl.textContent = currentShares;
                recalculateAndDisplayShares(project.value);
            }
        });

        openModal();
    };

    const handleCompleteProject = (projectId) => {
        const userList = modalBody.querySelector('.user-select-list');
        const checkedUsers = userList.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkedUsers.length === 0) {
            alert('Please select at least one participant.');
            return;
        }

        let participantsPayload = [];
        if (checkedUsers.length === 1) {
            // If only one person, send with 1 share (backend will give them 100%)
            participantsPayload.push({ id: parseInt(checkedUsers[0].value), shares: 1 });
        } else {
            // If multiple people, gather their shares
            checkedUsers.forEach(checkbox => {
                const wrapper = checkbox.closest('.user-share-wrapper');
                participantsPayload.push({
                    id: parseInt(checkbox.value),
                    shares: parseInt(wrapper.querySelector('.share-value').textContent)
                });
            });
        }

        postData(`projects/${projectId}/complete`, { participants: participantsPayload })
            .then(response => {
                if (response.error) {
                    alert(`Error: ${response.error}`);
                    return;
                }
                console.log(response);
                hideModal();
                switchToProjectsTab();
            });
    };

    // --- REMAINDER OF APP.JS (UNCHANGED) ---
    const showUserDetails = async (userId) => { const user = currentUsers.find(u => u.id === userId); if (!user) return; modalTitle.innerText = user.name; modalBody.innerHTML = `<p>Loading transaction history...</p>`; openModal(); const transactions = await fetchData(`users/${userId}/transactions`); let transactionsHtml = '<h4>Recent Activity:</h4><ul class="transaction-list">'; if (transactions.length > 0) { transactions.forEach(t => { const amountClass = t.amount > 0 ? 'positive' : 'negative'; const sign = t.amount > 0 ? '+' : ''; transactionsHtml += `<li><span>${t.description}</span><span class="money-value ${amountClass}">${sign}$${Math.abs(t.amount).toFixed(2)}</span></li>`; }); } else { transactionsHtml += '<li>No transactions yet.</li>'; } transactionsHtml += '</ul>'; modalBody.innerHTML = `<h3>Current Balance: <span class="money-value">$${user.balance.toFixed(2)}</span></h3>${transactionsHtml}<button class="action-button" id="spendMoneyBtn" data-user-id="${user.id}">Spend Money</button>`; };
    const renderProjects = (projects) => { currentProjects = projects; projectsContainer.innerHTML = ''; if (projects.length === 0) { projectsContainer.innerHTML = '<p>No available projects!</p>'; return; } projects.forEach(project => { const projectButton = document.createElement('button'); projectButton.className = 'list-item'; projectButton.dataset.id = project.id; projectButton.innerHTML = `<span>${project.name}</span><span class="money-value positive">$${project.value.toFixed(2)}</span>`; projectsContainer.appendChild(projectButton); }); };
    const renderUsers = (users) => { currentUsers = users; usersContainer.innerHTML = ''; users.forEach(user => { const userButton = document.createElement('button'); userButton.className = 'list-item'; userButton.dataset.id = user.id; userButton.innerHTML = `<span>${user.name}</span><span class="money-value">$${user.balance.toFixed(2)}</span>`; usersContainer.appendChild(userButton); }); usersContainer.appendChild(manualScreensaverBtn); };
    const switchToProjectsTab = () => { projectsTab.classList.add('active'); usersTab.classList.remove('active'); projectsContainer.style.display = 'flex'; usersContainer.style.display = 'none'; fetchData('projects').then(renderProjects); };
    const switchToUsersTab = () => { usersTab.classList.add('active'); projectsTab.classList.remove('active'); usersContainer.style.display = 'flex'; projectsContainer.style.display = 'none'; fetchData('users').then(renderUsers); };
    const handleSpendMoney = (userId) => { const amount = prompt('Enter amount to spend:'); if (amount === null || isNaN(amount) || parseFloat(amount) <= 0) { alert('Please enter a valid amount.'); return; } postData(`users/${userId}/spend`, { amount: parseFloat(amount) }).then(response => { console.log(response); hideModal(); switchToUsersTab(); }); };
    const initializeApp = () => { Promise.all([fetchData('users'), fetchData('projects')]).then(([users, projects]) => { renderUsers(users); renderProjects(projects); projectsTab.classList.add('active'); projectsContainer.style.display = 'flex'; }); };
    projectsTab.addEventListener('click', switchToProjectsTab); usersTab.addEventListener('click', switchToUsersTab); closeModal.addEventListener('click', hideModal); modal.addEventListener('click', (e) => { if (e.target === modal) { hideModal(); } }); modalBody.addEventListener('click', (e) => { const completeBtn = e.target.closest('#completeProjectBtn'); const spendBtn = e.target.closest('#spendMoneyBtn'); if (completeBtn) { handleCompleteProject(parseInt(completeBtn.dataset.projectId)); } else if (spendBtn) { handleSpendMoney(parseInt(spendBtn.dataset.userId)); } }); projectsContainer.addEventListener('click', (e) => { const projectButton = e.target.closest('.list-item'); if (projectButton) { showProjectDetails(parseInt(projectButton.dataset.id)); } }); usersContainer.addEventListener('click', (e) => { const userButton = e.target.closest('.list-item'); if (userButton && userButton.id !== 'manualScreensaverBtn') { showUserDetails(parseInt(userButton.dataset.id)); } });
    window.addEventListener('mousemove', resetIdleTimer); window.addEventListener('mousedown', resetIdleTimer); window.addEventListener('keypress', resetIdleTimer); window.addEventListener('touchmove', resetIdleTimer); screensaver.addEventListener('click', stopScreensaver); manualScreensaverBtn.addEventListener('click', startScreensaver);
    initializeApp();
    resetIdleTimer();
});
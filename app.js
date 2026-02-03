// テスト用タスク管理システム - JavaScript

// 状態管理
let tasks = [];
let currentFilter = 'all';
let nextId = 1;

// DOM要素の取得
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const modal = document.getElementById('modal');
const showModalBtn = document.getElementById('showModalBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const closeSpan = document.getElementsByClassName('close')[0];
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const resetBtn = document.getElementById('resetBtn');
const filterButtons = document.querySelectorAll('.btn-filter');

// カウンター要素
const countAll = document.getElementById('countAll');
const countActive = document.getElementById('countActive');
const countCompleted = document.getElementById('countCompleted');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateUI();
});

// タスクの追加
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = taskInput.value.trim();
    const priority = prioritySelect.value;
    
    if (title === '') return;
    
    // ローディング表示
    showLoading();
    
    // 非同期処理のシミュレーション
    setTimeout(() => {
        const task = {
            id: nextId++,
            title: title,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        saveTasks();
        
        taskInput.value = '';
        prioritySelect.value = 'medium';
        
        hideLoading();
        updateUI();
    }, 500);
});

// タスクの表示
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    taskList.style.display = 'flex';
    emptyMessage.style.display = 'none';
    
    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-task-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
            >
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority priority-${task.priority}">
                    優先度: ${getPriorityLabel(task.priority)}
                </span>
            </div>
            <button class="delete-btn">
                🗑️ 削除
            </button>
        </li>
    `).join('');
    
    // イベント委譲でチェックボックスと削除ボタンのイベントを処理
    taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            toggleTask(taskId);
        });
    });
    
    taskList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = parseInt(e.target.closest('.task-item').dataset.taskId);
            deleteTask(taskId);
        });
    });
}

// タスクの完了切り替え
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateUI();
    }
}

// タスクの削除
function deleteTask(id) {
    if (confirm('このタスクを削除しますか?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        updateUI();
    }
}

// フィルタリング
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.getAttribute('data-filter');
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        updateUI();
    });
});

// フィルタリングされたタスクを取得
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// 完了済みタスクの削除
clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        alert('完了済みのタスクがありません。');
        return;
    }
    
    if (confirm(`${completedCount}個の完了済みタスクを削除しますか?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        updateUI();
    }
});

// 全リセット
resetBtn.addEventListener('click', () => {
    if (confirm('全てのタスクを削除しますか? この操作は取り消せません。')) {
        tasks = [];
        nextId = 1;
        saveTasks();
        updateUI();
    }
});

// カウンターの更新
function updateCounters() {
    const all = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    countAll.textContent = all;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

// UI全体の更新
function updateUI() {
    renderTasks();
    updateCounters();
}

// ローディング表示/非表示
function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// モーダルの表示/非表示
showModalBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

closeSpan.addEventListener('click', () => {
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// ローカルストレージへの保存
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', nextId.toString());
}

// ローカルストレージから読み込み
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    const savedNextId = localStorage.getItem('nextId');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
}

// ユーティリティ関数
function getPriorityLabel(priority) {
    const labels = {
        'low': '低',
        'medium': '中',
        'high': '高'
    };
    return labels[priority] || priority;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

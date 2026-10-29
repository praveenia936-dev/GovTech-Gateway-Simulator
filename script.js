var priorityKeywords = ["broken", "leak", "water", "danger", "crack", "fire"];
var categories = ["Maintenance", "Sanitation", "Roads & Traffic", "Public Safety"];
var agencies = ["HDB", "NEA", "LTA", "PUB"];

var incidentQueue = [];

init();

function init() {
    setupThemeListener();
    renderOptions();
    renderDashboardLists();
}

function changeTheme() {
    var choice = document.getElementById('themeSelect').value;
    if (choice == 'system') {
        applySystemTheme();
    } else {
        document.documentElement.setAttribute('data-theme', choice);
    }
}

function applySystemTheme() {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function setupThemeListener() {
    applySystemTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (document.getElementById('themeSelect').value == 'system') {
            applySystemTheme();
        }
    });
}

function showPage(pageId) {
    document.getElementById('mainPage').className = "page";
    document.getElementById('dashPage').className = "page";
    document.getElementById('tabMainBtn').className = "";
    document.getElementById('tabDashBtn').className = "";

    if (pageId == 'mainPage') {
        document.getElementById('mainPage').className = "page active";
        document.getElementById('tabMainBtn').className = "active";
    } else {
        document.getElementById('dashPage').className = "page active";
        document.getElementById('tabDashBtn').className = "active";
    }
}

function renderOptions() {
    var catSelect = document.getElementById('categorySelect');
    var agencySelect = document.getElementById('agencySelect');

    catSelect.innerHTML = "";
    agencySelect.innerHTML = "";

    for (var i = 0; i < categories.length; i++) {
        catSelect.innerHTML += '<option value="' + categories[i] + '">' + categories[i] + '</option>';
    }

    for (var j = 0; j < agencies.length; j++) {
        agencySelect.innerHTML += '<option value="' + agencies[j] + '">' + agencies[j] + '</option>';
    }
}

function renderDashboardLists() {
    var kwBox = document.getElementById('keywordsList');
    var catBox = document.getElementById('categoriesList');
    var agBox = document.getElementById('agenciesList');

    kwBox.innerHTML = "";
    catBox.innerHTML = "";
    agBox.innerHTML = "";

    for (var i = 0; i < priorityKeywords.length; i++) {
        kwBox.innerHTML += '<div class="tag-item">' + priorityKeywords[i] + ' <span onclick="removeItem(\'keyword\', ' + i + ')">✕</span></div>';
    }

    for (var j = 0; j < categories.length; j++) {
        catBox.innerHTML += '<div class="tag-item">' + categories[j] + ' <span onclick="removeItem(\'category\', ' + j + ')">✕</span></div>';
    }

    for (var k = 0; k < agencies.length; k++) {
        agBox.innerHTML += '<div class="tag-item">' + agencies[k] + ' <span onclick="removeItem(\'agency\', ' + k + ')">✕</span></div>';
    }
}

function addNewConfigItem() {
    var type = document.getElementById('addTypeSelect').value;
    var input = document.getElementById('addValueInput');
    var val = input.value.trim();

    if (val == "") {
        alert("Please enter a valid term!");
        return;
    }

    if (type == "keyword") {
        priorityKeywords.push(val.toLowerCase());
    } else if (type == "category") {
        categories.push(val);
    } else if (type == "agency") {
        agencies.push(val);
    }

    input.value = "";
    renderOptions();
    renderDashboardLists();
}

function removeItem(type, index) {
    if (type == "keyword") {
        priorityKeywords.splice(index, 1);
    } else if (type == "category") {
        categories.splice(index, 1);
    } else if (type == "agency") {
        agencies.splice(index, 1);
    }

    renderOptions();
    renderDashboardLists();
}

function submitReport() {
    var nameInput = document.getElementById('citizenName');
    var contactInput = document.getElementById('citizenContact');
    var issueInput = document.getElementById('issueInput');

    var name = nameInput.value;
    var contact = contactInput.value;
    var text = issueInput.value;

    var category = document.getElementById('categorySelect').value;
    var agency = document.getElementById('agencySelect').value;

    if (name == "" || contact == "" || text == "") {
        alert("Please complete all citizen details and issue description.");
        return;
    }

    var priority = "NORMAL";
    var lowerText = text.toLowerCase();

    for (var i = 0; i < priorityKeywords.length; i++) {
        if (lowerText.indexOf(priorityKeywords[i]) != -1) {
            priority = "HIGH";
            break;
        }
    }

    var newTicket = {
        name: name,
        contact: contact,
        text: text,
        category: category,
        agency: agency,
        priority: priority
    };

    if (priority == "HIGH") {
        incidentQueue.unshift(newTicket);
    } else {
        incidentQueue.push(newTicket);
    }

    nameInput.value = "";
    contactInput.value = "";
    issueInput.value = "";
    renderQueue();
}

function dispatchTicket(index) {
    incidentQueue.splice(index, 1);
    renderQueue();
}

function renderQueue() {
    var container = document.getElementById('queueContainer');
    container.innerHTML = "";

    if (incidentQueue.length == 0) {
        container.innerHTML = '<div class="empty-state">No active incidents in system queue.</div>';
        return;
    }

    for (var i = 0; i < incidentQueue.length; i++) {
        var ticket = incidentQueue[i];
        var isHigh = ticket.priority == "HIGH";

        var div = document.createElement('div');
        div.className = "ticket " + (isHigh ? "high-priority" : "normal-priority");

        div.innerHTML =
            '<div class="badge-row">' +
            '<span class="badge ' + (isHigh ? "badge-high" : "badge-normal") + '">' + ticket.priority + ' PRIORITY</span>' +
            '<span class="badge badge-agency">' + ticket.agency + '</span>' +
            '</div>' +
            '<div class="ticket-info"><b>Reporter:</b> ' + ticket.name + ' (' + ticket.contact + ') | <b>Category:</b> ' + ticket.category + '</div>' +
            '<div class="ticket-text">' + ticket.text + '</div>' +
            '<button class="btn-dispatch" onclick="dispatchTicket(' + i + ')">Dispatch & Clean Memory</button>';

        container.appendChild(div);
    }
}
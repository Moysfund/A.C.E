// storage.js - Data Persistence

const STORAGE_KEYS = {
    STAGE_REPORTS: 'lasbca_stage_reports',
    CONTRAVENTIONS: 'lasbca_contraventions',
    PCA_AUDITS: 'lasbca_pca_audits',
    PROJECTS: 'lasbca_projects',
    TEAMS: 'lasbca_teams'
};

// Initialize storage
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.STAGE_REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.STAGE_REPORTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTRAVENTIONS)) {
        localStorage.setItem(STORAGE_KEYS.CONTRAVENTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PCA_AUDITS)) {
        localStorage.setItem(STORAGE_KEYS.PCA_AUDITS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([
            { id: 1, name: 'Team A', lead: 'Engr. Adebayo', members: 5, reports: 342 },
            { id: 2, name: 'Team B', lead: 'Engr. Chioma', members: 4, reports: 287 },
            { id: 3, name: 'Team C', lead: 'Engr. Femi', members: 4, reports: 198 },
            { id: 4, name: 'Special Team', lead: 'Engr. Ngozi', members: 5, reports: 156 }
        ]));
    }
}

// ===== STAGE REPORTS =====
function getStageReports() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STAGE_REPORTS)) || [];
}

function saveStageReport(report) {
    const reports = getStageReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.STAGE_REPORTS, JSON.stringify(reports));
}

// ===== CONTRAVENTIONS =====
function getContraventions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRAVENTIONS)) || [];
}

function saveContravention(contravention) {
    const contraventions = getContraventions();
    contraventions.push(contravention);
    localStorage.setItem(STORAGE_KEYS.CONTRAVENTIONS, JSON.stringify(contraventions));
}

// ===== PCA AUDITS =====
function getPCAAudits() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PCA_AUDITS)) || [];
}

function savePCAAudit(pca) {
    const pcas = getPCAAudits();
    pcas.push(pca);
    localStorage.setItem(STORAGE_KEYS.PCA_AUDITS, JSON.stringify(pcas));
}

// ===== PROJECTS =====
function getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
}

function saveProject(project) {
    const projects = getProjects();
    projects.push(project);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

// ===== TEAMS =====
function getTeams() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAMS)) || [];
}

// ===== UTILITY =====
function generateId(prefix) {
    const count = getStageReports().length + getContraventions().length + getPCAAudits().length + 1;
    const padded = String(count).padStart(3, '0');
    return `${prefix}-${new Date().getFullYear()}-${padded}`;
}

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

// Initialize
initStorage();

// Make globally available
window.getStageReports = getStageReports;
window.saveStageReport = saveStageReport;
window.getContraventions = getContraventions;
window.saveContravention = saveContravention;
window.getPCAAudits = getPCAAudits;
window.savePCAAudit = savePCAAudit;
window.getProjects = getProjects;
window.saveProject = saveProject;
window.getTeams = getTeams;
window.generateId = generateId;
window.formatDate = formatDate;

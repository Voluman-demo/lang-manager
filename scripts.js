const serverUrl = 'https://lang-manager.onrender.com';
// const serverUrl = 'http://localhost:8083'

// Funkcje zarzadzania jezykami
async function fetchLanguages() {
    try {
        const response = await fetch(`${serverUrl}/api/languages`);
        if (!response.ok) throw new Error("Blad podczas pobierania jezykow.");
        const languages = await response.json();
        displayLanguages(languages);
    } catch (error) {
        showMessage(error.message, 'error', 'languageMessage');
    }
}

async function addLanguage() {
    hideLanguages();
    const code = document.getElementById('languageCode').value.trim();
    if (!code) {
        showMessage("Prosze wprowadzic kod jezyka.", 'error', 'languageMessage');
        return;
    }
    try {
        const response = await fetch(`${serverUrl}/api/languages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        showMessage(message, 'success', 'languageMessage');

        await populateLanguageSelect();
    } catch (error) {
        showMessage(error.message, 'error', 'languageMessage');
    } finally {
        clearInput('languageCode'); 
    }
}

async function removeLanguage() {
    hideLanguages();
    const code = document.getElementById('languageCode').value.trim();
    if (!code) {
        showMessage("Prosze wprowadzic kod jezyka.", 'error', 'languageMessage');
        return;
    }
    try {
        const response = await fetch(`${serverUrl}/api/languages/${code}`, { method: 'DELETE' });
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        showMessage(message, 'success', 'languageMessage');

        await populateLanguageSelect();
    } catch (error) {
        showMessage(error.message, 'error', 'languageMessage');
    } finally {
        clearInput('languageCode'); 
    }
}

async function clearLanguages() {
    hideLanguages();
    try {
        const response = await fetch(`${serverUrl}/api/languages/clear`, { method: 'DELETE' });
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        showMessage(message, 'success', 'languageMessage');

        await populateLanguageSelect();
    } catch (error) {
        showMessage(error.message, 'error', 'languageMessage');
    } finally {
        clearInput('languageCode'); 
    }
}

function displayLanguages(languages) {
    const languagesList = document.getElementById('languages');
    languagesList.innerHTML = '';
    if (languages.length === 0) {
        languagesList.innerHTML = '<li>Brak dostepnych jezykow.</li>';
        return;
    }
    languages.forEach(lang => {
        const li = document.createElement('li');
        li.className = 'language-item';
        li.textContent = `Kod jezyka: ${lang.code}`;
        languagesList.appendChild(li);
    });
}

function hideLanguages() {
    document.getElementById('languages').innerHTML = '';
}

function clearInput(type) {
    const input = document.getElementById(`${type}`);
    input.value = '';
}


function showMessage(message, type, elementId) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = message;
    messageElement.className = type;
}

document.addEventListener('DOMContentLoaded', populateLanguageSelect);

// Funkcje zarzadzania dokumentami
async function populateLanguageSelect() {
    const languageSelect = document.getElementById('documentLanguage');
    try {
        const response = await fetch(`${serverUrl}/api/languages`);
        if (!response.ok) throw new Error("Blad podczas pobierania listy jezykow.");
        const languages = await response.json();
        languageSelect.innerHTML = '<option value="">Wybierz jezyk</option>';
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.code.toUpperCase();
            languageSelect.appendChild(option);
        });
    } catch (error) {
        showMessage(error.message, 'error', 'languageMessage');
    }
}

async function uploadDocument() {
    const fileInput = document.getElementById('documentFile');
    const languageCode = document.getElementById('documentLanguage').value;
    const documentType = document.getElementById('documentType').value.trim();
    const versionOption  = document.getElementById('versionOption').value;

    if (!fileInput.files.length || !languageCode || !documentType) {
        showMessage("Prosze wypelnic wszystkie pola.", 'error', 'documentMessage');
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("languageCode", languageCode);
    formData.append("type", documentType);
    formData.append("version", versionOption);

    try {
        const response = await fetch(`${serverUrl}/api/documents`, {
            method: 'POST',
            body: formData
        });
        const message = await response.text();
        if (!response.ok) throw new Error(message);
        showMessage(message, 'success', 'documentMessage');
    } catch (error) {
        showMessage(error.message, 'error', 'documentMessage');
    } finally {
        clearFileInput(); 
        clearInput('documentType');
        resetLanguageSelection();
    }
}

function resetLanguageSelection() {
    const languageSelect = document.getElementById('documentLanguage');
    languageSelect.value = '';
}
async function checkDocuments() {
    try {
        const typeInput = document.getElementById('documentType').value.trim();
        const queryParam = typeInput ? `?type=${encodeURIComponent(typeInput)}` : '';
        const response = await fetch(`${serverUrl}/api/documents/check${queryParam}`);
        const outdatedDocuments = await response.json();
        showMessage(outdatedDocuments.length === 0 ? "Wszystkie dokumenty sa aktualne." : "Nieaktualne dokumenty:", 'success', 'documentMessage');
        const documentsList = document.getElementById('documents');
        documentsList.innerHTML = '';
        if (outdatedDocuments.length > 0) {
            displayDocuments(outdatedDocuments); 
        }
    } catch (error) {
        showMessage(error.message, 'error', 'documentMessage');
    }
}

async function fetchDocuments() {
    try {
        const typeInput = document.getElementById('documentType').value.trim();
        const queryParam = typeInput ? `?type=${encodeURIComponent(typeInput)}` : '';
        const response = await fetch(`${serverUrl}/api/documents${queryParam}`);
        if (!response.ok) throw new Error("blad podczas pobierania dokumentow.");
        const documents = await response.json();
        console.log(documents);
        displayDocuments(documents);
    } catch (error) {
        showMessage(error.message, 'error', 'documentMessage');
    }
}

function displayDocuments(documents) {
    const documentsList = document.getElementById('documents');
    documentsList.innerHTML = '';
    if (documents.length === 0) {
        documentsList.innerHTML = '<li>Brak dostepnych dokumentow.</li>';
        return;
    }

    documents.forEach(doc => {
        const li = document.createElement('li');
        li.className = 'document-item';

        const documentUrl = doc.filePath;
        li.innerHTML = `
            <strong>Typ:</strong> ${doc.type}, 
            <strong>Jezyk:</strong> ${doc.languageCode.toUpperCase()}, 
            <strong>Wersja:</strong> ${doc.version[0]}.${doc.version[1]}.${doc.version[2]}
            <button onclick="viewDocument('${documentUrl}')">Otworz</button>
        `;
        documentsList.appendChild(li);
    });
}

function viewDocument(doc) {
    console.log(doc);
    // Upewnij sie, że doc zawiera wlaściwy URL pliku
    const documentUrl = doc;  // Zmieniamy na doc.filePath, bo to tam znajduje sie URL
    console.log("Otwieram dokument z URL: ", documentUrl);

    // Otwieramy dokument w nowej karcie
    if (documentUrl && documentUrl !== 'null') {
        window.open(documentUrl, '_blank');
    } else {
        alert('Blad: Nieprawidlowy adres URL dokumentu.');
    }
}

function clearFileInput() {
    const fileInput = document.getElementById('documentFile');
    fileInput.value = '';
}
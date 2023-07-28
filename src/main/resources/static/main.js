"use strict";

const url = "http://localhost:8080/admin/admin"

function getOnlyRolesWithoutRole_(roles) {
    roles.sort((a, b) => a.name.localeCompare(b.name));
    return roles.map(role => role.name.replace("ROLE_", "")).join(" ");
}

async function getAdminPage() {
    let page = await fetch(url);
    if (page.ok) {
        let listAllUser = await page.json();
        loadTableData(listAllUser);
    } else {
        alert(`Error, ${page.status}`)
    }
}

getAdminPage();

const pills = document.querySelectorAll('.pill');
const pillsContent = document.querySelectorAll('.pillContent');
pills.forEach((clickedPill) => {
    clickedPill.addEventListener('click', async () => {
        pills.forEach((pill) => {
            pill.classList.remove('active');
        });
        clickedPill.classList.add('active');
        let tabId = clickedPill.getAttribute('id');
        await activePillContent(tabId);
    });
});

async function activePillContent(tabId) {
    pillsContent.forEach((clickedPillContent) => {
        clickedPillContent.classList.contains(tabId) ?
            clickedPillContent.classList.add('active') :
            clickedPillContent.classList.remove('active');
    })
}

async function getMyUser() {
    let res = await fetch('/api/auth');
    let resUser = await res.json();
    userNavbarDetails(resUser);
}

window.addEventListener('DOMContentLoaded', getMyUser);

function userNavbarDetails(resUser) {
    let userList = document.getElementById('myUserDetails');
    let rolesWithoutRole = getOnlyRolesWithoutRole_(resUser.roles);
    userList.insertAdjacentHTML('beforeend', `
        <b> ${resUser.username} </b> with roles: <a>${rolesWithoutRole}</a>`);
}


function loadTableData(listAllUser) {
    let tableBody = document.getElementById('tbody');
    let dataHtml = '';
    for (let user of listAllUser) {
        let roles = getOnlyRolesWithoutRole_(user.roles);
        dataHtml +=
            `<tr>
    <td>${user.id}</td>
    <td>${user.username}</td>
    <td>${user.surname}</td>
    <td>${user.job}</td>
    <td>${user.age}</td>
    <td>${roles}</td>
    <td>
        <button class="btn blue-background" data-bs-toogle="modal"
        data-bs-target="#editModal"
        onclick="editModalData(${user.id})">Edit</button>
    </td>
        <td>
        <button class="btn btn-danger" data-bs-toogle="modal"
        data-bs-target="#deleteModal"
        onclick="deleteModalData(${user.id})">Delete</button>
    </td>
</tr>`
    }
    tableBody.innerHTML = dataHtml;
}


window.addEventListener('DOMContentLoaded', loadUserTable);

async function loadUserTable() {
    let tableBody = document.getElementById('tableUser');
    let page = await fetch("/api/auth");
    let currentUser;
    if (page.ok) {
        currentUser = await page.json();
    } else {
        alert(`Error, ${page.status}`)
    }
    let dataHtml = '';
    let roles = getOnlyRolesWithoutRole_(currentUser.roles);
    dataHtml +=
        `<tr>
    <td>${currentUser.id}</td>
    <td>${currentUser.username}</td>
    <td>${currentUser.surname}</td>
    <td>${currentUser.job}</td>
    <td>${currentUser.age}</td>
    <td>${roles}</td>
</tr>`
    tableBody.innerHTML = dataHtml;
}

const tabs = document.querySelectorAll('.tab');
const tabsContent = document.querySelectorAll('.tabContent');
tabs.forEach((clickedTab) => {
    clickedTab.addEventListener('click', async () => {
        tabs.forEach((tab) => {
            tab.classList.remove('active');
        });
        clickedTab.classList.add('active');
        let idTab = clickedTab.getAttribute('id');
        await activeTabContent(idTab);
    });
});

async function activeTabContent(idTab) {
    tabsContent.forEach((clickedTabContent) => {
        clickedTabContent.classList.contains(idTab) ?
            clickedTabContent.classList.add('active') :
            clickedTabContent.classList.remove('active');
    })
}

const form_new = document.getElementById('formForNewUser');

async function newUser() {
    form_new.addEventListener('submit', addNewUser);
}

async function addNewUser(event) {
    event.preventDefault();
    let listOfRole = [];
    for (let i = 0; i < form_new.selectRole.options.length; i++) {
        if (form_new.selectRole.options[i].selected) {
            listOfRole.push({
                id: form_new.selectRole.options[i].value,
                role: form_new.selectRole.options[i].text
            });
        }
    }
    let method = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: form_new.username.value,
            surname: form_new.surname.value,
            job: form_new.job.value,
            age: form_new.age.value,
            password: form_new.password.value,
            roles: listOfRole
        })
    }
    await fetch(url, method).then(() => {
        form_new.reset();
        getAdminPage();
        activeTabContent('home-tab');
        let activateTab = document.getElementById('home-tab');
        activateTab.classList.add('active');
        let deactivateTab = document.getElementById('profile-tab');
        deactivateTab.classList.remove('active');
    });
}


const form_del = document.getElementById('formForDeleting');
const id_del = document.getElementById('id_del');
const username_del = document.getElementById(`username_del`);
const surname_del = document.getElementById('surname_del');
const job_del = document.getElementById('job_del');
const age_del = document.getElementById('age_del');


async function deleteModalData(id) {
    $('#deleteModal').modal('show');
    const urlForDel = 'http://localhost:8080/admin/admin/' + id;
    let usersPageDel = await fetch(urlForDel);
    if (usersPageDel.ok) {
        await usersPageDel.json().then(user => {
            id_del.value = `${user.id}`;
            username_del.value = `${user.username}`;
            surname_del.value = `${user.surname}`;
            job_del.value = `${user.job}`;
            age_del.value = `${user.age}`;
        })
    } else {
        alert(`Error, ${usersPageDel.status}`)
    }
}

async function deleteUser() {
    let urlDel = 'http://localhost:8080/admin/admin/' + id_del.value;
    let method = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: form_del.username.value,
            surname: form_del.surname.value,
            job: form_del.job.value,
            age: form_del.age.value
        })
    }
    await fetch(urlDel, method).then(() => {
        $('#deleteCloseBtn').click();
        getAdminPage();
    })
}

const form_ed = document.getElementById('formForEditing');
const id_ed = document.getElementById('id_ed');
const username_ed = document.getElementById('username_ed');
const surname_ed = document.getElementById('surname_ed');
const job_ed = document.getElementById('job_ed');
const age_ed = document.getElementById('age_ed');


async function editModalData(id) {
    $('#editModal').modal('show');
    const urlDataEd = 'http://localhost:8080/admin/admin/' + id;
    let usersPageEd = await fetch(urlDataEd);
    if (usersPageEd.ok) {
        await usersPageEd.json().then(user => {
            id_ed.value = `${user.id}`;
            username_ed.value = `${user.username}`;
            surname_ed.value = `${user.surname}`;
            job_ed.value = `${user.job}`;
            age_ed.value = `${user.age}`;
        })
    } else {
        alert(`Error, ${usersPageEd.status}`)
    }
}

async function editUser() {
    let urlEdit = 'http://localhost:8080/admin/admin/' + id_ed.value;
    let listOfRole = [];
    for (let i = 0; i < form_ed.rolesEditing.options.length; i++) {
        if (form_ed.rolesEditing.options[i].selected) {
            listOfRole.push({
                id: form_ed.rolesEditing.options[i].value,
                name: form_ed.rolesEditing.options[i].text
            });
        }
    }
    let method = {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: form_ed.editedUserId.value,
            username: form_ed.username.value,
            surname: form_ed.surname.value,
            job: form_ed.job.value,
            age: form_ed.age.value,
            roles: listOfRole
        })
    }
    await fetch(urlEdit, method).then(() => {
        $('#editCloseBtn').click();
        getAdminPage();
    })
}



/* eslint-disable no-unused-vars */
"use strict";

window.onload = getTop10();

function checkEnter(event) {
    const steamIdField = document.getElementById('steamIdField');
    const errorMessage = document.getElementById('errorMessage');

    if (event.key === "Enter") {
        const steamId = steamIdField.value;
        if (isValidSteamId32(steamId)) {
            loadStatsPage(steamId);
            errorMessage.style.display = 'none'; // Hide error message if valid
        } else {
            steamIdField.style.border = "2px solid #fc0303";
            errorMessage.style.display = 'block'; // Show error message
        }
    } else {
        steamIdField.style.border = "2px solid #007770";
        errorMessage.style.display = 'none'; // Hide error message on keypress
    }
}

//from borbkz kz.gl
function isValidSteamId32(steamId) {
    return /^STEAM_[0-5]:[01]:\d{1,50}$/.test(steamId);
}

function loadStatsPage(steamId) {
    console.log(steamId);
    window.location.href = '/' + steamId;
}

async function getTop10() {
    const response = await fetch('https://randomuser.me/api/?results=10');
    const data = await response.json();
    const names = data.results.map(user => `${user.name.first} ${user.name.last}`);
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = names.map(name => `<li>${name}</li>`).join('');
}



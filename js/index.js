"use strict";

window.onload = getTop10();

function checkEnter(event) {
    if (event.key === "Enter") {
        const steamid = document.getElementById('steamIdField').value;
        if(isValidSteamId32(steamid)){
            loadStatsPage(steamid);
        }
    }
}

function loadStatsPage(steamid) {
    window.location.href = '/' + steamid;
}

async function getTop10() {
    const response = await fetch('https://randomuser.me/api/?results=10');
    const data = await response.json();
    const names = data.results.map(user => `${user.name.first} ${user.name.last}`);
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = names.map(name => `<li>${name}</li>`).join('');
}

//from borbkz kz.gl
function isValidSteamId32(steamid) {
    return /^STEAM_[0-5]:[01]:\d+$/.test(steamid);
}
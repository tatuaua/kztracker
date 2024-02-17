/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
"use strict";

window.onload = showUserStats(),
    fillHistoryContainer(50000),
    document.title = "KZTracker - " + getUserName(steamId),
    document.getElementById('steamIdField').value = steamId;

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

function loadStatsPage(steamId) {
    console.log(window.location.href);
    window.location.href = '/' + steamId;
}

function showUserStats() {
    var playerName = getUserName(steamId);

    // Call getUserStats and wait for the promise to resolve
    getUserStats(steamId)
        .then(data => {
            if (data && data.length > 0) {
                const start = performance.now();
                console.log(data);
                renderPointsLine(data, playerName);
                renderPointsAvgLine(data, playerName);
                renderljPBLine(data, playerName);
                const end = performance.now();
                console.log(`Execution time: ${end - start} ms`);
            } else {
                console.error("No data found for steamId");
            }
        })
        .catch(error => {
            console.error("Error fetching user stats:", error.message);
        });
}

//from borbkz kz.gl
function isValidSteamId32(steamId) {
    return /^STEAM_[0-5]:[01]:\d{1,50}$/.test(steamId);
}

function getUserName(steamId) {
    //Get username from API
    return "PlayerName";
}

async function getUserStats(steamId) {
    let clonedResponse = null;
    try {
        const response = await fetch("http://localhost:3000/stats/" + steamId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.error('Fetch error:', error.message);
        console.log(clonedResponse);
        throw error;
    }
}

function renderPointsLine(data, playerName) {
    // Select the container for the line graph
    var container = d3.select(".pointsline");

    // Set the dimensions and increased margins of the graph
    var width = 800;
    var height = 400;
    var margin = { top: 50, right: 50, bottom: 50, left: 70 };

    // Parse the date/time
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

    // Format the data
    data.forEach(function (d) {
        d.customTimestamp = parseTime(d.customTimestamp);
        d.proPoints = +d.proPoints; // Convert to number
        d.tpPoints = +d.tpPoints; // Convert to number
    });

    // Define colors
    var proLineColor = "#1f77b4";  // Pro line color
    var tpLineColor = "#c9b785";   // TP line color
    var totalLineColor = "#007770"; // Total line color
    var axisColor = "#ffffff";      // Axis color

    // Set the ranges
    var x = d3.scaleTime().range([0, width - margin.left - margin.right]);
    var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    // Define the lines
    var proLine = d3.line()
        .x(function (d) { return x(d.customTimestamp); })
        .y(function (d) { return y(d.proPoints); })
        .curve(d3.curveMonotoneX);

    var tpLine = d3.line()
        .x(function (d) { return x(d.customTimestamp); })
        .y(function (d) { return y(d.tpPoints); })
        .curve(d3.curveMonotoneX);

    var totalLine = d3.line()
        .x(function (d) { return x(d.customTimestamp); })
        .y(function (d) { return y(d.proPoints + d.tpPoints); })
        .curve(d3.curveMonotoneX);

    // Append an SVG object to the container with adjusted dimensions
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.customTimestamp; }));
    y.domain([0, d3.max(data, function (d) { return d.proPoints + d.tpPoints; })]);

    // Add the Pro Points line
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", proLine)
        .style("stroke", proLineColor)
        .style("fill", "none");

    // Add the TP Points line
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", tpLine)
        .style("stroke", tpLineColor)
        .style("fill", "none");

    // Add the Total Points line
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", totalLine)
        .style("stroke", totalLineColor)
        .style("stroke-width", 2)
        .style("fill", "none");

    // Add the X Axis with adjusted dimensions and axis color
    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add the Y Axis with adjusted dimensions and axis color
    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add a title
    svg.append("text")
        .attr("transform", "translate(" + ((width - margin.left - margin.right) / 2) + " ," + (height - margin.top) + ")")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - ((height - margin.top - margin.bottom) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("Points");

    // Add a title with axis color
    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", axisColor)
        .text(playerName + "'s Points Progression");
}

function renderPointsAvgLine(data, playerName) {
    // Select the container for the line graph
    var container = d3.select(".pointsavgline");

    // Set the dimensions and increased margins of the graph
    var width = 800;
    var height = 400;
    var margin = { top: 50, right: 50, bottom: 50, left: 70 };

    // Parse the date/time
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

    // Define colors
    var lineColor = "#007770";  // Line color
    var axisColor = "#ffffff";  // Axis color

    // Format the data
    data.forEach(function (d) {
        d.customTimestamp = new Date(d.customTimestamp);
    });

    // Set the ranges
    var x = d3.scaleTime().range([0, width - margin.left - margin.right]);
    var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    // Define the line
    var valueline = d3.line()
        .x(function (d) { return x(d.customTimestamp); })
        .y(function (d) { return y(d.proPoints / d.proCompletions); })
        .curve(d3.curveMonotoneX);

    // Append an SVG object to the container with adjusted dimensions
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.customTimestamp; }));
    y.domain([0, d3.max(data, function (d) { return d.proPoints / d.proCompletions; })]);

    // Add the valueline path with line color
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", lineColor)
        .style("stroke-width", 2)
        .style("fill", "none");

    // Add the X Axis with adjusted dimensions and axis color
    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add the Y Axis with adjusted dimensions and axis color
    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add a title
    svg.append("text")
        .attr("transform", "translate(" + ((width - margin.left - margin.right) / 2) + " ," + (height - margin.top) + ")")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - ((height - margin.top - margin.bottom) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("Points average");

    // Add a title with axis color
    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", axisColor)
        .text(playerName + "'s Points Average Progression");
}

function renderljPBLine(data, playerName) {
    // Select the container for the line graph
    var container = d3.select(".ljpbline");

    // Set the dimensions and increased margins of the graph
    var width = 800;
    var height = 400;
    var margin = { top: 50, right: 50, bottom: 50, left: 70 };

    // Parse the date/time
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

    // Define colors
    var lineColor = "#007770";  // Line color
    var axisColor = "#ffffff";  // Axis color

    // Format the data
    data.forEach(function (d) {
        d.customTimestamp = new Date(d.customTimestamp);
    });

    // Set the ranges
    var x = d3.scaleTime().range([0, width - margin.left - margin.right]);
    var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    // Define the line
    var valueline = d3.line()
        .x(function (d) { return x(d.customTimestamp); })
        .y(function (d) { return y(d.ljPB); })
        .curve(d3.curveMonotoneX);

    // Append an SVG object to the container with adjusted dimensions
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.customTimestamp; }));
    y.domain([d3.min(data, function (d) { return d.ljPB; }), d3.max(data, function (d) { return d.ljPB; })]);

    // Add the valueline path with line color
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", lineColor)
        .style("stroke-width", 2)
        .style("fill", "none");

    // Add the X Axis with adjusted dimensions and axis color
    svg.append("g")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add the Y Axis with adjusted dimensions and axis color
    svg.append("g")
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("fill", axisColor);

    // Add a title
    svg.append("text")
        .attr("transform", "translate(" + ((width - margin.left - margin.right) / 2) + " ," + (height - margin.top) + ")")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - ((height - margin.top - margin.bottom) / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", axisColor)
        .text("LJ PB");

    // Add a title with axis color
    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", axisColor)
        .text(playerName + "'s Longjump PB Progression");        
}
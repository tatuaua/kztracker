"use strict";

window.onload = showUserStats();

function checkEnter(event) {
    if (event.key === "Enter") {
        loadStatsPage();
    }
}

function loadStatsPage() {
    var userInput = document.getElementById('steamIdField').value;
    window.location.href = '/' + userInput;
}

function showUserStats() {
    var playerName = getUserName(steamid);

    // Call getUserStats and wait for the promise to resolve
    getUserStats(steamid)
        .then(data => {
            if (data && data.length > 0) {
                renderPointsLine(data, playerName);
                renderPointsAvgLine(data, playerName);
            } else {
                console.error("Empty or invalid data received");
            }
        })
        .catch(error => {
            console.error("Error fetching user stats:", error.message);
        });
}

function getUserName(steamid){
    //Get username from steam API
    return "PlayerName";
}

//from borbkz kz.gl
function isValidSteamId32(steamID) {
    return /^STEAM_[0-5]:[01]:\d+$/.test(steamID);
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
        d.timeStamp = parseTime(d.timeStamp);
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
        .x(function (d) { return x(d.timeStamp); })
        .y(function (d) { return y(d.proPoints); })
        .curve(d3.curveMonotoneX);

    var tpLine = d3.line()
        .x(function (d) { return x(d.timeStamp); })
        .y(function (d) { return y(d.tpPoints); })
        .curve(d3.curveMonotoneX);

    var totalLine = d3.line()
        .x(function (d) { return x(d.timeStamp); })
        .y(function (d) { return y(d.proPoints + d.tpPoints); })
        .curve(d3.curveMonotoneX);

    // Append an SVG object to the container with adjusted dimensions
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.timeStamp; }));
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
        d.timeStamp = new Date(d.timeStamp);
    });

    // Set the ranges
    var x = d3.scaleTime().range([0, width - margin.left - margin.right]);
    var y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

    // Define the line
    var valueline = d3.line()
        .x(function (d) { return x(d.timeStamp); })
        .y(function (d) { return y(d.proPoints / d.proCompletions); })
        .curve(d3.curveMonotoneX);

    // Append an SVG object to the container with adjusted dimensions
    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function (d) { return d.timeStamp; }));
    y.domain([0, d3.max(data, function (d) { return d.proPoints / d.proCompletions; })]);

    // Add the valueline path with line color
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .style("stroke", lineColor)
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


async function getUserStats(steamid) {
    let clonedResponse = null;
    try {
        const response = await fetch("http://localhost:3000/stats/" + steamid);
        
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
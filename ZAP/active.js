// Function to initiate an Active Scan
function aScan(url) {
    // Define headers for the API request
    const headers = {
        'Accept': 'application/json',
        'X-ZAP-API-Key': 'u77djq6tu0evfofpdmlo6e3n7a'
    };
    
    // Construct parameters for the API request
    const params = new URLSearchParams({
        'url': url,
        'recurse': '',
        'inScopeOnly': '',
        'scanPolicyName': '',
        'method': '',
        'postData': '',
        'contextId': '' 
    });

    // Send a request to start the Active Scan
    fetch('http://127.0.0.1:8080/JSON/ascan/action/scan/?' + params, {
        method: 'GET',
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const scanID = data.scan; // Get the scan ID from the response
        console.log("This is the scan ID:",scanID);
        // Call the scanStatus function to start checking the scan status
        scanStatus(headers, scanID, url);
    })
    .catch(error => console.error('Error:', error)); // Log any errors during fetch
}

// Define a function to recursively check the scan status
function scanStatus(headers,scanID,url) {
    const userApplication = url; 

    fetch('http://127.0.0.1:8080/JSON/ascan/view/status/' + scanID, {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {

    const status = parseInt(data.status); // Parse the status value to ensure it's a number
    
    const resultsContainer = document.getElementById('scan');
    const msg = document.getElementById('stopmsg');

    //progress bar
    resultsContainer.innerHTML = `
        <link href="./style.css" rel="stylesheet">
        <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Your Scan has started</p><b><br>
        <div class="progress-bar-container">
        <div id="progress-bar"></div><br>
        <div class="pauseStop">
        <input type="button" value="Stop" id = "btnStop">
        </div>
        </div>
    `;

    const stopButton = document.getElementById('btnStop');

    //if stop button is pressed
    stopButton.addEventListener('click', () => {
        console.log("Stop button clicked"); // Log button click event
        msg.innerHTML = `
        <link href="./style.css" rel="stylesheet">
        <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Please note: These are partial scan results since the scan was prematurely stopped</p><b><br>
    `;
        stop();
    });

    const progressBar = document.getElementById('progress-bar');
    function updateProgress(status) {
        progressBar.style.width = `${status}%`;
        progressBar.textContent = `${status}%`;

        // Check if the scan is completed
        if (status === 100) {
            resultsContainer.innerHTML = `
            <link href="./style.css" rel="stylesheet">
            <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Scan Complete</p><b>
            <input type="button" value="Generate Report" id = "reportButton">
            <button id="view">View More</button><br>
            `;

            const reportButton = document.getElementById('reportButton');

            //if report button is pressed
            reportButton.addEventListener('click', () => {
                console.log("GetReport button clicked"); // Log button click event
                report(url);
            });

            // Construct parameters for the API request
            const params = new URLSearchParams({
                'url': url, // Target URL
                'start': '', // Optional
                'count': '', // Optional
                'riskId': '', // Optional
                'contextName': '' // Optional
            });
            
            // Send a request to start the Traditional Spider scan
            fetch('http://127.0.0.1:8080/JSON/alert/view/alerts/' + params, {
                method: 'GET',
                headers: headers
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response as JSON
            })
            .then(data => {
                const resultsContainer = document.getElementById('alertsResults');
                const viewMore = document.getElementById('viewMore')
                
                //matching domains
                const domainPattern = /^https?:\/\/([^/]+)/;
                const domainMatch = userApplication.match(domainPattern);
                const domain = domainMatch ? domainMatch[1] : null;
        
                // Access the "alerts" array
                const alerts = data.alerts;

                // Initialize a counter to track the number of displayed alerts
                let displayedCount = 0;
                
                // Loop through each alert object in the "alerts" array
                alerts.forEach(alert => {
                    // Access the desired properties of each alert object
                    const description = alert.description;
                    const url = alert.url;
                    const tags = alert.tags;
                    const solution = alert.solution;
                    const alertType = alert.alert;
                    const name = alert.name;
                    const risk = alert.risk;
                
                    // Check if risk is high or medium
                    console.log("view more button clicked"); // Log button click event
                    if ((risk === 'High' || risk === 'Medium') && url.includes(domain)) {
                        // Construct HTML to display specific components of each alert
                        const alertHTML = `
                        <div style="font-family: 'Courier New', Courier, monospace; font-size:small;">
                            <p><b>Name:</b> ${name}</p>
                            <p><b>Risk:</b> ${risk}</p>
                            <p><b>Description:</b> ${description}</p>
                            <p><b>URL:</b> ${url}</p>
                            <p><b>Solution:</b> ${solution}</p>
                            <p><b>More Info @:</b> ${JSON.stringify(tags)}</p><br>
                        </div><br>                        
                        `;
                        // Insert the first two alerts into the container
                        if (displayedCount < 2) {
                            viewMore.insertAdjacentHTML('beforeend', alertHTML);
                            displayedCount++;
                        }
                    };
                
                    const viewbtn = document.getElementById('view');
                    viewbtn.addEventListener('click', () => {
                        console.log("view more button clicked"); // Log button click event
                        if (url.includes(domain)) {
                            // Construct HTML to display specific components of each alert
                            const alertHTML = `
                            <div style="font-family: 'Courier New', Courier, monospace; font-size:small;">
                                <p><b>Name:</b> ${name}</p>
                                <p><b>Risk:</b> ${risk}</p>
                                <p><b>Description:</b> ${description}</p>
                                <p><b>URL:</b> ${url}</p>
                                <p><b>Solution:</b> ${solution}</p>
                                <p><b>More Info @:</b> ${JSON.stringify(tags)}</p><br>
                            </div><br>                        
                            `;
                            viewMore.insertAdjacentHTML('beforeend', alertHTML);
                        };
                    })
                });
            })
            .catch(error => console.error('Error:', error)); // Log any errors during fetch

        } else {
            // If scan is not completed, call scanStatus again
            setTimeout(() => {
                scanStatus(headers,scanID,url);
            }, 1000); // Fetch status again after 1 second
        }
    }
    // Update progress bar based on the latest status
    updateProgress(status);
})
.catch(error => console.error('Error:', error)); // Log any errors during fetch
}

// Dynamically add Chart.js script
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js';
document.head.appendChild(script);

//
//REPORT FUNCTION
//  
function report(url){
    //use alerts summary to make doughnut
    const headers = {
        'Accept': 'application/json',
        'X-ZAP-API-Key': 'u77djq6tu0evfofpdmlo6e3n7a'
    };
    
    // Construct parameters for the API request
    const params = new URLSearchParams({
        'url': url,
    });

    // Send a request to start the Active Scan
    fetch('http://127.0.0.1:8080/JSON/alert/view/alertsSummary/' + params, {
        method: 'GET',
        headers: headers
    })

    .then(response => response.json()) // Parse the response as JSON
    .then(data => {

    // Extract the counts from the alertsSummary object
    const highCount = data.alertsSummary.High;
    const lowCount = data.alertsSummary.Low;
    const mediumCount = data.alertsSummary.Medium;
    const informationalCount = data.alertsSummary.Informational;

    console.log(highCount,lowCount,mediumCount,informationalCount)

    // Data for doughnut chart
    const alertsData = {
        labels: ['High', 'Medium', 'Low', 'Informational'],
        datasets: [{
        data: [highCount, lowCount, mediumCount, informationalCount],
        backgroundColor: ['#FF0000', '#FFA500', '#32CD32', '#00BFFF'],
        borderWidth: 1
        }]
    };

    // Doughnut chart configuration
    const chartConfig = {
        type: 'doughnut',
        data: alertsData,
        options: {
            title: {
              display: true,
              text: "WebGuardian Application Scan Report: Alerts Summary"
            }
        }
    };

    // Get the canvas element
    const alertsChartCanvas = document.getElementById('alertsChart').getContext('2d');

    // Create the doughnut chart
    const myDoughnutChart = new Chart(alertsChartCanvas, chartConfig);

    })
    
    //use alerts by risk. show in report 
}

// Function to initiate an Active Scan
function stop() {
    // Define headers for the API request
    const headers = {
        'Accept': 'application/json',
        'X-ZAP-API-Key': 'u77djq6tu0evfofpdmlo6e3n7a'
    };
    
    // Send a request to start the Active Scan
    fetch('http://127.0.0.1:8080/JSON/ascan/action/stopAllScans/', {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        console.log(data); // Handle the response data
    })
}



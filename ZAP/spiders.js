//Gosego Otsweleng 03/05/2024
//The traditional Spider is a standard web crawler, it make HTTP(S) requests 
//and then analyses the responses for links.
//Test url: https://demo.owasp-juice.shop/runtime.js

// Get the button element with id "btn"
const setButton = document.getElementById("btn");
// Add an event listener to the button
if (setButton) {
    setButton.addEventListener('click', async () => { // Add async keyword here
        console.log("Button clicked"); // Log button click event

        // Get the URL input value and checkbox states
        const urlInput = document.getElementById('urlInput').value;
        const traditionalSpiderCheckbox = document.getElementById("spider1");

        // Check if the Traditional Spider checkbox is checked
        if (traditionalSpiderCheckbox.checked) {
            // Await the result of checkUrlExists
            const urlExists = await checkUrlExists(urlInput);
            if (urlExists) {
                console.log(urlInput); // Log the URL input value
                console.log("Starting traditional spider"); // Log the start of Traditional Spider
                spiderWithTraditionalSpider(urlInput); // Call function to start Traditional Spider
            } else {
                const resultsContainer = document.getElementById('scan');
                resultsContainer.innerHTML = `
                <link href="./style.css" rel="stylesheet">
                <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Your URL is unresponsive, please make sure the URL is valid</p><b><br>
                `;
            }
        }
    });
}

//function to check whether URL exists
async function checkUrlExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
        return response.status === 200;
    } catch (error) {
        console.error('Error checking URL:', error);
        return false;
    }
}

// Function to start Traditional Spider
function spiderWithTraditionalSpider(url) {
    // Define headers for the API request
    const headers = {
        'Accept': 'application/json',
        'X-ZAP-API-Key': 'u77djq6tu0evfofpdmlo6e3n7a'
    };

    // Construct parameters for the API request
    const params = new URLSearchParams({
        'url': url, // Target URL
        'maxChildren': '', // Optional
        'recurse': '', // Optional
        'contextName': '', // Optional
        'subtreeOnly': '' // Optional
    });

// Send a request to start the Traditional Spider scan
fetch('http://127.0.0.1:8080/JSON/spider/action/scan/?' + params, {
    method: 'GET',
    headers: headers
})
.then(response => response.json()) // Parse the response as JSON
.then(data => {

    const resultsContainer = document.getElementById('container');

    const result = data.scan; // Get the scan ID from the response
    console.log(result);
    
    // Function to check the status of the spider scan
    function status(result) {
        // Fetch the status of the spider scan
        fetch('http://127.0.0.1:8080/JSON/spider/view/status/?' + result, {
            method: 'GET',
            headers: headers
        })
        .then(response => response.json()) // Parse the response as JSON
        .then(data => {

            const scanStatus = data.status;
            console.log(scanStatus);

            resultsContainer.innerHTML = `
            <div>
                <b>

                    <p style="font-family: 'Courier New', Courier, monospace; font-size: medium; color: #424e8d;">
                        Traditional Spider Running
                    </p>
                </b>
                    <p style="font-family: 'Courier New', Courier, monospace; font-size: small; color: #424e8d;">
                        Traditional Spider currently at: ${scanStatus}%
                    </p>
            </div>`; 
        
            if (scanStatus == 100) {
                // Fetch the spidering results
                fetch('http://127.0.0.1:8080/JSON/spider/view/results/' + result, {
                    method: 'GET',
                    headers: headers
                })
                .then(response => response.json()) // Parse the response as JSON
                .then(data => {
                    // Display the spidering results
                    const results = data.results
                    resultsContainer.innerHTML = "The following are the links found while crawling your application (Traditional Spider):<br><br>" 

                    userApplication = url;

                    //matching domains
                    const domainPattern = /^https?:\/\/([^/]+)/;
                    const domainMatch = userApplication.match(domainPattern);
                    const domain = domainMatch ? domainMatch[1] : null;

                    // Iterate over the results array and display each item line by line
                    results.forEach((result, index) => {
                        if (url.includes(domain)) {
                            resultsContainer.innerHTML += `${index + 1}. ${result}<br>`;
                        }
                        else{
                            resultsContainer.innerHTML = `
                            <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Error: 400 Bad Request</p>
                            <p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Please make sure your URL is correct</p>
                            `; 
                        }
                    });
                    
                    const ajaxSpiderCheckbox = document.getElementById("spider2");
                    const traditionalSpiderCheckbox = document.getElementById("spider1");
                    if (!ajaxSpiderCheckbox.checked && traditionalSpiderCheckbox.checked) {
                        aScan(url); // Call the aScan function with the URL input
                    }
                })
                .catch(error => console.error('Error:', error)); // Log any errors
            } else {
                // Retry after a delay if the scan is not yet complete
                setTimeout(() => status(result), 1000); // Retry after a second
            }
        })
        .catch(error => console.error('Error:', error)); // Log any errors
    }
    // Start checking the status immediately
    status(result);
})    
.catch(error => console.error('Error:', error)); // Log any errors
}

//Gosego Otsweleng 03/05/2024
// Add an event listener to the button
if (setButton) {
    setButton.addEventListener('click', async () => { // Make the function async
        console.log("Button clicked"); // Log button click event

        // Get the URL input value and checkbox states
        const urlInput = document.getElementById('urlInput').value;
        const ajaxSpiderCheckbox = document.getElementById("spider2");

        // Check if the Ajax Spider checkbox is checked
        if (ajaxSpiderCheckbox.checked) {
            // Await the result of checkUrlExists
            const urlExists = await checkUrlExists(urlInput);
            if (urlExists) {
                console.log(urlInput); // Log the URL input value
                console.log("Starting Ajax spider"); // Log the start of Ajax Spider
                ajaxSpider(urlInput); // Call function to start Ajax Spider
            } else {
                const resultsContainer = document.getElementById('scan');
                resultsContainer.innerHTML = `
                <link href="./style.css" rel="stylesheet">
                <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Your URL is unresponsive, please make sure the URL it is valid</p><b><br>
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

// Function to start Ajax Spider
function ajaxSpider(url) {
    // Define headers for the API request
    const headers = {
        'Accept': 'application/json',
        'X-ZAP-API-Key': 'u77djq6tu0evfofpdmlo6e3n7a'
    };

    // Construct parameters for the API request
    const params = new URLSearchParams({
        'url': url, // Target URL
        'inScope': '', // Optional
        'contextName': '', // Optional
        'subtreeOnly': '' // Optional
    });

    const resultsContainer = document.getElementById('container1');

    // Send a request to start the Ajax Spider scan
    fetch('http://127.0.0.1:8080/JSON/ajaxSpider/action/scan/?' + params, {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {
        const result = data.scan; // Get the scan ID from the response

        // Function to recursively check and update spidering status
        function startSpidering() {
            fetch('http://127.0.0.1:8080/JSON/ajaxSpider/view/status/', {
                method: 'GET',
                headers: headers
            })
            .then(response => response.json())
            .then(data => {
                if (data.status !== "stopped") {
                    // Ajax Spider is running, update UI
                    resultsContainer.innerHTML = `
                        <link href="./style.css" rel="stylesheet">
                        <div>
                            <b>
                                <p style="font-family: 'Courier New', Courier, monospace; font-size: medium; color: #424e8d;">
                                    Ajax Spider Running
                                </p>
                            </b>
                        </div>
                        <div class="loader"></div>`
                        ;
                    // Check status again after a delay
                    setTimeout(startSpidering, 1000); // Check status every 1 second
                } else {
                    // Spidering finished, fetch and display full results
                    fetch('http://127.0.0.1:8080/JSON/ajaxSpider/view/fullResults/' + result, {
                        method: 'GET',
                        headers: headers
                    })
                    .then(response => response.json())
                    .then(data => {
                     
                        const inScopeUrls = data.fullResults.inScope.map(item => item.url);

                        // Clear existing content of the results container
                        resultsContainer.innerHTML = "The following are the links found while crawling your application (Ajax Spider):<br><br>inScope Url's:<br><br>";

                        userApplication = url;

                        //matching domains
                        const domainPattern = /^https?:\/\/([^/]+)/;
                        const domainMatch = userApplication.match(domainPattern);
                        const domain = domainMatch ? domainMatch[1] : null;
                    
                        // Appending each URL to the results container
                        if (url.includes(domain)) {
                            inScopeUrls.forEach(url => {
                                resultsContainer.innerHTML += url + "<br>";
                            });
                        }
                        else{
                            resultsContainer.innerHTML = `
                            <b><p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Error: 400 Bad Request</p>
                            <p style="font-family: 'Courier New', Courier, monospace;font-size:medium;color:#424e8d;">Please make sure your URL is correct</p>
                            `; 
                        }

                        const ajaxSpiderCheckbox = document.getElementById("spider2");
                        const traditionalSpiderCheckbox = document.getElementById("spider1");

                        if (ajaxSpiderCheckbox.checked && (traditionalSpiderCheckbox.checked || !traditionalSpiderCheckbox.checked)) {
                            aScan(url); // Call the aScan function with the URL input
                        }
                    })
                    .catch(error => console.error('Error fetching full results:', error));
                }
            })
            .catch(error => console.error('Error checking spider status:', error));
        }
        // Start recursively checking spidering status
        startSpidering();
    })
    .catch(error => console.error('Error starting Ajax Spider:', error));
}

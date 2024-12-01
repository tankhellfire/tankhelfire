async function downloadPageResources(baseUrl = null) {
    // Load JSZip dynamically
    if (!window.JSZip) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
    }

    const zip = new JSZip();

    if (baseUrl) {
        // Fetch resources from the specified URL
        try {
            const response = await fetch(baseUrl);
            if (response.ok) {
                let htmlContent = await response.text();
                const fileName = getFileNameFromURL(baseUrl) || 'index.html';

                // Parse and update HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const base = new URL(baseUrl);
                const resourceUrls = new Map();

                // Extract and update resource URLs
                updateResourceUrls(doc, base, resourceUrls);

                // Serialize updated HTML
                htmlContent = new XMLSerializer().serializeToString(doc);
                zip.file(fileName, htmlContent);
                console.log(`Added: ${fileName}`);

                // Fetch and add resources
                for (const [resourceUrl, simplifiedName] of resourceUrls) {
                    try {
                        const resourceResponse = await fetch(resourceUrl);
                        if (resourceResponse.ok) {
                            const content = await resourceResponse.blob();
                            zip.file(simplifiedName, content);
                            console.log(`Added: ${simplifiedName}`);
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch resource: ${resourceUrl}`, error);
                    }
                }
            } else {
                console.warn(`Failed to fetch the base URL: ${baseUrl}`);
            }
        } catch (error) {
            console.error(`Error fetching the base URL: ${baseUrl}`, error);
        }
    } else {
        // Use performance.getEntriesByType('resource') for the current page
        const resources = performance.getEntriesByType('resource');

        // Add the current page's HTML
        const htmlContent = document.documentElement.outerHTML;
        zip.file('index.html', htmlContent);
        console.log('Added: index.html');

        // Fetch resources from performance entries
        for (const resource of resources) {
            try {
                const response = await fetch(resource.name);
                if (response.ok) {
                    const content = await response.blob();
                    const fileName = getFileNameFromURL(resource.name);
                    zip.file(fileName, content);
                    console.log(`Added: ${fileName}`);
                }
            } catch (error) {
                console.warn(`Failed to fetch resource: ${resource.name}`, error);
            }
        }
    }

    // Generate the ZIP file
    zip.generateAsync({ type: "blob" }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'resources.zip';
        a.click();
        console.log('Download started!');
    });

    // Helper function to extract a file name from a URL
    function getFileNameFromURL(url) {
        try {
            const parsedURL = new URL(url);
            let fileName = parsedURL.pathname.split('/').pop();
            if (!fileName) {
                fileName = 'index.html'; // Default to index.html if no file name is present
            }
            return fileName;
        } catch {
            return 'index.html'; // Default fallback
        }
    }

    // Helper function to update URLs and simplify paths
    function updateResourceUrls(doc, base, resourceUrls) {
        const simplifyPath = url => {
            const parsedURL = new URL(url, base);
            return parsedURL.pathname.split('/').pop() || 'index.html';
        };

        // Update <script> tags
        doc.querySelectorAll('script[src]').forEach(script => {
            const originalUrl = script.getAttribute('src');
            const fullUrl = new URL(originalUrl, base).href;
            const simplifiedName = simplifyPath(fullUrl);
            resourceUrls.set(fullUrl, simplifiedName);
            script.setAttribute('src', simplifiedName);
        });

        // Update <link> tags with rel="stylesheet"
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const originalUrl = link.getAttribute('href');
            const fullUrl = new URL(originalUrl, base).href;
            const simplifiedName = simplifyPath(fullUrl);
            resourceUrls.set(fullUrl, simplifiedName);
            link.setAttribute('href', simplifiedName);
        });

        // Update <img> tags
        doc.querySelectorAll('img[src]').forEach(img => {
            const originalUrl = img.getAttribute('src');
            const fullUrl = new URL(originalUrl, base).href;
            const simplifiedName = simplifyPath(fullUrl);
            resourceUrls.set(fullUrl, simplifiedName);
            img.setAttribute('src', simplifiedName);
        });
    }
}
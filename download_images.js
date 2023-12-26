const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const brokenImagesFile = 'all_unique_images.json';
const outputFolder = 'broken_images';
const mappingFile = 'org_url_vs_new_img_name.json';

failureURLs = [];

// Read URLs from broken_images.json
fs.readFile(brokenImagesFile, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading broken_images.json:', err);
    return;
  }

  let success  = 0
  let failure = 0 

  try {
    let urls = JSON.parse(data);

    // urls = urls.slice(50, 100)

    // Create folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    const mapping = {};
    let imagesDownloaded = 0;

    // Process each URL concurrently
    await Promise.all(urls.map(async (originalUrl) => {
      try {

        originalUrl2 = originalUrl

        const response = await axios.get(originalUrl, {
          responseType: 'arraybuffer',
          headers: {
            'Referer': 'http://your-referer-url.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
          }
        });

        // Create a hash of the URL and trim to 15 characters
        const hash = crypto.createHash('md5').update(originalUrl).digest('hex').slice(0, 15);

        // Determine file extension based on the content type
        const extension = originalUrl.split('.').pop() || 'jpg';

        // Create the new image name
        const newImageName = `${hash}.${extension}`;

        // Save the image in the broken_images folder
        const imagePath = path.join(outputFolder, newImageName);
        fs.writeFileSync(imagePath, response.data);

        // Store the mapping between original URL and new image name with extension
        mapping[originalUrl] = 'https://cdn.shopify.com/s/files/1/0676/4000/0753/files/'+newImageName;

        success++;
        // console.log(`Downloaded ${imagesDownloaded} images.`);
      } catch (error) {
        failure++
        failureURLs.push(originalUrl)
        console.error(`Error processing URL ${originalUrl}:`, error.message);
      }
    }));

    // Save the mapping to org_url_vs_new_img_name.json
    fs.writeFile(mappingFile, JSON.stringify(mapping, null, 2), (err) => {
      if (err) {
        console.error('Error writing to org_url_vs_new_img_name.json:', err);
      } else {
        console.log('Mapping saved to org_url_vs_new_img_name.json');
        console.log('success', success, 'failure', failure)
        fs.writeFile('download_errors.json', JSON.stringify(failureURLs, null, 2), (err) => {})
      }
    });
  } catch (error) {
    console.error('Error parsing JSON from broken_images.json:', error);
  }
});
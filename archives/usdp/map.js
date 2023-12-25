const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const brokenImagesFile = 'broken_images.json';
const outputFolder = 'broken_images';
const mappingFile = 'org_url_vs_new_img_name.json';

// Read URLs from broken_images.json
fs.readFile(brokenImagesFile, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading broken_images.json:', err);
    return;
  }

  try {
    const urls = JSON.parse(data);

    // Create folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    const mapping = {};

    // Process each URL
    for (const url of urls) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Create a hash of the URL and trim to 15 characters
        const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 15);

        // Determine file extension based on the content type
        const extension = response.headers['content-type'].split('/')[1] || 'jpg';

        // Create the new image name
        const newImageName = `${hash}.${extension}`;

        // Save the image in the broken_images folder
        const imagePath = path.join(outputFolder, newImageName);
        fs.writeFileSync(imagePath, response.data);

        // Store the mapping between original URL and new image name with extension
        mapping[url] = newImageName;
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error.message);
      }
    }

    // Save the mapping to org_url_vs_new_img_name.json
    fs.writeFile(mappingFile, JSON.stringify(mapping, null, 2), (err) => {
      if (err) {
        console.error('Error writing to org_url_vs_new_img_name.json:', err);
      } else {
        console.log('Mapping saved to org_url_vs_new_img_name.json');
      }
    });
  } catch (error) {
    console.error('Error parsing JSON from broken_images.json:', error);
  }
});

const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const brokenImagesFile = 'all_unique_images.json';
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
    let imagesDownloaded = 0;

    // Process each URL concurrently
    await Promise.all(urls.map(async (originalUrl) => {
      try {

        originalUrl2 = originalUrl

        let url = originalUrl.replace(/\s/g, '').replace(/^(\.\.)/, ''); // remove spaces and ..

        if (!(url.includes('http'))) {
          url = 'http://usdieselparts.com' + url; // append website name to those that don't have
        }

        console.log('originalurl2', originalUrl2)

        const response = await axios.get(url, { responseType: 'arraybuffer' });

        // Create a hash of the URL and trim to 15 characters
        const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 15);

        // Determine file extension based on the content type
        const extension = url.split('.').pop() || 'jpg';

        // Create the new image name
        const newImageName = `${hash}.${extension}`;

        // Save the image in the broken_images folder
        const imagePath = path.join(outputFolder, newImageName);
        fs.writeFileSync(imagePath, response.data);

        // Store the mapping between original URL and new image name with extension
        mapping[originalUrl] = newImageName;

        imagesDownloaded++;
        // console.log(`Downloaded ${imagesDownloaded} images.`);
      } catch (error) {
        console.error(`Error processing URL ${originalUrl}:`, error.message);
      }
    }));

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

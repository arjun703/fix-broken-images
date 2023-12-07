const fs = require('fs');
const cheerio = require('cheerio');

let all_images = [];

fs.readFile('products.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const products = JSON.parse(data);
    const finalOutput = products.reduce((arr, { id, custom_url, custom_fields }) => {
      const shortDescriptions = (custom_fields || [])
        .filter(({ name }) => name === 'short_description')
        .map(({ value }) => value)
        .join(' ');

        url = 'https://gomers-inc-missoula.mybigcommerce.com'+custom_url.url

      if (shortDescriptions.includes('img')) {

        const images = extractImageSrcs(shortDescriptions);
      
        all_images = all_images.concat(images);
        
        arr.push({ id, url, short_description: shortDescriptions, images });
      
      }

      return arr;

    }, []);

    // Deduplicate images
    // all_images  = all_images.map(img => img.replace(/\s/g, '').replace(/^(\.\.)/, ''));


    let unique_images = [...new Set(all_images)];

    unique_images = unique_images.filter(img => !(img.includes('cdn') || img.includes('stencil')))

    console.log('total products containing images', finalOutput.length)

    console.log('Total number of images:', all_images.length);
    
    console.log('Number of unique images:', unique_images.length);
    

    fs.writeFileSync('all_unique_images.json', JSON.stringify(unique_images, null, 2));

    fs.writeFile('final_output.json', JSON.stringify(finalOutput, null, 2), (err) => {
      if (err) {
        console.error('Error writing to final_output.json:', err);
      } else {
        console.log('Final output saved to final_output.json');
      }
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});

function extractImageSrcs(html) {
  const $ = cheerio.load(html);
  console.log("hello")
  const imageSources = [];
  $('img').each((index, element) => {
    const src = $(element).attr('src');
    if (src) {
      imageSources.push(src);
    }
  });

  return imageSources;
}

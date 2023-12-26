const fs = require('fs');
const cheerio = require('cheerio');

let all_images = [];

fs.readFile('posts.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const imageMap = fs.readFileSync('yourFileName.txt', 'utf-8');
  
  try {

    const products = JSON.parse(data);
    
    products.forEach(product => {
      
        let images = extractImageSrcs(product.Content);
        
        if(product["Image URL"] != "") 
          images  = images.concat(product["Image URL"].split('|'))

        all_images = all_images.concat(images);      
      
    });

    // Deduplicate images
    // all_images  = all_images.map(img => img.replace(/\s/g, '').replace(/^(\.\.)/, ''));

    let unique_images = [...new Set(all_images)];

    fs.writeFileSync('all_unique_images.json', JSON.stringify(unique_images, null, 2));


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

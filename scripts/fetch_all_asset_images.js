const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const imagesMap = {
  door: {
    good: 'https://images.pexels.com/photos/279614/pexels-photo-279614.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/101808/pexels-photo-101808.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/279614/pexels-photo-279614.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  win_sliding: {
    good: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  win_half: {
    good: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  tab_4s: {
    good: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  tab_2s: {
    good: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  chair: {
    good: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  comp: {
    good: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/38568/apple-imac-ipad-workplace-38568.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  router: {
    good: 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  floor: {
    good: 'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  ceiling: {
    good: 'https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  ac: {
    good: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/4099350/pexels-photo-4099350.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  fan: {
    good: 'https://images.pexels.com/photos/5405186/pexels-photo-5405186.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/5405186/pexels-photo-5405186.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/5405186/pexels-photo-5405186.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  switch_main: {
    good: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  printer: {
    good: 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800',
    acceptable: 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800',
    defective: 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };

    const request = client.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const baseDir = path.join(__dirname, '..', 'public', 'images');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (const [cat, urls] of Object.entries(imagesMap)) {
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }

    for (const [type, url] of Object.entries(urls)) {
      const dest = path.join(catDir, `${type}.jpg`);
      console.log(`Downloading ${cat}/${type}.jpg...`);
      try {
        await download(url, dest);
        console.log(`Saved: ${cat}/${type}.jpg`);
      } catch (err) {
        console.error(`Error downloading ${cat}/${type}:`, err.message);
      }
    }
  }
  console.log('All asset reference images stored successfully!');
}

main();

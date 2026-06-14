import ImageKit from 'imagekit';
import config from './env.js';

let imagekit = null;

if (config.imagekit.publicKey && config.imagekit.privateKey && config.imagekit.urlEndpoint) {
  imagekit = new ImageKit({
    publicKey: config.imagekit.publicKey,
    privateKey: config.imagekit.privateKey,
    urlEndpoint: config.imagekit.urlEndpoint,
  });
  console.log('ImageKit initialized');
} else {
  console.warn('ImageKit credentials not found. Image upload will be disabled.');
}

export default imagekit;

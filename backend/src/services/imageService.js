import imagekit from '../config/imagekit.js';

class ImageService {
  // Upload a single image to ImageKit
  async uploadImage(fileBuffer, fileName, folder = 'listings') {
    if (!imagekit) {
      // Fallback: return a placeholder when ImageKit is not configured
      console.warn('ImageKit not configured. Using placeholder image.');
      return {
        url: `https://placehold.co/800x600/E67E22/white?text=${encodeURIComponent(fileName)}`,
        fileId: `placeholder_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      };
    }

    try {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: `/localrent/${folder}`,
        useUniqueFileName: true,
      });

      return {
        url: result.url,
        fileId: result.fileId,
      };
    } catch (error) {
      console.error('ImageKit upload error:', error.message);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, folder = 'listings') {
    const uploadPromises = files.map((file) =>
      this.uploadImage(file.buffer, file.originalname, folder)
    );

    return Promise.all(uploadPromises);
  }

  // Delete an image from ImageKit
  async deleteImage(fileId) {
    if (!imagekit || fileId.startsWith('placeholder_')) {
      return; // Skip deletion for placeholders
    }

    try {
      await imagekit.deleteFile(fileId);
    } catch (error) {
      console.error('ImageKit delete error:', error.message);
      // Don't throw - image deletion failure shouldn't break the flow
    }
  }

  // Delete multiple images
  async deleteMultipleImages(images) {
    const deletePromises = images.map((img) => this.deleteImage(img.fileId));
    await Promise.allSettled(deletePromises);
  }
}

export default new ImageService();

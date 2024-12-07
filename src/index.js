const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

/**
 * @type {string}
 */
const imageSetName = packageJson.name.replace(/^@.*\//, ''); // Removes scope if present
const imageSetDir = path.join(__dirname, '..', 'public', 'images');
const metadataPath = path.join(__dirname, '..', 'src', 'image-metadata.json');
const tagConfigPath = path.join(__dirname, '..', 'src', 'tag-config.json');

/**
 * @typedef {Object} ImageMetadata
 * @property {string} filename - The name of the image file
 * @property {string} label - User-defined label for the image
 * @property {string[]} tags - Array of tag names associated with the image
 */

/**
 * @typedef {Object} Tag
 * @property {string} name - The name of the tag (used as identifier)
 * @property {string} title - The display title of the tag
 * @property {string} description - User-defined description of the tag
 */

/**
 * @typedef {Object} TagConfig
 * @property {Tag[]} subject - Tags related to the subject of the image
 * @property {Tag[]} version - Tags related to the version of the image set
 * @property {Tag[]} general - General tags and newly added tags
 */

/**
 * Recursively gets a list of image files in the given directory.
 * @param {string} [dir] - The directory to search (defaults to imageSetDir).
 * @returns {string[]} An array of relative file paths.
 */
function getImageList(dir = imageSetDir) {
  /** @type {string[]} */
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getImageList(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.webp')) {
      results.push(path.relative(imageSetDir, fullPath));
    }
  }

  return results;
}

/**
 * Gets the name of the image set.
 * @returns {string} The name of the image set.
 */
function getImageSetName() {
  return imageSetName;
}

/**
 * Gets the metadata for all images.
 * @returns {ImageMetadata[]} An array of image metadata objects.
 */
function getImageMetadata() {
  try {
    const data = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(data);
    const allTags = getAllTags();

    return metadata.map(item => ({
      ...item,
      tags: item.tags.map(tagName => {
        const fullTag = allTags.find(t => t.name === tagName);
        return fullTag || { name: tagName, title: tagName, description: '' };
      })
    }));
  } catch (error) {
    console.error('Error reading metadata:', error);
    return [];
  }
}

/**
 * Gets the tag configuration.
 * @returns {TagConfig} The tag configuration object.
 */
function getTagConfig() {
  try {
    const data = fs.readFileSync(tagConfigPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tag config:', error);
    return { subject: [], version: [], general: [] };
  }
}

/**
 * Gets all available tags across all categories.
 * @returns {Tag[]} An array of all tags.
 */
function getAllTags() {
  const tagConfig = getTagConfig();
  return [
    ...tagConfig.subject,
    ...tagConfig.version,
    ...tagConfig.general
  ];
}

/**
 * Gets metadata for a specific image.
 * @param {string} imagePath - The relative path of the image.
 * @returns {ImageMetadata|undefined} The metadata for the specified image, or undefined if not found.
 */
function getImageMetadataByPath(imagePath) {
  const allMetadata = getImageMetadata();
  return allMetadata.find(img => img.filename === imagePath);
}

module.exports = {
  getImageList,
  getImageSetName,
  getImageMetadata,
  getTagConfig,
  getAllTags,
  getImageMetadataByPath,
};

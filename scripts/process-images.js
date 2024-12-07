const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { checkbox, input, select } = require('@inquirer/prompts');

const baseImageDir = path.join(__dirname, '..', 'public', 'images');
const metadataPath = path.join(__dirname, '..', 'src/image-metadata.json');
const tagConfigPath = path.join(__dirname, '..', 'src/tag-config.json');

/**
 * @typedef {Object} ImageMetadata
 * @property {string} filename - The name of the image file
 * @property {string} label - User-defined label for the image
 * @property {string[]} tags - Array of tag names associated with the image
 */

/** @type {ImageMetadata[]} */
let imageMetadata = [];

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

/** @type {TagConfig} */
let tagConfig = {
  subject: [],
  version: [],
  general: []
};

/**
 * Loads the image metadata from the JSON file or creates it if it doesn't exist
 * @returns {Promise<void>}
 */
async function loadMetadata() {
  try {
    const data = await fs.readFile(metadataPath, 'utf8');
    imageMetadata = JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Metadata file not found. Creating a new one.');
      imageMetadata = [];
      await saveMetadata();
    } else {
      console.error('Error loading metadata:', error);
    }
  }
}

/**
 * Saves the image metadata to the JSON file
 * @returns {Promise<void>}
 */
async function saveMetadata() {
  try {
    await fs.writeFile(metadataPath, JSON.stringify(imageMetadata, null, 2));
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

/**
 * Loads the tag configuration or creates it if it doesn't exist
 * @returns {Promise<void>}
 */
async function loadTagConfig() {
  try {
    const data = await fs.readFile(tagConfigPath, 'utf8');
    tagConfig = JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Tag config file not found. Creating a new one with default categories.');
      tagConfig = {
        subject: [
          { name: 'nature', title: 'Nature', description: 'Images of natural landscapes, flora, or fauna' },
          { name: 'tech', title: 'Technology', description: 'Images related to technological devices or concepts' },
          { name: 'people', title: 'People', description: 'Images featuring individuals or groups of people' }
        ],
        version: [
          { name: '1_0_0', title: 'Image set Version 1', description: 'Images from Version 1' },
          { name: '1_1_0', title: 'Image set Version 1.1', description: 'Images from Version 1.1' },
          { name: '2_0_0', title: 'Image set Version 2.0', description: 'Images from Version 2' }
        ],
        general: [
          { name: 'hq', title: 'High Quality', description: 'Images with exceptional clarity and detail' },
          { name: 'colorful', title: 'Colorful', description: 'Images with a vibrant color palette' },
          { name: 'monochrome', title: 'Black and White', description: 'Monochrome images' }
        ],
      };
      await saveTagConfig();
    } else {
      console.error('Error loading tag config:', error);
    }
  }
}

/**
 * Saves the tag configuration
 * @returns {Promise<void>}
 */
async function saveTagConfig() {
  try {
    await fs.writeFile(tagConfigPath, JSON.stringify(tagConfig, null, 2));
  } catch (error) {
    console.error('Error saving tag config:', error);
  }
}

/**
 * Gets all available tags
 * @returns {Tag[]} - Array of all tags
 */
function getAllTags() {
  return [
    ...tagConfig.subject,
    ...tagConfig.version,
    ...tagConfig.general
  ];
}

/**
 * Ensures that the input is an array of tag names
 * @param {string|string[]|undefined} input - The input to check
 * @returns {string[]} - An array of tag names
 */
function ensureTagArray(input) {
  if (Array.isArray(input)) {
    return input.filter(tag => typeof tag === 'string');
  }
  if (typeof input === 'string') {
    return [input];
  }
  return [];
}

/**
 * Updates metadata for a given image
 * @param {string} imagePath - The relative path of the image
 * @param {string[]} tags - The tag names to set for the image
 * @param {string} label - The label for the image
 */
function updateImageMetadata(imagePath, tags, label) {
  const index = imageMetadata.findIndex(img => img.filename === imagePath);
  const safeLabel = label || '';
  const safeTags = Array.isArray(tags) ? tags : [];

  if (index !== -1) {
    imageMetadata[index].tags = safeTags;
    imageMetadata[index].label = safeLabel;
  } else {
    imageMetadata.push({ filename: imagePath, tags: safeTags, label: safeLabel });
  }
}

/**
 * Prompts user to select tags using checkboxes
 * @param {string} imageName - Name of the image being tagged
 * @param {string[]} currentTags - Current tag names of the image
 * @returns {Promise<string[]>} - Array of selected tag names
 */
async function promptForTags(imageName, currentTags) {
  console.log(`Selecting tags for ${imageName}`);
  const allTags = getAllTags();
  const safeCurrentTags = ensureTagArray(currentTags);

  const choices = allTags.map(tag => ({
    name: `${tag.name} - ${tag.description}`,
    value: tag.name,
    checked: safeCurrentTags.includes(tag.name)
  }));

  console.log(`Preparing to show tag selection menu for ${imageName}`);
  const selectedTags = await checkbox({
    message: `Select tags for ${imageName}:`,
    choices: choices
  });

  console.log(`Tag selection completed for ${imageName}`);
  return selectedTags;
}

/**
 * Prompts user to add a new tag
 * @returns {Promise<Tag|null>} - Newly created tag or null if cancelled
 */
async function promptForNewTag() {
  console.log("Name is the unique identifier for the tag, while Title is the user-friendly name.")
  const name = await input({ message: 'Enter the name for the new tag (or press Enter to cancel):' });
  if (!name) return null;

  const title = await input({ message: 'Enter a title for the new tag (press Enter to use the name):', default: name });

  const description = await input({ message: 'Enter a description for the new tag:' });
  return { name, title, description };
}

/**
 * Recursively gets all image files from a directory
 * @param {string} dir - The directory to search
 * @returns {Promise<string[]>} - Array of relative paths to image files
 */
async function getImageFiles(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await getImageFiles(fullPath));
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.webp') {
      results.push(path.relative(baseImageDir, fullPath));
    }
  }

  return results;
}

/**
 * Compresses images in the given directory
 * @param {string} dir - The directory to process
 * @returns {Promise<void>}
 */
async function compressImages(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseImageDir, fullPath);

      if (entry.isDirectory()) {
        await compressImages(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const existingMetadata = imageMetadata.find(img => img.filename === relativePath);

        if (ext === '.webp') {
          if (!existingMetadata) {
            console.log(`Adding metadata for existing WebP file: ${relativePath}`);
            updateImageMetadata(relativePath, [], '');
          } else {
            console.log(`Skipping existing WebP file with metadata: ${relativePath}`);
          }
        } else if (['.jpg', '.jpeg', '.png'].includes(ext) && !existingMetadata) {
          const outputPath = path.join(dir, `${path.parse(entry.name).name}.webp`);
          const outputRelativePath = path.relative(baseImageDir, outputPath);

          console.log(`Compressing: ${relativePath}`);
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

          console.log(`Compressed and saved: ${outputRelativePath}`);

          // Remove the original file
          await fs.unlink(fullPath);

          // Add metadata for the new WebP file
          updateImageMetadata(outputRelativePath, [], '');
        } else {
          console.log(`Skipping: ${relativePath} (already processed or unsupported format)`);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error);
  }
}

/**
 * Main CLI function
 * @returns {Promise<void>}
 */
async function main() {
  await loadMetadata();
  await loadTagConfig();

  // Check if metadata needs to be migrated
  const needsMigration = imageMetadata.some(img => img.tags && img.tags.some(tag => typeof tag === 'object'));
  if (needsMigration) {
    console.log('Migrating metadata to new format...');
    imageMetadata = imageMetadata.map(img => ({
      ...img,
      tags: img.tags.map(tag => typeof tag === 'object' ? tag.name : tag)
    }));
    await saveMetadata();
    console.log('Metadata migration completed.');
  }

  if (process.argv.includes('--compress-only')) {
    console.log('Running in compression-only mode');
    await compressImages(baseImageDir);
    console.log('Image compression completed.');
    await saveMetadata();
    await saveTagConfig();
    return;
  }

  while (true) {
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: 'Compress Images', value: 'compress' },
        { name: 'Tag Images', value: 'tag' },
        { name: 'View Image Metadata', value: 'view' },
        { name: 'Manage Tags', value: 'manage' },
        { name: 'Exit', value: 'exit' }
      ]
    });

    if (action === 'exit') break;

    if (action === 'compress') {
      await compressImages(baseImageDir);
      console.log('Image compression completed.');
    }

    if (action === 'tag') {
      const images = await getImageFiles(baseImageDir);

      const selectedImages = await checkbox({
        message: 'Select images to tag:',
        choices: images.map(img => ({ name: img, value: img }))
      });

      for (const image of selectedImages) {
        const currentMetadata = imageMetadata.find(img => img.filename === image) || { tags: [], label: '' };

        console.log(`\nTagging image: ${image}`);

        const label = await input({
          message: 'Enter a label for the image (press Enter to keep current label):',
          default: currentMetadata.label
        });

        const newTags = await promptForTags(image, currentMetadata.tags);
        updateImageMetadata(image, newTags, label || currentMetadata.label);

        console.log(`Image ${image} tagged successfully.\n`);
      }
    }

    if (action === 'view') {
      const allTags = getAllTags();
      for (const image of imageMetadata) {
        console.log(`${image.filename}:`);
        console.log(`  Label: ${image.label}`);
        console.log(`  Tags: ${image.tags.join(', ')}`);
        for (const tagName of image.tags) {
          const fullTag = allTags.find(t => t.name === tagName);
          if (fullTag) {
            console.log(`    - ${fullTag.name}: ${fullTag.description}`);
          } else {
            console.log(`    - ${tagName}: Description not found`);
          }
        }
      }
      await input({ message: 'Press Enter to continue...' });
    }

    if (action === 'manage') {
      while (true) {
        const tagAction = await select({
          message: 'What would you like to do with tags?',
          choices: [
            { name: 'Add New Tag', value: 'add' },
            { name: 'View All Tags', value: 'view' },
            { name: 'Back to Main Menu', value: 'back' }
          ]
        });

        if (tagAction === 'back') break;

        if (tagAction === 'add') {
          const newTag = await promptForNewTag();
          if (newTag) {
            tagConfig.general.push(newTag);
            await saveTagConfig();
            console.log(`New tag "${newTag.name}" added successfully.`);
          }
        }

        if (tagAction === 'view') {
          const allTags = getAllTags();
          console.log('All available tags:');
          for (const tag of allTags) {
            console.log(`  - ${tag.name}: ${tag.description}`);
          }
          await input({ message: 'Press Enter to continue...' });
        }
      }
    }
  }

  await saveMetadata();
  await saveTagConfig();
  console.log('Session completed. Metadata and tag configuration saved.');
}

main().catch(console.error);

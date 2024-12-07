const { getImageList, getImageSetName, getImageMetadata, getTagConfig, getAllTags, getImageMetadataByPath } = require('./index');
const path = require('path');
const fs = require('fs');

describe('Image Set Library', () => {
  test('getImageSetName returns a non-empty string', () => {
    const name = getImageSetName();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  test('getImageList returns an array of valid image paths', () => {
    const images = getImageList();
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBeGreaterThan(0);
    images.forEach(imagePath => {
      expect(path.isAbsolute(imagePath)).toBe(false);
      expect(imagePath.endsWith('.webp')).toBe(true);
      const fullPath = path.join(__dirname, '..', 'public', 'images', imagePath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  test('getImageMetadata returns an array of valid metadata objects', () => {
    const metadata = getImageMetadata();
    expect(Array.isArray(metadata)).toBe(true);
    expect(metadata.length).toBeGreaterThan(0);
    metadata.forEach(item => {
      expect(item).toHaveProperty('filename');
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('tags');
      expect(Array.isArray(item.tags)).toBe(true);
      item.tags.forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('title');
        expect(tag).toHaveProperty('description');
      });
    });
  });

  test('getTagConfig returns a valid tag configuration object', () => {
    const tagConfig = getTagConfig();
    expect(tagConfig).toHaveProperty('subject');
    expect(tagConfig).toHaveProperty('version');
    expect(tagConfig).toHaveProperty('general');
    ['subject', 'version', 'general'].forEach(category => {
      expect(Array.isArray(tagConfig[category])).toBe(true);
      tagConfig[category].forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('title');
        expect(tag).toHaveProperty('description');
      });
    });
  });

  test('getAllTags returns an array of all tags', () => {
    const allTags = getAllTags();
    const tagConfig = getTagConfig();
    const expectedTotalTags = tagConfig.subject.length + tagConfig.version.length + tagConfig.general.length;
    expect(Array.isArray(allTags)).toBe(true);
    expect(allTags.length).toBe(expectedTotalTags);
    allTags.forEach(tag => {
      expect(tag).toHaveProperty('name');
      expect(tag).toHaveProperty('title');
      expect(tag).toHaveProperty('description');
    });
  });

  test('getImageMetadataByPath returns metadata for existing images', () => {
    const images = getImageList();
    images.forEach(imagePath => {
      const metadata = getImageMetadataByPath(imagePath);
      expect(metadata).not.toBeUndefined();
      expect(metadata.filename).toBe(imagePath);
      expect(metadata).toHaveProperty('label');
      expect(Array.isArray(metadata.tags)).toBe(true);
      metadata.tags.forEach(tag => {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('title');
        expect(tag).toHaveProperty('description');
      });
    });
  });

  test('getImageMetadataByPath returns undefined for non-existent image', () => {
    const metadata = getImageMetadataByPath('non-existent-image-123987.webp');
    expect(metadata).toBeUndefined();
  });

  test('All images in the directory have corresponding metadata', () => {
    const images = getImageList();
    const metadata = getImageMetadata();
    const metadataFilenames = metadata.map(item => item.filename);
    images.forEach(imagePath => {
      expect(metadataFilenames).toContain(imagePath);
    });
  });

  test('All metadata entries correspond to existing images', () => {
    const images = getImageList();
    const metadata = getImageMetadata();
    metadata.forEach(item => {
      expect(images).toContain(item.filename);
    });
  });

  test('All tags used in image metadata exist in tag configuration', () => {
    const metadata = getImageMetadata();
    const tagConfig = getTagConfig();
    const allConfigTags = [...tagConfig.subject, ...tagConfig.version, ...tagConfig.general];

    metadata.forEach(image => {
      image.tags.forEach(tag => {
        expect(allConfigTags.some(configTag => configTag.name === tag.name)).toBeTruthy();
      });
    });
  });

  test('All tags in metadata have consistent information with tag configuration', () => {
    const metadata = getImageMetadata();
    const allTags = getAllTags();

    metadata.forEach(image => {
      image.tags.forEach(tag => {
        const configTag = allTags.find(t => t.name === tag.name);
        expect(configTag).toBeDefined();
        expect(tag.title).toBe(configTag.title);
        expect(tag.description).toBe(configTag.description);
      });
    });
  });

  test('Tag categories are consistent', () => {
    const metadata = getImageMetadata();
    const tagConfig = getTagConfig();

    const categorizeTag = (tagName) => {
      if (tagConfig.subject.some(t => t.name === tagName)) return 'subject';
      if (tagConfig.version.some(t => t.name === tagName)) return 'version';
      if (tagConfig.general.some(t => t.name === tagName)) return 'general';
      return null;
    };

    metadata.forEach(image => {
      image.tags.forEach(tag => {
        const category = categorizeTag(tag.name);
        expect(category).not.toBeNull();
      });
    });
  });
});

# Image Set Template

[![CI](https://github.com/infinia-yzl/image-set/actions/workflows/ci.yml/badge.svg)](https://github.com/infinia-yzl/image-set/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/image-set.svg)](https://www.npmjs.com/package/image-set)

This repository is a template for creating and publishing npm packages containing optimized image sets, designed to work seamlessly with Next.js projects.

## DISCLAIMER
**ALWAYS HAVE A BACKUP OF YOUR IMAGES OUTSIDE THIS PROJECT. THE SCRIPTS IN THIS PROJECT WILL MODIFY YOUR IMAGES.**

See the [LICENSE](LICENSE) file.

## Table of Contents

1. [Why I Created This](#why-i-created-this)
2. [How It Works](#how-it-works)
3. [Getting Started](#getting-started)
    - [Setting Up Your Own Image Set](#setting-up-your-own-image-set)
    - [Folder Structure](#folder-structure)
4. [Image Compression](#image-compression)
5. [Metadata & Tagging](#metadata--tagging)
    - [Metadata](#metadata)
    - [Tagging](#tagging)
    - [Tag Configuration](#tag-configuration)
6. [Publishing Your Package](#publishing-your-package)
    - [NPM Tutorial for Beginners](#npm-tutorial-for-beginners)
7. [Using the Image Set in a Next.js Project](#using-the-image-set-in-a-nextjs-project)
8. [License](#license)

## Why I Created This

This repository was created to facilitate static image contributions for web projects without the need for complex database systems or user management infrastructure.
The core concept is to simplify image contributions to the level of a pull request. Here's how it works:
- Git manages the submission process
- npm handles image packaging
- Scripts optimize images

This solution may be suitable for you if:
- You're developing an open-source project and want to encourage contributions (from others) for assets
- You don't want to set up additional database or cloud services
- You see value in separating image assets from your main codebase
- Your project benefits from community-driven assets

## How It Works

1. The template provides a structure for organizing images and scripts for processing them.
2. Images are automatically compressed and converted to WebP format.
3. The resulting package can be easily imported and used in Next.js projects.

### Workflow Overview

```mermaid
graph LR
    A[Image Set Package] -->|1. Publish| B[npm Registry]
    B -->|2. Install| C[Next.js Project]
    C -->|3. Use| D[Optimized Images]
   ```
This diagram illustrates how the Image Set package is published to npm, installed in a Next.js project, and then used to access optimized images.

## Getting Started

### Setting Up Your Own Image Set

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/image-set-template.git your-image-set-name
   cd your-image-set-name
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the `package.json` file:
    - Change the `name` field to a unique name for your image set
    - Update the `description`, `keywords`, and `author` fields

4. Add your images:
    - Place your images in the `public/images/` directory
    - The script will automatically create a subdirectory with your package name and move all images into it

5. Process your images:
   ```
   npm run process-images
   ```
   This will run an interactive CLI where you may select between compressing images or tagging your images.
    - **Compress images**: You should run the Compress Images command first before tagging them.
      This will organize your images, compress them, convert them to WebP format, and replace the originals -- remember to back up your images outside the project before proceeding.
      See also [Image Compression](#image-compression).

    - **Tag images**:
      You can manage tags or add from the list of existing tags. After compressing the images, you should normally add some of your own custom tags first before tagging your images. You may also manually edit the `tag-config.json` file to add or remove tags.
      It also prompts for other metadata such as the name, title and description.
      See also [Metadata & Tagging](#metadata--tagging).

6. Update the LICENSE file with your preferred license

7. Update this README with information about your specific image set

## Folder Structure

The script will create a folder structure like this:

```
public/
  images/
    category1/
      image1.webp
      image2.webp
    category2/
      subcategory/
        image3.webp
      image4.webp
```

You can organize your images in any way you prefer within the `images/` directory. The script will maintain your folder structure while compressing and converting the images.

## Image Compression

This template uses the `sharp` library to automatically compress and convert images to the WebP format. The compression script:
You may run the compression script by running `npm run process-images` and select `Compress Images` in the CLI, or access it directly via `npm run compress-images`.

The script:
- Converts all images in the to WebP format
- Reduces image quality to 80% (adjustable in `scripts/process-images.js`)
- Replaces original images with compressed versions
- Maintains the original folder structure within the folder

To customize compression settings, edit the `scripts/process-images.js` file.


## Metadata & Tagging

### Metadata
Each image can have associated metadata, including a filename, label, and tags. The metadata is stored in `image-metadata.json`.

### Tagging
Images can be tagged with descriptive tags to facilitate search and organization. The tag configuration is stored in `tag-config.json`.
You may manually edit the file or use the interactive CLI (`npm run process-images`) to manage tags.

### Tag Configuration
Tags are organized into three categories:

- Subject: Related to the subject of the image (e.g., Nature, Technology, People).
- Version: Related to any version information (like a Movie season or Game version) of the image set (e.g., 1_0_0, 1_1_0, 2_0_0).
- General: General tags (e.g., High Quality, Colorful, Monochrome). New tags added via the CLI are placed here by default.

All new tags added via the interactive CLI are placed in `General`. If you wish to add to `Subject` or `Version`, you may manually edit the `tag-config.json` file.
Feel free to remove the default tags and add your own.

## Publishing Your Package

To publish your package to npm:

1. Make sure you have an npm account and are logged in locally
2. Run the publish script:
   ```
   npm run publish-package
   ```
3. Follow the prompts to bump the version and publish

### NPM Tutorial for Beginners

If you're new to npm, here's a quick guide to get you started:

1. Create an npm account:
    - Go to https://www.npmjs.com/ and click "Sign Up"
    - Follow the registration process

2. Log in to npm from your terminal:
   ```
   npm login
   ```
   Enter your username, password, and email when prompted

3. Prepare your package for publication:
    - Ensure your `package.json` file is correctly filled out
    - Run `npm run compress-images` to optimize your images

4. Publish your package:
   ```
   npm publish
   ```
   If this is your first time publishing this package, it will create a new package on npm

5. Updating your package:
    - Make your changes
    - Update the version number in `package.json` (e.g., from "1.0.0" to "1.0.1")
    - Run `npm publish` again

6. Managing versions:
    - Use semantic versioning (MAJOR.MINOR.PATCH)
    - Increment PATCH for backwards-compatible bug fixes
    - Increment MINOR for new backwards-compatible functionality
    - Increment MAJOR for incompatible changes

Remember, once you publish a version, you can't overwrite it. Always increment the version number for new publications.

## Using the Image Set in a Next.js Project

1. Install the package in your Next.js project:
   ```
   npm install your-package-name
   ```

2. Update your `next.config.js`:
   ```javascript
   const path = require('path');

   module.exports = {
     webpack: (config, { dev, isServer }) => {
       config.resolve.modules.push(path.resolve('./node_modules/your-package-name/public'));
       return config;
     },
   };
   ```

3. Use the images in your Next.js components:
    ```jsx
    import Image from 'next/image';
    import { getImageSetName, getImageList, getImageMetadata, getTagConfig } from 'your-package-name';
    
    export default function MyComponent() {
      const imageSetName = getImageSetName();
      const images = getImageList();
      const metadata = getImageMetadata();
      const tagConfig = getTagConfig();
    
      // Filter images by tag
      const natureImages = images.filter(image => 
        getImageMetadata(image).tags.some(tag => tag.name === 'nature')
      );
    
      return (
        <div>
          {natureImages.map(image => (
            <Image 
              key={image}
              src={`/images/${imageSetName}/${image}`}
              width={500}
              height={300}
              alt={getImageMetadata(image).label || "Image"}
            />
          ))}
        </div>
      );
    }
    ```

Note: All images are compressed and converted to WebP format. Make sure to use the `.webp` extension when referencing them.

## Upgrading

For any new versions of the template, you can upgrade your package by following the instructions in [Releases](https://github.com/infinia-yzl/image-set/releases) or, by applying the patches in the `patches` folder manually.

## License

See the [LICENSE](LICENSE) file for details.

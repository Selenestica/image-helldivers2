# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-07-27

### Added
- Automatic migration feature for updating metadata to the new structure
- New `ensureTagArray` function in `process-images.js` for consistent tag handling

### Changed
- Updated metadata structure: tags are now stored as an array of strings instead of objects
- Modified `getImageMetadata` function to return full tag objects, maintaining backwards compatibility
- Updated `getImageMetadataByPath` to use the new `getImageMetadata` function
- Refactored `promptForTags` function to work with tag names instead of full tag objects
- Updated 'view' action in CLI to display tags according to the new structure

### Fixed
- Resolved inconsistencies in tag handling across different functions
- Updated test suite to align with the new metadata structure

### Development
- Improved code consistency and reduced redundancy in metadata processing

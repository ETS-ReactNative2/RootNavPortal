# Next Release:
- Modified message dialog when closing the gallery while images are still processing.
- Added separator to icon menu.
- Re-added missing util function `splitLinesAsPlants`.
- Moved thumbnail generation to upon opening a folder to reduce potentially unnecessary loading/storing of folders that may not be opened.
- Fixed potential crash when importing non .js plugins.
- Added type checking for plugins.
- Fixed a bug which caused newly imported folders to not update in the viewer page until another action was made
- Fixed a bug causing thumbnails to not refresh after background app
- Fixed a bug causing the export "Open" button being unable to find a written file when exporting multiple

# 0.5.0

- Changed RSML parsing to no longer rely on keys being present in the RSML tags, supporting older RSML
- Moved scanning folder structures for importing to the backend, and made import button reflect it being busy
- Added small blacklist of folders to never scan - such as operating system folders and development library folders
- Fixed thumbnails re-rendering when the queue/inflight files changed
- Implemented angle measure plugins
- Added desktop notification for when all queued files are returned from API, can be clicked to reopen the gallery
- Fixed a bug where thumbnails wouldn't be generated upon opening gallery after backgrounding
- Fixed a bug where the RSML results would be sent along with thumbnail HTTP request
- Moved operations from FolderView's render to componentDidMount now we know how React works
- Increased API concurrency to 10 files
- Updated Electron to 8.2.2

# 0.4.0

- Gave thumbnails a minimum set of dimensions for use before the thumbnails have been received
- Added an "Open" button to the measurement export modal to open the containing folder of the where the CSV was saved to
- Added a loading spinner to the folder cards if they are waiting for thumbnails to come back

# 0.3.0

- Replaced IPC and Redux syncing as method of parsing RSML and thumbnails with a local-only HTTP server in the backend, hugely improving performance
- Thumbnails opt for lazy loading where possible, only loading first time when they are scrolled onto the screen
- Thumbnails and RSML process in batches by the folder, rather than individual files
- Added automatic network detection - loss of connectivity will be gracefully handled and alerted to, as will reconnection. This will fail if local LAN adapters exist in the system such as VirtualBox's loopback adapter
- Added plugin descriptions in the form of black 'i' icons on the plugin tiles
- Thumbnail sizes are more consistent and scale properly in the gallery now
- Added wiki documentation for plugin development
- Updated default model text

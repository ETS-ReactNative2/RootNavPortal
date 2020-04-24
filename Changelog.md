# Next Release:
- Added right clicking a thumbnail to be able to "mark as failed", and thus exclude the image from exporting traits
- Fixed a bug causing filenames with `.`s in them to not be picked up properly for the API
- Increased folder depth to 8 in case it caused a problem
- Any failed API responses mark that image as failed

# 0.6.0:
- Added auto-updating. App will download, notify, and update on close
- Moved thumbnail generation to upon opening a folder to reduce potentially unnecessary loading/storing of folders that may not be opened.
- Added an 'About' page to document maintainer contacts, suggestion/bug link, version and internals
- Added 'Open Viewer' button to gallery, and added state to viewer if nothing is open
- Added type checking for plugins
- Modified message dialog when closing the gallery while images are still processing
- Added separator to icon menu
- Re-added missing util function `splitLinesAsPlants`
- Added tooltip to explain why images are being skipped in viewer page
- Fixed potential crash when importing non .js plugins.
- Fixed a bug which caused newly imported folders to not update in the viewer page until another action was made
- Fixed a bug causing thumbnails to not refresh after background app
- Fixed a bug causing the export "Open" button being unable to find a written file when exporting multiple
- Fixed a crash when navigating the viewer into an RSML without an image
- Fixed mutliple crashes and exceptions relating to refreshing the gallery page
- Fixed crash where deleting an image from the file system and then refreshing would crash viewer if that image was currently open
- Fixed bug when switching folders in the viewer can crash if the first tag has no image or RSML

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

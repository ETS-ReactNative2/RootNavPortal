# 0.5.0

- Changed RSML parsing to no longer rely on keys being present in the RSML tags, supporting older RSML
- Moved scanning folder structures for importing to the backend, and made import button reflect it being busy
- Added small blacklist of folders to never scan - such as operating system folders and development library folders
- Fixed thumbnails re-rendering when the queue/inflight files changed
- Implemented angle measure plugins

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

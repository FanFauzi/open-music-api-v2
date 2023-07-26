const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistsHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request, h) => handler.getAllPlaylistsHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongInToPlaylistHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getSongsInPlaylistHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.deleteSongInPlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) => handler.getActivitesHandler(request, h),
    options: {
      auth: 'openmusicapp_jwt',
    },
  },
];

module.exports = routes;

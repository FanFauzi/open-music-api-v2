class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this.playlistsService = playlistsService;
    this.validator = validator;
  }

  async postPlaylistsHandler(request, h) {
    console.log(request.payload);
    this.validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.playlistsService.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getAllPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async getPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { userId: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.playlistsService.getPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(id, credentialId);
    await this.playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'playlist berhasil dihapus',
    };
  }

  async postSongInToPlaylistHandler(request, h) {
    this.validator.validateSongInToPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.playlistsService.addSongInToPlaylist(songId, playlistId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan kedalam playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.playlistsService.getSongsInPlaylist(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongInPlaylistByIdHandler(request) {
    const { songId: id } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.playlistsService.deleteSongInPlaylist(id, playlistId, credentialId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }

  async getActivitesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this.playlistsService.getActivites(credentialId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;

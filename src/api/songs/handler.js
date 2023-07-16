class SongsHandler {
  constructor(service, validator) {
    this.SongService = service;
    this.validator = validator;
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const songId = await this.SongService.addSong(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getAllSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this.SongService.getSongs(title, performer);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this.SongService.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this.validator.validateSongPayload(request.payload);

    const {
      title,
      year,
      performer,
      genre,
      duration,
    } = request.payload;
    const { id } = request.params;

    await this.SongService.editSongById(
      id,
      {
        title,
        year,
        performer,
        genre,
        duration,
      },
    );

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this.SongService.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;

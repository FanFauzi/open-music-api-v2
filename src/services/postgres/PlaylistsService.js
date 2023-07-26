const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this.PlaylistPool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.PlaylistPool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name , users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };

    const result = await this.PlaylistPool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.PlaylistPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongInToPlaylist(songId, playlistId, owner) {
    const id = `playlist_song-${nanoid(16)}`;
    const actId = `playlist_song_activites${nanoid(16)}`;

    const action = 'add';
    const date = new Date();
    const stringDate = date.toISOString();

    const qurySong = {
      text: 'SELECT songs.id FROM songs WHERE songs.id = $1',
      values: [songId],
    };

    const resultSong = await this.PlaylistPool.query(qurySong);

    if (!resultSong.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING song_id',
      values: [id, playlistId, songId],
    };

    const result = await this.PlaylistPool.query(query);

    if (!result.rows[0].song_id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    const queryActivites = {
      text: 'INSERT INTO playlist_song_activites VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [actId, playlistId, owner, songId, action, stringDate],
    };

    const resultAct = await this.PlaylistPool.query(queryActivites);

    if (!resultAct.rows.length) {
      throw new InvariantError('Activites gagal ditambahkan');
    }
  }

  async getSongsInPlaylist(playlistid) {
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username 
      FROM playlists
      INNER JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.id = $1 OR collaborations.playlist_id = $1`,
      values: [playlistid],
    };

    const result = await this.PlaylistPool.query(queryPlaylist);

    const querySongs = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlists
      INNER JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id 
      INNER JOIN songs ON songs.id = playlist_songs.song_id
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.id = $1 OR collaborations.playlist_id = $1`,
      values: [playlistid],
    };

    const resultSongs = await this.PlaylistPool.query(querySongs);

    const response = {
      ...result.rows[0],
      songs: resultSongs.rows,
    };

    return response;
  }

  async deleteSongInPlaylist(songId, playlistId, owner) {
    const actId = `playlist_song_activites${nanoid(16)}`;

    const action = 'delete';
    const date = new Date();
    const stringDate = date.toISOString();

    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING song_id',
      values: [songId],
    };

    const result = await this.PlaylistPool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Song gagal dihapus, Id tidak ditemukan');
    }

    const queryActivites = {
      text: 'INSERT INTO playlist_song_activites VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [actId, playlistId, owner, songId, action, stringDate],
    };

    const resultAct = await this.PlaylistPool.query(queryActivites);

    if (!resultAct.rows.length) {
      throw new InvariantError('Activites gagal ditambahkan');
    }
  }

  async getActivites(userId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activites.action, playlist_song_activites.time
      FROM playlist_song_activites
      INNER JOIN users ON users.id = playlist_song_activites.user_id
      FULL OUTER JOIN songs ON songs.id = playlist_song_activites.song_id
      WHERE playlist_song_activites.user_id = $1`,
      values: [userId],
    };

    const result = await this.PlaylistPool.query(query);

    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.PlaylistPool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resouce ini');
    }
  }

  async verifyPlaylistAccess(id, owner) {
    try {
      await this.verifyPlaylistOwner(id, owner);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationsService.verifyCollaboration(id, owner);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;

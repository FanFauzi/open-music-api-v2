const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const SongInToPlaylistPayloadShema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PlaylistPayloadSchema,
  SongInToPlaylistPayloadShema,
};

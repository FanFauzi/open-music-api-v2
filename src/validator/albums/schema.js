/* eslint-disable max-len */
const Joi = require('joi');
// Untuk mengambil tahun terbaru
const currentYear = new Date().getFullYear();
const AlbumsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // year: Joi.number().required(),
  // menambahkan fungsi integer(), min() dan max() untuk memberikan maksimal number yang ditetapkan pada nilai tahun. Tujuannya, untuk meningkatkan keakurasian validasi data.
  year: Joi.number().integer().min(1900).max(currentYear)
    .required(),
});

module.exports = { AlbumsPayloadSchema };

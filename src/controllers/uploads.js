const supabase = require('../supabase.js');
const { displayError, runResponse } = require('../supplements');

const uploadImage = async (req, res) => {
  const { imagem } = req.body;

  if (!imagem) {
    return runResponse(400, 'A url da imagem deve ser informada', res);
  }
  const buffer = Buffer.from(imagem, 'base64');

  let numeroAleatorio = Math.floor(Math.random() * 900000000) + 10000;

  const name = `imagem-upload-${numeroAleatorio}`;

  try {
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(`${name}.jpeg`, buffer);

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }
    const { publicURL, error: errorPublicUrl } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(`${name}.jpeg`);

    if (errorPublicUrl) {
      return res.status(400).json({
        error: errorPublicUrl.message
      });
    }
    return res.json(publicURL);
  } catch (error) {
    displayError(error, res);
  }
};

module.exports = {
  uploadImage
};

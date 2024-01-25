const cloudinary = require('cloudinary').v2;

const uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  //file: the file to upload
  //folder: the folder in which the file should be uploaded
  //height:the height to resize the image to
  // quality: is used for compression of image.
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";

  return await cloudinary.uploader.upload(file.tempFilePath, options);


}

module.exports = {
  uploadImageToCloudinary
}
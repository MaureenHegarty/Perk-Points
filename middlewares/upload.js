const multer = require('multer')
const cloudinary = require('cloudinary').v2
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage

cloudinary.config({ 
    cloud_name: 'dnbrxtjlh', 
    api_key: '686858291372625', 
    api_secret: 'hzI9czk5OPC3cJLTiA1D0qUPIOw' 
  });


  const upload = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'file-upload-demo'

        }
    })
  })




  module.exports = upload
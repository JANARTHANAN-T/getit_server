const express=require('express')
const {postCircular,renderCircular,getAllCircular,deleteCircular,createfolder,getAllWebCircular,getSpecificCircular} = require('../controllers/circular.js')
const router = express.Router();
const { storage, fileFilter } = require("../multter/upload")
const multer = require('multer');
const upload = multer({ limits: { fileSize: 2097152 }, fileFilter: fileFilter, storage: storage })
const {modifyPdf} = require('../public/js/pdfModification')
const {isLoggedIn}=require("../middleware/auth")

router.get('/',isLoggedIn,renderCircular)
router.get('/all',getAllWebCircular)
router.get('/all/:id',getAllCircular)
router.get('/hash/:id',getSpecificCircular)
router.post('/',isLoggedIn,upload.single('pdf'),modifyPdf,postCircular)
router.delete('/:id',deleteCircular)
router.get('/add/acadamic_year',isLoggedIn,createfolder)

module.exports=router;
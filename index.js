const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        let x = file.originalname.split('.');
        var newfilename = 'photo.' + x[x.length - 1];
        cb(null, newfilename);
    }
});

const upload = multer({ storage: storage })

const app = express();
const PORT = 3333;

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('web');
});

app.post('/', upload.single('photo'), (req, res) => {
    if (req.file) {
        (async () => {
            let ciphertext = await quickstart(req.file.path);
            res.download('./results/ocrtext.txt');
            res.render('result', { ciphertext });
        })()
    }
    else throw 'error';
});

app.get('/download', function (req, res) {
    res.download(__dirname + '\\results\\ocrtext.txt', 'ocrtext.txt');
});

app.listen(PORT, () => {
    console.log('Listening at ' + PORT);
});



async function quickstart(fileval) {
    const vision = require('@google-cloud/vision');

    // Creates a client
    const client = new vision.ImageAnnotatorClient({
        keyFilename: 'apikey.json'
    });
    // Performs label detection on the image file
    const [result] = await client.textDetection(fileval);
    const detections = result.textAnnotations;
    var ciphertext = '';
    detections.forEach(text => {
        ciphertext += text.description + '\n';
    });

    fs.writeFile('./results/ocrtext.txt', ciphertext, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    return ciphertext
}
let potrace = require('potrace'),
    fs = require('fs');
path = require('path')
let multer = require('multer')
let upload = multer({ dest: './toVector' })

const express = require('express')

const PORT = process.env.PORT || 8080

const app = express()

const tracing = async (obj, call) => {
    let params = {
        color: obj.color === undefined ? `black` : obj.color,
        threshold: obj.threshold === undefined ? potrace.Potrace.THRESHOLD_AUTO : parseFloat(obj.threshold),
        turdSize: obj.turdSize === undefined ? 2 : obj.turdSize,
        optTolerance: obj.optTolerance === undefined ? 0.2 : obj.optTolerance
    };
    p = path.join(__dirname, `toVector`, `${obj.name}`)

    potrace.trace(p, params, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
        call()
    });


}

const posterize = (obj) => {
    let params = {
        color: obj.color != 'black' ? obj.color : 'black',
        steps: obj.thresholds === undefined || obj.thresholds === [] ? [potrace.Potrace.THRESHOLD_AUTO] : obj.thresholds,
        turdSize: obj.turdSize != 2 ? obj.turdSize : 2,
        optTolerance: obj.optTolerance == 0.2 ? 0.2 : obj.optTolerance
    };

    p = path.join(__dirname, `toVector`, `${obj.name}`)

    potrace.trace(p, params, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
        call()
    });

}

function removeActiveImage(name, folder, extension) {
    let fPath = `${path.join(__dirname, folder, name)}.${extension}`
    console.log(fPath)
    fs.exists(fPath, (exists) => {
        if (exists) {
            console.log('exists')
            fs.unlink(fPath, (err) => {
                if (err) console.log(err)
                else console.log('worked')
            })
        }
    })
}



app.get('/posterize', (req, res) => {
    let name = req.query.name
    let thresholds = req.query.thresholds
    let turdSize = req.query.turdSize
    let optTolerance = req.query.optTolerance
    let color = req.query.color

    posterize({
        name,
        thresholds,
        turdSize,
        optTolerance,
        color
    }, res.sendFile(path.join(__dirname + 'toVector' + `${name}.svg`), (err) => {
        console.log(err)
    }))

})


app.get('/tracing', async (req, res) => {
    let name = req.query.name
    let threshold = req.query.threshold
    let turdSize = req.query.turdSize
    let optTolerance = req.query.optTolerance
    let color = req.query.color

    await tracing({
        name,
        threshold,
        turdSize,
        optTolerance,
        color
    }, () => {
        res.sendFile(path.join(__dirname + '/svgs' + `/${name}.svg`))
        callback(name, 900000, 'svgs', 'svg')
    })

})



app.post('/imgToVector', upload.single('name'), (req, res) => {

    let file = req.file
    let activeImage = {}

    activeImage.name = file.filename
    activeImage.originalName = file.originalname
    activeImage.extension = file.originalname.split('.')[1]
    activeImage.file = file
    callback(activeImage.name, 900000, 'toVector')
    res.send(activeImage)
})


function callback(name, time, folder, extension) {
    setTimeout(() => {
        removeActiveImage(name, folder, extension)
    }, time, name)

}

app.listen(PORT, () => console.log('listening'))
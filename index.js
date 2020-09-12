let potrace = require('potrace'),
    fs = require('fs');
path = require('path')
let multer = require('multer')
let upload = multer({ dest: './toVector' })

const express = require('express')

const PORT = process.env.PORT || 8080

const app = express()
app.use(express.static('svgs'));
app.use(express.static('toVector'));

const tracing = async (obj, call) => {
    let params = {
        color: obj.color === undefined ? `black` : obj.color,
        threshold: obj.threshold === undefined ? potrace.Potrace.THRESHOLD_AUTO : parseFloat(obj.threshold),
        turdSize: obj.turdSize === undefined ? 2 : obj.turdSize,
        optTolerance: obj.optTolerance === undefined ? 0.2 : obj.optTolerance
    };
    console.log('got p')
    p = path.join(__dirname, `toVector`, `${obj.name}`)
    console.log('before trace')

    potrace.trace(p, params, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
        call()
    });


}

const posterize = (obj, call) => {
    let threshold = obj.threshold === undefined ? potrace.Potrace.THRESHOLD_AUTO : parseFloat(obj.threshold)
    let steps = obj.steps === undefined ? 2 : parseInt(obj.steps)

    console.log('steps is ' + steps + ' and threshold is ' + threshold)
    let params = {}
    p = path.join(__dirname, `toVector`, `${obj.name}`)
    // console.log(params)

    potrace.posterize(p, { threshold: threshold, steps: steps }, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
        call()
    });

}

function removeActiveImage(name, folder, extension) {
    let fPath = extension != undefined ? `${path.join(__dirname, folder, name)}.${extension}` : path.join(__dirname, folder, name);
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
    let threshold = req.query.threshold
    let steps = req.query.steps

    posterize({
        name,
        threshold,
        steps
    }, () => {
        res.sendFile(path.join(__dirname + '/svgs' + `/${name}.svg`))
        callback(name, 900000, 'svgs', 'svg')
    })

})


app.get('/tracing', async (req, res) => {
    let name = req.query.name
    let threshold = req.query.threshold
    let turdSize = req.query.turdSize
    let optTolerance = req.query.optTolerance
    let color = req.query.color

    console.log('tracing')
    await tracing({
        name,
        threshold,
        turdSize,
        optTolerance,
        color
    }, () => {
        console.log('after tracing')
        res.sendFile(path.join(__dirname + '/svgs' + `/${name}.svg`))
        console.log('before callback')
        callback(name, 60000, 'svgs', 'svg')
    })

})



app.post('/imgToVector', upload.single('name'), (req, res) => {

    let file = req.file
    let activeImage = {}

    activeImage.name = file.filename
    activeImage.originalName = file.originalname
    activeImage.extension = file.originalname.split('.')[1]
    activeImage.file = file
    callback(activeImage.name, 60000, 'toVector')
    res.send(activeImage)
})


function callback(name, time, folder, extension) {
    setTimeout(() => {
        removeActiveImage(name, folder, extension)
    }, time, name)

}

app.listen(PORT, () => console.log('listening'))
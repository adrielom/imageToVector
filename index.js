let potrace = require('potrace'),
    fs = require('fs');
path = require('path')
let multer = require('multer')
let upload = multer({ dest: './toVector' })

const express = require('express')

const PORT = process.env.PORT || 8080

const app = express()
let img = 'c80772f03893efae04c114a96c3cff49.jpg'
let activeImage = {}

const tracing = async (obj) => {
    console.log(obj)
    let params = {
        color: obj.color != 'black' ? obj.color : 'black',
        threshold: obj.threshold === undefined ? potrace.Potrace.THRESHOLD_AUTO : parseFloat(obj.threshold),
        turdSize: obj.turdSize != 2 ? obj.turdSize : 2,
        optTolerance: obj.optTolerance == 0.2 ? 0.2 : obj.optTolerance
    };

    p = path.join(__dirname, `./toVector/${obj.name}`)
    console.log('color is: ' + params.color)
    potrace.trace(p, params, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
    });

}

const posterize = async (obj) => {
    let params = {
        color: obj.color != 'black' ? obj.color : 'black',
        steps: obj.thresholds === undefined || thresholds === [] ? [potrace.Potrace.THRESHOLD_AUTO] : obj.thresholds,
        turdSize: obj.turdSize != 2 ? obj.turdSize : 2,
        optTolerance: obj.optTolerance == 0.2 ? 0.2 : obj.optTolerance
    };

    p = path.join(__dirname, `./toVector/${obj.name}`)
    console.log("posterize is " + p)
    potrace.trace(p, params, function (err, svg) {
        if (err) throw err;

        fs.writeFileSync(`./svgs/${obj.name}.svg`, svg);
    });

}

function removeActiveImage(name) {
    console.log('in remove function ' + name)
    fs.exists(`./toVector/${name}`, (exists) => {
        if (exists) {
            console.log('exists')
            fs.unlink(`./toVector/${name}`, (err) => {
                if (err) console.log(err)
                else console.log('worked')
            })
        }
    })
}



app.get('/posterize', async (req, res) => {
    let name = req.query.name
    let thresholds = req.query.thresholds
    let turdSize = req.query.turdSize
    let optTolerance = req.query.optTolerance

    await posterize({
        name,
        thresholds,
        turdSize,
        optTolerance
    })
    res.sendFile(path.join(__dirname + '/toVector' + `/${name}.svg`), (err) => {
        console.log(err)
    })
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
    })
    res.sendFile(path.join(__dirname + '/toVector' + `/${name}.svg`), (err) => {
        console.log(err)
    })
})



app.post('/imgToVector', upload.single('name'), (req, res) => {
    console.log(req.file)
    let options = {
        root: path.join(__dirname, 'toVector'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }

    let file = req.file

    activeImage.name = file.filename
    activeImage.originalName = file.originalname
    activeImage.extension = file.originalname.split('.')[1]
    activeImage.file = file
    console.log(activeImage)
    callback(activeImage.name, 360000)
    res.send(activeImage)
})


function callback(name, time) {
    console.log(name)
    setTimeout(() => {
        console.log(time)
        removeActiveImage(name)
    }, time, name)

}

app.listen(PORT, () => console.log('listening'))
const express    = require('express');
const bodyParser = require('body-parser');
const QRCode = require("qrcode");


  const app = express();


  // MIDDLEWARES
  app.use(bodyParser.json());


app.get('/qrcode', async (req, res) => {
    
    const value = req.query.text;
    const qrWidth = parseInt(req.query.width || 250);
    const qrFormat = req.query.format || "png";

    if (!["png", "jpeg", "svg"].includes(qrFormat)) {
        throw new Error("This image format is not supported");
    }

    const formatMap = {
        jpeg: {
            type: "image/jpeg",
            quality: 1,
        },
        png: {
            type: "image/png",
        },
        svg: {
            type: "svg",
        },
    };

    let url = null;

    const imageOutputFormat = formatMap[qrFormat];

    if (["png", "jpeg"].includes(qrFormat)) {
        url = await QRCode.toDataURL(value, {
            errorCorrectionLevel: "H",
            width: qrWidth,
            ...imageOutputFormat,
        });

        // fix bug when QRCode data URL for jpeg generates the string url as png
        if (qrFormat === "jpeg") {
            url = url.replace("data:image/png;", "data:image/jpeg;");
        }
    } else {
        url = await new Promise((resolve, reject) => {
            QRCode.toString(
                value,
                {
                    errorCorrectionLevel: "H",
                    width: qrWidth,
                    ...imageOutputFormat,
                },
                async function (err, string) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(`data:image/svg+xml;utf8, ${encodeURIComponent(string)}`);
                }
            );
        });
    }

    data = url.replace("data:image/png;base64,", "");
    data = data.replace("data:image/jpeg;base64,", "");

    var img = Buffer.from(data, 'base64');

    res.writeHead(200, {
        'Content-Type': imageOutputFormat.type,
        'Content-Length': img.length
    });
    res.end(img); 

});


app.listen(process.env.PORT || 5000, ()=>console.log("Rodando..."));
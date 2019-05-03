const googleTTS = require('google-tts-api');
const fs = require('fs');
const http = require('http');
 
async function download(url, dest) {
    url = url.replace('https','http');
    let file = fs.createWriteStream(dest);
    let request = http.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            return dest;
        });
    }).on('error', (err) => { // Handle errors
        fs.unlink(dest);
        return "";
    });
};

function createTTSfile(text, filename) {
    googleTTS(text, 'en', 1)   // speed normal = 1 (default), slow = 0.24
    .then(function (url) {
        download(url, './tts/' + filename + '.mp3');
    console.log(url);
    })
    .catch(function (err) {
    console.error(err.stack);
    });
}

function createTTSfiles(arr) {
    for(let obj of arr)
        createTTSfile(obj.text, obj.filename);
}

createTTSfiles([
    {
        text: 'Hello World',
        filename: 'test'
    },
    {
        text: 'Turning lights on',
        filename: 'lightson'
    },
    {
        text: 'Turning lights off',
        filename: 'lightsoff'
    },
    {
        text: 'Toggling lights',
        filename: 'lights'
    },
    {
        text: 'Changing temperature',
        filename: 'thermostat'
    }
]);
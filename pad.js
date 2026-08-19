const { Jimp } = require('jimp');

async function main() {
    try {
        const image = await Jimp.read('public/assets/images/icon.png');
        const w = image.bitmap.width;
        const h = image.bitmap.height;
        const max = Math.max(w, h);

        const background = new Jimp({ width: max, height: max, color: 0x00000000 });
        
        const x = Math.floor((max - w) / 2);
        const y = Math.floor((max - h) / 2);

        background.composite(image, x, y);

        await background.write('public/favicon.png');
        await background.write('public/favicon.ico');
        
        console.log('Success');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();

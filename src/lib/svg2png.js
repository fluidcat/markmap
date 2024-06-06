const isCrossOriginUrl = url => {
    const origin = location.host;

    return url.indexOf('data:') !== 0 && url.indexOf(origin) < 0;
};
/**
 *
 * @param url url -> image
 */
const loadImage = url => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        if(isCrossOriginUrl(url)) {
            img.crossOrigin = 'Anonymous';
        }

        img.onload = () => {
            resolve(img);
        };

        img.onerror = function() {
            const msg = 'Image load error: ' + url;

            reject(new Error(msg));
        };

        img.src = url;
    });
};
/**
 * image元素 -> base64 Data
 * @param image image node
 */
export const imageToPng = (image) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext('2d');
    
    // 添加背景
    ctx.rect(0,0,image.width,image.height);
    ctx.fillStyle='white'
    ctx.fill();

    // 画图
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return canvas.toDataURL('image/png');
};


/**
 * 
 * @param xml svg 的xml内容
 */
export const svgToPng = async(xml) => {
    const base64 = window.btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${base64}`;
    const image = await loadImage(image64);
    return imageToPng(image);
};

/**
 * 
 * @param 读取文件内容
 */
export const readFile = (file, dataType = 'DataURL') => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const fnName = `readAs${dataType}`;

        if(!reader[fnName]) {
            throw new Error('File read error, dataType not support');
        }

        reader.onerror = () => {
            reject(new Error('File read error'));
        };

        reader.onload = () => {
            resolve(reader.result);
        };

        reader[fnName](file);
    });
};

export const svgFile2Png = (file) => {
	return readFile(file, 'Text').then(svgToPng)
}
// GIFEncoder.js - Encodes a GIF file
// Based on Jef Poskanzer's Java GifEncoder

function NeuQuant() {
    var netsize = 256; /* number of colours used */
    var prime1 = 499;
    var prime2 = 491;
    var prime3 = 487;
    var prime4 = 503;
    var minpicturebytes = (3 * prime4);

    var network = []; /* the network itself */
    var netindex = []; /* for network lookup - really 256 */
    var bias = []; /* bias and freq arrays for learning */
    var freq = [];
    var radpower = []; /* radpower for precomputation */

    var alphadec;
    var lengthcount;
    var samplefac;

    function init() {
        for (var i = 0; i < netsize; i++) {
            var v = (i << 12) / netsize;
            network[i] = [v, v, v];
            freq[i] = (1 << 14) / netsize;
            bias[i] = 0;
        }
    }

    function unbiasnet() {
        for (var i = 0; i < netsize; i++) {
            network[i][0] >>= 4;
            network[i][1] >>= 4;
            network[i][2] >>= 4;
        }
    }

    function altersingle(alpha, i, b, g, r) {
        network[i][0] -= (alpha * (network[i][0] - b)) >> 10;
        network[i][1] -= (alpha * (network[i][1] - g)) >> 10;
        network[i][2] -= (alpha * (network[i][2] - r)) >> 10;
    }

    function alterneigh(radius, i, b, g, r) {
        var lo = Math.abs(i - radius);
        var hi = Math.min(i + radius, netsize);
        var j = i + 1;
        var k = i - 1;
        var m = 1;

        while ((j < hi) || (k > lo)) {
            var a = radpower[m++];
            if (j < hi) {
                var p = network[j++];
                p[0] -= (a * (p[0] - b)) >> 18;
                p[1] -= (a * (p[1] - g)) >> 18;
                p[2] -= (a * (p[2] - r)) >> 18;
            }
            if (k > lo) {
                var p = network[k--];
                p[0] -= (a * (p[0] - b)) >> 18;
                p[1] -= (a * (p[1] - g)) >> 18;
                p[2] -= (a * (p[2] - r)) >> 18;
            }
        }
    }

    function contest(b, g, r) {
        var bestd = ~(1 << 31);
        var bestbiasd = bestd;
        var bestpos = -1;
        var bestbiaspos = bestpos;

        for (var i = 0; i < netsize; i++) {
            var n = network[i];
            var dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
            if (dist < bestd) {
                bestd = dist;
                bestpos = i;
            }
            var biasdist = dist - ((bias[i]) >> 12);
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
            }
            var betafreq = (freq[i] >> 10);
            freq[i] -= betafreq;
            bias[i] += (betafreq << 10);
        }
        freq[bestpos] += (1 << 10);
        bias[bestpos] -= (1 << 20);
        return bestbiaspos;
    }

    function unbiascolour(i) {
        return [network[i][0] << 4, network[i][1] << 4, network[i][2] << 4];
    }

    function inxbuild() {
        var previouscol = 0;
        var startpos = 0;
        for (var i = 0; i < netsize; i++) {
            var p = network[i];
            var smallpos = i;
            var smallval = p[3];
            for (var j = i + 1; j < netsize; j++) {
                var q = network[j];
                if (q[3] < smallval) {
                    smallpos = j;
                    smallval = q[3];
                }
            }
            var q = network[smallpos];
            if (i != smallpos) {
                var temp = q[0];
                q[0] = p[0];
                p[0] = temp;
                temp = q[1];
                q[1] = p[1];
                p[1] = temp;
                temp = q[2];
                q[2] = p[2];
                p[2] = temp;
                temp = q[3];
                q[3] = p[3];
                p[3] = temp;
            }
            if (smallval != previouscol) {
                netindex[previouscol] = (startpos + i) >> 1;
                for (var j = previouscol + 1; j < smallval; j++) {
                    netindex[j] = i;
                }
                previouscol = smallval;
                startpos = i;
            }
        }
        netindex[previouscol] = (startpos + 255) >> 1;
        for (var j = previouscol + 1; j < 256; j++) {
            netindex[j] = 255;
        }
    }

    function alphadecstart() {
        alphadec = 30 + ((samplefac - 1) / 3);
    }

    function alphadec() {
        alphadec -= alphadec / 100;
        return alphadec;
    }

    function radiusbiasshift(radius) {
        return 10 + (radius >> 3);
    }

    function initnet(sample) {
        lengthcount = sample.length;
        samplefac = lengthcount / minpicturebytes;
        init();

        var biasradius = 32 * (1 << 6);
        var alphadec = alphadecstart();
        var p = sample;
        var pix = 0;
        var delta = samplefac;
        var alpha = 1 << 10;
        var radius = radiusbiasshift(biasradius);
        initradpower(radius);

        while (radius > 0) {
            var step;
            if (delta < 1) {
                step = 1;
            } else {
                step = delta;
            }
            var i = 0;
            while (i < lengthcount) {
                var b = (p[pix] & 0xff) << 4;
                var g = (p[pix + 1] & 0xff) << 4;
                var r = (p[pix + 2] & 0xff) << 4;
                var j = contest(b, g, r);

                altersingle(alpha, j, b, g, r);
                if (radius != 0) {
                    alterneigh(radius, j, b, g, r);
                }

                pix += 3 * step;
                i += step;
            }
            alpha -= alpha / alphadec;
            biasradius -= biasradius / 30;
            radius = radiusbiasshift(biasradius);
            if (radius > 1) {
                initradpower(radius);
            }
        }
        unbiasnet();
        inxbuild();
    }

    function initradpower(radius) {
        radpower = [];
        for (var i = 0; i < radius; i++) {
            radpower[i] = alpha * (((radius * radius - i * i) * (1 << 8)) / (radius * radius));
        }
    }

    function colorMap() {
        var map = [];
        var index = [];
        for (var i = 0; i < netsize; i++) {
            index[network[i][3]] = i;
        }
        var k = 0;
        for (var i = 0; i < netsize; i++) {
            var j = index[i];
            map[k++] = network[j][0];
            map[k++] = network[j][1];
            map[k++] = network[j][2];
        }
        return map;
    }

    function lookupRGB(b, g, r) {
        var bestd = 1000;
        var best = -1;
        var i = netindex[g];
        var j = i - 1;

        while ((i < netsize) || (j >= 0)) {
            if (i < netsize) {
                var p = network[i];
                var dist = p[1] - g;
                if (dist >= bestd) {
                    i = netsize;
                } else {
                    i++;
                    if (dist < 0) {
                        dist = -dist;
                    }
                    var a = p[0] - b;
                    if (a < 0) {
                        a = -a;
                    }
                    dist += a;
                    if (dist < bestd) {
                        var a = p[2] - r;
                        if (a < 0) {
                            a = -a;
                        }
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
            if (j >= 0) {
                var p = network[j];
                var dist = g - p[1];
                if (dist >= bestd) {
                    j = -1;
                } else {
                    j--;
                    if (dist < 0) {
                        dist = -dist;
                    }
                    var a = p[0] - b;
                    if (a < 0) {
                        a = -a;
                    }
                    dist += a;
                    if (dist < bestd) {
                        var a = p[2] - r;
                        if (a < 0) {
                            a = -a;
                        }
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
        }
        return best;
    }

    return {
        buildColorMap: function(pixels) {
            initnet(pixels);
            return colorMap();
        },
        lookupRGB: lookupRGB
    };
}

function LZWEncoder(width, height, pixels, colorDepth) {
    var initCodeSize = Math.max(2, colorDepth);
    var accum = new Uint8Array(256);
    var htab = new Int32Array(5003);
    var codetab = new Int32Array(5003);
    var cur_accum, cur_bits = 0;
    var a_count;
    var free_ent = 0;
    var maxcode;
    var clear_flg = false;
    var g_init_bits, ClearCode, EOFCode;
    var remaining, curPixel;

    function char_out(c, outs) {
        accum[a_count++] = c;
        if (a_count >= 254) {
            flush_char(outs);
        }
    }

    function cl_block(outs) {
        cl_hash(5003);
        free_ent = ClearCode + 2;
        clear_flg = true;
        output(ClearCode, outs);
    }

    function cl_hash(hsize) {
        for (var i = 0; i < hsize; ++i) {
            htab[i] = -1;
        }
    }

    function compress(init_bits, outs) {
        var fcode, c, i, ent, disp, hsize_reg, hshift;
        g_init_bits = init_bits;
        clear_flg = false;
        var n_bits = g_init_bits;
        maxcode = (1 << n_bits) - 1;
        ClearCode = 1 << (init_bits - 1);
        EOFCode = ClearCode + 1;
        free_ent = ClearCode + 2;
        a_count = 0;
        ent = nextPixel();
        hshift = 0;
        for (fcode = 5003; fcode < 65536; fcode *= 2) {
            ++hshift;
        }
        hshift = 8 - hshift;
        hsize_reg = 5003;
        cl_hash(hsize_reg);
        output(ClearCode, outs);
        outer_loop: while ((c = nextPixel()) != -1) {
            fcode = (c << 12) + ent;
            i = (c << hshift) ^ ent;
            if (htab[i] === fcode) {
                ent = codetab[i];
                continue;
            } else if (htab[i] >= 0) {
                disp = hsize_reg - i;
                if (i === 0) {
                    disp = 1;
                }
                do {
                    if ((i -= disp) < 0) {
                        i += hsize_reg;
                    }
                    if (htab[i] === fcode) {
                        ent = codetab[i];
                        continue outer_loop;
                    }
                } while (htab[i] >= 0);
            }
            output(ent, outs);
            ent = c;
            if (free_ent < 4096) {
                codetab[i] = free_ent++;
                htab[i] = fcode;
            } else {
                cl_block(outs);
            }
        }
        output(ent, outs);
        output(EOFCode, outs);
    }

    function flush_char(outs) {
        if (a_count > 0) {
            outs.writeByte(a_count);
            outs.writeBytes(accum, 0, a_count);
            a_count = 0;
        }
    }

    function nextPixel() {
        if (remaining === 0) {
            return -1;
        }
        --remaining;
        return pixels[curPixel++] & 0xff;
    }

    function output(code, outs) {
        cur_accum &= (1 << cur_bits) - 1;
        if (cur_bits > 0) {
            cur_accum |= (code << cur_bits);
        } else {
            cur_accum = code;
        }
        cur_bits += g_init_bits;
        while (cur_bits >= 8) {
            char_out(cur_accum & 0xff, outs);
            cur_accum >>= 8;
            cur_bits -= 8;
        }
        if (free_ent > maxcode || clear_flg) {
            if (clear_flg) {
                maxcode = (1 << (g_init_bits = initCodeSize + 1)) - 1;
                clear_flg = false;
            } else {
                ++g_init_bits;
                if (g_init_bits == 12) {
                    maxcode = 4096;
                } else {
                    maxcode = (1 << g_init_bits) - 1;
                }
            }
        }
        if (code == EOFCode) {
            while (cur_bits > 0) {
                char_out(cur_accum & 0xff, outs);
                cur_accum >>= 8;
                cur_bits -= 8;
            }
            flush_char(outs);
        }
    }

    return {
        encode: function(outs) {
            outs.writeByte(initCodeSize);
            remaining = width * height;
            curPixel = 0;
            compress(initCodeSize + 1, outs);
            outs.writeByte(0);
        }
    };
}

function ByteArray() {
    this.data = [];
}

ByteArray.prototype.writeByte = function(val) {
    this.data.push(val);
};

ByteArray.prototype.writeUTFBytes = function(str) {
    for (var i = 0; i < str.length; i++) {
        this.data.push(str.charCodeAt(i));
    }
};

ByteArray.prototype.writeBytes = function(arr, off, len) {
    for (var i = 0; i < len; i++) {
        this.data.push(arr[off + i]);
    }
};

ByteArray.prototype.getData = function() {
    return new Uint8Array(this.data);
};

function GIFEncoder() {
    var width, height;
    var transparent = null;
    var transIndex;
    var repeat = -1;
    var delay = 0;
    var started = false;
    var out;
    var image;
    var pixels, indexedPixels;
    var colorTab;
    var usedEntry = [];
    var palSize = 7;
    var dispose = -1;
    var closeStream = false;
    var firstFrame = true;
    var sizeSet = false;
    var sample = 10;

    function setSize(w, h) {
        width = w;
        height = h;
        if (started) {
            sizeSet = true;
        }
    }

    function setTransparent(c) {
        transparent = c;
    }

    function setRepeat(r) {
        repeat = r;
    }

    function setDelay(d) {
        delay = d;
    }

    function setDispose(d) {
        if (d >= 0) {
            dispose = d;
        }
    }

    function start() {
        out = new ByteArray();
        out.writeUTFBytes("GIF89a");
        started = true;
    }

    function addFrame(im) {
        image = im;
        if (!started) {
            start();
        }
        if (!sizeSet) {
            setSize(image.width, image.height);
        }
        getImagePixels();
        analyzePixels();
        if (firstFrame) {
            writeLSD();
            writePalette();
            if (repeat >= 0) {
                writeNetscapeExt();
            }
        }
        writeGraphicCtrlExt();
        writeImageDesc();
        if (!firstFrame) {
            writePalette();
        }
        writePixels();
        firstFrame = false;
    }

    function finish() {
        out.writeByte(0x3b);
        closeStream = true;
    }

    function getImagePixels() {
        pixels = [];
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            pixels.push(data[i], data[i + 1], data[i + 2]);
        }
    }

    function analyzePixels() {
        var len = pixels.length;
        var nPix = len / 3;
        indexedPixels = [];
        var nq = new NeuQuant();
        colorTab = nq.buildColorMap(pixels);
        transIndex = findClosest(transparent);
        for (var i = 0; i < nPix; i++) {
            var index = nq.lookupRGB(pixels[i * 3] & 0xff, pixels[i * 3 + 1] & 0xff, pixels[i * 3 + 2] & 0xff);
            usedEntry[index] = true;
            indexedPixels[i] = index;
        }
        pixels = null;
        palSize = 7;
    }

    function findClosest(c) {
        if (c === null) {
            return -1;
        }
        var r = (c & 0xff0000) >> 16;
        var g = (c & 0x00ff00) >> 8;
        var b = (c & 0x0000ff);
        var minpos = 0;
        var dmin = 256 * 256 * 256;
        var len = colorTab.length;
        for (var i = 0; i < len; i += 3) {
            var dr = r - (colorTab[i] & 0xff);
            var dg = g - (colorTab[i + 1] & 0xff);
            var db = b - (colorTab[i + 2] & 0xff);
            var d = dr * dr + dg * dg + db * db;
            var index = i / 3;
            if (usedEntry[index] && (d < dmin)) {
                dmin = d;
                minpos = index;
            }
        }
        return minpos;
    }

    function writeLSD() {
        out.writeByte(width & 0xff);
        out.writeByte((width >> 8) & 0xff);
        out.writeByte(height & 0xff);
        out.writeByte((height >> 8) & 0xff);
        out.writeByte(0xf0 | palSize);
        out.writeByte(0);
        out.writeByte(0);
    }

    function writeNetscapeExt() {
        out.writeByte(0x21);
        out.writeByte(0xff);
        out.writeByte(11);
        out.writeUTFBytes("NETSCAPE2.0");
        out.writeByte(3);
        out.writeByte(1);
        out.writeByte(repeat & 0xff);
        out.writeByte((repeat >> 8) & 0xff);
        out.writeByte(0);
    }

    function writeGraphicCtrlExt() {
        out.writeByte(0x21);
        out.writeByte(0xf9);
        out.writeByte(4);
        var transp, disp;
        if (transparent === null) {
            transp = 0;
            disp = 0;
        } else {
            transp = 1;
            disp = 2;
        }
        if (dispose >= 0) {
            disp = dispose & 7;
        }
        disp <<= 2;
        out.writeByte(0 | disp | 0 | transp);
        out.writeByte(delay & 0xff);
        out.writeByte((delay >> 8) & 0xff);
        out.writeByte(transIndex);
        out.writeByte(0);
    }

    function writeImageDesc() {
        out.writeByte(0x2c);
        out.writeByte(0);
        out.writeByte(0);
        out.writeByte(0);
        out.writeByte(0);
        out.writeByte(width & 0xff);
        out.writeByte((width >> 8) & 0xff);
        out.writeByte(height & 0xff);
        out.writeByte((height >> 8) & 0xff);
        if (firstFrame) {
            out.writeByte(0);
        } else {
            out.writeByte(0x80 | palSize);
        }
    }

    function writePalette() {
        out.writeBytes(colorTab, 0, colorTab.length);
        var n = (3 * 256) - colorTab.length;
        for (var i = 0; i < n; i++) {
            out.writeByte(0);
        }
    }

    function writePixels() {
        var encoder = new LZWEncoder(width, height, indexedPixels, palSize + 1);
        encoder.encode(out);
    }

    function stream() {
        return out.getData();
    }

    return {
        setSize: setSize,
        setTransparent: setTransparent,
        setRepeat: setRepeat,
        setDelay: setDelay,
        setDispose: setDispose,
        start: start,
        addFrame: addFrame,
        finish: finish,
        stream: stream
    };
}
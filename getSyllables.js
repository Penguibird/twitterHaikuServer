const Request = require('xmlhttprequest').XMLHttpRequest;
const readline = require('readline')

const getURL = (word) => {
    return `https://api.datamuse.com/words?sp=${word}&qe=sp&md=s&max=1`
}

const getSyllables = (word) => {
    return new Promise((res, rej) => {
        if (word.split(' ')[0] == 'RT') {
            word = word.split(' ');
            word.splice(0, 2);
            word = word.join(' ');
        }

        // console.log(word);

        word = word.split('').filter(v => /[a-zA-z0-9 ]/.test(v)).join('')
        let req = new Request()
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                res(JSON.parse(req.responseText)[0]);  //[0].numSyllables
            }
        }
        req.open('GET', getURL(word))
        req.send()
    })
}

const readNums = (string) => {
    if (/\d/.test(string)) {
        return string.split('').map(v => humanizeIfNum(v)).join('')
    } else {
        //only one word
        return humanizeIfNum(string)
    }
}

const humanizeIfNum = (string) => {
    let parsed = parseInt(string);
    if (isNaN(parsed)) {
        //input is not a number
        return string
    } else {
        //input is a number and should be converted first
        return humanize(parsed)
    }
}


//I stole this  from https://gist.github.com/ForbesLindesay/5467742
//Sorry ; ]
const humanize = (num) => {
    var ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'];
    var tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty',
        'ninety'];

    var numString = num.toString();

    if (num < 0) throw new Error('Negative numbers are not supported.');

    if (num === 0) return 'zero';

    //the case of 1 - 20
    if (num < 20) {
        return ones[num];
    }

    if (numString.length === 2) {
        return tens[numString[0]] + ' ' + ones[numString[1]];
    }

    //100 and more
    if (numString.length == 3) {
        if (numString[1] === '0' && numString[2] === '0')
            return ones[numString[0]] + ' hundred';
        else
            return ones[numString[0]] + ' hundred and ' + convert(+(numString[1] + numString[2]));
    }

    if (numString.length === 4) {
        var end = +(numString[1] + numString[2] + numString[3]);
        if (end === 0) return ones[numString[0]] + ' thousand';
        if (end < 100) return ones[numString[0]] + ' thousand and ' + convert(end);
        return ones[numString[0]] + ' thousand ' + convert(end);
    }
}





const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.on('line', input => getSyllables(readNums(input)))

module.exports = getSyllables;
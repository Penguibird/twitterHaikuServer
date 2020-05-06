require('dotenv').config()
const Twit = require('twit');
const getSyllables = require('./getSyllables.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const http = require('http');

let haikuCounter = {
  fives: 0,
  sevens: 0,
}

var T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  // timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  // strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

var stream = T.stream('statuses/sample')

stream.on('tweet', tweet => {
  if (tweet.lang == 'en' && !tweet.in_reply_to_status_id && !tweet.entities.media && tweet.entities.urls.length == 0) {
    getSyllables(tweet.text).then(v => {
      console.log(v);
      let url = "";
      if (v.numSyllables == 5) {
        if(haikuCounter.fives>0) {
          url = `https://us-central1-twitter-haiku.cloudfunctions.net/saveFive?data=${tweet.id_str}`
          haikuCounter.fives--;
        }
      } else if (v.numSyllables == 7) {
        if(haikuCounter.sevens>0) {
          url = `https://us-central1-twitter-haiku.cloudfunctions.net/saveSeven?data=${tweet.id_str}`;
          haikuCounter.sevens--;
        }
      } else {
        return
      }
      xhr = new XMLHttpRequest();
      xhr.onReadyStateChange = () => {
        console.log("sent", tweet.id_str)
      }
      xhr.open('GET', url);
      xhr.send();
    }, e => {
      console.error(e)
    })
  }
})


const requestListener = function (req, res) {
  res.writeHead(200);
  if(req == "getHaiku") {
    haikuCounter.fives += 2;
    haikuCounter.sevens +=1;
    res.end(`The server is currently searching for ${haikuCounter.fives} five-verses and ${haikuCounter.sevens} seven-verses!`);
  } else {
    res.end('Hello, World!');
  }
}

const server = http.createServer(requestListener);
server.listen(8080);

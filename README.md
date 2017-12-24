# NLP API for Surirobot

## Overview
This API uses Recast API to retrieve intents or answers from a text

## Requirements
* NodeJs >= 8

## Setup
Run in the console:
```
git clone git@github.com:suricats/surirobot-api-nlp.git service-nlp
cd service-nlp
npm install
cp src/config.js.example src/config.js
```

Fill src/config.js with your Recast API KEY and choose the server port or use the suri downloader:

 ```
cp .env.example .env
nano .env
tools/get-credentials.sh
```

### Running the server
To run the server, run:

```
npm start
```

### Documentation

You can find the Swagger file at:
```
doc/swagger.json
```

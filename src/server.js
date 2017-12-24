/*
 * server.js
 */

const express = require('express')
const bodyParser = require('body-parser')

// Load configuration
require('./config')

// Start Express server
const app = express()
app.set('port', process.env.PORT || 5000)
app.use(bodyParser.json({
    extended: true
}))

app.post('/getintent', (request, response) => {
	if (!request.body.text  || !request.body.language) {
		response.status(400).send('Bad request content');
		return;
	}
	console.log(request.body);

	const req = require('superagent');

	req
	.post('https://api.recast.ai/v2/request')
	.set('Authorization', 'Token '+process.env.DEV_TOKEN)
  	.set('Content-Type', 'application/json')
	.send(request.body)
  	.end((err, res) => {
		var statusMessage = res.text.message;
		if (err) {
			console.log('Error in /getintent :', err) 
			response.status(400).send(statusMessage);
		} else {
			console.log(JSON.parse(res.text));	
			response.send(JSON.parse(res.text));
		}
	});
})

app.post('/getanswer', (request, response) => {
	if (!request.body.text) {
		response.status(400).send('Bad request content');
		return;
	}
	console.log(request.body);

	var text = request.body.text;

	var id='ABCDE-12345';
	if (request.body.conversation_id) id=request.body.conversation_id;
	console.log(id);

	const req = require('superagent');

	req
	.post('https://api.recast.ai/build/v1/dialog')
	.set('Authorization', 'Token '+process.env.DEV_TOKEN)
  	.set('Content-Type', 'application/json')
	.send({message: {content: text, type: "text"}, conversation_id: id})
  	.end((err, res) => {
		var statusMessage = res.text.message;
		if (err) {
			console.log('Error in /getanswer :', err) 
			response.status(400).send(statusMessage);
		} else {
			console.log(JSON.parse(res.text));	
			response.send(JSON.parse(res.text));
		}
	});
})

app.post('/channel', (request, response) => {
	if (!request.body.message) {
		response.status(400).send('Bad request content');
		return;
	}

	var message = request.body.message.attachment; //attachment = {content: 'my Text', type: 'text'}
	var origin = request.body.origin;

	if (origin && origin == "messenger") id = request.body.message.conversation;
	else return;

	console.log('Message: ' + message);
	console.log('Id: ' + id);

	const req = require('superagent');

	req
	.post('https://api.recast.ai/build/v1/dialog')
	.set('Authorization', 'Token '+process.env.DEV_TOKEN)
  	.set('Content-Type', 'application/json')
	.send({message: message, conversation_id: id})
  	.end((err, res) => {
		var statusMessage = res.text.message;
		if (err) {
			console.log('Error in /messenger:', err) 
			response.status(400).send(statusMessage);
		} else {
			var returnedJSON = JSON.parse(res.text);
			var statusCode = returnedJSON.results.nlp.status;
			response.status(statusCode).send(statusMessage);
			//Answer the guy
			var returnedMessages = returnedJSON.results.messages;
			req
				.post('https://api.recast.ai/connect/v1/conversations/'+id+'/messages')
				.send({ messages: returnedMessages })
				.set('Authorization', 'Token 4385e0c43022f500715fa5ebffef43ba')
				.end(function(err, res) {
					var statusText = res.text.message;
					if (err) {
						console.log('Error in /messenger :', err); 
						response.status(res.status).send(statusText);
					} else {
						response.status(res.statusCode).send(statusText);
					}
				});
		}
	});
})

if (!process.env.DEV_TOKEN) {
  console.log('ERROR: process.env.DEV_TOKEN variable in src/config.js file is empty ! You must fill this field with the request_token of your bot before launching your bot locally')

  process.exit(0)
} else {
  // Run Express server, on right port
  app.listen(app.get('port'), () => {
    console.log('Our bot is running on port', app.get('port'))
  })
}


/**
RESPONSE FORMAT FOR DIALOG REQUEST:
res.text=
{
    "results":
    {
        "messages": [
            {
                "type": "text",
                "content": "Hello :-)"
            }
        ],
        "conversation": {
            "id": "CONVERSATION_ID",
            "language": "en",
            "memory": {},
            "skill": "default",
            "skill_occurences": 1
        },
        "nlp": {
            "uuid": "b96bc782-6aba-4fac-aeaa-2326936b08bf",
            "source": "Hello Recast",
            "intents": [
                {
                    "slug": "greetings",
                    "confidence": 0.99
                }
            ],
            "act": "assert",
            "type": null,
            "sentiment": "neutral",
            "entities": {},
            "language": "en",
            "processing_language": "en",
            "version": "2.10.1",
            "timestamp": "2017-10-19T13:24:12.984856+00:00",
            "status": 200
        }
    },
    "message": "Dialog rendered with success"
}
**/

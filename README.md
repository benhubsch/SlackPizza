# SlackPizza

A language-aware, intelligent Slack app to allow teams to order Dominos pizza via a multi-step, natural conversation flow from directly within Slack.

## Table of Contents

- [Project Overview](#project-overview)
- [Demo](#demo)
- [Contributing](#contributing)

## Project Overview

We came up with the idea after having experience using Slack amongst ourselves and wanting to develop something interesting on top of it that hadn't already been built. Naturally, we ended up at Pizza. While you would think that every kind of application has already been developed for Slack, it turns out that a pizza delivery integration was not yet one of them. We were up to the challenge. While it was a casual idea, the implementation was technically very challenging for a variety of reasons. We had to essentially code a multi-step workflow with multiple users using multiple APIs -- not the simplest task ever.

For starters, we desired to go the whole nine yards and used just about every API we thought would be relevant. We trained an entity on api.ai for natural language processing capabilities, used the Google Maps Geocode API to validate and format delivery addresses, the Dominos API to place orders and to match user order input to actual menu items, and the Slack Real Time Messaging API to actually interface with Slack and send messages to and from channels. Lastly, we used MongoDB as our backend to persist user order information in case they decided to return.

If you're keeping score at home, that's a grand total of four APIs and one database we needed to integrate. The obvious issue here? Asynchronous functions. There's not much worse than having to debug race conditions through all those technologies. We ended up wrapping a bunch of the async callbacks in Javascript Promises to keep ourselves sane and not have our code skew so far to the right that we'd be in the conversation for a world record for most horizontal program ever. It was a super fun challenge to have, and something that we got in a flow with once we understood how to deal with it.

Additionally, we had an added of challenge of having to run an Express.js server to process and pass payment information directly to Dominos and a program running the Slack application and listening for user messages separately. The problem is that those two parts of our application needed to communicate with each other in order to provide a seamless experience for the user and pass the order information that was obtained in Slack to the point of payment, which was server side. We considered passing this information as parameters in the url, but this was unfeasible for a variety of reasons (not least of which being most users don't want to be redirected via a 500 character url). We ultimately reconciled this issue by passing information into MongoDB from the Slack side, then reading it in MongoDB on the server side once it was ready.

## Demo

Let's say I'm the project lead on a team, and I want to reward my coworkers for workind hard the past couple weeks with a Friday afternoon pizza party. I can make the Dominator application listen to me from anywhere inside my Slack channel by typing an order, which it will understand and being a conversation, asking me for information that I did not provide. It is possible to provide more than just order information when I invoke the bot -- I could also give it my phone number, email, and home address if I wanted to knock it out in one fell swoop. We've illustrated the step-by-step process here for clarity.

![alt text](https://github.com/benhubsch/SlackPizza/blob/master/pics/slack.png "In Slack")

Note a couple of things: for starters, I say I want a pepperoni pizza. The application runs keywords that the api.ai entity picks out of my request -- most likely "pepperoni" and "pizza" -- and runs those keywords through an algorithm that matches to Dominos menu items behind the scenes. It came up with Ultimate Pepperoni as the dish that would suit me best. Not bad! The application was also able to pick my phone number and email out of otherwise perfectly normal English sentences. Lastly, I gave it a really poorly formatted address, and the application was able to churn out a gorgeous, nicely formatted address that will ultimately be passed on to Dominos (1412 Market san fran to 1412 Market St., San Francisco, CA 94102).

I am then forwarded to a link that contains a page where I can enter my credit card information. Slack does not support sending forms through direct messages, nor would it be ideal to put credit card info inline as a regular message, so the most secure option is to link to an external form:
![alt text](https://github.com/benhubsch/SlackPizza/blob/master/pics/payment.png "Payment Details")
Each of the fields that I fill out are validated to ensure that they are non-empty, contain the correct type, and are plausible credit card details. The UI automatically changes color and autofills your credit company if it is well known.

Lastly, the most enjoyable step: my order is complete! I can see how much I spent, and how long I can expect to wait until Dominos is able to deliver to my apartment.
![alt text](https://github.com/benhubsch/SlackPizza/blob/master/pics/final.png "Order confirmation")

If you have any doubts as to whether this actually works, it does! I suppose you'll have to take my word for it. Unless, of course, your stomach starts to grumble, and you can't help but be a little bit curious if the code we wrote actually works, and you fork it and place an order.

## Contributing

Interested in contributing to this project? Feel free! Create a branch, add commits, and [open a pull request](https://github.com/benhubsch/File-Finder/compare/). 

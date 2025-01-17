const chai = require('chai');
const app = require('../src/index.ts');
const knex = require('../src/db');
const config = require('../src/config');
const jwt = require('jsonwebtoken');

const apiResponse = {
  "version": "1.0",
  "meeting_id": "meeting-persistent-3--c308049",
  "internal_meeting_id": "3e677e88dl7698",
  "data": {
    "metadata": {
      "analytics_callback_url": "https://webhook.site/f519038c-b956-4fa3-9b5c-148e8df09b47",
      "is_breakout": "false",
      "meeting_name": "Arawa3"
    },
    "duration": 20,
    "start": "2021-06-27 18:52:12 +0200",
    "finish": "2021-06-27 18:52:32 +0200",
    "attendees": [
      {
        "ext_user_id": "w_hll5o9o",
        "name": "Lucas Pla",
        "moderator": true,
        "joins": [
          "2021-06-23 18:52:21 +0200"
        ],
        "leaves": [
          "2021-06-23 18:52:32 +0200"
        ],
        "duration": 11,
        "recent_talking_time": "",
        "engagement": {
          "chats": 0,
          "talks": 0,
          "raisehand": 0,
          "emojis": 0,
          "poll_votes": 0,
          "talk_time": 0
        }
      }
    ],
    "files": [
      "default.pdf"
    ],
    "polls": [],
}}

describe('Meetings', async () => {

  describe('POST /v1/post_events unauthenticated', async () => {

    it('should create a new entry in meetings', async () => {
      let res
      try {
        const token = jwt.sign({ 
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
      }, config.secret, { algorithm: 'HS512', header: {
        typ: 'JWT'
      }})
        res = await chai.request(app)
          .post('/v1/post_events?tag=dinum')
          .set('content-type', 'application/json')
          .set("Authorization", "Bearer " + token)
          .set('user-agent', 'BigBlueButton Analytics Callback')
          .send(apiResponse)
        } catch (e) {
        console.log(e)
      }
          res.should.have.status(200);
          const stats = await knex('meetings').orderBy('created_at', 'desc').first()
          stats.duration.should.be.equal(apiResponse.data.duration)
          stats.moderator_count.should.be.equal(1)
          stats.internal_meeting_id.should.be.equal(apiResponse.internal_meeting_id)
          stats.tag.should.be.equal('dinum')
          stats.weekday.should.be.equal(0)
      });
  });
});

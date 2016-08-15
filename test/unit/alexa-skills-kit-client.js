import chai from 'chai';
import chaiJsonSchema from 'chai-json-schema';
import { skillsKitRequest } from 'alexa-schemas';

import AlexaClient, { launch, intent, end } from '../../src/alexa-skills-kit-client';

chai.use(chaiJsonSchema);
chai.tv4.banUnknown = true;
chai.tv4.addSchema(skillsKitRequest);

describe('alexaSkillsKitTest', () => {
  describe('launch function', () => {
    it('should be a valid request', () => {
      chai.expect(launch()).to.be.jsonSchema(skillsKitRequest);
    });
  });

  describe('intent function', () => {
    it('should be a valid request', () => {
      chai.expect(intent({ name: 'HelloWorld' })).to.be.jsonSchema(skillsKitRequest);
    });

    it('with slots should be a valid request', () => {
      chai.expect(intent({
        name: 'HelloWorld',
        slots: {
          foo: 'bar',
        },
      })).to.be.jsonSchema(skillsKitRequest);
    });
  });

  describe('end function', () => {
    it('should be a valid request', () => {
      chai.expect(end()).to.be.jsonSchema(skillsKitRequest);
    });
  });

  describe('client class', () => {
    let client;

    beforeEach(() => {
      client = new AlexaClient({
        applicationId: 'amzn1.ask.skill.12345678-1234-4234-8234-9234567890AB',
      });
    });


    it('should persist application/user/session', () => {
      const first = client.launch();
      const second = client.launch();
      chai.expect(first.session).to.deep.equal(second.session);
    });

    it('should persist application/user and wipe session', () => {
      const first = client.launch();
      client.resetSession();
      const second = client.launch();
      chai.expect(first.session.application).to.deep.equal(second.session.application);
      chai.expect(first.session.user).to.deep.equal(second.session.user);
      chai.expect(first.session.sessionId).to.not.equal(second.session.sessionId);
    });
  });
});

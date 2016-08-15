import alexaSkillsKitClient from '../../src/alexa-skills-kit-client';

describe('alexaSkillsKitClient', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(alexaSkillsKitClient, 'greet');
      alexaSkillsKitClient.greet();
    });

    it('should have been run once', () => {
      expect(alexaSkillsKitClient.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(alexaSkillsKitClient.greet).to.have.always.returned('hello');
    });
  });
});

import RandExp from 'randexp';
import { isPlainObject, isEmpty, mapValues } from 'lodash';

export const REQUEST_TYPES = {
  LAUNCH: 'LaunchRequest',
  INTENT: 'IntentRequest',
  SESSION_ENDED: 'SessionEndedRequest',
};

export const SESSION_ENDED_REASONS = {
  USER_INITIATED: 'USER_INITIATED',
  ERROR: 'ERROR',
  EXCEEDED_MAX_REPROMPTS: 'EXCEEDED_MAX_REPROMPTS',
};

export const uuid = () =>
  new RandExp(/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/).gen();

export const randomApplicationId = () => `amzn1.ask.skill.${uuid()}`;
export const randomSessionId = () => `amzn1.echo-api.session.${uuid()}`;
export const randomRequestId = () => `amzn1.echo-api.request.${uuid()}`;
export const randomUserId = () =>
  // all users seem to have 207 character ALPHANUMERIC IDs
  `amzn1.ask.account.${new RandExp(/[0-9A-Z]{207}/).gen()}`;

// Amazon uses ISO8601 strings without millis
const dateISOWithoutMillis = (date = new Date()) =>
  date.toISOString().split('.')[0].concat('Z');

const baseRequest = ({
  type,
  newSession = true,
  sessionId = randomSessionId(),
  applicationId = randomApplicationId(),
  userId = randomUserId(),
  attributes = {},
  requestOptions,
} = {}) => {
  // common default request object
  const request = {
    version: '1.0',
    session: {
      new: newSession,
      sessionId,
      application: {
        applicationId,
      },
      user: {
        userId,
      },
    },
    request: {
      type,
      requestId: randomRequestId(),
      timestamp: dateISOWithoutMillis(),
      locale: 'en-US',
      ...requestOptions,
    },
  };

  // add session attributes if valid
  if (isPlainObject(attributes) && !isEmpty(attributes)) {
    request.session.attributes = attributes;
  }

  return request;
};

export const launch = opts =>
  baseRequest({
    type: REQUEST_TYPES.LAUNCH,
    ...opts,
    newSession: true, // all LaunchRequest sessions are always new
    attributes: {}, // and they have no attributes
  });

// converts javascript object to Alexa slots definition
const transformSlots = slots =>
  mapValues(slots, (value, name) => ({ name, value: JSON.stringify(value) }));

export const intent = ({ name, slots, ...opts } = {}) => {
  const slotsObject = {};
  if (isPlainObject(slots) && !isEmpty(slots)) {
    slotsObject.slots = transformSlots(slots);
  }
  return baseRequest({
    type: REQUEST_TYPES.INTENT,
    requestOptions: {
      intent: {
        name,
        ...slotsObject,
      },
    },
    ...opts,
  });
};

export const end = ({ reason = SESSION_ENDED_REASONS.ERROR, ...opts } = {}) =>
  baseRequest({
    type: REQUEST_TYPES.SESSION_ENDED,
    requestOptions: {
      reason,
    },
    ...opts,
    newSession: false, // SessionEndedRequest's sessions are never new
  });

// use ES6 class syntax instead of factory functions to match aws-sdk
export default class AlexaSkillClient {
  constructor(options) {
    const defaults = {
      userId: randomUserId(),
      sessionId: randomSessionId(),
    };
    Object.assign(this, defaults, options);
  }

  resetSession = (sessionId = randomSessionId()) => {
    this.sessionId = sessionId;
  };

  // convenience relinking of named exports to the default export
  static launch = launch;
  static intent = intent;
  static end = end;

  // instance methods simply pass on this
  launch = options => launch(Object.assign({}, this, options));
  intent = options => intent(Object.assign({}, this, options));
  end = options => end(Object.assign({}, this, options));
}

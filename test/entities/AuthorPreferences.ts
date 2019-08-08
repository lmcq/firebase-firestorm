import { field, timestamp, ITimestamp } from '../../src';

export default class AuthorPreferences {
  @field({
    name: 'receive_push_notifications',
  })
  receivePushNotifications!: boolean;

  @timestamp({
    name: 'last_sign_in',
  })
  lastSignIn!: ITimestamp;
}
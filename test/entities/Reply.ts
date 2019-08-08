import { Entity, field } from '../../src';

export default class Reply extends Entity {
  @field({ name: 'content' })
  content!: string;

  @field({ name: 'by' })
  by!: string;
}
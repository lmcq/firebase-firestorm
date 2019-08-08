import Reply from "./Reply";
import { ICollection, Entity, field, subCollection } from '../../src';

export default class Comment extends Entity {
  @field({ name: 'content' })
  content!: string;

  @field({ name: 'by' })
  by!: string;

  @subCollection({
    name: 'replies',
    entity: Reply,
  })
  replies!: ICollection<Reply>;
}
import Author from './Author';
import Comment from './Comment';
import { field, rootCollection, documentRef, Entity, subCollection, IDocumentRef, ICollection, timestamp } from '../../src';
import { ITimestamp } from '../../src/types';

@rootCollection({
  name: 'posts',
})
export default class Post extends Entity {
  @field({ name: 'title' })
  title!: string;

  @field({ name: 'body' })
  body!: string;
  
  @documentRef({
    name: 'author',
    entity: Author,
  })
  author!: IDocumentRef<Author>;

  @subCollection({
    name: 'comments',
    entity: Comment,
  })
  comments!: ICollection<Comment>;

  @timestamp({
    name: 'posted',
    updateOnCreate: true,
  })
  posted!: ITimestamp;

}
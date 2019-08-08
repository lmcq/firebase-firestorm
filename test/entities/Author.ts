import { field, rootCollection, documentRef, Entity, IDocumentRef, geoPoint, map }from '../../src';
import Comment from './Comment';
import { IGeoPoint } from '../../src/types';
import AuthorPreferences from './AuthorPreferences';

@rootCollection({
  name: 'authors',
})
export default class Author extends Entity {
  @field({ name: 'name' })
  name!: string;

  @map({ name: 'metadata' })
  metadata!: AuthorPreferences;

  @documentRef({
    name: 'favorited_comments',
    entity: Comment,
  })
  favoritedComments!: IDocumentRef<Comment>[];

  @geoPoint({
    name: 'location'
  })
  location!: IGeoPoint;

  @geoPoint({
    name: 'previous_locations',
  })
  previousLocations!: IGeoPoint[];
}
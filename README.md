# Firebase Firestorm for Typescript

[![Build Status](https://travis-ci.org/lmcq/firebase-firestorm.svg?branch=master)](https://travis-ci.org/lmcq/firebase-firestorm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0055aad0e1244ebea87b08af2eed7906)](https://www.codacy.com/app/lmcq/firebase-firestorm?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=lmcq/firebase-firestorm&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/0055aad0e1244ebea87b08af2eed7906)](https://www.codacy.com/app/lmcq/firebase-firestorm?utm_source=github.com&utm_medium=referral&utm_content=lmcq/firebase-firestorm&utm_campaign=Badge_Coverage)

Firestorm is an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)
for [firestore](https://firebase.google.com/docs/firestore) which can be used
with Typescript.

## Contents

-   [Requirements](#requirements)

-   [Installation](#installation)

-   [Usage](#usage)

    -   [Getting Started](#getting-started)
    -   [Custom Data Types](#custom-data-types)
    -   [Initialization Options](#initialization-options)

-   [Important Gotcha's](#important-gotchas)

-   [Limitations](#limitations)

-   [Development](#development)

    -   [Setup](#setup)
    -   [Testing](#testing)

-   [Contributing](#contributing)

-   [License](#license)

## Requirements

Firestorm relies on using Typescript's 
[experimental decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
for defining your models. Please ensure you have the following in your `tsconfig.json`
(ES5 is minimum target):

````json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
  }
}
````

## Installation

```bash
$ npm install firebase-firestorm
```

## Usage

### Getting Started

In this section, we will walk you through an example of how a basic blogging
database might look using posts, comments and authors.

#### 1. Initialize firestorm

Call `firestorm.initialize(firestore, options?)` as soon as you initialize
your firestore app. See [intialization options](###-initialization-options)
for more information about intiailizing firestorm.

````typescript
import * as firestorm from 'firebase-firestorm';
...
const firestore = firebase.initializeApp(...);
firestorm.initialize(firestore, /* options */);
...
````

#### 2. Defining root collections

Here we have a class representing a `posts` collection. Entity classes are
typically non-pluralized as they represent a single document from that
collection. To define a root collection you must:

-   Extend from the `Entity` class.
-   Annotate your class with `@rootCollection(opts: ICollectionConfig)`.
-   Declare a series of fields, annotated with `@field(opts: IFieldConfig)`.

```typescript
import { Entity, rootCollection, field } from 'firebase-firestorm';

@rootCollection({
  name: 'posts',
})
export default class Post extends Entity {
  @field({ name: 'title' })
  title!: string;

  @field({ name: 'content' })
  content!: string;
}
```

#### 3. Defining subcollections

> Each of your models, whether they represent a root collection or
> subcollection must extend from the `Entity` class provided.

Now we want documents in the `posts` collection to have a subcollection 
of `comments`. First, we need to create a class for the comments. Notice
how we do not annotate the class with `@rootCollection`.

```typescript
import { Entity, rootCollection, field } from 'firebase-firestorm';

export default class Comment extends Entity {
  @field({ name: 'content' })
  content!: string;

  @field({ name: 'by' })
  by!: string;
}
```

Back in the `Post` class, we can add `Comment` as a subcollection using the `@subCollection(opts: ISubcollectionConfig)` decorator.

```typescript
import { Entity, ICollection, rootCollection, field } from 'firebase-firestorm';
import Comment from './Comment';

@rootCollection({
  name: 'posts',
})
export default class Post extends Entity {
  ...
  @subCollection({
    name: 'comments',
    entity: Comment, // we must define the entity class due to limitations in Typescript's reflection capabilities. Progress should be made on this issue in future releases.
  })
  comments!: ICollection<Comment>;
  ...
}
```

#### 4. Defining document references

Finally we want documents in the `posts` collection to reference an author in
an `authors` collection (another root collection). First, we define the `Author` entity:

```typescript
import { Entity, rootCollection, field } from 'firebase-firestorm';

@rootCollection({
  name: 'authors',
})
export default class Author extends Entity {
  @field({ name: 'name' })
  name!: string;
}
```

Then we can add an `Author` reference to the `Post` entity using the `@documentRef(opts: IDocumentRefConfig)` decorator:

```typescript
import { Entity, ICollection, IDocumentRef, rootCollection, field } from 'firebase-firestorm';
import Author from './Author';

@rootCollection({
  name: 'posts',
})
export default class Post extends Entity {
  ...
  @documentRef({
    name: 'author',
    entity: Author, // we must define the entity class due to limitations in Typescript's reflection capabilities. Progress should be made on this issue in future releases.
  })
  author!: IDocumentRef<Author>;
  ...
}
```

#### 5. Querying/updating data

Now we've built our model, we're ready to start querying. Calling
`Collection(entity : IEntity)` will return a list of methods use can
use to manipulate the data.

##### Getting a document

```typescript
...
const post = Collection(Post).get('post-1').then((post : Post) => {
  console.log(post);
});
...
```

##### Getting a subcollection

In our example `Comment` is a subcollection of `Post`. You can get
subcollections from a retrieved document, or a document reference.

````typescript
// Comment subcollection from document.
const post = Collection(Post).get('post-1').then((post : Post) => {
  const commentCollection = post.collection(Post);
});

// Comment subcollection from document ref.
const postRef = Collection(Post).doc('post-1');
const commentCollection = postRef.collection(Post);
````

##### Querying data

You can use the `find(query : ICollectionQuery)` method to query data.
A full list of options are available in the
[docs](https://lmcq.github.io/firebase-firestorm/), but they are essentially
the same as what is available with firestore.

```typescript
  const posts = Collection(Post).find({
    where: [
      ['title', '==', 'Example Title'],
      ...
    ],
  });
```

##### Creating documents

```typescript
...
  const post = new Post();
  post.id = 'post-1'; // id is optional, if it is not defined it will be generated by firestore.
  post.title = 'Untitled';
  let savedPost : Post;
  Collection(Post).create(post).then((_savedPost : Post) => {
    savedPost = _savedPost;
  });
...
```

##### Updating documents

```typescript
...
  const post = new Post();
  post.id = 'post-1'; // id is required.
  post.title = 'Untitled';
  let savedPost : Post;
  Collection(Post).update(post).then((_savedPost : Post) => {
    savedPost = _savedPost;
  });
...
```

##### Removing documents

```typescript
...
  Collection(Post).remove('post-id').then(...);
...
```

#### 6. Formatting data

An instance of entity maybe contain properties such as
subcollections which you do not wish to include if, for example,
you are building a REST API. Calling the `toData()` method on
an instance of an entity will produce a plain JSON object
containing just primitive data, nested JSON objects, and
document reference which have already been retrieved using
the `.get()` method. For example:

```typescript
import { Collection } from 'firebase-firestorm';
import Author from './Author';
import Post from './Post';

Collection(Post).get('post-1').then((post: Post) => {
  console.log(post.toData());
  /*
  Output:
  {
    id: ...,
    title: ...,
    content: ...
  }
  */
 post.author.get().then((author: Author) => {
   console.log(post.toData());
   /*
    Output:
    {
      id: ...,
      title: ...,
      content: ...,
      author: {
        id: ...,
        name: ...
      }
    }
   */
 });
});
```

### Custom Data Types

#### Arrays

Firestore documents can contain arrays of strings, numbers, objects,
etc. Defining arrays in Firestorm is as simple as assigning properties
as array types in your `Entity` files. For example:

```typescript
class Example extends Entity {
  @field({ name: 'example_property_1' })
  property1!: string[];

  @field({ name: 'example_property_2' })
  property2!: IDocumentRef<AnotherEntity>[];
}
```

#### Nested Data

Firestore documents can contains nested objects (or maps). For a nested
object, you need to create a new class to represent that object, and add
a property with that class in your `Entity`, wrapped with the `@map` decorator.

```typescript
class Example extends Entity {
  @map({ name: 'nested_object' })
  nestedObject!: Nested;
}

class Nested {
  @field({ name: 'nested_property' })
  nestedProperty!: string;
}
```

And then to use this entity:

```typescript
...
const nested = new Nested();
nested.nestedProperty = 'test';
const example = new Example();
example.nestedObject = nested;
...
```

#### Geopoints

Geopoints store locational data and can be used as fields. We have a wrapper
class for firestore's GeoPoint which basically serves the same functionality.

```typescript
class Example extends Entity {
  @geopoint({
    name: 'geopoint_property',
  })
  geopoint!: IGeoPoint;
} 
```

And then to assign a GeoPoint:

```typescript
...
  const example = new Example();
  example.geopoint = new Geopoint(latitude, longitude);
...
```

#### Timestamps

You can represent date & time data in your `Entity` files. Like geopoints,
our timestamp representation is essentially a wrapper of firestore's. You
can set the options for the field to `updateOnWrite` which uses the server
timestamp when creating or updating documents, or `updateOnCreate` or `updateOnUpdate`.

```typescript
class Example extends Entity {
  @timestamp({
    name: 'timestamp_property',
    updateOnWrite: true,
  })
  timestamp!: ITimestamp;
}
```

### Initialization Options

`firestorm.intialize({ ...opts : IFireormConfig })` can be called
with the following options:

| Option            | Description                                                                                                                                                                                                               | Type                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `fieldConversion` | Providing this option will convert `Entity` propertity names into firestore collection names so you don't need to provide the `name` option in `@field()` decorators. To view available values please check out the docs. | `enum FieldConversionType` |

## Important Gotcha's

-   All files for root collections, subcollections and nested maps
must have a unique class name due to the way the metadata storage
hooks everything up. We're currently looking for a way to resolve
this issue.

-   Make sure fields such as geopoints, timestamps and document
reference's have the `I` infront of the type, e.g. `IDocumentRef`,
`ITimestamp`, `IGeoPoint`.

## Limitations

-   Listening to document updates using snapshots is currently unsupported.
-   Transactions and batched writes are currently unsupported.
-   Offline persitences is unsupported.

If you would like to help resolve these issues, feel free
to make a a [pull request](#pull-requests).

## Development

### Setup

1.  Clone the repo.
2.  Install dependencies.

```bash
cd firebase-firestorm 
npm install
```

### Testing

The testing script looks for `*.spec.ts` files in the `src`
and `test` directory.

```bash
npm test
```

## Contributing

### Found a bug?

Please report any bugs you have found submitting an issue to our Github
repository, after ensuring the issue doesn't already exist. Alternatively,
you can make a pull request with a fix.

### Pull Requests

If you would like to help add or a feature or fix a bug, you can do so
by making a pull request. The project uses
[Conventional Commits](https://www.conventionalcommits.org), so please
make sure you follow the spec when making PRs. You must also
include relevant tests.

## License

[MIT](license.md)

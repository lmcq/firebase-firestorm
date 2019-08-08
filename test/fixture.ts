export default {
  __collection__: {
    posts: {
      __doc__: {
        'hello-world': {
          title: 'Hello World!',
          body: 'This is an example post.',
          author: '__ref__:authors/john-doe',
          __collection__: {
            comments: {
              __doc__: {
                'comment-1': {
                  content: 'Wow, thanks!',
                  by: 'Michael',
                  __collection__: {
                    replies: {
                      __doc__: {
                        'reply-1': {
                          content: 'Great feedback.',
                          by: 'Kate'
                        }
                      }
                    }
                  }
                },
              }
            }
          }
        },
        'hello-world-1': {
          title: 'Hello World 1!',
          body: 'This is another example post.',
          author: '__ref__:authors/john-doe'
        },
      },
    },
    authors: {
      __doc__: {
        'john-doe': {
          name: 'John Doe',
          favorited_comments: [
            '__ref__:posts/hello-world/comments/comment-1',
          ]
        }
      }
    }
  },
};

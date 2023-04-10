const request = require("supertest");
const db = require("./../db/connection");
const app = require("./../app");
const data = require("./../db/data/test-data");
const seed = require("./../db/seeds/seed");
const e = require("express");
require("jest-sorted");

beforeEach(() => {
  return seed(data);
});

afterAll(() => db.end());

function isSortedAscending(arr, key) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1][key] < arr[i][key]) {
      return false;
    }
  }
  return true;
}

function isSortedDescending(arr, key) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1][key] > arr[i][key]) {
      return false;
    }
  }
  return true;
}

// 3. GET /api/topics
describe("GET /api/topics", () => {
  it("responds with an array of topic objects, each of which should have the following properties: 'slug' and 'description'", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(Array.isArray(topics)).toBe(true);
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

// 4. GET /api/articles
describe("GET /api/articles", () => {
  it("responds with an articles array of article objects, each having the correct properties, sorted in descending order", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles)).toBe(true);
      });
  });
});

// 5. GET /api/articles/:article_id
describe("GET /api/articles/:article_id", () => {
  it("respond with an article object, with the correct properties", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      body: expect.any(String),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
    };

    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject(expectedObject);
      });
  });
  it("should respond with a 404 status code if a valid ID is given, but no article is found", () => {
    return request(app)
      .get("/api/articles/100000")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("No article found");
      });
  });
  it("should respond with a 400 status code if given an invalid ID such as a string", () => {
    return request(app)
      .get("/api/articles/invalidID")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
});

// 6. GET /api/articles/:article_id/comments
describe("/api/articles/:article_id/comments", () => {
  it("responds with an array of comments for the given article_id, with each comment object having the correct properties", () => {
    const expectedObject = {
      comment_id: expect.any(Number),
      votes: expect.any(Number),
      created_at: expect.any(String),
      author: expect.any(String),
      body: expect.any(String),
      article_id: expect.any(Number),
    };

    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments.length).toBe(11);
        comments.forEach((comment) =>
          expect(comment).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(comments)).toBe(true);
      });
  });
  it("should respond with a 404 status code if given a valid ID type but no review exists", () => {
    return request(app)
      .get("/api/articles/100000/comments")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toEqual("No review found");
      });
  });
  it("should respond with a 400 status code if given an invalid ID type such as a string", () => {
    return request(app)
      .get("/api/articles/invalidID/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
});

// 7. POST /api/articles/:article_id/comments
describe("POST /api/articles/:article_id/comments", () => {
  it("should respond with a 201 status and the created comment object", () => {
    const testComment = {
      username: "butter_bridge",
      body: "Test comment",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.author).toBe(testComment.username);
        expect(comment.body).toBe(testComment.body);
        expect(comment).toHaveProperty("comment_id", expect.any(Number));
        expect(comment).toHaveProperty("votes", expect.any(Number));
        expect(comment).toHaveProperty("created_at", expect.any(String));
      })
      .then(() => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(12);
          });
      });
  });
  it("should respond with the posted comment and status code 201, ignoring extra content", () => {
    const testComment = {
      username: "butter_bridge",
      body: "Test comment",
      extraContent: "Should not be included",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).not.toHaveProperty("extraContent");
      });
  });
  it("respond with a 400 status code if no author/username is given", () => {
    const testComment = {
      body: "Test comment",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Comment must have an author and body");
      });
  });
  it("respond with a 400 status code if no body is given", () => {
    const testComment = {
      username: "butter_bridge",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Comment must have an author and body");
      });
  });
  it("should respond with a 400 status code if username is incorrect", () => {
    const testComment = {
      username: "incorrect_username",
      body: "Test comment",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Username is incorrect");
      });
  });
  it("should respond with a 404 status if given a valid article ID but article does not exists", () => {
    const testComment = {
      username: "butter_bridge",
      body: "Test comment",
    };

    return request(app)
      .post("/api/articles/100000/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("No review found");
      });
  });
  it("should respond with a 400 status if given a invalid article ID", () => {
    const testComment = {
      username: "butter_bridge",
      body: "Test comment",
    };

    return request(app)
      .post("/api/articles/invalidID/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
});

// 8. PATCH /api/articles/:article_id
describe("PATCH /api/articles/:article_id", () => {
  it("should respond with the updated object, where votes has been correctly incremented", () => {
    const testArticle = {
      incVotes: 100,
    };

    return request(app)
      .patch("/api/articles/1")
      .send(testArticle)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(200);
      });
  });
  it("should respond with the updated object, where votes has been correctly decremented", () => {
    const testArticle = {
      incVotes: -100,
    };

    return request(app)
      .patch("/api/articles/1")
      .send(testArticle)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(0);
      });
  });
  it("should respond with a 400 status code if incVotes is not a number", () => {
    const testArticle = {
      incVotes: "not_a_number",
    };

    return request(app)
      .patch("/api/articles/1")
      .send(testArticle)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
  it("should respond with a 400 status code if patch object key is invalid", () => {
    const testArticle = {
      invalid_key: 100,
    };

    return request(app)
      .patch("/api/articles/1")
      .send(testArticle)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid or missing key in patch body");
      });
  });
  it("should respond with a 404 status if given a valid ID but article does not exist", () => {
    const testArticle = {
      incVotes: 100,
    };

    return request(app)
      .patch("/api/articles/10000")
      .send(testArticle)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("No article found");
      });
  });
  it("should respond with a 400 status if given a invalid ID", () => {
    const testArticle = {
      incVotes: 100,
    };

    return request(app)
      .patch("/api/articles/invalidId")
      .send(testArticle)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
});

// 9. GET /api/users
describe("GET /api/users", () => {
  it("should respond with an array of objects containing the correct properties", () => {
    const expectedObject = {
      username: expect.any(String),
      name: expect.any(String),
      avatar_url: expect.any(String),
    };

    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBe(4);
        users.forEach((user) => expect(user).toMatchObject(expectedObject));
      });
  });
});

// 10. GET /api/articles (queries)
describe("GET /api/articles/topic", () => {
  it("should respond with all articles if query is omitted", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles)).toBe(true);
      });
  });
  it("returns an empty array if category query is valid, but has no corresponding reviews", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(0);
        expect(articles).toEqual([]);
      });
  });
  it("should respond with an array containing only articles where topic is equal to query", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(11);
        articles.forEach((article) => {
          expect(article).toMatchObject(expectedObject);
        });
      });
  });
  it("should respond with an array of articles, and sort_by should sort by date by default", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?sort_by")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles, "created_at")).toBe(true);
      });
  });
  it("should respond with an array of articles, sorted in descending order, by given column", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles, "title")).toBe(true);
      });
  });
  it("should respond with array of artices with a given topic, sorted by given column in descending", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?topic=mitch&sort_by=body")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(11);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles)).toBe(true);
      });
  });
  it("should respond with an array of all articles, sorted in ascending order", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedAscending(articles)).toBe(true);
      });
  });
  it("should respond with an array of all articles, sorted in descending order", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(12);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles)).toBe(true);
      });
  });
  it("should respond with an array of articles with given topic, sorted in ascending order of given column", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?topic=mitch&sort_by=title&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(11);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedAscending(articles)).toBe(true);
      });
  });
  it("should respond with an array of articles with given topic, sorted in descending order of given column", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=desc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(11);
        articles.forEach((article) =>
          expect(article).toMatchObject(expectedObject)
        );
        expect(isSortedDescending(articles)).toBe(true);
      });
  });
  it("responds with a 400 status code if given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_query")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid sort query");
      });
  });
  it("should respond with a 400 status code when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?order=invalid")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid order query");
      });
  });
});

// 11. GET /api/articles/:article_id (comment count)
describe("GET /api/articles/:article_id (comment count)", () => {
  it("respond with an article object, with the correct properties", () => {
    const expectedObject = {
      author: expect.any(String),
      title: expect.any(String),
      article_id: expect.any(Number),
      body: expect.any(String),
      topic: expect.any(String),
      created_at: expect.any(String),
      votes: expect.any(Number),
      article_img_url: expect.any(String),
      comment_count: expect.any(Number),
    };

    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject(expectedObject);
      });
  });
  it("should respond with a 404 status code if a valid ID is given, but no article is found", () => {
    return request(app)
      .get("/api/articles/100000")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("No article found");
      });
  });
  it("should respond with a 400 status code if given an invalid ID such as a string", () => {
    return request(app)
      .get("/api/articles/invalidID")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
});

// 12. DELETE /api/comments/:comment_id
describe("DELETE /api/comments/:comment_id", () => {
  it("should delete the comment with the given ID", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles/9/comments")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(1);
          });
      });
  });
  it("should return a 400 status code if given an invalid ID", () => {
    return request(app)
      .delete("/api/comments/invalidId")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });
  it("should respond with a 404 status code if given a valid Id type but comment does not exist", () => {
    return request(app)
      .delete("/api/comments/10000")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Comment not found");
      });
  });
});

// 13. GET /api
describe("GET /api", () => {
  it("should respond with the correct JSON file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(typeof endpoints).toBe("object");
        Object.values(endpoints).forEach((endpoint) => {
          expect(endpoint).toHaveProperty("description", expect.any(String));
          expect(endpoint).toHaveProperty("queries"), expect.any(Object);
          expect(endpoint).toHaveProperty(
            "exampleResponse",
            expect.any(Object)
          );
        });
      });
  });
});

// 17. GET /api/users/:username
describe("GET /api/users/:username", () => {
  it("should respond with a user object with the correct properties", () => {
    const expectedObject = {
      username: expect.any(String),
      name: expect.any(String),
      avatar_url: expect.any(String),
    };

    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toEqual(expectedObject);
      });
  });

  it("should respond with 404 status code and correct error message if no user is found", () => {
    return request(app)
      .get("/api/users/testUser")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("No user found");
      });
  });
});

// 18. PATCH /api/comments/:comment_id
describe("PATCH /api/comments/:comment_id", () => {
  it("should respond with an object with the correct properties and the votes incremented", () => {
    const expectedObject = {
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      votes: 15,
      author: "butter_bridge",
      article_id: 1,
      comment_id: 2,
      created_at: expect.any(String),
    };

    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual(expectedObject);
      });
  });

  it("should respond with an object with the correct properties and the votes decremented", () => {
    const expectedObject = {
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
      votes: 13,
      author: "butter_bridge",
      article_id: 1,
      comment_id: 2,
      created_at: expect.any(String),
    };

    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual(expectedObject);
      });
  });

  it("should respond with a 400 status and error message if newVote is not a number", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ inc_votes: "string" })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });

  it("responds with a 400 status code when passed an invalid request body", () => {
    return request(app)
      .patch("/api/comments/1")
      .send({ wrong_key: 100 })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid or missing key in patch body");
      });
  });

  it("responds with a 400 status code and an error message when passed an invalid review id", () => {
    return request(app)
      .patch("/api/comments/banana")
      .send({ incVotes: 1 })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid input");
      });
  });

  it("should respond with a 404 status code if given the ID of a non-existent review", () => {
    return request(app)
      .patch("/api/comments/1000")
      .send({ incVotes: 1 })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Comment not found");
      });
  });
});

describe("400 error on /api/not-path", () => {
  it("status 400 returns error message bad path when provided an invalid path", () => {
    return request(app)
      .get("/api/not-path")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Path not found!");
      });
  });
});

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
        expect(articles).toBeSorted({ descending: true });
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
        expect(comments).toBeSorted({ descending: true });
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

describe("400 error on /api/not-path", () => {
  it("status 400 returns error message bad path when provided an invalid path", () => {
    return request(app)
      .get("/api/not-path")
      .expect(400)
      .then(({ body }) => {
        const { message } = body;
        expect(message).toBe("Path not found!");
      });
  });
});

from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
app = Flask(__name__)
SWAGGER_URL="/api/docs"  # (1) swagger endpoint e.g. HTTP://localhost:5002/api/docs
URL = "/static/masterblog.json"# (2) ensure you create this dir and file
swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    URL,
    config={
        "app_name": "MasterblogAPI" # (3) You can change this if you like
    })
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)


#build api documentation with swagger

# Configure the application
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret'
jwt = JWTManager(app)

# Add CORS to allow cross-origin requests
CORS(app)

# Dummy in-memory database
POSTS = [
    {"id": 1, "title": "First Post", "content": "This is the first post", "category": "General"},
    {"id": 2, "title": "Second Post", "content": "This is the second post", "category": "Updates"},
]
USER = {"username": "admin", "password": "password"}  # Example user credentials


# Route to get posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    return jsonify(POSTS), 200


# Route to add a new post (requires authentication)
@app.route('/api/posts', methods=['POST'])
@jwt_required()
def add_post():
    post_data = request.get_json()
    new_post = {
        "id": len(POSTS) + 1,
        "title": post_data.get("title"),
        "content": post_data.get("content"),
        "category": post_data.get("category"),
    }
    POSTS.append(new_post)
    return jsonify(new_post), 201


# Route to delete a post by ID (requires authentication)
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    global POSTS
    POSTS = [post for post in POSTS if post["id"] != post_id]
    return jsonify({"msg": "Post deleted successfully"}), 200


# Route to update a post (requires authentication)
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    post_data = request.get_json()
    for post in POSTS:
        if post["id"] == post_id:
            post["title"] = post_data.get("title", post["title"])
            post["content"] = post_data.get("content", post["content"])
            post["category"] = post_data.get("category", post["category"])
            return jsonify(post), 200
    return jsonify({"error": "Post not found"}), 404


# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == USER["username"] and password == USER["password"]:
        token = create_access_token(identity=username)  # Generate JWT token
        return jsonify({"token": token}), 200
    return jsonify({"msg": "Invalid username or password"}), 401


# Protected route to validate the token
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200


# Logout route (optional - here for demo purposes, but JWT tokens are stateless)
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"msg": "Successfully logged out"}), 200


if __name__ == '__main__':
    app.run(port=3002)

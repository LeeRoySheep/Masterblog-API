from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

#create the app with FLask
app = Flask(__name__)
#Adding Swagger API documentation to the app
SWAGGER_URL="/api/docs"  # (1) swagger endpoint e.g. HTTP://localhost:5002/api/docs
API_URL = "/static/masterblog.json"# (2) ensure you create this dir and file
swagger_ui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        "app_name": "MasterblogAPI" # (3) You can change this if you like
    })
app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

limiter = Limiter(app=app, key_func=get_remote_address)

# Configure jwt keys for user logging and adding app to jwt
app.config['SECRET_KEY'] = 'myKey'
app.config['JWT_SECRET_KEY'] = 'myjwtKeyttt'
jwt = JWTManager(app)

# Add CORS to allow cross-origin requests for independent host server requests
CORS(app)

# Dummys as memory database
POSTS = [
    {"id": 1, "title": "First Post", "content": "This is the first post", "category": "General"},
    {"id": 2, "title": "Second Post", "content": "This is the second post", "category": "Updates"},
]
USER = {"admin": {"password": "admin", "real-name": "Adam Administrator", "role": "admin", "email": "adam.admin@masterblog.com"},
        "user": {"password": "user", "real-name": "Max User", "role": "user", "email": "max.user@masterblog.com"}
        } # Example user credentials


# Route to get posts
@app.route('/api/posts', methods=['GET'])
@limiter.limit("10/minute")
def get_posts():
    sort_by = request.args.get('sort', "").lower()
    sort_dir = request.args.get('direction', "").lower()
    if sort_by and sort_dir:
        if sort_dir not in ["asc", "desc"]:
            return jsonify({"error": f"Invalid sort direction: {sort_dir}"}), 400
        if sort_by not in ["title", "content", "category"]:
            return jsonify("error","Wrong argument for sort!"), 400
        if sort_by == "title":
            POSTS.sort(key=lambda x: x["title"], reverse=(sort_dir == "desc"))
        elif sort_by == "category":
            POSTS.sort(key=lambda x: x["title"], reverse=(sort_dir == "desc"))
        elif sort_by == "content":
            POSTS.sort(key=lambda x: x["title"], reverse=(sort_dir == "desc"))
    return jsonify(POSTS), 200


# Route to add a new post (requires authentication)
@app.route('/api/posts', methods=['POST'])
@jwt_required()
def add_post():
    post_data = request.get_json()
    if len(POSTS) > 0:
        new_id = POSTS[len(POSTS) - 1]["id"] + 1
    else:
        new_id = 1
    new_post = {
        "id": new_id,
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
    for post in POSTS:
        if post["id"] == post_id:
            POSTS.remove(post)
            return jsonify({"msg": "Post deleted successfully!"}), 200
    return jsonify({"msg": "Post not found!"}), 401


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


# Route to search for blog entries
@app.route( '/api/posts/search', methods=['GET'])
def search_posts():
    search_title = request.args.get('title',"").lower()
    search_category = request.args.get('category',"").lower()
    search_content = request.args.get('content',"").lower()
    found_posts = []
    for post in POSTS:
        if search_title in post["title"].lower() and search_title:
            found_posts.append(post)
            continue
        if search_category in post["category"].lower() and search_category:
            found_posts.append(post)
            continue
        if search_content in post["content"].lower() and search_content:
            found_posts.append(post)
    if not found_posts:
        return jsonify({"error": "No posts found"}), 400
    return jsonify(found_posts), 200


# Login route
@app.route('/api/login', methods=['POST'])
@limiter.limit("3/minute")
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username in USER.keys() and password == USER[username]["password"]:
        token = create_access_token(identity=username)  # Generate JWT token
        return jsonify({"token": token}), 200
    return jsonify({"msg": "Invalid username or password"}), 401


# Protected route to validate the token
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    user = get_jwt_identity()
    return jsonify({"logged_in_as": user}), 200


# Logout route not necessery as handelt in javascrirpt but good for understanding
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"msg": "Successfully logged out"}), 200


if __name__ == '__main__':
    app.run(port=3002)

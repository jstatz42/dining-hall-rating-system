from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from sqlalchemy import func, Index


app = Flask(__name__)
CORS(app, origins="http://localhost:5173", supports_credentials=True)

# SQLAlchemy config
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqldb://@localhost/DiningHalls"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "isolation_level": "READ COMMITTED"
}
db = SQLAlchemy(app)

# ==========================
# MODELS
# ==========================
class User(db.Model):
    uid = db.Column(db.Integer, primary_key=True, autoincrement=True, index=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class DiningHall(db.Model):
    did = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True)

class Food(db.Model):
    fid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True)

class Serving(db.Model):
    did = db.Column(db.Integer, db.ForeignKey("dining_hall.did", ondelete="CASCADE"), primary_key=True, index=True)
    fid = db.Column(db.Integer, db.ForeignKey("food.fid", ondelete="CASCADE"), primary_key=True, index=True)

class UserFoodRating(db.Model):
    uid = db.Column(db.Integer, db.ForeignKey("user.uid", ondelete="CASCADE"), primary_key=True, index=True)
    fid = db.Column(db.Integer, db.ForeignKey("food.fid", ondelete="CASCADE"), primary_key=True)
    rating = db.Column(db.Integer)


    __table_args__ = (
        Index("uid_fid_idx", fid, uid),
    )

class UserDiningHallRating(db.Model):
    uid = db.Column(db.Integer, db.ForeignKey("user.uid", ondelete="CASCADE"), primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey("dining_hall.did", ondelete="CASCADE"), primary_key=True, index=True)
    rating = db.Column(db.Integer)



# ==========================
# CREATE TABLES
# ==========================
with app.app_context():
    db.create_all()

# ==========================
# SIGNUP ROUTE
# ==========================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Look up the user in the database
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    # Check password hash
    if not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    # If login succeeds
    return jsonify({"message": "Login successful", "uid": user.uid}), 200


@app.route("/change-username", methods=["PUT"])
def change_username():
    data = request.get_json(force=True)
    uid = data.get("uid")
    new_username = data.get("new_username")

    if not uid or not new_username:
        return jsonify({"error": "User ID and new username required"}), 400

    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if the username is already taken
    if User.query.filter_by(username=new_username).first():
        return jsonify({"error": "Username already exists"}), 400

    user.username = new_username
    db.session.commit()

    return jsonify({"message": "Username updated successfully"}), 200

@app.route("/delete-user", methods=["DELETE"])
def delete_user():
    data = request.get_json(force=True)
    uid = data.get("uid")

    if not uid:
        return jsonify({"error": "User ID required"}), 400

    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

@app.route("/foods", methods=["GET"])
def get_foods():
    foods = (
        db.session.query(
            Food.fid,
            Food.name,
            func.avg(UserFoodRating.rating).label("avg_rating")
        )
        .outerjoin(UserFoodRating, Food.fid == UserFoodRating.fid)
        .group_by(Food.fid)
        .all()
    )

    result = [
        {"fid": f.fid, "name": f.name, "avg_rating": round(f.avg_rating, 2) if f.avg_rating else None}
        for f in foods
    ]
    return jsonify(result)


@app.route("/dining-halls", methods=["GET"])
def get_dining_halls():
    halls = (
        db.session.query(
            DiningHall.did,
            DiningHall.name,
            func.avg(UserDiningHallRating.rating).label("avg_rating")
        )
        .outerjoin(UserDiningHallRating, DiningHall.did == UserDiningHallRating.did)
        .group_by(DiningHall.did)
        .all()
    )

    result = [
        {"did": h.did, "name": h.name, "avg_rating": round(h.avg_rating, 2) if h.avg_rating else None}
        for h in halls
    ]
    return jsonify(result)


@app.route("/dining-halls/<int:did>/foods", methods=["GET"])
def get_foods_by_dining_hall(did):
    foods = (
        db.session.query(
            Food.fid,
            Food.name,
            func.avg(UserFoodRating.rating).label("avg_rating")
        )
        .join(Serving, Food.fid == Serving.fid)
        .outerjoin(UserFoodRating, Food.fid == UserFoodRating.fid)
        .filter(Serving.did == did)
        .group_by(Food.fid)
        .all()
    )

    result = [
        {"fid": f.fid , "name": f.name, "avg_rating": round(f.avg_rating, 2) if f.avg_rating else None}
        for f in foods
    ]
    return jsonify(result)

@app.route("/rate-food", methods=["POST"])
def rate_food():
    data = request.get_json(force=True)
    uid = data.get("uid")
    fid = data.get("fid")
    rating = data.get("rating")

    if not all([uid, fid, rating]):
        return jsonify({"error": "uid, fid, and rating required"}), 400

    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    user_rating = UserFoodRating.query.filter_by(uid=uid, fid=fid).first()
    if user_rating:
        user_rating.rating = rating
    else:
        user_rating = UserFoodRating(uid=uid, fid=fid, rating=rating)
        db.session.add(user_rating)

    db.session.commit()
    return jsonify({"message": "Rating saved successfully"}), 200

@app.route("/foods/filter", methods=["GET"])
def filter_foods():
    min_rating = float(request.args.get("min_rating", 0))
    foods = (
        db.session.query(
            Food.fid,
            Food.name,
            func.avg(UserFoodRating.rating).label("avg_rating")
        )
        .outerjoin(UserFoodRating, Food.fid == UserFoodRating.fid)
        .group_by(Food.fid)
        .having(func.avg(UserFoodRating.rating) >= min_rating)
        .all()
    )
    return jsonify([
        {"fid": f.fid, "name": f.name, "avg_rating": round(f.avg_rating, 2)}
        for f in foods
    ])


# ==========================
# RUN SERVER
# ==========================
if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True, use_reloader=False)


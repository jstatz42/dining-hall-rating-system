import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	// Home page at "/"
	// index("routes/home.tsx"),

	// Sign-up page at "/signup"
	route("signup", "routes/signup.tsx"),

	// login page at "/login"
	route("login", "routes/login.tsx"),

	// login page at "/change-username"
	route("change-username", "routes/change-username.tsx"),

	route("delete-user", "routes/delete-user.tsx"),
	index("routes/diningHalls.tsx"),
	route("foods/:did", "routes/foods.$did.tsx"),

] satisfies RouteConfig;


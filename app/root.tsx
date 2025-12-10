import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteError,
	Link,
} from "react-router-dom";

import "./app.css";
import { UserProvider, useUser } from "./context/userContext";


import DeleteUserButton from "./routes/delete-user";

function Header() {
	const { isLoggedIn, logout } = useUser();

	return (
		<header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
			{!isLoggedIn ? (
				<>
					<Link to="/signup">
						<button>Sign Up</button>
					</Link>
					<Link to="/login" style={{ marginLeft: "1rem" }}>
						<button>Log In</button>
					</Link>
					<Link to="/" style={{ marginLeft: "1rem" }}>
						<button>Home</button>
					</Link>
				</>
			) : (
				<>
					<button onClick={logout}>Sign Out</button>
					<Link to="/change-username" style={{ marginLeft: "1rem" }}>
						<button>Change Username</button>
					</Link>
					<div style={{ marginLeft: "1rem" }}>
						<DeleteUserButton />
					</div>

					<Link to="/" style={{ marginLeft: "1rem" }}>
						<button>Home</button>
					</Link>
				</>
			)}
		</header>
	);
}


export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<UserProvider>
					<Header />
					<div id="content">{children}</div>

					<ScrollRestoration />
					<Scripts />
				</UserProvider>
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary() {
	const error = useRouteError();
	let message = "An unexpected error occurred.";

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			message = "Page not found.";
		} else {
			message = error.statusText;
		}
	} else if (error instanceof Error) {
		message = error.message;
	}

	return (
		<main style={{ padding: "2rem" }}>
			<h1>Error</h1>
			<p>{message}</p>
		</main>
	);
}




import { useUser } from "../context/userContext"

export default function Login() {


	const { setLogin } = useUser();

	async function handleLogin(event: React.FormEvent) {
		event.preventDefault();
		const username = (event.target as any).username.value;
		const password = (event.target as any).password.value;

		try {
			const res = await fetch("http://localhost:5000/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
				credentials: "include"
			});

			const data = await res.json();
			if (!res.ok) {
				console.error(data.error);
				alert(data.error);
				return;
			}

			setLogin(data.uid, username);
			console.log("Logged in!", data);
			alert("Login successful!");
			// You can now set your frontend state as "logged in"
		} catch (err) {
			console.error("Fetch failed:", err);
		}
	}

	return (
		<main style={{ padding: "2rem" }}>
			<h1>Log In</h1>
			<form method="dialog" onSubmit={handleLogin}>
				<div>
					<label>
						Username:{" "}
						<input type="text" name="username" required />
					</label>
				</div>
				<div>
					<label>
						Password:{" "}
						<input type="password" name="password" required />
					</label>
				</div>
				<button type="submit">Log In</button>
			</form>
		</main>
	);
}


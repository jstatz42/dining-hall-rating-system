export default function SignUp() {


	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const username = (event.target as any).username.value;
		const password = (event.target as any).password.value;

		try {
			const res = await fetch("http://localhost:5000/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
				credentials: "include" // optional, only if using cookies
			});

			const data = await res.json();
			console.log(data);
		} catch (err) {
			console.error("Fetch failed:", err);
		}
	}

	return (
		<main style={{ padding: "2rem" }}>
			<h1>Sign Up Page</h1>
			<form onSubmit={handleSubmit}>
				<label>
					Username: <input type="text" name="username" />
				</label>
				<br />
				<label>
					Password: <input type="password" name="password" />
				</label>
				<br />
				<button type="submit">Create Account</button>
			</form>
		</main>
	);
}


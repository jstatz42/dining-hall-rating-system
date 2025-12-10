import { useState } from "react";
import { useUser } from "../context/userContext";

export default function ChangeUsername() {
	const { userId } = useUser();
	const [newUsername, setNewUsername] = useState("");
	const [message, setMessage] = useState("");

	async function handleChangeUsername(event: React.FormEvent) {
		event.preventDefault();

		try {
			const res = await fetch("http://localhost:5000/change-username", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ uid: userId, new_username: newUsername }),
			});

			const data = await res.json();
			setMessage(data.message || data.error);
		} catch (err) {
			console.error(err);
			setMessage("Error updating username.");
		}
	}

	return (
		<main style={{ padding: "2rem" }}>
			<h1>Change Username</h1>
			<form onSubmit={handleChangeUsername}>
				<input
					type="text"
					placeholder="New username"
					value={newUsername}
					onChange={(e) => setNewUsername(e.target.value)}
					required
				/>
				<button type="submit">Change</button>
			</form>
			{message && <p>{message}</p>}
		</main>
	);
}


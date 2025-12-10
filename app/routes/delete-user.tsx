import { useUser } from "../context/userContext";

export default function DeleteUserButton() {
	const { userId, logout } = useUser();

	async function handleDelete() {
		if (!userId) {
			alert("You must be logged in to delete your account.");
			return;
		}

		if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
			return;
		}

		try {
			const res = await fetch("http://localhost:5000/delete-user", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ uid: userId }),
			});

			const data = await res.json();

			if (res.ok) {
				alert(data.message);
				logout(); // Clear local auth state
			} else {
				alert(data.error || "Error deleting user.");
			}
		} catch (err) {
			console.error(err);
			alert("Failed to connect to server.");
		}
	}

	return <button onClick={handleDelete}>Delete Account</button>;
}


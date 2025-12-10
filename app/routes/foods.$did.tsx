import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/userContext";


type Food = {
	fid?: number;
	name: string;
	avg_rating: number | null;
};

export default function FoodsByDiningHall() {
	const { user } = useUser();
	const { did } = useParams();
	const [minRating, setMinRating] = useState(0);
	const [foods, setFoods] = useState<Food[]>([]);

	useEffect(() => {
		fetch(`http://127.0.0.1:5000/dining-halls/${did}/foods`)
			.then((res) => res.json())
			.then(setFoods)
			.catch(console.error);
	}, [did]);

	const handleRate = async (fid: number, rating: number) => {
		if (!user) return alert("You must be logged in to rate.");
		if (!rating || rating < 1 || rating > 5) return;
		const res = await fetch("http://127.0.0.1:5000/rate-food", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ uid: user.uid, fid, rating }),
		});
		if (res.ok) alert("Rating submitted!");
	};



	return (
		<div className="p-6">
			<label>
				Minimum Rating: {minRating}
				<input
					type="range"
					min="0"
					max="5"
					step="0.5"
					value={minRating}
					onChange={(e) => setMinRating(Number(e.target.value))}
				/>
			</label>
			<h1 className="text-2xl font-bold mb-4">Foods in this Dining Hall</h1>
			{foods.filter((food) => (food.avg_rating ?? 0) >= minRating).map((food: any) => (
				<div
					key={food.fid}
					className="border p-4 rounded-lg mb-3 flex justify-between items-center"
				>
					<div>
						<h2 className="text-lg font-semibold">{food.name}</h2>
						<p>Average Rating: {food.avg_rating ?? "No ratings yet"}</p>
					</div>

					{user && (
						<form onSubmit={(e) => {
							e.preventDefault();
							const rating = Number(e.currentTarget.rating.value);
							handleRate(food.fid, rating);
						}}>
							<select name="rating" required>
								<option value="">Rate</option>
								{[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
							</select>
							<button type="submit">Submit Rating</button>
						</form>

					)}
				</div>
			))}
		</div>
	);
}


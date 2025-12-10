import { useState, useEffect } from "react";
import { useUser } from "../context/userContext";
import { Link } from "react-router-dom";

export default function DiningHalls() {
	const { username } = useUser();
	const [diningHalls, setDiningHalls] = useState([]);
	const [minRating, setMinRating] = useState(0);

	useEffect(() => {
		fetch("http://127.0.0.1:5000/dining-halls")
			.then((res) => res.json())
			.then(setDiningHalls)
			.catch(console.error);
	}, []);

	const filtered = diningHalls.filter(
		(h: any) => !h.avg_rating || h.avg_rating >= minRating
	);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Dining Halls</h1>

			{/* <label className="block mb-2"> */}
			{/* 	Filter by minimum rating: {minRating} */}
			{/* </label> */}
			{/* <input */}
			{/* 	type="range" */}
			{/* 	min={0} */}
			{/* 	max={5} */}
			{/* 	step={0.5} */}
			{/* 	value={minRating} */}
			{/* 	onChange={(e) => setMinRating(parseFloat(e.target.value))} */}
			{/* /> */}
			{/**/}
			<div className="mt-4 grid gap-4">
				{filtered.map((hall: any) => (
					<div
						key={hall.did}
						className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
					>
						<h2 className="text-xl font-semibold">{hall.name}</h2>
						{/* <p>Average Rating: {hall.avg_rating ?? "No ratings yet"}</p> */}
						<Link
							to={`/foods/${hall.did}`}
							className="text-blue-500 underline mt-2 block"
						>
							View Foods
						</Link>
						{username && <p className="text-green-600 mt-2">You can rate foods!</p>}
					</div>
				))}
			</div>
		</div>
	);
}

